import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartScreen = () => {
  const [cartItems, setCartItems] = useState([]);

  // Function to fetch cart items
  const fetchCartItems = async () => {
    try {
      const userId = 1; // Replace with the actual user ID or retrieve it from AsyncStorage
      const token = await AsyncStorage.getItem('userToken'); // Assuming you store the token in AsyncStorage

      const response = await axios.get(`http://192.168.103.10:3000/cart/cart/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Send the token in the header
        },
      });

      // Check if response data is an array
      if (Array.isArray(response.data)) {
        setCartItems(response.data); // Set the cart items from the response
      } else {
        console.error("Unexpected response format:", response.data);
        Alert.alert("Error", "Failed to fetch cart items.");
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
      Alert.alert("Error", "Failed to fetch cart items.");
    }
  };

  // Fetch cart items when the component mounts
  useEffect(() => {
    fetchCartItems();
  }, []);

  const incrementQuantity = (cartItemId) => {
    const updatedCart = cartItems.map(item =>
      item.cart_item_id === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCartItems(updatedCart);
  };

  const decrementQuantity = (cartItemId) => {
    const updatedCart = cartItems.map(item =>
      item.cart_item_id === cartItemId && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
    );
    setCartItems(updatedCart);
  };

  const deleteCartItem = async (cartItemId) => {
    try {
      const token = await AsyncStorage.getItem('userToken'); // Assuming you store the token in AsyncStorage
      await axios.delete(`http://192.168.103.10:3000/cart/cart/item/${cartItemId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Send the token in the header
        },
      });

      // Refetch cart items after deletion
      fetchCartItems();
      Alert.alert("Success", "Item removed from cart.");
    } catch (error) {
      console.error("Error deleting cart item:", error);
      Alert.alert("Error", "Failed to delete item from cart.");
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Cart</Text>
      <ScrollView>
        {cartItems.map((item) => (
          <View key={item.cart_item_id} style={styles.cartItem}> {/* Use cart_item_id as the key */}
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.details}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
            </View>
            <View style={styles.quantityControls}>
              <TouchableOpacity onPress={() => decrementQuantity(item.cart_item_id)} style={styles.button}>
                <Text style={styles.buttonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantity}>{item.quantity}</Text>
              <TouchableOpacity onPress={() => incrementQuantity(item.cart_item_id)} style={styles.button}>
                <Text style={styles.buttonText}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => deleteCartItem(item.cart_item_id)} style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.paymentDetails}>
          {cartItems.map((item) => (
            <Text key={item.cart_item_id} style={styles.paymentDetailText}>
              {item.name} ${item.price.toFixed(2)}
            </Text>
          ))}
          <Text style={styles.totalText}>
            Total ({calculateTotalItems()} items) ${calculateTotal().toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity style={styles.deliveryButton}>
          <Text style={styles.deliveryButtonText}>Choose Delivery Services</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fc',
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  details: {
    flex: 1,
    marginLeft: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 12,
    color: '#6e6e6e',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    padding: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantity: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  deleteButton: {
    backgroundColor: '#ff3b8f',
    borderRadius: 5,
    padding: 5,
    marginLeft: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  paymentDetails: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  paymentDetailText: {
    fontSize: 14,
    marginBottom: 5,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  deliveryButton: {
    backgroundColor: '#7b61ff',
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
    alignItems: 'center',
  },
  deliveryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CartScreen;