import React from 'react';

import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';

import {
  Main,
  Drawer,
  Wallet,
  Profile,
  EditProfile,
  QRCamera,
  CashIn,
  TransactionDetails,
  TransactionHistory,
  About,
  Support,
} from '../screen';
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
          headerStyle: {
            backgroundColor: '#F4F4FB', // Set header background color
          },
        })}
      />

      <InsideStack.Screen
        name={ROUTES.ABOUT}
        component={About}
        options={() => ({
          ...TransitionPresets.SlideFromRightIOS,
          gestureDirection: 'horizontal',
          headerTitleAlign: 'center',
          headerTitle: 'About',
          headerStyle: {
            backgroundColor: '#F4F4FB', // Set header background color
          },
        })}
      />

      <InsideStack.Screen
        name={ROUTES.SUPPORT}
        component={Support}
        options={() => ({
          ...TransitionPresets.SlideFromRightIOS,
          gestureDirection: 'horizontal',
          headerTitleAlign: 'center',
          headerTitle: 'Feedback',
          headerStyle: {
            backgroundColor: '#F4F4FB', // Set header background color
          },
        })}
      />

      <InsideStack.Screen
        name={ROUTES.CASHIN}
        component={CashIn}
        options={() => ({
          ...TransitionPresets.SlideFromRightIOS,
          gestureDirection: 'horizontal',
          headerTitleAlign: 'center',
          headerTransparent: true,
          headerTitle: 'Cash In',
        })}
      />

      <InsideStack.Screen
        name={ROUTES.TRANSACTIONHISTORY}
        component={TransactionHistory}
        options={() => ({
          ...TransitionPresets.SlideFromRightIOS,
          gestureDirection: 'horizontal',
          headerTitleAlign: 'center',
          headerTitle: 'All Transcations',
          headerStyle: {
            backgroundColor: '#F4F4FB', // Set header background color
          },
        })}
      />

      <InsideStack.Screen
        name={ROUTES.TRANSACTIONDETAILS}
        component={TransactionDetails}
        options={() => ({
          ...TransitionPresets.SlideFromRightIOS,
          gestureDirection: 'horizontal',
          headerTitleAlign: 'center',
          headerTitle: 'Transaction Details',
          headerStyle: {
            backgroundColor: '#F4F4FB', // Set header background color
          },
        })}
      />

      <InsideStack.Screen
        name={ROUTES.QRCAMERA}
        component={QRCamera}
        options={() => ({
          ...TransitionPresets.SlideFromRightIOS,
          gestureDirection: 'horizontal',
          headerTitleAlign: 'center',
          headerTransparent: true,
          headerTitle: () => null,
        })}
      />

      {/* Profile */}

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
