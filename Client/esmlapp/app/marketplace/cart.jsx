import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfirmationModal from './ConfirmationModal'; // Adjust the path as necessary

const CartScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Fetch cart items from the backend
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        // Get the user ID from AsyncStorage
        const userId = await AsyncStorage.getItem('userId');
        
        if (!userId) {
          console.error("No user ID found");
          return;
        }

        const response = await axios.get(`http://192.168.1.101:3000/cart/cart/user/${userId}`);
        setCartItems(response.data);
      } catch (error) {
        console.error("Error fetching cart items:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchCartItems();
  }, []);

  const updateQuantity = async (id, increment) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(1, item.quantity + increment) }
            : item
        )
      );

      // You might want to add an API call here to update the quantity on the backend
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const deleteProduct = async (cartItemId) => {
    setItemToDelete(cartItemId);
    setModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      if (!itemToDelete) return;

      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      await axios.delete(`http://192.168.1.101:3000/cart/cart/item/${itemToDelete}`);
      setCartItems((prevItems) => prevItems.filter((item) => item.cart_item_id !== itemToDelete));
      setModalVisible(false);
    } catch (error) {
      console.error("Error deleting cart item:", error.response?.data || error.message);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading cart...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
    <Text style={styles.title}>Cart</Text>

    {cartItems.length === 0 ? (
      <Text style={styles.emptyCart}>Your cart is empty</Text>
    ) : (
      <>
        {cartItems.map((item) => (
          <View key={item.cart_item_id} style={styles.cartItem}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>${item.price}</Text>
            </View>
            <View style={styles.quantityControl}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(item.cart_item_id, -1)}
              >
                <Text style={styles.quantityText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantity}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(item.cart_item_id, 1)}
              >
                <Text style={styles.quantityText}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => deleteProduct(item.cart_item_id)} style={styles.deleteButton}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.paymentDetails}>
          <View style={styles.paymentTotal}>
            <Text style={styles.paymentLabel}>Total ({cartItems.length} items)</Text>
            <Text style={styles.paymentPrice}>${calculateTotal()}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => navigation.navigate('DeliveryServices')}
        >
          <Text style={styles.checkoutText}>Choose Delivery Services</Text>
        </TouchableOpacity>
      </>
    )}

    <ConfirmationModal
      visible={isModalVisible}
      onConfirm={confirmDelete}
      onCancel={() => setModalVisible(false)}
      message="Are you sure you want to delete this item? 🗑️🤔"
    />
  </ScrollView>
);
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCart: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
    color: '#666',
  },
  deleteButton: {
    marginLeft: 10,
    backgroundColor: '#FF6347',
    borderRadius: 5,
    padding: 5,
  },
  deleteText: {
    color: '#FFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 14,
    color: '#777',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
  },
  quantityText: {
    fontSize: 18,
  },
  quantity: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  paymentDetails: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 10,
    marginTop: 20,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  paymentLabel: {
    fontSize: 16,
  },
  paymentPrice: {
    fontSize: 16,
  },
  paymentTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 10,
  },
  checkoutButton: {
    backgroundColor: '#6A5AE0',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    alignItems: 'center',
  },
  checkoutText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CartScreen;