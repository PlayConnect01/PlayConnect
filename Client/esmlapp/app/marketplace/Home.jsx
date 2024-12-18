import React from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native'; 
const Home = () => {
    const navigate= useNavigation()

    const handleTabPress = (tab) => {
      // Navigate to the corresponding page based on the tab pressed
      navigate.navigate(tab); // Ensure you have the correct route names set up in your navigation
  };

  return (
    <View style={styles.container}>
      {/* Main Scrollable Container */}
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Home</Text>
          <View style={styles.iconContainer}>
            <TouchableOpacity>
              <Text style={styles.icon}>🛒</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.icon}>❤️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <TextInput
            placeholder="Search..."
            placeholderTextColor="#999"
            style={styles.searchInput}
          />
        </View>


        {/* Discover Section */}
       
  <Text style={styles.sectionTitle}>Discover</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.tabContainer}
            >
                <TouchableOpacity onPress={() => handleTabPress('products')}>
                    <Text style={styles.activeTab}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleTabPress('products')}>
                    <Text style={styles.inactiveTab}>Football</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleTabPress('products')}>
                    <Text style={styles.inactiveTab}>Basketball</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleTabPress('products')}>
                    <Text style={styles.inactiveTab}>Esports</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleTabPress('products')}>
                    <Text style={styles.inactiveTab}>Tennis</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleTabPress('products')}>
                    <Text style={styles.inactiveTab}>gaming</Text>
                </TouchableOpacity>
                
             
            </ScrollView>


        

        {/* Image Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.cardContainer}
        >
          {products.map((product, index) => (
            <View key={index} style={styles.card}>
              <Image source={{ uri: product.image }} style={styles.cardImage} />
              <Text style={styles.cardTitle}>{product.name}</Text>
              <Text style={styles.cardPrice}>{product.price}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Discount Section */}
        <Text style={styles.sectionTitle}>Discount and Promo</Text>
        {discounts.map((discount, index) => (
          <View key={index} style={styles.discountItem}>
            <Image source={{ uri: discount.image }} style={styles.discountImage} />
            <View>
              <Text style={styles.discountTitle}>{discount.name}</Text>
              <Text style={styles.discountPrice}>
                {discount.price} <Text style={styles.discountOldPrice}>{discount.oldPrice}</Text>
              </Text>
            </View>
            <TouchableOpacity style={styles.cartButton}>
              <Text style={styles.cartIcon}>🛒</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity>
          <Text style={styles.navIcon}>🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.navIcon}>🔍</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.navIcon}>❤️</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.navIcon}>👤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const products = [
  { name: 'Football Jersey', price: '$49', image: 'https://via.placeholder.com/100' },
  { name: 'Basketball Shoes', price: '$89', image: 'https://via.placeholder.com/100' },
  { name: 'Gaming Headset', price: '$69', image: 'https://via.placeholder.com/100' },
  { name: 'Esports Chair', price: '$199', image: 'https://via.placeholder.com/100' },
  { name: 'Tennis Racket', price: '$120', image: 'https://via.placeholder.com/100' },
  { name: 'Racing Wheel', price: '$250', image: 'https://via.placeholder.com/100' },
  { name: 'VR Headset', price: '$299', image: 'https://via.placeholder.com/100' },
];

const discounts = [
  { name: 'Soccer Ball', price: '$25', oldPrice: '$35', image: 'https://via.placeholder.com/80' },
  { name: 'Gaming Mouse', price: '$45', oldPrice: '$60', image: 'https://via.placeholder.com/80' },
  { name: 'Basketball', price: '$30', oldPrice: '$50', image: 'https://via.placeholder.com/80' },
  { name: 'Football Cleats', price: '$60', oldPrice: '$80', image: 'https://via.placeholder.com/80' },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Changed to white
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 22,
    color: '#000', // Changed to black for better contrast
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000', // Changed to black for better contrast
  },
  iconContainer: {
    flexDirection: 'row',
  },
  icon: {
    fontSize: 20,
    marginLeft: 10,
    color: '#000', // Changed to black for better contrast
  },
  searchSection: {
    marginTop: 20,
  },
  searchInput: {
    backgroundColor: '#f0f0f0', // Light grey for input background
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    color: '#000', // Changed to black for better contrast
  },
  sectionTitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000', // Changed to black for better contrast
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  activeTab: {
    fontSize: 16,
    color: '#ff3b8f',
    marginRight: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#ff3b8f',
    paddingBottom: 5,
  },
  inactiveTab: {
    fontSize: 16,
    color: '#999',
    marginRight: 15,
  },
  cardContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  card: {
    width: 120,
    marginRight: 10,
    backgroundColor: '#f9f9f9', // Light grey for card background
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    elevation: 3,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  cardTitle: {
    marginTop: 5,
    fontWeight: 'bold',
    color: '#000', // Changed to black for better contrast
  },
  cardPrice: {
    color: '#ff3b8f',
  },
  discountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#f9f9f9', // Light grey for discount item background
    borderRadius: 10,
    padding: 10,
    elevation: 3,
  },
  discountImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
  },
  discountTitle: {
    fontWeight: 'bold',
    color: '#000', // Changed to black for better contrast
  },
  discountPrice: {
    color: '#ff3b8f',
    fontSize: 16,
  },
  discountOldPrice: {
    textDecorationLine: 'line-through',
    color: '#999',
    fontSize: 14,
  },
  cartButton: {
    marginLeft: 'auto',
  },
  cartIcon: {
    fontSize: 24,
    color: '#ff3b8f',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd', // Light grey for border
    backgroundColor: '#ffffff', // White for bottom nav background
  },
  navIcon: {
    fontSize: 24,
    color: '#ff3b8f',
  },
});

export default Home;

    