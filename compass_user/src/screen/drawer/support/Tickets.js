import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, FlatList, View, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tickets from Firestore
  useEffect(() => {
    const fetchTickets = async () => {
      const user = auth().currentUser;
      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      try {
        // Query to fetch and sort tickets by createdAt in descending order
        const ticketCollection = await firestore()
          .collection('tickets')
          .where('email', '==', user.email)
          .orderBy('createdAt', 'desc') // Sort by createdAt in descending order
          .get();

        const ticketsData = ticketCollection.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTickets(ticketsData);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError('Failed to load tickets');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // Render ticket item
  const renderTicket = ({ item }) => (
    <View style={styles.ticketContainer}>
      <Text style={styles.ticketSubject}>{item.subject}</Text>
      <Text style={styles.ticketDescription}>{item.description}</Text>
      <Text style={styles.ticketStatus}>Status: {item.status}</Text>
      <Text style={styles.ticketDate}>
        Created At: {item.createdAt?.toDate().toLocaleString()} {/* Format date */}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#176B87" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={tickets}
          renderItem={renderTicket}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4FB',
    paddingHorizontal: 20,
  },
  ticketContainer: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // For Android shadow
  },
  ticketSubject: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ticketDescription: {
    fontSize: 16,
    marginVertical: 5,
  },
  ticketStatus: {
    fontSize: 14,
    color: 'gray',
  },
  ticketDate: {
    fontSize: 12,
    color: 'gray',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default Tickets;
