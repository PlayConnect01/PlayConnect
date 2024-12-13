import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const AuthOptionsScreen = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const navigate = useNavigation();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email.trim());

  const handlePageChange = (nextPage) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentPage(nextPage);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const renderContent = () => {
    switch (currentPage) {
      case 0:
        return (
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.title}>Welcome to SportsMate</Text>
            <Text style={styles.subtitle}>Your journey in sports starts here!</Text>
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => handlePageChange(1)}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
          </Animated.View>
        );
      case 1:
        return (
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.title}>Get Started</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigate.navigate('Login')}
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigate.navigate('SignUp')}
            >
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
          </Animated.View>
        );
      case 2:
        return (
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.title}>Password Recovery</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                if (validateEmail(email)) {
                  handlePageChange(3);
                } else {
                  Alert.alert('Error', 'Invalid email format!');
                }
              }}
            >
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </Animated.View>
        );
      case 3:
        return (
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.title}>Verification Code</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter verification code"
              placeholderTextColor="#aaa"
              value={code}
              onChangeText={setCode}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                if (code) {
                  navigate.navigate('SetupNewPassword');
                } else {
                  Alert.alert('Error', 'Code is required!');
                }
              }}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </Animated.View>
        );
      default:
        return null;
    }
  };

  return (
    <LinearGradient colors={['#000', '#333']} style={styles.container}>
      {renderContent()}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#555',
    padding: 12,
    marginTop: 20,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#fff',
    color: '#fff',
    width: '100%',
    marginBottom: 20,
    padding: 10,
  },
});

export default AuthOptionsScreen;