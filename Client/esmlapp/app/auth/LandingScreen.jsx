import React, { useState   } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView } from 'react-native-gesture-handler';
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window');

const Landing = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const navigate = useNavigation();

  const pages = [
    {
      title: "Welcome to SportsMaven",
      description: "Discover partners, explore events, and gear up for your favorite sport!",
      image:require('../../assets/images/welcome_screen.png.webp')
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
        <Animatable.Image
          animation="fadeIn"
          duration={1000}
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
      <LinearGradient colors={["#00264d", "#004080"]} style={styles.gradientBackground} />
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
    marginTop: 20,
  },
  image: {
    width: 300,
    height: 300,
    marginBottom: 20,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#ffcc00',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10, // For Android shadow
  },
  title: {
    fontSize: 28,
    color: '#ffcc00',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Roboto-Bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  description: {
    fontSize: 18,
    color: '#e6f2ff',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
    fontFamily: 'Roboto-Regular',
    lineHeight: 24,
    opacity: 0.9,
  },
  indicatorContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 120,
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ccc',
    margin: 5,
    borderWidth: 1,
    borderColor: '#000',
    opacity: 0.8,
  },
  activeIndicator: {
    backgroundColor: '#ffcc00',
    transform: [{ scale: 1.2 }],
  },
  button: {
    backgroundColor: '#ff6600',
    padding: 15,
    borderRadius: 25,
    position: 'absolute',
    bottom: 40,
    width: '80%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffe680',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});

export default Landing;
