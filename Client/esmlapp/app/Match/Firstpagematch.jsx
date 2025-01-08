import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text,
  TouchableOpacity, 
  SafeAreaView,
  Image 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';

const GradientButton = ({ onPress, title, style }) => (
  <TouchableOpacity 
    onPress={onPress}
    style={[styles.buttonContainer, style]}
  >
    <LinearGradient
      colors={['#0080FF', '#0A66C2', '#0080FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradient}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const App = () => {
  const navigation = useNavigation();
  const chatId = 'your-chat-id'; // Replace with your actual chat ID
  const BASE_URL = 'your-base-url'; // Replace with your actual base URL




  const handleMatchNow = () => {
    navigation.navigate('Matchingpage');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image 
        source={require('../../assets/images/find people with same interest.jpg')} 
        style={styles.background}
      />
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={handleBack}
      >
        <Ionicons name="chevron-back" size={30} color="#fff" />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.buttonsWrapper}>
          <GradientButton
            title="Match Now"
            onPress={handleMatchNow}
            style={styles.matchButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: '70%',
  },
  buttonsWrapper: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '80%',
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gradient: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  matchButton: {
    width: '100%',
    maxWidth: 300,
  },
});

export default App;