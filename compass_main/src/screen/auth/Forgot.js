import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';

import {useNavigation} from '@react-navigation/native';

// custom
import CustomInput from '../../components/inputs/CustomInput';
import CustomButton from '../../components/inputs/CustomButton';

const Forgot = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = () => {};

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.root}>
        <Text style={styles.title}>Forgot Password</Text>

        <Text style={styles.subtitle}>
          Please enter your Username and Phone Number to request to reset password.
        </Text>

        <CustomInput placeholder="Name" value={name} setValue={setName} />
        <CustomInput
          placeholder="Number"
          value={phoneNumber}
          setValue={setPhoneNumber}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#0000FF" />
        ) : (
          <CustomButton text="Submit" onPress={handleResetPassword} />
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
