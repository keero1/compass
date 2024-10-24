import React, {useState} from 'react';
import {Text, StyleSheet, Pressable, Animated} from 'react-native';

const AuthButton = ({onPress, text, disabled}) => {
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
        onPress={disabled ? null : onPress} // Prevent onPress if disabled
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={({pressed}) => [
          styles.container,
          {
            backgroundColor: pressed
              ? '#135266'
              : disabled
              ? '#9cafb7' // Gray color when disabled
              : '#176B87', // Normal color
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

export default AuthButton;
