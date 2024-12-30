import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Animated,
  Easing
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import axios from 'axios';
import { BASE_URL } from '../../Api.js';

const SignUpScreen = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigation = useNavigation();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        easing: Easing.bounce,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleSignUp = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/users/signup`, {
        username,
        email,
        password,
      });
      console.log('Sign-up successful:', response.data);
      navigation.navigate('Login');
    } catch (error) {
      console.error('Sign-up error:', error.response?.data || error.message);
      alert('Error signing up. Please try again.');
    }
  };

  return (
    <View style={styles.backgroundImage}>
      <SafeAreaView style={styles.content}>
        <View style={styles.topContainer}>
          <Image
            style={styles.topImage}
            source={require('../../assets/images/Loginbackground.jpg')}
            resizeMode="contain"
          />
        </View>
        <BlurView intensity={80} tint="dark" style={styles.formContainer}>
          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'transparent']}
            style={styles.formOverlay}
          />
          
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>Join the Team Today!</Text>

          <View style={styles.inputContainer}>
            <FontAwesome name="user" size={20} color="#ffffff80" />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={username}
              onChangeText={setUsername}
              placeholderTextColor="#ffffff80"
            />
          </View>

          <View style={styles.inputContainer}>
            <FontAwesome name="envelope" size={20} color="#ffffff80" />
            <TextInput
              style={styles.input}
              placeholder="Enter Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholderTextColor="#ffffff80"
            />
          </View>

          <View style={styles.inputContainer}>
            <FontAwesome name="lock" size={20} color="#ffffff80" />
            <TextInput
              style={styles.input}
              placeholder="Enter Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor="#ffffff80"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <FontAwesome name={showPassword ? 'eye' : 'eye-slash'} size={20} color="#ffffff80" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <FontAwesome name="lock" size={20} color="#ffffff80" />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              placeholderTextColor="#ffffff80"
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <FontAwesome name={showConfirmPassword ? 'eye' : 'eye-slash'} size={20} color="#ffffff80" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Already Have An Account?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </BlurView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'flex-start',
  },
  content: {
    flex: 1,
    padding: 0,
    justifyContent: 'flex-start',
  },
  topContainer: {
    height: '35%',
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 0,
  },
  topImage: {
    width: '100%',
    height: '100%',
  },
  formContainer: {
    padding: 35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    marginTop: -29,
    marginLeft: 0,
    marginRight: 0,
    width: '100%',
    paddingTop: 25,
    backgroundColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  formOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  input: {
    flex: 1,
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
  },
  linkText: {
    color: '#3498db',
    fontSize: 14,
    marginBottom: 20,
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    width: '100%',
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SignUpScreen;