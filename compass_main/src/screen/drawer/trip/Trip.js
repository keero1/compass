import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Button,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const Trip = () => {
  const [currentRoute, setCurrentRoute] = useState('Loading...');
  const [kmPlace, setKmPlace] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const userId = auth().currentUser.uid;

  // conductor
  const [conductorNameFromFirestore, setConductorNameFromFirestore] =
    useState('None');
  // modal
  const [modalVisible, setModalVisible] = useState(false);
  const [conductorName, setConductorName] = useState('');
  const [conductorUserId, setConductorUserId] = useState('');

  const [transactions, setTransactions] = useState([]);

  const formatNumber = number => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
    }).format(number);
  };

  const formatDate = date => {
    if (!date) return 'Unknown Date'; // Handle cases where timestamp might be null

    const options = {day: 'numeric', month: 'short', year: 'numeric'};
    const timeOptions = {hour: 'numeric', minute: 'numeric', hour12: true};

    const datePart = date.toLocaleDateString('en-US', options); // Example: '23 Sep 2024'
    const timePart = date.toLocaleTimeString('en-US', timeOptions); // Example: '10:37 PM'

    return `${datePart}, ${timePart}`;
  };

  useEffect(() => {
    fetchFareData();
    fetchTodayEarnings();
    fetchTodayTransactions();
  }, []);

  useEffect(() => {
    const fetchConductorName = async () => {
      try {
        const busDoc = await firestore().collection('buses').doc(userId).get();
        if (busDoc.exists) {
          const data = busDoc.data();
          if (data.conductor_name) {
            setConductorNameFromFirestore(data.conductor_name);
          } else {
            setConductorNameFromFirestore('None');
          }
        } else {
          setConductorNameFromFirestore('None');
        }
      } catch (error) {
        console.error('Error fetching conductor name: ', error);
        setConductorNameFromFirestore('None');
      }
    };

    fetchConductorName();
  }, [userId]);

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

  const fetchTodayTransactions = async () => {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const transactionsSnapshot = await firestore()
        .collection('transactions')
        .where('bus_id', '==', userId)
        .where('timestamp', '>=', startOfDay)
        .orderBy('timestamp', 'desc') // Order by timestamp
        .get();

      const todayTransactions = transactionsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          origin: data.origin,
          destination: data.destination,
          fare_amount: data.fare_amount,
          timestamp: data.timestamp ? data.timestamp.toDate() : null,
          bus_driver_name: data.bus_driver_name,
          reference_number: data.reference_number,
        };
      });

      setTransactions(todayTransactions);
    } catch (error) {
      console.error("Error fetching today's transactions: ", error);
      setTransactions([]); // Reset transactions on error
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

  const handleConductorSignIn = async () => {
    try {
      const conductorRef = firestore().collection('conductors');
      const conductorDoc = await conductorRef
        .where('user_id', '==', conductorUserId)
        .get();

      if (!conductorDoc.empty) {
        const conductorData = conductorDoc.docs[0].data();
        const name = conductorData.name;

        // Bind conductor name to current user
        await auth().currentUser.updateProfile({displayName: name});

        // Update buses/userId with conductor_name
        await firestore().collection('buses').doc(userId).set(
          {
            conductor_name: name,
          },
          {merge: true},
        );

        setConductorNameFromFirestore(name);

        Alert.alert('Sign In Successful', `Welcome ${name}`);
        setModalVisible(false);
      } else {
        Alert.alert('Error', 'Conductor not found.');
      }
    } catch (error) {
      console.error('Error signing in conductor: ', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
  };

  const handleConductorSignOut = () => {
    Alert.alert(
      'Confirm Sign Out',
      `Are you sure you want to sign out ${conductorNameFromFirestore}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await firestore().collection('buses').doc(userId).update({
                conductor_name: firestore.FieldValue.delete(),
              });
              setConductorNameFromFirestore('None'); // Reset state
              Alert.alert(
                'Sign Out Successful',
                `${conductorNameFromFirestore} has been signed out.`,
              );
            } catch (error) {
              console.error('Error signing out conductor: ', error);
              Alert.alert(
                'Error',
                'An error occurred while signing out. Please try again.',
              );
            }
          },
        },
      ],
      {cancelable: false},
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.infoBox}>
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Current Conductor</Text>
          <Text style={styles.infoText}>{conductorNameFromFirestore}</Text>
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
        {conductorNameFromFirestore !== 'None' ? (
          <TouchableOpacity
            style={styles.leftSideButton}
            onPress={handleConductorSignOut}>
            <Text style={styles.leftSideText}>Sign Out</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.leftSideButton}
            onPress={() => setModalVisible(true)}>
            <Text style={styles.leftSideText}>Sign In</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.rightSideButton}
          onPress={onSwitchRoutePressed}>
          <Text style={styles.rightSideText}>Switch Route</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.historyTitle}>Today's Transactions</Text>
      <ScrollView style={styles.transactionHistoryBox}>
        {transactions.length > 0 ? (
          transactions.map(transaction => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionRow}>
                <Text style={styles.transactionText}>
                  {transaction.origin} - {transaction.destination}
                </Text>
                <View style={styles.fareContainer}>
                  <Text style={styles.transactionAmount}>
                    {formatNumber(transaction.fare_amount)}{' '}
                  </Text>
                </View>
              </View>
              <Text style={styles.transactionTimestamp}>
                {formatDate(transaction.timestamp)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noTransactionsText}>
            No transactions found for today.
          </Text>
        )}
      </ScrollView>

      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Conductor Sign In</Text>
            <TextInput
              placeholder="Conductor Name"
              value={conductorName}
              onChangeText={setConductorName}
              style={styles.input}
            />
            <TextInput
              placeholder="User ID"
              value={conductorUserId}
              onChangeText={setConductorUserId}
              style={styles.input}
            />
            <View style={styles.buttonRow}>
              <Button
                title="Sign In"
                onPress={handleConductorSignIn}
                color="#176B87"
              />
              <Button
                title="Cancel"
                onPress={() => setModalVisible(false)}
                color="red"
              />
            </View>
          </View>
        </View>
      </Modal>
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

  // transaction
  transactionHistoryBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  noTransactionsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginVertical: 40,
  },
  transactionItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionText: {
    fontSize: 16,
    color: '#555',
    flex: 1,
  },
  fareContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  transactionTimestamp: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },

  // modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 15,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingLeft: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%', // Ensure buttons stretch to full width
  },
});

export default Trip;
