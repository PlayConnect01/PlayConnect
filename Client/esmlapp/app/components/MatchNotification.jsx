import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MatchNotification = ({ notification, onAccept, onReject }) => {
  const [showModal, setShowModal] = useState(false);

  const handlePress = () => {
    setShowModal(true);
  };

  return (
    <>
      <TouchableOpacity style={styles.container} onPress={handlePress}>
        <View style={styles.content}>
          <Image
            source={{ uri: notification.sender?.profile_picture || notification.user?.profile_picture }}
            style={styles.notificationImage}
          />
          <Text style={styles.message}>
            {notification.sender?.username || notification.user?.username} wants to match with you!
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
              source={{ uri: notification.sender?.profile_picture || notification.user?.profile_picture }}
              style={styles.userImage}
            />
            <View style={styles.imageOverlay}>
              <View style={styles.userInfoContainer}>
                <View style={styles.nameAgeContainer}>
                  <Text style={styles.userName}>
                    {notification.sender?.username || notification.user?.username}
                  </Text>
                  <Text style={styles.userAge}>
                    {notification.sender?.age || notification.user?.age}
                  </Text>
                </View>
                <View style={styles.locationContainer}>
                  <Ionicons name="location" size={18} color="#fff" />
                  <Text style={styles.locationText}>
                    {notification.sender?.location || notification.user?.location || notification.senderLocation}
                  </Text>
                </View>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity 
                    style={[styles.button, styles.acceptButton]} 
                    onPress={() => {
                      onAccept();
                      setShowModal(false);
                    }}
                  >
                    <Ionicons name="heart" size={28} color="#fff" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.button, styles.rejectButton]} 
                    onPress={() => {
                      onReject();
                      setShowModal(false);
                    }}
                  >
                    <Ionicons name="close" size={28} color="#ff4d4d" />
                  </TouchableOpacity>
                </View>
              </View>
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
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 450,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  userInfoContainer: {
    padding: 25,
    paddingBottom: 35,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  nameAgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingLeft: 10,
  },
  userName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
    marginRight: 10,
  },
  userAge: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingLeft: 10,
  },
  locationText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 5,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 40,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  acceptButton: {
    backgroundColor: '#6366f1',
  },
  rejectButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ff4d4d',
  },
});

export default MatchNotification;
