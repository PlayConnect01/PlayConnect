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
import ConfirmationModal from './Confirmationadding';
import SearchBar from './SearchBar';
import Sidebar from './Sidebar';
import { BASE_URL } from '../../.env';


const Marketplace = () => {
  const navigation = useNavigation();   
  const [products, setProducts] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [itemToAdd, setItemToAdd] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const [allProductsResponse, topDiscountedResponse] = await Promise.all([
        axios.get(`${BASE_URL}/product/discounted`),
        axios.get(`${BASE_URL}/product/discounted/top-three`)
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
    Promise.all([fetchProducts(), fetchCartCount()]).then(() => setRefreshing(false));
  }, [fetchProducts, fetchCartCount]);

  const addToCart = useCallback((product) => {
    setItemToAdd(product);
    setModalVisible(true);
  }, []);

  const confirmAddToCart = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');
      if (!token || !userId || !itemToAdd?.product_id || !itemToAdd?.price) {
        console.error("Invalid data for adding to cart");
        return;
      }

      setCartCount(prevCount => prevCount + 1);
      setLoading(true);

      const response = await axios.post(
        `${API_BASE_URL}/cart/cart/add`,
        {
          userId: JSON.parse(userId),
          productId: itemToAdd.product_id,
          quantity: 1,
          price: itemToAdd.price,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status !== 201) {
        console.error("Failed to add product to cart:", response.data);
        setCartCount(prevCount => prevCount - 1);
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
      setCartCount(prevCount => prevCount - 1);
    } finally {
      setLoading(false);
      setModalVisible(false);
    }
  }, [itemToAdd]);

  const calculateDiscountedPrice = useCallback((price, discount) => {
    const originalPrice = parseFloat(price);
    const discountValue = parseFloat(discount);
    return isNaN(originalPrice) || isNaN(discountValue)
      ? 0
      : originalPrice - (originalPrice * (discountValue / 100));
  }, []);

  const handleSelectCategory = useCallback((category) => {
    setSelectedCategory(category);
    // Here you would typically fetch products for the selected category
    console.log("Selected category:", category);
  }, []);

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        {isSidebarVisible && <Sidebar onSelectCategory={handleSelectCategory} />}
        <View style={styles.contentContainer}>
          <TouchableOpacity onPress={toggleSidebar} style={styles.toggleButton}>
            <FontAwesome name={isSidebarVisible ? "times" : "bars"} size={24} color="#333" />
          </TouchableOpacity>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Marketplace</Text>
              <View style={styles.iconContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('CartScreen')} style={styles.iconButton}>
                  <FontAwesome name="shopping-cart" size={24} color="#333" />
                  <View style={styles.cartCountContainer}>
                    <Text style={styles.cartCount}>{cartCount}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
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
                  onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
                >
                  <Image
                    source={{ uri: product.image_url }}
                    style={styles.cardImage}
                  />
                  <Text style={styles.cardTitle}>{product.name}</Text>
                  <Text style={styles.cardPrice}>${product.price}</Text>
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.cartButton}
                      onPress={() => addToCart(product)}
                    >
                      <FontAwesome name="shopping-cart" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.favoriteButton}>
                      <FontAwesome name="heart-o" size={20} color="#ff3b8f" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>Special Offers</Text>
            {discounts.map((discount, index) => {
              const discountedPrice = calculateDiscountedPrice(discount.price, discount.discount);
              const savings = discount.price - discountedPrice;
              return (
                <View key={index} style={styles.discountItem}>
                  <Image
                    source={{ uri: discount.image_url }}
                    style={styles.discountImage}
                  />
                  <View style={styles.discountInfo}>
                    <Text style={styles.discountTitle}>{discount.name}</Text>
                    <Text style={styles.discountPrice}>
                      ${discountedPrice.toFixed(2)}{" "}
                      <Text style={styles.discountOldPrice}>${discount.price}</Text>
                    </Text>
                    <Text style={styles.discountSavings}>
                      You save: ${savings.toFixed(2)}
                    </Text>
                    <Text style={styles.discountPercentage}>
                      {discount.discount}% OFF
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.discountCartButton}
                    onPress={() => addToCart(discount)}
                  >
                    <FontAwesome name="shopping-cart" size={20} color="#fff" />
                    <Text style={styles.discountCartButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('AllDiscountedProducts')}
            >
              <Text style={styles.viewAllText}>View All Offers</Text>
            </TouchableOpacity>
          </ScrollView>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6e3de8" />
            </View>
          )}

          <ConfirmationModal
            visible={isModalVisible}
            onConfirm={confirmAddToCart}
            onCancel={() => setModalVisible(false)}
            message={`Do you want to add ${itemToAdd ? itemToAdd.name : ''} to your cart?`}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  iconContainer: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 15,
    position: 'relative',
  },
  cartCountContainer: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff3b8f',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 15,
    color: '#333',
  },
  cardContainer: {
    marginBottom: 20,
  },
  card: {
    width: 180,
    marginRight: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginVertical: 6,
    textAlign: 'center',
  },
  cardPrice: {
    color: '#6e3de8',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  cartButton: {
    backgroundColor: '#6e3de8',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  favoriteButton: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderColor: '#ff3b8f',
    borderWidth: 1,
  },
  discountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  discountImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  discountInfo: {
    flex: 1,
    marginLeft: 15,
  },
  discountTitle: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 16,
    marginBottom: 5,
  },
  discountPrice: {
    color: '#6e3de8',
    fontSize: 18,
    fontWeight: 'bold',
  },
  discountOldPrice: {
    textDecorationLine: 'line-through',
    color: '#999',
    fontSize: 14,
  },
  discountSavings: {
    color: '#4CAF50',
    fontSize: 14,
    marginTop: 2,
  },
  discountPercentage: {
    color: '#ff0000',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  discountCartButton: {
    backgroundColor: '#6e3de8',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountCartButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
    fontWeight: 'bold',
  },
  viewAllButton: {
    backgroundColor: '#6A5AE0',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  viewAllText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default Marketplace;
