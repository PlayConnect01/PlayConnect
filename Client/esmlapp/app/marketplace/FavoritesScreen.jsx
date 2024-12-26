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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../Api';

const FavoritesScreen = () => {
  const navigation = useNavigation();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMessage, setShowMessage] = useState('');

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const response = await axios.get(`${BASE_URL}/favorites/favorites/user/${userId}`);
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

  const removeFromFavorites = useCallback(async (favorite) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      await axios.delete(`${BASE_URL}/favorites/favorites/item/${favorite.favorite_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setFavorites(favorites.filter(fav => fav.favorite_id !== favorite.favorite_id));

      setShowMessage('Item removed from favorites! 💔');
      setTimeout(() => setShowMessage(''), 2000);

    } catch (error) {
      console.error("Error removing from favorites:", error);
      setShowMessage('Failed to remove from favorites');
      setTimeout(() => setShowMessage(''), 2000);
    }
  }, [favorites]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        <Text style={styles.headerTitle}>My Favorites</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#6e3de8" />
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {favorites.map((favorite, index) => (
              <View key={index} style={styles.card}>
                <Image
                  source={{ uri: favorite.product.image_url }}
                  style={styles.cardImage}
                />
                <Text style={styles.cardTitle}>{favorite.product.name}</Text>
                <Text style={styles.cardPrice}>${favorite.product.price}</Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeFromFavorites(favorite)}
                >
                  <FontAwesome name="trash" size={20} color="#fff" />
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
      {showMessage && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{showMessage}</Text>
        </View>
      )}
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
    padding: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
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
  removeButton: {
    backgroundColor: '#ff3b8f',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  removeButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
    fontWeight: 'bold',
  },
  messageContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#6e3de8',
    padding: 10,
    alignItems: 'center',
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FavoritesScreen;