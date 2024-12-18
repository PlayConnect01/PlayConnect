import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';

const App = () => {
  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Home</Text>
          <View style={styles.iconsContainer}>
            <TouchableOpacity>
              <Text style={styles.icon}>🛒</Text>
            </TouchableOpacity>
            <TouchableOpacity>
             <Text style={styles.icon}>❤️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Most Popular</Text>
          <Text style={styles.arrow}>➔</Text>
        </View>

        {/* Card Section */}
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Image
              source={{ uri: 'https://placekitten.com/200/200' }} // Replace with fish image URL
              style={styles.image}
            />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>6 Month</Text>
            </View>
            <Text style={styles.cardTitle}>Halfmoon</Text>
            <Text style={styles.rating}>★★★★★</Text>
            <Text style={styles.author}>Kaiya Franci</Text>
            <Text style={styles.price}>$169</Text>
          </View>

          <View style={styles.card}>
            <Image
              source={{ uri: 'https://placekitten.com/200/201' }} // Replace with fish image URL
              style={styles.image}
            />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3 Month</Text>
            </View>
            <Text style={styles.cardTitle}>Crown Tail</Text>
            <Text style={styles.rating}>★★★★★</Text>
            <Text style={styles.author}>Aspen Stanton</Text>
            <Text style={styles.price}>$202</Text>
          </View>
        </View>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lowest Prices</Text>
          <Text style={styles.arrow}>➔</Text>
        </View>
        {/* Add further cards here */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 15,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  menuIcon: {
    fontSize: 20,
    color: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  iconsContainer: {
    flexDirection: 'row',
  },
  icon: {
    fontSize: 18,
    marginLeft: 10,
    color: '#333',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  arrow: {
    fontSize: 18,
    color: '#888',
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#F87C99',
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  badgeText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  rating: {
    color: '#FFD700',
    marginBottom: 5,
  },
  author: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default App;
