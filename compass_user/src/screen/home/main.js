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
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
import Geolocation from '@react-native-community/geolocation';

const Main = props => {
  const {navigation} = props;
  const mapRef = useRef(MapView);

  // user current location
  const [initialRegion, setInitialRegion] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);

  // marker
  const [marker, setMarker] = useState(null);

  // search boc

  const [searchVisible, setSearchVisible] = useState(false);
  const searchBoxHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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

  // hamburger menu
  const onMenuPressed = () => {
    navigation.navigate(ROUTES.DRAWER);

    console.log('DRAWER');
  };

  // search

  const onSearchPressed = () => {
    console.log('SEARCH');

    setSearchVisible(true);
    Animated.timing(searchBoxHeight, {
      toValue: screenHeight * 0.95,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // hide search box
  const hideSearchBox = () => {
    Animated.timing(searchBoxHeight, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => setSearchVisible(false));
  };

  // reset camera to north
  const resetRotation = () => {
    console.log('Rotation Reset');
    if (mapRef.current) {
      mapRef.current.animateCamera({heading: 0});
    }
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

  // save the current region
  const onRegionChangeComplete = region => {
    setMapRegion(region);
  };

  const onMapPress = event => {
    if (marker) {
      Alert.alert(
        'Marker Already Placed',
        'There is already a marker placed. Please remove the current marker before placing a new one.',
      );
      return;
    }

    const {coordinate} = event.nativeEvent;
    const distance = calculateDistance(currentLocation, coordinate);

    if (distance <= 500) {
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
            onPress: () => setMarker(coordinate),
          },
        ],
        {cancelable: true},
      );
    } else {
      Alert.alert(
        'Out of Range',
        'Marker can only be placed within 500 meters from your current location.',
      );
    }
  };

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

  const onMarkerPressed = () => {
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
          onPress: () => setMarker(null),
        },
      ],
      {cancelable: true},
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onMenuPressed}>
          <View style={styles.hamburgerMenu}>
            <Icon name="menu" size={30} color="black" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={onSearchPressed}>
          <View style={styles.searchButton}>
            <Icon name="search" size={30} color="black" />
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
          toolbarEnabled={false}
          onPress={onMapPress}>
          {/* Marker */}
          {marker && (
            <Marker
              coordinate={marker}
              title="Marker"
              onPress={onMarkerPressed}
            />
          )}
        </MapView>
        {/* compass button */}
        <TouchableOpacity onPress={resetRotation} style={styles.compassButton}>
          <Icon name="navigation" size={30} color="black" />
        </TouchableOpacity>

        <TouchableOpacity onPress={centerToUser} style={styles.centerButton}>
          <Icon name="my-location" size={30} color="black" />
        </TouchableOpacity>
      </View>

      {searchVisible && (
        <Animated.View style={[styles.searchBox, {height: searchBoxHeight}]}>
          <TouchableOpacity onPress={hideSearchBox} style={styles.closeButton}>
            <Icon name="close" size={30} color="black" />
          </TouchableOpacity>
          <TextInput style={styles.searchInput} placeholder="Search Location" />
        </Animated.View>
      )}
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
  searchButton: {
    backgroundColor: '#e4e9f6',
    justifyContent: 'center',
    alignItems: 'center',
    width: screenWidth * 0.112,
    height: screenHeight * 0.061,
    borderRadius: 10,
    marginLeft: 10,
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
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginTop: 30,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});
