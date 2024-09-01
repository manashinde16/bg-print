import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, Image, Alert, Modal, Dimensions
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import DocumentPicker from 'react-native-document-picker';
import axios from 'axios';
import { API_URL } from 'react-native-dotenv';
import Icon from 'react-native-vector-icons/FontAwesome';
import { BlurView } from '@react-native-community/blur';

const { width, height } = Dimensions.get('window');

const UploadFilePage = ({ route, navigation }) => {
  const { vendorId, specificServiceId } = route.params;
  const [vendorDetails, setVendorDetails] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const { width, height } = Dimensions.get('window');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchVendorDetails = async () => {
      try {
        const response = await axios.get(`${API_URL}/vendors/${vendorId}/`);
        setVendorDetails(response.data);
        if (specificServiceId) {
          setSelectedServices([specificServiceId]);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching vendor details:', error);
        setIsLoading(false);
      }
    };
    fetchVendorDetails();
  }, [vendorId, specificServiceId]);

  const handleFileSelection = async () => {
    try {
      const results = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        allowMultiSelection: true
      });
      const newFiles = results.filter((newFile) =>
        !selectedFiles.some((file) => file.name === newFile.name)
      );
      if (selectedFiles.length + newFiles.length > 5) {
        Alert.alert('File Limit Exceeded', 'You can only select up to 5 files.');
        return;
      }
      if (newFiles.length < results.length) {
        Alert.alert('Duplicate Files', 'Some files were not added as they were already selected.');
      }
      setSelectedFiles([...selectedFiles, ...newFiles]);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled the picker');
      } else {
        console.error('Error selecting files:', err);
        Alert.alert('Error', 'An error occurred while selecting files. Please try again.');
      }
    }
  };

  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) {
      Alert.alert('No files selected', 'Please select at least one file to upload.');
      return;
    }
    if (selectedServices.length === 0) {
      Alert.alert('No services selected', 'Please select at least one service.');
      return;
    }
    if (selectedFiles.length > 5 || selectedServices.length > 5) {
      Alert.alert('Limit Exceeded', 'You can only upload up to 5 files and select up to 5 services.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    selectedFiles.forEach((file, index) => {
      formData.append('files', {
        uri: file.uri,
        type: file.type,
        name: file.name,
      });
    });
    formData.append('vendor_id', vendorId);
    formData.append('service_ids', selectedServices.join(','));

    try {
      const response = await axios.post(`${API_URL}/uploads/store-file-url/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.status === 201) {
        Alert.alert('Success', 'Files have been successfully uploaded.');
        setSelectedFiles([]);
        setSelectedServices([]);
      } else {
        Alert.alert('Upload Failed', 'An error occurred while uploading files.');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      Alert.alert('Error', 'An error occurred while uploading files. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const toggleService = (serviceId) => {
    setSelectedServices(prevSelected => 
      prevSelected.includes(serviceId)
        ? prevSelected.filter(id => id !== serviceId)
        : [...prevSelected, serviceId]
    );
  };

  if (isLoading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;
  }

  if (!vendorDetails) {
    return <Text style={styles.errorText}>Failed to load vendor details. Please try again later.</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Image source={{ uri: vendorDetails.vendor_logo_url }} style={styles.vendorImage} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.vendorDetails}>
          <Text style={styles.vendorName}>{vendorDetails.business_name}</Text>
          <Text style={styles.vendorRating}>{vendorDetails.reviews_and_ratings}</Text>
        </View>

        <View style={styles.servicesContainer}>
          {vendorDetails.vendor_services.map((vendorService) => {
            const { service } = vendorService;
            const isChecked = selectedServices.includes(service.id);
            return (
              <View key={service.id} style={styles.serviceItem}>
                <CheckBox
                style={styles.CheckBoxBorder}
                  value={isChecked}
                  onValueChange={() => toggleService(service.id)}
                />
                <Image source={{ uri: service.icon_url }} style={styles.serviceIcon} />
                <Text style={styles.serviceName}>{service.name}</Text>
              </View>
            );
          })}
        </View>

        <TouchableOpacity style={styles.uploadButton} onPress={handleFileSelection}>
          <Icon name="cloud-upload" size={24} color="#007AFF" />
          <Text style={styles.uploadButtonText}>Click here to upload files</Text>
        </TouchableOpacity>

        <Text style={styles.fileInfoText}>
          Maximum individual file size: 100MB, Maximum total file size: 50MB, 
          Support format: ZIP, CSV, PDF, JPEG, PNG, DOCX, XLSX.
        </Text>

        {selectedFiles.map((file, index) => (
          <View key={index} style={styles.fileItem}>
            <Icon name="file" size={20} color="#007AFF" />
            <Text style={styles.fileName}>{file.name}</Text>
            <TouchableOpacity onPress={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== index))}>
              <Icon name="trash" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addToCartButton} onPress={handleUploadFiles}>
          <Text style={styles.addToCartButtonText}>Add to Cart →</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={isUploading} transparent={true} animationType="fade">
        <BlurView
          style={styles.blurView}
          blurType="light"
          blurAmount={10}
          reducedTransparencyFallbackColor="white"
        >
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.uploadingText}>Uploading files...</Text>
            <Text style={styles.uploadingSubText}>Please wait while we process your request.</Text>
          </View>
        </BlurView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  headerContainer: {
    width: width,
    height: height * 0.25,
    backgroundColor: '#00704A', // Starbucks green color
    justifyContent: 'center',
    alignItems: 'center',
  },
  vendorImage: {
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    padding: 20,
  },
  vendorDetails: {
    alignItems: 'center',
    alignContent: 'space-between',
    marginBottom: 20,
  },
  vendorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 10,
  },
  vendorRating: {
    fontSize: 16,
    color: '#8E8E93',
  },
  CheckBoxBorder: {
    borderColor: 'grey',
  },
  servicesContainer: {
    marginBottom: 20,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  serviceIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  serviceName: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    marginBottom: 10,
  },
  uploadButtonText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 10,
  },
  fileInfoText: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 20,
    textAlign: 'center',
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  fileName: {
    fontSize: 14,
    color: '#000',
    flex: 1,
    marginLeft: 10,
  },
  addToCartButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  addToCartButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  blurView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingContainer: {
    width: width * 0.8, // 80% of the screen width
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  uploadingText: {
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
    marginTop: 15,
  },
  uploadingSubText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 5,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default UploadFilePage;