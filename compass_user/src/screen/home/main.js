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
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

// ROUTES

import ROUTES from '../../constants/routes';

// MAP
import MapView, {
  PROVIDER_GOOGLE,
  Marker,
  MarkerAnimated,
  Callout,
} from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
import Geolocation from '@react-native-community/geolocation';

// firebase
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const Main = props => {
  const {navigation} = props;
  const mapRef = useRef(MapView);

  // user id
  const userID = auth().currentUser.uid;

  // user current location
  const [initialRegion, setInitialRegion] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);

  // search
  const [searchQuery, setSearchQuery] = useState('');
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);

  // marker
  const [marker, setMarker] = useState(null);
  const animatedMarkersRef = useRef();

  // bus location
  const [busMarkers, setBusMarkers] = useState([]);

  // search boc

  const [searchVisible, setSearchVisible] = useState(false);
  const searchBoxHeight = useRef(new Animated.Value(0)).current;

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

    // Fetch bus locations
    const unsubscribe = firestore()
      .collection('busLocation')
      .onSnapshot(querySnapshot => {
        const buses = [];
        querySnapshot.forEach(async doc => {
          const data = doc.data();
          const lastSeen = data.timestamp.toDate();
          const currentTime = new Date();
          const diffInSeconds = (currentTime - lastSeen) / 1000;
          // do not include offline buses (5 minutes)
          if (diffInSeconds <= 300) {
            // Fetch additional bus details from the 'buses' collection
            const busDoc = await firestore()
              .collection('buses')
              .doc(doc.id)
              .get();

            const busData = busDoc.data();
            buses.push({
              id: doc.id,
              coordinate: {
                latitude: data.coordinates.latitude,
                longitude: data.coordinates.longitude,
              },
              details: {
                name: busData.name,
                license_plate: busData.license_plate,
              },
            });
            animate(data.coordinates.latitude, data.coordinates.longitude);
          }
        });

        setBusMarkers(buses);
      });

    // Clean up the subscription
    return () => unsubscribe();
  }, []); // Empty dependency array to run only on mount

  // animation

  const animate = (latitude, longitude) => {
    const newCoordinate = {latitude, longitude};
    const duration = 5000;
    if (Platform.OS == 'android') {
      if (animatedMarkersRef.current) {
        animatedMarkersRef.current.animateMarkerToCoordinate(
          newCoordinate,
          duration,
        );
      }
    }
  };

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
        hideSearchBox(); // Close the search box
        return true; // Prevent default back action (closing the app)
      }
      return false;
    };

    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    // Cleanup the event listener on unmount
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [searchVisible]);

  // hamburger menu
  const onMenuPressed = () => {
    navigation.navigate(ROUTES.DRAWER);

    console.log('DRAWER');
  };

  /* SEARCH START */

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

  /* SEARCH END */

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

    if (distance <= 100) {
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
        'Marker can only be placed within 100 meters from your current location.',
      );
    }
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

          {/* Bus markers */}
          {busMarkers.map(bus => (
            <MarkerAnimated
              ref={animatedMarkersRef}
              key={bus.id}
              coordinate={bus.coordinate}
              // Customize your bus marker appearance
              pinColor="blue" // Example, you can use custom images
            >
              <Callout>
                <Text>Name: {bus.details.name}</Text>
                <Text>License Plate: {bus.details.license_plate}</Text>
              </Callout>
            </MarkerAnimated>
          ))}
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
          <TextInput
            style={styles.searchInput}
            placeholder="Search Routes"
            onChangeText={text => setSearchQuery(text)}
          />

          {routes.length > 0 && (
            <FlatList
              data={filteredRoutes}
              keyExtractor={item => item.id}
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
