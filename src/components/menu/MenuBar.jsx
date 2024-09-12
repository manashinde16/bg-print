import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';

// Import SVGs from assets
import HomeIcon from '../../../assets/icons/home.svg';
import ServicesIcon from '../../../assets/icons/services.svg';
import UploadIcon from '../../../assets/icons/upload.svg';
import RecentOrdersIcon from '../../../assets/icons/recent_orders.svg';
import DocumentsIcon from '../../../assets/icons/documents.svg';

const MenuBar = ({ navigation }) => {
  return (
    <View style={styles.menuContainer}>
      <TouchableOpacity onPress={() => navigation.navigate('Services')}>
        <ServicesIcon width={30} height={30} />
        <Text style={styles.menuText}>Services</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <HomeIcon width={30} height={30} />
        <Text style={styles.menuText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Upload')} style={styles.uploadButton}>
        <UploadIcon width={50} height={50} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('RecentOrders')}>
        <RecentOrdersIcon width={30} height={30} />
        <Text style={styles.menuText}>History</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('StoredDocuments')}>
        <DocumentsIcon width={30} height={30} />
        <Text style={styles.menuText}>Documents</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  menuContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#444',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: 40,
    paddingHorizontal: 10,
  },
  uploadButton: {
    backgroundColor: '#f57c00',
    padding: 10,
    borderRadius: 50,
    marginTop: -30, // To float it higher in the middle
  },
  menuText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
  },
});

export default MenuBar;
