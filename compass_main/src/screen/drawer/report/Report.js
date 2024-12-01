import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  FlatList,
  View,
  ActivityIndicator,
  Button,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import { Linking } from 'react-native';

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

  const renderReport = ({item}) => (
    <View style={styles.reportContainer}>
      <Text style={styles.reportSubject}>{item.subject}</Text>
      <Text style={styles.reportDetails}>
        Driver: {item.bus_driver_name} | Type: {item.bus_type} | Conductor:{' '}
        {item.conductor_name}
      </Text>
      <Text style={styles.reportCoordinates}>
        Coordinates: {item.coordinates.latitude}, {item.coordinates.longitude}
      </Text>
      <Text style={styles.reportTimestamp}>
        Reported on {item.timestamp?.toDate().toLocaleDateString()} at{' '}
        {item.timestamp?.toDate().toLocaleTimeString()}
      </Text>
      <Text style={styles.reportTimestamp}>Status: {item.status}</Text>
      <Button
        title="View in Map"
        onPress={() =>
          openGoogleMaps(item.coordinates.latitude, item.coordinates.longitude)
        }
        color="#176B87" // Set the button color
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#176B87" /> // Show loading spinner
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text> // Show error message
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

// Styles for the report page
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4FB',
    paddingHorizontal: 20,
  },
  listContent: {
    paddingVertical: 16,
  },
  reportContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  reportSubject: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  reportDetails: {
    fontSize: 15,
    color: '#666',
    marginBottom: 8,
  },
  reportCoordinates: {
    fontSize: 13,
    color: '#999',
    marginBottom: 6,
  },
  reportTimestamp: {
    fontSize: 12,
    color: '#999',
    marginBottom: 6,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default Report;
