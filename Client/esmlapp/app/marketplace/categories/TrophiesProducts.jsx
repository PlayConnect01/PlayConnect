
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
import axios from 'axios';
import { BASE_URL } from '../../../Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect, useIsFocused } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useCart } from '../../../contexts/CartContext';
import { BlurView } from 'expo-blur';
import Toast from 'react-native-toast-message';
import { Easing } from 'react-native';

const SPORT_ID = 17; 

const  TrophiesProducts= () => {
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

  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("info");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("info");

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
        Toast.show({
          type: 'success',
          text1: 'Stock alert removed',
          text2: 'You will no longer receive notifications for this product'
        });
      } else {
        newAlerts.push(productId);
        Toast.show({
          type: 'success',
          text1: 'Stock alert set',
          text2: 'You will be notified when this product is back in stock'
        });
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
        setNotificationMessage('Please login to add items to cart');
        setNotificationType('warning');
        Toast.show({
          type: 'warning',
          text1: 'Please login',
          text2: 'You need to be logged in to add items to cart'
        });
        navigation.navigate('Login');
        return;
      }

      if (!product?.product_id) {
        setNotificationMessage('Invalid product');
        setNotificationType('error');
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Invalid product'
        });
        return;
      }

      setSelectedProduct(product);
      setQuantity(1);
      setShowQuantityModal(true);
    } catch (error) {
      console.error("Error preparing to add to cart:", error);
      setNotificationMessage('Failed to prepare cart addition');
      setNotificationType('error');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to prepare cart addition'
      });
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
        setAlertMessage(`${quantity}x ${selectedProduct.name} added to your cart`);
        setAlertType('success');
        setAlertVisible(true);
        Toast.show({
          type: 'success',
          text1: 'Added to cart',
          text2: `${quantity}x ${selectedProduct.name} added to your cart`
        });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      setNotificationMessage('Failed to add item to cart');
      setNotificationType('error');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add item to cart'
      });
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
        Toast.show({
          type: 'warning',
          text1: 'Please login',
          text2: 'You need to be logged in to manage favorites'
        });
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
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Could not find favorite to remove'
          });
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
        Toast.show({
          type: 'success',
          text1: 'Removed from favorites',
          text2: 'Item has been removed from your favorites'
        });
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
        Toast.show({
          type: 'success',
          text1: 'Added to favorites',
          text2: 'Item has been added to your favorites'
        });
      }
      
      setFavorites(newFavorites);
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error updating favorites:', error);
      if (error.response?.status === 401) {
        Toast.show({
          type: 'warning',
          text1: 'Please login',
          text2: 'You need to be logged in to manage favorites'
        });
        navigation.navigate('Login');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to update favorites'
        });
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
      console.log('Fetching Baseball products');
      
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

  const renderProductItem = ({ item: product }) => {
    const isFavorite = favorites.includes(product.product_id);
    const hasStockAlert = stockAlerts.includes(product.product_id);
    const isInCart = cartItems.some(cartItem => cartItem.product_id === product.product_id);

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => {
          addToRecentlyViewed(product);
          navigation.navigate('ProductDetail', { 
            productId: product.product_id,
            productName: product.name 
          });
        }}
        onLongPress={() => {
          setQuickViewProduct(product);
          setShowQuickViewModal(true);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }}
      >
        <Image 
          source={{ uri: product.image_url }} 
          style={styles.productImage}
          resizeMode="cover"
        />
        <BlurView intensity={80} style={styles.productOverlay}>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => toggleFavorite(product.product_id)}
            >
              <MaterialIcons
                name={isFavorite ? 'favorite' : 'favorite-border'}
                size={24}
                color={isFavorite ? 'red' : 'black'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => toggleStockAlert(product.product_id)}
            >
              <MaterialIcons
                name={hasStockAlert ? 'notifications-active' : 'notifications-none'}
                size={24}
                color={hasStockAlert ? '#4CAF50' : 'black'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => shareProduct(product)}
            >
              <MaterialIcons name="share" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </BlurView>
        
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productDescription} numberOfLines={2}>
            {product.description}
          </Text>
          <View style={styles.priceContainer}>
            {product.discount > 0 ? (
              <>
                <Text style={styles.discountedPrice}>
                  {product.formatted_discounted_price}
                </Text>
                <Text style={styles.originalPrice}>
                  {product.formatted_price}
                </Text>
              </>
            ) : (
              <Text style={styles.price}>{product.formatted_price}</Text>
            )}
          </View>
          {product.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{product.discount}% OFF</Text>
            </View>
          )}
          <View style={styles.ratingContainer}>
            {[...Array(5)].map((_, index) => (
              <MaterialIcons
                key={index}
                name={index < product.rating ? 'star' : 'star-border'}
                size={16}
                color="#FFD700"
              />
            ))}
            <Text style={styles.ratingText}>{product.rating}/5</Text>
          </View>
          
          <TouchableOpacity
            style={[
              styles.addToCartButton,
              isInCart ? styles.addToCartButtonDisabled : styles.addToCartButtonEnabled
            ]}
            onPress={() => handleAddToCart(product)}
            disabled={isInCart}
          >
            <MaterialIcons 
              name={isInCart ? 'shopping-cart' : 'add-shopping-cart'} 
              size={20} 
              color="white" 
            />
            <Text style={styles.addToCartText}>
              {isInCart ? 'In Cart' : 'Add to Cart'}
            </Text>
          </TouchableOpacity>
        </View>
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

  const NotificationBanner = ({ message, type = 'info', onClose }) => {
    const getBannerStyle = () => {
      switch (type) {
        case 'success':
          return { backgroundColor: '#4CAF50' };
        case 'error':
          return { backgroundColor: '#f44336' };
        case 'warning':
          return { backgroundColor: '#ff9800' };
        default:
          return { backgroundColor: '#2196F3' };
      }
    };

    return (
      <Animated.View style={[styles.notificationBanner, getBannerStyle()]}>
        <Text style={styles.notificationText}>{message}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <MaterialIcons name="close" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const CustomAlert = ({ visible, message, type, onClose, onAction }) => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.alertContainer}>
            <Text style={styles.alertTitle}>
              {type === 'success' ? 'Success!' : type === 'error' ? 'Error' : 'Notification'}
            </Text>
            <Text style={styles.alertMessage}>{message}</Text>
            <View style={styles.alertButtons}>
              <TouchableOpacity
                style={[styles.alertButton, styles.alertButtonClose]}
                onPress={onClose}
              >
                <Text style={styles.alertButtonText}>Close</Text>
              </TouchableOpacity>
              {onAction && (
                <TouchableOpacity
                  style={[styles.alertButton, styles.alertButtonAction]}
                  onPress={() => {
                    onClose();
                    onAction();
                  }}
                >
                  <Text style={styles.alertButtonText}>View Cart</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      {notificationMessage && (
        <NotificationBanner 
          message={notificationMessage}
          type={notificationType}
          onClose={() => setNotificationMessage('')}
        />
      )}
      
      <CustomAlert
        visible={alertVisible}
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertVisible(false)}
        onAction={() => navigation.navigate('Cart')}
      />
      
      <QuantityModal />
      <QuickViewModal />
      <LastAddedNotification />
      
      <SortFilterBar />
      
      <AnimatedFlatList
        data={products}
        keyExtractor={(item) => item.product_id.toString()}
        renderItem={renderProductItem}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.productList}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#007AFF"
            colors={['#007AFF']}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        ListHeaderComponent={() => (
          <View>
            <Animated.View
              style={[
                styles.header,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <Text style={styles.headerTitle}>Baseball Equipment</Text>
              <Text style={styles.headerSubtitle}>
                Professional gear for baseball players
              </Text>
              <ProductCountBadge />
            </Animated.View>
            
            {recentlyViewed.length > 0 && (
              <View style={styles.recentlyViewedSection}>
                <Text style={styles.sectionTitle}>Recently Viewed</Text>
                <FlatList
                  horizontal
                  data={recentlyViewed}
                  keyExtractor={(item) => `recent-${item.product_id}`}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.recentlyViewedItem}
                      onPress={() => navigation.navigate('ProductDetail', { productId: item.product_id })}
                    >
                      <Image
                        source={{ uri: item.image_url }}
                        style={styles.recentlyViewedImage}
                      />
                      <Text style={styles.recentlyViewedName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.recentlyViewedPrice}>
                        ${item.price.toFixed(2)}
                      </Text>
                    </TouchableOpacity>
                  )}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.recentlyViewedList}
                />
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={() => (
          loading ? (
            <View style={styles.skeletonContainer}>
              {[...Array(4)].map((_, index) => (
                <View key={index} style={styles.skeletonCard}>
                  <View style={styles.skeletonImage} />
                  <View style={styles.skeletonInfo}>
                    <View style={styles.skeletonText} />
                    <View style={styles.skeletonPrice} />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          )
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginTop: 20, // Increased margin
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  productList: {
    padding: 10,
    paddingBottom: 100, // Increased bottom padding
  },
  recentlyViewedList: {
    paddingHorizontal: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  productCard: {
    flex: 1,
    margin: 8,
    backgroundColor: 'white',
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'hidden',
    minHeight: 320, // Fixed height for consistent cards
    maxWidth: Dimensions.get('window').width / 2 - 16, // Fixed width for 2 columns
  },
  productImage: {
    width: '100%',
    height: 180, // Fixed height for images
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    color: '#333',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e41e31',
    marginRight: 5,
  },
  originalPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
    color: '#666',
  },
  discountBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#e41e31',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  productOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderRadius: 20,
    overflow: 'hidden',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 5,
  },
  actionButton: {
    padding: 5,
    marginHorizontal: 2,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 15,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  addToCartButtonEnabled: {
    backgroundColor: '#007AFF',
  },
  addToCartButtonDisabled: {
    backgroundColor: '#B0B0B0',
  },
  addToCartText: {
    color: 'white',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  recentlyViewedSection: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  recentlyViewedItem: {
    width: 100,
    marginRight: 10,
  },
  recentlyViewedImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  recentlyViewedName: {
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  recentlyViewedPrice: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  productDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end', 
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    width: '100%',
    height: 280,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 25,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  closeButton: {
    padding: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    padding: 8,
    width: '70%',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  quantityButton: {
    backgroundColor: '#3a3a3a',
    borderRadius: 15,
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  quantityButtonDisabled: {
    backgroundColor: '#666666',
  },
  quantityText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginHorizontal: 15,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '85%',
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  priceLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    width: '85%',
    position: 'absolute',
    bottom: 25,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 8,
  },
  cartIcon: {
    marginRight: 5,
  },
  lastAddedNotification: {
    position: 'absolute',
    bottom: 20,
    left: 15,
    right: 15,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    zIndex: 1000,
  },
  lastAddedImage: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: '#2a2a2a',
  },
  lastAddedInfo: {
    flex: 1,
    marginLeft: 15,
  },
  lastAddedTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  lastAddedDetails: {
    fontSize: 15,
    color: '#999999',
  },
  viewCartButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 10,
  },
  viewCartText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  notificationBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1000,
  },
  notificationText: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
    marginRight: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  alertMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  alertButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  alertButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  alertButtonClose: {
    backgroundColor: '#666',
    marginRight: 10,
  },
  alertButtonAction: {
    backgroundColor: '#007AFF',
  },
  alertButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  quickViewContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 25,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  quickViewImage: {
    width: '100%',
    height: 250,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  quickViewInfo: {
    padding: 20,
  },
  quickViewName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  quickViewDescription: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 15,
  },
  quickViewPriceRating: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  quickViewPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  quickViewButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  quickViewButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sortFilterBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sortOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#F5F5F5',
  },
  sortOptionSelected: {
    backgroundColor: '#007AFF',
  },
  sortOptionText: {
    color: '#666666',
    fontSize: 14,
  },
  sortOptionTextSelected: {
    color: '#FFFFFF',
  },
  productCountBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  productCountText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '500',
  },
  skeletonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  skeletonCard: {
    flex: 1,
    margin: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    minHeight: 250,
    maxWidth: Dimensions.get('window').width / 2 - 16,
  },
  skeletonImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#F0F0F0',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  skeletonInfo: {
    padding: 10,
  },
  skeletonText: {
    height: 20,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonPrice: {
    height: 24,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    width: '60%',
  },
});























export default TrophiesProducts;
