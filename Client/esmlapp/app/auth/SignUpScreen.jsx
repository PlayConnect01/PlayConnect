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
} from "react-native";
import { FontAwesome, Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../Api";
import { useState, useEffect, useRef } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import CustomAlert from '../../Alerts/CustomAlert';

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const SignUpScreen = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const navigation = useNavigation();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

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
    if (!username || !email || !password || !confirmPassword) {
      setAlertTitle('Error');
      setAlertMessage('All fields are required!');
      setAlertVisible(true);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAlertTitle('Invalid Email');
      setAlertMessage('Please enter a valid email address.');
      setAlertVisible(true);
      return;
    }

    // Password validation
    if (password.length < 8) {
      setAlertTitle('Invalid Password');
      setAlertMessage('Password must be at least 8 characters long.');
      setAlertVisible(true);
      return;
    }

    if (password !== confirmPassword) {
      setAlertTitle('Password Mismatch');
      setAlertMessage('Passwords do not match!');
      setAlertVisible(true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/users/signup`, {
        username,
        email,
        password,
      });
      setAlertTitle('Success');
      setAlertMessage('Sign up successful! Please login.');
      setAlertVisible(true);
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);
    } catch (error) {
      console.log('Signup error:', error.response?.data);
      
      if (error.response?.data?.error === 'Email already exists') {
        setAlertTitle('Email Error');
        setAlertMessage('This email is already registered. Please use a different email or login.');
      } else if (error.response?.data?.error === 'Username already exists') {
        setAlertTitle('Username Error');
        setAlertMessage('This username is already taken. Please choose a different username.');
      } else {
        setAlertTitle('Error');
        setAlertMessage('Something went wrong. Please try again later.');
      }
      setAlertVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/signin.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.overlay}>
          <View style={styles.contentContainer}>
            <Text style={styles.title}>Join the Team Today!</Text>

            <View style={styles.inputContainer}>
              <FontAwesome name="user" size={20} color="#ffffff80" />
              <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                placeholderTextColor="#ffffff80"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <FontAwesome name="envelope" size={20} color="#ffffff80" />
              <TextInput
                ref={emailRef}
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
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                blurOnSubmit={false}
              />
              <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                <Feather
                  name={isPasswordVisible ? "eye" : "eye-off"}
                  size={20}
                  color="#ffffff80"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <FontAwesome name="lock" size={20} color="#ffffff80" />
              <TextInput
                ref={confirmPasswordRef}
                style={styles.input}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholderTextColor="#ffffff80"
                secureTextEntry={!isConfirmPasswordVisible}
                returnKeyType="done"
                onSubmitEditing={handleSignUp}
              />
              <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
                <Feather
                  name={isConfirmPasswordVisible ? "eye" : "eye-off"}
                  size={20}
                  color="#ffffff80"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleSignUp}
              style={styles.buttonContainer}
            >
              <LinearGradient
                colors={["#0080FF", "#0A66C2", "#0080FF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Sign Up</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.loginTextContainer}>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => navigation.navigate("Login")}
              >
                <Text style={styles.loginText}>
                  Already have an account? Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
  backgroundImage: {
    position: "absolute",
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
    alignItems: "center",
  },
  title: {
    fontSize: windowWidth * 0.1,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: windowHeight * 0.2,
    marginBottom: windowHeight * 0.07,
    textAlign: "center",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: windowWidth * 0.03,
    marginBottom: windowHeight * 0.02,
    height: windowHeight * 0.06,
    paddingHorizontal: windowWidth * 0.04,
    width: "100%",
    maxWidth: windowWidth * 0.85,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: windowWidth * 0.04,
    marginLeft: windowWidth * 0.02,
  },
  eyeIcon: {
    padding: windowWidth * 0.02,
  },
  buttonContainer: {
    width: "100%",
    borderRadius: 25,
    overflow: "hidden",
    marginVertical: 10,
    marginBottom: 30,
    shadowColor: "#000",
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
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  loginTextContainer: {
    marginTop: -15,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  loginText: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
    textDecorationLine: "underline",
  },
});

export default SignUpScreen;
