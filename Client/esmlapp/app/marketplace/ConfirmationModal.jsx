import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ConfirmationModal = ({ visible, onConfirm, onCancel, message }) => {
  const scaleValue = new Animated.Value(0);

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      scaleValue.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <Animated.View 
          style={[
            styles.modalContainer,
            { transform: [{ scale: scaleValue }] }
          ]}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="trash-bin-outline" size={40} color="#FF4B4B" />
          </View>
          
          <Text style={styles.title}>Delete Item</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Ionicons name="close-outline" size={20} color="#4FA5F5" />
              <Text style={[styles.buttonText, styles.cancelText]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={onConfirm}
            >
              <Ionicons name="trash-outline" size={20} color="#FFF" />
              <Text style={[styles.buttonText, styles.deleteText]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: Dimensions.get('window').width * 0.85,
    alignItems: 'center',
    shadowColor: '#4FA5F5',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#EDF2F7',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  deleteButton: {
    backgroundColor: '#FF4B4B',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelText: {
    color: '#4FA5F5',
  },
  deleteText: {
    color: '#FFFFFF',
  },
});

export default ConfirmationModal;
