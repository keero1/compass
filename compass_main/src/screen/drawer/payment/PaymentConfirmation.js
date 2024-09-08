import React from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  useWindowDimensions,
  Text,
} from 'react-native';

const PaymentConfirmation = ({route}) => {
  const {chosenFare, selectedPaymentType} = route.params;
  const {height} = useWindowDimensions();

  // Convert fare to number for calculation
  const fareNumber = parseFloat(chosenFare.replace(' PHP', ''));
  const discountedFare =
    selectedPaymentType === 'discount'
      ? (fareNumber * 0.8).toFixed(2)
      : fareNumber.toFixed(2);

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.container}>
        <Text style={styles.text}>Original Fare: {chosenFare}</Text>
        {selectedPaymentType === 'discount' && (
          <Text style={styles.text}>Discounted Fare: {discountedFare} PHP</Text>
        )}
        {selectedPaymentType === 'regular' && (
          <Text style={styles.text}>Fare: {discountedFare} PHP</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#F4F4FB',
    padding: 20,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    marginVertical: 10,
    color: '#333',
  },
});

export default PaymentConfirmation;
