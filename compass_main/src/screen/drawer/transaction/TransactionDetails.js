import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

const TransactionDetails = ({route}) => {
  const {
    fare_amount,
    timestamp,
    reference_number,
    payment_type,
    passenger_type,
    origin,
    destination,
    transactionName,
    type,
  } = route.params;

  // Convert the timestamp back to a Date object
  const date = new Date(timestamp);

  const formatNumber = number => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
    }).format(number);
  };

  const formatDate = date => {
    if (!date) return 'Unknown Date';

    const options = {day: 'numeric', month: 'short', year: 'numeric'};
    const timeOptions = {hour: 'numeric', minute: 'numeric', hour12: true};

    const datePart = date.toLocaleDateString('en-US', options);
    const timePart = date.toLocaleTimeString('en-US', timeOptions);

    return `${datePart}, ${timePart}`;
  };

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.detailsContainer}>
        {/* Payment Section */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <View style={styles.detailBox}>
            <View style={styles.detailItem}>
              <Text style={styles.detailTitle}>You Earned</Text>
              <Text style={styles.fareAmount}>{formatNumber(fare_amount)}</Text>
            </View>
          </View>
        </View>

        {/* Travel & Date Section */}
        <View style={styles.sectionBox}>
          <View style={styles.detailBox}>
            <View style={styles.detailItemX}>
              <Text style={styles.detailTitle}>Trip</Text>
              <Text
                style={styles.detailText}>{`${origin} - ${destination}`}</Text>
            </View>
            <View style={styles.detailItemX}>
              <Text style={styles.detailTitle}>Payment Type</Text>
              <Text style={styles.detailText}>{payment_type}</Text>
            </View>
            <View style={styles.detailItemX}>
              <Text style={styles.detailTitle}>Passenger Type</Text>
              <Text style={styles.detailText}>{passenger_type}</Text>
            </View>
            <View style={styles.detailItemX}>
              <Text style={styles.detailTitle}>Date and Time</Text>
              <Text style={styles.detailText}>{formatDate(date)}</Text>
            </View>
            {type && (
              <View style={styles.detailItemX}>
                <Text style={styles.detailTitle}>Type</Text>
                <Text style={styles.detailText}>{type}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Reference Number Section */}
        <View style={styles.sectionBox}>
          <View style={styles.detailBox}>
            {transactionName && (
              <View style={styles.detailItemX}>
                <Text style={styles.detailTitle}>Transaction Name</Text>
              </View>
            )}
            {transactionName && (
              <Text style={styles.referenceValue}>{transactionName}</Text>
            )}
            <View style={styles.detailItemX}>
              <Text style={styles.detailTitle}>Reference Number</Text>
            </View>
            <Text style={styles.referenceValue}>{reference_number}</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#F7F7FB',
    padding: 16,
  },
  detailsContainer: {
    width: '100%',
  },
  sectionBox: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  detailBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    padding: 16,
  },
  detailItem: {
    marginBottom: 12,
  },
  detailItemX: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
  },
  fareAmount: {
    fontSize: 24,
    fontWeight: '600',
    color: '#176B87',
    textAlign: 'right',
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'right',
    marginLeft: 10,
  },
  referenceValue: {
    fontSize: 16,
    color: '#333',
    marginTop: 8,
    textAlign: 'left',
  },
});

export default TransactionDetails;
