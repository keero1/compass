import React from 'react';
import { Text, View } from 'react-native';

import { COLORS } from '../../constants'

const Forgot = () => {
    return (
        <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: COLORS.colorPrimary,
        }}>
            <Text>Forgor</Text>
        </View>
    );
}

export default Forgot;