/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  FlatList,
  Animated,
  Easing,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import Location from '../../../assets/icons/location.svg';
import Saly from '../../../assets/icons/Saly-16.svg';
import Bell from '../../../assets/icons/notification-bell.svg';
import Searchbar from '../../../assets/icons/search.svg';
import {API_URL} from 'react-native-dotenv';
import Icon from 'react-native-vector-icons/FontAwesome';
import MenuBar from '../menu/MenuBar';

// Hardcoded data for location and distance/time
const HARDCODED_LOCATION = {
  latitude: 18.536202,
  longitude: 73.832261,
  name: 'Wakad',
};

const HARDCODED_DISTANCE_TIME = {
  distance: '2.5 km',
  time: '10 mins',
};

// Comment out the Google API function and replace with a mock function
// const calculateDistanceAndTime = async (lat1, lon1, lat2, lon2) => {
//   try {
//     const response = await fetch(
//       https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${lat1},${lon1}&destinations=${lat2},${lon2}&key=${GOOGLE_API_KEY}
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

const isVendorOpen = businessHours => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const currentTime = now.getHours() * 100 + now.getMinutes();

  const todayHours = businessHours.find(hour => hour.day === dayOfWeek);
  if (!todayHours) {
    return false;
  }

  const openTime = parseInt(todayHours.open_time.replace(':', ''), 10);
  const closeTime = parseInt(todayHours.close_time.replace(':', ''), 10);

  return currentTime >= openTime && currentTime <= closeTime;
};

