import React, {useEffect, useState} from 'react';
import {
  Alert,
  View,
  SafeAreaView,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
} from 'react-native';

import {useIsFocused} from '@react-navigation/native';

import {
  ArrowRightCircleIcon,
  BanknotesIcon,
  MapPinIcon,
  ArrowLeftStartOnRectangleIcon,
  QuestionMarkCircleIcon,
} from 'react-native-heroicons/solid';

import auth from '@react-native-firebase/auth';

import {IMAGES, ROUTES} from '../../constants';

import AsyncStorage from '@react-native-async-storage/async-storage';

const Drawer = props => {
  const {navigation} = props;

  const focus = useIsFocused();

  // get the name

  const [userDisplayName, setUserDisplayName] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const busData = await AsyncStorage.getItem('bus-data');

        if (busData) {
          const userData = JSON.parse(busData);
          setUserDisplayName(userData.bus_driver_name || 'ComPass Driver');
          setProfilePicture(userData.profile_picture || null);
        } else {
          console.log('No bus data found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error fetching bus data from AsyncStorage: ', error);
      }
    };

    if (focus) {
      getUserData();
    }
  }, [focus]);

  const onTripPressed = () => {
    navigation.navigate(ROUTES.TRIP);
  };

  const onProfilePress = () => {
    navigation.navigate(ROUTES.PROFILE);
  };

  const onPaymentPressed = () => {
    navigation.navigate(ROUTES.PAYMENT);
  };

  // const onPaymentRequestPressed = () => {
  //   navigation.navigate(ROUTES.PAYMENTREQUEST);
  // };

  const onTransactionPressed = () => {
    navigation.navigate(ROUTES.TRANSACTIONS);
  };

  const onAboutPressed = () => {
    navigation.navigate(ROUTES.ABOUT);
  };

  const onLogoutPressed = () => {
    Alert.alert('Alert', 'Confirm Logout?', [
      {
        text: 'Logout',
        onPress: async () => {
          try {
            await AsyncStorage.clear();
            console.log('Async Storage Cleared');

            auth()
              .signOut()
              .then(() => console.log('User signed out'));
          } catch (error) {
            console.error('Error during logout:', error);
          }
        },
      },
      {
        text: 'No',
        onPress: () => console.log('Cancelled'),
        style: 'cancel',
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.root}>
        <View style={styles.profileContainer}>
          <View style={styles.profileContent}>
            <Image
              source={
                profilePicture ? {uri: profilePicture} : IMAGES.user_profile
              }
              style={styles.profileImage}
            />
            <View style={styles.textContainer}>
              <Text style={styles.text}>{userDisplayName}</Text>
              {/* Profile */}
              <TouchableOpacity
                style={styles.viewProfileButton}
                onPress={onProfilePress}>
                <Text style={styles.viewProfileButtonText}>View Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.separator}></View>
        <TouchableOpacity
          onPress={onTripPressed}
          style={styles.menuItemContainer}>
          <MapPinIcon size={30} color="gray" />
          <Text style={styles.menuItem}>Trip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onPaymentPressed}
          style={styles.menuItemContainer}>
          <BanknotesIcon size={30} color="gray" />
          <Text style={styles.menuItem}>Payment</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity
          onPress={onPaymentRequestPressed}
          style={styles.menuItemContainer}>
          <BanknotesIcon size={30} color="gray" />
          <Text style={styles.menuItem}>Payment Request</Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          onPress={onTransactionPressed}
          style={styles.menuItemContainer}>
          <ArrowRightCircleIcon size={30} color="gray" />
          <Text style={styles.menuItem}>Transactions</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onAboutPressed}
          style={styles.menuItemContainer}>
          <QuestionMarkCircleIcon size={30} color="gray" />
          <Text style={styles.menuItem}>About</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onLogoutPressed}
          style={styles.menuItemContainer}>
          <ArrowLeftStartOnRectangleIcon size={30} color="red" />
          <Text style={styles.menuItemX}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#F4F4FB',
  },

  root: {
    flex: 1,
    padding: 20,
  },

  profileContainer: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 20,
  },

  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 10,
  },

  textContainer: {
    flex: 1,
    marginStart: 20,
  },

  text: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  viewProfileButton: {
    backgroundColor: '#e4e9f6',
    width: '100%',
    maxWidth: 150,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },

  viewProfileButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },

  // Separator
  separator: {
    height: 1,
    backgroundColor: 'black',
    width: '100%',
    marginBottom: 20,
  },

  // Menu items
  menuItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  menuItem: {
    fontSize: 25,
    marginLeft: 10, // Add margin to the left for spacing
  },

  menuItemX: {
    fontSize: 25,
    marginLeft: 10, // Add margin to the left for spacing
    color: 'red',
  },
});

export default Drawer;
