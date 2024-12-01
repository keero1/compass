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
        const ticketCollection = await firestore()
          .collection('tickets')
          .where('email', '==', user.email)
          .orderBy('createdAt', 'desc')
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

  const renderTicket = ({ item }) => (
    <View style={styles.ticketContainer}>
      <Text style={styles.ticketSubject}>{item.subject}</Text>
      <Text style={styles.ticketDescription}>{item.description}</Text>
      <Text style={[styles.ticketStatus, item.status === 'Open' ? styles.statusOpen : styles.statusClosed]}>
        {item.status}
      </Text>
      <Text style={styles.ticketDate}>
        Created on {item.createdAt?.toDate().toLocaleDateString()} at {item.createdAt?.toDate().toLocaleTimeString()}
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
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
  },
  listContent: {
    paddingVertical: 16,
  },
  ticketContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  ticketSubject: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  ticketDescription: {
    fontSize: 15,
    color: '#666',
    marginBottom: 8,
  },
  ticketStatus: {
    fontSize: 13,
    fontWeight: '500',
    marginVertical: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusOpen: {
    backgroundColor: '#e0f7e9',
    color: '#2e7d32',
  },
  statusClosed: {
    backgroundColor: '#ffe0e0',
    color: '#d32f2f',
  },
  ticketDate: {
    fontSize: 12,
    color: '#999',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
});

export default Tickets;
