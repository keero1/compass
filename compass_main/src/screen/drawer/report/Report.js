import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  FlatList,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import {Linking} from 'react-native';

const Report = () => {
  const [reports, setReports] = useState([]); // State to hold report data
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [error, setError] = useState(null); // State for error handling

  // Fetch reports from Firestore
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('reportEmergency')
      .orderBy('timestamp', 'desc') // Order by timestamp for most recent reports
      .onSnapshot(
        snapshot => {
          const reportsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

          setReports(reportsData); // Update reports state with real-time data
          setLoading(false); // Stop loading indicator once data is fetched
        },
        err => {
          console.error('Error fetching reports:', err);
          setError('Failed to load reports');
          setLoading(false); // Stop loading indicator in case of error
        },
      );

    // Cleanup the listener when the component is unmounted
    return () => unsubscribe();
  }, []);

  const openGoogleMaps = (latitude, longitude) => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    Linking.openURL(url).catch(err =>
      console.error('Error opening Google Maps', err),
    );
  };

  const getStatusColor = status => {
    if (status === 'Cancelled' || status === 'Closed') {
      return '#E74C3C';
    } else if (status === 'Active') {
      return '#27AE60';
    }
    return '#888';
  };

  const renderReport = ({item}) => (
    <View style={styles.reportContainer}>
      <Text style={styles.reportSubject}>{item.subject}</Text>
      <Text style={styles.reportDetails}>
        Driver: {item.bus_driver_name} | Type: {item.bus_type} | Conductor:{' '}
        {item.conductor_name}
      </Text>
      <Text style={styles.reportTimestamp}>
        Reported on {item.timestamp?.toDate().toLocaleDateString()} at{' '}
        {item.timestamp?.toDate().toLocaleTimeString()}
      </Text>
      <Text style={[styles.reportStatus, {color: getStatusColor(item.status)}]}>
        Status: {item.status}
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          openGoogleMaps(item.coordinates.latitude, item.coordinates.longitude)
        }>
        <Text style={styles.buttonText}>View on Map</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#3498db" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={reports}
          renderItem={renderReport}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA', // Light background color
    paddingHorizontal: 16,
  },
  listContent: {
    paddingVertical: 16,
  },
  reportContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  reportSubject: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  reportDetails: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
  },
  reportTimestamp: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
  },
  reportStatus: {
    fontSize: 14,
    fontWeight: '500',
    color: '#27AE60', // Green for active status
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#176B87', // Modern blue color
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#E74C3C',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default Report;
