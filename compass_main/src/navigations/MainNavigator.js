import React from 'react';

import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';

import {Main, Drawer, Settings, Profile, EditProfile, Payment, PaymentConfirmation} from '../screen';
import {ROUTES} from '../constants';
import CustomBack from '../components/inputs/CustomBack';

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
        name={ROUTES.PAYMENT}
        component={Payment}
        options={() => ({
          ...TransitionPresets.SlideFromRightIOS,
          gestureDirection: 'horizontal',
          headerTitleAlign: 'center',
          headerTransparent: true,
        })}
      />
       <InsideStack.Screen
        name={ROUTES.PAYMENTCONFIRMATION}
        component={PaymentConfirmation}
        options={() => ({
          ...TransitionPresets.SlideFromRightIOS,
          gestureDirection: 'horizontal',
          headerTitleAlign: 'center',
          headerTransparent: true,
          headerTitle: null,
        })}
      />
    </InsideStack.Navigator>
  );
}

export default HomeNavigator;
