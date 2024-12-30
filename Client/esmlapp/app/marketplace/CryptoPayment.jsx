import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CryptoPayment = ({ route, navigation }) => {
  const { amount } = route.params || {};
  const [userCryptoAddress, setUserCryptoAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const validateCryptoAddress = (address) => {
    // Basic validation for demonstration purposes
    return address.length > 20; // Adjust based on actual address requirements
  };

  const handlePayment = () => {
    if (!validateCryptoAddress(userCryptoAddress)) {
      Alert.alert('Invalid Input', 'Please enter a valid cryptocurrency address.');
      return;
    }
    setIsProcessing(true);
    // Simulate a payment confirmation process
    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert('Payment Successful', 'Your cryptocurrency payment has been confirmed.');
      navigation.navigate('PaymentSuccess');
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <Ionicons name="logo-bitcoin" size={48} color="#F7931A" style={styles.icon} />
      <Text style={styles.title}>Cryptocurrency Payment</Text>
      <Text style={styles.message}>Please enter your wallet address and confirm the payment details below.</Text>
      <Text style={styles.amount}>Amount to Pay: ${amount.toFixed(2)}</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Your Crypto Address"
        value={userCryptoAddress}
        onChangeText={setUserCryptoAddress}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {isProcessing ? (
        <ActivityIndicator size="large" color="#4FA5F5" style={styles.loader} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handlePayment}>
          <Text style={styles.buttonText}>Confirm Payment</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFF',
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1F2937',
  },
  message: {
    fontSize: 18,
    marginBottom: 16,
    color: '#4FA5F5',
    textAlign: 'center',
  },
  amount: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1F2937',
  },
  input: {
    height: 40,
    borderColor: '#4FA5F5',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    width: '80%',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  loader: {
    marginVertical: 20,
  },
  button: {
    marginTop: 24,
    padding: 12,
    backgroundColor: '#4FA5F5',
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CryptoPayment;
