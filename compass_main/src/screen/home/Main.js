import React, {useRef, useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  Alert,
  Text,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

// ROUTES

import ROUTES from '../../constants/routes';

// MAP
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
import Geolocation from '@react-native-community/geolocation';

// firebase

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const Main = props => {
  const {navigation} = props;
  const mapRef = useRef(MapView);

  // user current location
  const [initialRegion, setInitialRegion] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);

  const [markers, setMarkers] = useState([]);

  // Seat count
  const maxSeatCount = 56;
  const [seatCount, setSeatCount] = useState(0);

  const user = auth().currentUser.uid;

  useEffect(() => {
    // Fetch initial location
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setCurrentLocation({latitude, longitude});
        setInitialRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });

        // Send initial location to Firestore
        updateBusLocation(latitude, longitude);
      },
      error => {
        console.error(error);
      },
      {enableHighAccuracy: true, timeout: 20000},
    );

    fetchSeatCount();

    // Set interval to update location every 10 seconds
    const intervalId = setInterval(() => {
      Geolocation.getCurrentPosition(
        position => {
          const {latitude, longitude} = position.coords;
          setCurrentLocation({latitude, longitude});

          // Send updated location to Firestore
          updateBusLocation(latitude, longitude);
        },
        error => {
          console.error(error);
        },
        {enableHighAccuracy: true},
      );
    }, 15000); // 15000 milliseconds = 15 seconds

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array to run only on mount

  // Function to update bus location in Firestore
  const updateBusLocation = async (latitude, longitude) => {
    try {
      const busDocRef = firestore().collection('busLocation').doc(user);

      const docSnapshot = await busDocRef.get();
      if (!docSnapshot.exists) {
        // get the route id
        const busInfo = (
          await firestore().collection('buses').doc(user).get()
        ).data();
        await busDocRef.set({
          coordinates: new firestore.GeoPoint(latitude, longitude),
          timestamp: firestore.FieldValue.serverTimestamp(),
          route_id: busInfo.route_id,
        });
      } else {
        await busDocRef.update({
          coordinates: new firestore.GeoPoint(latitude, longitude),
          timestamp: firestore.FieldValue.serverTimestamp(),
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onMenuPressed}>
          <View style={styles.hamburgerMenu}>
            <Icon name="menu" size={30} color="black" />
          </View>
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
          followsUserLocation
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
        </MapView>
        <TouchableOpacity onPress={centerToUser} style={styles.centerButton}>
          <Icon name="my-location" size={30} color="black" />
        </TouchableOpacity>
        {/* Pay button */}
        <TouchableOpacity onPress={onPayPressed} style={styles.payButton}>
          <Icon name="payment" size={30} color="black" />
        </TouchableOpacity>

        {/* Seat Count Modifier */}
        <View style={styles.seatCounterContainer}>
          <Text style={styles.seatCountLabel}>Seat: {seatCount}</Text>
          <View style={styles.percentageButtonsContainer}>
            {/* Buttons for 25%, 50%, 75%, and 100% */}
            <TouchableOpacity
              style={styles.percentageButton}
              onPress={() => setSeatCountToPercentage(0)}>
              <Text style={styles.percentageText}>0%</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.percentageButton}
              onPress={() => setSeatCountToPercentage(25)}>
              <Text style={styles.percentageText}>25%</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.percentageButton}
              onPress={() => setSeatCountToPercentage(50)}>
              <Text style={styles.percentageText}>50%</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.percentageButton}
              onPress={() => setSeatCountToPercentage(75)}>
              <Text style={styles.percentageText}>75%</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.percentageButton}
              onPress={() => setSeatCountToPercentage(100)}>
              <Text style={styles.percentageText}>100%</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
});
