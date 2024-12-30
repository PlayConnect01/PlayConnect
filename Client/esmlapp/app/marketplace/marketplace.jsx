import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Animated,
} from "react-native";
import {
  useNavigation
} from "@react-navigation/native";
import axios from "axios";
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SearchBar from './SearchBar';
import Sidebar from './Sidebar';
import {BASE_URL} from '../../Api';
import { Ionicons } from '@expo/vector-icons';

const getStyles = (isSidebarVisible) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7FAFF',
    position: 'relative',
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F7FAFF',
    marginBottom: 80,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: isSidebarVisible ? 0 : 30,
    borderTopRightRadius: 30,
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(79, 165, 245, 0.1)',
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4FA5F5',
    letterSpacing: 0.5,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(79, 165, 245, 0.04)',
    padding: 6,
    borderRadius: 14,
  },
  iconButton: {
    position: 'relative',
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF4B4B',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    marginVertical: 20,
    paddingHorizontal: 4,
  },
  productContainer: {
    position: 'relative',
    width: '100%',
    height: 500,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    overflow: 'hidden',
  },
  card: {
    width: '90%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  cardImageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)',
  },
  cardContentOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 24,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  cardRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 12,
    borderRadius: 16,
    marginTop: 16,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cardPrice: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 'auto',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 24,
  },
  favoriteButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cartButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4FA5F5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  cartButtonSuccess: {
    backgroundColor: '#48BB78',
  },
  cartButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartAnimation: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -25 }],
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  navButtonLeft: {
    left: 16,
  },
  navButtonRight: {
    right: 16,
  },
  discountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(79, 165, 245, 0.08)',
    position: 'relative',
    overflow: 'hidden',
  },
  discountImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F7FAFF',
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  discountImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  discountInfo: {
    flex: 1,
    marginLeft: 16,
    paddingRight: 8,
  },
  discountTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  discountPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  discountPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4FA5F5',
  },
  discountOldPrice: {
    fontSize: 16,
    color: '#A0AEC0',
    textDecorationLine: 'line-through',
    marginLeft: 8,
    fontWeight: '500',
  },
  discountSavings: {
    fontSize: 14,
    color: '#48BB78',
    fontWeight: '600',
    marginTop: 4,
  },
  discountPercentage: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FF4B4B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#FF4B4B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  discountPercentageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  discountCartButton: {
    backgroundColor: '#4FA5F5',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    height: 44,
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    marginLeft: 12,
  },
  discountCartButtonSuccess: {
    backgroundColor: '#48BB78',
  },
  discountCartButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  discountBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FF4B4B',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '15deg' }],
    shadowColor: '#FF4B4B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  discountDescription: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
    marginBottom: 8,
  },
  discountFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  discountFeature: {
    backgroundColor: 'rgba(79, 165, 245, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  discountFeatureText: {
    color: '#4FA5F5',
    fontSize: 12,
    fontWeight: '500',
  },
  viewAllButton: {
    backgroundColor: '#4FA5F5',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  viewAllText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  notificationContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(79, 165, 245, 0.95)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIcon: {
    marginRight: 12,
  },
  notificationText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  notificationSuccess: {
    backgroundColor: 'rgba(72, 187, 120, 0.95)',
  },
  notificationError: {
    backgroundColor: 'rgba(245, 101, 101, 0.95)',
  },
  notificationWarning: {
    backgroundColor: 'rgba(246, 173, 85, 0.95)',
  },
  swipeHint: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeHintText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginRight: 8,
  },
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
});

