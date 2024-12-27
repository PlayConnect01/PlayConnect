import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from "../../Api"

const MatchNotification = ({ notification, onAccept, onReject }) => {
  const [showModal, setShowModal] = useState(false);

  const handlePress = () => {
    setShowModal(true);
  };

  // Get the appropriate user data from the notification
  const senderName = notification?.senderName || notification?.user?.username || 'Unknown User';
  const senderImage = notification?.senderImage || notification?.user?.profile_picture || 'default_image_url';

  const handleAccept = () => {
    if (notification?.match_id) {
      onAccept(notification.match_id);
      setShowModal(false);
    }
  };

  const handleReject = () => {
    if (notification?.match_id) {
      onReject(notification.match_id);
      setShowModal(false);
    }
  };

  // Don't show if it's not a match request or if it's already been responded to
  if (notification?.type !== 'MATCH_REQUEST' || 
      notification?.status === 'ACCEPTED' || 
      notification?.status === 'REJECTED') {
    return null;
  }

  return (
    <>
      <TouchableOpacity style={styles.container} onPress={handlePress}>
        <View style={styles.content}>
          <Image
            source={{ uri: senderImage }}
            style={styles.notificationImage}
          />
          <Text style={styles.message}>
            {senderName} wants to match with you!
          </Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <Ionicons name="close" size={24} color="#6366f1" />
            </TouchableOpacity>

            <Image
              source={{ uri: senderImage }}
              style={styles.userImage}
            />
            <View style={styles.userInfoContainer}>
              <Text style={styles.userName}>
                {senderName}
              </Text>
              <Text style={styles.matchText}>
                Would you like to match with this user?
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={handleReject}
              >
                <Text style={[styles.buttonText, styles.rejectText]}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={handleAccept}
              >
                <Text style={[styles.buttonText, styles.acceptText]}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 15,
    marginVertical: 10,
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    width: '100%',
    backgroundColor: 'rgba(99, 102, 241, 0.03)',
  },
  notificationImage: {
    width: 55,
    height: 55,
    borderRadius: 18,
    marginRight: 15,
    borderWidth: 3,
    borderColor: '#6366f1',
  },
  message: {
    fontSize: 15,
    flex: 1,
    color: '#4338ca',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    backdropFilter: 'blur(10px)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 30,
    width: '92%',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 15,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  userImage: {
    width: '100%',
    height: 450,
    resizeMode: 'cover',
    marginBottom: 0,
  },
  userInfoContainer: {
    backgroundColor: 'rgba(67, 56, 202, 0.85)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 25,
    backdropFilter: 'blur(10px)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  matchText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    padding: 25,
    paddingBottom: 30,
    backgroundColor: '#fff',
  },
  actionButton: {
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 20,
    minWidth: 130,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    backgroundColor: '#6366f1',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  rejectButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  acceptText: {
    color: '#fff',
  },
  rejectText: {
    color: '#6366f1',
  }
});

export default MatchNotification;
