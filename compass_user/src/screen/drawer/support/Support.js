import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  TicketIcon,
  ChatBubbleLeftEllipsisIcon,
} from 'react-native-heroicons/solid';
import {ROUTES} from '../../../constants';

const Support = props => {
  const {navigation} = props;

  return (
    <SafeAreaView style={styles.container}>
      {/* Feedback / Report Issue Row */}
      <TouchableOpacity
        style={styles.row}
        onPress={() => {
          navigation.navigate(ROUTES.FEEDBACK);
        }}>
        <View style={styles.iconTextContainer}>
          <ChatBubbleLeftEllipsisIcon width={20} height={20} color="gray" />
          <Text style={styles.text}>Feedback / Report Issue</Text>
        </View>
        <Text style={styles.arrow}>{'>'}</Text>
      </TouchableOpacity>

      {/* Tickets Row */}
      <TouchableOpacity
        style={styles.row}
        onPress={() => {
          navigation.navigate(ROUTES.TICKETS);
        }}>
        <View style={styles.iconTextContainer}>
          <TicketIcon width={20} height={20} color="gray" />
          <Text style={styles.text}>Tickets</Text>
        </View>
        <Text style={styles.arrow}>{'>'}</Text>
      </TouchableOpacity>

      {/* Explanation Container */}
      <View style={styles.explanationContainer}>
        <Text style={styles.explanationText}>
          After you send a ticket, an admin will reply to you on the email you
          used for this account.
          {'\n'}
          johnjoshua.dev@gmail.com
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4FB',
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    marginLeft: 8,
  },
  arrow: {
    fontSize: 20,
  },
  explanationContainer: {
    backgroundColor: '#E7F3FE', // Light blue background for contrast
    padding: 15,
    borderRadius: 5,
    marginTop: 20, // Space above the container
    borderColor: '#B2DBF3', // Border color for the container
    borderWidth: 1,
  },
  explanationText: {
    fontSize: 14,
    color: '#2C3E50', // Dark text for readability
  },
});

export default Support;
