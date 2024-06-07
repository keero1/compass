import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import auth from '@react-native-firebase/auth'; // If using Firebase

// custom
import AuthInput from '../../components/auth/AuthInput';
import AuthButton from '../../components/auth/AuthButton';

const Forgot = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const onResetPasswordPressed = async () => {
    setLoading(true);

    try {
      if (!email.trim()) {
        throw new Error('Please enter your email.');
      }

      await auth().sendPasswordResetEmail(email.trim());
      Alert.alert(
        'Password Reset Email Sent',
        'Please check your email to reset your password.',
      );
      navigation.goBack(); // Navigate back to login screen or any appropriate screen
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.root}>
        <Text style={styles.title}>Forgot Password</Text>

        <Text style={styles.subtitle}>
          Please enter your email address to reset your password.
        </Text>

        <AuthInput
          placeholder="Email" value={email} setValue={setEmail}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#0000FF" />
        ) : (
          <AuthButton text="Reset Password" onPress={onResetPasswordPressed} />
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
});

export default Forgot;
