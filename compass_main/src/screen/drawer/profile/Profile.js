import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';

import {launchImageLibrary} from 'react-native-image-picker';

import {PlusCircleIcon} from 'react-native-heroicons/solid';

import {useIsFocused} from '@react-navigation/native';

import IMAGES from '../../../constants/images';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

import AsyncStorage from '@react-native-async-storage/async-storage';

const Profile = () => {
  const [profilePicture, setProfilePicture] = useState(null);

  const [userFullName, setUserFullName] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [userName, setUserName] = useState(null);
  const [newDriverName, setNewDriverName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  // password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordChangeModalVisible, setPasswordChangeModalVisible] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [loadingModalVisible, setLoadingModalVisible] = useState(false);

  const focus = useIsFocused();

  useEffect(() => {
    const getUserInfo = async () => {
      const user = auth().currentUser;

      if (user) {
        try {
          const userDoc = await firestore()
            .collection('buses')
            .doc(user.uid)
            .get();

          if (userDoc.exists) {
            setUserFullName(userDoc.data().bus_driver_name);
            setPhoneNumber(userDoc.data().phone_number);
            setUserName(userDoc.data().username);
            setProfilePicture(userDoc.data().profile_picture || null);
          } else {
            console.log('User document does not exist');
          }
        } catch (error) {
          console.error('Error fetching user data from Firestore:', error);
        }
      }
    };

    if (focus) {
      getUserInfo();
    }
  }, [focus]);

  const requestNameChange = async () => {
    const user = auth().currentUser;

    if (user && newDriverName.trim() !== '') {
      setLoading(true);
      setLoadingModalVisible(true);
      try {
        // Check for existing pending requests
        const pendingRequestsSnapshot = await firestore()
          .collection('profileUpdateRequests')
          .where('userId', '==', user.uid)
          .where('status', '==', 'Pending')
          .get();

        if (!pendingRequestsSnapshot.empty) {
          Alert.alert('Error', 'You already have a pending request.');
          setLoading(false);
          return; // Exit the function if there is a pending request
        }

        await firestore().collection('profileUpdateRequests').add({
          userId: user.uid,
          currentDriverName: userFullName,
          requestedDriverName: newDriverName,
          status: 'Pending',
          requestTime: firestore.FieldValue.serverTimestamp(),
        });

        Alert.alert('Success', 'Name change request submitted successfully!');
        setModalVisible(false); // Close modal after submission
        setNewDriverName(''); // Reset input
      } catch (error) {
        console.log('Error submitting name change request:', error);
        Alert.alert('Error', 'Failed to submit name change request.');
      } finally {
        setLoading(false);
        setLoadingModalVisible(false);
      }
    } else {
      Alert.alert('Error', 'Please enter a valid driver name.');
    }
  };

  const handleChoosePhoto = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      maxWidth: 300,
      maxHeight: 300,
      quality: 0.5,
    });

    if (!result.didCancel && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const uri = asset.uri;
      const fileName = `profilePicture/${auth().currentUser.uid}_${Date.now()}`;

      setLoading(true);
      setLoadingModalVisible(true);
      try {
        const reference = storage().ref(fileName);
        await reference.putFile(uri);
        const imageUrl = await reference.getDownloadURL();

        // Update Firestore
        await firestore()
          .collection('buses')
          .doc(auth().currentUser.uid)
          .update({
            profile_picture: imageUrl,
          });

        setProfilePicture(imageUrl);

        const existingBusData = await AsyncStorage.getItem('bus-data');
        if (existingBusData) {
          const busData = JSON.parse(existingBusData);
          busData.profile_picture = imageUrl; // Modify the profile picture field
          await AsyncStorage.setItem('bus-data', JSON.stringify(busData)); // Save updated bus data
        }

        Alert.alert('Success', 'Profile picture updated successfully!');
      } catch (error) {
        console.error('Error uploading image:', error);
        Alert.alert('Error', 'Failed to update profile picture.');
      } finally {
        setLoading(false);
        setLoadingModalVisible(false);
      }
    }
  };

  // change password
  const handleChangePassword = async () => {
    const user = auth().currentUser;

    if (newPassword === confirmNewPassword) {
      setLoading(true);
      try {
        // Reauthenticate the user
        const credential = auth.EmailAuthProvider.credential(
          user.email,
          currentPassword,
        );
        await user.reauthenticateWithCredential(credential);

        // Update password
        await user.updatePassword(newPassword);
        Alert.alert('Success', 'Password changed successfully!');
        setPasswordChangeModalVisible(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } catch (error) {
        console.log('Error changing password:', error);
        Alert.alert(
          'Error',
          'Failed to change password. Please check your current password and try again.',
        );
      } finally {
        setLoading(false);
      }
    } else {
      Alert.alert('Error', 'New passwords do not match.');
    }
  };

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.logoContainer}>
        <TouchableOpacity onPress={handleChoosePhoto} disabled={loading}>
          <View>
            <Image
              source={profilePicture ? {uri: profilePicture} : IMAGES.frieren}
              style={styles.logo}
            />
            <View style={styles.iconOverlay}>
              <PlusCircleIcon size={40} color="#176B87" />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.detailsContainer}>
          <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>Account Details</Text>

            <View style={styles.detailBox}>
              <TouchableOpacity
                style={styles.detailItem}
                onPress={() => setModalVisible(true)}>
                <Text style={styles.detailTitle}>Full Name</Text>
                <Text style={styles.detailText}>
                  {userFullName || 'ComPass Driver'}
                </Text>
              </TouchableOpacity>

              <View style={styles.separator} />

              <View style={styles.detailItem}>
                <Text style={styles.detailTitle}>Phone Number</Text>
                <Text style={styles.detailText}>
                  (+63) {phoneNumber || 912345678}
                </Text>
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
                onPress={() => setPasswordChangeModalVisible(true)}>
                <Text style={styles.detailTitle}>Password</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Name Change Modal */}
        <Modal
          animationType="none"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Request Name Change</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter new driver name"
                value={newDriverName}
                onChangeText={setNewDriverName}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButton}
                  disabled={loading}
                  onPress={requestNameChange}>
                  <Text style={styles.modalButtonText}>Submit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  disabled={loading}
                  onPress={() => {
                    setNewDriverName('');
                    setModalVisible(false);
                  }}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Change Password Modal */}
        <Modal
          animationType="none"
          transparent={true}
          visible={passwordChangeModalVisible}
          onRequestClose={() => setPasswordChangeModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Current Password"
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="New Password"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Confirm New Password"
                secureTextEntry
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButton}
                  disabled={loading}
                  onPress={handleChangePassword}>
                  <Text style={styles.modalButtonText}>
                    {loading ? 'Changing Password...' : 'Change Password'}{' '}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  disabled={loading}
                  onPress={() => {
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmNewPassword('');
                    setPasswordChangeModalVisible(false);
                  }}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="none"
          transparent={true}
          visible={loadingModalVisible}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Uploading...</Text>
              <Text style={styles.modalText}>
                Please wait while we update your profile picture.
              </Text>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#F4F4FB',
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 50,
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  iconOverlay: {
    position: 'absolute',
    bottom: 5, // Position at the bottom
    right: 5, // Position to the right
    borderRadius: 20, // Half of icon size to make it a circle
    padding: 5,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 20,
  },
  detailsContainer: {
    width: '100%',
  },
  sectionBox: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  detailBox: {
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#E0E0E0',
    marginHorizontal: 10,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#176B87',
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalCancelButton: {
    backgroundColor: '#FF0000',
    // Add the same centering properties if not already included
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Profile;
