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
  Platform,
} from 'react-native';
import { FontAwesome, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { BASE_URL } from "../../Api";
import { BlurView } from 'expo-blur';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CustomAlert from '../../Alerts/CustomAlert';

WebBrowser.maybeCompleteAuthSession()

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const navigation = useNavigation();
  const passwordRef = useRef(null);

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
      setAlertTitle('Error');
      setAlertMessage('All fields are required!');
      setAlertVisible(true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/users/login`, {
        email,
        password,
      });

      if (response.data.user.is_banned) {
        Alert.alert(
          'Account Banned',
          'Your account has been banned. Please contact support for more information.',
          [{ text: 'OK' }]
        );
        return;
      }

      const { token, user } = response.data;
      
      await Promise.all([
        AsyncStorage.setItem('userToken', token),
        AsyncStorage.setItem('userData', JSON.stringify(user))
      ]);

      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.log('Login error:', error.response?.data);
      
      if (error.response?.status === 403 && error.response?.data?.error === "Account banned") {
        Alert.alert(
          'Account Banned',
          `${error.response.data.message}\n\nReason: ${error.response.data.ban_reason || 'Not specified'}`,
          [{ text: 'OK' }]
        );
      } else if (error.response?.status === 401) {
        Alert.alert('Error', 'Invalid email or password');
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again later.');
      }
      setAlertTitle('Error');
      setAlertMessage('Invalid login credentials!');
      setAlertVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        <ImageBackground
          source={require('../../assets/images/signin.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <View style={styles.overlay}>
          <View style={styles.contentContainer}>
            <Text style={styles.title}>Welcome Back!</Text>

            <View style={[styles.inputContainer, { marginBottom: windowHeight * 0.02 }]} >
              <FontAwesome name="envelope" size={20} color="#ffffff80" />
              <TextInput
                style={styles.input}
                placeholder="Enter Email"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor="#ffffff80"
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <FontAwesome name="lock" size={20} color="#ffffff80" />
              <TextInput
                ref={passwordRef}
                style={styles.input}
                placeholder="Enter Password"
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="#ffffff80"
                secureTextEntry={!isPasswordVisible}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={togglePasswordVisibility}>
                <Feather
                  name={isPasswordVisible ? "eye" : "eye-off"}
                  size={20}
                  color="#ffffff80"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogin} style={styles.buttonContainer}>
              <LinearGradient
                colors={['#0080FF', '#0A66C2', '#0080FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Login</Text>
                )}
              </LinearGradient>
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
          </View>
        </View>
      </View>
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </KeyboardAwareScrollView>
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
  overlay: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: windowWidth * 0.05,
    paddingTop: windowHeight * 0.15,
    alignItems: 'center',
  },
  title: {
    fontSize: windowWidth * 0.1,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: windowHeight * 0.2,
    marginBottom: windowHeight * 0.07,
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  inputGroup: {
    width: '100%',
    maxWidth: windowWidth * 0.85,
    marginBottom: windowHeight * 0.02,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: windowWidth * 0.03,
    height: windowHeight * 0.06,
    paddingHorizontal: windowWidth * 0.04,
    width: '100%',
    maxWidth: windowWidth * 0.85,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: windowWidth * 0.04,
    marginLeft: windowWidth * 0.02,
  },
  eyeIcon: {
    padding: windowWidth * 0.02,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: windowHeight * 0.04,
    marginTop: windowHeight * 0.01,
    width: '100%',
    maxWidth: windowWidth * 0.85,
  },
  forgotPasswordText: {
    color: '#FFFFFF',
    fontSize: windowWidth * 0.03,
  },
  buttonContainer: {
    width: '100%',
    borderRadius: 25,
    overflow: 'hidden',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gradient: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: windowHeight * 0.03,
    width: '100%',
    maxWidth: windowWidth * 0.85,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dividerText: {
    color: '#FFFFFF',
    marginHorizontal: windowWidth * 0.04,
    fontSize: windowWidth * 0.03,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: windowWidth * 0.05,
    marginBottom: windowHeight * 0.05,
    width: '100%',
    maxWidth: windowWidth * 0.85,
  },
  socialButton: {
    width: windowWidth * 0.12,
    height: windowWidth * 0.12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: windowWidth * 0.03,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createAccountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: windowWidth * 0.85,
    marginBottom: windowHeight * 0.12,
    marginTop: windowHeight * -0.02,
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: windowWidth * 0.035,
    marginBottom: windowHeight * 0.01,
  },
  createAccountText: {
    color: '#FFFFFF',
    fontSize: windowWidth * 0.035,
    textDecorationLine: 'underline',
  },
});
