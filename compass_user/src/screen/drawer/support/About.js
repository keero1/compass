import React from 'react';
import {View, Text, StyleSheet, SafeAreaView} from 'react-native';

const About = () => {
  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.root}>
        <Text>About</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#F4F4FB',
  },
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
});

export default About;
