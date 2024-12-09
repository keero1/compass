import React, {useRef, useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  Modal,
  Text,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {ExclamationCircleIcon} from 'react-native-heroicons/solid';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {getRoute} from './RouteUtils';

// ROUTES

import ROUTES from '../../constants/routes';

// MAP
import MapView, {PROVIDER_GOOGLE, Marker, Polyline} from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
import Geolocation from '@react-native-community/geolocation';

// firebase

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import notifee, {EventType} from '@notifee/react-native';
import TrafficLegend from './TrafficLegend';

const Main = props => {
  const {navigation} = props;
  const mapRef = useRef(MapView);

  // user current location
  const [initialRegion, setInitialRegion] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);

  const [markers, setMarkers] = useState([]);

  // alert
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [emergencyStatus, setEmergencyStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Seat count
  const maxSeatCount = 56;
  const [seatCount, setSeatCount] = useState(0);

  const user = auth().currentUser.uid;

  // keypoints

  const [routeCoordinates, setRouteCoordinates] = useState([]);

  useEffect(() => {
    const fetchEmergencyStatus = async () => {
      try {
        const storedStatus = await AsyncStorage.getItem('emergency-status');
        if (storedStatus !== null) {
          setEmergencyStatus(JSON.parse(storedStatus));
          console.log('Emergency status loaded:', JSON.parse(storedStatus));
        }
      } catch (error) {
        console.error('Error loading emergency status:', error);
      }
    };

    const fetchKeypoints = async () => {
      try {
        const polylineData = await AsyncStorage.getItem('polyline-data');

        if (polylineData) {
          console.log('loading data from local storage');
          const decodedRoute = JSON.parse(polylineData);
          setRouteCoordinates(decodedRoute);

          return;
        }

        const keypointsData = await AsyncStorage.getItem('keypoints');
        if (keypointsData) {
          console.log('fetching data from direction api');
          const route = await getRoute(JSON.parse(keypointsData));

          await AsyncStorage.setItem('polyline-data', JSON.stringify(route));

          setRouteCoordinates(route);
        }
      } catch (error) {
        console.error('Error fetching keypoints:', error);
      }
    };
    fetchEmergencyStatus();
    fetchKeypoints();
  }, []);

  useEffect(() => {
    const handleNotificationPress = async () => {
      navigation.navigate(ROUTES.PAYMENTREQUEST);
    };

    const unsubscribe = notifee.onForegroundEvent(({type}) => {
      if (type === EventType.PRESS) {
        handleNotificationPress();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let movementTimer = null;

    const processLocation = (position, isInitial, hasMoved) => {
      const {latitude, longitude, speed} = position.coords;
      const speedInKmh = isInitial || hasMoved ? 0 : speed * 3.6;
      setCurrentLocation({latitude, longitude});
      updateBusLocation(latitude, longitude, speedInKmh);

      console.log(
        `${isInitial ? 'Initial' : 'Current'} Speed: ${speedInKmh} km/h`,
      );
    };

    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setInitialRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });

        processLocation(position, true);
      },
      error => {
        console.error(error);
      },
      {enableHighAccuracy: true},
    );

    fetchSeatCount();

    const watchId = Geolocation.watchPosition(
      position => {
        processLocation(position, false, false);

        if (movementTimer) {
          clearInterval(movementTimer);
        }

        movementTimer = setInterval(() => {
          console.log('Checking if the bus has moved...');
          handleNoMovement();
        }, 60 * 1000);
      },
      error => {
        console.error(error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 100,
      },
    );

    // no movement
    const handleNoMovement = () => {
      console.log("Bus hasn't moved for a while. triggering fallback...");
      Geolocation.getCurrentPosition(
        position => {
          processLocation(position, false, true); // Force update
        },
        error => {
          console.error(error);
        },
        {enableHighAccuracy: true},
      );
    };

    return () => {
      if (movementTimer) {
        clearInterval(movementTimer); // Clean up the interval when the component unmounts
      }
      Geolocation.clearWatch(watchId); // Clear the watch position
    };
  }, []);

  const updateBusLocation = async (latitude, longitude, speed) => {
    try {
      const busDocRef = firestore().collection('busLocation').doc(user);

      const docSnapshot = await busDocRef.get();

      const fareDataString = await AsyncStorage.getItem('fare-data');
      let fareData = null;

      if (fareDataString) {
        fareData = JSON.parse(fareDataString);
      }

      if (!docSnapshot.exists) {
        // get the route id
        const busInfo = (
          await firestore().collection('buses').doc(user).get()
        ).data();
        await busDocRef.set({
          coordinates: new firestore.GeoPoint(latitude, longitude),
          speed,
          timestamp: firestore.FieldValue.serverTimestamp(),
          route_id: busInfo.route_id,
          fare_data: fareData,
        });
      } else {
        await busDocRef.update({
          coordinates: new firestore.GeoPoint(latitude, longitude),
          speed,
          timestamp: firestore.FieldValue.serverTimestamp(),
          fare_data: fareData,
        });
      }
      console.log('Bus location updated:', latitude, longitude);
    } catch (error) {
      console.error('Error updating bus location:', error);
    }
  };

  // marker
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('markers')
      .onSnapshot(
        snapshot => {
          const markersData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              latitude: data.coordinates.latitude,
              longitude: data.coordinates.longitude,
              timestamp: data.timestamp,
            };
          });
          setMarkers(markersData);
        },
        error => {
          console.error('Error fetching markers:', error);
        },
      );

    // Cleanup function to unsubscribe from the listener on unmount
    return () => unsubscribe();
  }, []);

  // seat count
  const fetchSeatCount = async () => {
    try {
      const busDoc = await firestore().collection('buses').doc(user).get();
      const busData = busDoc.data();
      setSeatCount(busData.seat_count || 0);
    } catch (error) {
      console.error('Error fetching seat count:', error);
    }
  };

  const updateSeatCount = async newCount => {
    try {
      const busDocRef = firestore().collection('buses').doc(user);
      await busDocRef.update({
        seat_count: newCount,
      });
      setSeatCount(newCount);
    } catch (error) {
      console.error('Error updating seat count:', error);
    }
  };

  const setSeatCountToPercentage = percentage => {
    const newSeatCount = Math.ceil((percentage / 100) * maxSeatCount);
    updateSeatCount(newSeatCount);
  };

  // hamburger menu
  const onMenuPressed = () => {
    navigation.navigate(ROUTES.DRAWER);

    console.log('DRAWER');
  };

  // handle centering to user
  const centerToUser = () => {
    console.log('Reset Camera to User');
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const onPayPressed = () => {
    navigation.navigate(ROUTES.PAYMENT);

    console.log('payment');
  };
  // save the current region
  const onRegionChangeComplete = region => {
    setMapRegion(region);
  };

  const handleExclamationPress = () => {
    setIsModalVisible(true); // Show modal on button press
  };

  const handleButtonPress = async () => {
    setIsLoading(true);

    if (emergencyStatus) {
      stopEmergency();
      return;
    }

    try {
      // Get bus data from AsyncStorage
      const busData = await AsyncStorage.getItem('bus-data');
      if (busData) {
        const parsedBusData = JSON.parse(busData);

        // Ensure currentLocation is available
        if (
          currentLocation &&
          currentLocation.latitude &&
          currentLocation.longitude
        ) {
          const {latitude, longitude} = currentLocation;

          const emergencyData = {
            subject: `Emergency Report`,
            bus_id: parsedBusData.bus_id,
            bus_driver_name: parsedBusData.bus_driver_name,
            bus_number: parsedBusData.bus_number,
            bus_type: parsedBusData.bus_type,
            conductor_name: parsedBusData.conductor_name || 'N/A',
            phone_number: parsedBusData.phone_number,
            coordinates: {latitude, longitude},
            status: 'Active',
            timestamp: firestore.FieldValue.serverTimestamp(),
          };

          // Insert into reportEmergency collection
          await firestore().collection('reportEmergency').add(emergencyData);
          console.log('Emergency report submitted:', emergencyData);

          // Update the emergency status in the busLocation collection
          await firestore().collection('busLocation').doc(user).update({
            emergency_status: true,
          });

          // Set emergency status in AsyncStorage
          await AsyncStorage.setItem('emergency-status', JSON.stringify(true)); // Save status
          setEmergencyStatus(true);
          console.log('Emergency Alert Initiated');
        } else {
          console.error('Current location is not available.');
          Alert.alert('Location Error', 'Unable to retrieve current location.');
        }
      } else {
        console.error('Bus data not found in AsyncStorage');
      }
    } catch (error) {
      console.error('Error updating emergency status:', error);
    } finally {
      setIsLoading(false);
      setIsModalVisible(false); // Close modal
      ToastAndroid.show('SUCCESSFULLY REPORTED EMERGENCY', ToastAndroid.SHORT);
      navigation.navigate(ROUTES.REPORT);
    }
  };

  const stopEmergency = async () => {
    try {
      const querySnapshot = await firestore()
        .collection('reportEmergency')
        .where('bus_id', '==', user)
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();

      if (!querySnapshot.empty) {
        const latestReportDoc = querySnapshot.docs[0];
        const reportId = latestReportDoc.id;

        await firestore().collection('reportEmergency').doc(reportId).update({
          status: 'Cancelled',
          cancelled_by_user: true,
          cancellation_timestamp: firestore.FieldValue.serverTimestamp(),
        });

        console.log('Latest emergency report status updated to "Cancelled"');
      } else {
        console.log('No emergency reports found for the user');
      }

      await firestore().collection('busLocation').doc(user).update({
        emergency_status: false,
      });

      await AsyncStorage.setItem('emergency-status', JSON.stringify(false)); // Save status

      console.log('Emergency Alert stopped');
    } catch (error) {
      console.error('Error canceling emergency status:', error);
    } finally {
      setEmergencyStatus(false);
      setIsLoading(false);
      ToastAndroid.show('EMERGENCY ALERT STOPPED', ToastAndroid.SHORT);
      setIsModalVisible(false); // Close modal
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onMenuPressed}>
          <View style={styles.hamburgerMenu}>
            <Icon name="menu" size={30} color="black" />
          </View>
        </TouchableOpacity>

        {emergencyStatus && (
          <Text style={styles.emergencyText}>EMERGENCY IS ON!!</Text>
        )}

        <TouchableOpacity
          onPress={handleExclamationPress}
          style={styles.iconButton}>
          <ExclamationCircleIcon width={30} height={30} color="red" />
        </TouchableOpacity>
      </View>
      {/* 14.823320026254835, 121.05946449733479 */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE} // remove if not using Google Maps
          style={styles.map}
          showsUserLocation={true}
          showsMyLocationButton={false}
          initialRegion={initialRegion}
          showsTraffic
          maxZoomLevel={20}
          minZoomLevel={12}
          onRegionChangeComplete={onRegionChangeComplete}
          pitchEnabled={false}
          showsCompass={false}
          toolbarEnabled={false}>
          {/* Render markers on the map */}
          {markers.map(marker => (
            <Marker
              key={marker.id}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
              title={marker.title} // Assuming you have title field
              description={marker.description} // Assuming you have description field
            />
          ))}

          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#0051ff" // Customize the color
              strokeWidth={2} // Customize the width
            />
          )}
        </MapView>
        <TouchableOpacity onPress={centerToUser} style={styles.centerButton}>
          <Icon name="my-location" size={30} color="black" />
        </TouchableOpacity>
        <TrafficLegend screenWidth={screenWidth} />
        {/* Pay button */}
        <TouchableOpacity onPress={onPayPressed} style={styles.payButton}>
          <Icon name="payment" size={30} color="black" />
        </TouchableOpacity>
      </View>

      {/* Modal for Emergency Alert */}
      <Modal
        transparent={true}
        animationType="none"
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setIsModalVisible(false)}>
              <Icon name="close" size={20} color="black" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Report Emergency</Text>

            {/* Warning Message */}
            {emergencyStatus ? (
              <Text style={styles.modalWarning}>
                An emergency has already been reported. Press "Stop" to cancel
                the emergency alert if the situation is resolved.
              </Text>
            ) : (
              <Text style={styles.modalWarning}>
                This action will alert the admin and should only be used in case
                of an actual emergency or accident.
              </Text>
            )}

            {/* Loading Spinner */}
            {isLoading ? (
              <ActivityIndicator size="large" color="#f00" />
            ) : (
              <TouchableOpacity
                onPress={handleButtonPress}
                style={styles.modalButton}>
                <Text style={styles.modalButtonText}>
                  {emergencyStatus ? 'Stop' : 'Report'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Main;

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4FB',
  },
  header: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 999,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    backgroundColor: '#e4e9f6',
    justifyContent: 'center',
    alignItems: 'center',
    width: screenWidth * 0.112,
    height: screenHeight * 0.061,
    borderRadius: 10,
    marginLeft: 10,
  },
  emergencyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'red',
    textAlign: 'center',
  },
  hamburgerMenu: {
    backgroundColor: '#e4e9f6',
    justifyContent: 'center',
    alignItems: 'center',
    width: screenWidth * 0.112,
    height: screenHeight * 0.061,
    borderRadius: 10,
    marginRight: 10,
  },
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },

  centerButton: {
    backgroundColor: '#e4e9f6',
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  payButton: {
    backgroundColor: '#e4e9f6',
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
    position: 'absolute',
    bottom: 20,
    right: 10,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  seatCounterContainer: {
    position: 'absolute',
    top: 0, // Adjust this to place between center and pay
    right: 0, // Align to the right
    backgroundColor: '#e4e9f6',
    borderRadius: 10,
    paddingTop: 10,
  },

  seatCountLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  percentageButtonsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  percentageButton: {
    backgroundColor: '#e4e9f6',
    justifyContent: 'center',
    alignItems: 'center',
    width: screenWidth * 0.2,
    height: screenHeight * 0.05,
    borderRadius: 5,
    marginVertical: 5,
  },
  percentageText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalWarning: {
    fontSize: 14,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#f00',
    padding: 10,
    borderRadius: 5,
    width: '40%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
