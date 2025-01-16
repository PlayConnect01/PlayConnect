import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Modal,
  Pressable,
  Alert,
  Animated,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../Api";
import { Ionicons } from "@expo/vector-icons";
import ReviewSection from './ReviewSection';
import CustomToast from '../components/CustomToast';
const CustomAlert = ({ visible, onClose }) => {
  const navigation = useNavigation();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Success</Text>
          <Text style={styles.modalMessage}>
            Product added to cart successfully!
          </Text>
          <View style={styles.modalButtons}>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={onClose}
            >
              <Text style={styles.textStyle}>Continue Shopping</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.buttonOpen]}
              onPress={() => {
                onClose();
                navigation.navigate("Cart");
              }}
            >
              <Text style={styles.textStyle}>View Cart</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const NotificationBanner = ({ message, type = "info", onClose }) => {
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.sequence([
      Animated.spring(animation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.delay(2000),
      Animated.spring(animation, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
    ]).start(() => onClose());
  }, []);

  const getBannerStyle = () => {
    switch (type) {
      case "success":
        return [styles.notification, styles.notificationSuccess];
      case "error":
        return [styles.notification, styles.notificationError];
      case "warning":
        return [styles.notification, styles.notificationWarning];
      default:
        return [styles.notification, styles.notificationInfo];
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return "checkmark-circle";
      case "error":
        return "close-circle";
      case "warning":
        return "warning";
      default:
        return "information-circle";
    }
  };

  return (
    <Animated.View
      style={[
        getBannerStyle(),
        {
          transform: [
            {
              translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [-100, 0],
              }),
            },
          ],
          opacity: animation,
        },
      ]}
    >
      <Ionicons
        name={getIcon()}
        size={24}
        color="#FFFFFF"
        style={styles.notificationIcon}
      />
      <Text style={styles.notificationText}>{message}</Text>
    </Animated.View>
  );
};

const ProductDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showAlert, setShowAlert] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [favorites, setFavorites] = useState([]);
  const [addingToCartId, setAddingToCartId] = useState(null);
  const [cartAnimation] = useState(new Animated.Value(1));
  const [lastAddedProduct, setLastAddedProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
const [userId, setUserId] = useState(null);
  const notificationTimeout = React.useRef(null);
  const animationValues = React.useRef({
    scale: new Animated.Value(1),
    success: new Animated.Value(0),
  }).current;

  const showNotification = (message, type = "info", duration = 2000) => {
    if (notificationTimeout.current) {
      clearTimeout(notificationTimeout.current);
    }
    setNotification({ message, type });
    notificationTimeout.current = setTimeout(() => {
      setNotification({ message: "", type: "" });
    }, duration);
  };

  const animateCartButton = () => {
    setAddingToCartId(productId);
    Animated.sequence([
      Animated.spring(animationValues.scale, {
        toValue: 0.8,
        useNativeDriver: true,
        duration: 100,
      }),
      Animated.spring(animationValues.scale, {
        toValue: 1,
        useNativeDriver: true,
        duration: 100,
      }),
      Animated.timing(animationValues.success, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.timing(animationValues.success, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setAddingToCartId(null);
      });
    }, 1500);
  };

  const toggleFavorite = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const userDataStr = await AsyncStorage.getItem("userData");
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const userId = userData?.user_id;

      if (!token || !userId) {
        showNotification("Please login to manage favorites", "warning");
        navigation.navigate("Login");
        return;
      }

      const isAlreadyFavorite = favorites.includes(productId);

      if (isAlreadyFavorite) {
        const favoritesResponse = await axios.get(
          `${BASE_URL}/favorites/favorites/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const favorite = favoritesResponse.data.find(
          (fav) => fav.product_id === productId
        );

        if (!favorite) {
          showNotification("Could not find favorite to remove", "error");
          return;
        }

        await axios.delete(
          `${BASE_URL}/favorites/favorites/item/${favorite.favorite_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setFavorites((prev) => prev.filter((id) => id !== productId));
        showNotification("Removed from favorites ❌", "success");
      } else {
        await axios.post(
          `${BASE_URL}/favorites/favorites/add`,
          {
            userId: parseInt(userId),
            productId: productId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setFavorites((prev) => [...prev, productId]);
        showNotification("Added to favorites ❤️", "success");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      if (error.response?.status === 401) {
        showNotification("Please login to manage favorites", "warning");
        navigation.navigate("Login");
      } else {
        showNotification(
          error.response?.data?.message || "Failed to update favorites",
          "error"
        );
      }
    }
  };

  const addToCart = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const userDataStr = await AsyncStorage.getItem("userData");
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const userId = userData?.user_id;
      const existingCart = await AsyncStorage.getItem("cartProducts");
      const cartProductsList = existingCart ? JSON.parse(existingCart) : [];

      if (!token || !userId) {
        showNotification("Please log in to add items to cart", "warning");
        return;
      }

      animateCartButton();

      const response = await axios.post(
        `${BASE_URL}/cart/cart/add`,
        {
          userId: parseInt(userId),
          productId: productId,
          quantity: quantity,
          price: product.price,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        const productWithQuantity = {
          ...product,
          quantity: quantity,
        };
        cartProductsList.push(productWithQuantity);
        await AsyncStorage.setItem(
          "cartProducts",
          JSON.stringify(cartProductsList)
        );
        setLastAddedProduct(product);
        showNotification("Added to cart successfully! 🛒", "success");
        setShowAlert(true);
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
      showNotification(
        error.response?.data?.message || "Error adding to cart",
        "error"
      );
      setAddingToCartId(null);
    }
  };

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${BASE_URL}/product/products/${productId}`
        );
        if (response.data) {
          setProduct(response.data);
        }
      
      } catch (error) {
        console.error("Error fetching product details:", error);
        Alert.alert('Error', 'Failed to load product details');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [productId]);
  
 
  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/marketplacereview/product/${productId}`);
      setReviews(response.data.reviews || []);
      setAverageRating(response.data.averageRating || 0);
      setTotalReviews(response.data.totalReviews || 0);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      showNotification('Failed to fetch reviews', 'error');
    }
  };
  

 useEffect(() => {
    const getUserData = async () => {
      try {
        const userDataStr = await AsyncStorage.getItem("userData");
        const userData = userDataStr ? JSON.parse(userDataStr) : null;
        setUserId(userData?.user_id);
      } catch (error) {
        console.error('Error getting user data:', error);
      }
    };
    getUserData();
    fetchReviews();
  }, []);
  useEffect(() => {
    const checkIfFavorite = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const userDataStr = await AsyncStorage.getItem("userData");
        const userData = userDataStr ? JSON.parse(userDataStr) : null;
        const userId = userData?.user_id;

        if (token && userId && productId) {
          const response = await axios.get(
            `${BASE_URL}/favorites/favorites/user/${userId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setFavorites(response.data.map((favorite) => favorite.product_id));
        }
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };

    checkIfFavorite();
  }, [productId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4FA5F5" />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }






  return (
    <SafeAreaView style={styles.container}>
      {notification.message && (
        <NotificationBanner
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: "", type: "" })}
        />
      )}
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>{notification.message && (
  <NotificationBanner
    message={notification.message}
    type={notification.type}
    onClose={() => setNotification({ message: "", type: "" })}
  />
)}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.image_url }}
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={[
              styles.favoriteButton,
              favorites.includes(productId) && styles.favoriteButtonActive,
              { position: "absolute", top: 16, right: 16 },
            ]}
            onPress={toggleFavorite}
          >
            <Ionicons
              name={favorites.includes(productId) ? "heart" : "heart-outline"}
              size={24}
              color={favorites.includes(productId) ? "#FF69B4" : "#4FA5F5"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{product.name}</Text>
            <Text style={styles.price}>${product.price}</Text>
          </View>

          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.description}>
            {product.description || "No description available"}
          </Text>
         
<ReviewSection
  productId={productId}
  reviews={reviews}
  averageRating={averageRating}
  totalReviews={totalReviews}
  userId={userId}
  onReviewsUpdate={fetchReviews}
  showNotification={showNotification}
  navigation={navigation}
/>
        </View>
      </ScrollView>

      <View style={[styles.bottomContainer, { marginBottom: 80 }]}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={[
              styles.quantityButton,
              quantity <= 1 && styles.quantityButtonDisabled,
            ]}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantity}>{quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(quantity + 1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
     
        <TouchableOpacity
          style={[
            styles.addToCartButton,
            addingToCartId === productId && styles.addToCartButtonDisabled,
          ]}
          onPress={addToCart}
          disabled={addingToCartId === productId}
        >
          {addingToCartId === productId ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.addToCartButtonText}>Add to Cart</Text>
          )}
        </TouchableOpacity>
      </View>

      {showAlert && (
        <CustomAlert visible={showAlert} onClose={() => setShowAlert(false)} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(79, 165, 245, 0.1)',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F7FAFF',
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 16,
    color: '#2D3748',
    fontWeight: '600',
    marginBottom: 8,
  },
  reviewInput: {
    backgroundColor: '#F7FAFF',
    borderRadius: 15,
    padding: 16,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(79, 165, 245, 0.2)',
    fontSize: 16,
    color: '#2D3748',
  },
  actionButton: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: "#4FA5F5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  container: {
    flex: 1,
    backgroundColor: "#F0F7FF",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#4FA5F5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    paddingBottom: 16,
    zIndex: 1,
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#F7FAFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4FA5F5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(79, 165, 245, 0.1)",
  },
  backButtonText: {
    fontSize: 24,
    color: "#4FA5F5",
    fontWeight: "600",
  },
  favoriteButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4FA5F5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(79, 165, 245, 0.1)",
    transform: [{ scale: 1 }],
  },
  favoriteButtonActive: {
    backgroundColor: "#FFF0F7",
    borderColor: "#FF69B4",
    transform: [{ scale: 1.05 }],
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").width * 0.8,
    marginTop: 16,
    borderRadius: 30,
    marginHorizontal: 16,
    width: Dimensions.get("window").width - 32,
    shadowColor: "#4FA5F5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  contentContainer: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    margin: 16,
    borderRadius: 25,
    shadowColor: "#4FA5F5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    backgroundColor: "#F7FAFF",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(79, 165, 245, 0.1)",
  },
  title: {
    flex: 1,
    fontSize: 26,
    fontWeight: "700",
    color: "#2D3748",
    marginRight: 16,
    letterSpacing: 0.5,
  },
  price: {
    fontSize: 28,
    fontWeight: "800",
    color: "#4FA5F5",
    textShadowColor: "rgba(79, 165, 245, 0.15)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  descriptionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 12,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    color: "#4A5568",
    lineHeight: 24,
    marginBottom: 24,
    backgroundColor: "#F7FAFF",
    padding: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(79, 165, 245, 0.1)",
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "rgba(79, 165, 245, 0.1)",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#4FA5F5",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
    backgroundColor: "#F7FAFF",
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(79, 165, 245, 0.1)",
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4FA5F5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(79, 165, 245, 0.1)",
  },
  quantityButtonDisabled: {
    backgroundColor: "#E2E8F0",
    opacity: 0.7,
  },
  quantityButtonText: {
    fontSize: 20,
    color: "#4FA5F5",
    fontWeight: "600",
  },
  quantity: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3748",
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: "center",
  },
  addToCartButton: {
    flex: 1,
    height: 50,
    backgroundColor: "#4FA5F5",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4FA5F5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(79, 165, 245, 0.2)",
  },
  addToCartButtonDisabled: {
    backgroundColor: "#A0AEC0",
    shadowOpacity: 0.1,
  },
  addToCartButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F7FF",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#4FA5F5",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F7FF",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#FF69B4",
    textAlign: "center",
    marginBottom: 20,
    backgroundColor: "#FFF0F7",
    padding: 16,
    borderRadius: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 105, 180, 0.2)",
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: "#4FA5F5",
    borderRadius: 25,
    shadowColor: "#4FA5F5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  notification: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    left: 20,
    right: 20,
    backgroundColor: "#4FA5F5",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  notificationSuccess: {
    backgroundColor: "#4CAF50",
  },
  notificationError: {
    backgroundColor: "#F44336",
  },
  notificationWarning: {
    backgroundColor: "#FF9800",
  },
  notificationInfo: {
    backgroundColor: "#2196F3",
  },
  notificationIcon: {
    marginRight: 12,
  },
  notificationText: {
    color: "#FFFFFF",
    fontSize: 16,
    flex: 1,
    fontWeight: "500",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: "#4A5568",
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4FA5F5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(79, 165, 245, 0.2)",
  },
  buttonClose: {
    backgroundColor: "#A0AEC0",
    marginRight: 16,
  },
  buttonOpen: {
    backgroundColor: "#4FA5F5",
  },
  textStyle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  
  },
  
});

export default ProductDetail;
