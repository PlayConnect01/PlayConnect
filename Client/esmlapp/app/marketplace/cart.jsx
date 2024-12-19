import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const CartScreen = () => {
  const [cartItems, setCartItems] = useState([
    { id: 1, name: 'Halfmoon', description: 'Solid Male', price: 169, quantity: 2, image: 'https://via.placeholder.com/100' },
    { id: 2, name: 'Crown Tail', description: 'Jantan Beta', price: 202, quantity: 1, image: 'https://via.placeholder.com/100' },
    { id: 3, name: 'Veil tail', description: 'Solid Male', price: 120, quantity: 1, image: 'https://via.placeholder.com/100' },
  ]);

  const incrementQuantity = (id) => {
    const updatedCart = cartItems.map(item =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCartItems(updatedCart);
  };

  const decrementQuantity = (id) => {
    const updatedCart = cartItems.map(item =>
      item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
    );
    setCartItems(updatedCart);
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
          <View key={item.id} style={styles.cartItem}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.details}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.price}>${item.price}</Text>
            </View>
            <View style={styles.quantityControls}>
              <TouchableOpacity onPress={() => decrementQuantity(item.id)} style={styles.button}>
                <Text style={styles.buttonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantity}>{item.quantity}</Text>
              <TouchableOpacity onPress={() => incrementQuantity(item.id)} style={styles.button}>
                <Text style={styles.buttonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <View style={styles.paymentDetails}>
          {cartItems.map((item) => (
            <Text key={item.id} style={styles.paymentDetailText}>
              {item.name} ${item.price}
            </Text>
          ))}
          <Text style={styles.totalText}>
            Total ({calculateTotalItems()} tails) ${calculateTotal()}
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
