import React from 'react';
import {View, Text, Button, StyleSheet} from 'react-native';

const SignUpScreen = ({navigation}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Sign Up Screen</Text>
      <Button title="Go to Home" onPress={() => navigation.navigate('Home')} />
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
  },
});

export default SignUpScreen;
