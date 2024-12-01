import React, {useRef, useEffect, useState} from 'react';
import {StyleSheet, View, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

// ROUTES

import ROUTES from '../../constants/routes';

import IMAGES from '../../constants/images';

import notifee, {AndroidImportance, EventType} from '@notifee/react-native';

// MAP
import MapView, {PROVIDER_GOOGLE, Marker, Polyline} from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
import Geolocation from '@react-native-community/geolocation';

// firebase
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import {getRoute} from '../../components/utils/RoutesUtils';
import HeaderComponent from './HeaderComponent';
import FooterComponent from './FooterComponent';

// utils

import {calculateDistance, calculateETAWithDirectionsAPI} from './MapUtils';
import CustomCallout from './CustomCallout';
import ProximityAlertModal from './ProximityAlertModal';

const Main = props => {
  const {navigation} = props;
  const mapRef = useRef(MapView);

  // user current location
  const [initialRegion, setInitialRegion] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  const [routes, setRoutes] = useState([]);
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  // eta
  const [eta, setEta] = useState(null);

  // marker
  const [marker, setMarker] = useState(null);

  // bus location
  const [busMarkers, setBusMarkers] = useState([]);
  const [markerProximityRadius, setMarkerProximityRadius] = useState(1000);
  const [isNotificationTriggered, setIsNotificationTriggered] = useState(false);
  const [notificationBusCoordinate, setNotificationBusCoordinate] =
    useState(null);

  const [selectedRadius, setSelectedRadius] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // default location

  useEffect(() => {
    // Fetch all routes when component mounts
    const fetchRoutes = async () => {
      const snapshot = await firestore().collection('routes').get();
      const allRoutes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRoutes(allRoutes);
    };

    fetchRoutes();
    // Fetch current location when component mounts
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setCurrentLocation({latitude, longitude});

        setInitialRegion({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        });
      },
      error => {
        console.error(error);
      },
      {enableHighAccuracy: true, interval: 20000},
    );
  }, []); // Empty dependency array to run only on mount

  // get bus location

  useEffect(() => {
    console.log('Effect triggered');

    const unsubscribe = firestore()
      .collection('busLocation')
      .onSnapshot(async snapshot => {
        let addedMarkers = [];
        let modifiedMarkers = [];
        let removedMarkers = [];

        console.log('snapshot triggered');

        const changes = snapshot.docChanges();
        const busPromises = changes.map(async change => {
          const doc = change.doc;
          console.log('Processing document:', doc.id);
          const data = doc.data();

          // check if data and doc.id are valid
          if (!data || !doc.id) {
            console.error('Invalid data or document ID');
            return null; // Skip this document
          }

          const busDoc = await firestore()
            .collection('buses')
            .doc(doc.id)
            .get();

          const busData = busDoc.data();
          if (!busData) {
            console.error('Bus data not found for document:', doc.id);
            return null; // Skip this document
          }

          const profilePicture = busData.profile_picture || IMAGES.logo;

          const busInfo = {
            id: doc.id,
            coordinate: {
              latitude: data.coordinates.latitude,
              longitude: data.coordinates.longitude,
            },
            details: {
              bus_number: busData.bus_number,
              license_plate: busData.license_plate,
              route_id: data.route_id,
              timestamp: data.timestamp,
              seat_count: busData.seat_count,
              speed: data.speed,
            },
            emergency_status: data.emergency_status,
          };

          switch (change.type) {
            case 'added':
              addedMarkers.push(busInfo);
              break;
            case 'modified':
              modifiedMarkers.push(busInfo);
              break;
            case 'removed':
              removedMarkers.push(busInfo);
              break;
          }
        });

        // Await for all promises to resolve before processing
        await Promise.all(busPromises);

        // Handle added buses
        setBusMarkers(prevMarkers => [
          ...prevMarkers,
          ...addedMarkers.filter(bus => bus !== null),
        ]);

        // Handle modified buses
        setBusMarkers(prevMarkers =>
          prevMarkers.map(
            bus =>
              modifiedMarkers.find(modified => modified.id === bus.id) || bus,
          ),
        );

        // Handle removed buses
        setBusMarkers(prevMarkers =>
          prevMarkers.filter(
            bus => !removedMarkers.find(removed => removed.id === bus.id),
          ),
        );
      });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const checkBusProximity = async () => {
      if (!marker || busMarkers.length === 0) {
        return;
      }

      let closestBus = null; // Track the closest bus
      let closestDistance = Infinity; // Start with an infinitely large distance

      for (const bus of busMarkers) {
        const distance = calculateDistance(bus.coordinate, marker);

        if (distance <= markerProximityRadius && distance < closestDistance) {
          closestDistance = distance; // Update closest distance
          closestBus = bus.coordinate; // Update closest bus coordinate
        }
      }

      if (closestBus && !isNotificationTriggered) {
        await onDisplayNotification(closestBus); // Pass the closest bus coordinate
        setIsNotificationTriggered(true);
        console.log('Notification triggered');
      }
    };

    checkBusProximity();
  }, [busMarkers, marker, markerProximityRadius, isNotificationTriggered]);

  useEffect(() => {
    let watchId;

    // Start watching user's location
    const startWatchingLocation = () => {
      watchId = Geolocation.watchPosition(
        position => {
          const {latitude, longitude} = position.coords;
          setCurrentLocation({latitude, longitude});
        },
        error => {
          console.error(error);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 10,
          interval: 30000,
        },
      );
    };

    startWatchingLocation();

    return () => {
      if (watchId) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, []);

  useEffect(() => {
    const handleNotificationPress = async () => {
      if (notificationBusCoordinate && marker) {
        const coordinates = [
          [marker.latitude, marker.longitude],
          [
            notificationBusCoordinate.latitude,
            notificationBusCoordinate.longitude,
          ],
        ];

        const route = await getRoute(coordinates);

        setRouteCoordinates(route);
        setNotificationBusCoordinate(null);

        mapRef.current.animateToRegion({
          latitude: marker.latitude,
          longitude: marker.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    };

    const unsubscribe = notifee.onForegroundEvent(({type}) => {
      if (type === EventType.PRESS) {
        handleNotificationPress();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [notificationBusCoordinate, marker]);

  // notification

  async function onDisplayNotification(busCoordinate) {
    setNotificationBusCoordinate(busCoordinate);
    // Request permissions (required for iOS)
    await notifee.requestPermission();

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'important',
      name: 'Important Notifications',
      importance: AndroidImportance.HIGH,
      sound: 'hollow',
    });

    // Display a notification
    await notifee.displayNotification({
      title: 'Bus Nearby!',
      body: 'A Bus is within your selected proximity of your marker location.',
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        smallIcon: 'ic_notification',
        sound: 'hollow',
        pressAction: {
          id: 'default',
        },
        fullScreenAction: {
          id: 'default',
        },
      },
    });
  }

  const onMapPress = event => {
    const {coordinate} = event.nativeEvent;

    if (routeCoordinates.length > 0) {
      setRouteCoordinates([]);
      setEta(null);
      return;
    }

    if (marker) {
      Alert.alert(
        'Marker Already Placed',
        'There is already a marker placed. Please remove the current marker before placing a new one.',
      );
      return;
    }

    const distance = calculateDistance(currentLocation, coordinate);

    if (distance > 1000) {
      Alert.alert(
        'Out of Range',
        'Marker can only be placed within 1000 meters from your current location.',
      );
      return;
    }

    setSelectedRadius(coordinate); // Set the coordinate for marker placement
    setModalVisible(true);
  };

  const handleMarkerPlacement = async (coordinate, radius) => {
    try {
      const userID = auth().currentUser.uid;

      await firestore()
        .collection('markers')
        .doc(userID)
        .set({
          coordinates: {
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
          },
          radius: radius,
          timestamp: firestore.FieldValue.serverTimestamp(),
        });

      setMarker(coordinate);
      setMarkerProximityRadius(radius);
      setIsNotificationTriggered(false);
    } catch (error) {
      console.error('Error updating Firestore document: ', error);
      Alert.alert('Update Failed', 'Failed to update marker location.');
    }
  };

  const onMarkerPressed = () => {
    // user id
    const userID = auth().currentUser.uid;
    Alert.alert(
      'Marker',
      'Do you want to delete this marker?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            setMarker(null);
            setIsNotificationTriggered(false);
            setRouteCoordinates([]);

            try {
              await firestore().collection('markers').doc(userID).delete();
            } catch (error) {
              console.error('Error updating Firestore document:', error);
              Alert.alert('Update Failed', 'Failed to update marker location.');
            }
          },
        },
      ],
      {cancelable: true},
    );
  };

  const fetchRouteData = async routeId => {
    try {
      const routeDoc = await firestore()
        .collection('routes')
        .doc(routeId)
        .get();
      if (routeDoc.exists) {
        const routeData = routeDoc.data();
        return routeData;
      } else {
        throw new Error('Route not found');
      }
    } catch (error) {
      console.error('Error fetching route data:', error);
    }
  };

  const markerRefs = useRef([]);

  const onBusMarkerPressed = async (busX, index) => {
    try {
      console.log('Selected routeId:', busX.details.route_id);
      const routeData = await fetchRouteData(busX.details.route_id);

      const coordinates = routeData.keypoints.map(point => [
        point.latitude,
        point.longitude,
      ]);

      const route = await getRoute(coordinates);

      if (currentLocation && busMarkers.length > 0) {
        const bus = busMarkers.find(bus => bus.id === busX.id);

        console.log('Selected bus:', bus.id);

        if (bus.details.speed === 0) {
          setEta(null);
        } else {
          const etaInMinutes = await calculateETAWithDirectionsAPI(
            currentLocation,
            bus.coordinate,
            bus.details.speed,
          );
          setEta(etaInMinutes);
        }
      }

      // reshow the callout cause the first callout dont load the eta and speed
      setTimeout(() => {
        markerRefs.current[index].showCallout();
      });

      setRouteCoordinates(route);
    } catch (error) {
      console.error('Error processing route:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderComponent navigation={navigation} ROUTES={ROUTES} />
      {/* 14.823320026254835, 121.05946449733479 */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE} // remove if not using Google Maps
          style={styles.map}
          showsUserLocation={true}
          showsMyLocationButton={false}
          initialRegion={initialRegion}
          maxZoomLevel={20}
          minZoomLevel={12}
          pitchEnabled={false}
          showsCompass={false}
          toolbarEnabled={false}
          showsTraffic
          onPress={onMapPress}>
          {/* Marker */}
          {marker && (
            <Marker
              coordinate={marker}
              title="Marker"
              onPress={onMarkerPressed}
            />
          )}

          {/* Bus markers */}
          {busMarkers.map((bus, index) => {
            const routeIcons = {
              XoUoz68kkO4HYY968qOa: 'bus1',
              qaeFwYGWez7U8kQWF10b: 'bus2',
            };

            const busIcon = bus.emergency_status
              ? 'bus3'
              : routeIcons[bus.details.route_id] || 'bus1';

            return (
              <Marker
                ref={el => (markerRefs.current[index] = el)}
                key={`${bus.id}-${index}`} // Add index for extra uniqueness
                coordinate={bus.coordinate}
                onPress={() => onBusMarkerPressed(bus, index)}
                image={{uri: busIcon}}>
                <CustomCallout
                  navigation={navigation}
                  routes={ROUTES.ADVANCEPAYMENT}
                  currentLocation={currentLocation}
                  eta={eta}
                  bus={bus}
                />
              </Marker>
            );
          })}

          {/* Draw polyline */}
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#0051ff" // Customize the color
              strokeWidth={2} // Customize the width
            />
          )}
        </MapView>
        <FooterComponent
          mapRef={mapRef}
          currentLocation={currentLocation}
          navigation={navigation}
          ROUTES={ROUTES}
        />
      </View>
      <ProximityAlertModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        handleMarkerPlacement={handleMarkerPlacement}
        selectedRadius={selectedRadius}
      />
    </SafeAreaView>
  );
};

export default Main;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4FB',
  },

  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },

  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
