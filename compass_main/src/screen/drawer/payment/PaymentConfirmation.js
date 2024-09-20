import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  useWindowDimensions,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  Modal,
  ActivityIndicator,
} from 'react-native';

import firestore from '@react-native-firebase/firestore';

import AsyncStorage from '@react-native-async-storage/async-storage';

const PaymentConfirmation = ({route}) => {
  const {travelDistance, busType, selectedOrigin, place} = route.params;
  const {height} = useWindowDimensions();

  const fareStart = busType === 'Aircon' ? 15 : 13;
  const fareIncrement = busType === 'Aircon' ? 3 : 2;

  const [passengerType, setPassengerType] = useState('regular');
  const [fareAmount, setFareAmount] = useState(0);

  const [routeName, setRouteName] = useState(null);
  const [busData, setBusData] = useState(null);

  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [loadingVisible, setLoadingVisible] = useState(false);

  const calculatedFare =
    travelDistance <= 4
      ? fareStart
      : fareStart + fareIncrement * (travelDistance - 4);

  useEffect(() => {
    if (passengerType === 'discount') {
      setFareAmount(calculatedFare * 0.8);
      return;
    }

    setFareAmount(calculatedFare);
  }, [passengerType]);

  useEffect(() => {
    const fetchBusData = async () => {
      const data = await loadBusData();
      setBusData(data);
    };

    const fetchRouteData = async () => {
      const data = await loadRouteData();
      setRouteName(data);
    };

    fetchBusData();
    fetchRouteData();
  }, []); // Add focus as a dependency

  const loadRouteData = async () => {
    try {
      return await AsyncStorage.getItem('route-data');
    } catch (error) {
      console.error('error fetching bus type: ', error);
    }
  };

  const loadBusData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('bus-data');
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error fetching fare data: ', error);
    }
  };

  const generateReferenceNumber = () => {
    return Math.floor(Math.random() * 1000000000);
  };

  const createTransaction = async () => {
    setLoadingVisible(true); // Show loading modal

    const referenceNumber = generateReferenceNumber();

    const receipt = {
      bus_type: busType,
      bus_number: busData.bus_number,
      bus_driver_name: busData.bus_driver_name,
      route_name: routeName,
      origin: selectedOrigin,
      destination: place,
      passenger_type: passengerType,
      payment_type: 'Cash',
      reference_number: referenceNumber,
      fare_amount: fareAmount.toFixed(2),
      timestamp: firestore.FieldValue.serverTimestamp(),
    };

    console.log(receipt);

    try {
      await firestore().collection('transactions').add(receipt);
      console.log('Transaction synced to Firestore');
    } catch (error) {
      console.error('Error syncing transaction:', error);
    } finally {
      setLoadingVisible(false); // Hide loading modal
    }
  };

  const createQRTransaction = () => {
    setQrCodeUrl('static_qr_code_url'); // Replace with actual QR code URL
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.container}>
        <Text style={styles.text}>Bus Type: {busType}</Text>
        <Text style={styles.text}>Origin: {selectedOrigin}</Text>
        <Text style={styles.text}>Destination: {place}</Text>
        {/* Type of Passenger */}
        <View style={styles.sectionContainer}>
          <View style={styles.radioGroup}>
            <TouchableHighlight
              style={styles.radioButtonContainer}
              onPress={() => setPassengerType('regular')}
              underlayColor="#ddd">
              <View style={styles.radioButton}>
                <View
                  style={[
                    styles.radioInner,
                    passengerType === 'regular' && styles.radioInnerSelected,
                  ]}
                />
                <Text style={styles.radioText}>Regular</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight
              style={styles.radioButtonContainer}
              onPress={() => setPassengerType('discount')}
              underlayColor="#ddd">
              <View style={styles.radioButton}>
                <View
                  style={[
                    styles.radioInner,
                    passengerType === 'discount' && styles.radioInnerSelected,
                  ]}
                />
                <Text style={styles.radioText}>PWD/Student/Senior</Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>

        {/* Ticket Amount Button */}
        <TouchableOpacity
          style={styles.ticketButton}
          onPress={createQRTransaction}>
          <Text style={styles.ticketButtonText}>Generate QR</Text>
        </TouchableOpacity>

        {/* Ticket Amount Button */}
        <TouchableOpacity
          style={styles.ticketButton}
          onPress={createTransaction}>
          <Text style={styles.ticketButtonText}>
            Ticket Amount: ₱{fareAmount.toFixed(2)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* QR Code Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalView}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Your QR Code</Text>
            <View style={styles.qrCodeContainer}>
              <Text>QRPH (need gcash permit)</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Loading Modal */}
      <Modal animationType="none" transparent={true} visible={loadingVisible}>
        <View style={styles.modalView}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.modalText}>Processing your transaction...</Text>
          </View>
        </View>
      </Modal>
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

  ticketButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ticketButtonText: {
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Optional for dim effect
  },
  modalContent: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
  },
  qrCodeContainer: {
    marginBottom: 15,
  },
  closeButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default PaymentConfirmation;
