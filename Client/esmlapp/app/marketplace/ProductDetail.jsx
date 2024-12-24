import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';

export default function ProductCard({ productId }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const response = await axios.get(`http://192.168.103.10:3000/product/products/${productId}`); // Use the productId prop
        setProduct(response.data);
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [productId]);

  if (loading) {
    return <ActivityIndicator size="large" color="#6e3de8" />; // Show loading indicator
  }

  if (!product) {
    return <Text>Product not found.</Text>; // Handle case where product is not found
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton}>
          <Text style={styles.iconText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Cart</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Text style={styles.iconText}>{'♡'}</Text>
        </TouchableOpacity>
      </View>

      {/* Image */}
      <Image
        source={{ uri: product.image_url }} // Use the fetched product image URL
        style={styles.image}
      />

      {/* Product Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.tag}>{product.tag || 'Solid Male'}</Text>
        <Text style={styles.productName}>{product.name || 'Moonstar'}</Text>
        <Text style={styles.price}>${product.price || '491'}</Text>
        <Text style={styles.rating}>⭐ {product.rating || '5'}</Text>
        <Text style={styles.duration}>{product.duration || '3 Month'}</Text>
        <Text style={styles.descriptionTitle}>Description</Text>
        <Text style={styles.description}>
          {product.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nisi quam vulputate enim ultrices morbi...'}
          <Text style={styles.readMore}> Read More</Text>
        </Text>
      </View>

      {/* Add to Cart Button */}
      <TouchableOpacity style={styles.cartButton}>
        <Text style={styles.cartButtonText}>Add to Cart</Text>
      </TouchableOpacity>
    </View>
  );
}

// Styles...

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  iconButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 16,
  },
  iconText: {
    fontSize: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 250,
  },
  infoContainer: {
    padding: 16,
  },
  tag: {
    color: '#888',
    fontSize: 14,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  price: {
    fontSize: 20,
    color: '#4CAF50',
    marginVertical: 4,
  },
  rating: {
    fontSize: 16,
    marginVertical: 4,
  },
  duration: {
    backgroundColor: '#FFCDD2',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginVertical: 4,
    fontSize: 14,
    color: '#D32F2F',
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  readMore: {
    color: '#3F51B5',
    fontWeight: 'bold',
  },
  cartButton: {
    backgroundColor: '#673AB7',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    margin: 16,
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});