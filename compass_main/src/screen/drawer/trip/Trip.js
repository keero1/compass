import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const Trip = () => {
  const [currentRoute, setCurrentRoute] = useState('Loading...');
  const [kmPlace, setKmPlace] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const userId = auth().currentUser.uid;

  const formatNumber = number => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
    }).format(number);
  };

  useEffect(() => {
    fetchFareData();
    fetchTodayEarnings();
  }, []);

  const fetchFareData = async () => {
    try {
      const fareDataString = await AsyncStorage.getItem('fare-data');
      if (fareDataString) {
        const fareData = JSON.parse(fareDataString);

        if (fareData.kmPlace && fareData.kmPlace.length > 0) {
          const startPlace = fareData.kmPlace[0].place || 'Unknown Start';
          const endPlace =
            fareData.kmPlace[fareData.kmPlace.length - 1].place ||
            'Unknown End';

          setKmPlace(fareData.kmPlace);
          setCurrentRoute(`${startPlace} ↔ ${endPlace}`);
        } else {
          setCurrentRoute('No route data available');
        }
      } else {
        setCurrentRoute('No fare data available');
      }
    } catch (error) {
      console.error('Error fetching fare data: ', error);
      setCurrentRoute('Error loading route data');
    }
  };

  const fetchTodayEarnings = async () => {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      // Fetch transactions for today
      const transactionsSnapshot = await firestore()
        .collection('transactions')
        .where('bus_id', '==', userId)
        .where('timestamp', '>=', startOfDay)
        .get();

      const earningsToday = transactionsSnapshot.docs.reduce((total, doc) => {
        const data = doc.data();
        const fareAmount = parseFloat(data.fare_amount) || 0; // Use parseFloat to convert string to number
        return total + fareAmount;
      }, 0);

      setEarnings(earningsToday);
    } catch (error) {
      console.error("Error fetching today's earnings: ", error);
      setEarnings(0);
    }
  };

  const onSwitchRoutePressed = async () => {
    Alert.alert(
      'Confirm Route Switch',
      'Are you sure you want to switch route?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => {
            modifyRouteData();
          },
        },
      ],
      {cancelable: false},
    );
  };

  const modifyRouteData = async () => {
    if (kmPlace.length > 0) {
      const reversedKmPlace = [...kmPlace].reverse();

      const modifiedFareData = {
        kmPlace: reversedKmPlace,
      };

      try {
        await AsyncStorage.setItem(
          'fare-data',
          JSON.stringify(modifiedFareData),
        );
        console.log('Fare data modified and saved successfully!');

        setKmPlace(reversedKmPlace);

        const newStartPlace =
          kmPlace[kmPlace.length - 1]?.place || 'Unknown Start';
        const newEndPlace = kmPlace[0]?.place || 'Unknown End';

        setCurrentRoute(`${newStartPlace} ↔ ${newEndPlace}`);
      } catch (error) {
        console.error('Error saving modified fare data: ', error);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.infoBox}>
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Current Conductor</Text>
          <Text style={styles.infoText}>None</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Current Route</Text>
          <Text style={styles.infoText}>{currentRoute}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Today's Earnings</Text>
          <Text style={styles.infoText}>{formatNumber(earnings)}</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.leftSideButton}>
          <Text style={styles.leftSideText}>Start Trip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rightSideButton}
          onPress={onSwitchRoutePressed}>
          <Text style={styles.rightSideText}>Switch Route</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  container: {
    flex: 1,
    backgroundColor: '#F4F4FB',
    paddingHorizontal: 20,
  },

  /* Wallet Balance Box */
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: 15,
    borderColor: '#ddd',
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    marginTop: 10,
  },
  infoContainer: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },

  /* Buttons */
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  leftSideButton: {
    backgroundColor: '#176B87',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
  },
  leftSideText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rightSideButton: {
    backgroundColor: '#176B87',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    flex: 1,
  },
  rightSideText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Trip;
