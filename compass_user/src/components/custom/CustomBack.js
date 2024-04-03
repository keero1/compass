import React from 'react';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CustomBack = ({ navigation }) => {
  return (
    <TouchableOpacity
      style={{ marginRight: 15 }}
      onPress={() => navigation.goBack()}
    >
      <Icon name="close" size={24} color="black" />
    </TouchableOpacity>
  );
};

export default CustomBack;