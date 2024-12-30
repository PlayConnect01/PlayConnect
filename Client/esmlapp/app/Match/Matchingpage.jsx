import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import { BASE_URL } from '../../Api';
import { Import } from 'lucide-react';
import MatchNotification from '../components/MatchNotification';
import NotificationsModal from '../components/NotificationsModal';
import { LinearGradient } from 'expo-linear-gradient';
import CustomAlert from '../../Alerts/CustomAlert';

axios.defaults.timeout = 5000;

const decodeJWT = (token) => {
  const base64Payload = token.split('.')[1];
  const payload = Buffer.from(base64Payload, 'base64').toString('utf-8');
  return JSON.parse(payload);
};

const Match = () => {
  const [users, setUsers] = useState([]);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const position = useRef(new Animated.ValueXY()).current;
  const likeScale = useRef(new Animated.Value(1)).current;
  const dislikeScale = useRef(new Animated.Value(1)).current;
  const navigation = useNavigation();

  const showCustomAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          throw new Error('Token not found');
        }

        const decodedToken = decodeJWT(token);
        if (decodedToken?.userId) {
          setCurrentUserId(decodedToken.userId);
          console.log('User ID:', decodedToken.userId);
          fetchNotifications(decodedToken.userId);
        } else {
          throw new Error('User ID not found in token');
        }
      } catch (error) {
        console.error('Error loading token:', error);
        showCustomAlert('Error', 'Please login again');
        navigation.navigate('Login');
      }
    };

    loadToken();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      const fetchPotentialMatches = async () => {
        try {
          const response = await axios.get(
            `${BASE_URL}/matches/common-sports/${currentUserId}`
          );

          if (response.data.length > 0) {
            setUsers(response.data);
            console.log('Données récupérées:', response.data);
          } else {
            showCustomAlert('No Matches', 'No users with common sports found.');
          }
        } catch (error) {
          console.error('Error fetching users:', error.message);
          showCustomAlert('Error', 'Failed to load potential matches.');
        }
      };

      fetchPotentialMatches();
    }
  }, [currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      // Fetch unread notifications count
      const fetchUnreadCount = async () => {
        try {
          const response = await axios.get(`${BASE_URL}/notifications/${currentUserId}/unread/count`);
          setUnreadNotifications(response.data.count || 0);
        } catch (error) {
          console.error('Error fetching unread notifications:', error);
          setUnreadNotifications(0);
        }
      };

      fetchUnreadCount();
    }
  }, [currentUserId, showNotifications]);

  const fetchNotifications = async (userId) => {
    if (!userId) return;
    
    try {
      const response = await axios.get(`${BASE_URL}/notifications/${userId}`);
      if (response.data && Array.isArray(response.data)) {
        setNotifications(response.data);
        setUnreadNotifications(response.data.filter(n => !n.read).length);
      } else {
        console.warn('Unexpected notifications response format:', response.data);
        setNotifications([]);
        setUnreadNotifications(0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadNotifications(0);
    }
  };

  const handleAcceptMatch = async (matchId) => {
    try {
      await axios.patch(`${BASE_URL}/match/accept/${matchId}`);
      fetchNotifications(currentUserId);
    } catch (error) {
      console.error('Error accepting match:', error);
    }
  };

  const handleRejectMatch = async (matchId) => {
    try {
      await axios.patch(`${BASE_URL}/match/reject/${matchId}`);
      fetchNotifications(currentUserId);
    } catch (error) {
      console.error('Error rejecting match:', error);
    }
  };

  const handleNextUser = () => {
    if (currentUserIndex < users.length - 1) {
      setCurrentUserIndex((prev) => prev + 1);
    } else {
      showCustomAlert('Finished', 'You have viewed all available users.');
    }
    position.setValue({ x: 0, y: 0 });
  };

  const handleLike = async () => {
    if (!users[currentUserIndex]) return;

    // Animate the button press
    Animated.sequence([
      Animated.spring(likeScale, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(likeScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      const currentUser = users[currentUserIndex];
      await axios.post(
        `${BASE_URL}/matches/create`,
        {
          userId1: currentUserId,
          userId2: currentUser.user_id,
          sportId: currentUser.sports[0]?.sport_id,
        }
      );

      Animated.timing(position, {
        toValue: { x: 500, y: 0 },
        duration: 300,
        useNativeDriver: false
      }).start(() => handleNextUser());
    } catch (error) {
      console.error('Error creating match:', error.message);
      showCustomAlert('Error', `Failed to create the match. ${error.message}`);
    }
  };

  const handleDislike = () => {
    // Animate the button press
    Animated.sequence([
      Animated.spring(dislikeScale, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(dislikeScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(position, {
      toValue: { x: -500, y: 0 },
      duration: 300,
      useNativeDriver: false
    }).start(() => handleNextUser());
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event(
      [null, { dx: position.x, dy: position.y }],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > 120) {
        handleLike();
      } else if (gesture.dx < -120) {
        handleDislike();
      } else {
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      }
    },
  });

  if (!currentUserId) {
    return (
      <View style={styles.container}>
        <Text>Loading user data...</Text>
      </View>
    );
  }

  const currentUser = users[currentUserIndex];

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text>Loading users...</Text>
        <Text>Utilisez la photo de profil</Text>
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
                {
                  rotate: position.x.interpolate({
                    inputRange: [-200, 0, 200],
                    outputRange: ['-10deg', '0deg', '10deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <ImageBackground
            source={{ uri: currentUser.profile_picture }}
            style={styles.imageBackground}
            imageStyle={styles.image}
          >
            <LinearGradient
              colors={['transparent', 'rgba(0, 0, 0, 0.95)']}
              style={styles.gradient}
            >
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {currentUser.username || 'Unknown User'} 
                </Text>
                <View style={styles.locationContainer}>
                  <Ionicons name="location" size={20} color="#fff" />
                  <Text style={styles.location}>
                    {currentUser.location || 'Location not available'}
                  </Text>
                </View>
                <View style={styles.sportsContainer}>
                  <Text style={styles.sportsTitle}>Interested in:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sportsList}>
                    {currentUser.sports?.map((sport, index) => (
                      <View key={index} style={styles.sportBadge}>
                        <Ionicons name="basketball-outline" size={16} color="#fff" />
                        <Text style={styles.sportText}>{sport.sport.name}</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton]}
                    onPress={handleDislike}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={['#FF0000', '#FF69B4']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.gradientButton}
                    >
                      <Animated.View style={[styles.buttonContent, { transform: [{ scale: dislikeScale }] }]}>
                        <Ionicons name="close" size={35} color="#fff" />
                      </Animated.View>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton]}
                    onPress={handleLike}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={['#4CAF50', '#FFEB3B']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.gradientButton}
                    >
                      <Animated.View style={[styles.buttonContent, { transform: [{ scale: likeScale }] }]}>
                        <Ionicons name="heart" size={35} color="#fff" />
                      </Animated.View>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </Animated.View>
      </View>

      <NotificationsModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onAccept={handleAcceptMatch}
        onReject={handleRejectMatch}
        currentUserId={currentUserId}
      />
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  cardContainer: {
    flex: 1,
    margin: 16,
    backgroundColor: '#fff',
  },
  card: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  imageBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  image: {
    borderRadius: 20,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  userInfo: {
    padding: 25,
    paddingBottom: 30,
  },
  userName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  location: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  sportsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  sportsTitle: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  sportsList: {
    maxHeight: 50,
  },
  sportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
  },
  sportText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 30,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.5,
    elevation: 8,
    backgroundColor: '#fff',
    padding: 2,
  },
  gradientButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
  },
  buttonContent: {
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ scale: 1 }],
  },
});

export default Match;