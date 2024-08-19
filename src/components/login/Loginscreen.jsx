import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import {signIn, getCurrentUser} from '../../services/CognitoServices';
import GoogleSignIn from './Googlesignin';

const LoginScreen = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userSession, setUserSession] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = () => {
    getCurrentUser((err, session) => {
      if (err) {
        setUserSession(null);
      } else {
        setUserSession(session);
      }
    });
  };

  const handleSignIn = () => {
    signIn(username, password, (err, result) => {
      if (err) {
        setError('Sign in error: ' + err.message);
      } else {
        setUserSession(result);
        setError(null);
        navigation.navigate('Home'); // Add your navigation route here
      }
    });
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Text style={styles.line}>BG-PRINTS</Text>

      {/* Tagline */}
      <Text style={styles.tagline}>Print Anywhere, Delivered Everywhere</Text>

      {/* Login Title */}
      <Text style={styles.loginTitle}>Login to your account</Text>

      {/* Username Input */}
      <TextInput
        placeholder="Username"
        placeholderTextColor="#B0B0B0"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />

      {/* Password Input */}
      <TextInput
        placeholder="Password"
        placeholderTextColor="#B0B0B0"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      {/* Error Message */}
      {error && <Text style={{color: 'red'}}>{error}</Text>}

      {/* Login Button */}
      <TouchableOpacity style={styles.loginButton} onPress={handleSignIn}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      {/* Or sign in with */}
      <Text style={styles.orText}>Or sign in with:</Text>

      {/* Social Media Buttons */}
      <View style={styles.socialContainer}>
        <TouchableOpacity>
          <Image
            source={require('../../../assets/images/google.png')}
            style={styles.socialIcon}
          />
          <GoogleSignIn />
        </TouchableOpacity>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  line: {
    color: '#004BB8',
    fontSize: 40,
  },
  tagline: {
    color: '#004BB8',
    fontSize: 11,
    marginBottom: 80,
    marginLeft: 20,
  },
  loginTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    marginRight: 130,
    color: '#000',
  },
  input: {
    width: '85%',
    height: 50,
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 7,
    paddingLeft: 15,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
    color: '#000000',
  },
  loginButton: {
    width: '85%',
    height: 50,
    backgroundColor: '#004BB8',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
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
    justifyContent: 'space-around',
    width: '40%',
    marginBottom: 40,
    marginRight: 25,
  },
  socialIcon: {
    width: 50,
    height: 50,
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
