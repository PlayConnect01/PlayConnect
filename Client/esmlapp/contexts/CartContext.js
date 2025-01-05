import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);

  // Load cart from storage when app starts
  useEffect(() => {
    loadCart();
  }, []);

  // Update cart total whenever items change
  useEffect(() => {
    calculateTotal();
  }, [cartItems]);

  const loadCart = async () => {
    try {
      const savedCart = await AsyncStorage.getItem('cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const saveCart = async (items) => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const addToCart = async (product) => {
    try {
      const existingItem = cartItems.find(item => item.product_id === product.product_id);
      
      let updatedCart;
      if (existingItem) {
        // Update quantity if item exists
        updatedCart = cartItems.map(item =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new item with quantity 1
        updatedCart = [...cartItems, { ...product, quantity: 1 }];
      }
      
      setCartItems(updatedCart);
      await saveCart(updatedCart);
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const updatedCart = cartItems.filter(item => item.product_id !== productId);
      setCartItems(updatedCart);
      await saveCart(updatedCart);
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      if (quantity < 1) {
        return removeFromCart(productId);
      }

      const updatedCart = cartItems.map(item =>
        item.product_id === productId
          ? { ...item, quantity }
          : item
      );
      
      setCartItems(updatedCart);
      await saveCart(updatedCart);
      return true;
    } catch (error) {
      console.error('Error updating quantity:', error);
      return false;
    }
  };

  const clearCart = async () => {
    try {
      setCartItems([]);
      await AsyncStorage.removeItem('cart');
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  };

  const calculateTotal = () => {
    const total = cartItems.reduce((sum, item) => {
      const price = item.discount > 0 
        ? item.price * (1 - item.discount / 100)
        : item.price;
      return sum + (price * item.quantity);
    }, 0);
    setCartTotal(total);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const isInCart = (productId) => {
    return cartItems.some(item => item.product_id === productId);
  };

  const value = {
    cartItems,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    isInCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
