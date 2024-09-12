import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import axios from 'axios';
import { API_URL } from 'react-native-dotenv';
import { fetchCsrfToken } from '../../services/csrfTokenUtil';

const PaymentScreen = ({ route, navigation }) => {
  const { amount, vendorId } = route.params;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!name || !email || !contact) {
      Alert.alert('Incomplete Information', 'Please fill in all fields to proceed.');
      return;
    }

    setIsProcessing(true);

    try {
      const csrfToken = await fetchCsrfToken();
      if (!csrfToken) {
        handlePaymentIssue('We\'re having trouble processing your payment. Please try again later.');
        return;
      }

      const response = await axios.post(
        `${API_URL}/payments/initiate-payment/`,
        { amount: amount },
        {
          headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      const { id: razorpay_order_id, currency, amount: razorpay_amount } = response.data;

      const options = {
        description: 'File Processing Payment',
        currency: currency,
        key: 'rzp_test_HwXC97y8TLwYo4',
        amount: razorpay_amount,
        order_id: razorpay_order_id,
        name: 'BG-Print',
        prefill: {
          email: email,
          contact: contact,
          name: name,
        },
        theme: { color: '#F37254' },
      };

      RazorpayCheckout.open(options)
        .then(async (data) => {
          const verifyResponse = await axios.post(
            `${API_URL}/payments/verify-payment/`,
            {
              razorpay_payment_id: data.razorpay_payment_id,
              razorpay_order_id: data.razorpay_order_id,
              razorpay_signature: data.razorpay_signature,
              order_id: razorpay_order_id,
            },
            {
              headers: {
                'X-CSRFToken': csrfToken,
                'Content-Type': 'application/json',
              },
              withCredentials: true,
            }
          );

          if (verifyResponse.data.status === 'success') {
            handlePaymentSuccess();
          } else {
            handlePaymentIssue('We couldn\'t confirm your payment. Please check your account or try again.');
          }
        })
        .catch(() => {
          handlePaymentIssue('The payment process was interrupted. Please try again or contact support if the issue persists.');
        });

    } catch (error) {
      handlePaymentIssue('We\'re experiencing technical difficulties. Please try again later or contact support.');
    }
  };

  const handlePaymentSuccess = () => {
    Alert.alert(
      'Payment Successful',
      'Your payment was processed successfully. Thank you for your business!',
      [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
    );
  };

  const handlePaymentIssue = (message) => {
    setIsProcessing(false);
    Alert.alert(
      'Payment Not Completed',
      message,
      [
        { text: 'Try Again', onPress: () => {} },
        { text: 'Cancel', style: 'cancel', onPress: () => navigation.goBack() }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Payment Details</Text>
      <Text style={styles.amount}>Amount: ${amount}</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email Address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Contact Number"
        value={contact}
        onChangeText={setContact}
        keyboardType="phone-pad"
      />

      <TouchableOpacity 
        style={[styles.button, isProcessing && styles.buttonDisabled]} 
        onPress={handlePayment} 
        disabled={isProcessing}
      >
        {isProcessing ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Proceed to Payment</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#007AFF',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#A5A5A5',
  },
});

export default PaymentScreen;