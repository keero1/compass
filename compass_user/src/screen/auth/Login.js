import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Pressable,
  ToastAndroid,
  Platform,
} from 'react-native';

import IMAGES from '../../constants/images';

import ROUTES from '../../constants/routes';

import AuthInput from '../../components/auth/AuthInput';
import AuthButton from '../../components/auth/AuthButton';

// FIREBASE
import auth from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';

// GOOGLE
import {GoogleSignin} from '@react-native-google-signin/google-signin';

const Login = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const {height} = useWindowDimensions();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '47001508674-jp3tfr2gts64d7mtts3jqpoeng0rg32r.apps.googleusercontent.com',
      forceCodeForRefreshToken: true, 
    });
  }, []);

  // LOGIN

  const onLoginPressed = async () => {
    setLoading(true);

    try {
      //trim email
      const trimmedEmail = email.trim();

      if (!trimmedEmail) {
        throw new Error();
      }

      if (!email || !password) {
        throw new Error();
      }

      const response = await auth().signInWithEmailAndPassword(
        trimmedEmail,
        password,
      );
      const user = response.user;

      if (!user.emailVerified) {
        auth().signOut();
        throw new Error('Email is not verified. Please verify your email.');
      }
      console.log(response);

      if (Platform.OS == 'android') {
        ToastAndroid.show('Successfully logged in', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.log(error);

      if (
        error.message === 'Email is not verified. Please verify your email.'
      ) {
        Alert.alert('Alert!', error.message);
      } else {
        Alert.alert(
          'Sign In Failed!',
          "Please check your email and password and try again. If you've forgotten your password, you can reset it using the 'Forgot Password?'",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const onForgotPasswordPressed = () => {
    navigation.navigate(ROUTES.FORGOT);
  };

  const onSignUpPressed = () => {
    navigation.navigate(ROUTES.REGISTER);
  };

  // social login

  const onGoogleLoginPressed = async () => {
    console.log('google clicked');

    try {
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
      // Get the users ID token
      const {idToken} = await GoogleSignin.signIn();

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign-in the user with the credential
      await auth().signInWithCredential(googleCredential);

      if (Platform.OS === 'android') {
        ToastAndroid.show('Successfully logged in', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.log(error);

      Alert.alert('Error', 'Failed to sign in with Google');
    }
  };

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.root}>
        <Image
          source={IMAGES.logo}
          style={[styles.logo, {height: height * 0.3}]}
          resizeMode="contain"
        />

        <AuthInput placeholder="Email" value={email} setValue={setEmail} />

        <AuthInput
          placeholder="Password"
          value={password}
          setValue={setPassword}
          secureTextEntry
          onSubmitEditing={onLoginPressed}
          autoCapitalize={'none'}
        />

        <Text style={styles.forgotPassword} onPress={onForgotPasswordPressed}>
          Forgot Password?
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#0000FF" />
        ) : (
          <>
            <AuthButton text="Login" onPress={onLoginPressed} />
          </>
        )}

        <View style={styles.container}>
          <View style={styles.line} />
          <View>
            <Text style={styles.lineText}>or login using</Text>
          </View>
          <View style={styles.line} />
        </View>

        <View style={styles.container}>
          <Pressable
            onPress={onGoogleLoginPressed}
            style={[styles.socialLoginButton]}>
            <Image
              source={IMAGES.google}
              style={[styles.socialLoginImage, {height: height * 0.3}]}
            />
          </Pressable>
        </View>

        <View style={styles.footer}>
          <View style={styles.signUpContainer}>
            <Text>Don't have an account? </Text>
            <TouchableOpacity onPress={onSignUpPressed} activeOpacity={0.8}>
              <Text style={[styles.signUp, styles.createAccount]}>
                Create One.
              </Text>
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

  logo: {
    width: '70%',
    maxWidth: 300,
    maxHeight: 200,
  },

  forgotPassword: {
    alignSelf: 'flex-end',
    color: '#176B87',
    marginTop: -10,
  },

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

export default Login;
