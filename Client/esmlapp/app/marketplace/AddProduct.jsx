import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../../Api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddProduct = () => {
  const [productDetails, setProductDetails] = useState({
    name: '',
    description: '',
    price: '',
    discount: '',
    image_url: '',
    sport_id: '',
    rating: ''
  });

  const handleInputChange = (field, value) => {
    setProductDetails({ ...productDetails, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken'); // Retrieve user token
      const response = await axios.post(`${BASE_URL}/userproduct/product`, productDetails, {
        headers: {
          Authorization: `Bearer ${token}` // Include token in request headers
        }
      });
      if (response.status === 201) {
        Alert.alert('Success', 'Product added successfully!');
        setProductDetails({
          name: '',
          description: '',
          price: '',
          discount: '',
          image_url: '',
          sport_id: '',
          rating: ''
        });
      }
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response:', error.response.data);
        Alert.alert('Error', `Failed to add product: ${error.response.data.message}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
        Alert.alert('Error', 'No response from server. Please try again later.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Product</Text>
      {Object.keys(productDetails).map((field) => (
        <TextInput
          key={field}
          style={styles.input}
          placeholder={`Enter ${field.replace('_', ' ')}`}
          value={productDetails[field]}
          onChangeText={(value) => handleInputChange(field, value)}
          keyboardType={field === 'price' || field === 'discount' || field === 'rating' ? 'numeric' : 'default'}
        />
      ))}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F0F4F8', // Light gradient-like background
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    backgroundColor: '#4FA5F5',
    paddingVertical: 15,
    borderRadius: 8,
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default AddProduct;
