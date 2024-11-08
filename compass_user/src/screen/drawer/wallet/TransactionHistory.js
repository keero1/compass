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
      timestamp: transaction.timestamp.toISOString(),
      reference_number: transaction.reference_number,
      bus_driver_name: transaction.bus_driver_name,
      origin: transaction.origin,
      destination: transaction.destination,
      transactionName: transaction.transactionName,
      type: transaction.type,
    });
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
                    <Text style={styles.transactionAmount}>
                      {formatNumber(transaction.fare_amount)}
                    </Text>
                  </View>
                  <View style={styles.driverInfo}>
                    <Text style={styles.driverName}>
                      To {transaction.bus_driver_name}
                    </Text>
                    <Text style={styles.referenceNumber}>
                      Ref: {transaction.reference_number}
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
    flexWrap: 'wrap',
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  transactionAmount: {
    fontSize: 16,
    color: '#FF9900',
    flexShrink: 1,
    maxWidth: '40%',
    textAlign: 'right',
  },
  driverInfo: {
    marginTop: 8,
  },
  driverName: {
    fontSize: 14,
    color: '#555',
  },
  referenceNumber: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
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
});

export default TransactionHistory;
