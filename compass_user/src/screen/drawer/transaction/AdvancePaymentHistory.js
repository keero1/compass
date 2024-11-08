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

import moment from 'moment';

const AdvancePaymentHistory = props => {
  const {navigation} = props;
  const user = auth().currentUser;

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [loadingModalVisible, setLoadingModalVisible] = useState(false);

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
          type: data.type,
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
      'Please ensure that all information is accurate: destination and confirm that you have selected the correct bus and that there are available seats as reversal may be difficult.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Confirm',
          onPress: async () => {
            setLoadingModalVisible(true);
            try {
              const {status, ...transactionData} = selectedTransaction;

              await firestore()
                .collection('transactions')
                .add({
                  ...transactionData,
                  completedTimestamp: firestore.FieldValue.serverTimestamp(),
                });

              await firestore()
                .collection('advancePayment')
                .doc(selectedTransaction.id)
                .update({status: 'completed'});

              setModalVisible(false);
              fetchTransactions();
            } catch (error) {
              console.log('Error completing transaction:', error);
              Alert.alert(
                'Error',
                'An error occurred while completing the transaction. Please try again.',
              );
            } finally {
              setLoadingModalVisible(false);
            }
          },
        },
      ],
    );
  };

  const handleCancel = async () => {
    try {
      await firestore()
        .collection('advancePayment')
        .doc(selectedTransaction.id)
        .update({status: 'cancelled'});

      fetchTransactions();
    } catch (error) {
      console.error(error);
    } finally {
      setModalVisible(false);
    }
  };

  const formatTimestamp = timestamp => {
    return moment(timestamp).format('DMMMYYYY:HH.mm').toLowerCase(); // Format as '2nov2024:21.23'
  };

  return (
    <SafeAreaView style={styles.main}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#176B87" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      ) : (
        <ScrollView style={styles.detailsContainer}>
          {Object.entries(groupedTransactions).map(([date, transactions]) => (
            <View key={date} style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>{date}</Text>
              {transactions.map(transaction => (
                <TouchableOpacity
                  key={transaction.id}
                  style={styles.transactionCard}
                  onPress={() => handleTransactionPress(transaction)}>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionTitle}>
                      {`${transaction.origin} - ${transaction.destination}`}
                    </Text>
                    <Text style={styles.transactionStatus}>
                      {transaction.status
                        ? transaction.status.toUpperCase()
                        : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.driverContainer}>
                    <Text style={styles.driverName}>
                      Driver: {transaction.bus_driver_name}
                    </Text>
                    {transaction.timestamp && (
                      <Text style={styles.timestamp}>
                        {formatTimestamp(transaction.timestamp)}
                      </Text>
                    )}
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
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>

            {selectedTransaction && (
              <>
                <Text style={styles.modalTitle}>Transaction Info</Text>
                <Text style={styles.modalDetails}>
                  {selectedTransaction.transactionName || 'N/A'}
                </Text>
                <Text style={styles.modalDetails}>
                  {selectedTransaction.bus_driver_name || 'N/A'}
                </Text>
                <Text style={styles.modalDetails}>
                  {`${selectedTransaction.origin || 'N/A'} - ${
                    selectedTransaction.destination || 'N/A'
                  }`}
                </Text>
                <Text style={styles.modalDetails}>
                  {selectedTransaction.passenger_type || 'N/A'}
                </Text>
                <Text style={styles.modalDetails}>
                  {selectedTransaction.reference_number || 'N/A'}
                </Text>
                <Text style={styles.modalDetails}>
                  {selectedTransaction.fare_amount
                    ? formatNumber(selectedTransaction.fare_amount)
                    : 'N/A'}
                </Text>
                <Text style={styles.modalDetails}>
                  {selectedTransaction.timestamp
                    ? formatTimestamp(selectedTransaction.timestamp)
                    : 'N/A'}
                </Text>
                <Text style={styles.modalDetails}>
                  {selectedTransaction.status
                    ? selectedTransaction.status.toUpperCase()
                    : 'N/A'}
                </Text>
                <View style={styles.buttonContainer}>
                  {selectedTransaction.status === 'onHold' && (
                    <>
                      <TouchableOpacity
                        style={[styles.button, styles.completeButton]}
                        onPress={handleComplete}>
                        <Text style={styles.buttonText}>Complete</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={handleCancel}>
                        <Text style={styles.buttonText}>Cancel</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={loadingModalVisible}
        onRequestClose={() => setLoadingModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.loadingModalContent}>
            <ActivityIndicator size="large" color="#176B87" />
            <Text style={styles.processingText}>Processing Payment...</Text>
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
    paddingHorizontal: 16,
  },
  detailsContainer: {
    width: '100%',
  },
  sectionBox: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  transactionCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    padding: 12,
  },
  transactionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap', // Allow wrapping for child elements
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1, // Allow it to take up available space and wrap if needed
    marginRight: 10, // Add some space between title and status
  },
  transactionStatus: {
    fontSize: 14,
    color: '#FF9900',
    flexShrink: 1, // Allow the status text to shrink if necessary to avoid overflow
    maxWidth: '40%', // Limit the width of the status so it doesn't push the title
  },
  driverContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  driverName: {
    fontSize: 14,
    color: '#333',
  },
  timestamp: {
    fontSize: 14,
    color: '#777',
    textAlign: 'right',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  modalDetails: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#555',
  },
  // button onhold
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  button: {
    width: '48%',
    paddingVertical: 12,
    borderRadius: 8,
  },
  completeButton: {
    backgroundColor: '#176B87',
  },
  cancelButton: {
    backgroundColor: '#FF4C4C',
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingModalContent: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '60%',
  },
  processingText: {
    fontSize: 18,
    color: '#333',
    marginTop: 10,
  },
});

export default AdvancePaymentHistory;
