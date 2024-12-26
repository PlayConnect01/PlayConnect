import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MatchNotification from './MatchNotification';
import axios from 'axios';
import io from 'socket.io-client';
import { BASE_URL } from '../../api';

const defaultConfig = {
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 5000
};

const NotificationsModal = ({ visible, onClose, userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(BASE_URL);
    setSocket(newSocket);

    // Join user's notification room
    if (userId) {
      newSocket.emit('join_user_room', userId);
    }

    // Listen for new match requests
    newSocket.on('match_request', ({ notification }) => {
      setNotifications(prev => [notification, ...prev]);
    });

    // Listen for match updates
    newSocket.on('match_update', ({ type, match }) => {
      setNotifications(prev => 
        prev.map(notif => {
          if (notif.type === 'MATCH_REQUEST' && notif.match_id === match.match_id) {
            return {
              ...notif,
              match_status: type,
            };
          }
          return notif;
        })
      );
    });

    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    if (visible) {
      fetchNotifications();
    }
  }, [visible, userId]);

  const fetchNotifications = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await axios({
        ...defaultConfig,
        method: 'get',
        url: `${BASE_URL}/notifications/${userId}`,
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Error', 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMatchResponse = async (matchId, response) => {
    try {
      // Optimistically update the UI
      setNotifications(prev => 
        prev.map(notif => {
          if (notif.type === 'MATCH_REQUEST' && notif.match_id === matchId) {
            return {
              ...notif,
              match_status: response === 'accept' ? 'ACCEPTED' : 'REJECTED',
            };
          }
          return notif;
        })
      );

      // Make API call to update match status
      const endpoint = response === 'accept' ? 'accept' : 'reject';
      const result = await axios({
        ...defaultConfig,
        method: 'patch',
        url: `${BASE_URL}/match/${endpoint}/${matchId}`,
      });

      // Notify through socket about the update
      if (socket && result.data) {
        socket.emit('match_response', {
          matchId,
          userId,
          response,
          match: result.data,
        });
      }

      // Show success message
      const message = response === 'accept' ? 'Match accepted!' : 'Match declined';
      Alert.alert('Success', message);
    } catch (error) {
      console.error('Error responding to match:', error);
      Alert.alert('Error', 'Failed to process match response');
      
      // Revert the optimistic update
      await fetchNotifications();
    }
  };

  const renderNotification = ({ item }) => {
    if (item.type === 'MATCH_REQUEST') {
      return (
        <MatchNotification
          notification={item}
          onAccept={() => handleMatchResponse(item.match_id, 'accept')}
          onReject={() => handleMatchResponse(item.match_id, 'reject')}
        />
      );
    }
    return null;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Notifications</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <FlatList
              data={notifications}
              renderItem={renderNotification}
              keyExtractor={(item) => item.notification_id.toString()}
              contentContainerStyle={styles.notificationsList}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    height: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  notification: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  notificationContent: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  notificationsList: {
    padding: 20,
  },
});

export default NotificationsModal;
