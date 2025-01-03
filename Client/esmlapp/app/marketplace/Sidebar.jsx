import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const categories = [
  { name: 'Gym', icon: 'fitness-center' },
  { name: 'Cricket', icon: 'sports-cricket' },
  { name: 'Rowing', icon: 'rowing' },
  { name: 'Skating', icon: 'skateboarding' },
  { name: 'E-Sports', icon: 'sports-esports' },
  { name: 'Trophies', icon: 'emoji-events' },
  { name: 'Walking', icon: 'directions-walk' },
  { name: 'Football', icon: 'sports-football' },
  { name: 'Basketball', icon: 'sports-basketball' },
  { name: 'Baseball', icon: 'sports-baseball' },
  { name: 'Hockey', icon: 'sports-hockey' },
  { name: 'MMA', icon: 'sports-mma' },
  { name: 'Tennis', icon: 'sports-tennis' },
];

const Sidebar = () => {
  const navigation = useNavigation();

  const navigateToCategory = (category) => {
    const routeMap = {
      'Gym': 'GymProducts',
      'Cricket': 'CricketProducts',
      'Rowing': 'RowingProducts',
      'Skating': 'SkatingProducts',
      'E-Sports': 'ESportsProducts',
      'Trophies': 'TrophiesProducts',
      'Walking': 'WalkingProducts',
      'Football': 'FootballProducts',
      'Basketball': 'BasketballProducts',
      'Baseball': 'BaseballProducts',
      'Hockey': 'HockeyProducts',
      'MMA': 'MMAProducts',
      'Tennis': 'TennisProducts',
      'Add Product': 'AddProduct',
      'My Products': 'UserProducts',
    };

    const route = routeMap[category];
    if (route) {
      navigation.navigate(route);
    }
  };

  return (
    <View style={styles.sidebar}>
      <Text style={styles.sidebarTitle}>Categories</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.name}
            style={styles.categoryButton}
            onPress={() => navigateToCategory(category.name)}
          >
            <MaterialIcons name={category.icon} size={24} color="#333" />
            <Text style={styles.categoryText}>{category.name}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={styles.categoryButton}
          onPress={() => navigateToCategory('Add Product')}
        >
          <MaterialIcons name="add-circle-outline" size={24} color="#333" />
          <Text style={styles.categoryText}>Add Product</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.categoryButton}
          onPress={() => navigateToCategory('My Products')}
        >
          <MaterialIcons name="inventory" size={24} color="#333" />
          <Text style={styles.categoryText}>My Products</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 200,
    backgroundColor: '#f8f9fa',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    padding: 20,
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoryText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
});

export default Sidebar;
