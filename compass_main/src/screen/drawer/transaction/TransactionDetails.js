import React from 'react';
import {Text, View, StyleSheet, SafeAreaView, TouchableOpacity} from 'react-native';

const TransactionDetails = ({route}) => {
  const {
    fare_amount,
    timestamp,
    reference_number,
    payment_type,
    passenger_type,
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
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>Payment</Text>

          <View style={styles.detailBox}>
            <View style={styles.detailItem}>
              <Text style={styles.detailTitle}>You Earned</Text>
              <Text style={styles.detailText}>{formatNumber(fare_amount)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionBox}>
          <View style={styles.detailBox}>
            <View style={styles.detailItemX}>
              <Text style={styles.detailTitle}>Payment Type</Text>
              <Text style={styles.detailTextSameLine}>{payment_type}</Text>
            </View>
            <View style={styles.detailItemX}>
              <Text style={styles.detailTitle}>Passenger Type</Text>
              <Text style={styles.detailTextSameLine}>{passenger_type}</Text>
            </View>
            <View style={styles.detailItemX}>
              <Text style={styles.detailTitle}>Date and Time</Text>
              <Text style={styles.detailTextSameLine}>{formatDate(date)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionBox}>
          <View style={styles.sectionBox}>
            <View style={styles.detailBox}>
              <View style={styles.detailItemX}>
                <Text style={styles.detailTitle}>Reference Number</Text>
                <Text style={styles.detailTextSameLine}>
                  {reference_number}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.reprintButton} onPress={() => {}}>
        <Text style={styles.reprintButtonText}>Reprint Receipt</Text>
      </TouchableOpacity>
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
  },
  detailItem: {
    padding: 20,
  },
  detailItemX: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  detailTitle: {
    fontSize: 16,
  },
  detailText: {
    fontSize: 30,
    textAlign: 'right',
    color: '#000000',
  },
  detailTextSameLine: {
    fontSize: 16,
    textAlign: 'right',
    marginLeft: 10,
  },

  reprintButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: '#176B87',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  reprintButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TransactionDetails;
