import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity, PermissionsAndroid, Platform, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/Entypo';
import { useNavigation } from '@react-navigation/native';
import {API_URL, GOOGLE_API_KEY} from 'react-native-dotenv';
import axios from 'axios';

// Hardcoded data for location and distance/time
const HARDCODED_LOCATION = {
  latitude: 18.536202,
  longitude: 73.832261,
  name: 'Baner'
};

const HARDCODED_DISTANCE_TIME = {
  distance: '2.5 km',
  time: '10 mins'
};

// Comment out the Google API function and replace with a mock function
// const calculateDistanceAndTime = async (lat1, lon1, lat2, lon2) => {
//   try {
//     const response = await fetch(
//       `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${lat1},${lon1}&destinations=${lat2},${lon2}&key=${GOOGLE_API_KEY}`
//     );
//     const data = await response.json();

//     if (data.status === "OK" && data.rows[0].elements[0].status === "OK") {
//       const distance = data.rows[0].elements[0].distance.text;
//       const time = data.rows[0].elements[0].duration.text;

//       return { distance, time };
//     } else {
//       console.error("Error calculating distance and time:", data.rows[0].elements[0].status, data.rows[0].elements[0].error_message);
//       return { distance: "N/A", time: "N/A" };
//     }
//   } catch (error) {
//     console.error("Error fetching distance matrix data:", error);
//     return { distance: "N/A", time: "N/A" };
//   }
// };

const mockCalculateDistanceAndTime = async () => {
  return HARDCODED_DISTANCE_TIME;
};

const isVendorOpen = (businessHours) => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const currentTime = now.getHours() * 100 + now.getMinutes();

  const todayHours = businessHours.find(hour => hour.day === dayOfWeek);
  if (!todayHours) return false;

  const openTime = parseInt(todayHours.open_time.replace(':', ''), 10);
  const closeTime = parseInt(todayHours.close_time.replace(':', ''), 10);

  return currentTime >= openTime && currentTime <= closeTime;
};

const HomeScreen = () => {
  const [location, setLocation] = useState('Fetching location...');
  const [vendorData, setVendorData] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [servicesData, setServicesData] = useState([]);
  const [coordinates, setCoordinates] = useState({ latitude: null, longitude: null });
  const navigation = useNavigation();

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        try {
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
        } catch (err) {
          console.warn(err);
          setErrorMessage('Error requesting location permission');
        }
      } else {
        getCurrentLocation();
      }
    };

    const getCurrentLocation = async () => {
      // Comment out the Google API call and use hardcoded data
      // try {
      //   const response = await axios.post(
      //     `https://www.googleapis.com/geolocation/v1/geolocate?key=${GOOGLE_API_KEY}`
      //   );
      //   const { lat: latitude, lng: longitude } = response.data.location;
      //   console.log({latitude, longitude});
      //   setCoordinates({ latitude, longitude });
      //   fetchLocationName(latitude, longitude);
      //   fetchVendorData(latitude, longitude);
      // } catch (error) {
      //   console.error("Error fetching location:", error.response?.data || error.message);
      //   setErrorMessage(`Error fetching location: ${error.response?.data?.error?.message || error.message}`);
      // }
      
      // Use hardcoded location data
      const { latitude, longitude, name } = HARDCODED_LOCATION;
      setCoordinates({ latitude, longitude });
      setLocation(name);
      fetchVendorData(latitude, longitude);
    };    

    // Comment out the Google API function for fetching location name
    // const fetchLocationName = async (lat, lon) => {
    //   ... (previous implementation)
    // };

    const fetchVendorData = async (latitude, longitude) => {
      try {
        const response = await axios.get(`${API_URL}/services/0/vendors/`, {
          params: {
            latitude: latitude,
            longitude: longitude,
          },
        });
        
        const data = response.data;
        const activeVendors = data.filter(vendor => vendor.is_active);
        setVendorData(activeVendors);
      } catch (error) {
        console.error('Error fetching vendor data:', error.message);
        setErrorMessage('Error fetching vendor data. Please try again later.');
      }
    };
   
    const fetchServicesData = async () => {
      try {
        const response = await axios.get(`${API_URL}/services/`);
        setServicesData(response.data);
      } catch (error) {
        console.error('Error fetching services data:', error.message);
        setErrorMessage('Error fetching services data');
      }
    };

    requestLocationPermission();
    fetchServicesData();
  }, []);

  useEffect(() => {
    const calculateDistanceAndTimeForVendors = async () => {
      if (vendorData.length > 0 && coordinates.latitude && coordinates.longitude) {
        const updatedVendorData = await Promise.all(
          vendorData.map(async (vendor) => {
            // Use the mock function instead of the real one
            const result = await mockCalculateDistanceAndTime();
            return { ...vendor, distance: result.distance, time: result.time };
          })
        );
        setVendorData(updatedVendorData);
      }
    };
  
    calculateDistanceAndTimeForVendors();
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

  const renderVendorItem = ({ item }) => {
    const servicesListnavi = item.vendor_services.map(service => ({
      id: service.service.id,
      name: service.service.name,
    }));
    const servicesList = servicesListnavi.map(service => service.name).join(', ');
    const isOpen = isVendorOpen(item.business_hours);

    return (
      <TouchableOpacity
        style={styles.providerCard}
        onPress={() => {
          if (coordinates.latitude && coordinates.longitude) {
            navigation.navigate('Upload', {
              vendorId: item.id,
              services: servicesListnavi,
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
            });
          } else {
            setErrorMessage('Location data is not available.');
          }
        }}
      >
        <Image
          source={{ uri: item.vendor_logo_url || 'https://via.placeholder.com/400x200.png?text=Service+Image' }}
          style={styles.providerImage}
        />
        <View style={styles.providerDetails}>
          <Text style={styles.providerName}>{item.business_name}</Text>
          <Text style={styles.providerInfo} numberOfLines={2}>{item.address}</Text>
          <Text style={styles.serviceList}>{servicesList}</Text>
          <View style={styles.providerFooter}>
            <Text style={styles.timeDistance}>{item.distance || 'Calculating'}</Text>
            <Text style={styles.timeDistance}>{item.time || '...'}</Text>
            <View style={styles.ratingContainer}>
              <Icon2 name="star" size={12} color="#FFD700" />
              <Text style={styles.ratingText}>{item.reviews_and_ratings}</Text>
            </View>
            <Text style={[styles.statusTag, { color: isOpen ? 'green' : 'red' }]}>
              {isOpen ? 'Open Now' : 'Closed Now'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
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

      <FlatList
        data={vendorData}
        renderItem={renderVendorItem}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.vendorsContainer}
      />

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
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 20,
    marginTop: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 80,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#5B82F9',
  },
  servicesContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  serviceItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
    margin: '1.5%',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 5,
    elevation: 2, // Adds shadow for better visual effect
  },
  serviceIcon: {
    width: 60, // Adjust to fit your design
    height: 60, // Adjust to fit your design
    borderRadius: 30, // Half of width/height to make it circular
    marginBottom: 5,
    backgroundColor: '#eee', // Optional: background color for visibility
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  serviceIconImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain', // Ensures the image fits within the circle
  },
  serviceText: {
    fontSize: 14,
    color: '#333',
  },
  providerCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  providerDetails: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  providerInfo: {
    fontSize: 14,
    color: '#666',
    marginVertical: 5,
  },
  serviceList: {
    fontSize: 12,
    color: '#888',
    marginVertical: 5,
  },
  providerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeDistance: {
    fontSize: 12,
    color: '#666',
  },
  fastTag: {
    fontSize: 12,
    color: '#5B82F9',
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 5,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  statusTag: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
