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

const Support = () => {
  const [subject, setSubject] = useState(''); // New state for the subject
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

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
      // Save ticket to Firestore
      await firestore().collection('tickets').add({
        email: user.email,
        subject: subject.trim(), // Include subject
        description: description.trim(),
        status: 'Open', // Initial status
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      // Reset form
      setSubject(''); // Reset subject
      setDescription(''); // Reset description
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

      <TextInput
        style={styles.input}
        placeholder="Subject"
        value={subject}
        onChangeText={text => setSubject(text)} // Update subject state
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
        style={[styles.button, loading && styles.buttonDisabled]} // Apply styles for loading state
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
    textAlignVertical: 'top', // for multiline input alignment
  },
  button: {
    backgroundColor: '#176B87', // Custom button color
    padding: 15,
    borderRadius: 5,
    alignItems: 'center', // Center text
  },
  buttonText: {
    color: '#FFFFFF', // Text color
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#A0D8E1', // Lightened color for disabled state
  },
});

export default Support;
