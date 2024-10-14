import React, {useRef, useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
  TextInput,
  FlatList,
  Text,
  BackHandler,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {Svg, Image as ImageSvg, Defs, ClipPath, Circle} from 'react-native-svg';

// ROUTES

import ROUTES from '../../constants/routes';

import IMAGES from '../../constants/images';

import notifee, {AndroidImportance} from '@notifee/react-native';

// MAP
import MapView, {
  PROVIDER_GOOGLE,
  Marker,
  Callout,
  Polyline,
} from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
import Geolocation from '@react-native-community/geolocation';

// firebase
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import {getRoute} from '../../components/utils/RoutesUtils';
import HeaderComponent from './HeaderComponent';
import FooterComponent from './FooterComponent';

const Main = props => {
  const {navigation} = props;
  const mapRef = useRef(MapView);

  // user current location
  const [initialRegion, setInitialRegion] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  // search
  const [searchQuery, setSearchQuery] = useState('');
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);

  // marker
  const [marker, setMarker] = useState(null);

  // bus location
  const [busMarkers, setBusMarkers] = useState([]);

  // search box

  const [searchVisible, setSearchVisible] = useState(false);
  const searchBoxHeight = useRef(new Animated.Value(0)).current;

  const [notificationShown, setNotificationShown] = useState(false);

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
      setFilteredRoutes(allRoutes);
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
      {enableHighAccuracy: true, timeout: 20000},
    );
  }, []); // Empty dependency array to run only on mount

  // get bus location

  // Optimized bus marker fetching and updating logic
  useEffect(() => {
    console.log('Effect triggered');
    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

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

          // Ensure data and doc.id are valid
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
              name: busData.bus_driver_name,
              license_plate: busData.license_plate,
              route_id: data.route_id,
              timestamp: data.timestamp,
              seat_count: busData.seat_count,
              profile_picture: profilePicture,
            },
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

  // notification

  async function onDisplayNotification() {
    // Request permissions (required for iOS)
    await notifee.requestPermission();

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'important',
      name: 'Important Notifications',
      importance: AndroidImportance.HIGH,
    });

    // Display a notification
    await notifee.displayNotification({
      title: 'Bus Nearby!',
      body: 'A Bus is within 1 KM of your marker location. please be ready',
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        smallIcon: 'ic_notification',
        pressAction: {
          id: 'default',
        },
        fullScreenAction: {
          id: 'default',
        },
      },
    });
  }

  useEffect(() => {
    const checkBusProximity = async () => {
      if (!marker || busMarkers.length === 0) {
        return;
      }

      let notified = false;

      for (const bus of busMarkers) {
        const distance = calculateDistance(bus.coordinate, marker);

        if (distance <= 1000) {
          if (!notificationShown && !notified) {
            await onDisplayNotification();
            setNotificationShown(true);
            notified = true;

            const userID = auth().currentUser.uid;
            try {
              await firestore().collection('markers').doc(userID).delete();
              setMarker(null);
            } catch (error) {
              console.error('Error removing marker from Firestore: ', error);
            }
          }
        } else if (distance > 1000) {
          if (notified) {
            setNotificationShown(false);
          }
        }
      }
    };

    checkBusProximity();
  }, [busMarkers, marker]);

  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = routes.filter(route =>
        route.route_name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredRoutes(filtered);
    } else {
      setFilteredRoutes(routes);
    }
  }, [searchQuery, routes]);

  useEffect(() => {
    const handleBackPress = () => {
      if (searchVisible) {
        hideSearchBox();
        return true;
      }
      return false;
    };

    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [searchVisible]);

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
          distanceFilter: 10, // Update the location only if the user moves by 10 meters or more
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

  // SEARCH

  const showSearchBox = () => {
    setSearchVisible(true);
    Animated.timing(searchBoxHeight, {
      toValue: screenHeight * 0.95,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const hideSearchBox = () => {
    setSearchQuery('');
    Animated.timing(searchBoxHeight, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => setSearchVisible(false));
  };

  const handleRouteItemClick = async routeId => {
    try {
      // Query buses that match the selected route ID
      const snapshot = await firestore()
        .collection('busLocation')
        .where('route_id', '==', routeId) // Assuming each bus document has a routeId field
        .get();

      const buses = [];
      const currentTime = new Date();

      snapshot.forEach(doc => {
        const data = doc.data();
        const lastSeen = data.timestamp.toDate();
        const diffInSeconds = (currentTime - lastSeen) / 1000;

        if (diffInSeconds <= 300) {
          // 5 minutes
          buses.push({
            id: doc.id,
            coordinate: {
              latitude: data.coordinates.latitude,
              longitude: data.coordinates.longitude,
            },
          });
        }
      });

      if (buses.length === 0) {
        Alert.alert(
          'No Buses Online',
          'No bus available right now for this route.',
        );
      } else {
        // setBusMarkers(buses); // Update bus markers
        Alert.alert('Number of buses online: ' + buses.length, 'bus xd');
      }
    } catch (error) {
      console.error('Error fetching bus locations:', error);
      Alert.alert('Error', 'Failed to fetch bus locations.');
    }
  };

  // SEARCH END
  const onMapPress = event => {
    if (routeCoordinates.length > 0) {
      setRouteCoordinates([]);
      return;
    }

    // user id
    const userID = auth().currentUser.uid;
    if (marker) {
      Alert.alert(
        'Marker Already Placed',
        'There is already a marker placed. Please remove the current marker before placing a new one.',
      );
      return;
    }

    const {coordinate} = event.nativeEvent;
    const distance = calculateDistance(currentLocation, coordinate);

    if (distance > 0) {
      Alert.alert(
        'Place Marker',
        'Do you want to place a marker here?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: async () => {
              setMarker(coordinate);

              try {
                await firestore()
                  .collection('markers')
                  .doc(userID)
                  .set({
                    coordinates: {
                      latitude: coordinate.latitude,
                      longitude: coordinate.longitude,
                    },
                    timestamp: firestore.FieldValue.serverTimestamp(),
                  });
              } catch (error) {
                console.error('Error updating Firestore document: ', error);
                Alert.alert(
                  'Update Failed',
                  'Failed to update marker location.',
                );
              }
            },
          },
        ],
        {cancelable: true},
      );
    } else {
      Alert.alert(
        'Out of Range',
        'Marker can only be placed within 1000 meters from your current location.',
      );
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
  const [routeCoordinates, setRouteCoordinates] = useState([]);
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

  const onBusMarkerPressed = async routeId => {
    try {
      const routeData = await fetchRouteData(routeId);

      const coordinates = routeData.keypoints.map(point => [
        point.latitude,
        point.longitude,
      ]);

      const route = await getRoute(coordinates);

      setRouteCoordinates(route);
    } catch (error) {
      console.error('Error processing route:', error);
    }
  };

  // limit distance
  const calculateDistance = (coord1, coord2) => {
    // Radius of the Earth in meters
    const earthRadius = 6371e3;

    // Convert latitude and longitude from degrees to radians
    const latitude1Radians = (coord1.latitude * Math.PI) / 180;
    const latitude2Radians = (coord2.latitude * Math.PI) / 180;
    const latitudeDifferenceRadians =
      ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const longitudeDifferenceRadians =
      ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

    // Haversine formula
    const a =
      Math.sin(latitudeDifferenceRadians / 2) *
        Math.sin(latitudeDifferenceRadians / 2) +
      Math.cos(latitude1Radians) *
        Math.cos(latitude2Radians) *
        Math.sin(longitudeDifferenceRadians / 2) *
        Math.sin(longitudeDifferenceRadians / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Calculate the distance
    const distance = earthRadius * c;

    return distance;
  };

  const markerRefs = useRef([]);

  /**
   * This is for pre-loading the callout (tanginang package yan may bug di nag loload image sa first tap/load ng callout).
   * Diko pa natest sa nagalaw na bus since nag a-update yon ng marker HAHAHAHHH
   */

  useEffect(() => {
    if (busMarkers.length > 0) {
      busMarkers.forEach((bus, index) => {
        if (markerRefs.current[index]) {
          markerRefs.current[index].showCallout(); // load the callout to cook the image
        }

        markerRefs.current[index].hideCallout(); // unload the callout ready to be pressed
      });
    }
  }, [busMarkers]);

  return (
    <SafeAreaView style={styles.container}>
      <HeaderComponent
        navigation={navigation}
        ROUTES={ROUTES}
        onSearchPressed={showSearchBox}
      />
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
            const busIcon =
              bus.details.route_id === routes[0].id
                ? IMAGES.bus_icon1
                : IMAGES.bus_icon2;
                
            return (
              <Marker
                ref={el => (markerRefs.current[index] = el)}
                key={`${bus.id}-${index}`} // Add index for extra uniqueness
                coordinate={bus.coordinate}
                onPress={() => onBusMarkerPressed(bus.details.route_id)}
                image={busIcon}
                pinColor="blue">
                <Callout style={{alignItems: 'center'}}>
                  <Svg width={120} height={120}>
                    <Defs>
                      <ClipPath id="clip">
                        <Circle cx="50%" cy="50%" r="40%" />
                      </ClipPath>
                    </Defs>
                    <ImageSvg
                      width={120}
                      height={120}
                      preserveAspectRatio="xMidYMid slice"
                      href={bus.details.profile_picture}
                      clipPath="url(#clip)"
                    />
                  </Svg>
                  <Text>Driver Name: {bus.details.name}</Text>
                  <Text>License Plate: {bus.details.license_plate}</Text>
                  <Text>
                    Last Update:{' '}
                    {bus.details.timestamp.toDate().toLocaleString()}
                  </Text>
                  <Text>Seat Slots: {bus.details.seat_count} / 56</Text>
                </Callout>
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

      {searchVisible && (
        <Animated.View style={[styles.searchBox, {height: searchBoxHeight}]}>
          <TouchableOpacity onPress={hideSearchBox} style={styles.closeButton}>
            <Icon name="close" size={30} color="black" />
          </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            placeholder="Search Routes"
            onChangeText={text => setSearchQuery(text)}
          />

          {routes.length > 0 && (
            <FlatList
              data={filteredRoutes}
              keyExtractor={(item, index) => `${item.id}-${index}`} // Use index if id might not be unique
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.routeItemContainer}
                  onPress={() => handleRouteItemClick(item.id)}>
                  <Text style={styles.routeItem}>{item.route_name}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

export default Main;

const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4FB',
  },
  //Callout
  imageWrapperAndroid: {
    height: 200,
    flex: 1,
    marginTop: -85,
    width: 330,
    alignContent: 'center',
    alignItems: 'center',
  },
  imageAndroid: {
    height: 100,
    width: 180,
  },

  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },

  map: {
    ...StyleSheet.absoluteFillObject,
  },

  searchBox: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    zIndex: 1000,
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginTop: 30,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  routeItemContainer: {
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginVertical: 5,
    elevation: 1, // for Android shadow
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5, // for iOS shadow
  },
  routeItem: {
    fontSize: 16,
    color: '#333',
  },
});
