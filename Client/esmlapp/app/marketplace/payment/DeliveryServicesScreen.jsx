import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Easing,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const DeliveryServicesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [selectedService, setSelectedService] = useState(null);
  const scale = useRef(new Animated.Value(1)).current;

  // Get cart data from route params
  const { cartTotal, cartItems } = route.params || { cartTotal: 0, cartItems: [] };

  const deliveryServices = [
    {
      id: 1,
      name: 'Standard Delivery',
      price: 5.99,
      time: '3-5 business days',
      details: 'Reliable and affordable delivery option.',
      icon: 'bicycle',
    },
    {
      id: 2,
      name: 'Express Delivery',
      price: 12.99,
      time: '1-2 business days',
      details: 'Faster delivery option for urgent needs.',
      icon: 'rocket',
    },
    {
      id: 3,
      name: 'Same Day Delivery',
      price: 19.99,
      time: 'Today',
      details: 'Get your items delivered today!',
      icon: 'flash',
    },
  ];

  const handleCardPress = (serviceId) => {
    setSelectedService(serviceId);
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.05,
        duration: 150,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 150,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleContinue = () => {
    if (!selectedService) {
      Alert.alert('Selection Required', 'Please select a delivery service.');
      return;
    }
  
    const selectedDelivery = deliveryServices.find(
      (service) => service.id === selectedService
    );
  
    navigation.navigate('Payment', {
      cartTotal,
      deliveryFee: selectedDelivery.price,
      cartItems,
      deliveryService: selectedDelivery,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#4FA5F5" />
        </TouchableOpacity>

        <Text style={styles.title}>Choose Delivery Service</Text>

        <View style={styles.cardsContainer}>
          {deliveryServices.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceCard,
                selectedService === service.id && styles.selectedCard,
              ]}
              onPress={() => handleCardPress(service.id)}
              onLongPress={() => Alert.alert(service.name, service.details)}
            >
              <Ionicons
                name={service.icon}
                size={32}
                color={selectedService === service.id ? '#4FA5F5' : '#6B7280'}
                style={styles.serviceIcon}
              />
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceTime}>{service.time}</Text>
                <Text style={styles.serviceDetails}>{service.details}</Text>
              </View>
              <Text style={[
                styles.servicePrice,
                selectedService === service.id && styles.selectedPrice
              ]}>
                ${service.price.toFixed(2)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Cart Total:</Text>
            <Text style={styles.summaryValue}>${cartTotal.toFixed(2)}</Text>
          </View>
          {selectedService && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee:</Text>
              <Text style={styles.summaryValue}>
                ${deliveryServices.find(s => s.id === selectedService)?.price.toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedService && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={!selectedService}
        >
          <Text style={styles.continueButtonText}>Continue to Payment</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 12,
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 24,
  },
  cardsContainer: {
    marginTop: 16,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEF2FF',
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  selectedCard: {
    borderColor: '#4FA5F5',
    borderWidth: 2,
    backgroundColor: '#F8FAFF',
  },
  serviceIcon: {
    marginRight: 16,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  serviceTime: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  serviceDetails: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4FA5F5',
  },
  selectedPrice: {
    color: '#4FA5F5',
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    marginBottom: 24,
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#4FA5F5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0.1,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DeliveryServicesScreen;
