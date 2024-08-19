import React, {useEffect} from 'react';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {View, Button, StyleSheet} from 'react-native';
import {signInWithGoogle} from '../../services/CognitoServices'; // Import your Cognito service
import {GOOGLE_CLIENT_ID} from 'react-native-dotenv';

GoogleSignin.configure({
  webClientId: GOOGLE_CLIENT_ID, // Client ID obtained from Google Developer Console
});

const GoogleSignIn = () => {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_CLIENT_ID,
    });
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const {id_token} = userInfo;
      signInWithGoogle(id_token, (err, result) => {
        if (err) {
          console.error('Google sign-in error:', err.message);
        } else {
          console.log('Google sign-in successful:', result);
        }
      });
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.error('User cancelled the login');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.error('Signing in');
      } else {
        console.error('Some other error happened', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Sign In with Google" onPress={handleGoogleSignIn} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
});

export default GoogleSignIn;
