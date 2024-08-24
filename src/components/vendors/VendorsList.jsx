import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, Image, TextInput, TouchableOpacity } from 'react-native';
import { API_URL, GOOGLE_API_KEY } from 'react-native-dotenv';
import { useRoute } from '@react-navigation/native';

const App = () => {
  const route = useRoute();
  const { serviceId, latitude, longitude } = route.params || {};
  const [searchText, setSearchText] = useState('');
  const [sortOption, setSortOption] = useState(null);
  const [data, setData] = useState([]);
  const [distanceInfo, setDistanceInfo] = useState({});

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
      }
    };
    fetchData();
  }, [serviceId, latitude, longitude]);

  useEffect(() => {
    const fetchDistanceInfo = async () => {
      try {
        for (const item of data) {
          const { distance, time } = await calculateDistanceAndTime(
            latitude, longitude,
            parseFloat(item.location_latitude), parseFloat(item.location_longitude)
          );
          setDistanceInfo(prev => ({
            ...prev,
            [item.id]: { distance, time }
          }));
        }
      } catch (error) {
        console.error('Error fetching distance info:', error);
      }
    };

    fetchDistanceInfo();
  }, [data]);

  const filteredData = data.filter((item) =>
    item.business_name.toLowerCase().includes(searchText.toLowerCase()) ||
    item.services_offered.some(service =>
      service.name.toLowerCase().includes(searchText.toLowerCase())
    )
  );

  const sortData = (data, sortOption) => {
    switch (sortOption) {
      case 'rating':
        return [...data].sort((a, b) => b.reviews_and_ratings - a.reviews_and_ratings);
      case 'distance':
        return [...data].sort((a, b) => {
          const distanceA = calculateDistance(latitude, longitude, a.location_latitude, a.location_longitude);
          const distanceB = calculateDistance(latitude, longitude, b.location_latitude, b.location_longitude);
          return distanceA - distanceB;
        });
      default:
        return data;
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

    return R * c;
  };

  const calculateDistanceAndTime = async (lat1, lon1, lat2, lon2) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${lat1},${lon1}&destinations=${lat2},${lon2}&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();

      if (data.status === "OK" && data.rows[0].elements[0].status === "OK") {
        const distance = data.rows[0].elements[0].distance.text;
        const time = data.rows[0].elements[0].duration.text;

        return { distance, time };
      } else {
        console.error("Error calculating distance and time:", data.rows[0].elements[0].status, data.rows[0].elements[0].error_message);
        return { distance: "N/A", time: "N/A" };
      }
    } catch (error) {
      console.error("Error fetching distance matrix data:", error);
      return { distance: "N/A", time: "N/A" };
    }
  };

  const filteredAndSortedData = sortData(filteredData, sortOption);

  // Find the vendor with the shortest distance
  const closestVendorId = sortOption === 'distance' && filteredAndSortedData.length > 0
    ? filteredAndSortedData[0].id
    : null;

  const renderItem = ({ item }) => {
    const distance = calculateDistance(
      latitude, longitude,
      parseFloat(item.location_latitude), parseFloat(item.location_longitude)
    ) * 111.19; // Convert to km

    const vendorDistanceInfo = distanceInfo[item.id] || { distance: "N/A", time: "N/A" };

    return (
      <View style={styles.card}>
        <Image 
          source={{ uri: item.vendor_logo_url || 'https://via.placeholder.com/100' }} 
          style={styles.cardImage} 
        />
        <View style={styles.cardContent}>
          <View style={styles.headerRow}>
            <Text style={styles.time}>{vendorDistanceInfo.time}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.distance}>
              {vendorDistanceInfo.distance}
            </Text>
            {closestVendorId === item.id && (
              <TouchableOpacity style={styles.nearAndFastButton}>
                <Text style={styles.nearAndFastText}>NEAR & FAST</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.footerRow}>
            <Text style={styles.name}>{item.business_name}</Text>
            <TouchableOpacity style={styles.ratingContainer}>
              <Text style={styles.rating}>{item.reviews_and_ratings}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.services}>
            {item.services_offered.map(service => service.name).join(' - ')}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#000"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, sortOption === 'rating' ? styles.selectedFilter : null]}
          onPress={() => setSortOption('rating')}
        >
          <Text style={styles.filterText}>Rating</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, sortOption === 'distance' ? styles.selectedFilter : null]}
          onPress={() => setSortOption('distance')}
        >
          <Text style={styles.filterText}>Nearest</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredAndSortedData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  searchContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#000',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
  },
  selectedFilter: {
    backgroundColor: '#e0e0e0',
  },
  filterText: {
    fontSize: 16,
    color: '#000',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2, // Increased for better visibility
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5, // For Android shadow
  },
  cardImage: {
    height: 200,
    width: '100%',
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 15,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  dot: {
    marginHorizontal: 5,
    fontSize: 14,
    color: '#333',
  },
  distance: {
    fontSize: 14,
    color: '#333',
  },
  nearAndFastButton: {
    marginLeft: 5,
    backgroundColor: '#E0F2F1',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  nearAndFastText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#00796B',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#333',
  },
  services: {
    fontSize: 14,
    marginVertical: 8,
    color: '#666',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 14,
    color: '#666',
  },
  ratingContainer: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#E6F4F1',
    backgroundColor: '#E6F4F1',
  },
  rating: {
    fontSize: 14,
    color: '#00796B',
    fontWeight: 'bold',
  },
});

export default App;
