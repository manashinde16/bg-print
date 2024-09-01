import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {useRoute} from '@react-navigation/native';
import Home from '../../../assets/icons/home.svg';
import Profile from '../../../assets/icons/profile.svg';

const Menu = ({navigation}) => {
  const route = useRoute();

  // Determine the active route
  const isHomeActive = route.name === 'Home';
  const isProfileActive = route.name === 'Services';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.navigate('Home')}
        style={[
          styles.iconContainer,
          isHomeActive && styles.activeIconContainer,
        ]}>
        <Home fill={isHomeActive ? 'black' : 'white'} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate('Services')}
        style={[
          styles.iconContainer,
          isProfileActive && styles.activeIconContainer,
        ]}>
        <Profile fill={isProfileActive ? 'black' : 'white'} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 20,
    height: 66,
    width: 316,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'black',
    borderRadius: 88,
    paddingHorizontal: 20,
    elevation: 20, // Adds shadow for Android
    shadowColor: '#000', // Adds shadow for iOS
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  iconContainer: {
    padding: 10,
    borderRadius: 40,
  },
  activeIconContainer: {
    backgroundColor: 'white',
  },
});

export default Menu;
