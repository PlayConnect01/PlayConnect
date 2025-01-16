import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const categories = [
  { name: 'Gym', icon: 'fitness-center', screen: 'GymProducts' },
  { name: 'Cricket', icon: 'sports-cricket', screen: 'CricketProducts' },
  { name: 'Rowing', icon: 'rowing', screen: 'RowingProducts' },
  { name: 'Skating', icon: 'skateboarding', screen: 'SkatingProducts' },
  { name: 'E-Sports', icon: 'sports-esports', screen: 'ESportsProducts' },
  { name: 'Walking', icon: 'directions-walk', screen: 'WalkingProducts' },
  { name: 'Football', icon: 'sports-football', screen: 'FootballProducts' },
  { name: 'Basketball', icon: 'sports-basketball', screen: 'BasketballProducts' },
  { name: 'Baseball', icon: 'sports-baseball', screen: 'BaseballProducts' },
  { name: 'Hockey', icon: 'sports-hockey', screen: 'HockeyProducts' },
  { name: 'MMA', icon: 'sports-mma', screen: 'MMAProducts' },
  { name: 'Tennis', icon: 'sports-tennis', screen: 'TennisProducts' },
  { name: 'Boxing', icon: 'sports-mma', screen: 'BoxingProducts' },
  { name: 'Running', icon: 'directions-run', screen: 'RunningProducts' },
  { name: 'Swimming', icon: 'pool', screen: 'SwimmingProducts' },
  { name: 'Yoga', icon: 'self-improvement', screen: 'YogaProducts' },
  { name: 'My Products', icon: 'inventory', screen: 'UserProducts' },
];

const Sidebar = () => {
  const navigation = useNavigation();

  const navigateToCategory = (category) => {
    navigation.navigate(category.screen);
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
              onPress={() => navigateToCategory(category)}
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
    height: 20,
  },
});

export default Sidebar;
