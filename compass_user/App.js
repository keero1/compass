import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import { PermissionsAndroid } from 'react-native';

//firebase
import auth from '@react-native-firebase/auth';

//navigator
import AuthNavigator from './src/navigations/AuthNavigator';
import HomeNavigator from './src/navigations/HomeNavigator';

export default function App() {
  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

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
        },
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

  useEffect(() => {
    requestLocationPermission(); // Request location permission when component mounts
  }, []);

  if (initializing) return null;

  return (
    <NavigationContainer>
      {!user || !user.emailVerified ? <AuthNavigator /> : <HomeNavigator />}
    </NavigationContainer>
  );
}
