import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { Calendar } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import { Buffer } from 'buffer';
import Navbar from '../navbar/Navbar';

const decodeToken = (token) => {
  try {
    const base64Payload = token.split('.')[1]; // Get the payload part of the JWT
    const payload = Buffer.from(base64Payload, 'base64').toString('utf8');
    return JSON.parse(payload);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

const ProfilePage = ({ token }) => {
  const [userData, setUserData] = useState(null);
  const [events, setEvents] = useState([]);
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('achievement');
  const [participatedEvents, setParticipatedEvents] = useState([]);

  const navigation = useNavigation();

  // Decode userId from token
  const decodedToken = decodeToken(token);
  if (!decodedToken) {
    Alert.alert('Error', 'Invalid token. Please log in again.');
    return null;
  }

  const userId = decodedToken.id || decodedToken.user_id || decodedToken.userId;
  if (!userId) {
    Alert.alert('Error', 'Failed to retrieve user information.');
    return null;
  }

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await axios.get(`http://192.168.104.10:3000/users/${userId}`);
        setUserData(userResponse.data.user);

        const leaderboardResponse = await axios.get(`http://192.168.104.10:3000/leaderboard`);
        const leaderboard = leaderboardResponse.data;

        const userRank = leaderboard.findIndex(user => user.id === userId) + 1;
        setRank(userRank);

        const eventsResponse = await axios.get('http://192.168.104.10:3000/events/getAll');
        const userEvents = eventsResponse.data.filter(event => event.creator_id === userId);
        setEvents(userEvents);

        const participatedEventsResponse = await axios.get(`http://192.168.104.10:3000/events/getParticipated/${userId}`);
        setParticipatedEvents(participatedEventsResponse.data);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

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
    return <ActivityIndicator size="large" color="#6F61E8" style={styles.loader} />;
  }

  if (!userData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load user data.</Text>
      </View>
    );
  }

  const userLevel = calculateLevel(userData.points);
  const pointsToNextLevel = 1000 * userLevel - userData.points;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Image source={{ uri: userData.profilePicture }} style={styles.profilePicture} />
          <Text style={styles.username}>{userData.name}</Text>
          <Text style={styles.level}>Level {userLevel} - {pointsToNextLevel} points to next level</Text>
        </View>
        <View style={styles.tabs}>
          <TouchableOpacity onPress={() => setActiveTab('achievement')} style={[styles.tab, activeTab === 'achievement' && styles.activeTab]}>
            <Text style={styles.tabText}>Achievements</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('calendar')} style={[styles.tab, activeTab === 'calendar' && styles.activeTab]}>
            <Text style={styles.tabText}>Calendar</Text>
          </TouchableOpacity>
        </View>
        {activeTab === 'achievement' && (
          <View style={styles.achievements}>
            <Text>Achievements content here</Text>
          </View>
        )}
        {activeTab === 'calendar' && (
          <Calendar
            markedDates={markedDates}
            onDayPress={(day) => {
              if (markedDates[day.dateString]?.onPress) {
                markedDates[day.dateString].onPress();
              }
            }}
          />
        )}
      </ScrollView>
      <Navbar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  level: {
    fontSize: 16,
    color: '#6F61E8',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  tab: {
    padding: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#6F61E8',
  },
  tabText: {
    fontSize: 16,
  },
  achievements: {
    padding: 10,
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
    fontSize: 18,
    color: 'red',
  },
});

export default ProfilePage;