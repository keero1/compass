import React from 'react';
import {TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CustomBack = ({navigation, animationType}) => {
  const onClosePress = () => {
    animationType = 'ModalSlideFromBottom';
    navigation.popToTop();
  };
  return (
    <TouchableOpacity style={{marginRight: 15}} onPress={onClosePress}>
      <Icon name="close" size={24} color="black" />
    </TouchableOpacity>
  );
};

export default CustomBack;
