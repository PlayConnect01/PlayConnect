import React, { useEffect } from 'react';
import { View, Text, Modal, StyleSheet, Dimensions } from 'react-native';

const CustomAlert = ({ visible, title, message, onClose, timeout = 3000 }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, [visible, onClose, timeout]);

  const isError = title?.toLowerCase() === 'error';
  const isSuccess = title?.toLowerCase() === 'success';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.alertBox}>
          <Text style={[
            styles.title,
            isError && styles.errorTitle,
            isSuccess && styles.successTitle
          ]}>
            {title}
          </Text>
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    width: width - 60,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
  },
  errorTitle: {
    color: '#ff0000',
  },
  successTitle: {
    color: '#28a745',
  },
});

export default CustomAlert;
