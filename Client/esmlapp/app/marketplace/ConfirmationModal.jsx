import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

const ConfirmationModal = ({ 
  visible, 
  onConfirm, 
  onCancel, 
  message, 
  title, 
  confirmText = 'Yes', 
  cancelText = 'No', 
  onSuccessMessage = '', 
  onCancelMessage = '' 
}) => {
  const handleConfirm = () => {
    if (onSuccessMessage) {
      alert(onSuccessMessage);
    }
    onConfirm();
  };

  const handleCancel = () => {
    if (onCancelMessage) {
      alert(onCancelMessage);
    }
    onCancel();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {title && (
            <View style={styles.titleContainer}>
              <Icon name="question-circle" size={24} color="#FF4500" style={styles.titleIcon} />
              <Text style={styles.title}>{title}</Text>
            </View>
          )}
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
              <Icon name="check" size={16} color="#FFF" style={styles.buttonIcon} />
              <Text style={styles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
              <Icon name="times" size={16} color="#333" style={styles.buttonIcon} />
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleIcon: {
    marginRight: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    color: '#222',
  },
  message: {
    fontSize: 18,
    fontWeight: '400',
    marginBottom: 30,
    textAlign: 'center',
    color: '#555',
    lineHeight: 26,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  confirmButton: {
    backgroundColor: '#FF4500',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 25,
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 10,
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  confirmText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#CCCCCC',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 25,
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 10,
    shadowColor: '#999',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cancelText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 5,
  },
});

export default ConfirmationModal;
