import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const FooterComponent = ({ mapRef, currentLocation, navigation, ROUTES }) => {
  // reset camera to north
  const resetRotation = () => {
    console.log('Rotation Reset');
    if (mapRef.current) {
      mapRef.current.animateCamera({ heading: 0 });
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

      {/* Traffic Legend - Combined directly within Footer */}
      <View style={styles.trafficLegendContainer}>
        <Text style={styles.legendText}>Fast</Text>
        <View style={[styles.legendBox, { backgroundColor: '#63d668' }]} />
        <View style={[styles.legendBox, { backgroundColor: 'yellow' }]} />
        <View style={[styles.legendBox, { backgroundColor: '#ff974d' }]} />
        <View style={[styles.legendBox, { backgroundColor: '#811f1f' }]} />
        <Text style={styles.legendText}>Slow</Text>
      </View>

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
    alignItems: 'center', // Center the buttons horizontally
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
  trafficLegendContainer: {
    position: 'absolute',
    bottom: 30, // Aligns above the buttons
    flexDirection: 'row',
    justifyContent: 'center', // Center the traffic legend horizontally
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    elevation: 5,
    zIndex: 1, // Ensures the traffic legend is above other UI elements like the buttons
  },
  legendText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 5,
  },
  legendBox: {
    width: 25,
    height: 10,
    marginHorizontal: 3,
    borderRadius: 2,
  },
});

export default FooterComponent;
