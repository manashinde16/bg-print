import React, {useState} from 'react';
import {View, Text, Button, TextInput, StyleSheet} from 'react-native';
import {signUp} from '../../services/CognitoServices'; // Import your signUp function

const SignUpScreen = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [phonenumber, setPhonenumber] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);

  const handleSignUp = () => {
    signUp(
      username,
      password,
      email,
      birthdate,
      phonenumber,
      name,
      (err, result) => {
        if (err) {
          setError('Sign up error: ' + err.message);
        } else {
          console.log('Sign up successful:', result);
          setError(null);
          // Navigate back to the login screen after successful sign-up
          navigation.navigate('ConfirmSignUp', {username});
        }
      },
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Sign Up Screen</Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Birthdate"
        value={birthdate}
        onChangeText={setBirthdate}
        style={styles.input}
      />
      <TextInput
        placeholder="Phone Number"
        value={phonenumber}
        onChangeText={setPhonenumber}
        style={styles.input}
      />
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      {error && <Text style={{color: 'red'}}>{error}</Text>}
      <Button title="Sign Up" onPress={handleSignUp} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#000',
    color: '#000',
    borderRadius: 5,
  },
});

export default SignUpScreen;
