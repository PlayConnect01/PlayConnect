import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  ActivityIndicator,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { FontAwesome, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { BASE_URL } from '../../Api';
import { BlurView } from 'expo-blur';

WebBrowser.maybeCompleteAuthSession()

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function Login() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 1000,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'All fields are required!');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/users/login`, {
        email,
        password,
      });

      const { token } = response.data;
      await AsyncStorage.setItem('userToken', token);
console.log(token , "tooooken");

      // Navigate to home page after successful login
      navigation.reset({
        index: 0,
        routes: [{ name: 'Homep' }],
      });
    } catch (error) {
      Alert.alert('Error', 'Invalid login credentials!');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/signin.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Text style={styles.title}>Welcome Back!</Text>
        
        <View style={styles.inputContainer}>
          <View style={styles.inputIconContainer}>
            <FontAwesome name="user" size={20} color="#ffffff80" />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#ffffff80"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputIconContainer}>
            <FontAwesome name="lock" size={20} color="#ffffff80" />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#ffffff80"
            secureTextEntry={!isPasswordVisible}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
            <Feather name={isPasswordVisible ? 'eye' : 'eye-off'} size={20} color="#ffffff80" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.forgotPassword}
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signInButton} onPress={handleLogin}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.signInText}>Sign in</Text>
          )}
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>Or continue with</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity style={styles.socialButton}>
            <FontAwesome name="google" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <FontAwesome name="apple" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <FontAwesome name="facebook" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.createAccountButton}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.createAccountText}>Create An Account</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  backgroundImage: {
    position: 'absolute',
    width: windowWidth,
    height: windowHeight,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: windowWidth * 0.05,
    paddingTop: windowHeight * 0.25,
    alignItems: 'center',
  },
  title: {
    fontSize: Math.min(windowWidth * 0.08, 32),
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: windowHeight * 0.08,
    marginBottom: windowHeight * 0.06,
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: Math.min(windowWidth * 0.03, 15),
    marginBottom: windowHeight * 0.02,
    height: Math.min(windowHeight * 0.06, 50),
    paddingHorizontal: windowWidth * 0.04,
    width: '90%',
    maxWidth: 400,
  },
  inputIconContainer: {
    marginRight: windowWidth * 0.02,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: Math.min(windowWidth * 0.04, 16),
    marginLeft: windowWidth * 0.02,
  },
  eyeIcon: {
    padding: Math.min(windowWidth * 0.02, 10),
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: windowHeight * 0.04,
    marginTop: windowHeight * 0.01,
    width: '90%',
    maxWidth: 400,
  },
  forgotPasswordText: {
    color: '#FFFFFF',
    fontSize: Math.min(windowWidth * 0.035, 14),
  },
  signInButton: {
    backgroundColor: '#007AFF',
    borderRadius: Math.min(windowWidth * 0.03, 15),
    height: Math.min(windowHeight * 0.06, 50),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: windowHeight * 0.04,
    width: '90%',
    maxWidth: 400,
  },
  signInText: {
    color: '#FFFFFF',
    fontSize: Math.min(windowWidth * 0.04, 18),
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: windowHeight * 0.03,
    width: '90%',
    maxWidth: 400,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dividerText: {
    color: '#FFFFFF',
    marginHorizontal: windowWidth * 0.04,
    fontSize: Math.min(windowWidth * 0.035, 14),
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: windowWidth * 0.05,
    marginBottom: windowHeight * 0.05,
    width: '90%',
    maxWidth: 400,
  },
  socialButton: {
    width: Math.min(windowWidth * 0.12, 50),
    height: Math.min(windowWidth * 0.12, 50),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: Math.min(windowWidth * 0.06, 25),
    justifyContent: 'center',
    alignItems: 'center',
  },
  createAccountButton: {
    marginBottom: windowHeight * 0.05,
    flexDirection: 'row',
    alignItems: 'center',
  },
  createAccountText: {
    color: '#FFFFFF',
    fontSize: Math.min(windowWidth * 0.035, 14),
    textDecorationLine: 'underline',
  },
});