import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios'; // Import axios
import { useNavigation } from '@react-navigation/native';
const SignUpScreen = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate  = useNavigation();

  
  const handleSignUp = async () => {
    try {
      // Replace '192.168.x.x' with your local machine's IP address
      const response = await axios.post('http://192.168.103.10:3000/users/signup', {
        email,
        password,
        username,
      });
  
      // Handle successful signup
      console.log('Sign-up successful:', response.data);
      // Navigate to the login screen after successful signup
      navigate.navigate('Login');
    } catch (error) {
      console.log(error , "error")
      console.error('Sign-up error:', error.response?.data || error.message);
      alert('Error signing up. Please try again.');
    }
  };
  

  return (
    <ImageBackground
      source={{ url: '/Client/esmlapp/assets/images/sportscube.png' }} // Replace with your background image URL
      style={styles.background}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Text style={styles.title}>Sign Up</Text>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            placeholderTextColor="#ccc"
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholderTextColor="#ccc"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#ccc"
          />
          <TouchableOpacity style={styles.button} onPress={()=>handleSignUp()}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigate.navigate('Login')}>
            <Text style={styles.linkText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Overlay background color for readability
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Slightly lighter background for the inputs
    paddingVertical: 15,
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
  linkText: {
    color: '#ddd',
    textAlign: 'center',
    marginTop: 15,
    textDecorationLine: 'underline',
  },
});

export default SignUpScreen;
