import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuth } from '../../context/AuthContext';

WebBrowser.maybeCompleteAuthSession();

const API_URL = "http://localhost:3000"; // Update accordingly

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const { setUser } = useAuth();
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: 'YOUR_GOOGLE_OAUTH_CLIENT_ID', // Replace with your Google OAuth Client ID
  });

  // Handle regular login with email and password
  const handleLogin = async () => {
    try {
      const response = await axios.post('http://192.168.163.101:3000/users/login', {
        email,
        password,
      });

      console.log('Login successful:', response.data);
      const { token } = response.data;

      // Store the token in AsyncStorage
      await AsyncStorage.setItem('userToken', token);
      
      // Navigate to home page after successful login
      navigation.navigate('Homep'); // Adjust the route accordingly
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      alert('Invalid credentials. Please try again.');
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    try {
      const result = await promptAsync();
      if (result.type === 'success') {
        const { id_token } = result.params;

        const response = await axios.post(`${API_URL}/users/auth/google-token`, {
          idToken: id_token,
        });
        const { user, token } = response.data;
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(user));
        setUser(user);
        navigation.navigate('Homep');
      } else {
        Alert.alert('Error', 'Google login failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Google login failed');
    }
  };

  // Handle Facebook login
  const handleFacebookLogin = async () => {
    try {
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
      if (result.isCancelled) {
        throw new Error('User cancelled login');
      }

      const data = await AccessToken.getCurrentAccessToken();
      const response = await axios.post(`${API_URL}/users/auth/facebook-token`, {
        accessToken: data.accessToken,
      });
      const { user, token } = response.data;
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      setUser(user);
      navigation.navigate('Homep');
    } catch (error) {
      Alert.alert('Error', 'Facebook login failed');
    }
  };

  // Clear input fields when navigating away from this screen
  useEffect(() => {
    return () => {
      setEmail('');
      setPassword('');
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('../../assets/images/sportscube.png')}
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
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.linkText}>Create An Account</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.linkText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <Text style={styles.socialText}>Sign in With</Text>
      <View style={styles.socialContainer}>
        <TouchableOpacity onPress={handleFacebookLogin}>
          <FontAwesome name="facebook" size={30} color="#fff" style={styles.socialIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleGoogleLogin}>
          <FontAwesome name="google" size={30} color="#fff" style={styles.socialIcon} />
        </TouchableOpacity>
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