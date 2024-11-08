import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

import {useFocusEffect} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import {ROUTES} from '../../../constants/';

const Wallet = props => {
  const {navigation} = props;

  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = auth().currentUser;

  const fetchWalletBalance = async () => {
    setLoading(true);
    try {
      const walletDoc = await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('wallet')
        .doc('wallet')
        .get();

      if (!walletDoc.exists) {
        throw new Error('Wallet not found.');
      }

      const walletData = walletDoc.data();
      setBalance(walletData.balance);
    } catch (error) {
      console.log('error: ', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const transactionSnapshot = await firestore()
        .collection('transactions')
        .where('passenger_id', '==', user.uid)
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get();

      const transactionData = transactionSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          origin: data.origin,
          destination: data.destination,
          fare_amount: data.fare_amount,
          timestamp: data.timestamp ? data.timestamp.toDate() : null,
          bus_driver_name: data.bus_driver_name,
          reference_number: data.reference_number,
          transactionName: data.transactionName,
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

  useFocusEffect(
    React.useCallback(() => {
      fetchWalletBalance();
      fetchTransactions();
    }, []),
  );

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
    fetchWalletBalance();
  }, []);

  const handleQRCameraPress = () => {
    navigation.navigate(ROUTES.QRCAMERA);
  };

  const handleCashIn = () => {
    navigation.navigate(ROUTES.CASHIN);
  };

  const handleTransactionHistoryPressed = () => {
    navigation.navigate(ROUTES.TRANSACTIONHISTORY);
  };

  const handleTransactionPress = transaction => {
    navigation.navigate(ROUTES.TRANSACTIONDETAILS, {
      fare_amount: transaction.fare_amount,
      timestamp: transaction.timestamp.toISOString(), // Convert to ISO string
      reference_number: transaction.reference_number,
      bus_driver_name: transaction.bus_driver_name,
      origin: transaction.origin,
      destination: transaction.destination,
      transactionName: transaction.transactionName,
      type: transaction.type,
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Wallet Balance Box */}
      <View style={styles.walletBalanceBox}>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceText}>ComPass Wallet</Text>
          <Text style={styles.amountText}>{formatNumber(balance)}</Text>
        </View>
      </View>

      {/* Cash In and Scan QR Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cashInButton} onPress={handleCashIn}>
          <Text style={styles.cashInText}>Cash In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={handleQRCameraPress}>
          <Text style={styles.scanText}>Scan QR</Text>
        </TouchableOpacity>
      </View>

      {/* Transaction History */}
      <View style={styles.transactionHistoryBox}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => handleTransactionHistoryPressed()}>
            <View style={styles.arrowContainer}>
              <Text style={styles.arrowX}>{'>'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.historyList}>
          {transactions.length > 0 ? (
            transactions.map(transaction => (
              <TouchableOpacity
                key={transaction.id}
                style={styles.transactionItem}
                onPress={() => handleTransactionPress(transaction)}>
                <View style={styles.transactionRow}>
                  <Text style={styles.transactionText}>
                    {transaction.origin} - {transaction.destination}
                  </Text>
                  <View style={styles.fareContainer}>
                    <Text style={styles.transactionAmount}>
                      {formatNumber(transaction.fare_amount)}{' '}
                    </Text>
                    <Text style={styles.arrow}>{'>'}</Text>
                  </View>
                </View>
                <Text style={styles.transactionTimestamp}>
                  {formatDate(transaction.timestamp)}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noTransactionsText}>
              No transactions found.
            </Text>
          )}
        </ScrollView>
      </View>
    </ScrollView>
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
    backgroundColor: '#F4F4FB', // Match the drawer background color
    paddingHorizontal: 20,
  },

  /* Wallet Balance Box */
  walletBalanceBox: {
    backgroundColor: '#fff',
    borderRadius: 15,
    borderColor: '#ddd',
    borderWidth: 1,
    padding: 20,
    marginBottom: 20, // Separate it from the transaction box
    marginTop: 10,
  },
  balanceContainer: {
    alignItems: 'center',
  },
  balanceText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 5,
  },
  amountText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },

  /* Cash In and Scan QR Button Container */
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cashInButton: {
    backgroundColor: '#176B87',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
  },
  cashInText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scanButton: {
    backgroundColor: '#176B87',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    flex: 1,
  },
  scanText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  arrowContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#176B87',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowX: {
    color: '#000000',
    fontSize: 16,
  },

  /* Transaction History */
  transactionHistoryBox: {
    flex: 1,
  },

  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  noTransactionsText: {
    textAlign: 'center',
    fontSize: 20,
    color: '#999',
    marginVertical: '40%',
  },
  historyList: {
    marginTop: 10,
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
  arrow: {
    color: '#888',
    fontSize: 16,
    marginLeft: 5,
  },
});

export default Wallet;
