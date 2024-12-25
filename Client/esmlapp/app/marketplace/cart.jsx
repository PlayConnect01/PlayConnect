import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfirmationModal from './ConfirmationModal'; // Adjust the path as necessary
import { BASE_URL } from '../../Api';
const CartScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
 

  // Fetch cart items
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        console.log('Fetched User ID:', userId);

        if (!userId) throw new Error('User ID not found');

        const response = await fetch(`${ BASE_URL }/cart/cart/user/${userId}`);
        console.log('Fetch cart response status:', response.status);

        if (!response.ok) throw new Error('Failed to fetch cart items');

        const data = await response.json();
        setCartItems(data);
      } catch (error) {
        Alert.alert('Error', error.message || 'Failed to fetch cart items.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const updateQuantity = async (cartItemId, increment) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) throw new Error('User ID not found');

      const updatedItem = cartItems.find((item) => item.cart_item_id === cartItemId);
      const newQuantity = Math.max(1, updatedItem.quantity + increment);

      const response = await fetch(`${BASE_URL}/cart/items/${cartItemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, quantity: newQuantity }),
      });

      console.log('Update quantity response status:', response.status);

      if (!response.ok) throw new Error('Failed to update item quantity');

      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.cart_item_id === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update item quantity.');
      console.error(error);
    }
  };

  const deleteProduct = (cartItemId) => {
    console.log(`Preparing to delete item with ID: ${cartItemId}`);
    setItemToDelete(cartItemId);
    setModalVisible(true);
  };
  
  const confirmDelete = async () => {
    console.log(`Deleting item with ID: ${itemToDelete}`);
    try {
      if (!itemToDelete) {
        throw new Error('No item selected for deletion');
      }
  
      const response = await fetch(`${BASE_URL}/cart/cart/item/${itemToDelete}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error(`Failed to delete item. Status: ${response.status}`);
      }
  
      setCartItems((prevItems) => prevItems.filter((item) => item.cart_item_id !== itemToDelete));
      console.log(`Item with ID ${itemToDelete} deleted successfully.`);
      setItemToDelete(null); // Reset after successful deletion
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to delete item.');
      console.error(error);
    } finally {
      setModalVisible(false); // Close modal regardless of success or failure
    }
  };
  
  const calculateTotal = () =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const navigateToDeliveryServices = () => {
    navigation.navigate('delivery', {
      cartTotal: calculateTotal(),
      cartItems,
    });
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
              <Image
                source={{ uri: item.image }}
                style={styles.itemImage}
                defaultSource={require('../../assets/images/sportscube.png')} // Add placeholder image
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
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
              <TouchableOpacity
                onPress={() => deleteProduct(item.cart_item_id)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.paymentDetails}>
            <Text style={styles.paymentLabel}>Total ({cartItems.length} items)</Text>
            <Text style={styles.paymentPrice}>${calculateTotal().toFixed(2)}</Text>
          </View>

          <TouchableOpacity style={styles.checkoutButton} onPress={navigateToDeliveryServices}>
            <Text style={styles.checkoutText}>Choose Delivery Services</Text>
          </TouchableOpacity>
        </>
      )}

<ConfirmationModal 
  visible={isModalVisible}
  onConfirm={confirmDelete}
  onCancel={() => {
    setItemToDelete(null); // Reset itemToDelete if canceled
    setModalVisible(false);
  }}
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
