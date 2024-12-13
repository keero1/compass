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
  const [userEmail, setUserEmail] = useState(null);
  const [userName, setUserName] = useState(null);

  const focus = useIsFocused();

  useEffect(() => {
    const getUserInfo = async () => {
      const user = auth().currentUser;

      if (user) {
        // Set displayName and email from Firebase Authentication
        setUserEmail(user.email);

        try {
          // Fetch user document from Firestore
          const userDoc = await firestore()
            .collection('users')
            .doc(user.uid)
            .get();

          if (userDoc.exists) {
            setUserFullName(userDoc.data().fullName);
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

  // edit profile
  const EditProfilePressed = async type => {
    const user = auth().currentUser;

    if (type === 'Password') {
      if (
        user.providerData.some(provider => provider.providerId === 'google.com')
      ) {
        Alert.alert(
          'Password Change Not Allowed',
          'You cannot change the password as you are signed in with Google.',
        );
        return;
      }
    }

    navigation.navigate('EditProfile', {profileDataType: type});
  };

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.root}>
        <Image
          source={IMAGES.user_profile}
          style={[styles.logo, {height: height * 0.18}]}
          resizeMode="contain"
        />

        <View style={styles.detailsContainer}>
          <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>Account Details</Text>

            <View style={styles.detailBox}>
              <TouchableOpacity
                style={styles.detailItem}
                onPress={() => EditProfilePressed('Full Name')}>
                <Text style={styles.detailTitle}>Full Name</Text>
                <Text style={styles.detailText}>{userFullName}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>Login Details</Text>

            <View style={styles.detailBox}>
              <View style={styles.detailItem}>
                <Text style={styles.detailTitle}>Email</Text>
                <Text style={styles.detailText}>{userEmail}</Text>
              </View>
              <View style={styles.separator} />
              <TouchableOpacity
                style={styles.detailItem}
                onPress={() => EditProfilePressed('User Name')}>
                <Text style={styles.detailTitle}>Username</Text>
                <Text style={styles.detailText}>{userName || 'user name'}</Text>
              </TouchableOpacity>
              <View style={styles.separator} />
              <TouchableOpacity
                style={styles.detailItemX}
                onPress={() => EditProfilePressed('Password')}>
                <Text style={styles.detailTitle}>Password</Text>
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
    width: 150, // Set width and height to the same value
    height: 150,
    marginVertical: 50,
    borderRadius: 75, // Half of the width/height for a perfect circle
    borderWidth: 2, // Thickness of the border
    borderColor: 'gray', // Color of the border, e.g., black
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
