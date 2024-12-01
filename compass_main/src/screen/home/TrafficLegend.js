import React from 'react';
import {StyleSheet, View, Text} from 'react-native';

const TrafficLegend = ({screenWidth}) => {
  return (
    <View style={[styles.container, {left: screenWidth / 2 - 100}]}>
      <Text style={styles.legendText}>Fast</Text>
      <View style={[styles.legendBox, {backgroundColor: '#63d668'}]} />
      <View style={[styles.legendBox, {backgroundColor: 'yellow'}]} />
      <View style={[styles.legendBox, {backgroundColor: '#ff974d'}]} />
      <View style={[styles.legendBox, {backgroundColor: '#811f1f'}]} />
      <Text style={styles.legendText}>Slow</Text>
    </View>
  );
};

export default TrafficLegend;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30, // Aligns with the buttons
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    elevation: 5,
  },
  legendText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 5,
  },
  legendBox: {
    width: 25,
    height: 10,
    marginHorizontal: 3,
    borderRadius: 2,
  },
});
