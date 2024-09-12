import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, Image, Alert, Modal, Dimensions
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import axios from 'axios';
import { API_URL } from 'react-native-dotenv';
import CloudUploadIcon from '../../../assets/icons/cloud-upload.svg';
import FileIcon from '../../../assets/icons/file.svg';
import TrashIcon from '../../../assets/icons/trash.svg';
import { BlurView } from '@react-native-community/blur';

const { width, height } = Dimensions.get('window');

const UploadFilePage = ({ route, navigation }) => {
  const { vendorId, specificServiceId } = route.params;
  const [vendorDetails, setVendorDetails] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [fileServiceMap, setFileServiceMap] = useState({});
  const totalAmount = 10;

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

  const handleFileSelection = async (serviceId) => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        allowMultiSelection: false
      });
      
      const newFile = result[0];
      if (selectedFiles.some(file => file.name === newFile.name)) {
        Alert.alert('Duplicate File', 'This file has already been selected.');
        return;
      }
      
      if (selectedFiles.length >= 5) {
        Alert.alert('File Limit Exceeded', 'You can only select up to 5 files in total.');
        return;
      }

      setSelectedFiles(prevFiles => [...prevFiles, newFile]);
      setFileServiceMap(prevMap => ({...prevMap, [newFile.name]: serviceId}));
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled the picker');
      } else {
        console.error('Error selecting file:', err);
        Alert.alert('Error', 'An error occurred while selecting the file. Please try again.');
      }
    }
  };

  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) {
      Alert.alert('No files selected', 'Please select at least one file to upload.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();

    selectedFiles.forEach((file) => {
      formData.append('files', {
        uri: file.uri,
        type: file.type,
        name: file.name,
      });
      formData.append('service_ids', fileServiceMap[file.name]);
    });
    formData.append('vendor_id', vendorId);

    try {
      const response = await axios.post(`${API_URL}/uploads/store-file-url/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.status === 201) {
        Alert.alert(
          'Success',
          'Files have been successfully uploaded.',
          [
            {
              text: 'OK',
              onPress: () => {
                setSelectedFiles([]);
                setFileServiceMap({});
                navigation.navigate('Payment', { 
                  vendorId: vendorId,
                  amount: totalAmount
                });
              }
            }
          ]
        );
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

  const removeFile = (fileName) => {
    setSelectedFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
    setFileServiceMap(prevMap => {
      const newMap = {...prevMap};
      delete newMap[fileName];
      return newMap;
    });
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
                <Image source={{ uri: service.icon_url }} style={styles.serviceIcon} />
                <Text style={styles.serviceName}>{service.name}</Text>
                <TouchableOpacity 
                  style={styles.uploadButton} 
                  onPress={() => handleFileSelection(service.id)}
                >
                  <CloudUploadIcon width={24} height={24} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <Text style={styles.fileInfoText}>
          Maximum individual file size: 100MB, Maximum total file size: 50MB, 
          Support format: ZIP, CSV, PDF, JPEG, PNG, DOCX, XLSX.
        </Text>

        {selectedFiles.map((file, index) => (
          <View key={index} style={styles.fileItem}>
            <FileIcon width={20} height={20} />
            <Text style={styles.fileName}>{file.name}</Text>
            <Text style={styles.serviceTag}>
              {vendorDetails.vendor_services.find(vs => vs.service.id === fileServiceMap[file.name])?.service.name}
            </Text>
            <TouchableOpacity onPress={() => removeFile(file.name)}>
              <TrashIcon width={20} height={20} />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addToCartButton} onPress={handleUploadFiles}>
          <Text style={styles.addToCartButtonText}>Upload Files →</Text>
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
    backgroundColor: '#F6FCFF',
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
    padding: 5,
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
  serviceTag: {
    fontSize: 12,
    color: '#007AFF',
    backgroundColor: '#E1F0FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
});

export default UploadFilePage;