import React, { useEffect, useState } from 'react'; 
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { Calendar } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navbar from '../navbar/Navbar';

// Function to decode the token
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
  } catch (error) {
    console.error('Token decoding error:', error); 
    return null;
  }
};

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [events, setEvents] = useState([]);
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('achievement');
  const [participatedEvents, setParticipatedEvents] = useState([]);

  const navigation = useNavigation(); 

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          Alert.alert('Error', 'No authentication token found. Please log in again.');
          return;
        }

        const decodedToken = decodeToken(token);
        if (!decodedToken) {
          throw new Error('Failed to decode token');
        }

        const userId = decodedToken.id || decodedToken.user_id || decodedToken.userId;
        if (!userId) {
          throw new Error('Could not find user ID in token');
        }

        const userResponse = await axios.get(`http://192.168.103.9:3000/users/${userId}`);
        setUserData(userResponse.data.user);

        const leaderboardResponse = await axios.get("http://192.168.103.9:3000/leaderboard");
        const leaderboard = leaderboardResponse.data;

        const userRank = leaderboard.findIndex(user => user.id === userId) + 1; 
        setRank(userRank);

        const eventsResponse = await axios.get('http://192.168.103.9:3000/events/getAll');
        const userEvents = eventsResponse.data.filter(event => event.creator_id === userId);
        setEvents(userEvents);

        const participatedEventsResponse = await axios.get(`http://192.168.103.9:3000/events/getParticipated/${userId}`);
        setParticipatedEvents(participatedEventsResponse.data);

      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Failed to load user data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const calculateLevel = (points) => {
    if (points < 1000) return 1;
    if (points < 2000) return 2;
    if (points < 3000) return 3;
    if (points < 5000) return 4;
    return 5;
  };

  const markedDates = participatedEvents.reduce((acc, event) => {
    const date = new Date(event.date).toISOString().split('T')[0];
    acc[date] = { marked: true, dotColor: '#6F61E8', onPress: () => handleEventPress(event) };
    return acc;
  }, {});

  const handleEventPress = (event) => {
    navigation.navigate('EventDetails', { eventId: event.event_id }); 
  };

  if (loading) {
    return (
      <View style={styles.fullPage}>
        <ActivityIndicator size="large" color="#6F61E8" style={styles.loader} />
        <Navbar />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.fullPage}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load user data.</Text>
        </View>
        <Navbar />
      </View>
    );
  }

  const userLevel = calculateLevel(userData.points);
  const pointsToNextLevel = 1000 * userLevel - userData.points;

  return (
    <View style={styles.fullPage}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.profileContainer}>
          <Image 
            source={{ uri: userData.profile_picture || 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541' }} 
            style={styles.profileImage} 
          />
          <Text style={styles.profileName}>{userData.username}</Text>
          <Text style={styles.email}>
            {userData.email} <MaterialIcons name="verified" size={16} color="green" />
          </Text>
          <TouchableOpacity style={styles.editProfileButton}
          onPress={() => navigation.navigate('EditProfile', { userData })} 
          >
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'achievement' && styles.activeTab]}
            onPress={() => setActiveTab('achievement')}
          >
            <Text style={activeTab === 'achievement' ? styles.tabTextActive : styles.tabText}>Achievement</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'events' && styles.activeTab]}
            onPress={() => setActiveTab('events')}
          >
            <Text style={activeTab === 'events' ? styles.tabTextActive : styles.tabText}>Events</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'calendar' && styles.activeTab]}
            onPress={() => setActiveTab('calendar')}
          >
            <Text style={activeTab === 'calendar' ? styles.tabTextActive : styles.tabText}>Calendar</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'events' && (
          <View style={styles.eventsContainer}>
            {events.length > 0 ? (
              events.map((event, index) => (
                <View key={index} style={styles.eventContainer}>
                  <Image source={{ uri: event.image }} style={styles.eventImage} />
                  <View style={styles.eventDetails}>
                    <Text style={styles.eventName}>{event.event_name}</Text>
                    <Text style={styles.eventDate}>{new Date(event.start_time).toLocaleString()}</Text>
                    <Text style={styles.eventDescription}>{event.description}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noEventsText}>No events created yet.</Text>
            )}
          </View>
        )}

        {activeTab === 'achievement' && (
          <View style={styles.achievementContainer}>
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>#{rank || 'N/A'}</Text>
                <Text style={styles.statLabel}>Leaderboard</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{events.length}</Text>
                <Text style={styles.statLabel}>Events</Text>
              </View>
            </View>

            <View style={styles.levelBox}>
              <View style={styles.levelHeader}>
                <View style={styles.levelNumberContainer}>
                  <Text style={styles.levelNumber}>{userLevel}</Text>
                </View>
                <Text style={styles.levelTitle}>Level {userLevel}</Text>
              </View>
              <Text style={styles.pointsText}>{userData.points || 0} Points to next level</Text>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { 
                      width: `${((userData.points || 0) / (1000 * userLevel)) * 100}%`,
                      minWidth: 1, // Ensures the bar is always visible even at 0 points
                    }
                  ]} 
                />
                <View style={styles.pointsIndicator}>
                  <Text style={styles.currentPoints}>{userData.points || 0}</Text>
                  <Text style={styles.maxPoints}>{1000 * userLevel}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'calendar' && (
          <View style={styles.calendarContainer}>
            <Calendar
              markedDates={markedDates}
            />
          </View>
        )}
      </ScrollView>
      <Navbar />
    </View>
  );
};

const styles = StyleSheet.create({
  fullPage: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  editProfileText: {
    fontSize: 14,
    color: 'gray',
  },
  tabsContainer: {
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
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  levelBox: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelNumberContainer: {
    backgroundColor: '#6F61E8',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  levelNumber: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  pointsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6F61E8',
    borderRadius: 4,
  },
  pointsIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  currentPoints: {
    fontSize: 12,
    color: '#666',
  },
  maxPoints: {
    fontSize: 12,
    color: '#666',
  },
  eventContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
  },
  eventImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
  },
  eventDetails: {
    flex: 1,
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventDate: {
    color: 'gray',
    fontSize: 14,
  },
  eventDescription: {
    fontSize: 14,
    color: 'gray',
  },
  noEventsText: {
    color: 'gray',
    textAlign: 'center',
    marginTop: 20,
  },
  calendarContainer: {
    marginTop: 10,
  },
});

export default ProfilePage;