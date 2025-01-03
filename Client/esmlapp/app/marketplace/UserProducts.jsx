import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../../Api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProducts();
  }, []);

  const fetchUserProducts = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken'); 
      const response = await axios.get(`${BASE_URL}/user-products`, {
        headers: {
          Authorization: `Bearer ${token}` 
        }
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching user products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.delete(`${BASE_URL}/product/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      Alert.alert('Success', 'Product deleted successfully!');
      fetchUserProducts();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete product. Please try again.');
      console.error('Error deleting product:', error);
    }
  };

  const renderProduct = ({ item }) => (
    <View style={styles.productContainer}>
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productDescription}>{item.description}</Text>
      <Button title="Update" onPress={() => {/* Navigate to update form */}} />
      <Button title="Delete" onPress={() => handleDelete(item.product_id)} />
      <Button title="View Reviews" onPress={() => {/* Navigate to reviews page */}} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Products</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.product_id.toString()}
          renderItem={renderProduct}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  productContainer: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
});

export default UserProducts;
