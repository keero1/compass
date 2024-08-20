import React, {useRef, useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

// ROUTES

import ROUTES from '../../constants/routes';

// MAP
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
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
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        });

        // Send initial location to Firestore
        updateBusLocation(latitude, longitude);
      },
      error => {
        console.error(error);
      },
      {enableHighAccuracy: true, timeout: 20000},
    );

    // Set interval to update location every 5 seconds
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
    }, 10000); // 10000 milliseconds = 10 seconds

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
        const busInfo = (await firestore().collection('buses').doc(user).get()).data();
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
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      });
    }
  };

  const onPayPressed = () => {
    navigation.navigate(ROUTES.WALLET);

    console.log('wallet');
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
          maxZoomLevel={20}
          minZoomLevel={12}
          onRegionChangeComplete={onRegionChangeComplete}
          pitchEnabled={false}
          showsCompass={false}
          toolbarEnabled={false}></MapView>
        <TouchableOpacity onPress={centerToUser} style={styles.centerButton}>
          <Icon name="my-location" size={30} color="black" />
        </TouchableOpacity>
        {/* Pay button */}
        <TouchableOpacity onPress={onPayPressed} style={styles.payButton}>
          <Icon name="payment" size={30} color="black" />
        </TouchableOpacity>
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
});
