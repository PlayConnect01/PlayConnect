import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

const BankDetailsForm = ({ navigation }) => {
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [iban, setIban] = useState('');
  const [swift, setSwift] = useState('');

  const handleSubmit = () => {
    // Handle form submission logic here
    alert('Bank details submitted successfully!');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Bank Details</Text>
      <TextInput
        style={styles.input}
        placeholder="Bank Name"
        value={bankName}
        onChangeText={setBankName}
      />
      <TextInput
        style={styles.input}
        placeholder="Account Number"
        value={accountNumber}
        onChangeText={setAccountNumber}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="IBAN"
        value={iban}
        onChangeText={setIban}
      />
      <TextInput
        style={styles.input}
        placeholder="SWIFT Code"
        value={swift}
        onChangeText={setSwift}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
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
    marginBottom: 24,
    color: '#1F2937',
  },
  input: {
    width: '80%',
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4FA5F5',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  button: {
    padding: 12,
    backgroundColor: '#4FA5F5',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BankDetailsForm;
