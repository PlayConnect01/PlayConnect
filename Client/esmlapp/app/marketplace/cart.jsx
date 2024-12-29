import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfirmationModal from './ConfirmationModal'; // Adjust the path as necessary
import {BASE_URL} from '../../api';

const CartScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Fetch cart items
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        console.log("Fetched User ID:", userId);

        if (!userId) throw new Error("User ID not found");

        const response = await fetch(`${BASE_URL}/cart/cart/user/${userId}`);
        console.log('Fetch cart response status:', response.status);

        if (!response.ok) throw new Error("Failed to fetch cart items");

        const data = await response.json();
        setCartItems(data);
      } catch (error) {
        Alert.alert("Error", error.message || "Failed to fetch cart items.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const updateQuantity = async (cartItemId, increment) => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) throw new Error("User ID not found");

      const updatedItem = cartItems.find(
        (item) => item.cart_item_id === cartItemId
      );
      const newQuantity = Math.max(1, updatedItem.quantity + increment);

      const response = await fetch(`${BASE_URL}/cart/items/${cartItemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, quantity: newQuantity }),
      });

      console.log("Update quantity response status:", response.status);

      if (!response.ok) throw new Error("Failed to update item quantity");

      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.cart_item_id === cartItemId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to update item quantity.");
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
        throw new Error("No item selected for deletion");
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
      Alert.alert("Error", error.message || "Failed to delete item.");
      console.error(error);
    } finally {
      setModalVisible(false); // Close modal regardless of success or failure
    }
  };

  const calculateTotal = () =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const navigateToDeliveryServices = () => {
    navigation.navigate("delivery", {
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
            <Text style={styles.paymentLabel}>
              Total ({cartItems.length} items)
            </Text>
            <Text style={styles.paymentPrice}>
              ${calculateTotal().toFixed(2)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={navigateToDeliveryServices}
          >
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
        message="Are you sure you want to delete this item?"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FAFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F7FAFF',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    color: '#2D3748',
    textAlign: 'center',
  },
  emptyCart: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 32,
    color: '#4A5568',
    fontWeight: '500',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#4FA5F5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F7FAFF',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    color: '#48BB78',
    fontWeight: '700',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFF',
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#4FA5F5',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quantityText: {
    fontSize: 18,
    color: '#4FA5F5',
    fontWeight: '600',
  },
  quantity: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  deleteButton: {
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    padding: 8,
    marginLeft: 8,
    shadowColor: '#FF4B4B',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteText: {
    color: '#FF4B4B',
    fontWeight: '600',
    fontSize: 14,
  },
  paymentDetails: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    shadowColor: '#4FA5F5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  paymentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  paymentPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#48BB78',
    textAlign: 'right',
    marginTop: 8,
  },
  checkoutButton: {
    backgroundColor: '#4FA5F5',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 24,
    shadowColor: '#4FA5F5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default CartScreen;
