import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  ScrollView,
  StyleSheet,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import PhoneInput from 'react-native-phone-input';
import { signUp, checkUsernameAvailability } from '../../services/CognitoServices';
import GoogleSignIn from '../login/Googlesignin';
import ErrorModal from './ErrorModal';  // Import ErrorModal component

const { width } = Dimensions.get('window');

const SignUpScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [isPasswordVisible, setPasswordVisibility] = useState(false);
  const [isModalVisible, setModalVisibility] = useState(false);
  const [error, setError] = useState([]); // Ensure this is an array

  const handleSignUp = async () => {
    let errors = [];
    // Reset errors
    setError([]);
    // Collect errors based on validation
    if (!validateUsername(username)) {
      errors.push('Username must be 3-20 characters long and can include letters, numbers, or underscores.');
    }
    if (!validateEmail(email)) {
      errors.push('Please enter a valid email address.');
    }
    if (!validatePassword(password)) {
      errors.push('Password must be at least 8 characters long, include a number, an uppercase letter, a lowercase letter, and a special character.');
    }
    if (!validatePhoneNumber(phoneNumber)) {
      errors.push('Phone number must be exactly 10 digits.');
    }
    if (!name) {
      errors.push('Please enter your name.');
    }
    if (!birthdate) {
      errors.push('Please select your birthdate.');
    }
    // If there are errors, display them in the modal
    if (errors.length > 0) {
      setError(errors);
      setModalVisibility(true);
      return; // Prevent further execution
    }
    try {
      const isAvailable = await checkUsernameAvailability(username);
      
      signUp(
        username,
        password,
        email,
        birthdate,
        name,
        phoneNumber,  // Pass phoneNumber
        (err, result) => {
          if (err) {
            setError(['Sign up error: ' + err.message]);
            setModalVisibility(true);
          } else {
            setError([]);
            navigation.navigate('ConfirmSignUp', { username });
          }
        }
      );
    } catch (error) {
      setError(['Error: ' + error.message]);
      setModalVisibility(true);
    }
  };

  const validateUsername = (username) => {
    const usernamePattern = /^[a-zA-Z0-9_]{3,20}$/;
    return usernamePattern.test(username);
  };

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@(gmail|outlook|yahoo|hotmail)\.com$/;
    return emailPattern.test(email);
  };

  const validatePassword = (password) => {
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordPattern.test(password);
  };

  const validatePhoneNumber = (number) => {
    const digitsOnly = number.replace(/\D/g, '');
    return digitsOnly.length === 12;
  };

  const handleConfirm = (date) => {
    const today = new Date();
    const ageLimit = 16;
    const birthDate = new Date(date);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (birthDate > today) {
      setError('Birthdate cannot be in the future.');
      setBirthdate('');
      setModalVisibility(true);
    } else if (age < ageLimit || (age === ageLimit && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)))) {
      setError('You must be at least 16 years old.');
      setBirthdate('');
      setModalVisibility(true);
    } else {
      setBirthdate(date.toISOString().split('T')[0]);
      setError('');r
    }
    setDatePickerVisibility(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>BG PRINTS</Text>
      <Text style={styles.tagline}>Print Anywhere, Delivered Everywhere</Text>
      <View style={styles.leftAlignContainer}>
        <Text style={styles.createAccount}>Create your account</Text>
      </View>

      <View style={styles.shadowContainer}>
        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          placeholderTextColor="#808080"
        />
      </View>

      <View style={styles.shadowContainer}>
        <TextInput
          placeholder="Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholderTextColor="#808080"
        />
      </View>

      <View style={styles.shadowContainer}>
  <TouchableOpacity 
    style={styles.datePickerButton} 
    onPress={() => setDatePickerVisibility(true)}
  >
    <View style={styles.datePickerContent}>
      {/* Placeholder text when birthdate is not set */}
      <Text 
        style={[
          styles.datePickerText, 
          !birthdate && styles.placeholderText // Apply placeholder style if no birthdate
        ]}
      >
        {birthdate || 'DD/MM/YYYY'}
      </Text>
      <Image 
        source={require('../../../assets/images/Calender.png')} 
        style={styles.calendarIcon} 
      />
    </View>
  </TouchableOpacity>

  <DateTimePickerModal
    isVisible={isDatePickerVisible}
    mode="date"
    onConfirm={handleConfirm}
    onCancel={() => setDatePickerVisibility(false)}
  />
</View>

      <View style={styles.shadowContainer}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          placeholderTextColor="#808080"
          
        />
      </View>

      <View style={styles.shadowContainer}>
        <PhoneInput
          textStyle={{ color: '#000000' }}
          placeholder="Phone Number"
          initialCountry="in"
          accessibilityLabel="Telephone Input"
          value={phoneNumber}
          onChangePhoneNumber={setPhoneNumber}
          style={styles.input}
          flagStyle={styles.flag}
          pickerBackgroundColor="black"
          
        />
      </View>

      <View style={styles.shadowContainer}>
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.passwordInput}
            secureTextEntry={!isPasswordVisible}
            placeholderTextColor="#808080"
          />
          <TouchableOpacity onPress={() => setPasswordVisibility(!isPasswordVisible)}>
            <Image
              source={isPasswordVisible ? require('../../../assets/images/eye-open.png') : require('../../../assets/images/eye-closed.png')}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
        <Text style={styles.signUpButtonText}>Sign Up</Text>
      </TouchableOpacity>

      <Text style={styles.socialtext}>Or Sign Up with</Text>
      <GoogleSignIn />

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.signUpText}>
          Don’t have an account? <Text style={styles.signUpLink}>Sign In</Text>
        </Text>
      </TouchableOpacity>

      <ErrorModal
        visible={isModalVisible}
        errorMessages={error}
        onClose={() => setModalVisibility(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 30,
  },
  title: {
    fontFamily:'Poppins',
    fontSize: 40,
    fontWeight: '900',
    color: '#004BB8',
    textAlign: 'center',
  
  },
  tagline: {
    fontSize: 10,
    color: '#004BB8',
    textAlign: 'center',
    fontFamily:'Poppins',
  },
  leftAlignContainer: {
    alignSelf: 'flex-start',
    marginTop: 20,
  },
  createAccount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
    textShadowRadius:2,
    textShadowOffset: {
      width:2,
      height:2,
    },
    textShadowColor:'rgba(0, 0, 0, 0.25)',
    marginLeft:15,
  },
  shadowContainer: {
    marginTop: 10,
    width: '90%',
    height: 45,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth:1,
    borderColor:'#000000',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    justifyContent:'center',
  },
  input: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    color: '#000000',
    
  },
  datePickerButton: {
    width: '100%',
  },
  datePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignContent:'center',
    margin:9,
  },
  datePickerText: {
    fontSize: 16,
    color: '#000', // Default color for actual date
  },
  placeholderText: {
    color: '#aaa', // Lighter color for the placeholder text
    marginLeft:5,
  },
  calendarIcon: {
    width: 20,
    height: 20,
    marginRight:5,
  },
  passwordContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 15,
    color: '#000000',
    
  },
  signUpButton: {
    marginTop: 10,
    width: '90%',
    height:50,
    borderRadius: 10,
    backgroundColor: '#004BB8',
    alignItems: 'center',
    justifyContent:'center'
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight:'700'
  },
  socialtext: {
    marginTop: 20,
    color: '#4B4B4B',
    fontSize: 16,
  },
  signInLink: {
    marginTop: 15,
    fontSize: 12,
    color: '#004BB8',
    textDecorationLine: 'underline',
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 15,
    opacity:0.8,
    
  },
  flag: {
   alignContent:'center',
   justifyContent:'center',
   marginTop:4
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

export default SignUpScreen;
