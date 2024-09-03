import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  Image,
  useWindowDimensions,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';

import {useIsFocused} from '@react-navigation/native';

import {COLORS} from '../../../constants';
import IMAGES from '../../../constants/images';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const Profile = props => {
  const {navigation} = props;
  const {height} = useWindowDimensions();

  // get the name

  const [userFullName, setUserFullName] = useState(null);
  const [userName, setUserName] = useState(null);

  const focus = useIsFocused();

  useEffect(() => {
    const getUserInfo = async () => {
      const user = auth().currentUser;

      if (user) {
        try {
          // Fetch user document from Firestore
          const userDoc = await firestore()
            .collection('buses')
            .doc(user.uid)
            .get();

          if (userDoc.exists) {
            setUserFullName(userDoc.data().bus_driver_name);
            setUserName(userDoc.data().username);
          } else {
            console.log('User document does not exist');
          }
        } catch (error) {
          console.error('Error fetching user data from Firestore:', error);
        }
      }
    };

    if (focus == true) {
      getUserInfo();
    }
  }, [focus]);

  // edit profile

  const EditProfilePressed = type => {
    // navigation.navigate('EditProfile', {profileDataType: type});
  };

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

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.root}>
        <Image
          source={IMAGES.logo}
          style={[styles.logo, {height: height * 0.18}]}
          resizeMode="contain"
        />

        <View style={styles.detailsContainer}>
          <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>Account Details</Text>

            <View style={styles.detailBox}>
              <View style={styles.detailItem}>
                <Text style={styles.detailTitle}>Full Name</Text>
                <Text style={styles.detailText}>{userFullName}</Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>Login Details</Text>

            <View style={styles.detailBox}>
              <View style={styles.detailItem}>
                <Text style={styles.detailTitle}>Username</Text>
                <Text style={styles.detailText}>{userName || 'user name'}</Text>
              </View>
              <View style={styles.separator} />
              <TouchableOpacity
                style={styles.detailItemX}
                onPress={() => EditProfilePressed('Password')}>
                <Text style={styles.detailTitle}>Password</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>Advanced</Text>
            <View style={styles.detailBox}>
              <TouchableOpacity
                style={styles.detailItemX}
                onPress={onLogoutPressed}>
                <Text style={styles.deleteAccounText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  logo: {
    width: '70%',
    maxWidth: 300,
    maxHeight: 200,
    marginVertical: 50,
  },
  detailsContainer: {
    width: '100%',
  },
  sectionBox: {
    marginBottom: 20, // Space between sections
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  detailBox: {
    backgroundColor: '#FFFFFF', // Background color for the details box
    borderRadius: 5,
  },
  detailItem: {
    padding: 10,
  },
  detailItemX: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailText: {
    fontSize: 16,
  },

  deleteAccounText: {
    fontSize: 16,
    color: '#FF0000',
  },

  separator: {
    height: 1,
    backgroundColor: '#E0E0E0', // Color for the separator line
    marginHorizontal: 10, // Space around the separator
  },
});

export default Profile;
