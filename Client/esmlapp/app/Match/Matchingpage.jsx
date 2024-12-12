import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, PanResponder, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import jwtDecode from 'jwt-decode'; // Import jwt-decode

// Configuration globale d'Axios pour le timeout et la gestion des erreurs
axios.defaults.timeout = 5000; // Timeout de 5 secondes

const Match = () => {
  const [users, setUsers] = useState([]);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;
  const navigation = useNavigation();
  const [currentUserId, setCurrentUserId] = useState(null); // State to hold the user ID

  // Configuration de l'URL de base de votre API
  const API_BASE_URL = 'http://192.168.103.11:3000';

  // Fonction pour récupérer les utilisateurs potentiels
  const fetchPotentialMatches = async () => {
    if (!currentUserId) return; // Ensure we have a user ID

    try {
      const response = await axios.get(`${API_BASE_URL}/matches/common-sports/${currentUserId}`);
      
      if (response.data.length > 0) {
        setUsers(response.data);
      } else {
        Alert.alert('Pas de matchs', 'Aucun utilisateur avec des sports communs trouvé.');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      Alert.alert('Erreur', 'Impossible de charger les utilisateurs potentiels.');
    }
  };

  useEffect(() => {
    const getUserIdFromToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken'); // Retrieve the token
        if (token) {
          const decodedToken = jwtDecode(token); // Decode the token
          setCurrentUserId(decodedToken.id); // Set the user ID from the token
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    };

    getUserIdFromToken(); // Call the function to get the user ID
  }, []);

  useEffect(() => {
    fetchPotentialMatches(); // Fetch potential matches when user ID is set
  }, [currentUserId]); // Dependency on currentUserId

  const currentUser = users[currentUserIndex];

  const handleNextUser = () => {
    if (currentUserIndex < users.length - 1) {
      setCurrentUserIndex(prev => prev + 1);
    } else {
      Alert.alert('Terminé', 'Vous avez vu tous les utilisateurs disponibles.');
    }
    position.setValue({ x: 0, y: 0 }); // Reset position
  };

  const handleMessagePress = () => {
    navigation.navigate('Messages'); // Navigue vers l'écran Messages
  };

  const handleLike = async () => {
    if (!currentUser) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/matches/create`, 
        {
          userId1: currentUserId,
          userId2: currentUser.user_id,
          sportId: currentUser.sports[0]?.sport_id // Prendre le premier sport commun
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      console.log('Match créé avec succès:', response.data);

      // Animation et passage à l'utilisateur suivant
      Animated.timing(position, {
        toValue: { x: 500, y: 0 },
        duration: 300,
        useNativeDriver: false,
      }).start(() => handleNextUser());

    } catch (error) {
      console.error('Détails de l\'erreur:', error);
      Alert.alert('Erreur', 'Impossible de créer le match. Vérifiez votre connexion.');
    }
  };

  const handleDislike = () => {
    // Animation vers la gauche
    Animated.timing(position, {
      toValue: { x: -500, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => handleNextUser());
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event(
      [
        null,
        { dx: position.x, dy: position.y },
      ],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > 120) {
        handleLike();
      } else if (gesture.dx < -120) {
        handleDislike();
      } else {
        // Return to center
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      }
    },
  });

  // Écran de chargement si pas d'utilisateurs
  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text>Chargement des utilisateurs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.card,
            {
              transform: [
                { translateX: position.x },
                { translateY: position.y },
                { rotate: position.x.interpolate({
                    inputRange: [-200, 0, 200],
                    outputRange: ['-10deg', '0deg', '10deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <Image 
            source={{ uri: currentUser.image }} 
            style={styles.image} 
            resizeMode="cover" 
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {currentUser.first_name} {currentUser.last_name}, {/* Ajoutez l'âge si disponible */}
            </Text>
            <Text style={styles.location}>
              Sports partagés : {currentUser.sports.map(sport => sport.name).join(', ')}
            </Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Disponible</Text>
            </View>
          </View>
        </Animated.View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.dislikeButton]} 
          onPress={handleDislike}
        >
          <Ionicons name="close" size={30} color="#FF3B30" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.likeButton]} 
          onPress={handleLike}
        >
          <Ionicons name="checkmark" size={30} color="#34C759" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'absolute',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  userInfo: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
  },
  userName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  location: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  statusBadge: {
    backgroundColor: 'rgba(147, 51, 234, 0.9)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  actionButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconButton: {
    padding: 5,
  },
});

export default Match;
