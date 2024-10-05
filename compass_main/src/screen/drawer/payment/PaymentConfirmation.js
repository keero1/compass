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
  ToastAndroid,
  Platform,
} from 'react-native';

import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCode from 'react-native-qrcode-svg'; // Import QRCode generator

const PaymentConfirmation = ({route}) => {
  const {travelDistance, busType, selectedOrigin, place} = route.params;
  const {height} = useWindowDimensions();

  const fareStart = busType === 'Aircon' ? 15 : 13;
  const fareIncrement = busType === 'Aircon' ? 3 : 2;

  const [passengerType, setPassengerType] = useState('Regular');
  const [fareAmount, setFareAmount] = useState(0);

  const [routeName, setRouteName] = useState(null);
  const [busData, setBusData] = useState(null);

  const [qrCodeData, setQrCodeData] = useState(null); // Use this for QR code data
  const [modalVisible, setModalVisible] = useState(false);
  const [token, setToken] = useState(null);

  const [loadingVisible, setLoadingVisible] = useState(false);

  const calculatedFare =
    travelDistance <= 4
      ? fareStart
      : fareStart + fareIncrement * (travelDistance - 4);

  useEffect(() => {
    if (passengerType === 'Discount') {
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
  }, []);

  // load data

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

  // reference

  const generateReferenceNumber = () => {
    return Math.floor(Math.random() * 1000000000);
  };

  const createTransaction = async (data, isCashless = false) => {
    setLoadingVisible(true); // Show loading modal

    const referenceNumber = data
      ? data.reference_number
      : generateReferenceNumber();

    console.log(data);

    const receipt = {
      bus_id: busData.bus_id,
      bus_type: busType,
      bus_number: busData.bus_number,
      bus_driver_name: busData.bus_driver_name,
      route_name: routeName,
      origin: selectedOrigin,
      destination: place,
      passenger_type: passengerType,
      passenger_id: data ? data.passenger_id : null,
      payment_type: isCashless ? 'Cashless' : 'Cash',
      reference_number: referenceNumber,
      fare_amount: fareAmount.toFixed(2),
      distance: travelDistance,
      timestamp: firestore.FieldValue.serverTimestamp(),
    };

    console.log(receipt);

    try {
      await firestore().collection('transactions').add(receipt);
      console.log('Transaction synced to Firestore');
      console.log(busData.company_id);
      if (isCashless) {
        await firestore()
          .collection('company')
          .doc(busData.company_id)
          .collection('wallet')
          .doc('wallet')
          .update({
            balance: firestore.FieldValue.increment(+fareAmount),
            last_updated: firestore.FieldValue.serverTimestamp(),
          });
        console.log('company wallet updated successfully in sub-collection');
      }
    } catch (error) {
      console.error('Error syncing transaction and company wallet:', error);
    } finally {
      setLoadingVisible(false); // Hide loading modal
      if (Platform.OS == 'android') {
        ToastAndroid.show('Transaction Success!', ToastAndroid.SHORT);
      }
      if (token) {
        await deleteToken(token);
        setToken(null);
      }
    }
  };

  const createQRTransaction = async () => {
    setLoadingVisible(true);

    try {
      const referenceNumber = generateReferenceNumber();

      const newTokenDoc = await firestore().collection('tokens').add({
        passenger_id: null,
        fare_amount: null,
        reference_number: null,
      });

      const qrData = {
        bus_driver_name: busData.bus_driver_name,
        fare_amount: fareAmount.toFixed(2),
        reference_number: referenceNumber,
        token: newTokenDoc.id,
      };

      setToken(newTokenDoc.id);

      setQrCodeData(JSON.stringify(qrData));
      setModalVisible(true);
    } catch (error) {
      console.error('Something went wrong', error);
    } finally {
      setLoadingVisible(false); // Hide loading modal
    }
  };

  const deleteToken = async tokenId => {
    try {
      await firestore().collection('tokens').doc(tokenId).delete();
    } catch (error) {
      console.error('Error deleting token:', error);
    }
  };

  useEffect(() => {
    let intervalId; // Store the interval ID

    if (token) {
      intervalId = setInterval(async () => {
        try {
          const doc = await firestore().collection('tokens').doc(token).get();
          if (doc.exists) {
            const data = doc.data();
            // Check if fare_amount and reference_number have been updated
            if (
              data.passenger_id !== null &&
              data.fare_amount !== null &&
              data.reference_number !== null
            ) {
              ToastAndroid.show('Processing payment...', ToastAndroid.SHORT);
              createTransaction(data, true);
              setModalVisible(false); // Close the modal after processing
            }
          }
        } catch (error) {
          console.error('Error fetching document:', error);
        }
      }, 5000); // Random interval between 3-5 seconds

      // Cleanup function to clear the interval
      return () => clearInterval(intervalId);
    }
  }, [token]);

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.container}>
        <Text style={styles.text}>Bus Type: {busType}</Text>
        <Text style={styles.text}>Origin: {selectedOrigin}</Text>
        <Text style={styles.text}>Destination: {place}</Text>
        <Text style={styles.text}>Distance: {travelDistance}</Text>
        {/* Type of Passenger */}
        <View style={styles.sectionContainer}>
          <View style={styles.radioGroup}>
            <TouchableHighlight
              style={styles.radioButtonContainer}
              onPress={() => setPassengerType('Regular')}
              underlayColor="#ddd">
              <View style={styles.radioButton}>
                <View
                  style={[
                    styles.radioInner,
                    passengerType === 'Regular' && styles.radioInnerSelected,
                  ]}
                />
                <Text style={styles.radioText}>Regular</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight
              style={styles.radioButtonContainer}
              onPress={() => setPassengerType('Discount')}
              underlayColor="#ddd">
              <View style={styles.radioButton}>
                <View
                  style={[
                    styles.radioInner,
                    passengerType === 'Discount' && styles.radioInnerSelected,
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
          onPress={() => createTransaction()}>
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
              {/* Generate and display the QR code */}
              {qrCodeData && (
                <QRCode
                  value={qrCodeData} // QR code data containing bus ID and fare amount
                  size={200}
                />
              )}
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
  text: {
    fontSize: 18,
    marginVertical: 10,
    color: '#333',
  },
  sectionContainer: {
    marginVertical: 20,
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
    backgroundColor: '#176B87',
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
    backgroundColor: '#176B87',
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
