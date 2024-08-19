import React, {useState} from 'react';
import {View, Text, TextInput, Button, StyleSheet} from 'react-native';
import {confirmSignUp} from '../../services/CognitoServices'; // Import confirmSignUp function

const ConfirmSignUpScreen = ({route, navigation}) => {
  const {username} = route.params; // Get username from route params
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);

  const handleConfirmSignUp = () => {
    confirmSignUp(username, code, (err, result) => {
      if (err) {
        setError('Confirmation error: ' + err.message);
      } else {
        console.log('Confirmation successful:', result);
        setError(null);
        // Redirect to the login screen or home after successful confirmation
        navigation.navigate('Login');
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirm Sign Up</Text>
      <TextInput
        placeholder="Verification Code"
        placeholderTextColor="#999"
        value={code}
        onChangeText={setCode}
        style={styles.input}
      />
      <Button title="Confirm" onPress={handleConfirmSignUp} />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginBottom: 15,
    paddingHorizontal: 10,
    fontSize: 18,
    color: '#000', // Text color
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
});

export default ConfirmSignUpScreen;
