import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

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

const Sidebar = ({ onSelectCategory }) => {
  return (
    <View style={styles.sidebar}>
      <Text style={styles.sidebarTitle}>Categories</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={styles.categoryItem}
            onPress={() => onSelectCategory(category.name)}
          >
            <MaterialIcons name={category.icon} size={24} color="#6e3de8" />
            <Text style={styles.categoryText}>{category.name}</Text>
          </TouchableOpacity>
        ))}
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
  categoryItem: {
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
