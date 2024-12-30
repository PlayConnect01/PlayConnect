import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';



import {BASE_URL} from '../../Api';
const PasswordRecoveryScreen = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const navigation = useNavigation();

  const showAlert = (title, message) => {
    Alert.alert(title, message, [{ text: 'OK' }]);
  };

  const handleNextStep = async () => {
    if (step === 1) {
      try {
        await axios.post(`${BASE_URL}/password/request-password-reset`, { email });
        showAlert('Success', 'Password reset request sent. Check your email for the code.');
        setStep(2);
      } catch (error) {
        showAlert('Error', 'Error sending password reset request. Please try again.');
      }
    } else if (step === 2) {
      try {
        await axios.post(`${BASE_URL}/password/verify-reset-code`, { email, code });
        showAlert('Success', 'Code verified. You can now reset your password.');
        setStep(3);
      } catch (error) {
        showAlert('Error', 'Invalid code. Please try again.');
      }
    } else if (step === 3) {
      if (newPassword === repeatPassword) {
        try {
          await axios.post(`${BASE_URL}/password/update-password`, { email, newPassword });
          showAlert('Success', 'Password reset successfully. You can now log in.');
          navigation.navigate('Login');
        } catch (error) {
          showAlert('Error', 'Error resetting password. Please try again.');
        }
      } else {
        showAlert('Error', 'Passwords do not match');
      }
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <LinearGradient colors={['#0a0f24', '#1c2948']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <Image
          source={require('../../assets/images/sportscube.png')}
          style={styles.image}
        />
        <Text style={styles.title}>
          {step === 1 ? 'Password Recovery' : step === 2 ? 'Enter the Code' : 'Setup New Password'}
        </Text>

        {step === 1 && (
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#ccc"
          />
        )}

        {step === 2 && (
          <View style={styles.codeContainer}>
            {[0, 1, 2, 3].map((_, index) => (
              <TextInput
                key={index}
                style={styles.codeBox}
                value={code[index] || ''}
                onChangeText={(text) => {
                  const newCode = code.split('');
                  newCode[index] = text;
                  setCode(newCode.join(''));
                }}
                keyboardType="number-pad"
                maxLength={1}
                placeholderTextColor="#888"
              />
            ))}
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
              placeholderTextColor="#ccc"
            />
            <TextInput
              style={styles.input}
              placeholder="Repeat New Password"
              value={repeatPassword}
              onChangeText={setRepeatPassword}
              secureTextEntry
              placeholderTextColor="#ccc"
            />
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={handleNextStep}>
          <LinearGradient
            colors={['#3498db', '#2980b9']}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.buttonText}>{step < 3 ? 'Next' : 'Save'}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 180,
    height: 180,
    marginBottom: 20,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#ff6600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 30,
    marginBottom: 15,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#444',
    width: '100%',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 15,
  },
  codeBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    width: 50,
    height: 50,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ff6600',
  },
  button: {
    width: '100%',
    height: 55,
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 20,
  },
  gradientButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  cancelButton: {
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#ff8c00',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default PasswordRecoveryScreen;