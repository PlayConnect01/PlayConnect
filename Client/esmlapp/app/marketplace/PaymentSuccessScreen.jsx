import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const PaymentSuccessScreen = ({ route, navigation }) => {
  const { amount, orderId } = route.params || {}; // Fallback in case params are undefined
  const checkmarkScale = React.useRef(new Animated.Value(0)).current; // Use Ref to avoid unnecessary re-creation

  useEffect(() => {
    Animated.spring(checkmarkScale, {
      toValue: 1,
      friction: 3,
      tension: 30, // Slightly smoother tension
      useNativeDriver: true,
    }).start();

    // Auto navigate back to home after 3 seconds
    const timer = setTimeout(() => {
      navigation.navigate('MarketplaceHome');
    }, 3000);

    return () => clearTimeout(timer);
  }, [checkmarkScale, navigation]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.checkmarkContainer,
          { transform: [{ scale: checkmarkScale }] },
        ]}
      >
        <MaterialIcons name="check-circle" size={100} color="#4CAF50" />
      </Animated.View>
      <Text style={styles.title}>Payment Successful!</Text>
      <Text style={styles.amount}>
        ${typeof amount === 'number' ? amount.toFixed(2) : '0.00'}
      </Text>
      <Text style={styles.orderId}>
        Order ID: {orderId || 'Unavailable'}
      </Text>
      <Text style={styles.message}>
        Thank you for your purchase. Your order is being processed.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 20,
  },
  checkmarkContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 16,
  },
  orderId: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default PaymentSuccessScreen;
