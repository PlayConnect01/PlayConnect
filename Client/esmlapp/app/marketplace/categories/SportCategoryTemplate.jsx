import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { BASE_URL } from "../../../Api";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const cardWidth = width / 2 - 24;

const SportCategoryTemplate = ({ category, icon }) => {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [addingToCartId, setAddingToCartId] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [sortBy, setSortBy] = useState('price');
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

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const [productsResponse, favoritesResponse] = await Promise.all([
        axios.get(`${BASE_URL}/product/category/${category.toLowerCase()}`),
        AsyncStorage.getItem('favoriteProducts')
      ]);

      const userFavorites = favoritesResponse ? JSON.parse(favoritesResponse) : [];
      setFavorites(userFavorites);

      let sortedProducts = productsResponse.data;
      sortProducts(sortedProducts);
      setProducts(sortedProducts);
    } catch (error) {
      console.error(`Error fetching ${category} products:`, error);
      showNotification(`Error loading ${category} products`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const sortProducts = (products) => {
    return products.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });
  };

  const toggleFavorite = useCallback(async (product) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userDataStr = await AsyncStorage.getItem('userData');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const userId = userData?.user_id;

      if (!token || !userId) {
        showNotification("Please login to manage favorites", "warning");
        navigation.navigate('Login');
        return;
      }

      const isAlreadyFavorite = favorites.includes(product.product_id);

      if (isAlreadyFavorite) {
        const favoritesResponse = await axios.get(
          `${BASE_URL}/favorites/favorites/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        const favorite = favoritesResponse.data.find(fav => fav.product_id === product.product_id);
        
        if (!favorite) {
          showNotification("Could not find favorite to remove", "error");
          return;
        }

        await axios.delete(
          `${BASE_URL}/favorites/favorites/item/${favorite.favorite_id}`,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        setFavorites(prev => prev.filter(id => id !== product.product_id));
        showNotification("Removed from favorites ❌", "success");
      } else {
        await axios.post(
          `${BASE_URL}/favorites/favorites/add`,
          {
            userId: parseInt(userId),
            productId: product.product_id
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        setFavorites(prev => [...prev, product.product_id]);
        showNotification("Added to favorites ❤️", "success");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      if (error.response?.status === 401) {
        showNotification("Please login to manage favorites", "warning");
        navigation.navigate('Login');
      } else {
        showNotification(error.response?.data?.message || "Failed to update favorites", "error");
      }
    }
  }, [favorites, navigation, showNotification]);

  const addToCart = async (product) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userDataStr = await AsyncStorage.getItem('userData');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const userId = userData?.user_id;

      if (!token || !userId) {
        showNotification("Please login to add items to cart", "warning");
        navigation.navigate('Login');
        return;
      }

      setAddingToCartId(product.product_id);
      
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
        showNotification(`${product.name} added to cart! 🛒`, "success");
        navigation.navigate('ProductDetail', { productId: product.product_id });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      showNotification(error.response?.data?.message || "Failed to add to cart", "error");
    } finally {
      setAddingToCartId(null);
    }
  };

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

  const renderSortingOptions = () => (
    <View style={styles.sortingContainer}>
      <Text style={styles.sortingTitle}>Sort by:</Text>
      <View style={styles.sortingButtons}>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'price' && styles.sortButtonActive]}
          onPress={() => setSortBy('price')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'price' && styles.sortButtonTextActive]}>
            Price
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'rating' && styles.sortButtonActive]}
          onPress={() => setSortBy('rating')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'rating' && styles.sortButtonTextActive]}>
            Rating
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'newest' && styles.sortButtonActive]}
          onPress={() => setSortBy('newest')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'newest' && styles.sortButtonTextActive]}>
            Newest
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProductCard = (product) => {
    const isFavorite = favorites.includes(product.product_id);
    const isAddingToCart = addingToCartId === product.product_id;

    return (
      <TouchableOpacity
        key={product.product_id}
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetail', { productId: product.product_id })}
      >
        {product.discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{product.discount}%</Text>
          </View>
        )}
        
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(product)}
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
            <Text style={styles.price}>
              ${product.price.toFixed(2)}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.addToCartButton, isAddingToCart && styles.addingToCart]}
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
        </View>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    fetchProducts();
  }, [category, sortBy]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts().finally(() => setRefreshing(false));
  }, []);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4FA5F5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <FontAwesome name={icon} size={24} color="#6e3de8" />
        <Text style={styles.headerTitle}>{category} Products</Text>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderSortingOptions()}
        
        <View style={styles.productsContainer}>
          {products.map(renderProductCard)}
        </View>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3748',
    marginLeft: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FAFF',
  },
  sortingContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sortingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 12,
  },
  sortingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  sortButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F0F4F8',
    alignItems: 'center',
  },
  sortButtonActive: {
    backgroundColor: '#4FA5F5',
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4A5568',
  },
  sortButtonTextActive: {
    color: '#FFFFFF',
  },
  productsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
    gap: 16,
  },
  productCard: {
    width: cardWidth,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
    height: 40,
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
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#48BB78',
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
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 8,
    borderRadius: 20,
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
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  notification: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 90 : 70,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  notificationSuccess: {
    backgroundColor: 'rgba(72, 187, 120, 0.9)',
  },
  notificationError: {
    backgroundColor: 'rgba(245, 101, 101, 0.9)',
  },
  notificationWarning: {
    backgroundColor: 'rgba(236, 201, 75, 0.9)',
  },
  notificationIcon: {
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SportCategoryTemplate;
