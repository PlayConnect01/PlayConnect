// AllDiscountedProducts.jsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  Animated,
  Dimensions,
  Platform
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL } from '../../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const cardWidth = width / 2 - 24;

const AllDiscountedProducts = () => {
  const navigation = useNavigation();
  const [categorizedProducts, setCategorizedProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [addingToCartId, setAddingToCartId] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('discount');
  const [cartProducts, setCartProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const animationValues = useRef({
    scale: new Animated.Value(1),
    success: new Animated.Value(0)
  }).current;
  const notificationTimeout = useRef(null);

  const showNotification = (message, type = 'info', duration = 2000) => {
    if (notificationTimeout.current) {
      clearTimeout(notificationTimeout.current);
    }
    setNotification({ message, type });
    notificationTimeout.current = setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, duration);
  };

  const animateCartButton = (productId) => {
    setAddingToCartId(productId);
    Animated.sequence([
      Animated.spring(animationValues.scale, {
        toValue: 0.8,
        useNativeDriver: true,
        duration: 100
      }),
      Animated.spring(animationValues.scale, {
        toValue: 1,
        useNativeDriver: true,
        duration: 100
      }),
      Animated.timing(animationValues.success, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();

    setTimeout(() => {
      Animated.timing(animationValues.success, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }).start(() => {
        setAddingToCartId(null);
      });
    }, 1500);
  };

  const addToCart = async (product) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');
      const existingCart = await AsyncStorage.getItem('cartProducts');
      const cartProductsList = existingCart ? JSON.parse(existingCart) : [];

      if (!token || !userId || !product?.product_id) {
        showNotification("Please login to add items to cart", "warning");
        return;
      }

      if (cartProducts.some(item => item.product_id === product.product_id)) {
        showNotification("Product already in cart!", "warning");
        navigation.navigate('ProductDetail', { productId: product.product_id });
        return;
      }

      animateCartButton(product.product_id);

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
        const productWithQuantity = {
          ...product,
          quantity: 1
        };
        cartProductsList.push(productWithQuantity);
        await AsyncStorage.setItem('cartProducts', JSON.stringify(cartProductsList));
        setCartProducts(cartProductsList);
        setCartCount(prevCount => prevCount + 1);
        showNotification(`${product.name} added to cart! 🛒`, "success");
        navigation.navigate('ProductDetail', { productId: product.product_id });
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
      showNotification(error.response?.data?.message || "Error adding to cart", "error");
      setAddingToCartId(null);
    }
  };

  const toggleFavorite = async (productId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');

      if (!token || !userId) {
        showNotification("Please login to manage favorites", "warning");
        return;
      }

      let updatedFavorites = [...favorites];
      const isFavorite = updatedFavorites.includes(productId);

      if (isFavorite) {
        updatedFavorites = updatedFavorites.filter(id => id !== productId);
        await AsyncStorage.setItem('favoriteProducts', JSON.stringify(updatedFavorites));
        setFavorites(updatedFavorites);
        showNotification('Removed from favorites', 'info');
      } else {
        updatedFavorites.push(productId);
        await AsyncStorage.setItem('favoriteProducts', JSON.stringify(updatedFavorites));
        setFavorites(updatedFavorites);
        showNotification('Added to favorites', 'success');
      }

      // Update favorites in the backend
      const endpoint = isFavorite ? 'remove' : 'add';
      await axios.post(
        `${BASE_URL}/favorites/${endpoint}`,
        {
          userId: parseInt(userId),
          productId: productId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error("Error updating favorites:", error);
      showNotification("Failed to update favorites", "error");
    }
  };

  const navigateToProductDetail = (productId) => {
    navigation.navigate('ProductDetail', { productId });
  };

  const fetchDiscountedProducts = async () => {
    try {
      setLoading(true);
      const [productsResponse, favoritesResponse] = await Promise.all([
        axios.get(`${BASE_URL}/product/discounted`),
        AsyncStorage.getItem('favoriteProducts')
      ]);

      const products = productsResponse.data;
      const userFavorites = favoritesResponse ? JSON.parse(favoritesResponse) : [];
      setFavorites(userFavorites);

      // Sort products
      const sortedProducts = products.sort((a, b) => {
        switch (sortBy) {
          case 'discount':
            return b.discount - a.discount;
          case 'price':
            return a.price - b.price;
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          default:
            return 0;
        }
      });

      // Categorize products
      const categorized = sortedProducts.reduce((acc, product) => {
        const category = product.category || 'Other';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(product);
        return acc;
      }, {});

      setCategorizedProducts(categorized);
    } catch (error) {
      console.error("Error fetching discounted products:", error);
      showNotification('Error loading products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscountedProducts();
  }, [sortBy]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDiscountedProducts().finally(() => setRefreshing(false));
  }, []);

  const renderSortingOptions = () => (
    <View style={styles.sortingContainer}>
      <Text style={styles.sortingTitle}>Sort by:</Text>
      <View style={styles.sortingButtons}>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'discount' && styles.sortButtonActive]}
          onPress={() => setSortBy('discount')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'discount' && styles.sortButtonTextActive]}>
            Highest Discount
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'price' && styles.sortButtonActive]}
          onPress={() => setSortBy('price')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'price' && styles.sortButtonTextActive]}>
            Lowest Price
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'rating' && styles.sortButtonActive]}
          onPress={() => setSortBy('rating')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'rating' && styles.sortButtonTextActive]}>
            Best Rating
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FontAwesome key={i} name="star" size={12} color="#FFD700" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FontAwesome key={i} name="star-half-o" size={12} color="#FFD700" />);
      } else {
        stars.push(<FontAwesome key={i} name="star-o" size={12} color="#FFD700" />);
      }
    }
    return stars;
  };

  const renderProductCard = (product) => {
    const discountedPrice = product.price * (1 - product.discount / 100);
    const isFavorite = favorites.includes(product.product_id);
    const isAddingToCart = addingToCartId === product.product_id;

    return (
      <TouchableOpacity
        key={product.product_id}
        style={styles.productCard}
        onPress={() => navigateToProductDetail(product.product_id)}
      >
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>-{product.discount}%</Text>
        </View>
        
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(product.product_id)}
        >
          <FontAwesome
            name={isFavorite ? 'heart' : 'heart-o'}
            size={24}
            color={isFavorite ? '#FF4B4B' : '#FFF'}
          />
        </TouchableOpacity>

        <Image
          source={{ uri: product.image_url }}
          style={styles.productImage}
          resizeMode="cover"
        />

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          
          <View style={styles.ratingContainer}>
            {renderStars(product.rating || 0)}
            <Text style={styles.ratingText}>({product.ratingCount || 0})</Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.discountedPrice}>
              ${discountedPrice.toFixed(2)}
            </Text>
            <Text style={styles.originalPrice}>
              ${product.price.toFixed(2)}
            </Text>
          </View>

          <Animated.View
            style={[
              styles.addToCartContainer,
              {
                transform: [
                  {
                    scale: isAddingToCart
                      ? animationValues.scale
                      : 1
                  }
                ]
              }
            ]}
          >
            <TouchableOpacity
              style={[
                styles.addToCartButton,
                isAddingToCart && styles.addingToCart
              ]}
              onPress={() => addToCart(product)}
              disabled={isAddingToCart}
            >
              {isAddingToCart ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <FontAwesome name="shopping-cart" size={16} color="#FFF" />
                  <Text style={styles.buttonText}>Add to Cart</Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4FA5F5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderSortingOptions()}

        {Object.entries(categorizedProducts).map(([category, products]) => (
          <View key={category} style={styles.categoriesContainer}>
            <Text style={styles.categoryTitle}>{category}</Text>
            <View style={styles.productsContainer}>
              {products.map(renderProductCard)}
            </View>
          </View>
        ))}
      </ScrollView>

      {notification.message && (
        <Animated.View
          style={[
            styles.notification,
            styles[`notification${notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}`]
          ]}
        >
          <FontAwesome
            name={
              notification.type === 'success' ? 'check-circle' :
              notification.type === 'error' ? 'times-circle' :
              'exclamation-circle'
            }
            size={24}
            color="#FFF"
            style={styles.notificationIcon}
          />
          <Text style={styles.notificationText}>{notification.message}</Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFF',
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A365D',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4A5568',
    marginBottom: 16,
  },
  sortingContainer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  sortingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#2D3748',
  },
  sortingButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F4F8',
  },
  sortButtonActive: {
    backgroundColor: '#4FA5F5',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#4A5568',
  },
  sortButtonTextActive: {
    color: '#FFF',
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 12,
  },
  productsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: cardWidth,
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FF4B4B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  discountText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 1,
  },
  productImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#F7FAFF',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#718096',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  discountedPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#48BB78',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#A0AEC0',
    textDecorationLine: 'line-through',
  },
  addToCartContainer: {
    width: '100%',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4FA5F5',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  addingToCart: {
    backgroundColor: '#48BB78',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  notification: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#000000CC',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default AllDiscountedProducts;