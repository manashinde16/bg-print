import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, Image, Modal, Dimensions
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import axios from 'axios';
import { API_URL } from 'react-native-dotenv';
import CloudUploadIcon from '../../../assets/icons/cloud-upload.svg';
import FileIcon from '../../../assets/icons/file.svg';
import TrashIcon from '../../../assets/icons/trash.svg';
import { BlurView } from '@react-native-community/blur';
import CustomAlert from '../../services/CustomAlert';

const { width, height } = Dimensions.get('window');

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB in bytes
const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100 MB in bytes
const MAX_FILES = 5;

const UploadFilePage = ({ route, navigation }) => {
  const { vendorId, specificServiceId } = route.params;
  const [vendorDetails, setVendorDetails] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [totalSize, setTotalSize] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const totalAmount = 10;

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertConfirmAction, setAlertConfirmAction] = useState(() => {});

  const showCustomAlert = (title, message, confirmAction) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertConfirmAction(() => confirmAction);
    setAlertVisible(true);
  };

  const removeAllFiles = (serviceId) => {
    showCustomAlert(
      'Confirm Deletion',
      'Are you sure you want to delete all files for this service?',
      () => {
        setSelectedFiles(prevFiles => {
          const updatedFiles = {...prevFiles};
          const filesToRemove = updatedFiles[serviceId] || [];
          delete updatedFiles[serviceId];
          setTotalSize(prevSize => prevSize - filesToRemove.reduce((sum, file) => sum + (file.size || 0), 0));
          setTotalFiles(prevTotal => prevTotal - filesToRemove.length);
          return updatedFiles;
        });
      }
    );
  };

  const removeFile = (serviceId, fileName) => {
    showCustomAlert(
      'Confirm Deletion',
      `Are you sure you want to delete "${fileName}"?`,
      () => {
        setSelectedFiles(prevFiles => {
          const updatedFiles = {...prevFiles};
          const fileToRemove = updatedFiles[serviceId].find(file => file.name === fileName);
          updatedFiles[serviceId] = updatedFiles[serviceId].filter(file => file.name !== fileName);
          if (updatedFiles[serviceId].length === 0) {
            delete updatedFiles[serviceId];
          }
          setTotalSize(prevSize => prevSize - (fileToRemove?.size || 0));
          setTotalFiles(prevTotal => prevTotal - 1);
          return updatedFiles;
        });
      }
    );
  };

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
        showCustomAlert('Error', 'Failed to load vendor details. Please try again later.', () => {});
        setIsLoading(false);
      }
    };
    fetchVendorDetails();
  }, [vendorId, specificServiceId]);

  const handleFileSelection = async (serviceId) => {
    try {
      if (totalFiles >= MAX_FILES) {
        showCustomAlert('Maximum Files Reached', `You can only select up to ${MAX_FILES} files in total.`, () => {});
        return;
      }

      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        allowMultiSelection: false
      });
      
      const newFile = result[0];

      if (newFile.size > MAX_FILE_SIZE) {
        showCustomAlert('File Too Large', 'Each file must be 50 MB or less.', () => {});
        return;
      }

      if (totalSize + newFile.size > MAX_TOTAL_SIZE) {
        showCustomAlert('Total Size Exceeded', 'Total file size must not exceed 100 MB.', () => {});
        return;
      }

      if (selectedFiles[serviceId]?.some(file => file.name === newFile.name)) {
        showCustomAlert('Duplicate File', 'This file has already been uploaded for this service.', () => {});
        return;
      }

      setSelectedFiles(prevFiles => ({
        ...prevFiles,
        [serviceId]: [...(prevFiles[serviceId] || []), newFile]
      }));
      setTotalSize(prevSize => prevSize + newFile.size);
      setTotalFiles(prevTotal => prevTotal + 1);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled the picker');
      } else {
        console.error('Error selecting file:', err);
        showCustomAlert('Error', 'An error occurred while selecting the file. Please try again.', () => {});
      }
    }
  };

  const handleUploadFiles = async () => {
    if (Object.keys(selectedFiles).length === 0) {
      showCustomAlert('No files selected', 'Please select at least one file to upload.', () => {});
      return;
    }
  
    setIsUploading(true);
    const formData = new FormData();
  
    Object.entries(selectedFiles).forEach(([serviceId, files]) => {
      files.forEach((file) => {
        formData.append('files', {
          uri: file.uri,
          type: file.type,
          name: `${serviceId}_${file.name}`,  // Ensure unique naming per service
        });
      });
      formData.append('service_ids', serviceId);
    });
    formData.append('vendor_id', vendorId);
  
    try {
      const response = await axios.post(`${API_URL}/uploads/store-file-url/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      if (response.status === 201) {
        showCustomAlert(
          'Success',
          'Files have been successfully uploaded.',
          () => {
            setSelectedFiles({});
            setTotalSize(0);
            setTotalFiles(0);
            navigation.navigate('Payment', { 
              vendorId: vendorId,
              amount: totalAmount
            });
          }
        );
      } else {
        showCustomAlert('Upload Failed', 'An error occurred while uploading files. Please try again.', () => {});
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      showCustomAlert('Error', 'An error occurred while uploading files. Please try again.', () => {});
    } finally {
      setIsUploading(false);
    }
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
          Maximum individual file size: 50MB, Maximum total file size: 100MB, 
          Support format: ZIP, CSV, PDF, JPEG, PNG, DOCX, XLSX.
        </Text>

        <Text style={styles.totalSizeText}>Total Size: {(totalSize / (1024 * 1024)).toFixed(2)} MB</Text>

        {Object.entries(selectedFiles).map(([serviceId, files]) => (
          <View key={serviceId} style={styles.serviceFilesContainer}>
            <View style={styles.serviceHeaderContainer}>
              <Text style={styles.serviceNameText}>
                {vendorDetails.vendor_services.find(vs => vs.service.id === parseInt(serviceId)).service.name}
              </Text>
              {files.length > 0 && (
                <TouchableOpacity onPress={() => removeAllFiles(serviceId)} style={styles.removeAllButton}>
                  <Text style={styles.removeAllButtonText}>Remove All</Text>
                </TouchableOpacity>
              )}
            </View>
            {files.map((file, index) => (
              <View key={index} style={styles.fileItem}>
                <FileIcon width={20} height={20} />
                <Text style={styles.fileName}>{file.name}</Text>
                <Text style={styles.fileSize}>({(file.size / (1024 * 1024)).toFixed(2)} MB)</Text>
                <TouchableOpacity onPress={() => removeFile(serviceId, file.name)}>
                  <TrashIcon width={20} height={20} />
                </TouchableOpacity>
              </View>
            ))}
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

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onCancel={() => setAlertVisible(false)}
        onConfirm={() => {
          alertConfirmAction();
          setAlertVisible(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  serviceHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  removeAllButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  removeAllButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  totalSizeText: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  serviceFilesContainer: {
    marginBottom: 20,
  },
  serviceNameText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#444'
  },
  fileSize: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 10,
  },
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