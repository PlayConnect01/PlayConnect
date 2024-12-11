import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';  // Import useRouter

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();  // Initialize router


  return (
    <ImageBackground
      source={{ uri: 'https://via.placeholder.com/1080x1920' }} // Replace with your background image URL
      style={styles.background}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to access your account</Text>

          <TextInput
            placeholder="Enter Email"
            placeholderTextColor="#ccc"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TextInput
            placeholder="Enter Password"
            placeholderTextColor="#ccc"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity onPress={() => router.push('/auth/SignUpScreen')}>  {/* Use router.push() for navigation */}
            <Text style={styles.link}>Create An Account</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/auth/ForgotPasswordScreen')}>  {/* Use router.push() for navigation */}
            <Text style={styles.link}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={()=>router.push('/Homepage/Homep')}>
            <Text style={styles.buttonText}>Sign in</Text>
          </TouchableOpacity>

          <View style={styles.socialSignIn}>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialButtonText}>f</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialButtonText}>G</Text>
            </TouchableOpacity>
          </View>
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
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    marginHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#fff',
    marginBottom: 15,
  },
  link: {
    color: '#aaa',
    textAlign: 'center',
    marginVertical: 10,
    textDecorationLine: 'underline',
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
  socialSignIn: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  socialButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 25,
    margin: 5,
  },
  socialButtonText: {
    fontSize: 18,
    color: '#333',
  },
});

export default LoginScreen;
