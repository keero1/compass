import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';

import {useNavigation, useRoute} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// custom
import AuthInput from '../../../components/auth/AuthInput';
import AuthButton from '../../../components/auth/AuthButton';

import AsyncStorage from '@react-native-async-storage/async-storage';

const MIN_PASSWORD_LENGTH = 8;

const EditProfile = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  // user
  const user = auth().currentUser;

  // profile data
  const {profileDataType} = useRoute().params;
  const [data, setData] = useState('');

  // if password
  const [oldPassword, setOldPassword] = useState('');

  // password requirement
  const [passwordValid, setPasswordValid] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    symbol: false,
  });

  useEffect(() => {
    setPasswordValid({
      length: data.length >= MIN_PASSWORD_LENGTH,
      lowercase: /[a-z]/.test(data),
      uppercase: /[A-Z]/.test(data),
      number: /[0-9]/.test(data),
      symbol: /[!@#$%^&*]/.test(data),
    });
  }, [data]);

  const isPasswordValid = Object.values(passwordValid).every(Boolean);

  // mapping profile data type

  const updateActions = {
    'Full Name': async () =>
      await firestore()
        .collection('users')
        .doc(user.uid)
        .update({fullName: data}),
    'User Name': async () =>
      await firestore()
        .collection('users')
        .doc(user.uid)
        .update({username: data}),
    Password: async () => {
      const credential = auth.EmailAuthProvider.credential(
        user.email,
        oldPassword,
      );
      await user.reauthenticateWithCredential(credential);

      if (oldPassword === data) {
        Alert.alert(
          'Error',
          'New password cannot be the same as the old password.',
          [{text: 'OK'}],
          {cancelable: false},
        );
        return 1;
      }

      await user.updatePassword(data);
    },
  };

  const onSaveProfilePressed = async () => {
    if (profileDataType === 'Password' && !isPasswordValid) {
      return;
    }

    setLoading(true);

    try {
      if ((await updateActions[profileDataType]()) == 1) {
        return;
      }
      Alert.alert(
        'Success',
        'Profile updated successfully.',
        [
          {
            text: 'OK',
            onPress: async () => {
              const existingUserData = await AsyncStorage.getItem('user-data');

              if (existingUserData) {
                const userData = JSON.parse(existingUserData);
                console.log(data);
                if (profileDataType === 'Full Name') {
                  userData.fullName = data;
                } else if (profileDataType === 'User Name') {
                  userData.username = data;
                }
                await AsyncStorage.setItem(
                  'user-data',
                  JSON.stringify(userData),
                );

                console.log(userData);
              }

              navigation.goBack();
            },
          },
        ],
        {cancelable: false},
      );
    } catch (error) {
      Alert.alert('Error', 'The old password you entered is incorrect.');
    } finally {
      setLoading(false);
    }
  };

  const getTextFields = () => ({
    title: `Change ${profileDataType}`,
    subtitle: `Please enter your new ${profileDataType}.`,
    placeholder: `${profileDataType}`,
    passwordinput: profileDataType === 'Password',
  });

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.root}>
        <Text style={styles.title}>{getTextFields().title}</Text>
        <Text style={styles.subtitle}>{getTextFields().subtitle}</Text>

        {profileDataType === 'Password' && (
          <AuthInput
            placeholder="Old password"
            value={oldPassword}
            setValue={setOldPassword}
            secureTextEntry={getTextFields().passwordinput}
          />
        )}

        <AuthInput
          placeholder={getTextFields().placeholder}
          value={data}
          setValue={setData}
          secureTextEntry={getTextFields().passwordinput}
        />

        {profileDataType === 'Password' && (
          <View style={styles.passwordRequirementsContainer}>
            <Text
              style={[
                styles.passwordRequirement,
                {color: passwordValid.length ? 'green' : 'red'},
              ]}>
              At least 8 characters
            </Text>
            <Text
              style={[
                styles.passwordRequirement,
                {color: passwordValid.uppercase ? 'green' : 'red'},
              ]}>
              At least 1 uppercase letter (A-Z)
            </Text>
            <Text
              style={[
                styles.passwordRequirement,
                {color: passwordValid.lowercase ? 'green' : 'red'},
              ]}>
              At least 1 lowercase letter (a-z)
            </Text>
            <Text
              style={[
                styles.passwordRequirement,
                {color: passwordValid.number ? 'green' : 'red'},
              ]}>
              At least 1 number (0-9)
            </Text>
            <Text
              style={[
                styles.passwordRequirement,
                {color: passwordValid.symbol ? 'green' : 'red'},
              ]}>
              At least 1 symbol (!@#$%^&*)
            </Text>
          </View>
        )}

        {loading ? (
          <ActivityIndicator size="large" color="#0000FF" />
        ) : (
          <AuthButton text="Save" onPress={onSaveProfilePressed} />
        )}
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#176B87',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  passwordRequirementsContainer: {
    width: '90%',
    marginVertical: 5,
    alignItems: 'flex-start', // Align items to the start (left)
  },
});

export default EditProfile;
