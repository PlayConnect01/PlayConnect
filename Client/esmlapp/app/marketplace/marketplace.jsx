import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import Icon from "react-native-vector-icons/FontAwesome";
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfirmationModal from './Confirmationadding';
import SearchBar from './SearchBar';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Navbar from "../navbar/Navbar";


const Marketplace = () => {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [itemToAdd, setItemToAdd] = useState(null);
  const [animation] = useState(new Animated.Value(1));
  const [refreshing, setRefreshing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const allProductsResponse = await axios.get(
        "http://192.168.11.115:3000/product/discounted"
      );
      setProducts(allProductsResponse.data);

      const topDiscountedResponse = await axios.get(
        "http://192.168.11.115:3000/product/discounted/top-three"
      );
      setDiscounts(topDiscountedResponse.data);

    
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartCount = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');
      if (token && userId) {
        const response = await axios.get(`http://192.168.11.115:3000/cart/count/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCartCount(response.data.count);
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCartCount();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts().then(() => setRefreshing(false));
    fetchCartCount();
  }, []);

  const addToCart = (product) => {
    setItemToAdd(product);
    setModalVisible(true);
  };

  const confirmAddToCart = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      let userId = await AsyncStorage.getItem('userId');
      userId = JSON.parse(userId);

      if (!token || !userId) {
        console.error("User token or ID is missing.");
        return;
      }

      if (!itemToAdd || !itemToAdd.product_id || !itemToAdd.price) {
        console.error("Invalid product details.");
        return;
      }

      setCartCount(prevCount => prevCount + 1);
      setLoading(true);

      const response = await axios.post(
        'http://192.168.11.115:3000/cart/cart/add',
        {
          userId: userId,
          productId: itemToAdd.product_id,
          quantity: 1,
          price: itemToAdd.price,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        console.log("Product added to cart:", response.data);
      } else {
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
  };

  const calculateDiscountedPrice = (price, discount) => {
    const originalPrice = parseFloat(price);
    const discountValue = parseFloat(discount);
    if (isNaN(originalPrice) || isNaN(discountValue)) {
      console.error("Invalid price or discount value");
      return 0;
    }
    return originalPrice - (originalPrice * (discountValue / 100));
  };

  const handleSelectProduct = (product) => {
    console.log("Selected product:", product);
  };

  const animateTab = () => {
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        <View style={styles.contentContainer}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View style={styles.header}>
              <TouchableOpacity>
                <Text style={styles.menuIcon}>
                  <Icon name="bars" size={24} color="#000" />
                </Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Marketplace</Text>
              <View style={styles.iconContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('CartScreen')}>
                  <Icon name="shopping-cart" size={24} color="#000" />
                  <Text style={styles.cartCount}>{cartCount}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.favoriteIcon}>
                  <Icon name="heart-o" size={24} color="#000" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.searchSection}>
              <SearchBar onSelectProduct={handleSelectProduct} />
            </View>

          
            <Text style={styles.sectionTitle}>Discover</Text>
            <ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  style={styles.tabContainer}
>
  <TouchableOpacity
    onPress={() => { animateTab(); navigation.navigate("products"); }}
    style={styles.sportTab}
  >
    <Animated.View style={{ transform: [{ scale: animation }] }}>
      <MaterialIcons name="fitness-center" size={24} color="#FF1493" />
      <Text style={styles.inactiveTab}>Gym</Text>
    </Animated.View>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => { animateTab(); navigation.navigate("products"); }}
    style={styles.sportTab}
  >
    <Animated.View style={{ transform: [{ scale: animation }] }}>
      <MaterialIcons name="sports-cricket" size={24} color="#4169E1" />
      <Text style={styles.inactiveTab}>Cricket</Text>
    </Animated.View>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => { animateTab(); navigation.navigate("products"); }}
    style={styles.sportTab}
  >
    <Animated.View style={{ transform: [{ scale: animation }] }}>
      <MaterialIcons name="rowing" size={24} color="#00CED1" />
      <Text style={styles.inactiveTab}>Rowing</Text>
    </Animated.View>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => { animateTab(); navigation.navigate("products"); }}
    style={styles.sportTab}
  >
    <Animated.View style={{ transform: [{ scale: animation }] }}>
      <MaterialIcons name="skateboarding" size={24} color="#87CEEB" />
      <Text style={styles.inactiveTab}>Skating</Text>
    </Animated.View>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => { animateTab(); navigation.navigate("products"); }}
    style={styles.sportTab}
  >
    <Animated.View style={{ transform: [{ scale: animation }] }}>
      <MaterialIcons name="sports-esports" size={24} color="#9932CC" />
      <Text style={styles.inactiveTab}>E-Sports</Text>
    </Animated.View>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => { animateTab(); navigation.navigate("products"); }}
    style={styles.sportTab}
  >
    <Animated.View style={{ transform: [{ scale: animation }] }}>
      <MaterialIcons name="emoji-events" size={24} color="#FF4500" />
      <Text style={styles.inactiveTab}>Trophies</Text>
    </Animated.View>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => { animateTab(); navigation.navigate("products"); }}
    style={styles.sportTab}
  >
    <Animated.View style={{ transform: [{ scale: animation }] }}>
      <MaterialIcons name="directions-walk" size={24} color="#32CD32" />
      <Text style={styles.inactiveTab}>Walking</Text>
    </Animated.View>
  </TouchableOpacity>

  {/* Additional Sports */}
  <TouchableOpacity
    onPress={() => { animateTab(); navigation.navigate("products"); }}
    style={styles.sportTab}
  >
    <Animated.View style={{ transform: [{ scale: animation }] }}>
      <MaterialIcons name="sports-football" size={24} color="#FFA500" />
      <Text style={styles.inactiveTab}>Football</Text>
    </Animated.View>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => { animateTab(); navigation.navigate("products"); }}
    style={styles.sportTab}
  >
    <Animated.View style={{ transform: [{ scale: animation }] }}>
      <MaterialIcons name="sports-basketball" size={24} color="#FF4500" />
      <Text style={styles.inactiveTab}>Basketball</Text>
    </Animated.View>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => { animateTab(); navigation.navigate("products"); }}
    style={styles.sportTab}
  >
    <Animated.View style={{ transform: [{ scale: animation }] }}>
      <MaterialIcons name="sports-baseball" size={24} color="#00BFFF" />
      <Text style={styles.inactiveTab}>Baseball</Text>
    </Animated.View>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => { animateTab(); navigation.navigate("products"); }}
    style={styles.sportTab}
  >
    <Animated.View style={{ transform: [{ scale: animation }] }}>
      <MaterialIcons name="sports-hockey" size={24} color="#FF6347" />
      <Text style={styles.inactiveTab}>Hockey</Text>
    </Animated.View>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => { animateTab(); navigation.navigate("products"); }}
    style={styles.sportTab}
  >
    <Animated.View style={{ transform: [{ scale: animation }] }}>
      <MaterialIcons name="sports-mma" size={24} color="#800080" />
      <Text style={styles.inactiveTab}>MMA</Text>
    </Animated.View>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => { animateTab(); navigation.navigate("products"); }}
    style={styles.sportTab}
  >
    <Animated.View style={{ transform: [{ scale: animation }] }}>
      <MaterialIcons name="sports-tennis" size={24} color="#ADFF2F" />
      <Text style={styles.inactiveTab}>Tennis</Text>
    </Animated.View>
  </TouchableOpacity>
</ScrollView>

           

            <Text style={styles.sectionTitle}>Our Collection 🎉🛍️</Text>
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
                      <Icon name="shopping-cart" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.favoriteButton}
                      onPress={() => {
                        /* Toggle favorite logic */
                      }}
                    >
                      <Icon name="heart-o" size={20} color="#ff3b8f" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
                
              ))}
              
            </ScrollView>

            <Text style={styles.sectionTitle}>Hot Deals! 🔥💰</Text>
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
                    <Icon name="shopping-cart" size={20} color="#fff" />
                    <Text style={styles.discountCartButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('AllDiscountedProducts')}
            >
              <Text style={styles.viewAllText}>View All Deals! 👀</Text>
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
            message={`Great choice! Do you want to add ${itemToAdd ? itemToAdd.name : ''} to your cart? 🛒✨`}
          />
        </View>
        <View style={styles.navbarContainer}>
          <Navbar />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({

  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 15,
    color: '#333',
    textAlign: 'left',
  },
  cardContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingVertical: 10,
  },
  card: {
    width: 180,
    marginRight: 15,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#6e3de8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    transition: '0.3s ease-in-out',
  },
  cardHovered: {
    transform: [{ scale: 1.05 }],
    shadowOpacity: 0.5,
  },
  cardImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
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
    elevation: 2,
    transition: '0.2s ease-in-out',
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
    elevation: 2,
    transition: '0.2s ease-in-out',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  navbarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIcon: {
    fontSize: 24,
    color: "#000",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#6e3de8",
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cartCount: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: '#ff3b8f',
    borderRadius: 10,
    paddingHorizontal: 5,
    color: '#fff',
    fontSize: 12,
  },
  favoriteIcon: {
    marginLeft: 15,
  },
  searchSection: {
    marginTop: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 15,
    color: '#333',
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  sportTab: {
    alignItems: "center",
    marginRight: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  inactiveTab: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
    textAlign: "center",
  },
  cardContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  card: {
    width: 180,
    marginRight: 15,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 15,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#6e3de8",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  cardImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3436",
    marginVertical: 6,
    textAlign: "center",
  },
  cardPrice: {
    color: "#6e3de8",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  cartButton: {
    backgroundColor: "#6e3de8",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
  },
  favoriteButton: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderColor: "#ff3b8f",
    borderWidth: 1,
  },
  featuredCard: {
    width: 300,
    marginRight: 20,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  featuredCardImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  featuredCardContent: {
    padding: 15,
  },
  featuredCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  featuredCardPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6e3de8",
    marginBottom: 10,
  },
  featuredCartButton: {
    backgroundColor: "#6e3de8",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  featuredCartButtonText: {
    color: "#fff",
    marginLeft: 5,
    fontSize: 16,
    fontWeight: "bold",
  },
  discountItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 15,
    elevation: 4,
    shadowColor: "#6e3de8",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  discountImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  discountInfo: {
    flex: 1,
    marginLeft: 15,
  },
  discountTitle: {
    fontWeight: "bold",
    color: "#333",
    fontSize: 16,
    marginBottom: 5,
  },
  discountPrice: {
    color: "#6e3de8",
    fontSize: 18,
    fontWeight: "bold",
  },
  discountOldPrice: {
    textDecorationLine: "line-through",
    color: "#999",
    fontSize: 14,
  },
  discountSavings: {
    color: "#4CAF50",
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
    backgroundColor: "#6e3de8",
    borderRadius: 8,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  discountCartButtonText: {
    color: "#fff",
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "bold",
  },
  viewAllButton: {
    backgroundColor: '#6A5AE0',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginVertical: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  viewAllText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Marketplace;

