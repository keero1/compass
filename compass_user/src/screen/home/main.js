import React, {useRef, useEffect, useState} from 'react';
import {StyleSheet, View, TouchableOpacity, Dimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

// ROUTES

import ROUTES from '../../constants/routes';

// MAP
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
import Geolocation from '@react-native-community/geolocation';

const Main = props => {
  const {navigation} = props;
  const mapRef = useRef(MapView);

  // user current location
  const [initialRegion, setInitialRegion] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);

  useEffect(() => {
    // Fetch current location when component mounts
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setCurrentLocation({latitude, longitude});

        setInitialRegion({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
      },
      error => {
        console.error(error);
      },
      {enableHighAccuracy: true, timeout: 20000},
    );
  }, []); // Empty dependency array to run only on mount

  // hamburger menu
  const onMenuPressed = () => {
    navigation.navigate(ROUTES.DRAWER);

    console.log('DRAWER');
  };

  // reset camera to north
  const resetRotation = () => {
    console.log("Rotation Reset")
    if (mapRef.current) {
      mapRef.current.animateCamera({heading: 0});
    }
  };

  // handle centering to user
  const centerToUser = () => {
    console.log("Reset Camera to User")
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
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
          showsCompass={false}
        />
        {/* compass button */}
        <TouchableOpacity onPress={resetRotation} style={styles.compassButton}>
          <Icon name="navigation" size={30} color="black" />
        </TouchableOpacity>

        <TouchableOpacity onPress={centerToUser} style={styles.centerButton}>
          <Icon name="my-location" size={30} color="black" />
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
    zIndex: 999,
    flexDirection: 'row',
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
  compassButton: {
    backgroundColor: '#e4e9f6',
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
    position: 'absolute',
    top: '20%', // 20% higher from the center
    right: 10, // Right side of the screen
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
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
