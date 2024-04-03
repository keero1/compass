import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {COLORS} from '../../constants';

// ROUTES

import ROUTES from '../../constants/routes';

const Main = props => {
  const {navigation} = props;

  const onMenuPressed = () => {
    navigation.navigate(ROUTES.DRAWER);

    console.log("DRAWER");
  };

  return (
    <SafeAreaView style={styles.main}>
      <TouchableOpacity onPress={onMenuPressed}>
        <View style={styles.hamburgerMenu}>
          <Icon name="menu" size={30} color="black" />
        </View>
      </TouchableOpacity>
      <View style={styles.root}>{<Text> GoogleMap_API [ERROR] CODE 400</Text>}</View>
    </SafeAreaView>
  );
};

export default Main;

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#F4F4FB',
  },
  hamburgerMenu: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 999,
    backgroundColor: '#e4e9f6',
    justifyContent: 'center',
    alignItems: 'center',
    width: screenWidth * 0.112,
    height: screenHeight * 0.061,

    borderRadius: 10,
  },
  root: {
    flex: 1,
    justifyContent: 'space-between',
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
  },
});
