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
  Platform,
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL } from "../../Api";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { TextInput } from 'react-native';
import { Share } from 'react-native';
import * as Haptics from 'expo-haptics';

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
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [selectedSort, setSelectedSort] = useState({ id: 'discount', label: 'Highest Discount' });
  const [cartProducts, setCartProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [lastAddedProduct, setLastAddedProduct] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("info");
  const animationValues = useRef({
    scale: new Animated.Value(1),
    success: new Animated.Value(0)
  }).current;
  const cartAnimation = useRef(new Animated.Value(1)).current;
  const notificationTimeout = useRef(null);
  const shareButtonScale = useRef(new Animated.Value(1)).current;

  const sortOptions = [
    { id: 'discount', label: 'Highest Discount', icon: 'local-offer' },
    { id: 'price_low', label: 'Lowest Price', icon: 'arrow-downward' },
    { id: 'price_high', label: 'Highest Price', icon: 'arrow-upward' },
    { id: 'rating', label: 'Best Rating', icon: 'star' },
    { id: 'newest', label: 'Newest First', icon: 'schedule' }
  ];

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

  const shareProduct = async (product) => {
    try {
      // Add haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Animate the share button
      Animated.sequence([
        Animated.spring(shareButtonScale, {
          toValue: 0.8,
          useNativeDriver: true,
          duration: 100
        }),
        Animated.spring(shareButtonScale, {
          toValue: 1,
          useNativeDriver: true,
          duration: 100
        })
      ]).start();

      await Share.share({
        message: `Check out ${product.name} on SportsMate! Price: ${product.formatted_price}`,
        url: product.image_url,
        title: 'Share Product'
      });
    } catch (error) {
      console.error('Error sharing product:', error);
      showNotification('Failed to share product', 'error');
    }
  };

  const addToCart = async (product) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userDataStr = await AsyncStorage.getItem('userData');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const userId = userData?.user_id;
      const existingCart = await AsyncStorage.getItem('cartProducts');
      const cartProductsList = existingCart ? JSON.parse(existingCart) : [];

      if (!token || !userId || !product?.product_id) {
        showNotification("Please log in to add items to cart", "warning");
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
        setLastAddedProduct(product);
        setAlertVisible(true);
        setAlertMessage(`${product.name} added to cart!`);
        setAlertType("success");
        navigation.navigate('ProductDetail', { productId: product.product_id });
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
      showNotification(error.response?.data?.message || "Error adding to cart", "error");
      setAddingToCartId(null);
    }
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
        // First get the favorite_id
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

        // Remove from favorites using favorite_id
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
        // Add to favorites
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

  const navigateToProductDetail = (productId) => {
    navigation.navigate('ProductDetail', { productId });
  };

  const fetchDiscountedProducts = async () => {
    try {
      setLoading(true);
      let productsResponse;

      if (selectedCategory === 'All') {
        productsResponse = await axios.get(`${BASE_URL}/product/discounted`);
      } else {
        productsResponse = await axios.get(`${BASE_URL}/product/discounted/category/${encodeURIComponent(selectedCategory)}`);
      }

      const favoritesResponse = await AsyncStorage.getItem('favoriteProducts');
      const products = productsResponse.data.products || productsResponse.data;
      const userFavorites = favoritesResponse ? JSON.parse(favoritesResponse) : [];
      setFavorites(userFavorites);

      if (!products || products.length === 0) {
        showNotification(`No discounted products found${selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}`, 'warning');
        setFilteredProducts([]);
        setCategorizedProducts({});
        return;
      }

      // Sort products based on selected sort option
      const sortedProducts = products.sort((a, b) => {
        switch (selectedSort.id) {
          case 'discount':
            return b.discount - a.discount;
          case 'price_low':
            return a.price - b.price;
          case 'price_high':
            return b.price - a.price;
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'newest':
            return new Date(b.createdAt) - new Date(a.createdAt);
          default:
            return 0;
        }
      });

      // Categorize products by sport name
      const categorized = sortedProducts.reduce((acc, product) => {
        const category = product.sport?.name || 'Other';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(product);
        return acc;
      }, {});

      setCategorizedProducts(categorized);
      setFilteredProducts(sortedProducts);
    } catch (error) {
      console.error("Error fetching discounted products:", error);
      showNotification(
        error.response?.data?.message || 'Error loading products', 
        'error'
      );
      setFilteredProducts([]);
      setCategorizedProducts({});
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      // Change to use the sports endpoint since that's our category system
      const response = await axios.get(`${BASE_URL}/sports`);
      const sportCategories = response.data.map(sport => sport.name);
      setCategories(['All', ...sportCategories]);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories(['All']); // Fallback to just showing 'All' if fetch fails
      showNotification('Error loading categories', 'error');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const getCategoryIcon = (category) => {
    const sportIcons = {
      'All': 'apps',
      'Football': 'sports-soccer',
      'Basketball': 'sports-basketball',
      'Tennis': 'sports-tennis',
      'Baseball': 'sports-baseball',
      'Golf': 'sports-golf',
      'Rugby': 'sports-rugby',
      'Cricket': 'sports-cricket',
      'Gym': 'fitness-center',
      'E-Sports': 'sports-esports',
      'Hockey': 'sports-hockey',
      'MMA': 'sports-mma',
      'Walking': 'directions-walk'
    };
    return sportIcons[category] || 'sports';
  };

  useEffect(() => {
    fetchDiscountedProducts();
    fetchCategories();
  }, [selectedCategory, selectedSort.id]);

  const filterProducts = useCallback(() => {
    let filtered = [];
    Object.values(categorizedProducts).forEach(products => {
      filtered = [...filtered, ...products];
    });

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.sport?.name === selectedCategory);
    }

    setFilteredProducts(filtered);
  }, [categorizedProducts, searchQuery, selectedCategory]);

  useEffect(() => {
    filterProducts();
  }, [filterProducts, categorizedProducts, searchQuery, selectedCategory]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDiscountedProducts().finally(() => setRefreshing(false));
  }, []);

  const renderSortButton = () => (
    <TouchableOpacity
      style={styles.sortButton}
      onPress={() => setSortModalVisible(true)}
    >
      <MaterialIcons name="sort" size={24} color="#4A5568" />
      <Text style={styles.sortButtonText}>{selectedSort.label}</Text>
      <MaterialIcons name="arrow-drop-down" size={24} color="#4A5568" />
    </TouchableOpacity>
  );

  const SortModal = () => (
    <Modal
      visible={sortModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setSortModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setSortModalVisible(false)}>
        <View style={styles.sortModalOverlay}>
          <View style={styles.sortModalContent}>
            <View style={styles.sortModalHeader}>
              <Text style={styles.sortModalTitle}>Sort Products</Text>
              <TouchableOpacity onPress={() => setSortModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.sortOption,
                  selectedSort.id === option.id && styles.sortOptionSelected
                ]}
                onPress={() => {
                  setSelectedSort(option);
                  setSortModalVisible(false);
                }}
              >
                <View style={styles.sortOptionContent}>
                  <MaterialIcons
                    name={option.icon}
                    size={24}
                    color={selectedSort.id === option.id ? '#4FA5F5' : '#718096'}
                  />
                  <Text style={[
                    styles.sortOptionText,
                    selectedSort.id === option.id && styles.sortOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </View>
                {selectedSort.id === option.id && (
                  <MaterialIcons name="check" size={24} color="#4FA5F5" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
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
    const isFavorite = favorites.includes(product.product_id);
    const isAddingToCart = addingToCartId === product.product_id;
    const savings = product.price * (product.discount / 100);
    const discountedPrice = product.price * (1 - product.discount / 100);

    return (
      <TouchableOpacity
        key={product.product_id}
        style={styles.productCard}
        onPress={() => navigateToProductDetail(product.product_id)}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.image_url }}
            style={styles.productImage}
            resizeMode="cover"
          />
          {product.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{product.discount}%</Text>
            </View>
          )}
          <TouchableOpacity
            style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
            onPress={() => toggleFavorite(product)}
          >
            <MaterialIcons
              name={isFavorite ? 'favorite' : 'favorite-outline'}
              size={24}
              color={isFavorite ? '#FF4B4B' : '#FFF'}
            />
          </TouchableOpacity>
          <Animated.View style={[
            styles.shareButton,
            {
              transform: [{ scale: shareButtonScale }]
            }
          ]}>
            <TouchableOpacity
              onPress={() => shareProduct(product)}
            >
              <MaterialIcons
                name="share"
                size={20}
                color="#FFFFFF"
                style={{ transform: [{ rotate: '-45deg' }] }}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          
          <View style={styles.priceContainer}>
            <View style={styles.priceInfo}>
              <Text style={styles.discountedPrice}>
                ${discountedPrice.toFixed(2)}
              </Text>
              <Text style={styles.originalPrice}>
                ${product.price.toFixed(2)}
              </Text>
            </View>
            {product.discount > 0 && (
              <View style={styles.savingsContainer}>
                <Text style={styles.savingsText}>
                  Save ${savings.toFixed(2)}
                </Text>
              </View>
            )}
          </View>

          <Animated.View
            style={[
              styles.addToCartContainer,
              {
                transform: [
                  {
                    scale: isAddingToCart ? animationValues.scale : 1
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
                  <MaterialIcons name="shopping-cart" size={20} color="#FFF" />
                  <Text style={styles.buttonText}>Add to Cart</Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </TouchableOpacity>
    );
  };

  const NotificationBanner = ({ message, type = 'info', onClose }) => {
    const [animation] = useState(new Animated.Value(0));

    useEffect(() => {
      Animated.sequence([
        Animated.spring(animation, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7
        }),
        Animated.delay(2000),
        Animated.spring(animation, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7
        })
      ]).start(() => onClose());
    }, []);

    const getBannerStyle = () => {
      switch (type) {
        case 'success':
          return [styles.notification, styles.notificationSuccess];
        case 'error':
          return [styles.notification, styles.notificationError];
        case 'warning':
          return [styles.notification, styles.notificationWarning];
        default:
          return [styles.notification];
      }
    };

    const getIcon = () => {
      switch (type) {
        case 'success':
          return 'check-circle';
        case 'error':
          return 'error-outline';
        case 'warning':
          return 'warning';
        default:
          return 'info';
      }
    };

    return (
      <Animated.View 
        style={[
          getBannerStyle(),
          {
            transform: [
              { translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [-100, 0]
              })},
            ],
            opacity: animation
          }
        ]}
      >
        <MaterialIcons
          name={getIcon()}
          size={24}
          color="#FFF"
          style={styles.notificationIcon}
        />
        <Text style={styles.notificationText}>{message}</Text>
        <TouchableOpacity 
          onPress={onClose} 
          style={styles.notificationClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="close" size={20} color="#FFF" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const CustomAlert = ({ visible, message, type, onClose, onAction }) => {
    const getIcon = () => {
      switch (type) {
        case 'success':
          return 'check-circle';
        case 'error':
          return 'error-outline';
        case 'warning':
          return 'warning';
        default:
          return 'info';
      }
    };

    const getColor = () => {
      switch (type) {
        case 'success':
          return '#10B981';
        case 'error':
          return '#EF4444';
        case 'warning':
          return '#F59E0B';
        default:
          return '#3B82F6';
      }
    };

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={styles.alertContainer}>
            <View style={[styles.alertIconContainer, { backgroundColor: `${getColor()}20` }]}>
              <MaterialIcons name={getIcon()} size={32} color={getColor()} />
            </View>
            <Text style={styles.alertTitle}>
              {type === 'success' ? 'Success!' : type === 'error' ? 'Error' : 'Notification'}
            </Text>
            <Text style={styles.alertMessage}>{message}</Text>
            <View style={styles.alertButtons}>
              <TouchableOpacity
                style={[styles.alertButton, styles.alertButtonClose]}
                onPress={onClose}
              >
                <Text style={styles.alertButtonTextSecondary}>Close</Text>
              </TouchableOpacity>
              {onAction && (
                <TouchableOpacity
                  style={[styles.alertButton, styles.alertButtonAction, { backgroundColor: getColor() }]}
                  onPress={() => {
                    onClose();
                    onAction();
                  }}
                >
                  <Text style={styles.alertButtonText}>View Cart</Text>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  };

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

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <FontAwesome name="shopping-basket" size={64} color="#A0AEC0" />
      <Text style={styles.emptyStateTitle}>No Products Found</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery 
          ? "No products match your search criteria"
          : selectedCategory !== 'All'
          ? `No products found in ${selectedCategory} category`
          : "No discounted products available at the moment"}
      </Text>
    </View>
  );

  const renderCategoryChip = (category) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryChip,
        selectedCategory === category && styles.categoryChipSelected
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <View style={[
        styles.categoryIcon,
        selectedCategory === category && styles.categoryIconSelected
      ]}>
        <MaterialIcons
          name={getCategoryIcon(category)}
          size={20}
          color={selectedCategory === category ? '#FFF' : '#4A5568'}
        />
      </View>
      <Text
        style={[
          styles.categoryChipText,
          selectedCategory === category && styles.categoryChipTextSelected
        ]}
      >
        {category}
      </Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4FA5F5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomAlert
        visible={alertVisible}
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertVisible(false)}
        onAction={() => navigation.navigate('Cart')}
      />
      
      <LastAddedNotification />
      
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <FontAwesome name="search" size={20} color="#A0AEC0" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#A0AEC0"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <FontAwesome name="times-circle" size={20} color="#A0AEC0" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
            contentContainerStyle={styles.categoriesScrollContent}
          >
            {categories.map(renderCategoryChip)}
          </ScrollView>
          {renderSortButton()}
        </View>

        <View style={styles.productsContainer}>
          {filteredProducts.length > 0 ? filteredProducts.map(renderProductCard) : renderEmptyState()}
        </View>
      </ScrollView>

      <SortModal />

      {notification.message && (
        <NotificationBanner message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FAFF',
  },
  filterSection: {
    backgroundColor: '#F7FAFF',
    paddingTop: 12,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sortButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4A5568',
    marginHorizontal: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginRight: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipSelected: {
    backgroundColor: '#4FA5F5',
    borderColor: '#4FA5F5',
    shadowColor: '#4FA5F5',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryChipText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4A5568',
    marginLeft: 8,
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  categoryIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  categoryIconSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoriesScroll: {
    flex: 1,
    marginBottom: 8,
  },
  categoriesScrollContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
  },
  productsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 16,
  },
  productCard: {
    width: cardWidth,
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
    backgroundColor: '#4299E1',
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
  addToCartContainer: {
    width: '100%',
  },
  addToCartButton: {
    backgroundColor: '#4299E1',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addingToCart: {
    backgroundColor: '#2B6CB0',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  notification: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 16,
    right: 16,
    backgroundColor: '#1A202C',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 1000,
  },
  notificationSuccess: {
    backgroundColor: '#10B981',
  },
  notificationError: {
    backgroundColor: '#EF4444',
  },
  notificationWarning: {
    backgroundColor: '#F59E0B',
  },
  notificationIcon: {
    marginRight: 12,
  },
  notificationText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
  notificationClose: {
    padding: 4,
    marginLeft: 8,
  },
  loadingProductsContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3748',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
  },
  sortModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sortModalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  sortModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  sortModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  sortOptionSelected: {
    backgroundColor: '#F7FAFF',
  },
  sortOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#4A5568',
    marginLeft: 12,
  },
  sortOptionTextSelected: {
    color: '#4FA5F5',
    fontWeight: '500',
  },
  lastAddedNotification: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  lastAddedImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  lastAddedInfo: {
    flex: 1,
  },
  lastAddedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  lastAddedDetails: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  viewCartButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewCartText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(5px)',
  },
  alertContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  alertIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  alertButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  alertButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertButtonClose: {
    backgroundColor: '#F3F4F6',
  },
  alertButtonAction: {
    backgroundColor: '#3B82F6',
  },
  alertButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  alertButtonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  notificationClose: {
    padding: 4,
  },
});

export default AllDiscountedProducts;