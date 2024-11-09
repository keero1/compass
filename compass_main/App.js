import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {
  PermissionsAndroid,
  View,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import notifee, {AndroidImportance, EventType} from '@notifee/react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import AuthNavigator from './src/navigations/AuthNavigator';
import MainNavigator from './src/navigations/MainNavigator';

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(async user => {
      setUser(user);
      if (user) {
        await initializeUserData(user.uid);
      }
      setInitializing(false);
    });

    requestPermissions();

    return subscriber; // Cleanup on unmount
  }, []);

  // Initialize user data on login
  async function initializeUserData(uid) {
    try {
      const busData = await fetchBusData(uid);
      if (busData) {
        const {route_id, bus_type} = busData;
        await fetchRouteAndFareData(route_id, bus_type);
      }
    } catch (error) {
      console.error('Error initializing user data:', error);
    }
  }

  // Fetch bus data using UID
  async function fetchBusData(uid) {
    try {
      const busDoc = await firestore().collection('buses').doc(uid).get();
      if (busDoc.exists) {
        const busData = {...busDoc.data(), bus_id: busDoc.id};
        await AsyncStorage.setItem('bus-data', JSON.stringify(busData));
        return busData;
      }
    } catch (error) {
      console.error('Error fetching bus data:', error);
    }
  }

  // Fetch route and fare data based on route ID and bus type
  async function fetchRouteAndFareData(routeId, busType) {
    try {
      const fareData = await fetchFareData(routeId);
      if (fareData)
        await AsyncStorage.setItem('fare-data', JSON.stringify(fareData));

      const routeName = await fetchRouteName(routeId);
      if (routeName) await AsyncStorage.setItem('route-data', routeName);

      await AsyncStorage.setItem('bus-type', busType);
    } catch (error) {
      console.error('Error fetching route and fare data:', error);
    }
  }

  async function fetchFareData(routeId) {
    try {
      const fareDoc = await firestore().collection('fares').doc(routeId).get();
      return fareDoc.exists ? fareDoc.data() : null;
    } catch (error) {
      console.error('Error fetching fare data:', error);
    }
  }

  async function fetchRouteName(routeId) {
    try {
      const routeDoc = await firestore()
        .collection('routes')
        .doc(routeId)
        .get();
      return routeDoc.exists ? routeDoc.data().route_name : null;
    } catch (error) {
      console.error('Error fetching route name:', error);
    }
  }

  // Request location and notification permissions
  async function requestPermissions() {
    await requestLocationPermission();
    await requestNotificationPermission();
  }

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
    } catch (error) {
      console.warn('Location permission error:', error);
    }
  }

  async function requestNotificationPermission() {
    try {
      const settings = await notifee.requestPermission();
      console.log(
        settings.authorizationStatus >= 1
          ? 'Notification permission granted'
          : 'Notification permission denied',
      );
    } catch (error) {
      console.warn('Notification permission error:', error);
    }
  }

  // Notification setup and display functions
  async function setupNotification() {
    const initialNotification = await notifee.getInitialNotification();
    if (initialNotification) {
      console.log(
        'App opened via notification:',
        initialNotification.notification,
      );
      await notifee.cancelNotification(initialNotification.notification.id);
    }
  }

  async function showAdvancePaymentNotification() {
    const channelId = await notifee.createChannel({
      id: 'advance-payment',
      name: 'Advance Payment Notifications',
      importance: AndroidImportance.HIGH,
    });

    await notifee.displayNotification({
      title: 'Advance Payment Requested',
      body: 'A passenger has requested to pay in advance. Please review and verify their information.',
      android: {
        channelId,
        smallIcon: 'ic_notification',
        pressAction: {id: 'default'},
      },
    });
  }

  // Listen for advance payment requests
  useEffect(() => {
    if (user) {
      const unsubscribe = firestore()
        .collection('advancePayment')
        .where('bus_id', '==', user.uid) // Use 'user.uid' or a specific bus_id
        .where('triggered', '==', false)
        .onSnapshot(snapshot => {
          snapshot.docChanges().forEach(async change => {
            if (change.type === 'added') {
              showAdvancePaymentNotification();

              // update
              await firestore()
                .collection('advancePayment')
                .doc(change.doc.id)
                .update({triggered: true});
            }
          });
        });
      return unsubscribe;
    }
  }, [user]);

  useEffect(() => {
    setupNotification()
      .then(() => setLoading(false))
      .catch(console.error);
  }, []);

  if (loading || initializing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

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
