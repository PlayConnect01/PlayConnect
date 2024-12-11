// PasswordRecoveryScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './styles';

const PasswordRecoveryScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [emailOrSms, setEmailOrSms] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');

  const handleNextStep = () => {
    if (step < 3) setStep(step + 1);
    else console.log('Password updated:', newPassword);
  };

  const renderContent = () => {
    switch (step) {
      case 1:
        return (
          <View>
            <Text style={styles.title}>How would you like to restore your password?</Text>
            <View style={styles.optionContainer}>
              <TouchableOpacity
                style={styles.smsButton}
                onPress={() => setEmailOrSms('SMS')}
              >
                <Text style={styles.smsButtonText}>SMS</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.emailButton}
                onPress={() => setEmailOrSms('Email')}
              >
                <Text style={styles.emailButtonText}>Email</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 2:
        return (
          <View>
            <Text style={styles.title}>Enter the 4-digit code sent to your {emailOrSms}:</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              maxLength={4}
              placeholder="1234"
              value={code}
              onChangeText={setCode}
            />
            <TouchableOpacity>
              <Text style={styles.resendText}>Resend the code?</Text>
            </TouchableOpacity>
          </View>
        );
      case 3:
        return (
          <View>
            <Text style={styles.title}>Please set up a new password for your account</Text>
            <TextInput
              style={styles.input}
              placeholder="New Password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Repeat Password"
              secureTextEntry
              value={repeatPassword}
              onChangeText={setRepeatPassword}
            />
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🧩</Text>
        </View>
        {renderContent()}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleNextStep}
        >
          <Text style={styles.continueButtonText}>{step < 3 ? 'Continue' : 'Save'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PasswordRecoveryScreen;
