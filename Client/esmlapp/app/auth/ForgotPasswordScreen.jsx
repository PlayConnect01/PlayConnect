import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { BASE_URL } from "../../Api";
import CustomAlert from "../../Alerts/CustomAlert";
import { Feather } from "@expo/vector-icons";

const PasswordRecoveryScreen = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isRepeatPasswordVisible, setIsRepeatPasswordVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const navigation = useNavigation();

  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const showCustomAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    if (password.length < minLength) errors.push("at least 8 characters");
    if (!hasUpperCase) errors.push("one uppercase letter");
    if (!hasLowerCase) errors.push("one lowercase letter");
    if (!hasNumbers) errors.push("one number");
    if (!hasSpecialChar) errors.push("one special character");

    return errors;
  };

  const handleNextStep = async () => {
    if (step === 1) {
      if (!email) {
        showCustomAlert("Error", "Please enter your email address.");
        return;
      }

      if (!validateEmail(email)) {
        showCustomAlert("Invalid Email", "Please enter a valid email address.");
        return;
      }

      try {
        const response = await axios.post(`${BASE_URL}/password/request-password-reset`, {
          email,
        });
        showCustomAlert(
          "Success",
          "Password reset code has been sent to your email. Please check your inbox and spam folder."
        );
        setStep(2);
      } catch (error) {
        if (error.response?.status === 404) {
          showCustomAlert("Error", "No account found with this email address.");
        } else if (error.response?.status === 429) {
          showCustomAlert("Error", "Too many attempts. Please try again later.");
        } else {
          showCustomAlert(
            "Error",
            "Unable to send reset code. Please try again later."
          );
        }
      }
    } else if (step === 2) {
      if (!code || code.length !== 4) {
        showCustomAlert("Invalid Code", "Please enter the 4-digit verification code.");
        return;
      }

      try {
        const response = await axios.post(`${BASE_URL}/password/verify-reset-code`, {
          email,
          code,
        });
        showCustomAlert("Success", "Code verified successfully.");
        setStep(3);
      } catch (error) {
        if (error.response?.status === 400) {
          showCustomAlert("Invalid Code", "The code you entered is incorrect. Please try again.");
        } else if (error.response?.status === 408) {
          showCustomAlert("Code Expired", "The verification code has expired. Please request a new one.");
          setStep(1);
        } else {
          showCustomAlert("Error", "Failed to verify code. Please try again.");
        }
      }
    } else if (step === 3) {
      if (!newPassword || !repeatPassword) {
        showCustomAlert("Error", "Please fill in all password fields.");
        return;
      }

      const passwordErrors = validatePassword(newPassword);
      if (passwordErrors.length > 0) {
        showCustomAlert(
          "Invalid Password",
          `Password must contain ${passwordErrors.join(", ")}.`
        );
        return;
      }

      if (newPassword !== repeatPassword) {
        showCustomAlert("Password Mismatch", "The passwords you entered do not match.");
        return;
      }

      try {
        await axios.post(`${BASE_URL}/password/update-password`, {
          email,
          newPassword,
          code,
        });
        showCustomAlert(
          "Success",
          "Password reset successful! You will be redirected to the login screen."
        );
        setTimeout(() => {
          navigation.navigate("Login");
        }, 2000);
      } catch (error) {
        if (error.response?.status === 400) {
          showCustomAlert("Error", "Invalid password format or expired session.");
        } else {
          showCustomAlert(
            "Error",
            "Failed to update password. Please try again later."
          );
        }
      }
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require("../../assets/images/signin.png")}
          style={styles.backgroundImage}
        />
        <View style={styles.container}>
          <Image
            source={
              step === 1
                ? require("../../assets/images/Forgot password-amico 1.png")
                : require("../../assets/images/Enter OTP-rafiki 1.png")
            }
            style={styles.stepImage}
          />
          <Text style={styles.title}>
            {step === 1
              ? "Forgot Password?"
              : step === 2
              ? "Verify"
              : "Setup New Password"}
          </Text>

          {step === 1 && (
            <View style={styles.inputContainer}>
              <Text style={styles.subtitle}>
                Don't worry! Please enter the email address linked with your
                account
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#666"
              />
            </View>
          )}

          {step === 2 && (
            <View style={styles.inputContainer}>
              <Text style={styles.subtitle}>
                Enter the verification code sent to your email
              </Text>
              <View style={styles.codeContainer}>
                {[0, 1, 2, 3].map((_, index) => (
                  <TextInput
                    key={index}
                    ref={inputRefs[index]}
                    style={styles.codeBox}
                    value={code[index] || ""}
                    onChangeText={(text) => {
                      if (text.length <= 1) {
                        const newCode = code.split("");
                        newCode[index] = text;
                        setCode(newCode.join(""));

                        // Move to next input if there's a value and not the last input
                        if (text.length === 1 && index < 3) {
                          inputRefs[index + 1].current.focus();
                        }
                      }
                    }}
                    onKeyPress={({ nativeEvent }) => {
                      // Move to previous input on backspace if current input is empty
                      if (
                        nativeEvent.key === "Backspace" &&
                        !code[index] &&
                        index > 0
                      ) {
                        inputRefs[index - 1].current.focus();
                      }
                    }}
                    keyboardType="number-pad"
                    maxLength={1}
                    placeholderTextColor="#888"
                  />
                ))}
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.inputContainer}>
              <Text style={styles.subtitle}>Enter your new password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="New Password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!isNewPasswordVisible}
                  placeholderTextColor="#666"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
                >
                  <Feather
                    name={isNewPasswordVisible ? "eye" : "eye-off"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Repeat New Password"
                  value={repeatPassword}
                  onChangeText={setRepeatPassword}
                  secureTextEntry={!isRepeatPasswordVisible}
                  placeholderTextColor="#666"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setIsRepeatPasswordVisible(!isRepeatPasswordVisible)}
                >
                  <Feather
                    name={isRepeatPasswordVisible ? "eye" : "eye-off"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={handleNextStep}>
            <LinearGradient
              colors={["#3498db", "#2980b9"]}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.buttonText}>{step < 3 ? "Next" : "Save"}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    minHeight: "100%",
  },
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
    paddingTop: 200,
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 1,
    resizeMode: "cover",
  },
  stepImage: {
    width: 200,
    height: 200,
    marginTop: 50,
    marginBottom: 30,
    resizeMode: "contain",
    alignSelf: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  inputContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginBottom: 20,
    gap: 8,
  },
  codeBox: {
    width: 45,
    height: 45,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    textAlign: "center",
    fontSize: 20,
    color: "#333",
  },
  passwordContainer: {
    width: "100%",
    height: 50,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#333",
  },
  eyeIcon: {
    padding: 10,
  },
  button: {
    width: "100%",
    marginTop: 20,
    borderRadius: 25,
    overflow: "hidden",
  },
  gradientButton: {
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3498db",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    marginTop: 15,
    padding: 10,
  },
  cancelButtonText: {
    color: "#D3D3D3",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});

export default PasswordRecoveryScreen;
