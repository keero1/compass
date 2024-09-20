import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PermissionsAndroid, View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Navigator
import AuthNavigator from './src/navigations/AuthNavigator';
import MainNavigator from './src/navigations/MainNavigator';

export default function App() {
  // State management
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        await fetchFareData(user.uid);
      }

      // Simulate loading time
      setTimeout(() => {
        setInitializing(false);
      }, 1000);
    });

    requestLocationPermission(); // Request location permission on mount

    return subscriber; // Cleanup subscription on unmount
  }, []);

  // Function to fetch fare data using the user's UID
  async function fetchFareData(uid) {
    try {
      const busDoc = await firestore().collection('buses').doc(uid).get();

      if (busDoc.exists) {
        const { route_id, bus_type } = busDoc.data();
        
        await AsyncStorage.setItem('bus-data', JSON.stringify(busDoc.data())); // Save bus data locally
        await fetchRouteAndFareData(route_id, bus_type); // Fetch related route and fare data
      }
    } catch (error) {
      console.error('Error fetching fare data: ', error);
    }
  }

  // Helper function to fetch route name and fare data
  async function fetchRouteAndFareData(routeId, busType) {
    try {
      const routeDoc = await firestore().collection('routes').doc(routeId).get();
      const fareDoc = await firestore().collection('fares').doc(routeId).get();

      if (fareDoc.exists) {
        const fareData = fareDoc.data();
        await AsyncStorage.setItem('fare-data', JSON.stringify(fareData));
        console.log('Fare data fetched and stored locally');
      }

      if (routeDoc.exists) {
        const routeName = routeDoc.data().route_name;
        await AsyncStorage.setItem('route-data', routeName);
        console.log('Route name fetched and stored locally');
      }

      await AsyncStorage.setItem('bus-type', busType);
      console.log('Bus type fetched and stored locally');
    } catch (error) {
      console.error('Error fetching route and fare data: ', error);
    }
  }

  // Function to request location permission
  async function requestLocationPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'App needs access to your location.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location permission granted');
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  }

  // Loading indicator while Firebase initializes
  if (initializing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Navigation container based on user authentication state
  return (
    <NavigationContainer>
      {!user ? <AuthNavigator /> : <MainNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
