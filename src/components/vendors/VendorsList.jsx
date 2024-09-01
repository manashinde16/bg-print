import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet, Text, Image, TextInput, TouchableOpacity, Animated, Easing } from 'react-native';
import {GOOGLE_API_KEY, API_URL} from 'react-native-dotenv';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

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

const App = () => {
  const route = useRoute();
  const { serviceId, latitude, longitude } = route.params || {};
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [sortOption, setSortOption] = useState(null);
  const [data, setData] = useState([]);
  const [openNowFilter, setOpenNowFilter] = useState(false);
  const [animations, setAnimations] = useState({});
  const [distanceInfo, setDistanceInfo] = useState({});
  const navigation = useNavigation(); // Hook to use navigation
  const animatedValue = useRef(new Animated.Value(1)).current;

  const handleCardPress = (item) => {
    const cardAnimation = new Animated.Value(1);
    setAnimations(prev => ({ ...prev, [item.id]: cardAnimation }));
  
    Animated.timing(cardAnimation, {
      toValue: 0.95,
      duration: 150,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(cardAnimation, {
        toValue: 1,
        duration: 150,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        // Navigation after animation completes
        const vendorServices = item.vendor_services.map(service => ({
          name: service.service.name,
          id: service.service.id,
        }));
        navigation.navigate('Upload', {
          specificServiceId: serviceId,
          vendorId: item.id,
          serviceId: vendorServices.length > 0 ? vendorServices[0].id : null,
          services: vendorServices,
        });
      });
    });
  };
  
  useEffect(() => {
      const fetchData = async () => {
        try {
          const url = `${API_URL}/services/${serviceId}/vendors/?latitude=${latitude}&longitude=${longitude}`;
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const jsonData = await response.json();
          setData(jsonData);
        } catch (error) {
          console.error('Error fetching data:', error);
          setError('Error fetching vendor data. Please try again later.');
        }
      };
      fetchData();
    }, [serviceId, latitude, longitude]);

    useEffect(() => {
      // const fetchDistanceInfo = async () => {
      //   try {
      //     const distances = await Promise.all(
      //       data.map(async (item) => {
      //         const { distance, time } = calculateDistance(
      //           latitude, longitude,
      //           parseFloat(item.location_latitude), parseFloat(item.location_longitude)
      //         );
      //         return { id: item.id, distanceValue: parseFloat(distance.replace(' km', '')), distance, time };
      //       })
      //     );
      
      //     const distanceObj = {};
      //     distances.forEach(({ id, distance, time, distanceValue }) => {
      //       distanceObj[id] = { distance, time, distanceValue };
      //     });
      //     setDistanceInfo(distanceObj);
      
      //   } catch (error) {
      //     console.error('Error fetching distance info:', error);
      //   }
      // };   
      
      const fetchDistanceInfo = async () => {
        try {
          const distances = await Promise.all(
            data.map(async (item) => {
              const distance = calculateDistance(
                latitude, longitude,
                parseFloat(item.location_latitude), parseFloat(item.location_longitude)
              );
      
              // Return the distance as an object with relevant info
              return { 
                id: item.id, 
                distanceValue: distance, // Directly use the numeric value
                distance: `${distance.toFixed(2)} km`, // Format as string with 'km'
                time: calculateEstimatedTime(distance) // If you want to add time, you can define this function
              };
            })
          );
      
          const distanceObj = {};
          distances.forEach(({ id, distance, time, distanceValue }) => {
            distanceObj[id] = { distance, time, distanceValue };
          });
          setDistanceInfo(distanceObj);
      
        } catch (error) {
          console.error('Error fetching distance info:', error);
        }
      };
  
      fetchDistanceInfo();
    }, [data]);

    const filteredData = data.filter((item) =>
      item.business_name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.vendor_services.some(service =>
        service.service.name.toLowerCase().includes(searchText.toLowerCase())
      )
    );

    const sortData = (data, sortOption, openNowFilter) => {
      let sortedData = [...data];
    
      if (openNowFilter) {
        sortedData = sortedData.filter(item => isVendorOpen(item.business_hours));
      }
    
      switch (sortOption) {
        case 'rating':
          return sortedData.sort((a, b) => b.reviews_and_ratings - a.reviews_and_ratings);
        case 'distance':
          return sortedData.sort((a, b) => {
            const distanceA = distanceInfo[a.id]?.distanceValue || Infinity;
            const distanceB = distanceInfo[b.id]?.distanceValue || Infinity;
            return distanceA - distanceB;
          });
        default:
          return sortedData;
      }
    };    

  
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Radius of the Earth in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Return the distance in km
};

