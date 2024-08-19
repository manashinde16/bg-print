import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import SplashScreen from '../bg-print/src/components/Splashscreen';
import LoginScreen from './src/components/login/Loginscreen';
import SignUpScreen from './src/components/signup/Signupscreen';
import HomeScreen from '../bg-print/src/components/Homescreen';
import ConfirmSignUpScreen from './src/components/signup/ConfirmSignupscreen';
import MFAScreen from './src/components/login/Mfascreen';

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
          component={HomeScreen}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