const Marketplace = () => {
  const navigation = useNavigation();   
  const [products, setProducts] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [cartProducts, setCartProducts] = useState([]);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [addingToCartId, setAddingToCartId] = useState(null);
  const animationValues = useRef({
    scale: new Animated.Value(1),
    success: new Animated.Value(0)
  }).current;
  const notificationTimeout = useRef(null);

  const styles = getStyles(isSidebarVisible);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const [allProductsResponse, topDiscountedResponse] = await Promise.all([
        axios.get(`${BASE_URL}/product/discounted`),
        axios.get(`${BASE_URL}/product/discounted/top-three`),
      ]);
      setProducts(allProductsResponse.data);
      setDiscounts(topDiscountedResponse.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setNotification({ message: "Failed to load products. Please try again.", type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCartCount = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');

      if (token && userId) {
        const response = await axios.get(`${BASE_URL}/cart/count/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartCount(response.data.count);
        setCartProducts(response.data.products || []);
      } else {
        setNotification({ message: "User not logged in.", type: 'warning' });
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
      setNotification({ message: "Failed to load cart count. Please try again.", type: 'error' });
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCartCount();
  }, [fetchProducts, fetchCartCount]);

  useEffect(() => {
    return () => {
      if (notificationTimeout.current) {
        clearTimeout(notificationTimeout.current);
      }
    };
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([fetchProducts(), fetchCartCount()]).then(() =>
      setRefreshing(false)
    );
  }, [fetchProducts, fetchCartCount]);

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

    // Reset after animation
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

  const addToCart = useCallback(async (product) => {
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
  }, [cartProducts, navigation]);

  const calculateDiscountedPrice = useCallback((price, discount) => {
    const originalPrice = parseFloat(price);
    const discountValue = parseFloat(discount);
    return isNaN(originalPrice) || isNaN(discountValue)
      ? 0
      : originalPrice - originalPrice * (discountValue / 100);
  }, []);

  const handleSelectCategory = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  const toggleFavorite = useCallback(async (product) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');
  
      if (!token || !userId || !product?.product_id) {
        showNotification("Please login to manage favorites", "warning");
        return;
      }
  
      const isAlreadyFavorite = favoriteProducts.includes(product.product_id);
  
      if (isAlreadyFavorite) {
        const response = await axios.delete(
         `${BASE_URL}/favorites/favorites/item/${product.product_id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
  
        if (response.status === 200) {
          setFavoriteProducts((prevFavorites) =>
            prevFavorites.filter((id) => id !== product.product_id)
          );
          showNotification("Removed from favorites ❌", "success");
        }
      } else {
        const response = await axios.post(
          `${BASE_URL}/favorites/favorites/add`,
          {
            userId: parseInt(userId),
            productId: product.product_id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
  
        if (response.status === 201) {
          setFavoriteProducts((prevFavorites) => [...prevFavorites, product.product_id]);
          showNotification("Added to favorites ❤️", "success");
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      showNotification("Something went wrong! Please try again.", "error");
    }
  }, [favoriteProducts]);

  const showNextProduct = () => {
    setCurrentProductIndex((prevIndex) =>
      prevIndex < products.length - 1 ? prevIndex + 1 : 0
    );
  };

  const showPreviousProduct = () => {
    setCurrentProductIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : products.length - 1
    );
  };

  const currentProduct = products[currentProductIndex];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        {isSidebarVisible && (
          <Sidebar onSelectCategory={handleSelectCategory} />
        )}
        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
                <FontAwesome name={isSidebarVisible ? "times" : "bars"} size={20} color="#333" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Marketplace</Text>
              <View style={styles.headerIcons}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('CartScreen')}
                  style={styles.iconButton}
                >
                  <FontAwesome name="shopping-cart" size={20} color="#333" />
                  {cartCount > 0 && (
                    <View style={styles.cartBadge}>
                      <Text style={styles.cartBadgeText}>{cartCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => navigation.navigate('FavoritesScreen')}
                >
                  <FontAwesome name="heart-o" size={20} color="#333" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <SearchBar onSelectProduct={() => {}} />
            <Text style={styles.sectionTitle}>Featured Product</Text>
            {currentProduct && (
              <View style={styles.productContainer}>
                <TouchableOpacity style={[styles.navButton, styles.navButtonLeft]} onPress={showPreviousProduct}>
                  <FontAwesome name="chevron-left" size={24} color="#4FA5F5" />
                </TouchableOpacity>
                
                <View style={styles.card}>
                  <View style={styles.cardImageContainer}>
                    <Image
                      source={{ uri: currentProduct.image_url }}
                      style={styles.cardImage}
                    />
                    <View style={styles.imageOverlay} />
                  </View>
                  
                  <View style={styles.cardContentOverlay}>
                    <Text style={styles.cardTitle}>{currentProduct.name}</Text>
                    
                    <View style={styles.cardRatingContainer}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FontAwesome
                          key={star}
                          name={star <= currentProduct.rating ? "star" : "star-o"}
                          size={20}
                          color={star <= currentProduct.rating ? "#FFD700" : "#BDC3C7"}
                          style={{ marginHorizontal: 2 }}
                        />
                      ))}
                      <Text style={styles.ratingText}>{currentProduct.rating.toFixed(1)}</Text>
                    </View>
                    
                    <Text style={styles.cardPrice}>${currentProduct.price}</Text>
                    
                    <View style={styles.cardActions}>
                      <TouchableOpacity 
                        style={styles.favoriteButton} 
                        onPress={() => toggleFavorite(currentProduct)}
                      >
                        <FontAwesome 
                          name={favoriteProducts.includes(currentProduct.product_id) ? "heart" : "heart-o"} 
                          size={24} 
                          color="#FFFFFF" 
                        />
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[
                          styles.cartButton,
                          addingToCartId === currentProduct.product_id && styles.cartButtonSuccess
                        ]} 
                        onPress={() => addToCart(currentProduct)}
                        disabled={addingToCartId === currentProduct.product_id}
                      >
                        <Animated.View 
                          style={[
                            styles.cartButtonContent,
                            {
                              transform: [
                                { 
                                  scale: addingToCartId === currentProduct.product_id ? 
                                    animationValues.scale : 1 
                                }
                              ]
                            }
                          ]}
                        >
                          {addingToCartId === currentProduct.product_id ? (
                            <ActivityIndicator color="#FFFFFF" />
                          ) : (
                            <FontAwesome name="shopping-cart" size={24} color="#FFFFFF" />
                          )}
                        </Animated.View>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.swipeHint}>
                      <Text style={styles.swipeHintText}>Swipe to explore</Text>
                      <FontAwesome name="exchange" size={16} color="#FFFFFF" />
                    </View>
                  </View>
                </View>
                
                <TouchableOpacity style={[styles.navButton, styles.navButtonRight]} onPress={showNextProduct}>
                  <FontAwesome name="chevron-right" size={24} color="#4FA5F5" />
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.sectionTitle}>Special Offers</Text>
            {discounts.map((discount, index) => {
              const discountedPrice = calculateDiscountedPrice(
                discount.price,
                discount.discount
              );
              const savings = discount.price - discountedPrice;
              return (
                <TouchableOpacity
                  key={discount.id}
                  style={styles.discountItem}
                  onPress={() => navigation.navigate('ProductDetail', {
                    productId: discount.product_id,
                    product: {
                      id: discount.product_id,
                      name: discount.name,
                      image_url: discount.image_url,
                      price: discountedPrice.toFixed(2),
                      oldPrice: discount.price,
                      description: discount.description || 'Experience premium quality and exceptional value with this exclusive offer.',
                      discount: discount.discount
                    }
                  })}
                >
                  <View style={styles.discountImageContainer}>
                    <Image
                      source={{ uri: discount.image_url }}
                      style={styles.discountImage}
                    />
                  </View>
                  <View style={styles.discountInfo}>
                    <Text style={styles.discountTitle}>{discount.name}</Text>
                    <View style={styles.discountPriceContainer}>
                      <Text style={styles.discountPrice}>
                        ${discountedPrice.toFixed(2)}
                      </Text>
                      <Text style={styles.discountOldPrice}>
                        ${discount.price}
                      </Text>
                    </View>
                    <Text style={styles.discountSavings}>
                      You save: ${savings.toFixed(2)} ({discount.discount}% OFF)
                    </Text>
                    <Text style={styles.discountDescription} numberOfLines={2}>
                      {discount.description || 'Experience premium quality and exceptional value with this exclusive offer.'}
                    </Text>
                    <View style={styles.discountFeatures}>
                      <View style={styles.discountFeature}>
                        <Text style={styles.discountFeatureText}>Free Shipping</Text>
                      </View>
                      <View style={styles.discountFeature}>
                        <Text style={styles.discountFeatureText}>Limited Time</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.discountCartButton,
                      addingToCartId === discount.product_id && styles.discountCartButtonSuccess
                    ]}
                    onPress={() => addToCart(discount)}
                    disabled={addingToCartId === discount.product_id}
                  >
                    <Animated.View 
                      style={[
                        styles.cartButtonContent,
                        {
                          transform: [
                            { 
                              scale: addingToCartId === discount.product_id ? 
                                animationValues.scale : 1 
                            }
                          ]
                        }
                      ]}
                    >
                      {addingToCartId === discount.product_id ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <>
                          <FontAwesome name="shopping-cart" size={20} color="#FFFFFF" />
                          <Text style={styles.discountCartButtonText}>Add</Text>
                        </>
                      )}
                    </Animated.View>
                  </TouchableOpacity>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountBadgeText}>{discount.discount}%</Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate("AllDiscountedProduct")}
            >
              <Text style={styles.viewAllText}>View All Offers</Text>
            </TouchableOpacity>
          </ScrollView>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6e3de8" />
            </View>
          )}

          {notification.message && (
            <Animated.View style={[
              styles.notificationContainer,
              notification.type === 'success' && styles.notificationSuccess,
              notification.type === 'error' && styles.notificationError,
              notification.type === 'warning' && styles.notificationWarning,
            ]}>
              <View style={styles.notificationContent}>
                <FontAwesome
                  name={
                    notification.type === 'success' ? 'check-circle' :
                    notification.type === 'error' ? 'times-circle' :
                    notification.type === 'warning' ? 'exclamation-circle' : 'info-circle'
                  }
                  size={24}
                  color="#FFFFFF"
                  style={styles.notificationIcon}
                />
                <Text style={styles.notificationText}>{notification.message}</Text>
              </View>
            </Animated.View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Marketplace;