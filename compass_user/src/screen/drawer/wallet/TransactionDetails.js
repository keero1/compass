import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {ClipboardDocumentIcon} from 'react-native-heroicons/solid';

const TransactionDetails = ({route}) => {
  const {
    fare_amount,
    timestamp,
    reference_number,
    bus_driver_name,
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

  const copyToClipboard = () => {
    Clipboard.setString(reference_number);
    Alert.alert('Copied', 'Reference number has been copied to clipboard!');
  };

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.detailsContainer}>
        {/* Payment Section */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <View style={styles.detailBox}>
            <View style={styles.detailItem}>
              <Text style={styles.detailTitle}>You've Paid</Text>
              <Text style={styles.fareAmount}>{formatNumber(fare_amount)}</Text>
            </View>
          </View>
        </View>

        {/* Travel & Date Section */}
        <View style={styles.sectionBox}>
          <View style={styles.detailBox}>
            <View style={styles.detailItemX}>
              <Text style={styles.detailTitle}>Bus Driver</Text>
              <Text style={styles.detailText}>{bus_driver_name}</Text>
            </View>
            <View style={styles.detailItemX}>
              <Text style={styles.detailTitle}>Route</Text>
              <Text
                style={styles.detailText}>{`${origin} - ${destination}`}</Text>
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
              <TouchableOpacity
                onPress={copyToClipboard}
                style={styles.copyButton}>
                <ClipboardDocumentIcon size={15} color="#fff" />
                <Text style={styles.copyButtonText}>Copy</Text>
              </TouchableOpacity>
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
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#176B87',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  copyButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default TransactionDetails;
