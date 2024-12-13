import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const AuthOptionsScreen = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const navigate = useNavigation();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;

  const handlePageChange = (nextPage) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentPage(nextPage);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(titleAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const renderContent = () => {
    const titleStyle = {
      opacity: titleAnim,
      transform: [{ translateY: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }],
    };

    switch (currentPage) {
      case 0:
        return (
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <Animated.Text style={[styles.title, titleStyle]}>Welcome to SportsMate</Animated.Text>
            <Animated.Text style={[styles.subtitle, titleStyle]}>Your journey in sports starts here!</Animated.Text>
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => handlePageChange(1)}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
          </Animated.View>
        );
      case 1:
        return (
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <Animated.Text style={[styles.title, titleStyle]}>Get Started</Animated.Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigate.navigate('Login')}
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigate.navigate('SignUp')}
            >
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
          </Animated.View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#1c1c1c", "#333"]} style={styles.gradientBackground} />
      <View style={styles.dynamicShapes}>
        <View style={styles.shape1} />
        <View style={styles.shape2} />
      </View>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dynamicShapes: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  shape1: {
    position: 'absolute',
    width: 300,
    height: 300,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 150,
    top: -100,
    left: -100,
    transform: [{ rotate: '30deg' }],
  },
  shape2: {
    position: 'absolute',
    width: 400,
    height: 400,
    backgroundColor: 'rgba(255, 0, 150, 0.1)',
    borderRadius: 200,
    bottom: -150,
    right: -150,
    transform: [{ rotate: '-30deg' }],
  },
  content: {
    width: '80%',
    alignItems: 'center',
    zIndex: 1,
  },
  title: {
    fontSize: 32,
    color: '#fff',
    marginBottom: 10,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 30,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  button: {
    backgroundColor: '#ff4081',
    padding: 12,
    marginTop: 20,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AuthOptionsScreen;
