import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Easing } from 'react-native';

const CustomToast = ({ message, type, onHide }) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Play haptic feedback
    Haptics.notificationAsync(
      type === 'error' 
        ? Haptics.NotificationFeedbackType.Error 
        : Haptics.NotificationFeedbackType.Success
    );

    // Show animation
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Hide after delay
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => onHide());
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#4FA5F5',
          icon: 'check-circle-outline',
          title: 'Success',
          gradient: ['#4FA5F5', '#6366F1']
        };
      case 'error':
        return {
          backgroundColor: '#DC2626',
          icon: 'error-outline',
          title: 'Error',
          gradient: ['#DC2626', '#EF4444']
        };
      case 'info':
        return {
          backgroundColor: '#4FA5F5',
          icon: 'info-outline',
          title: 'Info',
          gradient: ['#4FA5F5', '#818CF8']
        };
      default:
        return {
          backgroundColor: '#4FA5F5',
          icon: 'check-circle-outline',
          title: 'Success',
          gradient: ['#4FA5F5', '#6366F1']
        };
    }
  };

  const toastStyle = getToastStyle();

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          transform: [
            { translateY },
            { scale }
          ],
          opacity,
        },
      ]}
    >
      <View style={[styles.notificationBar, { backgroundColor: toastStyle.backgroundColor }]}>
        <View style={styles.notificationHeader}>
          <MaterialIcons 
            name="notifications" 
            size={14} 
            color="#FFF" 
            style={styles.notificationIcon} 
          />
          <Text style={styles.appName}>SportsMate</Text>
          <Text style={styles.timeText}>now</Text>
        </View>
      </View>
      <View style={[styles.toastContent, { backgroundColor: toastStyle.backgroundColor }]}>
        <View style={styles.iconContainer}>
          <MaterialIcons name={toastStyle.icon} size={28} color="#FFFFFF" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.toastTitle}>{toastStyle.title}</Text>
          <Text style={styles.toastText}>{message}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    right: 20,
    backgroundColor: '#4FA5F5',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 1000,
  },
  notificationBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.7,
  },
  toastContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  toastTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
  },
  notificationIcon: {
    marginRight: 8,
  },
});

export default CustomToast;
