import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
  ActivityIndicator,
  Pressable
} from 'react-native';

import IMAGES from '../../constants/images';

import AuthInput from '../../components/auth/AuthInput';

import AuthButton from '../../components/auth/AuthButton';

import auth from '@react-native-firebase/auth';

const Register = props => {
  const {navigation} = props;
  const [email, setEmail] = useState('');

  //loading
  const [loading, setLoading] = useState(false);

  // password
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const onRegisterPressed = async () => {
    setLoading(true);

    try {
      if (!email || !password || !confirmPassword) {
        throw new Error('Email and Password must not be empty.');
      }

      if (password !== confirmPassword) {
        throw new Error('Password does not match.');
      }

      // password format

      const MIN_PASSWORD_LENGTH = 6;
      if(password.length < MIN_PASSWORD_LENGTH) {
        throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
      }

      // create the account

      const {user} = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );

      // set default display name

      await user.updateProfile({
        displayName: 'ComPass User',
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
        ]
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
        <AuthInput placeholder="Email" value={email} setValue={setEmail} />

        <AuthInput
          placeholder="Password"
          value={password}
          setValue={setPassword}
          secureTextEntry
          autoCapitalize={'none'}
        />

        <AuthInput
          placeholder="Confirm Password"
          value={confirmPassword}
          setValue={setConfirmPassword}
          secureTextEntry
          autoCapitalize={'none'}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#0000FF" />
        ) : (
          <>
            <AuthButton text="Register" onPress={onRegisterPressed} />
          </>
        )}

        <View style={styles.container}>
          <View style={styles.line} />
          <View>
            <Text style={styles.lineText}>or sign up using</Text>
          </View>
          <View style={styles.line} />
        </View>

        <View style={styles.container}>
          <Pressable style={[styles.socialLoginButton, {marginRight: 20}]}>
            <Image
              source={IMAGES.google}
              style={[styles.socialLoginImage, {height: height * 0.3}]}
            />
          </Pressable>

          <Pressable style={[styles.socialLoginButton, {marginLeft: 20}]}>
            <Image
              source={IMAGES.facebook}
              style={[styles.socialLoginImage, {height: height * 0.3}]}
            />
          </Pressable>
        </View>

        <View style={styles.footer}>
          <View style={styles.signUpContainer}>
            <Text>Already got an account? </Text>
            <TouchableOpacity onPress={onLoginPressed} activeOpacity={0.8}>
              <Text style={[styles.signUp, styles.createAccount]}>Login</Text>
            </TouchableOpacity>
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
    justifyContent: 'space-between',
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
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

  //social footer
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  lineText: {
    margin: 10,
    textAlign: 'center',
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#DFDFDF',
  },
  socialLoginButton: {
    padding: 10,

    width: '100%',
    maxWidth: 80,
    maxHeight: 100,

    borderRadius: 20,
    alignItems: 'center',

    backgroundColor: '#e4e9f6',
  },

  socialLoginImage: {
    width: '100%',
    maxWidth: 50,
    maxHeight: 50,
  },

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
