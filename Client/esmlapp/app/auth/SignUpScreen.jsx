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
import { BASE_URL } from '../../Api';
import { useState, useEffect } from 'react';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const SignUpScreen = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
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
        <Text style={styles.title}>Join the Team Today!</Text>

        <View style={styles.inputContainer}>
          <FontAwesome name="user" size={20} color="#ffffff80" />
          <TextInput
            style={styles.input}
            placeholder="Username"
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
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible}
            placeholderTextColor="#ffffff80"
          />
          <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
            <FontAwesome name={isPasswordVisible ? 'eye' : 'eye-slash'} size={20} color="#ffffff80" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <FontAwesome name="lock" size={20} color="#ffffff80" />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!isConfirmPasswordVisible}
            placeholderTextColor="#ffffff80"
          />
          <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} style={styles.eyeIcon}>
            <FontAwesome name={isConfirmPasswordVisible ? 'eye' : 'eye-slash'} size={20} color="#ffffff80" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
          <Text style={styles.signUpText}>Sign up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginText}>Already Have An Account?</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

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
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: Math.min(windowWidth * 0.04, 16),
    marginLeft: windowWidth * 0.02,
  },
  eyeIcon: {
    padding: Math.min(windowWidth * 0.02, 10),
  },
  signUpButton: {
    backgroundColor: '#007AFF',
    borderRadius: Math.min(windowWidth * 0.03, 15),
    height: Math.min(windowHeight * 0.06, 50),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: windowHeight * 0.02,
    marginBottom: windowHeight * 0.03,
    width: '90%',
    maxWidth: 400,
  },
  signUpText: {
    color: '#FFFFFF',
    fontSize: Math.min(windowWidth * 0.04, 18),
    fontWeight: '600',
  },
  loginButton: {
    marginBottom: windowHeight * 0.05,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginText: {
    color: '#FFFFFF',
    fontSize: Math.min(windowWidth * 0.035, 14),
    textDecorationLine: 'underline',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: Math.min(windowWidth * 0.035, 14),
    marginBottom: windowHeight * 0.02,
    textAlign: 'center',
    width: '90%',
    maxWidth: 400,
  },
});

export default SignUpScreen;