import React from 'react';
import { Text, View } from 'react-native';

import { COLORS } from '../../constants'

const Wallet = () => {
    return (
        <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: COLORS.colorPrimary,
        }}>
            <Text>Settings!!</Text>
        </View>
    );
}

export default Wallet;