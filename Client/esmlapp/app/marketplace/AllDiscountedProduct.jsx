// AllDiscountedProducts.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../../api';

const AllDiscountedProducts = () => {
  const [categorizedProducts, setCategorizedProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const fetchDiscountedProducts = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/product/discounted`);
        const products = response.data;

        const categorized = {};
        products.forEach(product => {
          if (!categorized[product.category]) {
            categorized[product.category] = [];
          }
          categorized[product.category].push(product);
        });

        setCategorizedProducts(categorized);
      } catch (error) {
        console.error("Error fetching discounted products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscountedProducts();
  }, []);

  const addToCart = async (product) => {
    const userId = 1; // Replace this with actual user ID logic
    try {
      const response = await axios.post(`${BASE_URL}/cart/cart/add`, {
        userId: parseInt(userId),
        productId: product.product_id,
        quantity: 1,
        price: product.price,
      });
      if (response.status === 200) {
        console.log('Product added to cart successfully:', response.data);
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#6e3de8" />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {Object.keys(categorizedProducts).map((category) => (
        <View key={category} style={styles.categoryContainer}>
          <Text style={styles.categoryTitle}>{category}</Text>
          {categorizedProducts[category].map((product) => (
            <View key={product.product_id} style={styles.productCard}>
              <Image source={{ uri: product.image }} style={styles.productImage} />
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>${product.price}</Text>
              <Text style={styles.productDiscount}>Discount: {product.discount}%</Text>
              <TouchableOpacity style={styles.addToCartButton} onPress={() => addToCart(product)}>
                <Text style={styles.buttonText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f4f8',
  },
  cartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  emptyCartText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  cartContainer: {
    marginBottom: 15,
    padding: 5,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    padding: 5,
  },
  cartItemImage: {
    width: 40,
    height: 40,
    borderRadius: 5,
    marginRight: 8,
  },
  cartItemName: {
    fontSize: 14,
    flex: 1,
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#28a745',
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  productCard: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  productImage: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4FA5F5',
  },
  productPrice: {
    fontSize: 16,
    color: '#28a745',
  },
  productDiscount: {
    fontSize: 14,
    color: '#FF69B4',
  },
  addToCartButton: {
    marginTop: 5,
    backgroundColor: '#007bff',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AllDiscountedProducts;