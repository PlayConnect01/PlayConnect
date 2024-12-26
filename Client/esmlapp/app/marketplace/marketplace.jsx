import React, { useEffect, useState, useCallback } from "react";
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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SearchBar from './SearchBar';
import Sidebar from './Sidebar';
import {BASE_URL} from '../../api';
import { Ionicons } from '@expo/vector-icons';

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
  const [showMessage, setShowMessage] = useState("");
  const [cartProducts, setCartProducts] = useState([]);

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
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCartCount();
  }, [fetchProducts, fetchCartCount]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([fetchProducts(), fetchCartCount()]).then(() =>
      setRefreshing(false)
    );
  }, [fetchProducts, fetchCartCount]);

  const addToCart = useCallback(async (product) => {
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

      // If product is already in cart, navigate to product detail
      if (cartProducts.some(item => item.product_id === product.product_id)) {
        navigation.navigate('ProductDetail', { productId: product.product_id });
        return;
      }

      setLoading(true);

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
          quantity: 1
        };
        cartProductsList.push(productWithQuantity);
        await AsyncStorage.setItem('cartProducts', JSON.stringify(cartProductsList));
        setCartProducts(cartProductsList);
        setCartCount(prevCount => prevCount + 1);
        setShowMessage(`${product.name} added to cart! 🛒`);
        setTimeout(() => setShowMessage(""), 2000);
        navigation.navigate('ProductDetail', { productId: product.product_id });
      } else {
        setShowMessage("Failed to add product to cart");
        setTimeout(() => setShowMessage(""), 2000);
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
      setShowMessage(error.response?.data?.message || "Error adding to cart. Please try again.");
      setTimeout(() => setShowMessage(""), 2000);
    } finally {
      setLoading(false);
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
        setShowMessage("Please login to add favorites");
        setTimeout(() => setShowMessage(""), 2000);
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
          setShowMessage("Removed from favorites ❌");
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
          setShowMessage("Added to favorites ❤️");
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error.response?.data || error.message);
      setShowMessage(error.response?.data?.message || "Failed to update favorites");
    } finally {
      const timeout = setTimeout(() => setShowMessage(""), 2000);
      return () => clearTimeout(timeout);
    }
  }, [favoriteProducts]);
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        {isSidebarVisible && (
          <Sidebar onSelectCategory={handleSelectCategory} />
        )}
        <View style={styles.contentContainer}>
          <TouchableOpacity onPress={toggleSidebar} style={styles.toggleButton}>
            <FontAwesome
              name={isSidebarVisible ? "times" : "bars"}
              size={24}
              color="#333"
            />
          </TouchableOpacity>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View style={styles.header}>
              <View style={styles.headerGradient} />
              <Text style={styles.headerTitle}>Marketplace</Text>
              <View style={styles.iconContainer}>
                <View style={styles.iconContainerGradient} />
                <TouchableOpacity
                  onPress={() => navigation.navigate('CartScreen')}
                  style={styles.iconButton}
                >
                  <View style={styles.iconButtonGradient} />
                  <FontAwesome name="shopping-cart" size={24} color="#333" />
                  <View style={styles.cartCountContainer}>
                    <Text style={styles.cartCount}>{cartCount}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => navigation.navigate('FavoritesScreen')}
                >
                  <View style={styles.iconButtonGradient} />
                  <FontAwesome name="heart-o" size={24} color="#333" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.searchSection}>
              <SearchBar onSelectProduct={() => {}} />
            </View>

            <Text style={styles.sectionTitle}>Featured Collection</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.cardContainer}
            >
              {products.map((product, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.card}
                  onPress={() => navigation.navigate('ProductDetail', { productId: product.product_id })}
                >
                  <View style={styles.cardGradient} />
                  <View style={styles.cardImageContainer}>
                    <View style={styles.cardImageBorder} />
                    <Image
                      source={{ uri: product.image_url }}
                      style={styles.cardImage}
                    />
                    <View style={styles.cardImageOverlay} />
                  </View>
                  <Text style={styles.cardTitle}>{product.name}</Text>
                  <Text style={styles.cardPrice}>${product.price}</Text>
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.cartButton}
                      onPress={() => addToCart(product)}
                    >
                      <FontAwesome
                        name={cartProducts.some(item => item.product_id === product.product_id) ? "check" : "shopping-cart"}
                        size={20}
                        color="#fff"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.favoriteButton,
                        favoriteProducts.includes(product.product_id) &&
                          styles.favoriteButtonActive,
                      ]}
                      onPress={() => toggleFavorite(product)}
                    >
                      <Ionicons
                        name={favoriteProducts.includes(product.product_id) ? "heart" : "heart-outline"}
                        size={20}
                        color={favoriteProducts.includes(product.product_id) ? "red" : "gray"}
                      />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>Special Offers</Text>
            {discounts.map((discount, index) => {
              const discountedPrice = calculateDiscountedPrice(
                discount.price,
                discount.discount
              );
              const savings = discount.price - discountedPrice;
              return (
                <View key={index} style={styles.discountItem}>
                  <View style={styles.discountItemGradient} />
                  <View style={styles.discountImageContainer}>
                    <View style={styles.discountImageBorder} />
                    <Image
                      source={{ uri: discount.image_url }}
                      style={styles.discountImage}
                    />
                    <View style={styles.discountImageOverlay} />
                  </View>
                  <View style={styles.discountInfo}>
                    <Text style={styles.discountTitle}>{discount.name}</Text>
                    <View style={styles.discountPriceContainer}>
                      <Text style={styles.discountPrice}>
                        ${discountedPrice.toFixed(2)}{" "}
                        <Text style={styles.discountOldPrice}>${discount.price}</Text>
                      </Text>
                    </View>
                    <Text style={styles.discountSavings}>
                      You save: ${savings.toFixed(2)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.discountCartButton}
                    onPress={() => addToCart(discount)}
                  >
                    <FontAwesome name="shopping-cart" size={20} color="#fff" />
                    <Text style={styles.discountCartButtonText}>Add</Text>
                  </TouchableOpacity>
                  <View style={styles.discountPercentage}>
                    <Text style={styles.discountPercentageText}>{discount.discount}%</Text>
                  </View>
                </View>
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

          {showMessage && (
            <View style={styles.messageContainer}>
              <Text style={styles.messageText}>{showMessage}</Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F7FF',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#F0F7FF',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 20,
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    overflow: 'hidden',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    backgroundColor: '#4FA5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    paddingVertical: 15,
    borderBottomWidth: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
    backgroundColor: '#FF69B4',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#4FA5F5',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(79, 165, 245, 0.15)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    zIndex: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    backgroundColor: '#F7FAFF',
    padding: 12,
    borderRadius: 20,
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  iconContainerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
    backgroundColor: '#FF69B4',
  },
  iconButton: {
    marginLeft: 20,
    position: 'relative',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    transform: [{ scale: 1 }],
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
  },
  iconButtonGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
    backgroundColor: '#FF69B4',
  },
  card: {
    width: 180,
    marginRight: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 4, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    transform: [{ scale: 1 }],
    borderWidth: 1,
    borderColor: 'rgba(79, 165, 245, 0.08)',
    position: 'relative',
    overflow: 'hidden',
  },
  cardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
    backgroundColor: '#FF69B4',
  },
  cardImageContainer: {
    position: 'relative',
    width: 150,
    height: 150,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(79, 165, 245, 0.1)',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    backgroundColor: '#F7FAFF',
  },
  cardImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(79, 165, 245, 0.05)',
    borderRadius: 16,
  },
  cardImageBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: 'rgba(255, 105, 180, 0.2)',
    borderRadius: 16,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    paddingVertical: 15,
    borderBottomWidth: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#4FA5F5',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(79, 165, 245, 0.15)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  iconContainer: {
    flexDirection: 'row',
    backgroundColor: '#F7FAFF',
    padding: 12,
    borderRadius: 20,
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  iconButton: {
    marginLeft: 20,
    position: 'relative',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    transform: [{ scale: 1 }],
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  cartCountContainer: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: '#FF69B4',
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cartCount: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginVertical: 24,
    color: '#2C5282',
    textAlign: 'center',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(66, 153, 225, 0.12)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  cardContainer: {
    marginBottom: 30,
    paddingHorizontal: 8,
  },
  card: {
    width: 180,
    marginRight: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#4299E1',
    shadowOffset: { width: 4, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    transform: [{ scale: 1 }],
    borderWidth: 1,
    borderColor: 'rgba(66, 153, 225, 0.08)',
  },
  cardImageContainer: {
    position: 'relative',
    width: 150,
    height: 150,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    backgroundColor: '#F7FAFF',
  },
  cardImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(49, 130, 206, 0.05)',
    borderRadius: 16,
  },
  cardBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF69B4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 10,
  },
  cardBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginVertical: 6,
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 22,
  },
  cardPrice: {
    color: '#4FA5F5',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 0.8,
    textShadowColor: 'rgba(79, 165, 245, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
    paddingHorizontal: 6,
  },
  cartButton: {
    backgroundColor: '#4FA5F5',
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    transform: [{ scale: 1 }],
  },
  favoriteButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#4299E1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    transform: [{ scale: 1 }],
  },
  favoriteButtonActive: {
    backgroundColor: '#FFF0F7',
    borderColor: '#FF69B4',
    shadowColor: '#FF69B4',
    shadowOpacity: 0.2,
    transform: [{ scale: 1.05 }],
  },
  discountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#4299E1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(66, 153, 225, 0.08)',
  },
  discountImageContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
  },
  discountImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  discountImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(49, 130, 206, 0.05)',
    borderRadius: 12,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF69B4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  discountInfo: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 8,
  },
  discountTitle: {
    fontWeight: '600',
    color: '#2D3748',
    fontSize: 16,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  discountPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  discountPrice: {
    color: '#4FA5F5',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(79, 165, 245, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  discountOldPrice: {
    textDecorationLine: 'line-through',
    color: '#A0AEC0',
    fontSize: 14,
    marginLeft: 6,
  },
  discountSavings: {
    color: '#FF69B4',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
    backgroundColor: 'rgba(255, 105, 180, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  discountPercentage: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FF69B4',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    transform: [{ rotate: '12deg' }],
  },
  discountPercentageText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  discountCartButton: {
    backgroundColor: '#4FA5F5',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    minWidth: 80,
    borderWidth: 1,
    borderColor: 'rgba(79, 165, 245, 0.1)',
  },
  discountCartButtonText: {
    color: '#FFFFFF',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  viewAllButton: {
    backgroundColor: '#4FA5F5',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginVertical: 25,
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  viewAllText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
  },
  toggleButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  messageContainer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(49, 130, 206, 0.95)',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#2B6CB0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    backdropFilter: 'blur(8px)',
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(247, 250, 255, 0.95)',
    backdropFilter: 'blur(12px)',
  }
});

export default Marketplace;