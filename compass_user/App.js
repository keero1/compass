import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {
  PermissionsAndroid,
  View,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

//firebase
import auth from '@react-native-firebase/auth';

//navigator
import AuthNavigator from './src/navigations/AuthNavigator';
import HomeNavigator from './src/navigations/HomeNavigator';

import notifee from '@notifee/react-native';

export default function App() {
  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(user => {
      setUser(user);
      setTimeout(() => {
        setInitializing(false); // Set initializing to false after 1 second
      }, 1000); // 1000 milliseconds = 1 second
    });

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

  async function requestNotificationPermission() {
    try {
      const settings = await notifee.requestPermission();
      if (settings.authorizationStatus >= 1) {
        console.log('Notification permission granted');
      } else {
        console.log('Notification permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  }

  // async function checkPowerManagerSettings() {
  //   const powerManagerInfo = await notifee.getPowerManagerInfo();

  //   if (powerManagerInfo.activity) {
  //     Alert.alert(
  //       'Restrictions Detected',
  //       'To ensure notifications are delivered, please adjust your settings to prevent the app from being killed.',
  //       [
  //         {
  //           text: 'OK, open settings',
  //           onPress: async () => await notifee.openPowerManagerSettings(),
  //         },
  //         {
  //           text: 'Cancel',
  //           onPress: () => console.log('Cancel Pressed'),
  //           style: 'cancel',
  //         },
  //       ],
  //       {cancelable: false},
  //     );
  //   }
  // }

  useEffect(() => {
    requestLocationPermission();
    requestNotificationPermission();
  }, []);

  async function bootstrap() {
    const initialNotification = await notifee.getInitialNotification();

    if (initialNotification) {
      console.log(
        'Notification caused application to open',
        initialNotification.notification,
      );
      console.log(
        'Press action used to open the app',
        initialNotification.pressAction,
      );

      await notifee.cancelNotification(initialNotification.notification.id);
    }
  }

  useEffect(() => {
    bootstrap()
      .then(() => setLoading(false))
      .catch(console.error);
  }, []);

  if (loading) {
    return null;
  }

  // TODO : Add a loading design
  if (initializing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user || !user.emailVerified ? <AuthNavigator /> : <HomeNavigator />}
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
