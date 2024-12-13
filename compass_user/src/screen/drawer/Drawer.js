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

// Google
import {GoogleSignin} from '@react-native-google-signin/google-signin';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  ArrowLeftStartOnRectangleIcon,
  BanknotesIcon,
  DocumentIcon,
  QuestionMarkCircleIcon,
  DocumentCheckIcon,
} from 'react-native-heroicons/solid';

const Drawer = props => {
  const {navigation} = props;

  const focus = useIsFocused();

  const onLogoutPressed = () => {
    const currentUser = auth().currentUser;
    Alert.alert('Alert', 'Confirm Logout?', [
      {
        text: 'Logout',
        onPress: async () => {
          console.log('Sign out');
          auth()
            .signOut()
            .then(() => console.log('User signed out'));
          // Check if the user is signed in using google
          if (
            currentUser &&
            currentUser.providerData.some(
              provider => provider.providerId === 'google.com',
            )
          ) {
            try {
              const isSignedIn = await GoogleSignin.isSignedIn();
              if (isSignedIn) {
                await GoogleSignin.revokeAccess();
                await GoogleSignin.signOut();
                console.log('Google sign out successfully');
              } else {
                console.log('Google sign out: No user is signed in');
              }
            } catch (error) {
              console.error('Google sign out error: ', error);
            }
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

  // get the name

  const [userDisplayName, setUserDisplayName] = useState(null);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const userDoc = await AsyncStorage.getItem('user-data');

        if (userDoc) {
          const userData = JSON.parse(userDoc);
          setUserDisplayName(userData.fullName || 'ComPass User');
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

  const onWalletPressed = () => {
    navigation.navigate(ROUTES.WALLET);
  };

  const onAdvancePaymentPressed = () => {
    // navigation.navigate(ROUTES.ADVANCEPAYMENTHISTORY);
    console.log('pressed');
  };

  const onHelpPressed = () => {
    navigation.navigate(ROUTES.SUPPORT);
  };

  const onAboutPressed = () => {
    navigation.navigate(ROUTES.ABOUT);
  };

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.root}>
        <View style={styles.profileContainer}>
          <View style={styles.profileContent}>
            <Image source={IMAGES.user_profile} style={styles.profileImage} />
            <View style={styles.textContainer}>
              <Text style={styles.text}>{userDisplayName}</Text>
              {/* Profile */}
              <TouchableOpacity
                onPress={onProfilePress}
                style={styles.viewProfileButton}>
                <Text style={styles.viewProfileButtonText}>View Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Line separator */}
        <View style={styles.separator}></View>

        {/* Touchable Text Components */}
        <TouchableOpacity
          onPress={onWalletPressed}
          style={styles.menuItemContainer}>
          <BanknotesIcon size={25} color="gray" />
          <Text style={styles.menuItem}>Wallet</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
          onPress={onAdvancePaymentPressed}
          style={styles.menuItemContainer}>
          <DocumentCheckIcon size={25} color="gray" />
          <Text style={styles.menuItem}>Advance Payments</Text>
        </TouchableOpacity> */}

        <TouchableOpacity
          style={styles.menuItemContainer}
          onPress={onHelpPressed}>
          <DocumentIcon size={25} color="gray" />
          <Text style={styles.menuItem}>Feedback</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItemContainer}
          onPress={onAboutPressed}>
          <QuestionMarkCircleIcon size={25} color="gray" />
          <Text style={styles.menuItem}>About</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onLogoutPressed}
          style={styles.menuItemContainer}>
          <ArrowLeftStartOnRectangleIcon size={25} color="red" />
          <Text style={styles.menuItemLogout}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2024 ComPass. All Rights Reserved.
          </Text>
        </View>
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
    borderWidth: 2, // Border width
    borderColor: 'gray', // Border color
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
  menuItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  menuItem: {
    fontSize: 25,
    marginLeft: 10,
  },
  menuItemLogout: {
    fontSize: 25,
    color: 'red',
    marginLeft: 10,
  },

  footer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: 'gray',
  },
});

export default Drawer;
