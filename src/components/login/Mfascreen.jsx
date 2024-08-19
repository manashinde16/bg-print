import React, {useState} from 'react';
import {View, Text, TextInput, Button, StyleSheet} from 'react-native';
import {CognitoUser, CognitoUserPool} from 'amazon-cognito-identity-js';

// Define userPool here with your hardcoded values
const userPoolData = {
  UserPoolId: 'eu-north-1_dkdFmS9nJ', // replace with your User Pool ID
  ClientId: '6kdgabhjq9s1a1en9ge8r8fbiv', // replace with your Client ID
};

const userPool = new CognitoUserPool(userPoolData);

const MFAScreen = ({route, navigation}) => {
  const {username, challengeName} = route.params;
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);

  const handleMFA = () => {
    const userData = {
      Username: username,
      Pool: userPool,
    };
    const cognitoUser = new CognitoUser(userData);

    cognitoUser.sendMFACode(code, {
      onSuccess: result => {
        console.log('MFA success:', result);
        setError(null);
        navigation.navigate('Home'); // Navigate to home screen after successful MFA
      },
      onFailure: err => {
        setError('MFA error: ' + err.message);
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter MFA Code</Text>
      <TextInput
        placeholder="MFA Code"
        value={code}
        onChangeText={setCode}
        style={styles.input}
      />
      <Button title="Verify" onPress={handleMFA} />
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

export default MFAScreen;
