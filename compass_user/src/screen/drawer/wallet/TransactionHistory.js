import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import {ROUTES} from '../../../constants/';
import {ScrollView} from 'react-native-gesture-handler';

const TransactionHistory = props => {
  const {navigation} = props;

  const user = auth().currentUser;

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const transactionSnapshot = await firestore()
        .collection('transactions')
        .where('passenger_id', '==', user.uid)
        .orderBy('timestamp', 'desc')
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
    navigation.navigate(ROUTES.TRANSACTIONDETAILS, {
      fare_amount: transaction.fare_amount,
      timestamp: transaction.timestamp.toISOString(), // Convert to ISO string
      reference_number: transaction.reference_number,
      bus_driver_name: transaction.bus_driver_name,
      origin: transaction.origin,
      destination: transaction.destination,
    });
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
                      To {transaction.bus_driver_name}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingHorizontal: 10,
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
});

export default TransactionHistory;
