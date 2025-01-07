import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import ConfirmationModal from './ConfirmationModal'; 
import OrderHistory from './orders/OrderHistory';
import { BASE_URL } from "../../Api";
import PageContainer from '../components/PageContainer';
import { FontAwesome } from '@expo/vector-icons'; // Import FontAwesome for icons

const CartScreen = () => {
  const navigation = useNavigation();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('cart');

  const fetchCartItems = async () => {
    try {
      const userDataStr = await AsyncStorage.getItem('userData');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const userId = userData?.user_id;

      if (!userId) throw new Error("Please log in to view your cart");

      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${BASE_URL}/cart/cart/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error("Failed to fetch cart items");

      const data = await response.json();
      setCartItems(data);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to fetch cart items.");
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCartItems();
  }, []);

  const updateQuantity = async (cartItemId, increment) => {
    try {
      const userDataStr = await AsyncStorage.getItem('userData');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const userId = userData?.user_id;
      const token = await AsyncStorage.getItem('userToken');

      if (!userId) throw new Error("Please log in to update your cart");

      const updatedItem = cartItems.find(
        (item) => item.cart_item_id === cartItemId
      );
      const newQuantity = Math.max(1, updatedItem.quantity + increment);

      const response = await fetch(`${BASE_URL}/cart/items/${cartItemId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId, quantity: newQuantity }),
      });


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
    setItemToDelete(cartItemId);
    setModalVisible(true);
  };

  const confirmDelete = async () => {
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
    navigation.navigate("DeliveryServices", {
      cartTotal: calculateTotal(),
      cartItems: cartItems,
    });
  };

  if (loading) {
    return (
      <PageContainer>
        <View style={styles.loadingContainer}>
          <Text>Loading cart...</Text>
        </View>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <View style={styles.mainContainer}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'cart' && styles.activeTab]}
            onPress={() => setActiveTab('cart')}
          >
            <FontAwesome name="shopping-cart" size={24} color={activeTab === 'cart' ? '#FFFFFF' : '#4A5568'} />
            <Text style={[styles.tabText, activeTab === 'cart' && styles.activeTabText]}>
              Cart
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.activeTab]}
            onPress={() => setActiveTab('history')}
          >
            <FontAwesome name="history" size={24} color={activeTab === 'history' ? '#FFFFFF' : '#4A5568'} />
            <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
              Order History
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'cart' ? (
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
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
                setItemToDelete(null);
                setModalVisible(false);
              }}
              message="Are you sure you want to delete this item?"
            />
          </ScrollView>
        ) : (
          <OrderHistory />
        )}
      </View>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F0F4F8', 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0E7FF', 
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 8,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#4FA5F5',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E0', 
  },
  activeTab: {
    backgroundColor: '#4FA5F5',
    borderColor: '#4FA5F5', 
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A5568',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '700', 
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100, 
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
    fontStyle: 'italic', 
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
