import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';

const ErrorModal = ({ visible, errorMessages = [], onClose }) => {
  // Ensure errorMessages is always an array
  const errors = Array.isArray(errorMessages) ? errorMessages : [errorMessages];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      accessible={true}
      accessibilityLabel="Error Modal"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView contentContainerStyle={styles.scrollView}>
            {errors.length > 0 ? (
              errors.map((error, index) => (
                <Text key={index} style={styles.modalText}>• {error}</Text>
              ))
            ) : (
              <Text style={styles.modalText}>No errors to display.</Text>
            )}
          </ScrollView>
          <TouchableOpacity 
            style={styles.modalButton} 
            onPress={onClose}
            accessible={true}
            accessibilityLabel="Close Error Modal"
          >
            <Text style={styles.modalButtonText}>CLOSE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    maxWidth: 400, // Optional: set a maximum width for larger screens
    maxHeight: '60%', // Optional: limit height for larger screens
    borderRadius: 10,
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    
  },
  scrollView: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    color: 'red',
    textAlign: 'left',
  },
  modalButton: {
    backgroundColor: '#004BB8',
    width:150,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 5,
    justifyContent:'space-evenly',
    alignContent:'center',
    
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    justifyContent:'center',
    textAlign:'center'
  },
});

export default ErrorModal;
