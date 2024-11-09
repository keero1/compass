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
  Alert,
} from 'react-native';

import moment from 'moment';

import auth from '@react-native-firebase/auth';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {useIsFocused} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import {Dropdown} from 'react-native-element-dropdown'; // Import the Dropdown component
import {ROUTES} from '../../constants';

const AdvancePayment = props => {
  const {navigation, route} = props;
  // Destructure busId and routeId from route.params
  const {busId, routeId, currentCoordinates} = route.params || {};

  const userId = auth().currentUser.uid;
  const userName = auth().currentUser.displayName;

  const focus = useIsFocused();

  // bus data
  const [busType, setBusType] = useState(null);
  const [fareData, setFareData] = useState(null);
  const [selectedOrigin, setSelectedOrigin] = useState(null);
  const [selectedOriginIndex, setSelectedOriginIndex] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null); // State for destination
  const [selectedDestinationIndex, setSelectedDestinationIndex] =
    useState(null); // New state for destination index

  const [cancelButton, setCancelButton] = useState(false);

  const [travelDistance, setTravelDistance] = useState(null); // New state to store travel distance

  const [loadingVisible, setLoadingVisible] = useState(false);

  const [routeName, setRouteName] = useState(null);
  const [busData, setBusData] = useState(null);

  const [passengerType, setPassengerType] = useState('Regular');

  const [fareAmount, setFareAmount] = useState(0);

  const fareStart = busType === 'Aircon' ? 15 : 13;
  const fareIncrement = busType === 'Aircon' ? 3 : 2;

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
      setSelectedOriginIndex(null);
      setSelectedDestination(null);
      setCancelButton(false);
      fetchBusData();
      fetchFareData();
      fetchRouteData();
    }
  }, [focus]);

  const fetchBusData = async () => {
    try {
      const busDoc = await firestore().collection('buses').doc(busId).get();
      if (busDoc.exists) {
        const busDataFetched = busDoc.data(); // Store entire bus data, including busType
        setBusData(busDataFetched); // Update state with fetched data
        setBusType(busDataFetched.bus_type); // Set busType directly from fetched data
      } else {
        console.error('No bus document found!');
      }
    } catch (error) {
      console.error('Error fetching bus data: ', error);
    }
  };

  const fetchFareData = async () => {
    try {
      const fareDoc = await firestore()
        .collection('busLocation')
        .doc(busId)
        .get();
      if (fareDoc.exists) {
        setFareData(fareDoc.data().fare_data);
      } else {
        console.error('No fare document found!');
      }
    } catch (error) {
      console.error('Error fetching fare data: ', error);
    }
  };

  const fetchRouteData = async () => {
    try {
      const routeDoc = await firestore()
        .collection('routes')
        .doc(routeId)
        .get();
      if (routeDoc.exists) {
        setRouteName(routeDoc.data().route_name);
      } else {
        console.error('No route document found!');
      }
    } catch (error) {
      console.error('Error fetching route data: ', error);
    }
  };

  const calculateDistance = (destinationIndex, place) => {
    const originKM = fareData.kmPlace[selectedOriginIndex].distance;
    const destinationKM = fareData.kmPlace[destinationIndex].distance;

    if (destinationKM - originKM < 0) {
      setTravelDistance(originKM - destinationKM);
    } else {
      setTravelDistance(destinationKM - originKM);
    }
  };

  // Handle origin selection
  const onOriginChange = value => {
    setSelectedOrigin(fareData.kmPlace[value].place);
    setSelectedOriginIndex(value);
    setSelectedDestination(null);
    setSelectedDestinationIndex(null);
    setCancelButton(true);

    setTravelDistance(null);
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
  };

  const generateReferenceNumber = async () => {
    const busNumber = busData.bus_number;

    const today = moment().format('DMMMYYYY').toLowerCase();

    const transactionCount = await getTransactionCountForToday();

    const formattedTransactionCount = transactionCount
      .toString()
      .padStart(4, '0');

    const trimmedUserName = userName.replace(/\s+/g, '');

    const referenceNumber = `bus${busNumber}-${today}-${formattedTransactionCount}-${trimmedUserName}`;

    console.log(referenceNumber);

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

  const generateTransactionName = () => {
    // Remove spaces from userName
    const trimmedUserName = userName.replace(/\s+/g, '');

    const currentDateTime = moment().format('DMMMYYYY').toLowerCase();

    const transactionName = `${trimmedUserName}.${currentDateTime}`;

    console.log(transactionName);

    return transactionName;
  };

  const createTransaction = async data => {
    setLoadingVisible(true);

    const referenceNumber = data
      ? data.reference_number
      : await generateReferenceNumber();

    console.log('Generated or Provided Reference Number:', referenceNumber);

    const receipt = {
      transactionName: `${generateTransactionName()}`,
      bus_id: busId,
      bus_type: busType,
      bus_number: busData.bus_number,
      bus_driver_name: busData.bus_driver_name,
      ...(busData.conductor_name && {conductor_name: busData.conductor_name}),
      route_name: routeName,
      origin: selectedOrigin,
      destination: selectedDestination,
      passenger_type: passengerType,
      passenger_id: userId,
      payment_type: 'Cashless', // Always cashless
      reference_number: referenceNumber,
      fare_amount: fareAmount.toFixed(2),
      distance: travelDistance,
      timestamp: firestore.FieldValue.serverTimestamp(),
      coordinates: currentCoordinates,
      type: 'AdvancePayment',
      status: 'onHold',
      triggered: false,
      triggeredApp: false,
    };

    console.log(receipt);

    try {
      const querySnapshot = await firestore()
        .collection('advancePayment')
        .where('passenger_id', '==', receipt.passenger_id)
        .where('status', '==', 'onHold')
        .get();

      if (!querySnapshot.empty) {
        Alert.alert(
          'Transaction Alert',
          'You already have an ongoing transaction. Please complete or cancel it before creating a new one.',
          [{text: 'OK'}],
          {cancelable: false},
        );
        return;
      }

      await firestore().collection('advancePayment').add(receipt);
      console.log('Transaction successfully saved!', receipt);
      ToastAndroid.show('Transaction successfully saved!', ToastAndroid.SHORT);

      navigation.replace(ROUTES.ADVANCEPAYMENTHISTORY);
    } catch (error) {
      console.error('Error saving transaction: ', error);
      ToastAndroid.show(
        'Failed to save transaction. Please try again.',
        ToastAndroid.SHORT,
      );
    } finally {
      setLoadingVisible(false);
    }
  };

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
                  style={styles.proceedButton}
                  onPress={() => createTransaction()}>
                  <Text style={styles.proceedButtonText}>Proceed</Text>
                </TouchableOpacity>
              </View>
            )) || (
              <View style={styles.paymentInfoBox}>
                <Text style={styles.paymentInfoText}>
                  Please ensure the correct origin and passenger type, as your
                  coordinates will be recorded. Misrepresentation may void the
                  transaction, which is not easily reversed once completed.
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
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Fare Data not Found!</Text>
        </View>
      )}
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

  proceedButton: {
    backgroundColor: '#176B87',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  proceedButtonText: {
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

  noDataContainer: {
    flex: 1, // Allow the container to take up available space
    justifyContent: 'center', // Center vertically
    alignItems: 'center', // Center horizontally
  },

  noDataText: {
    fontSize: 18, // Adjust font size as needed
    color: '#333', // Change the text color if needed
    textAlign: 'center', // Center align the text
  },
});

export default AdvancePayment;
