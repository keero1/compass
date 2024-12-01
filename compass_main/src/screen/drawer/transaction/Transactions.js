import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput, // Import TextInput for search bar
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {ROUTES} from '../../../constants';

const Transactions = props => {
  const {navigation} = props;

  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState(''); // State for search input
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
          ...(data.transactionName && {transactionName: data.transactionName}),
          ...(data.coordinates && {coordinates: data.coordinates}), // Include coordinates if they exist
          type: data.type,
        };
      });

      setTransactions(transactionData);
      setFilteredTransactions(transactionData); // Set filtered transactions initially as all transactions
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

  const groupedTransactions = groupByDate(filteredTransactions);

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
      transactionName: transaction.transactionName, // Pass transactionName
      coordinates: transaction.coordinates, // Pass coordinates
      type: transaction.type,
    });
  };

  const handleSearch = text => {
    setSearchText(text);

    if (text.trim() === '') {
      setFilteredTransactions(transactions); // If search is empty, show all transactions
    } else {
      const filtered = transactions.filter(transaction => {
        const referenceNumber = transaction.reference_number;

        // Check if referenceNumber is a valid string
        if (typeof referenceNumber === 'string') {
          return referenceNumber.toLowerCase().includes(text.toLowerCase());
        } else {
          return false; // If reference_number is not a string, skip this transaction
        }
      });
      setFilteredTransactions(filtered);
    }
  };

  const formatDate = date => {
    if (!date) return 'Unknown Date';

    const timeOptions = {hour: 'numeric', minute: 'numeric', hour12: true};

    const timePart = date.toLocaleTimeString('en-US', timeOptions);

    return `${timePart}`;
  };

  return (
    <SafeAreaView style={styles.main}>
      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by Reference Number"
        value={searchText}
        onChangeText={handleSearch}
      />

      {!loading ? (
        <>
          {filteredTransactions.length === 0 ? ( // Check if there are no filtered transactions
            <View style={styles.noTransactionsContainer}>
              <Text style={styles.noTransactionsText}>
                No Transactions Found
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.detailsContainer}>
              {Object.entries(groupedTransactions).length > 0 &&
                Object.entries(groupedTransactions).map(
                  ([date, transactions]) => (
                    <View key={date} style={styles.sectionBox}>
                      <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{date}</Text>
                        <Text style={styles.transactionCount}>
                          {transactions.length}{' '}
                          {transactions.length === 1
                            ? 'Transaction'
                            : 'Transactions'}
                        </Text>
                      </View>
                      {transactions.map(transaction => (
                        <TouchableOpacity
                          key={transaction.id}
                          style={styles.detailBox}
                          onPress={() => handleTransactionPress(transaction)}>
                          <View style={styles.detailItem}>
                            <Text style={styles.detailTitle}>
                              {`${transaction.origin} - ${transaction.destination}`}
                            </Text>
                            <Text style={styles.detailText}>
                              {formatNumber(transaction.fare_amount)} {' >'}
                            </Text>
                          </View>
                          <View style={styles.detailItem}>
                            <Text style={styles.passengerTypeText}>
                              {`Time: ${formatDate(transaction.timestamp)}`}
                            </Text>
                          </View>
                          <View style={styles.detailItem}>
                            <Text style={styles.passengerTypeText}>
                              {`Ref: ${transaction.reference_number}`}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ),
                )}
            </ScrollView>
          )}
        </>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#176B87" />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#F4F4FB',
    paddingHorizontal: 15,
  },
  searchInput: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginVertical: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  detailsContainer: {
    width: '100%',
  },
  sectionBox: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  transactionCount: {
    fontSize: 16,
    color: '#666',
  },
  detailBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexWrap: 'wrap',
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  detailText: {
    fontSize: 16,
    textAlign: 'right',
    marginLeft: 10,
    color: '#333',
  },
  passengerTypeText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    marginBottom: -20,
  },
  transactionNameText: {
    fontSize: 14,
    color: '#444',
    marginLeft: 10,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noTransactionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noTransactionsText: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },
});

export default Transactions;
