import React from 'react';

import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';

import {Login, Register, Forgot} from '../screen';
import {ROUTES} from '../constants';

import COLORS from '../constants/colors';
const Stack = createStackNavigator();

function AuthNavigator() {
  return (
    <Stack.Navigator initialRouteName={ROUTES.LOGIN}>
      <Stack.Screen
        name={ROUTES.LOGIN}
        component={Login}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={ROUTES.REGISTER}
        component={Register}
        options={{
          ...TransitionPresets.SlideFromRightIOS,
          gestureDirection: 'horizontal',
          title: false,
          headerStyle: {
            backgroundColor: COLORS.colorPrimary,
          }
        }}
      />
      <Stack.Screen
        name={ROUTES.FORGOT}
        component={Forgot}
        options={{
          ...TransitionPresets.SlideFromRightIOS,
          gestureDirection: 'horizontal',
          title: false,
          headerStyle: {
            backgroundColor: COLORS.colorPrimary,
          }
        }}
      />
      
    </Stack.Navigator>
  );
}

export default AuthNavigator;
