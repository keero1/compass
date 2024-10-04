import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  TextInput,
  Text,
  Animated,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';

import {WebView} from 'react-native-webview';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const CashIn = () => {
  const navigation = useNavigation();

  const [scaleValue] = useState(new Animated.Value(1));
  const [amount, setAmount] = useState('');
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const [lastUrl, setLastUrl] = useState(null);

  const [isCheckout, setIsCheckout] = useState(false);

  const PAYMONGO_PUBLIC_KEY = 'sk_test_yn37ZoMTovacLmDLfYawzFbz'; // wala na ako pake, test api lang naman

  const handleCreatePaymentLink = async () => {
    setLoading(true);
    if (!amount) {
      Alert.alert('Error', 'Please enter an amount');
      setLoading(false);
      return;
    }

    if (amount < 100 || amount > 1000) {
      Alert.alert(
        'Invalid Amount!',
        'Minimum and Maximum amount for cash in is 100 & 1000 PHP',
      );
      setLoading(false);
      return;
    }

    try {
      const data = {
        data: {
          attributes: {
            amount: parseInt(amount) * 100,
            description: `Payment of PHP ${amount}`,
            remarks: 'Cash in remarks',
          },
        },
      };

      const response = await axios.post(
        'https://api.paymongo.com/v1/links',
        data,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Basic ${btoa(`${PAYMONGO_PUBLIC_KEY}:`)}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const paymentLink = response.data.data.attributes.checkout_url;

      if (paymentLink) {
        setPaymentUrl(paymentLink); // Set the payment URL for WebView
      }
    } catch (error) {
      console.error('Error creating payment link:', error);
      Alert.alert('Error', 'Failed to create payment link');
    } finally {
      setLoading(false);
    }
  };

  const onNavigationStateChange = navState => {
    const {url} = navState;
    console.log('Navigated to:', url);

    if (url === lastUrl) return;
    setLastUrl(url);

    setIsCheckout(true);

    // Check if the URL indicates success or failure
    if (url.includes('/success')) {
      updateWallet();
      console.log('Payment succeeded!');
    } else if (url.includes('/failed')) {
      console.log('Payment failed!');
    }
  };

  // update firestore
  const updateWallet = async () => {
    const user = auth().currentUser;

    await firestore()
      .collection('users')
      .doc(user.uid)
      .collection('wallet')
      .doc('wallet')
      .update({
        balance: firestore.FieldValue.increment(+amount),
        last_updated: firestore.FieldValue.serverTimestamp(),
      });
  };

  //animation
  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <>
      {paymentUrl ? (
        <KeyboardAvoidingView
          style={styles.webviewContainer}
          behavior="padding"
          enabled={Platform.OS === 'android'}>
          {isCheckout ? (
            <Pressable
              style={styles.closeButton}
              onPress={() => {
                setPaymentUrl(null);
                navigation.goBack();
              }}>
              <Text style={styles.closeButtonText}>X</Text>
            </Pressable>
          ) : (
            <Pressable
              style={styles.closeButton}
              onPress={() => setPaymentUrl(null)}>
              <Text style={styles.closeButtonText}>X</Text>
            </Pressable>
          )}

          <WebView
            source={{uri: paymentUrl}}
            onNavigationStateChange={onNavigationStateChange}
            style={styles.webview}
            startInLoadingState
          />
        </KeyboardAvoidingView>
      ) : (
        <SafeAreaView style={styles.main}>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder={'Enter Amount from 100-1000 PHP'}
              style={styles.input}
              keyboardType="numeric"
              value={amount}
              onChangeText={text => {
                const numericText = text.replace(/[^0-9]/g, '');
                setAmount(numericText);
              }}
            />
          </View>

          <Animated.View
            style={[
              styles.animatedContainer,
              {
                transform: [{scale: scaleValue}],
              },
            ]}>
            <Pressable
              onPress={handleCreatePaymentLink}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={loading}
              style={({pressed}) => [
                styles.container,
                {
                  backgroundColor: pressed ? '#135266' : '#176B87', // Change background color on press
                },
              ]}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.text}>Next</Text>
              )}
            </Pressable>
          </Animated.View>
        </SafeAreaView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F4F4FB',
  },
  inputContainer: {
    backgroundColor: 'white',
    width: '100%',

    borderColor: '#B2B2B2',
    borderWidth: 1,
    borderRadius: 20,

    paddingHorizontal: 10,

    marginVertical: 10,
  },
  input: {},

  animatedContainer: {
    width: '100%',
    alignItems: 'center',
  },

  container: {
    backgroundColor: '#176B87',

    width: '100%',

    padding: 15,
    marginVertical: 10,

    alignItems: 'center',
    borderRadius: 20,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
  webviewContainer: {
    flex: 1,
    height: '100%',
    width: '100%',
    zIndex: 2,
  },
  webview: {
    flex: 1, // Allow the WebView to take full available height
  },
  closeButton: {
    position: 'absolute',
    top: 20, // Adjust top position
    right: 20, // Adjust left position
    backgroundColor: '#fff', // Background color of the button
    borderRadius: 50, // Make the button round
    padding: 10, // Padding inside the button
    elevation: 5, // Add shadow for Android
    zIndex: 2,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#FF0000', // Color for close button text
  },
});
export default CashIn;
