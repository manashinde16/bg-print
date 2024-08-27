import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity, PermissionsAndroid, Platform, FlatList } from 'react-native';
import GetLocation from 'react-native-get-location';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { GOOGLE_API_KEY, API_URL } from 'react-native-dotenv';

const calculateDistanceAndTime = async (lat1, lon1, lat2, lon2) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${lat1},${lon1}&destinations=${lat2},${lon2}&key=${GOOGLE_API_KEY}`
    );
    const data = await response.json();

    if (data.rows[0].elements[0].status === "OK") {
      const distance = data.rows[0].elements[0].distance.text;
      const time = data.rows[0].elements[0].duration.text;

      return { distance, time };
    } else {
      console.error("Error calculating distance and time:", data.rows[0].elements[0].status);
      return { distance: "N/A", time: "N/A" };
    }
  } catch (error) {
    console.error("Error fetching distance matrix data:", error);
    return { distance: "N/A", time: "N/A" };
  }
};

const HomeScreen = () => {
  const [location, setLocation] = useState('Fetching location...');
  const [vendorData, setVendorData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [servicesData, setServicesData] = useState([]);
  const [coordinates, setCoordinates] = useState({ latitude: null, longitude: null });
  const [distanceTime, setDistanceTime] = useState({ distance: 'Calculating...', time: 'Calculating...' });
  const navigation = useNavigation();

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Access Required',
            message: 'This app needs to access your location',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        } else {
          setErrorMessage('Location permission denied');
        }
      } else {
        getCurrentLocation();
      }
    };

    const getCurrentLocation = () => {
      GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 60000,
      })
        .then(location => {
          const { latitude, longitude } = location;
          setCoordinates({ latitude, longitude });
          fetchLocationName(latitude, longitude);
          fetchVendorData(latitude, longitude);
        })
        .catch(error => {
          setErrorMessage(error.message);
        });
    };

    const fetchLocationName = async (lat, lon) => {
      try {
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${GOOGLE_API_KEY}`);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const addressComponents = data.results[0].address_components;
          const specificLocation = addressComponents.find(component =>
            component.types.includes('sublocality_level_1') ||
            component.types.includes('neighborhood') ||
            component.types.includes('locality')
          );
          const locationName = specificLocation ? specificLocation.long_name : 'Local location not found';
          setLocation(locationName);
        } else {
          setLocation('Location not found');
        }
      } catch (error) {
        setLocation('Error fetching location name');
      }
    };

    const fetchVendorData = async (latitude, longitude) => {
      try {
        const response = await fetch(`${API_URL}/services/0/vendors/?latitude=${latitude}&longitude=${longitude}&limit=1`);
        const data = await response.json();
        if (data.length > 0) {
          setVendorData(data[0]);
        } else {
          setVendorData(null);
        }
      } catch (error) {
        setErrorMessage('Error fetching vendor data');
      }
    };

    const fetchServicesData = async () => {
      try {
        const response = await fetch(`${API_URL}/services/`);
        const data = await response.json();
        setServicesData(data);
      } catch (error) {
        setErrorMessage('Error fetching services data');
      }
    };

    requestLocationPermission();
    fetchServicesData();
  }, []);

  useEffect(() => {
    const calculateDistanceAndTimeForVendor = async () => {
      if (vendorData && coordinates.latitude && coordinates.longitude) {
        const { location_latitude: vendorLat, location_longitude: vendorLon } = vendorData;
        const result = await calculateDistanceAndTime(coordinates.latitude, coordinates.longitude, vendorLat, vendorLon);
        setDistanceTime(result);
      }
    };

    calculateDistanceAndTimeForVendor();
  }, [vendorData, coordinates]);

  const renderServiceItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.serviceItem}
      onPress={() => navigation.navigate('Vendors', { serviceId: item.id, ...coordinates })}
    >
      <Image source={{ uri: item.icon_url }} style={styles.serviceIcon} />
      <Text style={styles.serviceText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderVendorItem = () => {
    if (!vendorData || !coordinates.latitude || !coordinates.longitude) return null;

    return (
      <View style={styles.providerCard}>
        <Image
          source={{ uri: vendorData.vendor_logo_url || 'https://via.placeholder.com/400x200.png?text=Service+Image' }}
          style={styles.providerImage}
        />
        <View style={styles.providerDetails}>
          <Text style={styles.providerName}>{vendorData.business_name}</Text>
          <Text style={styles.providerInfo} numberOfLines={2}>{vendorData.address}</Text>
          <View style={styles.providerFooter}>
            <Text style={styles.timeDistance}>{distanceTime.distance}</Text>
            <Text style={styles.timeDistance}>{distanceTime.time}</Text>
            <Text style={styles.fastTag}>NEAR & FAST</Text>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={12} color="#FFD700" />
              <Text style={styles.ratingText}>{vendorData.reviews_and_ratings}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundRectangle} />

      <View style={styles.locationContainer}>
        <Icon name="map-marker" size={20} color="#fff" style={styles.locationIcon} />
        <Text style={styles.locationText}>Location</Text>
        <Text style={styles.locationName}>{location}</Text>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#777" />
        <TextInput placeholder="Search services or providers" style={styles.searchInput} placeholderTextColor="#777" />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Services</Text>
      </View>

      <FlatList
        data={servicesData}
        renderItem={renderServiceItem}
        keyExtractor={item => item.id.toString()}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.servicesContainer}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Popular Service Provider</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Vendors', { serviceId: 0, ...coordinates })}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>

      {renderVendorItem()}

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  backgroundRectangle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    backgroundColor: '#5B82F9',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    marginHorizontal: 20,
  },
  locationText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 5,
  },
  locationName: {
    fontSize: 16,
    color: '#fff',
    flexShrink: 1,
  },
  locationIcon: {
    marginRight: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginHorizontal: 20,
    marginTop: 20,
    elevation: 3,
  },
  searchInput: {
    marginLeft: 10,
    flex: 1,
    color: '#000',
    height: 50,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 100,
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  seeAllText: {
    color: '#5B82F9',
    fontWeight: '600',
  },
  servicesContainer: {
    paddingHorizontal: 10,
    height: 'auto'
  },
  serviceItem: {
    alignItems: 'center',
    width: '33.33%',
    marginVertical: 15,
  },
  serviceIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  serviceText: {
    textAlign: 'center',
    color: '#000',
    fontSize: 12,
    fontWeight: '500',
  },
  providerCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 10,
    marginHorizontal: 20,
    elevation: 3,
  },
  providerImage: {
    width: 120,
    height: 120,
    resizeMode: 'cover',
  },
  providerDetails: {
    flex: 1,
    padding: 15,
  },
  providerName: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#000',
    marginBottom: 5,
  },
  providerInfo: {
    color: '#666',
    marginBottom: 10,
    fontSize: 14,
  },
  providerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeDistance: {
    color: '#666',
    fontSize: 12,
  },
  fastTag: {
    color: '#fff',
    backgroundColor: '#5B82F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 10,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingText: {
    color: '#333',
    marginLeft: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff0000',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default HomeScreen;