import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Dropdown} from 'react-native-element-dropdown'; // Import the Dropdown component
import {ROUTES} from '../../../constants/';

const Payment = props => {
  const {navigation} = props;
  const focus = useIsFocused();

  const [busType, setBusType] = useState(null);
  const [fareData, setFareData] = useState(null);
  const [selectedOrigin, setSelectedOrigin] = useState(null);
  const [selectedOriginIndex, setSelectedOriginIndex] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null); // State for destination
  const [cancelButton, setCancelButton] = useState(false);

  useEffect(() => {
    if (focus) {
      loadSavedOrigin();
      setSelectedOriginIndex(null);
      setSelectedDestination(null); // Reset destination when focused
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

    fetchFareData();
    fetchBusType();
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

  // Calculate distance for navigation
  const calculateDistance = (destinationIndex, place) => {
    const originKM = fareData.kmPlace[selectedOriginIndex].distance;
    const destinationKM = fareData.kmPlace[destinationIndex].distance;

    const travelDistance = destinationKM - originKM;

    navigation.navigate(ROUTES.PAYMENTCONFIRMATION, {
      travelDistance,
      busType,
      selectedOrigin,
      place,
    });
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
    setSelectedDestination(null); // Reset destination selection
    setCancelButton(true);

    saveSelectedOrigin(value, originPlace);
  };

  // Handle destination selection
  const onDestinationChange = value => {
    if (value > selectedOriginIndex) {
      calculateDistance(value, fareData.kmPlace[value].place);
    }
  };

  // Handle cancel action
  const onCancelClick = () => {
    setSelectedOrigin(null);
    setSelectedOriginIndex(null);
    setSelectedDestination(null);
    setCancelButton(false);

    AsyncStorage.removeItem('selected-origin-index');
    AsyncStorage.removeItem('selected-origin');
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
              value={selectedDestination}
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

            {/* New Box for Payment Description */}
            <View style={styles.paymentInfoBox}>
              <Text style={styles.paymentInfoText}>
                After selecting your origin and destination, the payment is
                calculated based on the travel distance. You will be redirected
                to the payment confirmation page, where you can review the
                details before proceeding.
              </Text>
            </View>
          </View>

          {selectedOrigin !== null && (
            <View style={styles.chosenInfoContainer}>
              <TouchableOpacity
                onPress={onCancelClick}
                disabled={!cancelButton}
                style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <Text>Loading data...</Text> // Show loading text while fetching data
      )}
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
});
export default Payment;
