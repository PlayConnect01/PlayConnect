import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';  // Import useRouter

const SignUpScreen = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();  // Initialize useRouter for navigation

  const handleSignUp = () => {
    // Implement sign-up logic here
    console.log('Sign up with:', username, email, password);
    // After successful sign-up, navigate to the login screen or home screen
    router.push('/auth/LoginScreen');  // Use router.push() for navigation
  };

  return (
    <ImageBackground
      source={{ uri: 'https://via.placeholder.com/1080x1920' }} // Replace with your background image URL
      style={styles.background}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
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
          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/auth/LoginScreen')}>  {/* Use router.push() for navigation */}
            <Text style={styles.linkText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
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
  linkText: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 15,
    textDecorationLine: 'underline',
  },
});

export default SignUpScreen;
