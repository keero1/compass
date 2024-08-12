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
import MainNavigator from './src/navigations/MainNavigator';

export default function App() {
  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

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

  useEffect(() => {
    requestLocationPermission(); // Request location permission when component mounts
  }, []);

  // TODO : Add a loading design
  // if (initializing) {
  //   return (
  //     <View style={styles.container}>
  //       <ActivityIndicator size="large" color="#0000ff" />
  //     </View>
  //   );
  // }

  return (
    <NavigationContainer>
      {/* {!user || !user.emailVerified ? <MainNavigator /> : <AuthNavigator />} */}
      <MainNavigator />
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
