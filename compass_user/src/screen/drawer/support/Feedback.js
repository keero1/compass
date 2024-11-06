import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import {Dropdown} from 'react-native-element-dropdown';

const Feedback = () => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const subjectData = [
    {label: 'Payment Issues', value: 'Payment Issues'},
    {label: 'App Performance', value: 'App Performance'},
    {label: 'Bus Tracking', value: 'Bus Tracking'},
    {label: 'Account Management', value: 'Account Management'},
    {label: 'Feature Request', value: 'Feature Request'},
  ];

  // Function to handle ticket submission
  const submitTicket = async () => {
    const user = auth().currentUser;
    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    if (subject.trim() === '') {
      Alert.alert('Error', 'Please provide a subject for your issue.');
      return;
    }

    if (description.trim() === '') {
      Alert.alert('Error', 'Please provide a description for your issue.');
      return;
    }

    setLoading(true);

    try {
      // Check for existing open tickets
      const existingTickets = await firestore()
        .collection('tickets')
        .where('email', '==', user.email)
        .where('status', '==', 'Open')
        .get();

      if (!existingTickets.empty) {
        Alert.alert(
          'Open Ticket Found',
          'You currently have an open ticket. Please wait for it to be resolved before submitting a new one.',
        );
        setLoading(false);
        return; // Exit the function if an open ticket exists
      }

      // Save new ticket to Firestore
      await firestore().collection('tickets').add({
        email: user.email,
        subject: subject.trim(),
        description: description.trim(),
        status: 'Open',
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      // Reset form
      setSubject('');
      setDescription('');
      Alert.alert('Success', 'Your support ticket has been submitted.');
    } catch (error) {
      console.error('Error creating ticket:', error);
      Alert.alert(
        'Error',
        'Failed to create support ticket. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Submit a Feedback or Issue</Text>

      <Dropdown
        style={styles.input}
        placeholder="Select Subject"
        data={subjectData}
        labelField="label"
        valueField="value"
        value={subject}
        onChange={item => setSubject(item.value)}
      />

      <TextInput
        style={styles.input}
        placeholder="Description"
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={text => setDescription(text)}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={submitTicket}
        disabled={loading}>
        <Text style={styles.buttonText}>Submit Ticket</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4FB',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#FFF',
    padding: 10,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#176B87',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#A0D8E1',
  },
});

export default Feedback;
