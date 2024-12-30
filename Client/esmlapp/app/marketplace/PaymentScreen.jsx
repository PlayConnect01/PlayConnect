import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../../api';
import { useStripe } from '@stripe/stripe-react-native';

const PaymentScreen = ({ route, navigation }) => {
  const { cartTotal = 0, deliveryFee = 0, cartItems } = route.params || {};
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bounceAnim] = useState(new Animated.Value(1));
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  useEffect(() => {
    const fetchPaymentSheetParams = async () => {
      const response = await axios.get(`${BASE_URL}/payments/config`);
      const { publishableKey } = response.data;

      const { error } = await initPaymentSheet({
        merchantDisplayName: 'Your Store',
        paymentIntentClientSecret: publishableKey,
      });

      if (!error) {
        console.log('PaymentSheet initialized successfully');
      }
    };

    fetchPaymentSheetParams();
  }, []);

  useEffect(() => {
    if (selectedMethod) {
      Animated.sequence([
        Animated.spring(bounceAnim, {
          toValue: 1.2,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.spring(bounceAnim, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [selectedMethod]);

  const paymentMethods = [
    {
      id: 1,
      name: "Credit Card",
      icon: "card-outline",
      details: "Visa, Mastercard, American Express",
    },
    {
      id: 2,
      name: "PayPal",
      icon: "logo-paypal",
      details: "Fast and secure payment",
    },
    {
      id: 3,
      name: "Apple Pay",
      icon: "logo-apple",
      details: "Quick tap to pay",
    },
    {
      id: 4,
      name: "Google Pay",
      icon: "logo-google",
      details: "Simple and secure payments",
    },
    {
      id: 5,
      name: "Cash on Delivery",
      icon: "cash-outline",
      details: "Pay when you receive",
    },
    {
      id: 6,
      name: "Bank Transfer",
      icon: "business-outline",
      details: "Direct bank transfer",
    },
    {
      id: 7,
      name: "Cryptocurrency",
      icon: "logo-bitcoin",
      details: "Pay with crypto",
    }
  ];

  const processPayment = async () => {
    if (!selectedMethod) {
      alert('Please select a payment method');
      return;
    }
    setIsProcessing(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      if ([1, 2, 3, 4].includes(selectedMethod)) { // Credit Card, PayPal, Apple Pay, Google Pay
        const response = await axios.post(`${BASE_URL}/payments/process`, {
          userId,
          amount: cartTotal + deliveryFee,
          items: cartItems,
        });

        const { clientSecret, orderId } = response.data;

        const { error } = await presentPaymentSheet({
          clientSecret,
        });

        if (error) {
          alert(`Error: ${error.message}`);
        } else {
          alert('Payment complete, thank you!');
          navigation.navigate('PaymentSuccess', {
            amount: cartTotal + deliveryFee,
            orderId,
          });
        }
      } else if (selectedMethod === 5) { // Cash on Delivery
        alert('Order placed. Pay upon delivery.');
        navigation.navigate('OrderConfirmation', {
          amount: cartTotal + deliveryFee,
          method: 'Cash on Delivery',
        });
      } else if (selectedMethod === 6) { // Bank Transfer
        navigation.navigate('BankTransferInstructions', {
          amount: cartTotal + deliveryFee,
          bankDetails: 'Bank details here',
        });
      } else if (selectedMethod === 7) { // Cryptocurrency
        navigation.navigate('CryptoPayment', {
          amount: cartTotal + deliveryFee,
          cryptoAddress: 'Your crypto address here',
        });
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#4FA5F5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Details</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Items Total</Text>
          <Text style={styles.summaryValue}>${cartTotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery Fee</Text>
          <Text style={styles.summaryValue}>${deliveryFee.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>
            ${(Number(cartTotal) + Number(deliveryFee)).toFixed(2)}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Select Payment Method</Text>
      <View style={styles.paymentMethods}>
        {paymentMethods.map((method) => (
          <Animated.View
            key={method.id}
            style={[
              styles.methodCard,
              selectedMethod === method.id && styles.selectedMethod,
              selectedMethod === method.id && {
                transform: [{ scale: bounceAnim }],
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => setSelectedMethod(method.id)}
              style={styles.methodButton}
            >
              <Ionicons
                name={method.icon}
                size={32}
                color={selectedMethod === method.id ? "#4FA5F5" : "#6B7280"}
                style={styles.methodIcon}
              />
              <View style={styles.methodInfo}>
                <Text style={styles.methodName}>{method.name}</Text>
                <Text style={styles.methodDetails}>{method.details}</Text>
              </View>
              {selectedMethod === method.id && (
                <Ionicons name="checkmark-circle" size={24} color="#4FA5F5" />
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.payButton,
          isProcessing && styles.processingButton,
          !selectedMethod && styles.disabledButton,
        ]}
        onPress={processPayment}
        disabled={isProcessing || !selectedMethod}
      >
        <Text style={styles.payButtonText}>
          {isProcessing ? 'Processing...' : 'Pay Now'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => {
          if (selectedMethod) {
            processPayment();
          } else {
            alert('Please select a payment method');
          }
        }}
      >
        <Text style={styles.nextButtonText}>Next Step</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFF",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8,
  },
  backButton: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 12,
    marginRight: 16,
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#EEF2FF",
    shadowColor: "#4FA5F5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#1F2937",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "600",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#EEF2FF",
    paddingTop: 12,
    marginTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4FA5F5",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#1F2937",
  },
  paymentMethods: {
    marginBottom: 24,
  },
  methodCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EEF2FF",
    shadowColor: "#4FA5F5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  selectedMethod: {
    borderColor: "#4FA5F5",
    borderWidth: 2,
    backgroundColor: "#F8FAFF",
  },
  methodButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  methodIcon: {
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
    marginRight: 8,
  },
  methodName: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "600",
    marginBottom: 2,
  },
  methodDetails: {
    fontSize: 12,
    color: "#6B7280",
  },
  payButton: {
    backgroundColor: "#4FA5F5",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#4FA5F5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  processingButton: {
    backgroundColor: "#93C5F8",
  },
  disabledButton: {
    backgroundColor: "#E5E7EB",
    shadowOpacity: 0.1,
  },
  payButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  nextButton: {
    backgroundColor: '#4FA5F5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentScreen;
