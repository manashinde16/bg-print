import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import SplashScreen from '../bg-print/src/components/splash/Splashscreen';
import LoginScreen from '../bg-print/src/components/login/Loginscreen';
import SignUpScreen from '../bg-print/src/components/signup/Signupscreen';
import VendorsList from '../bg-print/src/components/vendors/VendorsList';
import Homescreen from '../bg-print/src/components/home/Homescreen';
import ConfirmSignUpScreen from '../bg-print/src/components/signup/ConfirmSignupscreen';
import MFAScreen from '../bg-print/src/components/login/Mfascreen';
import Menu from '../bg-print/src/components/menu/Menuscreen';
import Servicesscreen from './src/components/services/Servicesscreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="MFAScreen"
          component={MFAScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          //options={{headerShown: false}}
        />
        <Stack.Screen
          name="ConfirmSignUp"
          component={ConfirmSignUpScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Home"
          component={HomescreenWithMenu}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Services"
          component={ServicesscreenWithMenu}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Vendors"
          component={VendorsList}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const HomescreenWithMenu = ({route, navigation}) => {
  return (
    <>
      <Homescreen route={route} navigation={navigation} />
      <Menu />
    </>
  );
};

const ServicesscreenWithMenu = ({route, navigation}) => {
  return (
    <>
      <Servicesscreen route={route} navigation={navigation} />
      <Menu />
    </>
  );
};

export default App;
