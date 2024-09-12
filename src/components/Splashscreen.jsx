import React, {useEffect} from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';

const SplashScreen = ({navigation}) => {
  useEffect(() => {
    // Navigate to Login screen after 4 seconds
    const timer = setTimeout(() => {
      navigation.navigate('Home');
    }, 4000); // 4 seconds delay

    // Cleanup timer if the component is unmounted before 4 seconds
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BG PRINTS</Text>
      <Text style={styles.subtitle}>Print Anywhere, Delivered Everywhere</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3066d8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    color: '#fff',
    fontFamily: 'Poppins-Bold', // Ensure you've added this font to your project
    fontWeight: 'semibold',
  },
  subtitle: {
    fontSize: 11,
    color: '#fff',
    marginTop: 10,
    fontFamily: 'Poppins-Regular', // Ensure you've added this font to your project
  },
});

export default SplashScreen;
