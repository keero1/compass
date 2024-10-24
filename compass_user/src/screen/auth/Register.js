import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  BackHandler,
} from 'react-native';

import AuthInput from '../../components/auth/AuthInput';
import AuthButton from '../../components/auth/AuthButton';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import BouncyCheckbox from 'react-native-bouncy-checkbox';

import TermsModal from '../../components/terms/TermsModal';

const Register = props => {
  const {navigation} = props;
  const [email, setEmail] = useState('');

  //loading
  const [loading, setLoading] = useState(false);

  // password
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // input reference
  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);

  // password requirement
  const [passwordValid, setPasswordValid] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    numberOrSymbol: false,
  });

  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  useEffect(() => {
    const handleBackPress = () => {
      if (showTermsModal) {
        setShowTermsModal(false);
        return true;
      }
      return false;
    };

    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [showTermsModal]);

  useEffect(() => {
    const MIN_PASSWORD_LENGTH = 8;
    setPasswordValid({
      length: password.length >= MIN_PASSWORD_LENGTH,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[!@#$%^&*]/.test(password),
    });
  }, [password]);

  const isPasswordValid = Object.values(passwordValid).every(Boolean);

  const generateRandomString = length => {
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      randomString += charset[randomIndex];
    }
    return randomString;
  };

  const onRegisterPressed = async () => {
    if (!agreeToTerms) {
      return;
    }

    setLoading(true);
    try {
      if (!email || !password || !confirmPassword) {
        throw new Error('Email and Password must not be empty.');
      }

      if (!isPasswordValid) {
        return;
      }

      if (password !== confirmPassword) {
        throw new Error('Password does not match.');
      }
      // create the account

      const {user} = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );

      // user name
      const username = `compass_${generateRandomString(8)}`;

      // set default display name

      await user.updateProfile({
        displayName: 'ComPass User',
      });

      // create user document

      await firestore().collection('users').doc(user.uid).set({
        username: username,
        timestamp: firestore.FieldValue.serverTimestamp(),
      });

      await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('wallet')
        .doc('wallet')
        .set({
          balance: 0,
          currency: 'PHP',
          last_updated: firestore.FieldValue.serverTimestamp(),
        });

      await user.sendEmailVerification();
      auth().signOut();

      Alert.alert(
        'Account Successfully created!',
        'Email verification has been sent to ' +
          email +
          '. Verify the email to activate your account.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(), // Navigate back when "OK" is pressed
          },
        ],
      );

      console.log(user);
    } catch (error) {
      console.log(error);

      Alert.alert('Account creation failed!', error.message);
    } finally {
      setLoading(false);
    }
  };

  //height
  const {height} = useWindowDimensions();

  const onLoginPressed = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.root}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Email <Text style={styles.required}>*</Text>
          </Text>
          <AuthInput
            placeholder="Email"
            value={email}
            setValue={setEmail}
            returnKeyType="next"
            onSubmitEditing={() => passwordInputRef.current?.focus()}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Password <Text style={styles.required}>*</Text>
          </Text>
          <AuthInput
            placeholder="Password"
            value={password}
            setValue={setPassword}
            secureTextEntry
            autoCapitalize={'none'}
            returnKeyType="next"
            onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
            ref={passwordInputRef}
          />
        </View>

        {password.length > 0 && (
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

        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Confirm Password <Text style={styles.required}>*</Text>
          </Text>
          <AuthInput
            placeholder="Password"
            value={confirmPassword}
            setValue={setConfirmPassword}
            secureTextEntry
            autoCapitalize={'none'}
            ref={confirmPasswordInputRef}
          />
        </View>

        <View style={styles.termsContainer}>
          <View style={styles.checkboxContainer}>
            <BouncyCheckbox
              isChecked={agreeToTerms}
              fillColor="#176B87"
              onPress={isChecked => {
                setAgreeToTerms(isChecked);
              }}
              iconStyle={{borderWidth: 2, borderColor: '#176B87'}}
              size={20}
            />
          </View>
          <Text>I Agree to the </Text>
          <TouchableOpacity onPress={() => setShowTermsModal(true)}>
            <Text style={styles.termsText}>Terms and Conditions</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#0000FF" />
        ) : (
          <>
            <AuthButton
              text="Register"
              onPress={onRegisterPressed}
              disabled={!agreeToTerms}
            />
          </>
        )}

        <View style={styles.footer}>
          <View style={styles.signUpContainer}>
            <Text>Already got an account? </Text>
            <TouchableOpacity onPress={onLoginPressed} activeOpacity={0.8}>
              <Text style={[styles.signUp, styles.createAccount]}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TermsModal
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
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
    justifyContent: 'space-between',
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
  },
  inputContainer: {
    width: '100%', // Align inputs to the center
  },
  label: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  required: {
    color: 'red', // Color of the asterisk
  },
  verification: {
    backgroundColor: 'white',
    width: '70%',

    borderColor: '#B2B2B2',
    borderWidth: 1,
    borderRadius: 20,

    paddingHorizontal: 10,

    marginVertical: 10,
  },

  // button

  animatedContainer: {
    width: '30%',
    alignItems: 'center',
  },

  buttonContainer: {
    backgroundColor: '#176B87',

    width: '90%',

    padding: 15,

    alignItems: 'center',
    borderRadius: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },

  // password
  passwordRequirementsContainer: {
    width: '90%',
    marginVertical: 5,
    alignItems: 'flex-start', // Align items to the start (left)
  },

  passwordRequirement: {
    textAlign: 'left', // Ensure text is aligned to the left
  },

  termsContainer: {
    flexDirection: 'row', // Align items in a row
    alignItems: 'center', // Center items vertically
    marginTop: 10,
  },

  checkboxContainer: {
    justifyContent: 'center', // Center the checkbox vertically
    alignItems: 'center', // Align checkbox to the center
    marginRight: -5,
  },

  termsText: {
    color: '#176B87',
    fontWeight: 'bold',
  },

  // Footer

  footer: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  signUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  signUp: {
    color: '#176B87',
  },
});

export default Register;
