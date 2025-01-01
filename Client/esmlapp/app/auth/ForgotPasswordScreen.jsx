import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { BASE_URL } from "../../Api";
import CustomAlert from "../../Alerts/CustomAlert";



const PasswordRecoveryScreen = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
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

  const handleNextStep = async () => {
    if (step === 1) {
      try {
        await axios.post(`${BASE_URL}/password/request-password-reset`, {
          email,
        });
        showCustomAlert(
          "Success",
          "Password reset request sent. Check your email for the code."
        );
        setStep(2);
      } catch (error) {
        showCustomAlert(
          "Error",
          "Error sending password reset request. Please try again."
        );
      }
    } else if (step === 2) {
      try {
        await axios.post(`${BASE_URL}/password/verify-reset-code`, {
          email,
          code,
        });
        showCustomAlert(
          "Success",
          "Code verified. You can now reset your password."
        );
        setStep(3);
      } catch (error) {
        showCustomAlert("Error", "Invalid code. Please try again.");
      }
    } else if (step === 3) {
      if (newPassword === repeatPassword) {
        try {
          await axios.post(`${BASE_URL}/password/update-password`, {
            email,
            newPassword,
          });
          showCustomAlert(
            "Success",
            "Password reset successfully. You can now log in."
          );
          navigation.navigate("Login");
        } catch (error) {
          showCustomAlert(
            "Error",
            "Error resetting password. Please try again."
          );
        }
      } else {
        showCustomAlert("Error", "Passwords do not match");
      }
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <LinearGradient colors={["#fff", "#fff"]} style={styles.gradient}>
      <Image
        source={require("../../assets/images/backgroundforget.png")}
        style={styles.backgroundImage}
        blurRadius={2}
      />
      <SafeAreaView style={styles.container}>
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
            <TextInput
              style={styles.input}
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholderTextColor="#666"
            />
            <TextInput
              style={styles.input}
              placeholder="Repeat New Password"
              value={repeatPassword}
              onChangeText={setRepeatPassword}
              secureTextEntry
              placeholderTextColor="#666"
            />
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
      </SafeAreaView>
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "transparent",
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0.1,
  },
  stepImage: {
    width: 280,
    height: 280,
    marginBottom: 20,
    resizeMode: "contain",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
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
    color: "#666",
    fontSize: 16,
  },
});

export default PasswordRecoveryScreen;
