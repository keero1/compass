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

//firebase
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import {IMAGES, ROUTES} from '../../constants';

import AsyncStorage from '@react-native-async-storage/async-storage';

const Drawer = props => {
  const {navigation} = props;

  const focus = useIsFocused();

  const onShutdownPressed = () => {};

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

  const onProfilePress = () => {
    navigation.navigate(ROUTES.PROFILE);
  };

  const onPaymentPressed = () => {
    navigation.navigate(ROUTES.PAYMENT);
  };

  const onTransactionPressed = () => {
    navigation.navigate(ROUTES.TRANSACTIONS);
  };

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.root}>
        <View style={styles.profileContainer}>
          <View style={styles.profileContent}>
            <Image
              source={profilePicture ? {uri: profilePicture} : IMAGES.logo}
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

        {/* Line separator */}
        <View style={styles.separator}></View>

        {/* Touchable Text Components */}
        <TouchableOpacity onPress={onPaymentPressed}>
          <Text style={styles.menuItem}>Payment</Text>
        </TouchableOpacity>
        {/* Touchable Text Components */}
        <TouchableOpacity onPress={onTransactionPressed}>
          <Text style={styles.menuItem}>Transactions</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity>
          <Text style={styles.menuItem}>Settings</Text>
        </TouchableOpacity> */}
        {/* <TouchableOpacity onPress={onShutdownPressed}>
          <Text style={styles.menuItem}>Shutdown</Text>
        </TouchableOpacity> */}
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
    fontSize: 20,
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
  menuItem: {
    fontSize: 20,
    marginBottom: 10,
  },
});

export default Drawer;
