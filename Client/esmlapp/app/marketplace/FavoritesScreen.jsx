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
  Animated
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE_URL} from '../../api';

const FavoritesScreen = () => {
  const navigation = useNavigation();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMessage, setShowMessage] = useState("");

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem("userId");
      if (userId) {
        const response = await axios.get(
          `${BASE_URL}/favorites/favorites/user/${userId}`
        );
        setFavorites(response.data);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const removeFromFavorites = useCallback(
    async (favorite) => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) return;

        await axios.delete(
          `${BASE_URL}/favorites/favorites/item/${favorite.favorite_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setFavorites(
          favorites.filter((fav) => fav.favorite_id !== favorite.favorite_id)
        );

        setShowMessage("Item removed from favorites! 💔");
        setTimeout(() => setShowMessage(""), 2000);
      } catch (error) {
        console.error("Error removing from favorites:", error);
        setShowMessage("Failed to remove from favorites");
        setTimeout(() => setShowMessage(""), 2000);
      }
    },
    [favorites]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome name="arrow-left" size={24} style={styles.backButtonIcon} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>My Collection</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#4299e1" />
        ) : favorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Animated.View style={[styles.emptyIcon, { transform: [{ scale: 1.2 }] }]}>
              <FontAwesome name="heart-o" size={80} color="#4299e1" />
            </Animated.View>
            <Text style={styles.emptyText}>
              Start building your collection by adding favorites from the marketplace
            </Text>
          </View>
        ) : (
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.cardContainer}>
              {favorites.map((favorite, index) => (
                <Animated.View 
                  key={index} 
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
                      source={{ uri: favorite.product.image_url }}
                      style={styles.cardImage}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {favorite.product.name}
                    </Text>
                    <Text style={styles.cardPrice}>
                      ${favorite.product.price}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFromFavorites(favorite)}
                  >
                    <FontAwesome name="heart" size={18} style={styles.removeButtonIcon} />
                  </TouchableOpacity>
                </Animated.View>
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
    backgroundColor: '#f8faff',
  },
  mainContainer: {
    flex: 1,
    padding: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1f36',
    marginBottom: 24,
    marginTop: 12,
    textAlign: 'center',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(66, 153, 225, 0.15)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
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
  },
  card: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(66, 153, 225, 0.1)',
    shadowColor: '#4299e1',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    transform: [{ translateY: 0 }],
  },
  cardImageWrapper: {
    width: '100%',
    height: 160,
    backgroundColor: '#f0f5ff',
    position: 'relative',
  },
  cardGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: 'rgba(66, 153, 225, 0.05)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 8,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4299e1',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 30,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 2,
    transform: [{ scale: 1 }],
  },
  removeButtonIcon: {
    color: '#e53e3e',
  },
  messageContainer: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    backgroundColor: 'rgba(66, 153, 225, 0.95)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#4299e1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    backdropFilter: 'blur(10px)',
  },
  messageText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    marginBottom: 24,
    opacity: 0.9,
    transform: [{ scale: 1.2 }],
  },
  emptyText: {
    fontSize: 17,
    color: '#4a5568',
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: 0.3,
    maxWidth: 280,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 14,
    shadowColor: '#4299e1',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    transform: [{ scale: 1 }],
  },
  backButtonIcon: {
    color: '#4299e1',
  }
});

export default FavoritesScreen;
