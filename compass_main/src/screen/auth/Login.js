import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  useWindowDimensions,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ToastAndroid,
  Platform,
} from 'react-native';

import IMAGES from '../../constants/images';

import ROUTES from '../../constants/routes';

import CustomInput from '../../components/inputs/CustomInput';
import CustomButton from '../../components/inputs/CustomButton';

import {useNavigation} from '@react-navigation/native';

// firebase
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const Login = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const {height} = useWindowDimensions();

  const onLoginPressed = async () => {
    setLoading(true);
    try {
      // trim the username to avoid whitespace
      const trimmedUsername = username.trim().toLowerCase();

      if (!trimmedUsername || !password) {
        throw new Error();
      }

      const querySnapshot = await firestore()
        .collection('buses')
        .where('username', '==', trimmedUsername)
        .get();

      if (querySnapshot.empty) {
        Alert.alert('Sign In Failed!', 'No user found with this username.');
        setLoading(false);
        return;
      }

      const userDoc = querySnapshot.docs[0].data();
      const email = userDoc.email;

      await auth().signInWithEmailAndPassword(email, password);

      if (Platform.OS == 'android') {
        ToastAndroid.show('Successfully logged in', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.log(error);
      Alert.alert(
        'Sign In Failed!',
        "Please check your username and password and try again. If you've forgotten your password, you can reset it using the 'Forgot Password?'",
      );
    } finally {
      setLoading(false);
    }
  };

  // forgot password

  const onForgotPasswordPressed = () => {
    navigation.navigate(ROUTES.FORGOT);
  };

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.root}>
        <Image
          source={IMAGES.logo}
          style={[styles.logo, {height: height * 0.3}]}
          resizeMode="contain"
        />

        <CustomInput
          placeholder="Username"
          value={username}
          setValue={setUsername}
        />

        <CustomInput
          placeholder="Password"
          value={password}
          setValue={setPassword}
          secureTextEntry
          onSubmitEditing={onLoginPressed}
          autoCapitalize={'none'}
        />

        {/* <Text style={styles.forgotPassword} onPress={onForgotPasswordPressed}>
          Forgot Password?
        </Text> */}

        {loading ? (
          <ActivityIndicator size="large" color="#0000FF" />
        ) : (
          <>
            <CustomButton text="Login" onPress={onLoginPressed} />
          </>
        )}

        <View style={styles.footer}>
          <View style={styles.signUpContainer}>
            <Text>Don't have an account? Ask your Bus Company for one.</Text>
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
