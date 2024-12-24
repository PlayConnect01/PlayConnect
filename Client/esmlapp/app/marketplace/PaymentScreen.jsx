import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
} from 'react-native';
import { useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { BASE_URL } from '../../.env/Api'
const PaymentScreen = ({ route, navigation }) => {
    const { cartTotal = 0, deliveryFee = 0 } = route.params || {};
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [bounceAnim] = useState(new Animated.Value(1));



  const paymentMethods = [
    {
      id: 1,
      name: 'Credit Card',
      icon: 'credit-card-outline', // Icon name
    },
    {
      id: 2,
      name: 'PayPal',
      icon: 'paypal', // Icon name
    },
    {
      id: 3,
      name: 'Apple Pay',
      icon: 'apple-pay', // Icon name
    },
  ];
  

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

  const processPayment = async () => {
    if (!selectedMethod) {
      alert('Please select a payment method');
      return;
    }

    setIsProcessing(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      
      // Simulate payment processing
      const paymentResponse = await axios.post(`${BASE_URL}/payments/process`, {
        userId,
        amount: cartTotal + deliveryFee, // Ensure this calculation
        paymentMethod: selectedMethod,
        items: route.params.cartItems,
      });

      if (paymentResponse.data.success) {
        // Clear cart after successful payment
        await axios.delete(`${BASE_URL}/cart/cart/clear/${userId}`);
        
        navigation.navigate('PaymentSuccess', {
          amount: cartTotal + deliveryFee,
          orderId: paymentResponse.data.orderId,
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Payment Details</Text>
      <MaterialIcons name="payment" size={24} color="#6A5AE0" />
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
      <MaterialCommunityIcons
        name={method.icon}
        size={40}
        color={selectedMethod === method.id ? '#6A5AE0' : '#666'}
      />
      <Text style={styles.methodName}>{method.name}</Text>
      {selectedMethod === method.id && (
        <MaterialIcons name="check-circle" size={24} color="#6A5AE0" />
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 16,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 12,
    marginTop: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6A5AE0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  paymentMethods: {
    marginBottom: 24,
  },
  methodCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedMethod: {
    borderColor: '#6A5AE0',
    borderWidth: 2,
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  methodIcon: {
    width: 40,
    height: 40,
    marginRight: 16,
  },
  methodName: {
    fontSize: 16,
    flex: 1,
    color: '#333',
  },
  payButton: {
    backgroundColor: '#6A5AE0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  processingButton: {
    backgroundColor: '#8F85E8',
  },
  disabledButton: {
    backgroundColor: '#C5C5C5',
  },
  payButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PaymentScreen;