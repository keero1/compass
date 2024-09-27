import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import {ROUTES} from '../../../constants/';

const Wallet = props => {
  const {navigation} = props;

  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);

  const user = auth().currentUser;

  const fetchwalletBalance = async () => {
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

  const formatNumber = number => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
    }).format(number);
  };

  useEffect(() => {
    fetchwalletBalance();
  }, []);

  const handleQRCameraPress = () => {
    navigation.navigate(ROUTES.QRCAMERA);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Wallet Balance Box */}
      <View style={styles.walletBalanceBox}>
        {/* Wallet Balance and Cash In */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceText}>Wallet Balance</Text>
          <Text style={styles.amountText}>{formatNumber(balance)}</Text>
          <TouchableOpacity style={styles.cashInButton}>
            <Text style={styles.cashInText}>Cash In</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Transaction History Box */}
      <View style={styles.transactionHistoryBox}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Transaction History</Text>
          <View style={styles.filterButtons}>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterButtonText}>Day</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterButtonText}>Week</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.historyList}>
          {/* Sample transaction item */}
          <View style={styles.transactionItem}>
            <Text style={styles.transactionText}>Amazon Purchase</Text>
            <Text style={styles.transactionAmount}>- $150.00</Text>
          </View>
          <View style={styles.transactionItem}>
            <Text style={styles.transactionText}>Cashback Received</Text>
            <Text style={styles.transactionAmount}>+ $5.00</Text>
          </View>
          <View style={styles.transactionItem}>
            <Text style={styles.transactionText}>Grocery Store</Text>
            <Text style={styles.transactionAmount}>- $80.00</Text>
          </View>
          <View style={styles.transactionItem}>
            <Text style={styles.transactionText}>Grocery Store</Text>
            <Text style={styles.transactionAmount}>- $80.00</Text>
          </View>
          <View style={styles.transactionItem}>
            <Text style={styles.transactionText}>Grocery Store</Text>
            <Text style={styles.transactionAmount}>- $80.00</Text>
          </View>
          <View style={styles.transactionItem}>
            <Text style={styles.transactionText}>Grocery Store</Text>
            <Text style={styles.transactionAmount}>- $80.00</Text>
          </View>
          <View style={styles.transactionItem}>
            <Text style={styles.transactionText}>Grocery Store</Text>
            <Text style={styles.transactionAmount}>- $80.00</Text>
          </View>
          <View style={styles.transactionItem}>
            <Text style={styles.transactionText}>Grocery Store</Text>
            <Text style={styles.transactionAmount}>- $80.00</Text>
          </View>
          <View style={styles.transactionItem}>
            <Text style={styles.transactionText}>Grocery Store</Text>
            <Text style={styles.transactionAmount}>- $80.00</Text>
          </View>
          <View style={styles.transactionItem}>
            <Text style={styles.transactionText}>Grocery Store</Text>
            <Text style={styles.transactionAmount}>- $80.00</Text>
          </View>
          {/* Add more transaction items as needed */}
        </ScrollView>
      </View>

      {/* Scan QR Button */}
      <View style={styles.scanContainer}>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={handleQRCameraPress}>
          <Text style={styles.scanText}>Scan QR</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    backgroundColor: '#f4f4f4',
    paddingHorizontal: 20,
    paddingVertical: 30,
    marginTop: 30,
  },

  /* Wallet Balance Box */
  walletBalanceBox: {
    backgroundColor: '#fff',
    borderRadius: 15,
    borderColor: '#ddd',
    borderWidth: 1,
    padding: 20,
    marginBottom: 20, // Separate it from the transaction box
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
  cashInButton: {
    backgroundColor: '#176B87',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  cashInText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  /* Transaction History Box */
  transactionHistoryBox: {
    backgroundColor: '#fff',
    borderRadius: 15,
    borderColor: '#ddd',
    borderWidth: 1,
    padding: 20,
    flex: 1, // Allows the history box to take up available space
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
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
  historyList: {
    marginTop: 20,
    maxHeight: 300, // Adjust the height as needed for your design
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
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

  /* Scan QR Button */
  scanContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  scanButton: {
    backgroundColor: '#176B87',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 30,
  },
  scanText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Wallet;
