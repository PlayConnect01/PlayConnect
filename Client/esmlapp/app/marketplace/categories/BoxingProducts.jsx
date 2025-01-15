import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  FlatList,
  Animated,
  Modal,
  RefreshControl,
  ScrollView,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL } from '../../../Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect, useIsFocused } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useCart } from '../../../contexts/CartContext';
import { BlurView } from 'expo-blur';
import Toast from 'react-native-toast-message';
import { Easing } from 'react-native';

const SPORT_ID = 2; // Boxing ID

const BoxingProducts= () => {
  const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [sortBy, setSortBy] = useState('default');
  const [filterRating, setFilterRating] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [stockAlerts, setStockAlerts] = useState([]);
  const navigation = useNavigation();
  const { addToCart, cartItems } = useCart();
  const scrollY = useRef(new Animated.Value(0)).current;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const [quantity, setQuantity] = useState(1);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartAnimation] = useState(new Animated.Value(1));
  const [showQuickView, setShowQuickView] = useState(false);
  const [lastAddedProduct, setLastAddedProduct] = useState(null);
  const isFocused = useIsFocused();
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  // Quick view and sorting states
  const [showQuickViewModal, setShowQuickViewModal] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [showSortFilter, setShowSortFilter] = useState(false);
  const [sortOptions] = useState([
    { label: 'Newest', value: 'newest' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Rating', value: 'rating' }
  ]);
  const [selectedSort, setSelectedSort] = useState('newest');
  const refreshAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (lastAddedProduct) {
      Animated.sequence([
        Animated.timing(cartAnimation, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(cartAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(() => setLastAddedProduct(null), 3000);
      });
    }
  }, [lastAddedProduct]);

  useEffect(() => {
    if (cartItems && products.length > 0) {
      setProducts([...products]);
    }
  }, [cartItems]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadProducts();
      loadFavorites();
      loadRecentlyViewed();
      loadStockAlerts();
      return () => {};
    }, [])
  );

  const loadRecentlyViewed = async () => {
    try {
      const viewed = await AsyncStorage.getItem('recentlyViewed');
      if (viewed) {
        setRecentlyViewed(JSON.parse(viewed));
      }
    } catch (error) {
      console.error('Error loading recently viewed:', error);
    }
  };

  const addToRecentlyViewed = async (product) => {
    try {
      const viewed = [...recentlyViewed];
      const exists = viewed.find(p => p.product_id === product.product_id);
      if (!exists) {
        viewed.unshift(product);
        if (viewed.length > 10) viewed.pop();
        setRecentlyViewed(viewed);
        await AsyncStorage.setItem('recentlyViewed', JSON.stringify(viewed));
      }
    } catch (error) {
      console.error('Error updating recently viewed:', error);
    }
  };

  const loadStockAlerts = async () => {
    try {
      const alerts = await AsyncStorage.getItem('stockAlerts');
      if (alerts) {
        setStockAlerts(JSON.parse(alerts));
      }
    } catch (error) {
      console.error('Error loading stock alerts:', error);
    }
  };

  const toggleStockAlert = async (productId) => {
    try {
      let newAlerts = [...stockAlerts];
      if (newAlerts.includes(productId)) {
        newAlerts = newAlerts.filter(id => id !== productId);
        setToast({ visible: true, message: 'Stock alert removed', type: 'success' });
      } else {
        newAlerts.push(productId);
        setToast({ visible: true, message: 'Stock alert set', type: 'success' });
      }
      setStockAlerts(newAlerts);
      await AsyncStorage.setItem('stockAlerts', JSON.stringify(newAlerts));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error updating stock alerts:', error);
    }
  };

  const handleQuantityChange = (increment) => {
    setQuantity(prev => {
      const newQuantity = prev + increment;
      return newQuantity >= 1 && newQuantity <= 10 ? newQuantity : prev;
    });
  };

  const handleAddToCart = async (product) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userDataStr = await AsyncStorage.getItem('userData');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const userId = userData?.user_id;
      
      if (!token || !userId) {
        setToast({ visible: true, message: 'Please login to add items to cart', type: 'warning' });
        navigation.navigate('Login');
        return;
      }

      if (!product?.product_id) {
        setToast({ visible: true, message: 'Invalid product', type: 'error' });
        return;
      }

      setSelectedProduct(product);
      setQuantity(1);
      setShowQuantityModal(true);
    } catch (error) {
      console.error("Error preparing to add to cart:", error);
      setToast({ visible: true, message: 'Failed to prepare cart addition', type: 'error' });
    }
  };

  const confirmAddToCart = async () => {
    if (!selectedProduct) return;

    try {
      const token = await AsyncStorage.getItem('userToken');
      const userDataStr = await AsyncStorage.getItem('userData');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const userId = userData?.user_id;

      const response = await axios.post(
        `${BASE_URL}/cart/cart/add`,
        {
          userId: parseInt(userId),
          productId: selectedProduct.product_id,
          quantity: quantity,
          price: selectedProduct.price,
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      if (response.status === 201 || response.status === 200) {
        const productWithQuantity = {
          ...selectedProduct,
          quantity: quantity
        };
        
        await addToCart(productWithQuantity);
        setLastAddedProduct(productWithQuantity);
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setToast({ visible: true, message: `${quantity}x ${selectedProduct.name} added to your cart`, type: 'success' });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      setToast({ visible: true, message: 'Failed to add item to cart', type: 'error' });
    } finally {
      setShowQuantityModal(false);
      setQuantity(1);
      setSelectedProduct(null);
    }
  };

  const toggleFavorite = async (productId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userDataStr = await AsyncStorage.getItem('userData');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const userId = userData?.user_id;

      if (!token || !userId) {
        setToast({ visible: true, message: 'Please login to manage favorites', type: 'warning' });
        navigation.navigate('Login');
        return;
      }

      let newFavorites = [...favorites];
      if (newFavorites.includes(productId)) {
        // Get the favorite_id first
        const favoritesResponse = await axios.get(
          `${BASE_URL}/favorites/favorites/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        const favorite = favoritesResponse.data.find(fav => fav.product_id === productId);
        
        if (!favorite) {
          setToast({ visible: true, message: 'Error', type: 'error' });
          return;
        }

        // Remove from favorites
        await axios.delete(
          `${BASE_URL}/favorites/favorites/item/${favorite.favorite_id}`,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        newFavorites = newFavorites.filter(id => id !== productId);
        setToast({ visible: true, message: 'Removed from favorites', type: 'success' });
      } else {
        // Add to favorites
        await axios.post(
          `${BASE_URL}/favorites/favorites/add`,
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

        newFavorites.push(productId);
        setToast({ visible: true, message: 'Added to favorites', type: 'success' });
      }
      
      setFavorites(newFavorites);
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error updating favorites:', error);
      if (error.response?.status === 401) {
        setToast({ visible: true, message: 'Please login', type: 'warning' });
        navigation.navigate('Login');
      } else {
        setToast({ visible: true, message: 'Failed to update favorites', type: 'error' });
      }
    }
  };

  const shareProduct = async (product) => {
    try {
      await Share.share({
        message: `Check out ${product.name} on PlayConnect! Price: ${product.formatted_price}`,
        url: product.image_url,
        title: 'Share Product'
      });
    } catch (error) {
      console.error('Error sharing product:', error);
    }
  };

  const sortProducts = (products) => {
    switch (sortBy) {
      case 'price-asc':
        return [...products].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...products].sort((a, b) => b.price - a.price);
      case 'rating':
        return [...products].sort((a, b) => b.rating - a.rating);
      default:
        return products;
    }
  };

  const filterProducts = (products) => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRating = filterRating === 0 || product.rating >= filterRating;
      return matchesSearch && matchesRating;
    });
  };

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching Boxing products');
      
      // Updated endpoint with sport_id
      const response = await axios.get(`${BASE_URL}/category/products/${SPORT_ID}`);
      console.log('API Response:', response.data);
      
      if (response.data.success && response.data.products) {
        setProducts(response.data.products);
        setError(null);
      } else {
        setError(response.data.message || 'No products found');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Animated.sequence([
      Animated.timing(refreshAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(refreshAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    loadProducts();
  }, []);

  const QuickViewModal = () => (
    <Modal
      visible={showQuickViewModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowQuickViewModal(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowQuickViewModal(false)}
      >
        <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.quickViewContent}>
          {quickViewProduct && (
            <>
              <Image
                source={{ uri: quickViewProduct.image_url }}
                style={styles.quickViewImage}
                resizeMode="cover"
              />
              <View style={styles.quickViewInfo}>
                <Text style={styles.quickViewName}>{quickViewProduct.name}</Text>
                <Text style={styles.quickViewDescription}>
                  {quickViewProduct.description}
                </Text>
                <View style={styles.quickViewPriceRating}>
                  <Text style={styles.quickViewPrice}>
                    {quickViewProduct.formatted_price}
                  </Text>
                  <View style={styles.ratingContainer}>
                    {[...Array(5)].map((_, index) => (
                      <MaterialIcons
                        key={index}
                        name={index < quickViewProduct.rating ? 'star' : 'star-border'}
                        size={16}
                        color="#FFD700"
                      />
                    ))}
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.quickViewButton}
                  onPress={() => {
                    setShowQuickViewModal(false);
                    navigation.navigate('ProductDetail', {
                      productId: quickViewProduct.product_id,
                      productName: quickViewProduct.name
                    });
                  }}
                >
                  <Text style={styles.quickViewButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const SortFilterBar = () => (
    <Animated.View style={[styles.sortFilterBar, {
      transform: [{
        translateY: showSortFilter ? 0 : -50
      }]
    }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.sortOption,
              selectedSort === option.value && styles.sortOptionSelected
            ]}
            onPress={() => {
              setSelectedSort(option.value);
              const sorted = [...products].sort((a, b) => {
                switch (option.value) {
                  case 'newest':
                    return new Date(b.created_at) - new Date(a.created_at);
                  case 'price-asc':
                    return a.price - b.price;
                  case 'price-desc':
                    return b.price - a.price;
                  case 'rating':
                    return b.rating - a.rating;
                  default:
                    return 0;
                }
              });
              setProducts(sorted);
            }}
          >
            <Text style={[
              styles.sortOptionText,
              selectedSort === option.value && styles.sortOptionTextSelected
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );

  const ProductCountBadge = () => (
    <View style={styles.productCountBadge}>
      <Text style={styles.productCountText}>
        {products.length} {products.length === 1 ? 'Product' : 'Products'}
      </Text>
    </View>
  );

  const RecentlyViewedSection = () => {
    if (!recentlyViewed.length) return null;

    return (
      <View style={styles.recentlyViewedSection}>
        <View style={styles.recentlyViewedHeader}>
          <View style={styles.recentlyViewedTitleContainer}>
            <MaterialIcons name="history" size={24} color="#4FA5F5" />
            <Text style={styles.recentlyViewedTitle}>Recently Viewed</Text>
          </View>
          <TouchableOpacity
            style={styles.clearHistoryButton}
            onPress={() => {
              setRecentlyViewed([]);
              AsyncStorage.removeItem('recentlyViewed');
            }}
          >
            <Text style={styles.clearHistoryText}>Clear History</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          data={recentlyViewed}
          keyExtractor={(item) => `recent-${item.product_id}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.recentlyViewedItem}
              onPress={() => navigation.navigate('ProductDetail', { productId: item.product_id })}
              activeOpacity={0.7}
            >
              <View style={styles.recentlyViewedImageContainer}>
                <Image
                  source={{ uri: item.image_url }}
                  style={styles.recentlyViewedImage}
                  resizeMode="cover"
                />
                {item.discount > 0 && (
                  <View style={styles.recentlyViewedDiscountBadge}>
                    <Text style={styles.recentlyViewedDiscountText}>
                      -{item.discount}%
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.recentlyViewedInfo}>
                <Text style={styles.recentlyViewedName} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={styles.recentlyViewedRating}>
                  {[...Array(5)].map((_, index) => (
                    <MaterialIcons
                      key={index}
                      name={index < item.rating ? 'star' : 'star-border'}
                      size={14}
                      color="#FFD700"
                    />
                  ))}
                </View>
                <View style={styles.recentlyViewedPriceContainer}>
                  <Text style={styles.recentlyViewedPrice}>
                    ${item.price.toFixed(2)}
                  </Text>
                  {item.original_price && ( 
                    <Text style={styles.recentlyViewedOriginalPrice}>
                      ${item.original_price.toFixed(2)}
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recentlyViewedList}
        />
      </View>
    );
  };

  const renderProductItem = ({ item: product }) => {
    const isFavorite = favorites.includes(product.product_id);
    const hasStockAlert = stockAlerts.includes(product.product_id);
    const isInCart = cartItems.some(cartItem => cartItem.product_id === product.product_id);

    return (
      <TouchableOpacity
        key={product.product_id}
        onPress={() => {
          addToRecentlyViewed(product);
          navigation.navigate('ProductDetail', { 
            productId: product.product_id,
            productName: product.name 
          });
        }}
        activeOpacity={0.7}
      >
        <Animated.View style={styles.productCard}>
          <View style={styles.imageContainer}>
            {product?.discount > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>
                  -{product.discount}% OFF
                </Text>
              </View>
            )}
            <Image
              source={{ uri: product?.image_url }}
              style={styles.productImage}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
              onPress={() => toggleFavorite(product.product_id)}
            >
              <FontAwesome 
                name={isFavorite ? "heart" : "heart-o"} 
                size={20} 
                color={isFavorite ? "#DC2626" : "#666666"} 
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => shareProduct(product)}
            >
              <MaterialIcons name="share" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>
              {product?.name}
            </Text>
            <View style={styles.ratingContainer}>
              <View style={styles.ratingStars}>
                {[...Array(5)].map((_, index) => (
                  <MaterialIcons
                    key={index}
                    name={index < product.rating ? 'star' : 'star-border'}
                    size={16}
                    color="#FFD700"
                  />
                ))}
              </View>
              <Text style={styles.ratingCount}>
                ({product?.rating_count || 0})
              </Text>
            </View>
            <View style={styles.priceContainer}>
              <View style={styles.priceInfo}>
                <Text style={styles.discountedPrice}>
                  ${product?.price.toFixed(2)}
                </Text>
                {product?.original_price && (
                  <Text style={styles.originalPrice}>
                    ${product.original_price.toFixed(2)}
                  </Text>
                )}
              </View>
              {product?.discount > 0 && (
                <View style={styles.savingsContainer}>
                  <Text style={styles.savingsText}>
                    {product.discount}% off
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={() => handleAddToCart(product)}
            >
              <MaterialIcons name="shopping-cart" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const QuantityModal = () => (
    <Modal
      visible={showQuantityModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowQuantityModal(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowQuantityModal(false)}
      >
        <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Quantity</Text>
            <TouchableOpacity
              onPress={() => setShowQuantityModal(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
              onPress={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
            >
              <MaterialIcons 
                name="remove" 
                size={22} 
                color={quantity <= 1 ? '#666666' : '#007AFF'} 
              />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={[styles.quantityButton, quantity >= 10 && styles.quantityButtonDisabled]}
              onPress={() => handleQuantityChange(1)}
              disabled={quantity >= 10}
            >
              <MaterialIcons 
                name="add" 
                size={22} 
                color={quantity >= 10 ? '#666666' : '#007AFF'} 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Total Price</Text>
            <Text style={styles.priceValue}>
              ${(selectedProduct?.price * quantity || 0).toFixed(2)}
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={confirmAddToCart}
          >
            <MaterialCommunityIcons name="cart-plus" size={22} color="#FFFFFF" style={styles.cartIcon} />
            <Text style={styles.confirmButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const LastAddedNotification = () => {
    if (!lastAddedProduct) return null;

    return (
      <Animated.View
        style={[
          styles.lastAddedNotification,
          {
            transform: [{ scale: cartAnimation }]
          }
        ]}
      >
        <Image
          source={{ uri: lastAddedProduct.image_url }}
          style={styles.lastAddedImage}
        />
        <View style={styles.lastAddedInfo}>
          <Text style={styles.lastAddedTitle}>Added to Cart!</Text>
          <Text style={styles.lastAddedDetails}>
            {lastAddedProduct.quantity}x {lastAddedProduct.name}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.viewCartButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <Text style={styles.viewCartText}>View Cart</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const CustomToast = ({ message, type, onHide }) => {
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.9)).current;
    const navigation = useNavigation();

    useEffect(() => {
      // Play haptic feedback
      Haptics.notificationAsync(
        type === 'error' 
          ? Haptics.NotificationFeedbackType.Error 
          : Haptics.NotificationFeedbackType.Success
      );

      // Show animation
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      // Hide after delay (longer for success with buttons)
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 200,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.9,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => onHide());
      }, type === 'success' ? 4000 : 2500); // Longer duration for success toast

      return () => clearTimeout(timer);
    }, []);

    const getToastStyle = () => {
      switch (type) {
        case 'success':
          return {
            backgroundColor: '#4FA5F5',
            icon: 'check-circle-outline',
            title: 'Success',
            gradient: ['#4FA5F5', '#6366F1']
          };
        case 'error':
          return {
            backgroundColor: '#DC2626',
            icon: 'error-outline',
            title: 'Error',
            gradient: ['#DC2626', '#EF4444']
          };
        case 'warning':
          return {
            backgroundColor: '#F59E0B',
            icon: 'warning',
            title: 'Warning',
            gradient: ['#F59E0B', '#F97316']
          };
        default:
          return {
            backgroundColor: '#4FA5F5',
            icon: 'info-outline',
            title: 'Info',
            gradient: ['#4FA5F5', '#6366F1']
          };
      }
    };

    const toastStyle = getToastStyle();

    return (
      <Animated.View
        style={[
          styles.toastContainer,
          {
            transform: [
              { translateY },
              { scale }
            ],
            opacity,
          },
        ]}
      >
        <View style={[styles.toast, type === 'error' && styles.toastError]}>
          <MaterialIcons
            name={toastStyle.icon}
            size={24}
            color="#FFFFFF"
            style={styles.toastIcon}
          />
          <View style={styles.toastContent}>
            <Text style={styles.toastTitle}>{toastStyle.title}</Text>
            <Text style={styles.toastMessage}>{message}</Text>
            {type === 'success' && message.includes('added to your cart') && (
              <View style={styles.toastButtons}>
                <TouchableOpacity
                  style={styles.toastButton}
                  onPress={() => {
                    onHide();
                    navigation.navigate('Cart');
                  }}
                >
                  <Text style={styles.toastButtonText}>View Cart</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toastButton, styles.toastButtonOutline]}
                  onPress={() => {
                    onHide();
                  }}
                >
                  <Text style={[styles.toastButtonText, styles.toastButtonTextOutline]}>
                    Continue Shopping
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    );
  };

  const HeaderSection = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerCategory}>Boxing Equipment</Text>
          <Text style={styles.headerTitle}>Professional Boxing Gear</Text>
          <Text style={styles.headerSubtitle}>
            Train like a champion with premium boxing equipment
          </Text>
          <View style={styles.headerStats}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="boxing-glove" size={18} color="#FFFFFF" style={styles.statIcon} />
              <Text style={styles.statValue}>{products.length}</Text>
              <Text style={styles.statLabel}>Products</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons name="local-fire-department" size={18} color="#FFFFFF" style={styles.statIcon} />
              <Text style={styles.statValue}>{products.filter(p => p.discount > 0).length}</Text>
              <Text style={styles.statLabel}>On Sale</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons name="star" size={18} color="#FFFFFF" style={styles.statIcon} />
              <Text style={styles.statValue}>{products.filter(p => p.rating >= 4.5).length}</Text>
              <Text style={styles.statLabel}>Top Rated</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerImageContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?ixlib=rb-4.0.3' }}
            style={styles.headerImage}
          />
          <View style={styles.headerImageOverlay} />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {toast.visible && (
        <CustomToast 
          message={toast.message}
          type={toast.type}
          onHide={() => setToast({ visible: false, message: '', type: 'success' })}
        />
      )}
      
      <QuantityModal />
      <QuickViewModal />
      <LastAddedNotification />
      
      <HeaderSection />
      
      <AnimatedFlatList
        data={products}
        keyExtractor={(item) => item.product_id.toString()}
        renderItem={renderProductItem}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.productList}
        columnWrapperStyle={styles.columnWrapper}
        ListFooterComponent={() => (
          <>
            <RecentlyViewedSection />
            <View style={styles.listFooter} />
          </>
        )}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#007AFF"
            colors={['#007AFF']}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    backgroundColor: '#4FA5F5',
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 8,
  },
  headerImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 4,
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerCategory: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statIcon: {
    marginRight: 4,
    opacity: 0.9,
  },
  statValue: {
    fontSize: 14,
    color: '#FFFFFF',
    marginRight: 4,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  productCard: {
    width: 170,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    margin: 8,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#F7FAFC',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FF4B4B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
  },
  discountText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 2,
  },
  favoriteButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  shareButton: {
    position: 'absolute',
    top: 12,
    right: 56,
    backgroundColor: '#4FA5F5',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 2,
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 8,
    lineHeight: 22,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingStars: {
    flexDirection: 'row',
    marginRight: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  discountedPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 4,
  },
  originalPrice: {
    fontSize: 14,
    color: '#A0AEC0',
    textDecorationLine: 'line-through',
  },
  savingsContainer: {
    backgroundColor: '#C6F6D5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  savingsText: {
    color: '#2F855A',
    fontSize: 13,
    fontWeight: '600',
  },
  addToCartButton: {
    backgroundColor: '#4FA5F5',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4FA5F5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#4FA5F5',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  toastError: {
    backgroundColor: '#DC2626',
  },
  toastIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  toastContent: {
    flex: 1,
  },
  toastTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  toastMessage: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 12,
  },
  toastButtons: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  toastButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  toastButtonText: {
    color: '#4FA5F5',
    fontSize: 14,
    fontWeight: '600',
  },
  toastButtonTextOutline: {
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A202C',
  },
  closeButton: {
    padding: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A202C',
  },
  confirmButton: {
    backgroundColor: '#4FA5F5',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  lastAddedNotification: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
  },
  lastAddedImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  lastAddedInfo: {
    flex: 1,
  },
  lastAddedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 4,
  },
  lastAddedDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  viewCartButton: {
    backgroundColor: '#4FA5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 12,
  },
  viewCartText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  skeletonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
  },
  skeletonCard: {
    width: 170,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  skeletonImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#E2E8F0',
  },
  skeletonInfo: {
    padding: 16,
  },
  skeletonText: {
    height: 20,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonPrice: {
    height: 24,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    width: '60%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  listFooter: {
    height: 120, // Increased height for better spacing
  },
  recentlyViewedSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  recentlyViewedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentlyViewedTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentlyViewedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A202C',
    marginLeft: 8,
  },
  clearHistoryButton: {
    padding: 8,
  },
  clearHistoryText: {
    fontSize: 14,
    color: '#6B7280',
  },
  recentlyViewedItem: {
    width: 120,
    marginRight: 16,
  },
  recentlyViewedImageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  recentlyViewedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  recentlyViewedDiscountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF4B4B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
  },
  recentlyViewedDiscountText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  recentlyViewedInfo: {
    padding: 8,
  },
  recentlyViewedName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 4,
  },
  recentlyViewedRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  recentlyViewedPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentlyViewedPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
  },
  recentlyViewedOriginalPrice: {
    fontSize: 14,
    color: '#A0AEC0',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
});

export default  BoxingProducts;
