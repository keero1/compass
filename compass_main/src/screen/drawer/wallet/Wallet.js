import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  useWindowDimensions,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';

import {useIsFocused} from '@react-navigation/native';

const Wallet = props => {
  const {navigation} = props;
  const {height} = useWindowDimensions();

  const [userFullName, setUserFullName] = useState(null);
  const [userName, setUserName] = useState(null);

  const focus = useIsFocused();

  return (
    <SafeAreaView style={styles.main}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.root}>
          <View style={styles.detailsContainer}>
            {/* BALANCE */}
            <View style={styles.detailBox}>
              <View style={styles.detailItem}>
                <Text style={styles.detailTitle}>ComPass Balance</Text>
                <Text style={styles.detailText}>₱ 600</Text>
                <View style={styles.watermarkContainer}>
                  <Text style={styles.detailWaterMark}>ComPass</Text>
                </View>
              </View>
            </View>
            {/* CREDIT */}
            <View style={styles.detailBoxBlack}>
              <View style={styles.detailItemBlack}>
                <Text style={styles.detailTitleBlack}>ComPass Credit</Text>
                <Text style={styles.detailTextBlack}>₱ 600</Text>
              </View>
            </View>
            {/* HISTORY */}
            <View style={styles.historyBox}>
              <Text style={styles.sectionTitle}>History</Text>
              <View style={styles.historyItem}>
                <Text style={styles.historyText}>Item 1</Text>
              </View>
              <View style={styles.historyItem}>
                <Text style={styles.historyText}>Item 2</Text>
              </View>
              <View style={styles.historyItem}>
                <Text style={styles.historyText}>Item 3</Text>
              </View>
              <TouchableOpacity onPress={() => Alert.alert('See More')}>
                <Text style={styles.seeMoreText}>See More</Text>
              </TouchableOpacity>
            </View>

            {/* FOOTER BUTTONS */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.footerButton}
                onPress={() => Alert.alert('Cash Payment')}>
                <Text style={styles.footerButtonText}>Cash</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.footerButton}
                onPress={() => Alert.alert('Cashless Payment')}>
                <Text style={styles.footerButtonText}>Cashless</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#F4F4FB',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  root: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  detailsContainer: {
    width: '90%',
    marginTop: 100,
  },
  detailBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  detailItem: {
    padding: 10,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailText: {
    fontSize: 25,
    color: '#000000',
  },

  // BLACK
  detailBoxBlack: {
    backgroundColor: '#000000',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  detailItemBlack: {
    padding: 10,
  },
  detailTitleBlack: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  detailTextBlack: {
    fontSize: 25,
    color: '#FFFFFF',
  },

  watermarkContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  detailWaterMark: {
    fontSize: 15,
    opacity: 0.5,
  },
  historyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  historyItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  historyText: {
    fontSize: 16,
  },
  seeMoreText: {
    fontSize: 16,
    color: '#176B87',
    textAlign: 'center',
    marginTop: 10,
  },

  // footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    padding: 20,
    marginTop: 10,
  },
  footerButton: {
    backgroundColor: '#176B87',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: '40%',
  },
  footerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Wallet;
