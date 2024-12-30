import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

const Landing = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const navigate = useNavigation();

  const pages = [
    {
      title: "Welcome to PlayConnect",
      description: "Discover partners, explore events, and gear up for your favorite sport!",
      image: require('../../assets/images/welcome_screen.png.webp')
    },
    {
      title: "Find Your Sports Partner",
      description: "Connect with enthusiasts who share your passion for the game.",
      image: require('../../assets/images/Join Exciting Events.webp'),
    },
    {
      title: "Join Exciting Events",
      description: "Stay in the loop with events that match your interests.",
      image: require('../../assets/images/Find Your Sports Partner.webp'),
    },
    {
      title: "Gear Up for Your Journey",
      description: "Shop top-notch products to enhance your performance.",
      image: require('../../assets/images/Gear Up for Your Journey.webp'),
    },
    {
      title: "Let’s Get Started",
      description: "Sign up or log in and unleash your sporting potential!",
      image: require('../../assets/images/LetGetStarted.png'),
    },
  ];

  const handleScroll = (event) => {
    const pageIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentPage(pageIndex);
  };

  const renderPages = () => {
    return pages.map((page, index) => (
      <View key={index} style={styles.page}>
        <Image source={page.image} style={styles.image} />
        <Text style={styles.title}>{page.title}</Text>
        <Text style={styles.description}>{page.description}</Text>
      </View>
    ));
  };

  return (
    <View style={styles.container}>
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
    backgroundColor: '#fff',
  },
  page: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 300,
    height: 300,
    marginBottom: 20,
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
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
    backgroundColor: '#ccc',
    margin: 5,
  },
  activeIndicator: {
    backgroundColor: '#333',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 25,
    position: 'absolute',
    bottom: 40,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Landing;
