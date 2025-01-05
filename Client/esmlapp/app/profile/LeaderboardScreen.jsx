import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../../Api';

const { width } = Dimensions.get('window');

const LeaderboardScreen = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'month', 'week'
  const navigation = useNavigation();

  useEffect(() => {
    fetchLeaderboard();
  }, [timeFilter]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/leaderboard`);
      // Sort by points in descending order
      const sortedLeaderboard = response.data.sort((a, b) => b.points - a.points);
      setLeaderboard(sortedLeaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (index) => {
    switch (index) {
      case 0:
        return '#FFD700'; // Gold
      case 1:
        return '#C0C0C0'; // Silver
      case 2:
        return '#CD7F32'; // Bronze
      default:
        return '#6F61E8'; // Default purple
    }
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.playerCard}
      onPress={() => navigation.navigate('OtherUserProfile', { userId: item.user_id })}
    >
      <View style={styles.rankContainer}>
        <View style={[styles.rankBadge, { backgroundColor: getRankColor(index) }]}>
          <Text style={styles.rankText}>#{index + 1}</Text>
        </View>
      </View>
      
      <Image
        source={{ uri: item.profile_picture || 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541' }}
        style={styles.profileImage}
      />
      
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{item.username}</Text>
        <View style={styles.pointsContainer}>
          <MaterialIcons name="star" size={16} color="#FFD700" />
          <Text style={styles.pointsText}>{item.points} points</Text>
        </View>
      </View>
      
      <MaterialIcons name="chevron-right" size={24} color="#666" />
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <View style={styles.topThree}>
        {leaderboard.slice(0, 3).map((player, index) => (
          <View key={index} style={[styles.topThreeItem, index === 1 && styles.firstPlace]}>
            <View style={[styles.crown, index === 1 && styles.crownFirst]}>
              <MaterialIcons 
                name="star" 
                size={index === 1 ? 32 : 24} 
                color={getRankColor(index)}
              />
            </View>
            <Image
              source={{ uri: player.profile_picture || 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541' }}
              style={[styles.topThreeImage, index === 1 && styles.firstPlaceImage]}
            />
            <Text style={styles.topThreeName} numberOfLines={1}>{player.username}</Text>
            <Text style={styles.topThreePoints}>{player.points} pts</Text>
          </View>
        ))}
      </View>

      <View style={styles.filterContainer}>
        {['all', 'month', 'week'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterButton, timeFilter === filter && styles.activeFilter]}
            onPress={() => setTimeFilter(filter)}
          >
            <Text style={[styles.filterText, timeFilter === filter && styles.activeFilterText]}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("profile/ProfilePage")}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <View style={{ width: 24 }} /> {/* Empty view for spacing */}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6F61E8" style={styles.loader} />
      ) : (
        <FlatList
          data={leaderboard.slice(3)} // Exclude top 3 as they're in the header
          renderItem={renderItem}
          keyExtractor={(item) => item.user_id.toString()}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSection: {
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  topThree: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingVertical: 20,
    marginBottom: 20,
  },
  topThreeItem: {
    alignItems: 'center',
    marginHorizontal: 10,
    width: width * 0.25,
  },
  firstPlace: {
    marginBottom: -20,
  },
  crown: {
    marginBottom: 5,
  },
  crownFirst: {
    marginBottom: 10,
  },
  topThreeImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#C0C0C0',
  },
  firstPlaceImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderColor: '#FFD700',
    borderWidth: 3,
  },
  topThreeName: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  topThreePoints: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: '#f0f0f0',
  },
  activeFilter: {
    backgroundColor: '#6F61E8',
  },
  filterText: {
    color: '#666',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    marginLeft: 4,
    color: '#666',
    fontSize: 14,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LeaderboardScreen;