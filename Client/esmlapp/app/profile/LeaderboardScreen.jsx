import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../../Api';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const LeaderboardScreen = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/leaderboard`);
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboard();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const renderTopThree = () => {
    const topThree = leaderboard.slice(0, 3);
    return (
      <View style={styles.topThreeContainer}>
        {/* Second Place */}
        {topThree[1] && (
          <View style={[styles.topThreeItem, styles.secondPlace]}>
            <MaterialIcons name="star" size={24} color="#C0C0C0" />
            <Image
              source={{ uri: topThree[1].profile_picture }}
              style={styles.topThreeImage}
            />
            <Text style={styles.topThreeName} numberOfLines={1}>
              {topThree[1].username}
            </Text>
            <Text style={styles.topThreePoints}>{topThree[1].points} pts</Text>
          </View>
        )}

        {/* First Place */}
        {topThree[0] && (
          <View style={[styles.topThreeItem, styles.firstPlace]}>
            <MaterialIcons name="star" size={32} color="#FFD700" />
            <Image
              source={{ uri: topThree[0].profile_picture }}
              style={[styles.topThreeImage, styles.firstPlaceImage]}
            />
            <Text style={[styles.topThreeName, styles.firstPlaceName]} numberOfLines={1}>
              {topThree[0].username}
            </Text>
            <Text style={[styles.topThreePoints, styles.firstPlacePoints]}>
              {topThree[0].points} pts
            </Text>
          </View>
        )}

        {/* Third Place */}
        {topThree[2] && (
          <View style={[styles.topThreeItem, styles.thirdPlace]}>
            <MaterialIcons name="star" size={24} color="#CD7F32" />
            <Image
              source={{ uri: topThree[2].profile_picture }}
              style={styles.topThreeImage}
            />
            <Text style={styles.topThreeName} numberOfLines={1}>
              {topThree[2].username}
            </Text>
            <Text style={styles.topThreePoints}>{topThree[2].points} pts</Text>
          </View>
        )}
      </View>
    );
  };

  const renderItem = ({ item }) => {
    if (item.rank <= 3) return null;

    return (
      <TouchableOpacity
        style={styles.rankItem}
        onPress={() => navigation.navigate('UserProfile', { userId: item.id })}
      >
        <View style={styles.rankContainer}>
          <Text style={styles.rank}>#{item.rank}</Text>
        </View>
        <Image
          source={{ uri: item.profile_picture }}
          style={styles.profilePic}
        />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.stats}>
            {item.points} Points • {item.events_created} Events
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('profile/ProfilePage')}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Leaderboard</Text>
        <View style={styles.backButton} /> {/* Empty view for balanced spacing */}
      </View>
      <FlatList
        data={leaderboard}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={renderTopThree}
        contentContainerStyle={styles.listContainer}
      />
    </View>
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
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  topThreeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingVertical: 20,
    backgroundColor: '#f8f8f8',
    marginBottom: 16,
    borderRadius: 12,
  },
  topThreeItem: {
    alignItems: 'center',
    marginHorizontal: 10,
    width: width * 0.25,
  },
  firstPlace: {
    marginBottom: -15,
  },
  secondPlace: {
    marginBottom: 15,
  },
  thirdPlace: {
    marginBottom: 15,
  },
  topThreeImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#C0C0C0',
    marginVertical: 8,
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
    textAlign: 'center',
  },
  firstPlaceName: {
    fontSize: 16,
  },
  topThreePoints: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  firstPlacePoints: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 8,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666666',
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
  },
  stats: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default LeaderboardScreen;