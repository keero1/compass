import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Button,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {ScrollView} from 'react-native-gesture-handler';

const AdvancePaymentHistory = props => {
  const {navigation} = props;
  const user = auth().currentUser;

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const transactionSnapshot = await firestore()
        .collection('advancePayment')
        .where('passenger_id', '==', user.uid)
        .orderBy('timestamp', 'desc')
        .get();

      const transactionData = transactionSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          bus_id: data.bus_id,
          origin: data.origin,
          destination: data.destination,
          fare_amount: data.fare_amount,
          timestamp: data.timestamp ? data.timestamp.toDate() : null,
          bus_driver_name: data.bus_driver_name,
          ...(data.conductor_name && {conductor_name: data.conductor_name}),
          reference_number: data.reference_number,
          payment_type: data.payment_type,
          bus_number: data.bus_number,
          status: data.status,
          bus_type: data.bus_type,
          coordinates: data.coordinates,
          passenger_type: data.passenger_type,
          passenger_id: data.passenger_id,
          transactionName: data.transactionName,
          distance: data.distance,
          route_name: data.route_name,
        };
      });

      setTransactions(transactionData);
    } catch (error) {
      console.log('Error fetching transactions: ', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const groupByDate = transactions => {
    return transactions.reduce((groups, transaction) => {
      const date = transaction.timestamp?.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    }, {});
  };

  const groupedTransactions = groupByDate(transactions);

  const formatNumber = number => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
    }).format(number);
  };

  const handleTransactionPress = transaction => {
    setSelectedTransaction(transaction);
    setModalVisible(true);
  };

  const handleComplete = async () => {
    Alert.alert(
      'Confirm Completion',
      'Please ensure that all information is accurate: origin, passenger and confirm that you have selected the correct bus and that there are available seats as reversal may be difficult.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              // Copy the transaction data to the `transactions` collection
              const {status, ...transactionData} = selectedTransaction;

              console.log(transactionData);
              console.log(selectedTransaction);

              await firestore()
                .collection('transactions')
                .add({
                  ...transactionData,
                  completedTimestamp: firestore.FieldValue.serverTimestamp(),
                });

              // Update the original transaction's status to 'completed'
              await firestore()
                .collection('advancePayment')
                .doc(selectedTransaction.id)
                .update({status: 'completed'});

              // Close the modal and refresh the transactions
              setModalVisible(false);
              fetchTransactions();
            } catch (error) {
              console.log('Error completing transaction:', error);
              Alert.alert(
                'Error',
                'An error occurred while completing the transaction. Please try again.',
              );
            }
          },
        },
      ],
    );
  };
  const handleCancel = async () => {
    await firestore()
      .collection('advancePayment')
      .doc(selectedTransaction.id)
      .update({status: 'cancelled'});
    setModalVisible(false);
    fetchTransactions();
  };

  return (
    <SafeAreaView style={styles.main}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      ) : (
        <ScrollView style={styles.detailsContainer}>
          {Object.entries(groupedTransactions).map(([date, transactions]) => (
            <View key={date} style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>{date}</Text>
              {transactions.map(transaction => (
                <TouchableOpacity
                  key={transaction.id} // Ensure this is a unique value
                  style={styles.detailBox}
                  onPress={() => handleTransactionPress(transaction)}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailTitle}>
                      {`${transaction.origin} - ${transaction.destination}`}
                    </Text>
                    <Text style={styles.detailText}>
                      {transaction.status
                        ? transaction.status.toUpperCase()
                        : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailTitle}>
                      To {transaction.bus_driver_name}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
      )}

      {/* Modal for handling onHold transactions */}
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Close button at the top left of the modal */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>

            {selectedTransaction && (
              <>
                <Text style={styles.modalTitle}>Transaction Info</Text>
                <Text>
                  {selectedTransaction.transactionName
                    ? selectedTransaction.transactionName
                    : 'N/A'}
                </Text>
                <Text>{`${
                  selectedTransaction.origin
                    ? selectedTransaction.origin
                    : 'N/A'
                } - ${
                  selectedTransaction.destination
                    ? selectedTransaction.destination
                    : 'N/A'
                }`}</Text>
                <Text>{`${
                  selectedTransaction.passenger_type
                    ? selectedTransaction.passenger_type
                    : 'N/A'
                }`}</Text>
                <Text>{`${
                  selectedTransaction.bus_driver_name
                    ? selectedTransaction.bus_driver_name
                    : 'N/A'
                }`}</Text>
                <Text>{`${
                  selectedTransaction.fare_amount !== undefined
                    ? formatNumber(selectedTransaction.fare_amount)
                    : 'N/A'
                }`}</Text>
                <Text>{`${
                  selectedTransaction.status
                    ? selectedTransaction.status.toUpperCase()
                    : 'N/A'
                }`}</Text>
                <View style={styles.buttonContainer}>
                  {selectedTransaction.status === 'onHold' && (
                    <>
                      <Button
                        title="Complete"
                        onPress={handleComplete}
                        color="#176B87"
                      />
                      <Button
                        title="Cancel"
                        onPress={handleCancel}
                        color="red"
                      />
                    </>
                  )}
                </View>
              </>
            )}
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
  },
  detailsContainer: {
    width: '100%',
  },
  sectionBox: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  detailBox: {
    backgroundColor: '#FFFFFF',
    marginBottom: 1,
    borderWidth: 0.5,
    borderColor: 'black',
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  detailTitle: {
    fontSize: 16,
  },
  detailText: {
    fontSize: 16,
    textAlign: 'right',
    marginLeft: 10,
    color: '#000000',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#000000',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    position: 'relative', // Allow absolute positioning of close button
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 15,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'gray', // Change color as per your design
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
});

export default AdvancePaymentHistory;
