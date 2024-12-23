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
  const navigation = useNavigation();

  const handleNextStep = async () => {
    if (step === 1) {
      try {
        const response = await axios.post(`http://192.168.31.42:3000/password/request-password-reset`, { 
          email,
        });
        console.log('Password reset request sent:', response.data);
        setStep(2); // Go to step 2 (enter the code)
      } catch (error) {
        console.error('Error sending password reset request:', error.response.data);
        alert('Error sending password reset request. Please try again.');
      }
    } else if (step === 2) {
      try {
        const response = await axios.post(`http://192.168.31.42:3000/password/verify-reset-code`, { 
          email, 
          code,
        });
        console.log('Code verified:', response.data);
        setStep(3); // Go to step 3 (reset password)
      } catch (error) {
        console.error('Error verifying code:', error.response.data);
        alert('Invalid code. Please try again.');
      }
    } else if (step === 3) {
      if (newPassword === repeatPassword) {
        try {
          const response = await axios.post(`http://192.168.31.42:3000/password/update-password`, { 
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

  const handleCancel = () => {
    navigation.goBack(); // Navigate back to the previous screen or home
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
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCompleteType="email"
              placeholderTextColor="#ccc" // Adjust placeholder color
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
              placeholderTextColor="#ccc" // Adjust placeholder color
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
              placeholderTextColor="#ccc" // Adjust placeholder color
            />
            <TextInput
              style={styles.input}
              placeholder="Repeat New Password"
              value={repeatPassword}
              onChangeText={setRepeatPassword}
              secureTextEntry
              placeholderTextColor="#ccc" // Adjust placeholder color
            />
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={handleNextStep}>
          <Text style={styles.buttonText}>{step < 3 ? 'Next' : 'Save'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
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
  cancelButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
});  
export default PasswordRecoveryScreen