import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  Image,
  useWindowDimensions,
  Text,
  TouchableOpacity,
} from 'react-native';

import {COLORS} from '../../../constants';
import IMAGES from '../../../constants/images';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const Profile = () => {
  const {height} = useWindowDimensions();

  // get the name

  const [userFullName, setUserFullName] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    const getUserInfo = async () => {
      const user = auth().currentUser;

      if (user) {
        // Set displayName and email from Firebase Authentication
        setUserFullName(user.displayName);
        setUserEmail(user.email);

        try {
          // Fetch user document from Firestore
          const userDoc = await firestore()
            .collection('users')
            .doc(user.uid)
            .get();

          if (userDoc.exists) {
            setUserName(userDoc.data().username);
          } else {
            console.log('User document does not exist');
          }
        } catch (error) {
          console.error('Error fetching user data from Firestore:', error);
        }
      }
    };

    getUserInfo();
  }, []);

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
              <TouchableOpacity style={styles.detailItem}>
                <Text style={styles.detailTitle}>Full Name</Text>
                <Text style={styles.detailText}>{userFullName}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>Login Details</Text>

            <View style={styles.detailBox}>
              <TouchableOpacity style={styles.detailItem}>
                <Text style={styles.detailTitle}>Email</Text>
                <Text style={styles.detailText}>{userEmail}</Text>
              </TouchableOpacity>
              <View style={styles.separator} />
              <TouchableOpacity style={styles.detailItem}>
                <Text style={styles.detailTitle}>Username</Text>
                <Text style={styles.detailText}>{userName || "user name"}</Text>
              </TouchableOpacity>
              <View style={styles.separator} />
              <TouchableOpacity style={styles.detailItemX}>
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

  separator: {
    height: 1,
    backgroundColor: '#E0E0E0', // Color for the separator line
    marginHorizontal: 10, // Space around the separator
  },
});

export default Profile;
