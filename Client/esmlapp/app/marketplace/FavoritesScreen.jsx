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
  Animated,
  RefreshControl,
  Dimensions
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from "../../Api";
import { Share, Platform, Modal, TextInput } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Easing } from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = width / 2 - 24;

const FavoritesScreen = () => {
  const navigation = useNavigation();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showMessage, setShowMessage] = useState("");
  const [sortOption, setSortOption] = useState('date'); // 'date', 'price', 'name', 'rating'
  const [filterQuery, setFilterQuery] = useState('');
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const userDataStr = await AsyncStorage.getItem('userData');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const userId = userData?.user_id;

      if (!token || !userId) {
        setToast({ visible: true, message: "Please login to view favorites", type: 'error' });
        navigation.navigate('Login');
        return;
      }

      const response = await axios.get(
        `${BASE_URL}/favorites/favorites/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setFavorites(response.data);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      setToast({ visible: true, message: "Failed to load favorites", type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFavorites().finally(() => setRefreshing(false));
  }, [fetchFavorites]);

  const removeFromFavorites = useCallback(async (favorite) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userDataStr = await AsyncStorage.getItem('userData');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const userId = userData?.user_id;

      if (!token || !userId) {
        setToast({ visible: true, message: "Please login to manage favorites", type: 'error' });
        navigation.navigate('Login');
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

      setFavorites(prevFavorites => 
        prevFavorites.filter(fav => fav.favorite_id !== favorite.favorite_id)
      );
      setToast({ visible: true, message: "Removed from favorites!", type: 'success' });
      setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 2000);
    } catch (error) {
      console.error("Error removing from favorites:", error);
      setToast({ visible: true, message: "Failed to remove from favorites", type: 'error' });
      setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 2000);
    }
  }, [navigation]);

  const navigateToProduct = useCallback((product) => {
    if (product && product.product_id) {
      navigation.navigate('ProductDetail', {
        productId: product.product_id,
        product: product
      });
    }
  }, [navigation]);

  const shareProduct = async (product) => {
    try {
      if (Platform.OS === 'ios') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      await Share.share({
        message: `Check out ${product.name} on SportsMate! Price: $${product.price}`,
        url: product.image_url,
        title: 'Share Product'
      });
    } catch (error) {
      console.error('Error sharing product:', error);
      setToast({ visible: true, message: 'Failed to share product', type: 'error' });
    }
  };

  const addToCart = async (product) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userDataStr = await AsyncStorage.getItem('userData');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const userId = userData?.user_id;

      if (!token || !userId) {
        setToast({ visible: true, message: "Please login to add to cart", type: 'error' });
        navigation.navigate('Login');
        return;
      }

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
        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        setToast({ visible: true, message: 'Added to cart successfully!', type: 'success' });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setToast({ visible: true, message: 'Failed to add to cart', type: 'error' });
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/sports`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const sortFavorites = (items) => {
    return [...items].sort((a, b) => {
      switch (sortOption) {
        case 'price':
          return a.product.price - b.product.price;
        case 'name':
          return a.product.name.localeCompare(b.product.name);
        case 'rating':
          return (b.product.rating || 0) - (a.product.rating || 0);
        case 'date':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });
  };

  const filterFavorites = (items) => {
    return items.filter(item => {
      const matchesQuery = !filterQuery || 
        item.product.name.toLowerCase().includes(filterQuery.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || 
        selectedCategories.includes(item.product.sport?.name);
      const matchesPrice = item.product.price >= priceRange.min && 
        item.product.price <= priceRange.max;
      return matchesQuery && matchesCategory && matchesPrice;
    });
  };

  const CustomToast = ({ message, type, onHide }) => {
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.9)).current;

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

      // Hide after delay
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
      }, 2500);

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
        case 'info':
          return {
            backgroundColor: '#4FA5F5',
            icon: 'info-outline',
            title: 'Info',
            gradient: ['#4FA5F5', '#818CF8']
          };
        default:
          return {
            backgroundColor: '#4FA5F5',
            icon: 'check-circle-outline',
            title: 'Success',
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
        <View style={[styles.notificationBar, { backgroundColor: toastStyle.backgroundColor }]}>
          <View style={styles.notificationHeader}>
            <MaterialIcons 
              name="notifications" 
              size={14} 
              color="#FFF" 
              style={styles.notificationIcon} 
            />
            <Text style={styles.appName}>SportsMate</Text>
            <Text style={styles.timeText}>now</Text>
          </View>
        </View>
        <View style={[styles.toastContent, { backgroundColor: toastStyle.backgroundColor }]}>
          <View style={styles.iconContainer}>
            <MaterialIcons name={toastStyle.icon} size={28} color="#FFFFFF" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.toastTitle}>{toastStyle.title}</Text>
            <Text style={styles.toastText}>{message}</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <FontAwesome key={`star-${i}`} name="star" size={14} color="#FFB800" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <FontAwesome key={`star-${i}`} name="star-half-o" size={14} color="#FFB800" />
        );
      } else {
        stars.push(
          <FontAwesome key={`star-${i}`} name="star-o" size={14} color="#FFB800" />
        );
      }
    }
    return stars;
  };

  const renderSortModal = () => (
    <Modal
      visible={showSortModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowSortModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sort By</Text>
            <TouchableOpacity onPress={() => setShowSortModal(false)}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          {[
            { id: 'date', label: 'Date Added', icon: 'schedule' },
            { id: 'price', label: 'Price', icon: 'attach-money' },
            { id: 'name', label: 'Name', icon: 'sort-by-alpha' },
            { id: 'rating', label: 'Rating', icon: 'star' }
          ].map(option => (
            <TouchableOpacity
              key={`sort-${option.id}`}
              style={[
                styles.sortOption,
                sortOption === option.id && styles.sortOptionSelected
              ]}
              onPress={() => {
                setSortOption(option.id);
                setShowSortModal(false);
              }}
            >
              <MaterialIcons
                name={option.icon}
                size={24}
                color={sortOption === option.id ? '#4FA5F5' : '#666'}
              />
              <Text style={[
                styles.sortOptionText,
                sortOption === option.id && styles.sortOptionTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.filterSectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoryChips}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    selectedCategories.includes(category.name) && styles.categoryChipSelected
                  ]}
                  onPress={() => {
                    setSelectedCategories(prev =>
                      prev.includes(category.name)
                        ? prev.filter(c => c !== category.name)
                        : [...prev, category.name]
                    );
                  }}
                >
                  <Text style={[
                    styles.categoryChipText,
                    selectedCategories.includes(category.name) && styles.categoryChipTextSelected
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <Text style={styles.filterSectionTitle}>Price Range</Text>
          <View style={styles.priceInputContainer}>
            <TextInput
              style={styles.priceInput}
              placeholder="Min"
              keyboardType="numeric"
              value={priceRange.min.toString()}
              onChangeText={text => setPriceRange(prev => ({ ...prev, min: Number(text) || 0 }))}
            />
            <Text style={styles.priceInputSeparator}>to</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="Max"
              keyboardType="numeric"
              value={priceRange.max.toString()}
              onChangeText={text => setPriceRange(prev => ({ ...prev, max: Number(text) || 0 }))}
            />
          </View>

          <TouchableOpacity
            style={styles.applyFilterButton}
            onPress={() => setShowFilterModal(false)}
          >
            <Text style={styles.applyFilterButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ visible: false, message: '', type: 'success' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <FontAwesome name="arrow-left" size={24} style={styles.backButtonIcon} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>My Collection</Text>

          <TouchableOpacity 
            style={styles.infoButton}
            onPress={() => {
              // Your info button logic here
            }}
          >
            <FontAwesome name="info-circle" size={24} style={styles.infoIcon} />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowFilterModal(true)}
            >
              <MaterialIcons name="filter-list" size={24} color="#4FA5F5" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowSortModal(true)}
            >
              <MaterialIcons name="sort" size={24} color="#4FA5F5" />
            </TouchableOpacity>
          </View>
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" color="#4FA5F5" />
        ) : favorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Animated.View style={[styles.emptyIcon, { transform: [{ scale: 1.2 }] }]} >
              <FontAwesome name="heart-o" size={80} color="#4FA5F5" />
            </Animated.View>
            <Text style={styles.emptyText}>
              Start building your collection by adding favorites from the marketplace
            </Text>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => navigation.navigate('Marketplace')}
            >
              <Text style={styles.exploreButtonText}>Explore Marketplace</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View style={styles.cardContainer}>
              {sortFavorites(filterFavorites(favorites)).map((favorite) => (
                <TouchableOpacity
                  key={`product-${favorite.favorite_id}`}
                  onPress={() => navigateToProduct(favorite.product)}
                  activeOpacity={0.7}
                >
                  <Animated.View style={styles.productCard}>
                    <View style={styles.imageContainer}>
                      {favorite.product?.discount > 0 && (
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountText}>
                            -{favorite.product.discount}% OFF
                          </Text>
                        </View>
                      )}
                      <Image
                        source={{ uri: favorite.product?.image_url }}
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={[styles.favoriteButton, styles.favoriteButtonActive]}
                        onPress={() => removeFromFavorites(favorite)}
                      >
                        <FontAwesome name="heart" size={20} color="#DC2626" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.shareButton}
                        onPress={() => shareProduct(favorite.product)}
                      >
                        <MaterialIcons name="share" size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={2}>
                        {favorite.product?.name}
                      </Text>
                      <View style={styles.ratingContainer}>
                        <View style={styles.ratingStars}>
                          {renderRatingStars(favorite.product?.rating || 0)}
                        </View>
                        <Text style={styles.ratingCount}>
                          ({favorite.product?.rating_count || 0})
                        </Text>
                      </View>
                      <View style={styles.priceContainer}>
                        <View style={styles.priceInfo}>
                          <Text style={styles.discountedPrice}>
                            ${favorite.product?.price.toFixed(2)}
                          </Text>
                          {favorite.product?.original_price && (
                            <Text style={styles.originalPrice}>
                              ${favorite.product.original_price.toFixed(2)}
                            </Text>
                          )}
                        </View>
                        {favorite.product?.discount > 0 && (
                          <View style={styles.savingsContainer}>
                            <Text style={styles.savingsText}>
                              {favorite.product.discount}% off
                            </Text>
                          </View>
                        )}
                      </View>
                      <TouchableOpacity
                        style={styles.addToCartButton}
                        onPress={() => addToCart(favorite.product)}
                      >
                        <MaterialIcons name="shopping-cart" size={20} color="#FFFFFF" />
                        <Text style={styles.buttonText}>Add to Cart</Text>
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
      
      {toast.visible && (
        <CustomToast
          message={toast.message}
          type={toast.type}
          onHide={hideToast}
        />
      )}
      {renderSortModal()}
      {renderFilterModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  mainContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2FF',
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  backButtonIcon: {
    color: '#4FA5F5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  infoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoIcon: {
    color: '#4FA5F5',
  },
  scrollContent: {
    paddingBottom: 24,
    paddingHorizontal: 8,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
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
  messageContainer: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    backgroundColor: '#4FA5F5',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    marginBottom: 20,
    opacity: 0.9,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.2,
    maxWidth: 260,
  },
  exploreButton: {
    marginTop: 24,
    backgroundColor: '#4FA5F5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sortOptionSelected: {
    backgroundColor: '#F3F4F6',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#4B5563',
    marginLeft: 12,
  },
  sortOptionTextSelected: {
    color: '#4FA5F5',
    fontWeight: '600',
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 12,
  },
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipSelected: {
    backgroundColor: '#4FA5F5',
    borderColor: '#4FA5F5',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#4B5563',
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
  },
  priceInputSeparator: {
    marginHorizontal: 12,
    color: '#6B7280',
  },
  applyFilterButton: {
    backgroundColor: '#4FA5F5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyFilterButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    shadowColor: '#4FA5F5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 9999,
  },
  notificationBar: {
    paddingTop: 4,
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  notificationIcon: {
    marginRight: 6,
    opacity: 0.95,
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    opacity: 0.95,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 13,
    marginLeft: 'auto',
    opacity: 0.8,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  toastTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
    opacity: 1,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.95,
    lineHeight: 18,
  },
});

export default FavoritesScreen;
