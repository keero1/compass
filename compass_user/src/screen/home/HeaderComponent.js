import React from 'react';
import {View, TouchableOpacity, StyleSheet, Dimensions} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HeaderComponent = ({navigation, ROUTES, onSearchPressed}) => {
  // hamburger menu
  const onMenuPressed = () => {
    navigation.navigate(ROUTES.DRAWER);

    console.log('DRAWER');
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onMenuPressed}>
        <View style={styles.hamburgerMenu}>
          <Icon name="menu" size={30} color="black" />
        </View>
      </TouchableOpacity>
      {/* <TouchableOpacity onPress={onSearchPressed}>
        <View style={styles.searchButton}>
          <Icon name="search" size={30} color="black" />
        </View>
      </TouchableOpacity> */}
    </View>
  );
};

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 999,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hamburgerMenu: {
    backgroundColor: '#e4e9f6',
    justifyContent: 'center',
    alignItems: 'center',
    width: screenWidth * 0.112,
    height: screenHeight * 0.061,
    borderRadius: 10,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#e4e9f6',
    justifyContent: 'center',
    alignItems: 'center',
    width: screenWidth * 0.112,
    height: screenHeight * 0.061,
    borderRadius: 10,
    marginLeft: 10,
  },
});

export default HeaderComponent;
