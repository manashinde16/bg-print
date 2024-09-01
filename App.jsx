import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import SplashScreen from './src/components/Splashscreen';
import LoginScreen from './src/components/login/Loginscreen';
import SignUpScreen from './src/components/signup/Signupscreen';
import VendorsList from './src/components/Vendors/VendorsList'
import HomeScreen from './src/components/home/Homescreen';
import ConfirmSignUpScreen from './src/components/signup/ConfirmSignupscreen';
import UploadScreen from './src/components/Upload/UploadFiles';
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
        <Stack.Screen
          name="Vendors"
          component={VendorsList}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Upload"
          component={UploadScreen}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
