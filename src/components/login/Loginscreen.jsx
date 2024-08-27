import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { signIn, getCurrentUser } from '../../services/CognitoServices';
import GoogleSignIn from './Googlesignin';
import ErrorModal from '../signup/ErrorModal'; // Import your ErrorModal component

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userSession, setUserSession] = useState(null);
  const [error, setError] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = () => {
    getCurrentUser((err, session) => {
      if (err) {
        console.error('Session check error:', err);
        setUserSession(null);
      } else {
        setUserSession(session);
      }
    });
  };

  const validateInputs = () => {
    const errors = [];

    if (!username.trim()) {
      errors.push('Username cannot be empty.');
    }

    if (!password.trim()) {
      errors.push('Password cannot be empty.');
    } else if (password.length < 6) {
      errors.push('Password must be at least 6 characters long.');
    }

    if (errors.length > 0) {
      setError(errors);
      setModalVisible(true);
      return false;
    }

    return true;
  };

  const handleSignIn = () => {
    if (validateInputs()) {
      signIn(username, password, (err, result) => {
        if (err) {
          setError(['Sign in error: ' + err.message]);
          setModalVisible(true);
        } else {
          setUserSession(result);
          setError(null);
          navigation.navigate('Home'); // Add your navigation route here
        }
      });
    }
  };

  const handleGoogleSignIn = () => {
    // Call your GoogleSignIn logic here
    console.log('Google Sign-In button pressed');
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Text style={styles.line}>BG-PRINTS</Text>

      {/* Tagline */}
      <Text style={styles.tagline}>Print Anywhere, Delivered Everywhere</Text>

      {/* Login Title */}
      <View style={styles.leftAlignContainer}>
        <Text style={styles.loginTitle}>Login to your account</Text>
      </View>

      {/* Username Input */}
      <View style={styles.shadowContainer}>
        <TextInput
          placeholder="Username"
          placeholderTextColor="#B0B0B0"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
        />
      </View>

      {/* Password Input */}
      <View style={styles.shadowContainer}>
        <TextInput
          placeholder="Password"
          placeholderTextColor="#B0B0B0"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
      </View>

      {/* Login Button */}
      <TouchableOpacity style={styles.loginButton} onPress={handleSignIn}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      {/* Or sign in with */}
      <Text style={styles.orText}>Or sign in with:</Text>

      {/* Social Media Buttons */}
      <View style={styles.socialContainer}>
        <GoogleSignIn
          onSuccess={handleGoogleSignIn}
          onError={handleGoogleSignIn}
        />
        
        <TouchableOpacity>
          <Image
            source={require('../../../assets/images/facebook.png')}
            style={styles.socialIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Sign Up Link */}
      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.signUpText}>
          Don’t have an account? <Text style={styles.signUpLink}>Sign up</Text>
        </Text>
      </TouchableOpacity>

      {/* Error Modal */}
      <ErrorModal
        visible={isModalVisible}
        errorMessages={error}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 30,
  },
  line: {
    fontFamily: 'Poppins',
    fontSize: 40,
    fontWeight: '900',
    color: '#004BB8',
    textAlign: 'center',
    marginTop: 50,
  },
  tagline: {
    fontSize: 10,
    color: '#004BB8',
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  leftAlignContainer: {
    alignSelf: 'flex-start',
    marginTop: 50,
  },
  loginTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
    textShadowRadius: 2,
    textShadowOffset: {
      width: 2,
      height: 2,
    },
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    marginLeft: 15,
  },
  shadowContainer: {
    marginTop: 10,
    width: '90%',
    height: 45,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    justifyContent: 'center',
  },
  input: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    color: '#000000',
  },
  loginButton: {
    width: '90%',
    height: 50,
    backgroundColor: '#004BB8',
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orText: {
    fontSize: 14,
    color: '#808080',
    marginBottom: 15,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignContent: 'center',
    width: '60%',
    marginBottom: 40,
    marginRight: 25,
  },
  socialIcon: {
    width: 50,
    height: 50,
    marginLeft:2,
  },
  signUpText: {
    fontSize: 14,
    color: '#808080',
  },
  signUpLink: {
    color: '#001C7A',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
