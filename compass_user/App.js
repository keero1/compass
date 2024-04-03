import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';

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

  if (initializing) return null;

  return (
    <NavigationContainer>
      { !user || !user.emailVerified ? <AuthNavigator /> : <HomeNavigator />}
    </NavigationContainer>
  );
}
