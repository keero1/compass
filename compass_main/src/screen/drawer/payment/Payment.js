import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {useWindowDimensions} from 'react-native';
import {useIsFocused} from '@react-navigation/native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {ROUTES} from '../../../constants/';

const Payment = props => {
  const {navigation} = props;
  const {height} = useWindowDimensions();
  const focus = useIsFocused();

  const numColumns = 2;

  const [busType, setBusType] = useState(null);

  const [fareData, setFareData] = useState(null);
  const [selectedOrigin, setSelectedOrigin] = useState(null);
  const [selectedOriginIndex, setSelectedOriginIndex] = useState(null);

  const [cancelButton, setCancelButton] = useState(false);

  useEffect(() => {
    if (focus) {
      setSelectedOrigin(null);
      setSelectedOriginIndex(null);
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
  }, [focus]); // Add focus as a dependency

  // load fare

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

  // calculate
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

  const onPlaceClick = (place, index) => {
    if (selectedOrigin === null) {
      if (fareData.kmPlace.length - 1 === index) {
        return;
      }
      setSelectedOriginIndex(index);
      setSelectedOrigin(place);
      setCancelButton(true);

      return;
    }

    if (selectedOriginIndex === index || index < selectedOriginIndex) {
      return;
    }

    calculateDistance(index, place);
  };

  const onCancelClick = () => {
    // Handle cancel action here
    setSelectedOrigin(null);
    setSelectedOriginIndex(null);
    setCancelButton(false);
  };

  return (
    <SafeAreaView style={styles.main}>
      {/* Ensure fareData and kmPlace exist before rendering the FlatList */}
      {fareData && fareData.kmPlace ? (
        <FlatList
          data={fareData.kmPlace} // Access the kmPlace array
          style={styles.list}
          keyExtractor={(item, index) => index.toString()}
          numColumns={numColumns} // Set the number of columns
          columnWrapperStyle={styles.row} // Style for the row
          renderItem={({item, index}) => (
            <TouchableOpacity
              style={styles.placeButton}
              onPress={() => onPlaceClick(item.place, index)}>
              <Text style={styles.buttonText}>{item.place}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text>Loading data...</Text> // Show loading text while fetching data
      )}

      {/* Display "Select Origin" or "Origin: {place name}" and "Cancel" */}
      <View style={styles.chosenInfoContainer}>
        <View style={styles.selectBox}>
          <Text style={styles.selectText}>
            {selectedOrigin ? `Origin: ${selectedOrigin}` : 'Select Origin'}
          </Text>
          {selectedOrigin && (
            <Text style={styles.selectText}>Select Destination</Text>
          )}
        </View>

        <TouchableOpacity
          onPress={onCancelClick}
          disabled={!cancelButton}
          style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>
            {selectedOrigin ? 'Cancel' : ''}
          </Text>
        </TouchableOpacity>
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
  },
  row: {
    flex: 1,
    justifyContent: 'space-between',
    marginBottom: 15, // Add some spacing between rows
  },
  placeButton: {
    flex: 1,
    backgroundColor: '#176B87',
    paddingVertical: 15,
    marginHorizontal: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  chosenInfoContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  selectBox: {
    backgroundColor: '#4CAF50',
    width: '100%',
    marginHorizontal: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#388E3C',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  selectText: {
    padding: 10,
    fontSize: 18,
    color: '#333',
  },
  cancelButton: {
    backgroundColor: '#cacaca', // Red color for the cancel button
    width: '100%',
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  cancelButtonText: {
    fontSize: 18,
    color: '#333',
  },
});

export default Payment;
