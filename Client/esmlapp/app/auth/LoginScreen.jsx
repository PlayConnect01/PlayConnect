import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons'; // For social icons
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigation();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://192.168.103.8:3000/users/login', {
        email,
        password,
      });

      console.log('Login successful:', response.data);
      const { token  } = response.data;

      // Store the token in AsyncStorage
      await AsyncStorage.setItem('userToken', token);

      // Navigate to home page after successful login
      navigate.navigate('Homepage/Homep'); // Adjust the route accordingly
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      alert('Invalid credentials. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('../../assets/images/sportscube.png')} // Replace with your image URL
        style={styles.image}
      />
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to access your account</Text>

      <View style={styles.inputContainer}>
        <FontAwesome name="envelope" size={20} color="#999" />
        <TextInput
          style={styles.input}
          placeholder="Enter Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputContainer}>
        <FontAwesome name="lock" size={20} color="#999" />
        <TextInput
          style={styles.input}
          placeholder="Enter Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.links}>
        <TouchableOpacity onPress={() => navigate.navigate('SignUp')}>
          <Text style={styles.linkText}>Create An Account</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigate.navigate('ForgotPassword')}>
          <Text style={styles.linkText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <Text style={styles.socialText}>Sign in With</Text>
      <View style={styles.socialContainer}>
        <FontAwesome name="facebook" size={30} color="#fff" style={styles.socialIcon} />
        <FontAwesome name="google" size={30} color="#fff" style={styles.socialIcon} />
        <FontAwesome name="envelope" size={30} color="#fff" style={styles.socialIcon} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#444',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    width: '100%',
    height: 50,
  },
  input: {
    flex: 1,
    color: '#fff',
    marginLeft: 10,
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  linkText: {
    color: '#6e3de8',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#6e3de8',
    borderRadius: 8,
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  socialText: {
    color: '#fff',
    marginBottom: 10,
    fontSize: 14,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '60%',
  },
  socialIcon: {
    marginHorizontal: 10,
  },
});
