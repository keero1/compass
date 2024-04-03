import React from 'react';
import { Text, View } from 'react-native';

import { COLORS } from '../../constants'

const Settings = () => {
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

export default Settings;