import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {
  PermissionsAndroid,
  View,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

//navigator
import AuthNavigator from './src/navigations/AuthNavigator';

export default function App() {
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
      <AuthNavigator />
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
