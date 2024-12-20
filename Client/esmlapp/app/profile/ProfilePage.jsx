import React, { useEffect, useState } from 'react'; 
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { Calendar } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [events, setEvents] = useState([]);
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('achievement');
  const [participatedEvents, setParticipatedEvents] = useState([]);

  const userId = 2; // Replace with dynamic user ID as necessary
  const navigation = useNavigation(); // Initialize navigation

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await axios.get(`http://192.168.103.11:3000/users/${userId}`);
        setUserData(userResponse.data.user);

        const leaderboardResponse = await axios.get(`http://192.168.103.11:3000/leaderboard`);
        const leaderboard = leaderboardResponse.data;

        const userRank = leaderboard.findIndex(user => user.id === userId) + 1; 
        setRank(userRank);

        const eventsResponse = await axios.get('http://192.168.103.11:3000/events/getAll');
        const userEvents = eventsResponse.data.filter(event => event.creator_id === userId);
        setEvents(userEvents);

        const participatedEventsResponse = await axios.get(`http://192.168.103.11:3000/events/getParticipated/${userId}`);
        setParticipatedEvents(participatedEventsResponse.data);

      } catch (error) {
        console.error('Error fetching data:', error);
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
    navigation.navigate('EventDetails', { eventId: event.event_id }); // Navigate to EventDetailsPage
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
    <ScrollView contentContainerStyle={styles.container}>
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

          <View style={styles.levelContainer}>
            <Text style={styles.levelText}>Level {userLevel}</Text>
            <Text style={styles.pointsText}>{pointsToNextLevel} Points to next level</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${(userData.points / (1000 * userLevel)) * 100}%` }]} />
            </View>
          </View>

          <MaterialIcons name="emoji-events" size={30} color="#FFC107" />
          <View>
            <Text style={styles.achievementText}>Earned Gold Medal in Football Tournament</Text>
            <Text style={styles.dateText}>May 1, 2022</Text>
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
  progressBarContainer: {
    height: 10,
    width: '80%',
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    overflow: 'hidden',
    marginVertical: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6F61E8',
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
