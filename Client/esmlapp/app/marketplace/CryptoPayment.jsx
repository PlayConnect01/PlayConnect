import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const CryptoPayment = ({ route, navigation }) => {
  const { amount, cryptoAddress } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cryptocurrency Payment</Text>
      <Text style={styles.message}>Send the exact amount to the following crypto address:</Text>
      <Text style={styles.details}>{cryptoAddress}</Text>
      <Text style={styles.amount}>Amount: ${amount.toFixed(2)}</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.buttonText}>Back to Home</Text>
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1F2937',
  },
  message: {
    fontSize: 18,
    marginBottom: 8,
    color: '#4FA5F5',
  },
  details: {
    fontSize: 16,
    marginBottom: 4,
    color: '#1F2937',
  },
  amount: {
    fontSize: 16,
    marginBottom: 4,
    color: '#1F2937',
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
});

export default CryptoPayment;
