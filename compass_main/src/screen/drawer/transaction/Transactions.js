import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';

import {useFocusEffect} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

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

  // Format fare amount as currency
  const formatNumber = number => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
    }).format(number);
  };

  const formatDate = date => {
    if (!date || !(date instanceof Date)) return 'Unknown date'; // Fallback if date is undefined or invalid
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <View style={styles.container}>
      <View style={styles.transactionHistoryBox}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Transaction History</Text>
          <View style={styles.filterButtons}>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterButtonText}>Day</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterButtonText}>Month</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : transactions.length > 0 ? (
          <ScrollView style={styles.historyList}>
            {transactions.map(transaction => (
              <View key={transaction.id} style={styles.transactionItem}>
                {/* First Row: origin - destination and fare_amount */}
                <View style={styles.transactionRow}>
                  <Text style={styles.transactionText}>
                    {transaction.origin} - {transaction.destination}
                  </Text>
                  <Text style={styles.transactionAmount}>
                    {formatNumber(transaction.fare_amount)}
                  </Text>
                </View>

                {/* Second Row: Timestamp */}
                <Text style={styles.timestampText}>
                  {formatDate(transaction.timestamp)}
                </Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No transactions found.</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    paddingHorizontal: 20,
    paddingVertical: 30,
    marginTop: 30,
  },
  transactionHistoryBox: {
    backgroundColor: '#fff',
    borderRadius: 15,
    borderColor: '#ddd',
    borderWidth: 1,
    padding: 20,
    flex: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterButtons: {
    flexDirection: 'row',
  },
  filterButton: {
    backgroundColor: '#ddd',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginLeft: 10,
  },
  filterButtonText: {
    color: '#333',
    fontSize: 14,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  historyList: {
    marginTop: 10,
    flexGrow: 1,
  },
  transactionItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactionText: {
    fontSize: 16,
    color: '#555',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  timestampText: {
    fontSize: 12, // Smaller font for timestamp
    color: '#888',
    marginTop: 5, // Small margin to separate timestamp from above text
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
  },
});

export default Transactions;
