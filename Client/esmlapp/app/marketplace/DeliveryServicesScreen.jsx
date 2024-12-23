import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const DeliveryServicesScreen = () => {
  const navigation = useNavigation();
  const [selectedService, setSelectedService] = useState(null);
  const [scale] = useState(new Animated.Value(1));

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
    Animated.timing(scale, {
      toValue: 1.05,
      duration: 150,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(scale, {
        toValue: 1,
        duration: 150,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    });
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
      deliveryFee: selectedDelivery.price,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Delivery Service</Text>

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
            color={selectedService === service.id ? '#6A5AE0' : '#666'}
            style={styles.serviceIcon}
          />
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.serviceTime}>{service.time}</Text>
          </View>
          <Text style={styles.servicePrice}>${service.price.toFixed(2)}</Text>
        </TouchableOpacity>
      ))}

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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A4A4A',
    textAlign: 'center',
    marginBottom: 24,
  },
  serviceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 25,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    transform: [{ scale: 1 }],
  },
  selectedCard: {
    borderColor: '#6A5AE0',
    borderWidth: 2,
    backgroundColor: '#EFEFFD',
    shadowColor: '#6A5AE0',
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  serviceIcon: {
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  serviceTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6A5AE0',
  },
  continueButton: {
    backgroundColor: '#6A5AE0',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#6A5AE0',
    shadowOpacity: 0.5,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
  },
  disabledButton: {
    backgroundColor: '#C5C5C5',
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DeliveryServicesScreen;
