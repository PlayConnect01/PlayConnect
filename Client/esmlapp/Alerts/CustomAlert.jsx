import React, { useEffect } from 'react';
import { View, Text, Modal, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';

const CustomAlert = ({ visible, title, message, onClose, buttons, timeout = null }) => {
  useEffect(() => {
    if (visible && timeout) {
      const timer = setTimeout(() => {
        onClose();
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, [visible, onClose, timeout]);

  const isError = title?.toLowerCase() === 'error';
  const isSuccess = title?.toLowerCase() === 'success';

  const renderButtons = () => {
    if (!buttons || buttons.length === 0) {
      return (
        <TouchableOpacity
          style={styles.button}
          onPress={onClose}
        >
          <Text style={styles.buttonText}>OK</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.buttonContainer}>
        {buttons.map((button, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.button,
              index < buttons.length - 1 && styles.buttonMarginRight,
              button.style?.backgroundColor && { backgroundColor: button.style.backgroundColor }
            ]}
            onPress={button.onPress}
          >
            <Text style={[
              styles.buttonText,
              button.style
            ]}>
              {button.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

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
          {renderButtons()}
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
    marginBottom: 20,
  },
  errorTitle: {
    color: '#ff0000',
  },
  successTitle: {
    color: '#28a745',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    width: '100%',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    minWidth: 100,
    alignItems: 'center',
  },
  buttonMarginRight: {
    marginRight: 10,
  },
  buttonText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  }
});

export default CustomAlert;
