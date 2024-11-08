import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableHighlight,
  Modal,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCode from 'react-native-qrcode-svg'; // Import QRCode generator
import {Dropdown} from 'react-native-element-dropdown'; // Import the Dropdown component

import moment from 'moment';

const Payment = props => {
  const {navigation} = props;
  const focus = useIsFocused();

  const [busType, setBusType] = useState(null);
  const [fareData, setFareData] = useState(null);
  const [selectedOrigin, setSelectedOrigin] = useState(null);
  const [selectedOriginIndex, setSelectedOriginIndex] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null); // State for destination
  const [selectedDestinationIndex, setSelectedDestinationIndex] =
    useState(null); // New state for destination index

  const [cancelButton, setCancelButton] = useState(false);

  const [travelDistance, setTravelDistance] = useState(null); // New state to store travel distance

  //modal
  const [qrCodeData, setQrCodeData] = useState(null); // Use this for QR code data
  const [modalVisible, setModalVisible] = useState(false);
  const [token, setToken] = useState(null);

  const [loadingVisible, setLoadingVisible] = useState(false);

  // bus data
  const [routeName, setRouteName] = useState(null);
  const [busData, setBusData] = useState(null);

  // fare
  const [passengerType, setPassengerType] = useState('Regular');
  const [fareAmount, setFareAmount] = useState(0);

  const fareStart = busType === 'Aircon' ? 15 : 13;
  const fareIncrement = busType === 'Aircon' ? 3 : 2;

  // fare amount
  useEffect(() => {
    if (travelDistance !== null) {
      const fare =
        travelDistance <= 4
          ? fareStart
          : fareStart + fareIncrement * (travelDistance - 4);

      if (passengerType === 'Discount') {
        setFareAmount(fare * 0.8);
      } else {
        setFareAmount(fare);
      }
    }
  }, [travelDistance, passengerType]);

  useEffect(() => {
    if (focus) {
      loadSavedOrigin();
      setSelectedOriginIndex(null);
      setSelectedDestination(null);
      setCancelButton(false);
    }

    const fetchFareData = async () => {
      const data = await loadFare();
      setFareData(data);
    };

    const fetchBusType = async () => {
      const type = await loadBusType();
      setBusType(type);
    };

    const fetchBusData = async () => {
      const data = await loadBusData();
      setBusData(data);
    };

    const fetchRouteData = async () => {
      const data = await loadRouteData();
      setRouteName(data);
    };

    fetchFareData();
    fetchBusType();
    fetchBusData();
    fetchRouteData();
  }, [focus]);

  // Load fare and bus type data
  const loadBusType = async () => {
    try {
      return await AsyncStorage.getItem('bus-type');
    } catch (error) {
      console.error('error fetching bus type: ', error);
    }
  };

  const loadFare = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('fare-data');
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error fetching fare data: ', error);
    }
  };

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

  // Calculate distance for navigation
  const calculateDistance = (destinationIndex, place) => {
    const originKM = fareData.kmPlace[selectedOriginIndex].distance;
    const destinationKM = fareData.kmPlace[destinationIndex].distance;

    if (destinationKM - originKM < 0) {
      setTravelDistance(originKM - destinationKM);
    } else {
      setTravelDistance(destinationKM - originKM);
    }
  };

  // remember the choice
  const loadSavedOrigin = async () => {
    try {
      const savedOriginIndex = await AsyncStorage.getItem(
        'selected-origin-index',
      );
      const savedOrigin = await AsyncStorage.getItem('selected-origin');

      if (savedOriginIndex !== null && savedOrigin !== null) {
        setSelectedOriginIndex(Number(savedOriginIndex));
        setSelectedOrigin(savedOrigin);
        setCancelButton(true);
      }
    } catch (error) {
      console.error('Error loading saved origin: ', error);
    }
  };

  const saveSelectedOrigin = async (originIndex, originPlace) => {
    try {
      await AsyncStorage.setItem(
        'selected-origin-index',
        originIndex.toString(),
      );
      await AsyncStorage.setItem('selected-origin', originPlace);
    } catch (error) {
      console.error('Error saving origin: ', error);
    }
  };

  // Handle origin selection
  const onOriginChange = value => {
    const originPlace = fareData.kmPlace[value].place;

    setSelectedOrigin(fareData.kmPlace[value].place);
    setSelectedOriginIndex(value);
    setSelectedDestination(null);
    setSelectedDestinationIndex(null);
    setCancelButton(true);

    setTravelDistance(null);

    saveSelectedOrigin(value, originPlace);
  };

  const onDestinationChange = value => {
    if (value > selectedOriginIndex) {
      const destinationPlace = fareData.kmPlace[value].place;
      setSelectedDestination(destinationPlace);
      setSelectedDestinationIndex(value);
      calculateDistance(value, destinationPlace);
    }
  };

  // Handle cancel action
  const onCancelClick = () => {
    setSelectedOrigin(null);
    setSelectedOriginIndex(null);
    setSelectedDestination(null);
    setSelectedDestinationIndex(null);
    setCancelButton(false);

    AsyncStorage.removeItem('selected-origin-index');
    AsyncStorage.removeItem('selected-origin');
  };

  // reference

  const generateReferenceNumber = async () => {
    const busData = await AsyncStorage.getItem('bus-data');
    if (!busData) {
      throw new Error('Bus data not found');
    }

    const parsedBusData = JSON.parse(busData);
    const busNumber = parsedBusData.bus_number;
    const today = moment().format('DMMMYYYY').toLowerCase();

    const transactionCount = await getTransactionCountForToday();

    const formattedTransactionCount = transactionCount
      .toString()
      .padStart(4, '0');

    const randomNumber = Math.floor(Math.random() * 9000) + 1000;

    const referenceNumber = `bus${busNumber}-${today}-${formattedTransactionCount}-${randomNumber}`;

    console.log('Generated reference number:', referenceNumber);
    return referenceNumber;
  };

  const getTransactionCountForToday = async () => {
    const today = moment().format('YYYY-MM-DD');

    const lastStoredDate = await AsyncStorage.getItem('lastTransactionDate');
    console.log('Today:', today);
    console.log('Last Stored Date:', lastStoredDate);

    if (lastStoredDate !== today) {
      console.log('reset transaction today');
      await AsyncStorage.setItem(`transactions-${today}`, JSON.stringify([]));
      await AsyncStorage.setItem('lastTransactionDate', today);
      return 1;
    }

    const transactions = await AsyncStorage.getItem(`transactions-${today}`);

    let transactionsArray = transactions ? JSON.parse(transactions) : [];

    const transactionCount = transactionsArray.length + 1;

    transactionsArray.push({});

    await AsyncStorage.setItem(
      `transactions-${today}`,
      JSON.stringify(transactionsArray),
    );

    return transactionCount; // Return the incremented transaction count
  };

  const createTransaction = async (data, isCashless = false) => {
    setLoadingVisible(true); // Show loading modal

    const referenceNumber = data
      ? data.reference_number
      : await generateReferenceNumber();

    console.log(data);
    console.log('Generated or Provided Reference Number:', referenceNumber);

    const receipt = {
      bus_id: busData.bus_id,
      bus_type: busType,
      bus_number: busData.bus_number,
      bus_driver_name: busData.bus_driver_name,
      conductor_name: busData.conductor_name || 'N/A',
      conductor_id: busData.conductor_id || 'N/A',
      route_name: routeName,
      origin: selectedOrigin,
      destination: selectedDestination,
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
      if (isCashless) {
        await firestore()
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
      const referenceNumber = await generateReferenceNumber();

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
    console.log(' iam here');
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
      {/* Ensure fareData and kmPlace exist before rendering the FlatList */}
      {fareData && fareData.kmPlace ? (
        <View style={styles.container}>
          <View style={styles.dropdownContainer}>
            <Text style={styles.label}>Select Origin:</Text>
            <Dropdown
              style={styles.dropdown}
              data={fareData.kmPlace.map((item, index) => ({
                label: item.place,
                value: index,
              }))}
              labelField="label"
              valueField="value"
              value={selectedOriginIndex}
              onChange={item => onOriginChange(item.value)}
              placeholder="Select Origin"
              searchPlaceholder="Search"
              search={true}
              itemTextStyle={styles.textStyle}
            />
            <Text style={styles.label}>Select Destination:</Text>
            <Dropdown
              style={styles.dropdown}
              data={
                selectedOriginIndex !== null
                  ? fareData.kmPlace
                      .filter((_, index) => index > selectedOriginIndex) // Filter items for destination
                      .map((item, index) => ({
                        label: item.place,
                        value: index + selectedOriginIndex + 1, // Adjust index for filtered data
                      }))
                  : [] // No options if origin is not selected
              }
              labelField="label"
              valueField="value"
              value={selectedDestinationIndex}
              onChange={
                selectedOriginIndex !== null
                  ? item => onDestinationChange(item.value)
                  : null
              }
              placeholder={
                selectedOriginIndex === null
                  ? 'Select Origin First'
                  : 'Select Destination'
              }
              searchPlaceholder="Search"
              search={true}
              itemTextStyle={styles.textStyle}
            />
            {(selectedDestination && travelDistance !== null && (
              <View>
                <View style={styles.paymentInfoBox}>
                  <Text style={styles.paymentInfoText}>
                    Bus Type: {busType}
                  </Text>
                  <Text style={styles.paymentInfoText}>
                    Travel Distance: {travelDistance} km
                  </Text>
                  <Text style={styles.paymentInfoText}>
                    Fare Amount: ₱{fareAmount.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.radioGroup}>
                  <TouchableHighlight
                    style={styles.radioButtonContainer}
                    onPress={() => setPassengerType('Regular')}
                    underlayColor="#ddd">
                    <View style={styles.radioButton}>
                      <View
                        style={[
                          styles.radioInner,
                          passengerType === 'Regular' &&
                            styles.radioInnerSelected,
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
                          passengerType === 'Discount' &&
                            styles.radioInnerSelected,
                        ]}
                      />
                      <Text style={styles.radioText}>PWD/Student/Senior</Text>
                    </View>
                  </TouchableHighlight>
                </View>

                <TouchableOpacity
                  style={styles.ticketButton}
                  onPress={createQRTransaction}>
                  <Text style={styles.ticketButtonText}>Generate QR</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.ticketButton}
                  onPress={() => createTransaction()}>
                  <Text style={styles.ticketButtonText}>Cash Transaction</Text>
                </TouchableOpacity>
              </View>
            )) || (
              <View style={styles.paymentInfoBox}>
                <Text style={styles.paymentInfoText}>
                  After selecting the origin and destination, the fare amount is
                  calculated based on the travel distance. Be sure to accept the
                  cash payment before pressing "Cash Transaction" as it will be
                  recorded as a complete transaction.
                </Text>
              </View>
            )}
          </View>

          {selectedOrigin !== null && (
            <View style={styles.chosenInfoContainer}>
              <TouchableOpacity
                onPress={onCancelClick}
                disabled={!cancelButton}
                style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Reset</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <Text>Loading data...</Text> // Show loading text while fetching data
      )}

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
    justifyContent: 'space-between', // Pushes the Cancel button to the bottom
  },
  dropdownContainer: {
    marginBottom: 15, // Adjusted for better spacing
  },
  label: {
    fontSize: 18,
    color: '#333',
    marginVertical: 10,
  },
  dropdown: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  textStyle: {
    color: '#000000',
  },
  paymentInfoBox: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginTop: 20,
    borderRadius: 5,
  },
  paymentInfoText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
    textAlign: 'center',
  },
  chosenInfoContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#cacaca',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10, // Margin to separate from dropdowns
  },
  cancelButtonText: {
    fontSize: 18,
    color: '#333',
  },

  // radio
  radioGroup: {
    marginTop: 20,
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

  // button
  ticketButton: {
    backgroundColor: '#176B87',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ticketButtonText: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  // modal

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
export default Payment;
