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
  Animated,
  RefreshControl
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from "../../Api";

const FavoritesScreen = () => {
  const navigation = useNavigation();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showMessage, setShowMessage] = useState("");

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const userDataStr = await AsyncStorage.getItem('userData');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const userId = userData?.user_id;

      if (!token || !userId) {
        setShowMessage("Please login to view favorites");
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
      setShowMessage("Failed to load favorites");
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
        setShowMessage("Please login to manage favorites");
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
      setShowMessage("Removed from favorites!");
      setTimeout(() => setShowMessage(""), 2000);
    } catch (error) {
      console.error("Error removing from favorites:", error);
      setShowMessage("Failed to remove from favorites");
      setTimeout(() => setShowMessage(""), 2000);
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
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" color="#4299e1" />
        ) : favorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Animated.View style={[styles.emptyIcon, { transform: [{ scale: 1.2 }] }]} >
              <FontAwesome name="heart-o" size={80} color="#4299e1" />
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
              {favorites.map((favorite) => (
                <TouchableOpacity
                  key={favorite.favorite_id}
                  onPress={() => navigateToProduct(favorite.product)}
                >
                  <Animated.View 
                    style={[
                      styles.card,
                      {
                        transform: [
                          { translateY: 0 },
                          { scale: 1 }
                        ]
                      }
                    ]}
                  >
                    <View style={styles.cardImageWrapper}>
                      <View style={styles.cardGradientOverlay} />
                      <Image
                        source={{ uri: favorite.product?.image_url }}
                        style={styles.cardImage}
                        resizeMode="cover"
                      />
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle} numberOfLines={2}>
                        {favorite.product?.name}
                      </Text>
                      <View style={styles.ratingContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FontAwesome
                            key={star}
                            name={star <= Math.floor(favorite.product?.rating || 0) ? "star" : "star-o"}
                            size={12}
                            color="#FBC02D"
                            style={styles.starIcon}
                          />
                        ))}
                        <Text style={styles.ratingText}>
                          {Number(favorite.product?.rating || 0).toFixed(1)}
                        </Text>
                        <Text style={styles.reviewCount}>
                          ({favorite.product?.rating_count || 0})
                        </Text>
                      </View>
                      <Text style={styles.cardPrice}>
                        ${favorite.product?.price}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeFromFavorites(favorite)}
                    >
                      <FontAwesome name="heart" size={18} style={styles.removeButtonIcon} />
                    </TouchableOpacity>
                  </Animated.View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
      
      {showMessage && (
        <Animated.View 
          style={[
            styles.messageContainer,
            {
              transform: [{ translateY: 0 }]
            }
          ]}
        >
          <FontAwesome name="check-circle" size={18} color="#ffffff" />
          <Text style={styles.messageText}>{showMessage}</Text>
        </Animated.View>
      )}
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
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonIcon: {
    color: '#4F46E5',
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
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  infoIcon: {
    color: '#4F46E5',
  },
  scrollContent: {
    paddingBottom: 24,
    paddingHorizontal: 8,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  card: {
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEF2FF',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardImageWrapper: {
    width: '100%',
    height: 160,
    backgroundColor: '#F8FAFF',
    position: 'relative',
  },
  cardGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: 'rgba(79, 70, 229, 0.03)',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  starIcon: {
    marginRight: 2,
  },
  ratingText: {
    fontSize: 12,
    color: '#4B5563',
    marginLeft: 4,
    fontWeight: '600',
  },
  reviewCount: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
    letterSpacing: 0.2,
    textAlign: 'left',
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4F46E5',
    textAlign: 'left',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 2,
  },
  removeButtonIcon: {
    color: '#DC2626',
  },
  messageContainer: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#4F46E5',
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
    backgroundColor: '#4299e1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#4299e1',
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
});

export default FavoritesScreen;
