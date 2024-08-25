import React, {useState} from 'react';
import {Text, StyleSheet, Pressable, Animated} from 'react-native';

const CustomButton = ({onPress, text}) => {
  const [scaleValue] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.animatedContainer,
        {
          transform: [{scale: scaleValue}],
        },
      ]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({pressed}) => [
          styles.container,
          {
            backgroundColor: pressed ? '#135266' : '#176B87', // Change background color on press
          },
        ]}>
        <Text style={styles.text}> {text} </Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  animatedContainer: {
    width: '100%',
    alignItems: 'center',
  },

  container: {
    backgroundColor: '#176B87',

    width: '100%',

    padding: 15,
    marginVertical: 10,

    alignItems: 'center',
    borderRadius: 20,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CustomButton;
