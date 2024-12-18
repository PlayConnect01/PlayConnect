import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const HomeScreen = () => {
  const products = [
    {
      id: 1,
      name: 'Halfmoon',
      rating: 5,
      price: 169,
      seller: 'Kaiya Franci',
      image: 'https://example.com/halfmoon.jpg',
      duration: '6 Month'
    },
    {
      id: 2,
      name: 'Crown Tail',
      rating: 4.5,
      price: 202,
      seller: 'Aspen Stanton',
      image: 'https://example.com/crowntail.jpg',
      duration: '3 Month'
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Most Popular</Text>
      {products.map(product => (
        <View key={product.id} style={styles.card}>
          <Image source={{ uri: product.image }} style={styles.image} />
          <View style={styles.cardInfo}>
            <Text style={styles.duration}>{product.duration}</Text>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.seller}>{product.seller}</Text>
            <Text style={styles.price}>${product.price}</Text>
          </View>
        </View>
      ))}
      <Text style={styles.header}>Lowest Prices</Text>
      {/* Add more product listings here */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  cardInfo: {
    padding: 10,
  },
  duration: {
    fontSize: 14,
    color: '#ff4081',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seller: {
    fontSize: 14,
    color: '#888',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default HomeScreen;