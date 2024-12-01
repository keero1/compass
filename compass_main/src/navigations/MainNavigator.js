import React from 'react';

import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';

import {
  Main,
  Drawer,
  Profile,
  Payment,
  PaymentConfirmation,
  Transactions,
  TransactionDetails,
  Trip,
  About,
  QRCamera,
  PaymentRequest,
  Report,
} from '../screen';
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
        name={ROUTES.PAYMENTREQUEST}
        component={PaymentRequest}
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
        name={ROUTES.TRIP}
        component={Trip}
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
      <InsideStack.Screen
        name={ROUTES.ABOUT}
        component={About}
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
        name={ROUTES.REPORT}
        component={Report}
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
          headerStyle: {
            backgroundColor: '#F4F4FB', // Set header background color
          },
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

      <InsideStack.Screen
        name={ROUTES.TRANSACTIONS}
        component={Transactions}
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
        name={ROUTES.TRANSACTIONDETAILS}
        component={TransactionDetails}
        options={() => ({
          ...TransitionPresets.SlideFromRightIOS,
          gestureDirection: 'horizontal',
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#F4F4FB', // Set header background color
          },
        })}
      />
    </InsideStack.Navigator>
  );
}

export default HomeNavigator;
