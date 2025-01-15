import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useNavigation
} from "@react-navigation/native";
import axios from "axios";
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SearchBar from './SearchBar';
import Sidebar from './Sidebar';
import { BASE_URL } from "../../Api";
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { getStyles } from './styles/MarketplaceStyles';
const Marketplace = () => {
  const navigation = useNavigation();   
  const { isDarkMode, toggleTheme } = useTheme();
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
  const [showGuide, setShowGuide] = useState(false);
  const [currentGuideStep, setCurrentGuideStep] = useState(0);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);

  const styles = getStyles(isSidebarVisible, isDarkMode);
  
  // Animation refs
  const notificationTimeout = useRef(null);
  const animationValues = useRef({
    scale: new Animated.Value(1),
    success: new Animated.Value(0)
  }).current;
  const bannerAnimation = useRef(new Animated.Value(0)).current;
  const spotlightPosition = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const guideSteps = [
    {
      target: 'search',
      text: 'Search for your favorite products here',
      icon: 'magnify',
      position: { top: 60, left: 20 }
    },
    {
      target: 'categories',
      text: 'Browse through different categories',
      icon: 'view-grid',
      position: { top: 120, left: 20 }
    },
    {
      target: 'cart',
      text: 'View your shopping cart',
      icon: 'cart',
      position: { top: 60, right: 20 }
    }
  ];

  const renderWelcomeBanner = () => {
    if (!showWelcomeBanner) return null;

    return (
      <Animated.View
        style={[
          styles.welcomeBannerContainer,
          {
            transform: [
              {
                translateY: bannerAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-200, 0]
                })
              }
            ],
            opacity: bannerAnimation
          }
        ]}
      >
        <View style={styles.welcomeBannerContent}>
          <Animated.View
            style={[
              styles.welcomeBannerIcon,
              {
                transform: [
                  {
                    scale: scaleAnim
                  },
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg']
                    })
                  }
                ]
              }
            ]}
          >
            <MaterialCommunityIcons
              name="shopping-outline"
              size={28}
              color="#FFFFFF"
            />
          </Animated.View>

          <Animated.Text 
            style={[
              styles.welcomeBannerText,
              {
                transform: [
                  {
                    translateX: bannerAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0]
                    })
                  }
                ]
              }
            ]}
          >
            Welcome to sportsmate Marketplace! 🎉
          </Animated.Text>

          <TouchableOpacity
            style={styles.welcomeBannerClose}
            onPress={() => {
              Animated.parallel([
                Animated.timing(bannerAnimation, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                  easing: Easing.out(Easing.ease)
                }),
                Animated.timing(scaleAnim, {
                  toValue: 0,
                  duration: 200,
                  useNativeDriver: true
                })
              ]).start(() => setShowWelcomeBanner(false));
            }}
          >
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '180deg']
                    })
                  }
                ]
              }}
            >
              <MaterialCommunityIcons 
                name="close" 
                size={20} 
                color="#FFFFFF" 
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const animateWelcomeBanner = () => {
    Animated.sequence([
      Animated.spring(bannerAnimation, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true
      }),
      Animated.delay(3000),
      Animated.timing(bannerAnimation, {
        toValue: 0,
        duration: 800,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true
      })
    ]).start(() => setShowWelcomeBanner(false));
  };

  useEffect(() => {
    const checkFirstVisit = async () => {
      try {
        const hasVisited = await AsyncStorage.getItem('hasVisitedMarketplace');
        if (!hasVisited) {
          setShowGuide(true);
          await AsyncStorage.setItem('hasVisitedMarketplace', 'true');
          animateWelcomeBanner();
        }
      } catch (error) {
        console.error('Error checking first visit:', error);
      }
    };

    checkFirstVisit();
  }, []);

  useEffect(() => {
    if (showGuide) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1500,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease)
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease)
          })
        ])
      ).start();

      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
          easing: Easing.linear
        })
      ).start();

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.back)
      }).start();
    }

    return () => {
      pulseAnim.setValue(1);
      rotateAnim.setValue(0);
      fadeAnim.setValue(0);
    };
  }, [showGuide, pulseAnim, rotateAnim, fadeAnim]);

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
      // Don't show error for empty favorites
      if (error.response?.status === 404 && error.config?.url.includes('favorites')) {
        return;
      }
      console.error("Error fetching products:", {
        message: error.message,
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data
      });
      setNotification({ message: "Failed to load products. Please try again.", type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCartCount = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userDataStr = await AsyncStorage.getItem('userData');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const userId = userData?.user_id;

      if (token && userId) {
        const response = await axios.get(`${BASE_URL}/cart/count/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartCount(response.data.count);
        setCartProducts(response.data.products || []);
      } else {
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

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userDataStr = await AsyncStorage.getItem('userData');
        const userData = userDataStr ? JSON.parse(userDataStr) : null;
        const userId = userData?.user_id;

        if (token && userId) {
          try {
            const response = await axios.get(`${BASE_URL}/favorites/favorites/${userId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data) {
              const favoriteIds = response.data.map(fav => fav.product_id);
              setFavoriteProducts(favoriteIds);
            }
          } catch (error) {
            // Handle 404 gracefully - user might not have any favorites yet
            if (error.response?.status === 404) {
              console.log('No favorites found for user');
              setFavoriteProducts([]);
            } else {
              console.error("Error loading favorites:", error);
              showNotification("Failed to load favorites", "error");
            }
          }
        } else {
          // User not logged in - this is normal, just set empty favorites
          setFavoriteProducts([]);
        }
      } catch (error) {
        console.error("Error in loadFavorites:", error);
        showNotification("Error loading favorites", "error");
      }
    };

    loadFavorites();
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
      const userDataStr = await AsyncStorage.getItem('userData');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const userId = userData?.user_id;
      
      if (!token || !userId) {
        showNotification("Please login to add items to cart", "warning");
        navigation.navigate('Login');
        return;
      }

      if (!product?.product_id) {
        showNotification("Invalid product", "error");
        return;
      }

      if (cartProducts.some(item => item.product_id === product.product_id)) {
        showNotification("Product already in cart!", "warning");
        navigation.navigate('Cart');
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
        setCartProducts(prev => [...prev, productWithQuantity]);
        setCartCount(prevCount => prevCount + 1);
        showNotification(`${product.name} added to cart! 🛒`, "success");
        
        // Update local storage
        const existingCart = await AsyncStorage.getItem('cartProducts');
        const cartProductsList = existingCart ? JSON.parse(existingCart) : [];
        cartProductsList.push(productWithQuantity);
        await AsyncStorage.setItem('cartProducts', JSON.stringify(cartProductsList));
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
      showNotification(error.response?.data?.message || "Error adding to cart", "error");
      setAddingToCartId(null);
    }
  }, [cartProducts, navigation, showNotification]);

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
      const userDataStr = await AsyncStorage.getItem('userData');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const userId = userData?.user_id;

      if (!token || !userId) {
        showNotification("Please login to manage favorites", "warning");
        navigation.navigate('Login'); 
        return;
      }

      const isAlreadyFavorite = favoriteProducts.includes(product.product_id);

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

        setFavoriteProducts(prev => prev.filter(id => id !== product.product_id));
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

        setFavoriteProducts(prev => [...prev, product.product_id]);
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
  }, [favoriteProducts, navigation, showNotification]);

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

  const showQuickView = (product) => {
    navigation.navigate('ProductDetail', { 
      productId: product.product_id, 
      productName: product.name 
    }); 
  };

  const renderGuide = () => {
    if (!showGuide) return null;

    const currentStep = guideSteps[currentGuideStep];
    const spotlightSize = 80;

    return (
      <Animated.View 
        style={[
          styles.guideOverlay,
          { opacity: fadeAnim }
        ]}
      >
        {/* Pulse effect */}
        <Animated.View
          style={[
            styles.pulseAnimation,
            {
              ...currentStep.position,
              width: spotlightSize * 1.5,
              height: spotlightSize * 1.5,
              backgroundColor: isDarkMode ? 'rgba(79, 165, 245, 0.2)' : 'rgba(79, 165, 245, 0.2)',
              transform: [{ scale: pulseAnim }]
            }
          ]}
        />
        
        {/* Main spotlight */}
        <Animated.View
          style={[
            styles.guideSpotlight,
            {
              width: spotlightSize,
              height: spotlightSize,
              ...currentStep.position,
              transform: [
                {
                  scale: spotlightPosition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1]
                  })
                }
              ]
            }
          ]}
        />

        {/* Tooltip */}
        <View style={[styles.tooltipContainer, currentStep.position]}>
          <Animated.View
            style={[
              styles.tooltipIcon,
              {
                transform: [
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg']
                    })
                  }
                ]
              }
            ]}
          >
            <MaterialCommunityIcons
              name={currentStep.icon}
              size={24}
              color="#FFFFFF"
            />
          </Animated.View>

          <Text style={styles.tooltipText}>{currentStep.text}</Text>

          {/* Progress dots */}
          <View style={styles.guideProgress}>
            {guideSteps.map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.guideProgressDot,
                  currentGuideStep === index && styles.guideProgressDotActive,
                  {
                    transform: [
                      {
                        scale: currentGuideStep === index ? pulseAnim : 1
                      }
                    ]
                  }
                ]}
              />
            ))}
          </View>

          {/* Navigation button */}
          <TouchableOpacity
            style={styles.guideButton}
            onPress={() => {
              if (currentGuideStep < guideSteps.length - 1) {
                // Next step animation
                Animated.sequence([
                  Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true
                  }),
                  Animated.timing(spotlightPosition, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true
                  })
                ]).start(() => {
                  setCurrentGuideStep(currentGuideStep + 1);
                  Animated.parallel([
                    Animated.timing(fadeAnim, {
                      toValue: 1,
                      duration: 300,
                      useNativeDriver: true
                    }),
                    Animated.spring(spotlightPosition, {
                      toValue: 1,
                      tension: 50,
                      friction: 7,
                      useNativeDriver: true
                    })
                  ]).start();
                });
              } else {
                // Exit animation
                Animated.parallel([
                  Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true
                  }),
                  Animated.timing(spotlightPosition, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true
                  })
                ]).start(() => setShowGuide(false));
              }
            }}
          >
            <Text style={styles.guideButtonText}>
              {currentGuideStep < guideSteps.length - 1 ? 'Next' : 'Got it!'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      {renderWelcomeBanner()}
      {renderGuide()}
      <View style={styles.mainContainer}>
        {isSidebarVisible && (
          <View style={styles.sidebar}>
            <TouchableOpacity 
              style={[styles.themeToggle, isDarkMode ? styles.darkThemeToggle : styles.lightThemeToggle]} 
              onPress={toggleTheme}
            >
              <MaterialIcons 
                name={isDarkMode ? 'light-mode' : 'dark-mode'} 
                size={24} 
                color={isDarkMode ? '#FFFFFF' : '#000000'} 
              />
              <Text style={[styles.themeToggleText, isDarkMode ? styles.darkText : styles.lightText]}>
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </Text>
            </TouchableOpacity>
            <Sidebar onSelectCategory={handleSelectCategory} isDarkMode={isDarkMode} />
          </View>
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
                  onPress={() => navigation.navigate('Cart')}
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
                  onPress={() => navigation.navigate('Favorites')}
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
            showsVerticalScrollIndicator={false}
            bounces={true}
            overScrollMode="always"
          >
            <SearchBar onSelectProduct={() => {}} />
            <Text style={styles.sectionTitle}>Some of Our Collection</Text>
           
            {currentProduct && (
              <View style={styles.productContainer}>
                <TouchableOpacity style={[styles.navButton, styles.navButtonLeft]} onPress={showPreviousProduct}>
                  <FontAwesome name="chevron-left" size={24} color="#4FA5F5" />
                </TouchableOpacity>
                
                <View style={styles.card}>
                  <View style={styles.badgeContainer}>
                    {currentProduct.isNew && (
                      <View style={styles.badgeNew}>
                        <Text style={styles.badgeText}>New Arrival</Text>
                      </View>
                    )}
                    {currentProduct.isBestSeller && (
                      <View style={styles.badgeBestSeller}>
                        <Text style={styles.badgeText}>Best Seller</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.cardImageContainer}>
                    <Image
                      source={{ uri: currentProduct.image_url }}
                      style={styles.cardImage}
                    />
                  </View>
                  
                  <View style={styles.cardContentOverlay}>
                    <Text style={styles.cardTitle}>{currentProduct.name}</Text>
                    <Text style={styles.cardPrice}>${currentProduct.price}</Text>
                    <Text style={styles.stockStatus}>{currentProduct.stockStatus}</Text>
                    <TouchableOpacity style={styles.quickViewButton} onPress={() => showQuickView(currentProduct)}>
                      <Text style={styles.quickViewText}>Quick View</Text>
                    </TouchableOpacity>

                    <View style={styles.cardRatingContainer}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FontAwesome
                          key={`star-${star}`}
                          name={star <= currentProduct.rating ? "star" : "star-o"}
                          size={20}
                          color={star <= currentProduct.rating ? "#FFD700" : "#BDC3C7"}
                          style={{ marginHorizontal: 2 }}
                        />
                      ))}
                      <Text style={styles.ratingText}>{currentProduct.rating.toFixed(1)}</Text>
                      <Text style={styles.reviewCount}>({currentProduct.reviewCount} reviews)</Text>
                    </View>
                    
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={[
                          styles.favoriteButton,
                          favoriteProducts.includes(currentProduct.product_id) && styles.favoriteButtonActive
                        ]}
                        onPress={() => toggleFavorite(currentProduct)}
                      >
                        <Ionicons
                          name={favoriteProducts.includes(currentProduct.product_id) ? "heart" : "heart-dislike"} 
                          size={24} 
                          color={favoriteProducts.includes(currentProduct.product_id) ? "#FF4B4B" : "#4FA5F5"} 
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
                  </View>
                </View>
                
                <TouchableOpacity style={[styles.navButton, styles.navButtonRight]} onPress={showNextProduct}>
                  <FontAwesome name="chevron-right" size={24} color="#4FA5F5" />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.specialOffersHeader}>
              <Text style={styles.specialOffersTitle}>Special Offers</Text>
              <TouchableOpacity
                style={styles.viewAllButtonInline}
                onPress={() => navigation.navigate('AllDiscountedProducts')}
              >
                <Text style={styles.viewAllTextInline}>View All Offers</Text>
                <FontAwesome name="arrow-right" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            {discounts.map((discount) => {
              const discountedPrice = calculateDiscountedPrice(
                discount.price,
                discount.discount
              );
              const savings = discount.price - discountedPrice;
              return (
                <TouchableOpacity
                  key={discount.product_id}
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
                    <View style={styles.discountFeatures}>
                      <View style={styles.discountFeature}>
                        <Text style={styles.discountFeatureText}>Free Shipping</Text>
                      </View>
                      <View style={styles.discountFeature}>
                        <Text style={styles.discountFeatureText}>30-Day Return</Text>
                      </View>
                      <View style={styles.discountFeature}>
                        <Text style={styles.discountFeatureText}>Warranty Included</Text>
                      </View>
                    </View>
                    <Text style={styles.discountDescription} numberOfLines={2}>
                      {discount.description || 'Experience premium quality and exceptional value with this exclusive offer.'}
                    </Text>
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
                        <FontAwesome name="shopping-cart" size={20} color="#FFFFFF" />
                      )}
                    </Animated.View>
                  </TouchableOpacity>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountBadgeText}>{discount.discount}%</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
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