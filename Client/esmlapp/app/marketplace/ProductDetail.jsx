import React, { useEffect, useState, useCallback } from 'react';
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
  Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from "../../Api";
import { Ionicons } from '@expo/vector-icons';

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
          <Text style={styles.modalMessage}>Product added to cart successfully!</Text>
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
                navigation.navigate('Cart');
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

const NotificationBanner = ({ message, onClose }) => (
  <View style={styles.notificationBanner}>
    <Text style={styles.notificationText}>{message}</Text>
    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
      <Ionicons name="close" size={20} color="#FFFFFF" />
    </TouchableOpacity>
  </View>
);

const ProductDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { productId, productName } = route.params;
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToFavorites, setIsAddingToFavorites] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [promotion, setPromotion] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (productName) {
      navigation.setOptions({
        title: productName,
      });
    }
  }, [productName, navigation]);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/product/products/${productId}`);
        if (response.data) {
          setProduct(response.data);
          navigation.setOptions({
            title: response.data.name,
          });
        }
        setError(null);
      } catch (error) {
        console.error("Error fetching product details:", error);
        setError('Failed to load product details');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchRelatedProducts = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/product/related/${productId}`);
        setRelatedProducts(response.data);
      } catch (error) {
        console.error("Error fetching related products:", error);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/reviews/${productId}`);
        setReviews(response.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    if (productId) {
      fetchProductDetail();
      fetchRelatedProducts();
      fetchReviews();
    }
  }, [productId, navigation]);

  useEffect(() => {
    const checkIfFavorite = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userId = await AsyncStorage.getItem('userId');
        
        if (token && userId && productId) {
          const response = await axios.get(
            `${BASE_URL}/favorites/check/${userId}/${productId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setIsFavorite(response.data.isFavorite);
        }
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };

    checkIfFavorite();
  }, [productId]);

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/promotion`);
        setPromotion(response.data.message);
      } catch (error) {
        console.error("Error fetching promotion:", error);
      }
    };

    fetchPromotion();
  }, []);

  const showNotification = (message, type = 'info', duration = 2000) => {
    setNotificationMessage(message);
    setTimeout(() => setNotificationMessage(''), duration);
  };

  const addToCart = useCallback(async () => {
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

      setIsAddingToCart(true);
      
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
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 201) {
        showNotification('Product added to cart successfully!', 'success');
      } else {
        showNotification(" you are kepping  increment the quantity of the product", "error");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      showNotification("Error adding to cart. Please try again.", "error");
    } finally {
      setIsAddingToCart(false);
    }
  }, [product, navigation]);

  const toggleFavorite = useCallback(async () => {
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

      if (isFavorite) {
        await axios.delete(
          `${BASE_URL}/favorites/favorites/remove/${userId}/${product.product_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showNotification("Removed from favorites", "success");
      } else {
        await axios.post(
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
        showNotification("Added to favorites", "success");
      }

      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      showNotification("Error updating favorites", "error");
    }
  }, [product, isFavorite, navigation]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4FA5F5" />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Product not found'}</Text>
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
      {notificationMessage && (
        <NotificationBanner message={notificationMessage} onClose={() => setNotificationMessage('')} />
      )}
      {promotion && (
        <View style={styles.promotionBanner}>
          <Text style={styles.promotionText}>{promotion}</Text>
        </View>
      )}

      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
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
            style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive, { position: 'absolute', top: 16, right: 16 }]}
            onPress={toggleFavorite}
            disabled={isAddingToFavorites}
          >
            {isAddingToFavorites ? (
              <ActivityIndicator size="small" color="#FF69B4" />
            ) : (
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={24}
                color={isFavorite ? "#FF69B4" : "#4FA5F5"}
              />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{product.name}</Text>
            <Text style={styles.price}>${product.price}</Text>
          </View>

          {product.rating && (
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>★ {product.rating}</Text>
              <Text style={styles.reviews}>{product.reviews || 0} Reviews</Text>
            </View>
          )}

          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.description}>
            {product.description || 'No description available'}
          </Text>

          {product.specifications && (
            <View style={styles.specificationsContainer}>
              <Text style={styles.specificationsTitle}>Specifications</Text>
              {Object.entries(product.specifications).map(([key, value]) => (
                <View key={key} style={styles.specificationRow}>
                  <Text style={styles.specificationKey}>{key}</Text>
                  <Text style={styles.specificationValue}>{value}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.sectionTitle}>User Reviews</Text>
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <View key={index} style={styles.reviewContainer}>
                <Text style={styles.reviewText}>{review.comment}</Text>
                <Text style={styles.reviewAuthor}>- {review.author}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noReviewsText}>No reviews yet.</Text>
          )}

          <Text style={styles.sectionTitle}>Related Products</Text>
          <ScrollView horizontal style={styles.relatedProductsContainer}>
            {relatedProducts.map((relatedProduct, index) => (
              <View key={index} style={styles.relatedProductCard}>
                <Image source={{ uri: relatedProduct.image_url }} style={styles.relatedProductImage} />
                <Text style={styles.relatedProductName}>{relatedProduct.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <View style={[styles.bottomContainer, { marginBottom: 80 }]}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
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
          style={[styles.addToCartButton, isAddingToCart && styles.addToCartButtonDisabled]}
          onPress={addToCart}
          disabled={isAddingToCart}
        >
          {isAddingToCart ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.addToCartButtonText}>Add to Cart</Text>
          )}
        </TouchableOpacity>
      </View>

      {modalVisible && (
        <CustomAlert visible={modalVisible} onClose={() => setModalVisible(false)} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F7FF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#4FA5F5',
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
    backgroundColor: '#F7FAFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(79, 165, 245, 0.1)',
  },
  backButtonText: {
    fontSize: 24,
    color: '#4FA5F5',
    fontWeight: '600',
  },
  favoriteButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(79, 165, 245, 0.1)',
    transform: [{ scale: 1 }],
  },
  favoriteButtonActive: {
    backgroundColor: '#FFF0F7',
    borderColor: '#FF69B4',
    transform: [{ scale: 1.05 }],
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width * 0.8,
    marginTop: 16,
    borderRadius: 30,
    marginHorizontal: 16,
    width: Dimensions.get('window').width - 32,
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  contentContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 25,
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    backgroundColor: '#F7FAFF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(79, 165, 245, 0.1)',
  },
  title: {
    flex: 1,
    fontSize: 26,
    fontWeight: '700',
    color: '#2D3748',
    marginRight: 16,
    letterSpacing: 0.5,
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    color: '#4FA5F5',
    textShadowColor: 'rgba(79, 165, 245, 0.15)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#FFF0F7',
    padding: 12,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  rating: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF69B4',
    marginRight: 8,
  },
  reviews: {
    fontSize: 16,
    color: '#FF69B4',
    opacity: 0.8,
  },
  descriptionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 12,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    color: '#4A5568',
    lineHeight: 24,
    marginBottom: 24,
    backgroundColor: '#F7FAFF',
    padding: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(79, 165, 245, 0.1)',
  },
  specificationsContainer: {
    marginTop: 24,
    backgroundColor: '#F7FAFF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(79, 165, 245, 0.1)',
  },
  specificationsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  specificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(79, 165, 245, 0.1)',
  },
  specificationKey: {
    fontSize: 16,
    color: '#4A5568',
    fontWeight: '500',
  },
  specificationValue: {
    fontSize: 16,
    color: '#4FA5F5',
    fontWeight: '600',
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(79, 165, 245, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    backgroundColor: '#F7FAFF',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(79, 165, 245, 0.1)',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(79, 165, 245, 0.1)',
  },
  quantityButtonDisabled: {
    backgroundColor: '#E2E8F0',
    opacity: 0.7,
  },
  quantityButtonText: {
    fontSize: 20,
    color: '#4FA5F5',
    fontWeight: '600',
  },
  quantity: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center',
  },
  addToCartButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#4FA5F5',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(79, 165, 245, 0.2)',
  },
  addToCartButtonDisabled: {
    backgroundColor: '#A0AEC0',
    shadowOpacity: 0.1,
  },
  addToCartButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4FA5F5',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF69B4',
    textAlign: 'center',
    marginBottom: 20,
    backgroundColor: '#FFF0F7',
    padding: 16,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 105, 180, 0.2)',
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: '#4FA5F5',
    borderRadius: 25,
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  messageContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#4FA5F5',
    borderRadius: 20,
    padding: 16,
    minWidth: 140,
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(79, 165, 245, 0.2)',
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 12,
    marginTop: 24,
    letterSpacing: 0.5,
  },
  reviewContainer: {
    padding: 16,
    backgroundColor: '#F7FAFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(79, 165, 245, 0.1)',
    marginBottom: 16,
  },
  reviewText: {
    fontSize: 16,
    color: '#4A5568',
    lineHeight: 24,
  },
  reviewAuthor: {
    fontSize: 14,
    color: '#4A5568',
    opacity: 0.8,
  },
  noReviewsText: {
    fontSize: 16,
    color: '#4A5568',
    opacity: 0.8,
    marginBottom: 24,
  },
  relatedProductsContainer: {
    padding: 16,
    backgroundColor: '#F7FAFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(79, 165, 245, 0.1)',
  },
  relatedProductCard: {
    width: 150,
    height: 200,
    marginRight: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  relatedProductImage: {
    width: 150,
    height: 120,
    borderRadius: 15,
    resizeMode: 'cover',
  },
  relatedProductName: {
    fontSize: 16,
    color: '#2D3748',
    fontWeight: '600',
    padding: 8,
  },
  promotionBanner: {
    backgroundColor: '#4FA5F5',
    padding: 16,
    borderRadius: 20,
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(79, 165, 245, 0.2)',
  },
  promotionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#F7FAFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(79, 165, 245, 0.2)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  modalMessage: {
    fontSize: 16,
    color: '#4A5568',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    padding: 16,
    borderRadius: 20,
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(79, 165, 245, 0.2)',
  },
  buttonClose: {
    backgroundColor: '#A0AEC0',
    marginRight: 16,
  },
  buttonOpen: {
    backgroundColor: '#4FA5F5',
  },
  textStyle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A5568',
    letterSpacing: 0.5,
  },
  notificationBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#4FA5F5',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  notificationText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
});

export default ProductDetail;
