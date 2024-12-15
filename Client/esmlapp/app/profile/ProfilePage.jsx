import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Expo-compatible gradient
import { MaterialIcons } from '@expo/vector-icons'; // Icons from Expo's built-in support

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      // Simulated fetch call
      const data = {
        name: 'Arya Muller',
        email: 'albertflores@gmail.com',
        profilePic: 'https://via.placeholder.com/150', // Example image URL
        leaderboardRank: 2,
        events: 55,
        level: 2,
        currentPoints: 5200,
        totalPoints: 6000,
        achievement: 'Gold Medal in Football Tournament',
        achievementDate: 'May 1, 2022',
      };
      setUserData(data);
    };

    fetchUserData();
  }, []);

  if (!userData) return null; // Prevent rendering until data is fetched

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile */}
      <View style={styles.profileContainer}>
        <Image source={{ uri: userData.profilePic }} style={styles.profileImage} />
        <Text style={styles.profileName}>{userData.name}</Text>
        <Text style={styles.email}>
          {userData.email} <MaterialIcons name="verified" size={16} color="green" />
        </Text>
        <TouchableOpacity style={styles.editProfileButton}>
          <Text style={styles.editProfileText}>Edit Profile</Text>
          <MaterialIcons name="arrow-drop-down" size={18} color="gray" />
        </TouchableOpacity>
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

      {/* Level */}
      <View style={styles.levelContainer}>
        <Text style={styles.levelText}>Level {userData.level}</Text>
        <Text style={styles.pointsText}>
          {userData.totalPoints - userData.currentPoints} Points to next level
        </Text>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={['#FFC107', '#FFD54F']}
            style={[styles.progressFill, { width: `${(userData.currentPoints / userData.totalPoints) * 100}%` }]}
          />
        </View>
        <View style={styles.progressTextContainer}>
          <Text style={styles.levelIndicator}>2</Text>
          <Text style={styles.levelPoints}>
            {userData.currentPoints}/{userData.totalPoints}
          </Text>
          <Text style={styles.levelIndicator}>3</Text>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
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
  progressBar: {
    height: 10,
    width: '90%',
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 5,
  },
  levelIndicator: {
    fontWeight: 'bold',
    color: 'gray',
  },
  levelPoints: {
    fontWeight: 'bold',
    color: '#6F61E8',
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
});

export default ProfilePage;
