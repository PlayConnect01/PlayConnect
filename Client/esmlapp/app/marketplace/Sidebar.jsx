import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  { name: 'My Products', icon: 'inventory' },
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
      'My Products': 'UserProducts',
    };

    const route = routeMap[category];
    if (route) {
      navigation.navigate(route);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.sidebar}>
        <Text style={styles.sidebarTitle}>Categories</Text>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
          overScrollMode="always"
        >
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
          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingBottom: 80, 
  },
  sidebar: {
    width: 200,
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 16,
    paddingHorizontal: 20,
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 80, 
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoryText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  bottomPadding: {
    height: 60, 
  },
});

export default Sidebar;
