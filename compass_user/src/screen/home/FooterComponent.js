import React from 'react';

import {StyleSheet, View, TouchableOpacity} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';

const FooterComponent = ({mapRef, currentLocation, navigation, ROUTES}) => {
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

  const onPayPressed = () => {
    navigation.navigate(ROUTES.WALLET);

    console.log('wallet');
  };

  return (
    <View style={styles.footerContainer}>
      {/* compass button */}
      <TouchableOpacity onPress={resetRotation} style={styles.compassButton}>
        <Icon name="navigation" size={30} color="black" />
      </TouchableOpacity>

      <TouchableOpacity onPress={centerToUser} style={styles.centerButton}>
        <Icon name="my-location" size={30} color="black" />
      </TouchableOpacity>
      <TouchableOpacity onPress={onPayPressed} style={styles.payButton}>
        <Icon name="payment" size={30} color="black" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    ...StyleSheet.absoluteFillObject, // Ensure it covers the entire screen
    justifyContent: 'flex-end', // Position the buttons near the bottom
    alignItems: 'flex-start', // Align buttons to the left or customize as needed
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
  payButton: {
    backgroundColor: '#e4e9f6',
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
    position: 'absolute',
    bottom: 20,
    right: 10,
  },
});

export default FooterComponent;
