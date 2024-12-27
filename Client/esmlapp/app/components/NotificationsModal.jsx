import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL } from '../../Api';
import MatchNotification from './MatchNotification';

const NotificationsModal = ({ visible, onClose, userId, onNotificationsUpdate }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const handleAcceptMatch = async (matchId) => {
    try {
      await axios.patch(`${BASE_URL}/matches/accept/${matchId}`);
      fetchNotifications();
      if (onNotificationsUpdate) {
        onNotificationsUpdate();
      }
    } catch (error) {
      console.error('Error accepting match:', error);
    }
  };

  const handleRejectMatch = async (matchId) => {
    try {
      await axios.patch(`${BASE_URL}/matches/reject/${matchId}`);
      fetchNotifications();
      if (onNotificationsUpdate) {
        onNotificationsUpdate();
      }
    } catch (error) {
      console.error('Error rejecting match:', error);
    }
  };

  return (
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
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#6366f1" style={styles.loader} />
          ) : notifications.length === 0 ? (
            <Text style={styles.emptyText}>No notifications</Text>
          ) : (
            <ScrollView style={styles.notificationsList}>
              {notifications.map((notification) => (
                <MatchNotification
                  key={notification.notification_id}
                  notification={notification}
                  onAccept={handleAcceptMatch}
                  onReject={handleRejectMatch}
                />
              ))}
            </ScrollView>
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
    height: '80%',
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
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  notificationsList: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontSize: 16,
  },
  loader: {
    marginTop: 20,
  },
});

export default NotificationsModal;
