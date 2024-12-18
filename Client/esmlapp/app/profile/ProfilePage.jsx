import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to calculate user level based on points
  const calculateLevel = (points) => {
    if (points < 1000) return 1;
    if (points < 2000) return 2;
    if (points < 3000) return 3;
    if (points < 5000) return 4;
    return 5;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const pointsResponse = await fetchUserPoints();
        const userResponse = await axios.get('http://192.168.103.8:3000/user');
        setUserData({ ...userResponse.data, currentPoints: pointsResponse });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get('http://192.168.103.8:3000/leaderboard');
        setLeaderboard(response.data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    };

    const loadData = async () => {
      await Promise.all([fetchUserData(), fetchLeaderboard()]);
      setLoading(false);
    };

    loadData();
  }, []);

  const fetchUserPoints = async () => {
    try {
      const response = await axios.get('http://192.168.103.8:3000/points/userPoints');
      return response.data.points;
    } catch (error) {
      console.error('Error fetching points:', error);
      return 0;
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#6F61E8" style={styles.loader} />;
  }

  if (!userData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load user data.</Text>
      </View>
    );
  }

  const userLevel = calculateLevel(userData.currentPoints);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile */}
      <View style={styles.profileContainer}>
        <Image source={{ uri: userData.profilePic || 'https://via.placeholder.com/150' }} style={styles.profileImage} />
        <Text style={styles.profileName}>{userData.name}</Text>
        <Text style={styles.email}>
          {userData.email} <MaterialIcons name="verified" size={16} color="green" />
        </Text>
        <TouchableOpacity style={styles.editProfileButton}>
          <Text style={styles.editProfileText}>Edit Profile</Text>
          <MaterialIcons name="arrow-drop-down" size={18} color="gray" />
        </TouchableOpacity>
      </View>

      {/* Level Display */}
      <View style={styles.levelContainer}>
        <Text style={styles.levelText}>Level: {userLevel}</Text>
        <Text style={styles.pointsText}>
          {userData.totalPoints - userData.currentPoints} Points to next level
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={styles.tabTextActive}>Achievement</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Events</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Reviews</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>#{userData.leaderboardRank}</Text>
          <Text style={styles.statLabel}>Leaderboard</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{userData.events}</Text>
          <Text style={styles.statLabel}>Events</Text>
        </View>
      </View>

      {/* Achievement */}
      <View style={styles.achievementContainer}>
        <MaterialIcons name="emoji-events" size={30} color="#FFC107" />
        <View>
          <Text style={styles.achievementText}>
            Earned <Text style={{ fontWeight: 'bold' }}>{userData.achievement}</Text>
          </Text>
          <Text style={styles.dateText}>{userData.achievementDate}</Text>
        </View>
      </View>

      {/* Leaderboard */}
      <View style={styles.leaderboardContainer}>
        <Text style={styles.leaderboardTitle}>Leaderboard</Text>
        <FlatList
          data={leaderboard}
          keyExtractor={(item) => item.user_id.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.leaderboardItem}>
              <Text style={styles.leaderboardRank}>{index + 1}.</Text>
              <Text style={styles.leaderboardUsername}>{item.username}</Text>
              <Text style={styles.leaderboardPoints}>{item.points} points</Text>
            </View>
          )}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  profileContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  email: {
    color: 'gray',
    fontSize: 14,
    marginBottom: 10,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 8,
  },
  editProfileText: {
    fontSize: 14,
    color: 'gray',
  },
  levelContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  pointsText: {
    color: 'gray',
    marginVertical: 5,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  tab: {
    paddingVertical: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderColor: '#6F61E8',
  },
  tabText: {
    color: 'gray',
  },
  tabTextActive: {
    color: '#6F61E8',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 10,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'gray',
    fontSize: 14,
  },
  achievementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    backgroundColor: '#FFF3CD',
    padding: 10,
    borderRadius: 10,
  },
  achievementText: {
    fontSize: 14,
    marginLeft: 10,
  },
  dateText: {
    fontSize: 12,
    color: 'gray',
    marginLeft: 10,
  },
  leaderboardContainer: {
    marginVertical: 20,
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  leaderboardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  leaderboardRank: {
    fontWeight: 'bold',
  },
  leaderboardUsername: {
    flex: 1,
    marginLeft: 10,
  },
  leaderboardPoints: {
    fontWeight: 'bold',
  },
});

export default ProfilePage;
