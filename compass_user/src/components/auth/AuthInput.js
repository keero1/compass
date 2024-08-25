import React, {forwardRef} from 'react';
import {View, TextInput, StyleSheet} from 'react-native';

const CustomInput = forwardRef(
  ({
    value,
    setValue,
    placeholder,
    secureTextEntry,
    onSubmitEditing,
    returnKeyType,
    blurOnSubmit,
    autoCapitalize,
  }, refrence) => {
    return (
      <View style={styles.container}>
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          style={styles.input}
          secureTextEntry={secureTextEntry}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          blurOnSubmit={blurOnSubmit}
          autoCapitalize={autoCapitalize}
          ref={refrence}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    width: '100%',

    borderColor: '#B2B2B2',
    borderWidth: 1,
    borderRadius: 20,

    paddingHorizontal: 10,

    marginVertical: 10,
  },
  input: {},
});

export default CustomInput;