const HomeScreen = ({navigation}) => {
  const [location, setLocation] = useState('Fetching location...');
  const [vendorData, setVendorData] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [servicesData, setServicesData] = useState([]);
  const [coordinates, setCoordinates] = useState({
    latitude: null,
    longitude: null,
  });
  const [isSearchVisible, setIsSearchVisible] = useState(false); // State to handle search visibility
  const [searchAnim] = useState(new Animated.Value(0));
  const [searchTerm, setSearchTerm] = useState('');


  const filteredServicesData = useMemo(() => {
    return servicesData.filter(service => service.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, servicesData]);

  const ServiceItem = React.memo(({ item, onPress }) => (
    <TouchableOpacity style={styles.serviceItem} onPress={onPress}>
      <Image source={{ uri: item.icon_url }} style={styles.serviceIcon} />
      <Text style={styles.serviceText}>{item.name}</Text>
    </TouchableOpacity>
  ));

  const VendorItem = React.memo(({ item, onPress, coordinates }) => {
    const servicesListnavi = item.vendor_services.map(service => ({
      id: service.service.id,
      name: service.service.name,
    }));
    const servicesList = servicesListnavi.map(service => service.name).join(' - ');
    const isOpen = isVendorOpen(item.business_hours);
  
    return (
      <TouchableOpacity style={styles.providerCard} onPress={onPress}>
        <Image
          source={{
            uri: item.vendor_logo_url || 'https://via.placeholder.com/400x200.png?text=Service+Image',
          }}
          style={styles.providerImage}
        />
        <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>{item.reviews_and_ratings}</Text>
            </View>
        <View style={styles.providerDetails}>
          <Text style={styles.providerName}>{item.business_name}</Text>
          <Text style={styles.serviceList}>{servicesList}</Text>
          <View style={styles.footerRow}>
                  <Text style={styles.time}>{item.distance || 'Calculating'}</Text>
                  <Text style={styles.dot}>•</Text>
                  <Text style={styles.distance}>
                    {item.time || '...'}
                  </Text>
                  <Text style={styles.dot}>•</Text>
                  <Text style={[styles.statusTag, { color: isOpen ? 'green' : 'red' }]}>
                    {isOpen ? 'Open Now' : 'Closed Now'}
                  </Text>
                </View>
        </View>
      </TouchableOpacity>
    );
  });

  useEffect(() => {
    const animateSearchBar = () => {
      Animated.timing(searchAnim, {
        toValue: isSearchVisible ? 1 : 0,
        duration: 300,
        easing: Easing.inOut(Easing.ease), // Adding Easing function
        useNativeDriver: false,
      }).start();
    };

    animateSearchBar();
  }, [isSearchVisible, searchAnim]);

  const toggleSearchBar = () => {
    setIsSearchVisible(!isSearchVisible);
  };

  const searchBarWidth = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '70%'],
  });

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
            },
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
      //     https://www.googleapis.com/geolocation/v1/geolocate?key=${GOOGLE_API_KEY}
      //   );
      //   const { lat: latitude, lng: longitude } = response.data.location;
      //   console.log({latitude, longitude});
      //   setCoordinates({ latitude, longitude });
      //   fetchLocationName(latitude, longitude);
      //   fetchVendorData(latitude, longitude);
      // } catch (error) {
      //   console.error("Error fetching location:", error.response?.data || error.message);
      //   setErrorMessage(Error fetching location: ${error.response?.data?.error?.message || error.message});
      // }

      // Use hardcoded location data
      const {latitude, longitude, name} = HARDCODED_LOCATION;
      setCoordinates({latitude, longitude});
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
      if (
        vendorData.length > 0 &&
        coordinates.latitude &&
        coordinates.longitude
      ) {
        const updatedVendorData = await Promise.all(
          vendorData.map(async vendor => {
            // Use the mock function instead of the real one
            const result = await mockCalculateDistanceAndTime();
            return {...vendor, distance: result.distance, time: result.time};
          }),
        );
        setVendorData(updatedVendorData);
      }
    };

    calculateDistanceAndTimeForVendors();
  }, [vendorData, coordinates]);

  const renderServiceItem = useCallback(({ item }) => (
    <ServiceItem
      item={item}
      onPress={() => navigation.navigate('Vendors', { serviceId: item.id, ...coordinates })}
    />
  ), [coordinates, navigation]);

  const renderVendorItem = useCallback(({ item }) => (
    <VendorItem
      item={item}
      onPress={() => {
        if (coordinates.latitude && coordinates.longitude) {
          navigation.navigate('Upload', {
            vendorId: item.id,
            services: item.vendor_services.map(service => ({
              id: service.service.id,
              name: service.service.name,
            })),
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
          });
        } else {
          setErrorMessage('Location data is not available.');
        }
      }}
      coordinates={coordinates}
    />
  ), [coordinates, navigation]);

  const memoizedServicesData = useMemo(() => servicesData.slice(0, 8), [servicesData]);
  const memoizedVendorData = useMemo(() => vendorData, [vendorData]);

  const renderContent = useCallback(() => (
    <SafeAreaView style={styles.container}>
    <View style={styles.content}>
      <View style={styles.locationContainer}>
        <Text style={styles.locationText}>Current Location</Text>
        <Text style={styles.locationName}>
          <Location />
          {location}
        </Text>
      </View>

      <View style={styles.bannerContainer}>
        <Text style={styles.bannerText}>Claim your daily free delivery now!</Text>
        <Saly style={styles.bannerImage} />
        <TouchableOpacity style={styles.printNowButton}>
          <Text style={styles.printNowText}>Print now</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Services</Text>
      </View>

      <FlatList
        data={memoizedServicesData}
        renderItem={renderServiceItem}
        keyExtractor={item => item.id.toString()}
        numColumns={4}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.servicesContainer}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Popular Service Provider</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Vendors', { serviceId: 0, ...coordinates })}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={memoizedVendorData}
        renderItem={renderVendorItem}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.vendorsContainer}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
      />

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      <TouchableOpacity style={styles.searchIcon} onPress={toggleSearchBar}>
        <Searchbar width="30" height="32" color="#000" />
      </TouchableOpacity>

      {isSearchVisible && (
      <Animated.View style={[styles.searchContainer, { width: searchBarWidth }]}>
        <TextInput
          placeholder="Search"
          style={styles.searchInput}
          placeholderTextColor="#000"
        />
        <TouchableOpacity onPress={toggleSearchBar}>
          <Icon name="times" size={20} color="#000" />
        </TouchableOpacity>
      </Animated.View>
      )}
      <TouchableOpacity style={styles.notificationIcon}
      onPress={() => navigation.navigate('Services')}>
        <Bell width="35" height="50" />
      </TouchableOpacity>
    </View>
    <View style={styles.menuBarContainer}>
        <MenuBar navigation={navigation} />
      </View>
    </SafeAreaView>
  ), [location, memoizedServicesData, memoizedVendorData, errorMessage, searchBarWidth, renderServiceItem, renderVendorItem, navigation, coordinates]);

  return (
    <FlatList
      data={[{ key: 'content' }]}
      renderItem={renderContent}
      keyExtractor={item => item.key}
      style={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6FCFF',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 80, // Adjust this value based on your MenuBar height
  },
  locationContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 35,
  },
  locationText: {
    fontSize: 14,
    color: '#000',
  },
  locationName: {
    fontSize: 15,
    color: '#000',
    flexShrink: 1,
    fontWeight: 'bold',
  },
  bannerContainer: {
    marginTop: 39,
    borderRadius: 27,
    height: 165,
    width: '100%',
    alignSelf: 'center',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#3066D8',
    alignItems: 'center',
  },
    menuBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bannerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingTop: 23,
    paddingRight: 153,
    paddingLeft: 28,
    paddingBottom: 7,
  },
  bannerImage: {
    width: '100%',
    height: 120,
    resizeMode: 'contain',
    marginTop: -90,
    marginLeft: 176,
  },
  printNowButton: {
    position: 'absolute',
    bottom: 10,
    left: '50%',
    transform: [{ translateX: -50 }],
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#000',
    borderRadius: 25,
    marginLeft: -104,
    marginBottom: 10,
  },
  printNowText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 29,
    marginBottom: 10,
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
    paddingVertical: 10,
  },
  serviceItem: {
    flex: 1,
    alignItems: 'center',
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    padding: 15,
  },
  serviceIcon: {
    width: 41,
    height: 41,
    borderRadius: 30,
    marginBottom: 8,
  },
  serviceText: {
    textAlign: 'center',
    color: '#333',
    fontSize: 12,
    fontWeight: '600',
  },
  providerCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    marginVertical: 10,
    elevation: 3,
    maxHeight:270,
  },
  providerImage: {
    height: 150,
    width: '100%',
    resizeMode: 'cover',
  },
  providerDetails: {
    padding: 10,
    flexDirection: 'column',
    gap: 5
  },
  providerName: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#000',
  },
  providerInfo: {
    color: '#666',
    fontSize: 14,
  },
  serviceList: {
    fontSize: 12,
    color: '#888',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(0,0,0,0.3)',
      },
  dot: {
    marginHorizontal: 5,
    fontSize: 14,
    color: 'rgba(0,0,0,0.3)',
  },
  distance: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(0,0,0,0.3)',
  },
  ratingContainer: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#E6F4F1',
    backgroundColor: '#E6F4F1',
    position: 'absolute',
    width:32.15,
    height:19,
    top:10,
    right:10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  ratingText: {
    fontSize: 12,
    color: '#004BB8',
    fontWeight: 'bold',
  },
  statusTag: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchIcon: {
    position: 'absolute',
    top: 65,
    left: 22,
    zIndex: 1,
  },
  searchContainer: {
    position: 'absolute',
    height: 50,
    top: 55,
    left: 58,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    paddingHorizontal: 20,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    zIndex: 2,
  },
  searchInput: {
    flex: 1,
    marginRight: 10,
    color: '#000000',
  },
  notificationIcon: {
    position: 'absolute',
    top: 55,
    right: 20,
    zIndex: 1,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default HomeScreen;