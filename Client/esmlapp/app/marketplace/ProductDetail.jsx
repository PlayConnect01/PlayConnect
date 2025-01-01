import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from "../../Api";
import { Ionicons } from '@expo/vector-icons';

const ProductDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { productId, productName } = route.params;
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showMessage, setShowMessage] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToFavorites, setIsAddingToFavorites] = useState(false);

  useEffect(() => {
    if (productName) {
      navigation.setOptions({
        title: productName,
      });
    }
  }, [productName, navigation]);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/product/products/${productId}`);
        if (response.data) {
          setProduct(response.data);
          navigation.setOptions({
            title: response.data.name,
          });
        }
        setError(null);
      } catch (error) {
        console.error("Error fetching product details:", error);
        setError('Failed to load product details');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductDetail();
    }
  }, [productId, navigation]);

  useEffect(() => {
    const checkIfFavorite = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userId = await AsyncStorage.getItem('userId');
        
        if (token && userId && productId) {
          const response = await axios.get(
            `${BASE_URL}/favorites/check/${userId}/${productId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setIsFavorite(response.data.isFavorite);
        }
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };

    checkIfFavorite();
  }, [productId]);

  const handleAddToCart = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');
      const existingCart = await AsyncStorage.getItem('cartProducts');
      const cartProductsList = existingCart ? JSON.parse(existingCart) : [];

      if (!token || !userId || !product?.product_id) {
        setShowMessage("Error: Missing required data");
        setTimeout(() => setShowMessage(""), 2000);
        return;
      }

      // Check if product is already in cart
      if (cartProductsList.some(item => item.product_id === product.product_id)) {
        setShowMessage("Product already in cart");
        setTimeout(() => setShowMessage(""), 2000);
        return;
      }

      setIsAddingToCart(true);

      const response = await axios.post(
        `${BASE_URL}/cart/cart/add`,
               {
                 userId: parseInt(userId),
                 productId: product.product_id,
                 quantity: 1,
                 price: product.price,
               },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      if (response.status === 201) {
        // Add the product to local storage with quantity
        const productWithQuantity = {
          ...product,
          quantity: quantity
        };
        cartProductsList.push(productWithQuantity);
        await AsyncStorage.setItem('cartProducts', JSON.stringify(cartProductsList));
        
        Alert.alert(
          'Success',
          'Product added to cart successfully!',
          [
            {
              text: 'Continue Shopping',
              onPress: () => navigation.goBack(),
              style: 'cancel',
            },
            {
              text: 'View Cart',
              onPress: () => navigation.navigate('Cart'),
            },
          ]
        );
      } else {
        setShowMessage("Failed to add product to cart");
        setTimeout(() => setShowMessage(""), 2000);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      setShowMessage(error.response?.data?.message || "Error adding to cart. Please try again.");
      setTimeout(() => setShowMessage(""), 2000);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      setIsAddingToFavorites(true);
      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');

      if (!token || !userId) {
        setShowMessage("Please login to add favorites");
        setTimeout(() => setShowMessage(""), 2000);
        return;
      }

      if (isFavorite) {
        // Remove from favorites
        await axios.delete(
          `${BASE_URL}/favorites/favorites/remove/${userId}/${productId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setShowMessage("Removed from favorites");
      } else {
        // Add to favorites
        await axios.post(
          `${BASE_URL}/favorites/favorites/add`,
          {
            userId: parseInt(userId),
            productId: productId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        setShowMessage("Added to favorites");
      }
      
      setIsFavorite(!isFavorite);
      setTimeout(() => setShowMessage(""), 2000);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      setShowMessage("Error updating favorites");
      setTimeout(() => setShowMessage(""), 2000);
    } finally {
      setIsAddingToFavorites(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4FA5F5" />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Product not found'}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
            onPress={toggleFavorite}
            disabled={isAddingToFavorites}
          >
            {isAddingToFavorites ? (
              <ActivityIndicator size="small" color="#FF69B4" />
            ) : (
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={24}
                color={isFavorite ? "#FF69B4" : "#4FA5F5"}
              />
            )}
          </TouchableOpacity>
        </View>

        <Image
          source={{ uri: product.image_url }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.contentContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{product.name}</Text>
            <Text style={styles.price}>${product.price}</Text>
          </View>

          {product.rating && (
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>★ {product.rating}</Text>
              <Text style={styles.reviews}>{product.reviews || 0} Reviews</Text>
            </View>
          )}

          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.description}>
            {product.description || 'No description available'}
          </Text>

          {product.specifications && (
            <View style={styles.specificationsContainer}>
              <Text style={styles.specificationsTitle}>Specifications</Text>
              {Object.entries(product.specifications).map(([key, value]) => (
                <View key={key} style={styles.specificationRow}>
                  <Text style={styles.specificationKey}>{key}</Text>
                  <Text style={styles.specificationValue}>{value}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantity}>{quantity}</Text>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => setQuantity(quantity + 1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.addToCartButton, isAddingToCart && styles.addToCartButtonDisabled]}
          onPress={handleAddToCart}
          disabled={isAddingToCart}
        >
          {isAddingToCart ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.addToCartButtonText}>Add to Cart</Text>
          )}
        </TouchableOpacity>
      </View>

      {showMessage && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{showMessage}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F7FF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    paddingBottom: 16,
    zIndex: 1,
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#F7FAFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(79, 165, 245, 0.1)',
  },
  backButtonText: {
    fontSize: 24,
    color: '#4FA5F5',
    fontWeight: '600',
  },
  favoriteButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(79, 165, 245, 0.1)',
    transform: [{ scale: 1 }],
  },
  favoriteButtonActive: {
    backgroundColor: '#FFF0F7',
    borderColor: '#FF69B4',
    transform: [{ scale: 1.05 }],
  },
  image: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width * 0.8,
    marginTop: 16,
    borderRadius: 30,
    marginHorizontal: 16,
    width: Dimensions.get('window').width - 32,
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  contentContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 25,
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    backgroundColor: '#F7FAFF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(79, 165, 245, 0.1)',
  },
  title: {
    flex: 1,
    fontSize: 26,
    fontWeight: '700',
    color: '#2D3748',
    marginRight: 16,
    letterSpacing: 0.5,
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    color: '#4FA5F5',
    textShadowColor: 'rgba(79, 165, 245, 0.15)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#FFF0F7',
    padding: 12,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  rating: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF69B4',
    marginRight: 8,
  },
  reviews: {
    fontSize: 16,
    color: '#FF69B4',
    opacity: 0.8,
  },
  descriptionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 12,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    color: '#4A5568',
    lineHeight: 24,
    marginBottom: 24,
    backgroundColor: '#F7FAFF',
    padding: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(79, 165, 245, 0.1)',
  },
  specificationsContainer: {
    marginTop: 24,
    backgroundColor: '#F7FAFF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(79, 165, 245, 0.1)',
  },
  specificationsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  specificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(79, 165, 245, 0.1)',
  },
  specificationKey: {
    fontSize: 16,
    color: '#4A5568',
    fontWeight: '500',
  },
  specificationValue: {
    fontSize: 16,
    color: '#4FA5F5',
    fontWeight: '600',
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(79, 165, 245, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    backgroundColor: '#F7FAFF',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(79, 165, 245, 0.1)',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(79, 165, 245, 0.1)',
  },
  quantityButtonDisabled: {
    backgroundColor: '#E2E8F0',
    opacity: 0.7,
  },
  quantityButtonText: {
    fontSize: 20,
    color: '#4FA5F5',
    fontWeight: '600',
  },
  quantity: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center',
  },
  addToCartButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#4FA5F5',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(79, 165, 245, 0.2)',
  },
  addToCartButtonDisabled: {
    backgroundColor: '#A0AEC0',
    shadowOpacity: 0.1,
  },
  addToCartButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4FA5F5',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF69B4',
    textAlign: 'center',
    marginBottom: 20,
    backgroundColor: '#FFF0F7',
    padding: 16,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 105, 180, 0.2)',
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: '#4FA5F5',
    borderRadius: 25,
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  messageContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#4FA5F5',
    borderRadius: 20,
    padding: 16,
    minWidth: 140,
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(79, 165, 245, 0.2)',
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  }
});

export default ProductDetail;
