import React from 'react';
import { Text, View } from 'react-native';

import { COLORS } from '../../../constants'

const Profile = () => {
    return (
        <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: COLORS.colorPrimary,
        }}>
            <Text>Profile</Text>
        </View>
    );
}

export default Profile;