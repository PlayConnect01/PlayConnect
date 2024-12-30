import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const BankTransferInstructions = ({ route, navigation }) => {
  const { amount, bankDetails } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bank Transfer Instructions</Text>
      <Text style={styles.message}>Please transfer the amount to the following bank account:</Text>
      <View style={styles.bankDetailsContainer}>
        <Text style={styles.bankDetailText}>Bank Name: Your Bank</Text>
        <Text style={styles.bankDetailText}>Account Number: 123456789</Text>
        <Text style={styles.bankDetailText}>IBAN: XX00XXXX1234567890</Text>
        <Text style={styles.bankDetailText}>SWIFT: XXXXXXX</Text>
      </View>
      <View style={styles.detailsBox}>
        <Text style={styles.details}>{bankDetails}</Text>
      </View>
      <Text style={styles.amount}>Amount: ${amount.toFixed(2)}</Text>
      <TouchableOpacity style={styles.formButton} onPress={() => navigation.navigate('BankDetailsForm')}>
        <Text style={styles.formButtonText}>Enter Bank Details</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
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
  bankDetailsContainer: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4FA5F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bankDetailText: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 8,
  },
  detailsBox: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4FA5F5',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  details: {
    fontSize: 16,
    color: '#1F2937',
  },
  amount: {
    fontSize: 16,
    marginBottom: 4,
    color: '#1F2937',
  },
  formButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#4FA5F5',
    borderRadius: 8,
    alignItems: 'center',
  },
  formButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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

export default BankTransferInstructions;
