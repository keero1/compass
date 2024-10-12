import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import {useFocusEffect} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import {ROUTES} from '../../../constants';

const Transactions = props => {
  const {navigation} = props;

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = auth().currentUser;

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const transactionSnapshot = await firestore()
        .collection('transactions')
        .where('bus_id', '==', user.uid) // Filter by current user's ID
        .orderBy('timestamp', 'desc') // Sort by timestamp in descending order
        .get();

      const transactionData = transactionSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          origin: data.origin,
          destination: data.destination,
          fare_amount: data.fare_amount,
          timestamp: data.timestamp.toDate(), // Convert Firestore timestamp to JavaScript Date
          reference_number: data.reference_number,
          passenger_type: data.passenger_type,
          payment_type: data.payment_type,
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
      fetchTransactions();
    }, []),
  );

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

  // Format fare amount as currency
  const formatNumber = number => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
    }).format(number);
  };

  const handleTransactionPress = transaction => {
    navigation.navigate(ROUTES.TRANSACTIONDETAILS, {
      fare_amount: transaction.fare_amount,
      timestamp: transaction.timestamp.toISOString(), // Convert to ISO string
      reference_number: transaction.reference_number,
      payment_type: transaction.payment_type,
      passenger_type: transaction.passenger_type,
      origin: transaction.origin,
      destination: transaction.destination,
    });
  };

  return (
    <SafeAreaView style={styles.main}>
      {!loading ? (
        <ScrollView style={styles.detailsContainer}>
          {Object.entries(groupedTransactions).length > 0 ? (
            Object.entries(groupedTransactions).map(([date, transactions]) => (
              <View key={date} style={styles.sectionBox}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{date}</Text>
                  <Text style={styles.transactionCount}>
                    {transactions.length}{' '}
                    {transactions.length === 1 ? 'Transaction' : 'Transactions'}
                  </Text>
                </View>
                {transactions.map(transaction => (
                  <TouchableOpacity
                    key={transaction.id}
                    style={styles.detailBox}
                    onPress={() => handleTransactionPress(transaction)}>
                    <View style={styles.detailItem}>
                      <Text
                        style={
                          styles.detailTitle
                        }>{`${transaction.origin} - ${transaction.destination}`}</Text>
                      <Text style={styles.detailText}>
                        {formatNumber(transaction.fare_amount)} {' >'}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailTitle}>
                        {transaction.passenger_type} :{' '}
                        {transaction.payment_type}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))
          ) : (
            <View style={styles.noTransactionsContainer}>
              <Text style={styles.noTransactionsText}>No Transactions</Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      )}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Align title and count
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionCount: {
    fontSize: 16,
    color: '#666',
  },
  detailBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    marginBottom: 1,
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
  noTransactionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noTransactionsText: {
    fontSize: 18,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Transactions;
