import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView } from 'react-native-gesture-handler';
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window');

const OnboardingScreen = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const navigate = useNavigation();

  const pages = [
    {
      title: "Welcome to SportsMate",
      description: "Find your perfect esports team and compete!",
      image: require('../../assets/images/landing.jpeg'),
    },
    {
      title: "Join Competitive Teams",
      description: "Connect with gamers who share your passion.",
      image: require('../../assets/images/landing.jpeg'),
    },
    {
      title: "Track Your Stats",
      description: "Monitor your gaming achievements and rankings.",
      image: require('../../assets/images/landing.jpeg'),
    },
    {
      title: "Get Started",
      description: "Sign up or log in to join the competition.",
      image: require('../../assets/images/landing.jpeg'),
    },
  ];

  const handleScroll = (event) => {
    const pageIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentPage(pageIndex);
  };

  const renderPages = () => {
    return pages.map((page, index) => (
      <View key={index} style={styles.page}>
        <Animatable.Image
          animation="bounceIn"
          duration={1500}
          source={page.image}
          style={styles.image}
        />
        <Text style={styles.title}>{page.title}</Text>
        <Text style={styles.description}>{page.description}</Text>
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#1c1c1c", "#333"]} style={styles.gradientBackground} />
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {renderPages()}
      </ScrollView>
      <View style={styles.indicatorContainer}>
        {pages.map((_, index) => (
          <View key={index} style={[styles.indicator, currentPage === index && styles.activeIndicator]} />
        ))}
      </View>
      {currentPage === pages.length - 1 && (
        <TouchableOpacity style={styles.button} onPress={() => navigate.navigate('Login')}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  page: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 250,
    height: 250,
    marginBottom: 20,
    borderRadius: 20,
  },
  title: {
    fontSize: 28,
    color: '#ffcc00', // Change color for esports theme
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Roboto-Bold', // Use a bold font
  },
  description: {
    fontSize: 16,
    color: '#fff', // Change description color
    textAlign: 'center',
    marginBottom: 30,
  },
  indicatorContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 100,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#888',
    margin: 5,
  },
  activeIndicator: {
    backgroundColor: '#ffcc00', // Active indicator color
  },
  button: {
    backgroundColor: '#ff4081',
    padding: 15,
    borderRadius: 25,
    position: 'absolute',
    bottom: 40,
    width: '80%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffcc00', // Border for button
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;