import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import axios from 'axios';

const PasswordRecoveryScreen = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const router = useRouter();

  const handleNextStep = async () => {
    if (step === 1) {
      // Step 1: Send a password reset request to the backend
      try {
        const response = await axios.post('http://localhost:3000/users/forgotPassword', { email });
        console.log('Password reset request sent:', response.data);
        setStep(2); // Go to step 2 (enter the code)
      } catch (error) {
        console.error('Error sending password reset email:', error.response.data);
        alert('Error sending password reset request. Please try again.');
      }
    } else if (step === 2) {
      // Step 2: Verify the code and reset the password
      try {
        const response = await axios.post('http://localhost:3000/users/verifyResetCode', { email, code });
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
          const response = await axios.post('http://localhost:3000/users/resetPassword', { email, newPassword });
          console.log('Password updated:', response.data);
          router.push('/auth/LoginScreen'); // Redirect to login
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
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Password Recovery</Text>
        {step === 1 && (
          <View>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
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
          <Text style={styles.buttonText}>{step < 3 ? 'Continue' : 'Save'}</Text>
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
    padding: 20,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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
});

export default PasswordRecoveryScreen;
