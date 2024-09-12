import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { API_URL } from 'react-native-dotenv';
import Profile from '../../../assets/icons/profile.svg';

const ServiceScreen = ({ navigation }) => {
  const [services, setServices] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
    fetchTopServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_URL}/services/`);
      const data = await response.json();
      setServices(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching services:', error);
      setLoading(false);
    }
  };

  const fetchTopServices = async () => {
    try {
      const response = await fetch(`${API_URL}/vendors/top-services/`);
      const data = await response.json();
      setTopServices(data.map(item => item.service__id));
    } catch (error) {
      console.error('Error fetching top services:', error);
    }
  };

  const renderServiceItem = ({ item }) => (
    <TouchableOpacity style={styles.serviceItem}>
      <Image source={{ uri: item.icon_url }} style={styles.serviceIcon} />
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.servicePrice}>{item.pricing}</Text>
        {topServices.includes(item.id) && (
          <View style={styles.mostUsedTag}>
            <Text style={styles.mostUsedText}>Most Used</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchBarContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Image
              source={require('../../../assets/images/arrowvendor.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            placeholder="Search....."
            placeholderTextColor="rgba(136, 136, 136, 0.6)"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <TouchableOpacity style={styles.profileContainer}>
          <Profile width={40} height={40} />
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={filteredServices}
          renderItem={renderServiceItem}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.serviceList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF', // Light blue background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchBarContainer: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    alignItems: 'center',
  },
  backButton: {
    marginRight: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  profileContainer: {
    backgroundColor: '#F5F9FF', // Adjust to match the exact screenshot
    borderRadius: 50,
    padding: 8,
    elevation: 2,
  },
  serviceList: {
    padding: 10,
  },
  serviceItem: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  serviceIcon: {
    width: 60,
    height: 60,
    marginBottom: 10,
    alignSelf: 'center', // Center the icon/logo
  },
  serviceInfo: {
    width: '100%', // To ensure full width for left-alignment
    alignItems: 'flex-start', // Left-align the text
  },
  serviceName: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  servicePrice: {
    fontSize: 14,
    color: '#777',
    marginBottom: 5,
  },
  mostUsedTag: {
    display: 'flex',
    backgroundColor: '#E6F4F1',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start', // Left-align the tag
  },
  mostUsedText: {
    fontSize: 12,
    color: '#004BB8',
    fontWeight: 'bold',
  },
});

export default ServiceScreen;
