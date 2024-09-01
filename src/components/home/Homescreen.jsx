/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
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
} from 'react-native';
import GetLocation from 'react-native-get-location';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useNavigation} from '@react-navigation/native';
import Searchbar from '../../../assets/icons/search.svg';
import Bell from '../../../assets/icons/notification-bell.svg';
import Location from '../../../assets/icons/location.svg';
import {ScrollView} from 'react-native-gesture-handler';
import Saly from '../../../assets/images/Saly-16.svg';
import {GOOGLE_API_KEY} from 'react-native-dotenv';
import {API_URL} from 'react-native-dotenv';

const calculateDistanceAndTime = async (lat1, lon1, lat2, lon2) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${lat1},${lon1}&destinations=${lat2},${lon2}&key=${GOOGLE_API_KEY}`,
    );
    const data = await response.json();

    if (data.rows[0].elements[0].status === 'OK') {
      const distance = data.rows[0].elements[0].distance.text;
      const time = data.rows[0].elements[0].duration.text;

      return {distance, time};
    } else {
      console.error(
        'Error calculating distance and time:',
        data.rows[0].elements[0].status,
      );
      return {distance: 'N/A', time: 'N/A'};
    }
  } catch (error) {
    console.error('Error fetching distance matrix data:', error);
    return {distance: 'N/A', time: 'N/A'};
  }
};

const Homescreen = () => {
  const [location, setLocation] = useState('Fetching location...');
  const [vendorData, setVendorData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [servicesData, setServicesData] = useState([]);
  const [coordinates, setCoordinates] = useState({
    latitude: null,
    longitude: null,
  });
  const [distanceTime, setDistanceTime] = useState({
    distance: 'Calculating...',
    time: 'Calculating...',
  });
  const [isSearchVisible, setIsSearchVisible] = useState(false); // State to handle search visibility
  const [searchAnim] = useState(new Animated.Value(0));

  const navigation = useNavigation();

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
    outputRange: ['0%', '100%'],
  });

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
          },
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
        // eslint-disable-next-line no-shadow
        .then(location => {
          const {latitude, longitude} = location;
          setCoordinates({latitude, longitude});
          fetchLocationName(latitude, longitude);
          fetchVendorData(latitude, longitude);
        })
        .catch(error => {
          setErrorMessage(error.message);
        });
    };

    const fetchLocationName = async (lat, lon) => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${GOOGLE_API_KEY}`,
        );
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const addressComponents = data.results[0].address_components;
          const specificLocation = addressComponents.find(
            component =>
              component.types.includes('sublocality_level_1') ||
              component.types.includes('neighborhood') ||
              component.types.includes('locality'),
          );
          const locationName = specificLocation
            ? specificLocation.long_name
            : 'Local location not found';
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
        const response = await fetch(
          `${API_URL}/services/0/vendors/?latitude=${latitude}&longitude=${longitude}&limit=1`,
        );
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
        const {location_latitude: vendorLat, location_longitude: vendorLon} =
          vendorData;
        const result = await calculateDistanceAndTime(
          coordinates.latitude,
          coordinates.longitude,
          vendorLat,
          vendorLon,
        );
        setDistanceTime(result);
      }
    };

    calculateDistanceAndTimeForVendor();
  }, [vendorData, coordinates]);

  const renderServiceItem = ({item}) => (
    <TouchableOpacity
      style={styles.serviceItem}
      onPress={() =>
        navigation.navigate('Vendors', {serviceId: item.id, ...coordinates})
      }>
      <Image source={{uri: item.icon_url}} style={styles.serviceIcon} />
      <Text style={styles.serviceText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderVendorItem = () => {
    if (!vendorData || !coordinates.latitude || !coordinates.longitude) {
      return null;
    }

    return (
      <ScrollView style={styles.providerCard}>
        <Image
          source={{
            uri:
              vendorData.vendor_logo_url ||
              'https://via.placeholder.com/400x200.png?text=Service+Image',
          }}
          style={styles.providerImage}
        />
        <View style={styles.providerDetails}>
          <Text style={styles.providerName}>{vendorData.business_name}</Text>
          <Text style={styles.providerInfo} numberOfLines={2}>
            {vendorData.address}
          </Text>
          <View style={styles.providerFooter}>
            <Text style={styles.timeDistance}>{distanceTime.distance}</Text>
            <Text style={styles.timeDistance}>{distanceTime.time}</Text>
            <Text style={styles.fastTag}>NEAR & FAST</Text>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={12} color="#FFD700" />
              <Text style={styles.ratingText}>
                {vendorData.reviews_and_ratings}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.content, isSearchVisible && {opacity: 0.5}]} />

      <View style={styles.locationContainer}>
        <Text style={styles.locationText}>Current Location</Text>
        <Text style={styles.locationName}>
          <Location />
          {location}
        </Text>
      </View>

      <View style={styles.bannerContainer}>
        <Text style={styles.bannerText}>
          Claim your daily free delivery now!
        </Text>
        <Saly style={styles.bannerImage} />
        <TouchableOpacity style={styles.printNowButton}>
          <Text style={styles.printNowText}>Print now</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Services</Text>
      </View>

      <FlatList
        data={servicesData}
        renderItem={renderServiceItem}
        keyExtractor={item => item.id.toString()}
        numColumns={4}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.servicesContainer}
        pagingEnabled={true}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Popular Service Provider</Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('Vendors', {serviceId: 0, ...coordinates})
          }>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>

      {renderVendorItem()}

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      <TouchableOpacity style={styles.searchIcon} onPress={toggleSearchBar}>
        <Searchbar width="30" height="32" color="#000" />
      </TouchableOpacity>

      {isSearchVisible && (
        <Animated.View
          style={[styles.searchContainer, {width: searchBarWidth}]}>
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

      <TouchableOpacity style={styles.notificationIcon}>
        <Bell width="35" height="50" />
      </TouchableOpacity>
    </ScrollView>
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

  locationContainer: {
    flexDirection: 'coloumn',
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
  locationIcon: {
    marginRight: 10,
    color: '#3066D8',
  },
  bannerContainer: {
    marginTop: 39,
    borderRadius: 27,
    height: 151,
    width: '90%', // Adjust to be a percentage of the screen width
    alignSelf: 'center', // Center the banner horizontally
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#3066D8',
    alignItems: 'center', // Center content horizontally
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
    transform: [{translateX: -50}],
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
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  viewAllButton: {
    fontSize: 14,
    color: '#007BFF',
  },
  seeAllText: {
    color: '#5B82F9',
    fontWeight: '600',
  },
  servicesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10, // Added vertical padding to avoid screen edge clipping
  },
  columnWrapper: {
    justifyContent: 'space-between', // Add space between columns
    marginBottom: 20, // Space between rows
  },
  serviceItem: {
    flex: 1,
    alignItems: 'center',
    margin: 5, // Adjust margins for balanced spacing
    backgroundColor: '#fff', // Changed background to white for a cleaner look
    borderRadius: 15,
    elevation: 4, // Added elevation for shadow effect on Android
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    padding: 15, // Added padding for better content spacing
  },
  serviceIcon: {
    width: 41,
    height: 41,
    borderRadius: 30,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceText: {
    textAlign: 'center',
    color: '#333', // Changed text color for better contrast
    fontSize: 12, // Increased font size
    fontWeight: '600', // Bolded the text
  },
  providerCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    marginVertical: 10,
    marginHorizontal: 20,
    elevation: 3,
  },
  providerImage: {
    width: 370,
    height: 205,
    resizeMode: 'cover',
  },
  providerDetails: {
    flex: 1,
    padding: 15,
  },
  providerName: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#000',
    marginBottom: 5,
  },
  providerInfo: {
    color: '#666',
    marginBottom: 10,
    fontSize: 11,
  },
  providerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeDistance: {
    color: '#666',
    fontSize: 10,
  },
  fastTag: {
    color: '#004BB8',
    backgroundColor: '#E6F4F1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 3,
    fontSize: 10,
    fontWeight: 'bold',
    bottom: 66,
    left: 88,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4F1',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    bottom: 265,
  },
  ratingText: {
    color: '#004BB8',
    marginLeft: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchIcon: {
    position: 'absolute',
    top: 65,
    left: 22,
  },
  searchContainer: {
    position: 'absolute',
    top: 48,
    left: 55,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
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
  },
  errorText: {
    color: '#ff0000',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default Homescreen;
