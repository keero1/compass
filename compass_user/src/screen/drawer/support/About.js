import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {DocumentTextIcon, ShieldCheckIcon} from 'react-native-heroicons/solid';

const About = () => {
  // Function to open URL in default browser
  const openURL = async url => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Error', 'Unable to open the link.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Terms & Condition Row */}
      <TouchableOpacity
        style={styles.row}
        onPress={() =>
          openURL('https://www.compass-santrans.online/terms-of-use')
        }>
        <View style={styles.iconTextContainer}>
          <DocumentTextIcon width={20} height={20} color="gray" />
          <Text style={styles.text}>Terms & Condition</Text>
        </View>
        <Text style={styles.arrow}>{'>'}</Text>
      </TouchableOpacity>

      {/* Privacy Policy Row */}
      <TouchableOpacity
        style={styles.row}
        onPress={() =>
          openURL('https://www.compass-santrans.online/privacy-policy')
        }>
        <View style={styles.iconTextContainer}>
          <ShieldCheckIcon width={20} height={20} color="gray" />
          <Text style={styles.text}>Privacy Policy</Text>
        </View>
        <Text style={styles.arrow}>{'>'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4FB',
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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
});

export default About;
