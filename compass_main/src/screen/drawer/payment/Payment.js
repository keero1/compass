import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Dimensions,
  TouchableHighlight,
} from 'react-native';
import {useWindowDimensions} from 'react-native';
import {useIsFocused} from '@react-navigation/native';

const Wallet = props => {
  const {navigation} = props;
  const {height} = useWindowDimensions();
  const focus = useIsFocused();

  const [paymentMethod, setPaymentMethod] = useState('');
  const [selectedPaymentType, setSelectedPaymentType] = useState('regular');
  const [chosenFare, setChosenFare] = useState('11.00 PHP');

  // Generate km and price list dynamically (limited to 100 km)
  const generateKmPriceList = () => {
    const kmPriceList = [];
    let price = 11;
    for (let km = 5; km <= 100; km += 5) {
      kmPriceList.push({km: `${km} km`, price: `${price.toFixed(2)} PHP`});
      price += 9.25;
    }
    return kmPriceList;
  };

  const kmPriceList = generateKmPriceList();

  // Function to handle item press
  const handleItemPress = (km, price) => {
    setChosenFare(price);
  };

  // Default to 5 km on mount
  useEffect(() => {
    const defaultItem = kmPriceList.find(item => item.km === '5 km');
    if (defaultItem) {
      setChosenFare(defaultItem.price);
    }
  }, []);

  return (
    <SafeAreaView style={styles.main}>
      {/* List of KM and Price */}
      <FlatList
        data={kmPriceList}
        style={styles.list}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.kmPriceContainer}
            onPress={() => handleItemPress(item.km, item.price)}>
            <Text style={styles.text}>{item.km}</Text>
            <Text style={styles.text}>{item.price}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Display Chosen Distance and Fare */}
      <View style={styles.chosenInfoContainer}>
        <Text style={styles.sectionTitle}>Fare: {chosenFare}</Text>
      </View>

      {/* Type of Passenger */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Select Type of Passenger</Text>
        <View style={styles.radioGroup}>
          <TouchableHighlight
            style={styles.radioButtonContainer}
            onPress={() => setSelectedPaymentType('regular')}
            underlayColor="#ddd">
            <View style={styles.radioButton}>
              <View
                style={[
                  styles.radioInner,
                  selectedPaymentType === 'regular' &&
                    styles.radioInnerSelected,
                ]}
              />
              <Text style={styles.radioText}>Regular</Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight
            style={styles.radioButtonContainer}
            onPress={() => setSelectedPaymentType('pwd/student/senior')}
            underlayColor="#ddd">
            <View style={styles.radioButton}>
              <View
                style={[
                  styles.radioInner,
                  selectedPaymentType === 'pwd/student/senior' &&
                    styles.radioInnerSelected,
                ]}
              />
              <Text style={styles.radioText}>PWD/Student/Senior</Text>
            </View>
          </TouchableHighlight>
        </View>
      </View>

      {/* Mode of Payment */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Select Mode of Payment</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setPaymentMethod('Cash')}>
            <Text style={styles.buttonText}>Cash</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setPaymentMethod('Cashless')}>
            <Text style={styles.buttonText}>Cashless</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#F4F4FB',
    padding: 20,
    justifyContent: 'space-between',
  },
  list: {
    marginTop: 40,
    maxHeight: Dimensions.get('window').height * 0.5,
  },
  kmPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  chosenInfoContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#176B87',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInnerSelected: {
    backgroundColor: '#176B87',
  },
  radioText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    backgroundColor: '#176B87',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
  },
});

export default Wallet;