// Example function to calculate estimated time
const calculateEstimatedTime = (distance) => {
  const avgSpeedKmH = 50; // Average speed in km/h
  const timeInHours = distance / avgSpeedKmH;
  const timeInMinutes = timeInHours * 60;
  return `${Math.round(timeInMinutes)} mins`;
};

  // const calculateDistanceAndTime = async (lat1, lon1, lat2, lon2) => {
  //   try {
  //     const response = await fetch(
  //       `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${lat1},${lon1}&destinations=${lat2},${lon2}&key=${GOOGLE_API_KEY}`
  //     );
  //     const data = await response.json();

  //     if (data.status === "OK" && data.rows[0].elements[0].status === "OK") {
  //       const distance = data.rows[0].elements[0].distance.text; // "12.4 km"
  //       const time = data.rows[0].elements[0].duration.text;     // "15 mins"

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

  const filteredAndSortedData = sortData(filteredData, sortOption, openNowFilter);

  // Find the vendor with the shortest distance
  const closestVendorId = sortOption === 'distance' && filteredAndSortedData.length > 0
    ? filteredAndSortedData[0].id
    : null;
  
    const renderItem = ({ item }) => {
      const vendorDistanceInfo = distanceInfo[item.id] || { distance: "N/A", time: "N/A" };
      const isOpen = isVendorOpen(item.business_hours);
      const cardAnimation = animations[item.id] || new Animated.Value(1);
    
      return (
        <TouchableOpacity 
        onPress={() => handleCardPress(item)}
        activeOpacity={1} 
        >
          <Animated.View style={[styles.cardContainer, { transform: [{ scale: cardAnimation }] }]}>
            <View style={styles.card}>
              <Image 
                source={{ uri: item.vendor_logo_url || 'https://via.placeholder.com/100' }} 
                style={styles.cardImage} 
              />
              <TouchableOpacity style={styles.ratingContainer}>
              <Text style={styles.rating}>{item.reviews_and_ratings}</Text>
            </TouchableOpacity>
              <View style={styles.cardContent}>
                <View style={styles.headerRow}>
                  <Text style={styles.name}>{item.business_name}</Text>
                  {closestVendorId === item.id && (
                    <TouchableOpacity style={styles.nearAndFastButton}>
                      <Text style={styles.nearAndFastText}>NEAR & FAST</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.footerRow}>
                  <Text style={styles.time}>{vendorDistanceInfo.time}</Text>
                  <Text style={styles.dot}>•</Text>
                  <Text style={styles.distance}>
                    {vendorDistanceInfo.distance}
                  </Text>
                  <Text style={styles.dot}>•</Text>
                  <Text style={[styles.statusTag, { color: isOpen ? 'green' : 'red' }]}>
                    {isOpen ? 'Open Now' : 'Closed Now'}
                  </Text>
                </View>
                <Text style={styles.services}>
                  {item.vendor_services.map(service => service.service.name).join(' - ')}
                </Text>
              </View>
            </View>
          </Animated.View>
        </TouchableOpacity>
      );
    };    

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>

      <View style={styles.searchBarContainer}>
      {/* Back Button inside Search Bar */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate('Home')} // Navigate to Home
      >
        <Image
          source={require('../../../assets/images/arrowvendor.png')} // Replace with your back icon URL or local image
          style={styles.backIcon}
        />
      </TouchableOpacity>

      {/* Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search....."
        placeholderTextColor="rgba(136, 136, 136, 0.6)"
        value={searchText}
        onChangeText={setSearchText}
      />
    </View>
        <Image 
        source={require('../../../assets/images/profile.png')}  // Replace with your image URL or local image
        style={styles.profileIcon}
      />
      </View>
      <View style={styles.filterContainer}>
      <TouchableOpacity
          style={[styles.filterButton, openNowFilter && styles.selectedFilter]}
          onPress={() => setOpenNowFilter(!openNowFilter)}
        >
          <Text style={[styles.filterText, openNowFilter ? styles.selectedFilterText : styles.unselectedFilterText]}>
            Open Now
          </Text>
        </TouchableOpacity>
            <TouchableOpacity
            style={[styles.filterButton, sortOption === 'rating' ? styles.selectedFilter : styles.unselectedFilter]}
            onPress={() => setSortOption('rating')}
          >
            <Text style={[styles.filterText, sortOption === 'rating' ? styles.selectedFilterText : styles.unselectedFilterText]}>
              Rating
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, sortOption === 'distance' ? styles.selectedFilter : styles.unselectedFilter]}
            onPress={() => setSortOption('distance')}
          >
            <Text style={[styles.filterText, sortOption === 'distance' ? styles.selectedFilterText : styles.unselectedFilterText]}>
              Nearest
            </Text>
          </TouchableOpacity>
      </View>

      {filteredAndSortedData.length === 0 ? (
      <Text style={styles.noDataText}>No shops are currently open.</Text>
    ) : (
      <FlatList
        data={filteredAndSortedData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    )}
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    },
    noDataText: {
  fontSize: 16,
  color: '#333',
  textAlign: 'center',
  marginTop: 20,
},
  searchContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 0,
    borderBottomColor: '#e0e0e0',
    alignItems:'center',
    marginTop:20,
    position: 'relative',
    
  },
  searchInput: {
    flex:1,
    borderRadius:7,
    padding: 10,
    fontSize: 16,
    color: '#000',
    paddingHorizontal:50,
    position: 'relative',
    },

    searchBarContainer: {
      flex: 1, // Take up remaining space
      position: 'relative', // To allow absolute positioning of the back button
      backgroundColor: '#fff',
      borderRadius: 8,
      marginRight: 20, // Space between search bar and profile 
      marginLeft:5,
      // Shadow for Android
      elevation: 5,
      height:48,
      width:308,
    },

    backButton: {
      position: 'absolute', // Absolute position to overlay inside input
      left: 10, // Adjust left positioning
      top: '50%', // Center vertically within parent container
      transform: [{ translateY: -10 }], // Adjust to perfect vertical center
      zIndex: 1, // Ensure button stays above TextInput
    },
    backIcon: {
      width: 20, // Icon width
      height: 20, // Icon height
      position:'relative',
    },

    profileIcon: {
      width: 40, // Icon width
      height: 40, // Icon height
      borderRadius: 20, // Make the icon 
      marginRight:10,
      
    },

  //Filter Button CSS
    filterContainer: {
    flexDirection: 'row',
    marginLeft:20,
    marginBottom:10,
    shadowColor: '#000',
    shadowOpacity: 0.2, // Increased for better visibility
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5, // For Android shadow
    
  },
filterButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginRight: 10,
    height: 35,
    width: 85,
  },
  selectedFilter: {
    backgroundColor: '#3066D8',
  },
  unselectedFilter: {
    backgroundColor: 'white',
  },
  filterText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedFilterText: {
    color: 'white',
  },
  unselectedFilterText: {
    color: '#000',
  },
  
  
  //Vendors Displaying  CSS
  
  cardContainer:{
    justifyContent:'center',
    alignContent:'center',
    alignItems:'center',
  },
  card: {
    backgroundColor: '#fff',
    width: '90%',
    maxHeight:263,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2, // Increased for better visibility
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5, // For Android shadow
    justifyContent:'space-around',
      },
  cardImage: {
    height: 150,
    width: '100%',
    resizeMode: 'cover',
    },
  cardContent: {
   paddingLeft:15,
   paddingBottom:10,
  },
  headerRow: {
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
  nearAndFastButton: {
    marginLeft: 5,
    backgroundColor: '#E6F4F1',
    borderRadius: 4,
    position: 'absolute',
    width:62,
    height:18,
    top:15,  
    right:20,
    alignItems:'center',
    justifyContent:'center',
  },
  statusTag: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  nearAndFastText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#004BB8',

  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#333',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems:'center',
    
  },
  services: {
    fontSize: 10,
    color: '#000',
    
  },
  
  price: {
    fontSize: 14,
    color: '#666',
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
  rating: {
    fontSize: 12,
    color: '#004BB8',
    fontWeight: 'bold',
  },
});

export default App;
