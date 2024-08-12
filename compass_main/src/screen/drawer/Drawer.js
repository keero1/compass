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

import {IMAGES, ROUTES} from '../../constants';

const Drawer = props => {
  const {navigation} = props;

  const focus = useIsFocused();

  const onLogoutPressed = () => {
    Alert.alert('Alert', 'Confirm Logout?', [
      {
        text: 'Logout',
        onPress: async () => {
          console.log('Sign out');
          auth()
            .signOut()
            .then(() => console.log('User signed out'));
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
    const getUserDisplayName = async () => {
      const user = auth().currentUser;

      if (user) {
        setUserDisplayName(user.displayName);
      }
    };

    if (focus == true) {
      getUserDisplayName();
    }
  }, [focus]);

  // const onProfilePress = () => {
  //   navigation.navigate(ROUTES.PROFILE);
  // };

  // const onSettingsPressed = () => {
  //   navigation.navigate(ROUTES.SETTINGS);
  // };

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.root}>
        <View style={styles.profileContainer}>
          <View style={styles.profileContent}>
            <Image source={IMAGES.logo} style={styles.profileImage} />
            <View style={styles.textContainer}>
              <Text style={styles.text}>{userDisplayName}</Text>
              {/* Profile */}
              <TouchableOpacity style={styles.viewProfileButton}>
                <Text style={styles.viewProfileButtonText}>View Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Line separator */}
        <View style={styles.separator}></View>

        {/* Touchable Text Components */}
        <TouchableOpacity>
          <Text style={styles.menuItem}>Wallet</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.menuItem}>Settings</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity>
          <Text style={styles.menuItem}>Feedback</Text>
        </TouchableOpacity> */}
        <TouchableOpacity onPress={onLogoutPressed}>
          <Text style={styles.menuItem}>Logout</Text>
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
