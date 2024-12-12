import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const PasswordRecoveryScreen = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [method, setMethod] = useState('email'); // Default method is email
  const navigation = useNavigation();

  const handleNextStep = async () => {
    if (step === 1) {
      // Step 1: Send a password reset request to the backend
      try {
        const response = await axios.post(`http://192.168.103.10:3000/password/request-password-reset`, { 
          email,
          method 
        });
        console.log('Password reset request sent:', response.data);
        setStep(2); // Go to step 2 (enter the code)
      } catch (error) {
        console.error('Error sending password reset request:', error.response.data);
        alert('Error sending password reset request. Please try again.');
      }
    } else if (step === 2) {
      // Step 2: Verify the code
      try {
        const response = await axios.post(`http://192.168.103.10:3000/password/verify-reset-code`, { 
          email, 
          code,
          method 
        });
        console.log('Code verified:', response.data);
        setStep(3); // Go to step 3 (reset password)
      } catch (error) {
        console.error('Error verifying code:', error.response.data);
        alert('Invalid code. Please try again.');
      }
    } else if (step === 3) {
      // Step 3: Update the password
      if (newPassword === repeatPassword) {
        try {
          const response = await axios.post(`http://192.168.103.10:3000/password/update-password`, { 
            email, 
            newPassword 
          });
          console.log('Password updated:', response.data);
          navigation.navigate('Login'); // Redirect to login
        } catch (error) {
          console.error('Error resetting password:', error.response.data);
          alert('Error resetting password. Please try again.');
        }
      } else {
        alert('Passwords do not match');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('../../assets/images/sportscube.png')} // Ensure this path is correct
        style={styles.image}
      />
      <View style={styles.innerContainer}>
        <Text style={styles.title}>
          {step === 1 ? 'Password Recovery' : step === 2 ? 'Enter the Code' : 'Setup New Password'}
        </Text>

        {step === 1 && (
          <View>
            <Text style={styles.subtitle}>How would you like to restore your password?</Text>
            <View style={styles.methodContainer}>
              <TouchableOpacity 
                style={[styles.methodButton, method === 'email' && styles.selectedMethod]} 
                onPress={() => setMethod('email')}
              >
                <Text style={styles.methodButtonText}>Email</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.methodButton, method === 'sms' && styles.selectedMethod]} 
                onPress={() => setMethod('sms')}
              >
                <Text style={styles.methodButtonText}>SMS</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCompleteType="email"
            />
          </View>
        )}

        {step === 2 && (
          <View>
            <TextInput
              style={styles.input}
              placeholder="Enter the 4-digit code"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={4}
            />
          </View>
        )}

        {step === 3 && (
          <View>
            <TextInput
              style={styles.input}
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Repeat New Password"
              value={repeatPassword}
              onChangeText={setRepeatPassword}
              secureTextEntry
            />
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={handleNextStep}>
          <Text style={styles.buttonText}>{step < 3 ? 'Next' : 'Save'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Styles for the password recovery screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 15,
    fontSize: 16,
    color: '#fff',
  },
  button: {
    backgroundColor: '#6A0DAD',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  methodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  methodButton: {
    backgroundColor: '#444',
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: 'center',
    width: '48%',
  },
  selectedMethod: {
    backgroundColor: '#6A0DAD',
  },
  methodButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
});

export default PasswordRecoveryScreen;