import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../../api';
import MatchNotification from './MatchNotification';

const NotificationsModal = ({ visible, onClose, userId, onNotificationsUpdate, navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    if (visible && userId) {
      fetchNotifications();
    }
  }, [visible, userId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/notifications/${userId}`);
      if (response.data && Array.isArray(response.data)) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      try {
        await axios.put(`${BASE_URL}/notifications/${notification.notification_id}/read`);
        if (onNotificationsUpdate) {
          onNotificationsUpdate();
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    setSelectedMatch(notification);
  };

  const handleAcceptMatch = async (matchId, notificationId) => {
    try {
      // Accept the match
      await axios.patch(`${BASE_URL}/matches/accept/${matchId}`);
      
      // Remove the notification from the backend
      await axios.delete(`${BASE_URL}/notifications/${notificationId}`);
      
      // Remove the notification from the list
      setNotifications(prev => prev.filter(notif => notif.notification_id !== notificationId));
      
      if (onNotificationsUpdate) {
        onNotificationsUpdate();
      }
    } catch (error) {
      console.error('Error accepting match:', error);
    }
  };

  const handleRejectMatch = async (matchId, notificationId) => {
    try {
      // Reject the match
      await axios.patch(`${BASE_URL}/matches/reject/${matchId}`);
      
      // Remove the notification from the backend
      await axios.delete(`${BASE_URL}/notifications/${notificationId}`);
      
      // Remove the notification from the list
      setNotifications(prev => prev.filter(notif => notif.notification_id !== notificationId));
      
      if (onNotificationsUpdate) {
        onNotificationsUpdate();
      }
    } catch (error) {
      console.error('Error rejecting match:', error);
    }
  };

  const renderNotification = (notification) => {
    const notificationStyle = [
      styles.notificationItem,
      !notification.is_read && styles.unreadNotification
    ];

    switch (notification.type) {
      case 'MATCH_REQUEST':
        return (
          <TouchableOpacity 
            key={notification.notification_id}
            onPress={() => handleNotificationClick(notification)}
            style={notificationStyle}
          >
            <View style={styles.messageContainer}>
              <Text style={styles.messageText}>
                {notification.senderName || notification.user?.username || 'Someone'} wants to match with you!
              </Text>
              {!notification.is_read && (
                <View style={styles.unreadDot} />
              )}
            </View>
          </TouchableOpacity>
        );
      default:
        return (
          <TouchableOpacity 
            key={notification.notification_id}
            onPress={() => handleNotificationClick(notification)}
            style={notificationStyle}
          >
            <View>
              <Text style={[styles.notificationTitle, !notification.is_read && styles.unreadTitle]}>
                {notification.title}
              </Text>
              <Text style={[styles.notificationContent, !notification.is_read && styles.unreadContent]}>
                {notification.content}
              </Text>
              {!notification.is_read && (
                <View style={styles.unreadDot} />
              )}
            </View>
          </TouchableOpacity>
        );
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Notifications</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color="#0095FF" />
            ) : notifications.length === 0 ? (
              <Text style={styles.emptyText}>No notifications</Text>
            ) : (
              <ScrollView style={styles.notificationsList}>
                {notifications.map(notification => renderNotification(notification))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!selectedMatch}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedMatch(null)}
      >
        {selectedMatch && (
          <View style={styles.matchModalContainer}>
            <MatchNotification
              notification={selectedMatch}
              onAccept={() => {
                handleAcceptMatch(selectedMatch.match_id, selectedMatch.notification_id);
                setSelectedMatch(null);
              }}
              onReject={() => {
                handleRejectMatch(selectedMatch.match_id, selectedMatch.notification_id);
                setSelectedMatch(null);
              }}
            />
          </View>
        )}
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '50%',
    maxHeight: '80%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#000',
  },
  notificationsList: {
    flex: 1,
  },
  notificationItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  unreadNotification: {
    backgroundColor: '#F0F9FF',
    borderLeftWidth: 4,
    borderLeftColor: '#0095FF',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    color: '#666',
  },
  unreadTitle: {
    fontWeight: '600',
    color: '#000',
  },
  notificationContent: {
    fontSize: 14,
    color: '#666',
  },
  unreadContent: {
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  unreadDot: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0095FF',
  },
  messageContainer: {
    padding: 15,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    margin: 10,
  },
  messageText: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
  },
  matchModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NotificationsModal;
