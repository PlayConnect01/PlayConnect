import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import { BASE_URL } from '../../Api.js';
import { Import } from 'lucide-react';
import MatchNotification from '../components/MatchNotification';
import NotificationsModal from '../components/NotificationsModal';

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
  const position = useRef(new Animated.ValueXY()).current;
  const navigation = useNavigation();

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
        Alert.alert('Error', 'Please login again');
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
            Alert.alert('No Matches', 'No users with common sports found.');
          }
        } catch (error) {
          console.error('Error fetching users:', error.message);
          Alert.alert('Error', 'Failed to load potential matches.');
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
      Alert.alert('Finished', 'You have viewed all available users.');
    }
    position.setValue({ x: 0, y: 0 });
  };

  const handleLike = async () => {
    if (!users[currentUserIndex]) return;

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
      Alert.alert('Error', `Failed to create the match. ${error.message}`);
    }
  };

  const handleDislike = () => {
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
      {/* Header with notification icon */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => setShowNotifications(true)}
        >
          <Ionicons name="notifications" size={24} color="#333" />
          {unreadNotifications > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadNotifications > 99 ? '99+' : unreadNotifications}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('MessagePage')}>
          <Ionicons name="chatbubble-ellipses-outline" size={30} color="#000" />
        </TouchableOpacity>
      </View>

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
          <Image
            source={{ uri: currentUser.profile_picture }} // 
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {currentUser.username || 'Unknown User'} 
            </Text>
            <Text style={styles.location}>
              {currentUser.location || 'Location not available'}
            </Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Online</Text>
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

      {/* Notifications Modal */}
      {showNotifications && (
        <NotificationsModal
          visible={showNotifications}
          onClose={() => setShowNotifications(false)}
          userId={currentUserId}
        />
      )}
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
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  notificationButton: {
    position: 'relative',
    padding: 5,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
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
  },
  location: {
    color: '#fff',
    fontSize: 16,
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
    elevation: 3,
  },
  dislikeButton: {
    borderColor: '#FF3B30',
  },
  likeButton: {
    borderColor: '#34C759',
  },
});

export default Match;