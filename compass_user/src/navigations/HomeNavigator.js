import React from 'react';

import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';

import {Main, Drawer, Wallet, Profile, EditProfile} from '../screen';
import {ROUTES} from '../constants';
import CustomBack from '../components/custom/CustomBack';

import COLORS from '../constants/colors';

const InsideStack = createStackNavigator();

function HomeNavigator() {
  return (
    <InsideStack.Navigator initialRouteName={ROUTES.MAIN}>
      <InsideStack.Screen
        name={ROUTES.MAIN}
        component={Main}
        options={{headerShown: false}}
      />
      <InsideStack.Screen
        name={ROUTES.DRAWER}
        component={Drawer}
        options={({navigation}) => ({
          ...TransitionPresets.ModalSlideFromBottomIOS,
          gestureDirection: 'vertical',
          headerLeft: null,
          title: false,
          headerRight: () => <CustomBack navigation={navigation} />,
          headerTransparent: true,
        })}
      />

      <InsideStack.Screen
        name={ROUTES.WALLET}
        component={Wallet}
        options={() => ({
          ...TransitionPresets.SlideFromRightIOS,
          gestureDirection: 'horizontal',
          headerTitleAlign: 'center',
          headerTransparent: true,
        })}
      />

      <InsideStack.Screen
        name={ROUTES.PROFILE}
        component={Profile}
        options={() => ({
          ...TransitionPresets.SlideFromRightIOS,
          gestureDirection: 'horizontal',
          headerTitleAlign: 'center',
          headerTransparent: true,
        })}
      />

      <InsideStack.Screen
        name={ROUTES.EDITPROFILE}
        component={EditProfile}
        options={() => ({
          ...TransitionPresets.SlideFromRightIOS,
          gestureDirection: 'horizontal',
          headerTitleAlign: 'center',
          headerTransparent: true,
        })}
      />
    </InsideStack.Navigator>
  );
}

export default HomeNavigator;
