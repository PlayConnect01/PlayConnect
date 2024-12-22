import React, { useEffect, useState } from "react";
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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import Icon from "react-native-vector-icons/FontAwesome";
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfirmationModal from './Confirmationadding'; // Import the confirmation modal
import SearchBar from './SearchBar'; // Import the SearchBar component
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // Import Material Icons
import { WebView } from 'react-native-webview';

const Marketplace = () => {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [itemToAdd, setItemToAdd] = useState(null); // State for the item to add
  const [animation] = useState(new Animated.Value(1)); // State for animation

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const allProductsResponse = await axios.get(
          "http://192.168.1.101:3000/product/discounted"
        );
        setProducts(allProductsResponse.data);

        const topDiscountedResponse = await axios.get(
          "http://192.168.1.101:3000/product/discounted/top-three"
        );
        setDiscounts(topDiscountedResponse.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
    fetchCartCount(); // Fetch the cart count when the component mounts
  }, []);

  const fetchCartCount = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');
      if (token && userId) {
        const response = await axios.get(`http://192.168.1.101:3000/cart/count/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCartCount(response.data.count); // Update the cart count state
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  const addToCart = (product) => {
    setItemToAdd(product);
    setModalVisible(true); // Show confirmation modal
  };

  const confirmAddToCart = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken'); // Retrieve user token
      let userId = await AsyncStorage.getItem('userId'); // Retrieve user ID
      userId = JSON.parse(userId);

      // Check if user is authenticated
      if (!token || !userId) {
        console.error("User token or ID is missing.");
        return; // Exit if user is not authenticated
      }

      // Validate product details
      if (!itemToAdd || !itemToAdd.product_id || !itemToAdd.price) {
        console.error("Invalid product details.");
        return; // Exit if product details are invalid
      }

      // Optimistically update the cart count
      setCartCount(prevCount => prevCount + 1);
      setLoading(true); // Set loading to true

      const response = await axios.post(
        'http://192.168.1.101:3000/cart/cart/add',
        {
          userId: userId,
          productId: itemToAdd.product_id,
          quantity: 1, // Default quantity to 1
          price: itemToAdd.price,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Check response status
      if (response.status === 201) {
        console.log("Product added to cart:", response.data);
      } else {
        console.error("Failed to add product to cart:", response.data);
        // Optionally revert the optimistic update if the request fails
        setCartCount(prevCount => prevCount - 1);
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
      // Optionally revert the optimistic update if the request fails
      setCartCount(prevCount => prevCount - 1);
    } finally {
      setLoading(false); // Set loading to false
      setModalVisible(false); // Close the modal
    }
 ;
  }  
  const calculateDiscountedPrice = (price, discount) => {
    // Ensure price and discount are numbers
    const originalPrice = parseFloat(price);
    const discountValue = parseFloat(discount);
     // Check if the values are valid numbers
    if (isNaN(originalPrice) || isNaN(discountValue)) {
        console.error("Invalid price or discount value");
        return 0; // Return 0 or handle as needed
    }
     // Calculate the discounted price
    return originalPrice - (originalPrice * (discountValue / 100));
 ;
};

  const handleSelectProduct = (product) => {
    // Handle product selection (e.g., navigate to product detail)
    console.log("Selected product:", product);
    // You can navigate to a product detail screen here
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
    <View style={styles.container}>
     
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
            <WebView
              originWhitelist={['*']}
              source={{ html: '<i class="bi bi-soccer"></i>' }}
              style={{ width: 24, height: 24 }}
            />
            <Text style={styles.inactiveTab}>Football</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { animateTab(); navigation.navigate("products"); }}
            style={styles.sportTab}
          >
            <WebView
              originWhitelist={['*']}
              source={{ html: '<i class="bi bi-basketball"></i>' }}
              style={{ width: 24, height: 24 }}
            />
            <Text style={styles.inactiveTab}>Basketball</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { animateTab(); navigation.navigate("products"); }}
            style={styles.sportTab}
          >
            <WebView
              originWhitelist={['*']}
              source={{ html: '<i class="bi bi-table-tennis"></i>' }}
              style={{ width: 24, height: 24 }}
            />
            <Text style={styles.inactiveTab}>Tennis</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { animateTab(); navigation.navigate("products"); }}
            style={styles.sportTab}
          >
            <Animated.View style={{ transform: [{ scale: animation }] }}>
              <MaterialIcons name="sports-soccer" size={24} color="#FF1493" />
              <Text style={styles.inactiveTab}>Soccer</Text>
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { animateTab(); navigation.navigate("products"); }}
            style={styles.sportTab}
          >
            <Animated.View style={{ transform: [{ scale: animation }] }}>
              <MaterialIcons name="sports-baseball" size={24} color="#4169E1" />
              <Text style={styles.inactiveTab}>Baseball</Text>
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { animateTab(); navigation.navigate("products"); }}
            style={styles.sportTab}
          >
            <Animated.View style={{ transform: [{ scale: animation }] }}>
              <MaterialIcons name="pool" size={24} color="#00CED1" />
              <Text style={styles.inactiveTab}>Swimming</Text>
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { animateTab(); navigation.navigate("products"); }}
            style={styles.sportTab}
          >
            <Animated.View style={{ transform: [{ scale: animation }] }}>
              <MaterialIcons name="snowboarding" size={24} color="#87CEEB" />
              <Text style={styles.inactiveTab}>Snowboarding</Text>
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { animateTab(); navigation.navigate("products"); }}
            style={styles.sportTab}
          >
            <Animated.View style={{ transform: [{ scale: animation }] }}>
              <MaterialIcons name="videogame-asset" size={24} color="#9932CC" />
              <Text style={styles.inactiveTab}>Gaming</Text>
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { animateTab(); navigation.navigate("products"); }}
            style={styles.sportTab}
          >
            <Animated.View style={{ transform: [{ scale: animation }] }}>
              <MaterialIcons name="directions-bike" size={24} color="#FF4500" />
              <Text style={styles.inactiveTab}>Cycling</Text>
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { animateTab(); navigation.navigate("products"); }}
            style={styles.sportTab}
          >
            <Animated.View style={{ transform: [{ scale: animation }] }}>
              <MaterialIcons name="run" size={24} color="#32CD32" />
              <Text style={styles.inactiveTab}>Running</Text>
            </Animated.View>
          </TouchableOpacity>
        </ScrollView>

        <Text style={styles.sectionTitle}>Check Out Some of Our Collection! 🎉🛍️</Text>
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
              <Text style={styles.cardPrice}>{product.price}</Text>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.cartButton}
                  onPress={() => addToCart(product)} // Call addToCart function
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

        <Text style={styles.sectionTitle}>Exciting Discounts and Promotions! 🎉💰</Text>
        {discounts.map((discount, index) => {
          const discountedPrice = calculateDiscountedPrice(discount.price, discount.discount); // Use discount.price
          const savings = discount.price - discountedPrice; // Calculate savings based on the original price
          return (
            <View key={index} style={styles.discountItem}>
              <Image
                source={{ uri: discount.image_url }}
                style={styles.discountImage}
              />
              <View>
                <Text style={styles.discountTitle}>{discount.name}</Text>
                <Text style={styles.discountPrice}>
                  ${discountedPrice.toFixed(2)}{" "} {/* Display new price */}
                  <Text style={styles.discountOldPrice}>${discount.price}</Text> {/* Display original price */}
                </Text>
                <Text style={styles.discountSavings}>
                  You save: ${savings.toFixed(2)} {/* Display savings */}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.cartButton}
                onPress={() => addToCart(discount)} // Call addToCart with discount details
              >
                <Icon name="shopping-cart" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          );
        })}

        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('AllDiscountedProducts')}
        >
          <Text style={styles.viewAllText}>View All Discounts! 👀</Text>
        </TouchableOpacity>
      </ScrollView>

      {loading && <ActivityIndicator size="large" color="#0000ff" />}

      <ConfirmationModal
        visible={isModalVisible}
        onConfirm={confirmAddToCart}
        onCancel={() => setModalVisible(false)}
        message={`Great choice! Do you want to add ${itemToAdd ? itemToAdd.name : ''} to your cart? 🛒✨`}
      />
    </View>
  );
};

const styles = StyleSheet.create({

  cartCount: {
    position: 'absolute',
    right: 0,
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
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#ffffff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  menuIcon: {
    fontSize: 24,
    color: "#000",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6e3de8",
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    fontSize: 24,
    marginLeft: 15,
    color: "#6e3de8",
  },
  searchSection: {
    marginTop: 20,
  },
  searchInput: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: "#000",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  tabContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  sportTab: {
    alignItems: "center",
    marginRight: 20,
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    elevation: 2,
  },
  inactiveTab: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
    textAlign: "center",
  },
  cardContainer: {
    flexDirection: "row",
    marginTop: 10,
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
    marginBottom: 10,
    marginTop: 5,
  },
  cardImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginBottom: 8,
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
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
  },
  discountTitle: {
    fontWeight: "bold",
    color: "#000",
  },
  discountPrice: {
    color: "#6e3de8",
    fontSize: 16,
  },
  discountOldPrice: {
    textDecorationLine: "line-through",
    color: "#6e3de8",
    fontSize: 14,
  },
  discountPercentage: {
    color: '#ff0000', // Red color for discount percentage
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  navIcon: {
    fontSize: 24,
    color: "#6e3de8",
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  quantityInput: {
    width: 50,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 5,
    textAlign: 'center',
    marginRight: 10,
  },
  viewAllButton: {
    backgroundColor: '#6A5AE0', // Button color
    borderRadius: 10,
    paddingVertical: 12, // Increased vertical padding
    paddingHorizontal: 20, // Added horizontal padding
    alignItems: 'center',
    marginVertical: 20,
    elevation: 5, // Shadow effect for Android
    shadowColor: '#000', // Shadow color for iOS
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  viewAllText: {
    color: '#FFF',
    fontSize: 18, // Increased font size
    fontWeight: 'bold',
  },
  viewAllButtonHover: {
    backgroundColor: '#5A4AE0', // Darker shade for hover effect
  },
});

export default Marketplace;

