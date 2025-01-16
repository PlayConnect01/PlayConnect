import React, { useEffect, useState } from 'react'; 
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { Calendar } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navbar from '../navbar/Navbar';
import { BASE_URL } from '../../Api';

// Function to decode the token
const decodeToken = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace("-", "+").replace("_", "/");
    return JSON.parse(Buffer.from(base64, "base64").toString("utf-8"));
  } catch (error) {
    console.error("Token decoding error:", error);
    return null;
  }
};

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [events, setEvents] = useState([]);
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("achievement");
  const [participatedEvents, setParticipatedEvents] = useState([]);
  const [showLogout, setShowLogout] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [eventsOnSelectedDate, setEventsOnSelectedDate] = useState([]);

  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          Alert.alert(
            "Error",
            "No authentication token found. Please log in again."
          );
          return;
        }

        const decodedToken = decodeToken(token);
        if (!decodedToken) {
          throw new Error("Failed to decode token");
        }

        const userId =
          decodedToken.id || decodedToken.user_id || decodedToken.userId;
        if (!userId) {
          throw new Error("Could not find user ID in token");
        }

        const userResponse = await axios.get(`${BASE_URL}/users/${userId}`);
        setUserData(userResponse.data);
console.log("User Dataaaaaaa", userResponse.data.points);
        const leaderboardResponse = await axios.get(`${BASE_URL}/leaderboard`);
        const leaderboard = leaderboardResponse.data;

        const userRank =
          leaderboard.findIndex((user) => user.id === userId) + 1;
        setRank(userRank);

        const eventsResponse = await axios.get(`${BASE_URL}/events/getAll`);
        const userEvents = eventsResponse.data.filter(
          (event) => event.creator_id === userId
        );
        setEvents(userEvents);

        const participatedEventsResponse = await axios.get(
          `${BASE_URL}/events/getParticipated/${userId}`
        );
        setParticipatedEvents(participatedEventsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Error", "Failed to load user data.");
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

  const calculateProgress = (points, level) => {
    const currentLevelPoints = (level - 1) * 1000;
    const pointsInCurrentLevel = points - currentLevelPoints;
    return (pointsInCurrentLevel / 1000) * 100;
  };
  

  const fetchEventsByDate = async (date) => {
    try {
      const response = await axios.get(`${BASE_URL}/events/getByDate/${date}`);
      setEventsOnSelectedDate(response.data);
    } catch (error) {
      console.error("Error fetching events by date:", error);
      Alert.alert("Error", "Failed to load events. Please try again later.");
    }
  };

  const handleDayPress = (day) => {
    const selectedDate = day.dateString;
    setSelectedDate(selectedDate);
    fetchEventsByDate(selectedDate);
  };

  const markedDates = [...events, ...participatedEvents].reduce(
    (acc, event) => {
      const date = new Date(event.date).toISOString().split("T")[0];
      const today = new Date().toISOString().split("T")[0];
      if (date >= today) {
        // Mark only upcoming events
        acc[date] = { marked: true, dotColor: "#0095FF" };
      }
      return acc;
    },
    {}
  );

  const handleEventPress = (event) => {
    navigation.navigate("EventDetails", { eventId: event.event_id });
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      navigation.navigate("Login");
    } catch (error) {
      console.error("Error logging out:", error);
      Alert.alert("Error", "Failed to logout");
    }
  };

  const isEventPast = (eventDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDateObj = new Date(eventDate);
    eventDateObj.setHours(0, 0, 0, 0);
    return eventDateObj < today;
  };

  const handleCreateEvent = () => {
    navigation.navigate("AddNewEvent");
  };

  if (loading) {
    return (
      <View style={styles.fullPage}>
        <ActivityIndicator size="large" color="#0095FF" style={styles.loader} />
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => setShowSettings(!showSettings)}>
          <Ionicons name="settings-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {showSettings && (
        <View style={styles.settingsMenu}>
          <TouchableOpacity
            style={styles.settingsOption}
            onPress={() => {
              setShowSettings(false);
              navigation.navigate("EditProfile");
            }}
          >
            <Text style={styles.settingsOptionText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.settingsOption, styles.logoutOption]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileContainer}>
          <Image
            source={{
              uri:
                userData.profile_picture ||
                "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541",
            }}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>{userData.username}</Text>
          <Text style={styles.email}>{userData.email}</Text>
        </View>

        <View style={styles.tabsContainer}>
          {["achievement", "events", "calendar"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={
                  activeTab === tab ? styles.tabTextActive : styles.tabText
                }
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === "achievement" && (
          <View style={styles.achievementContainer}>
            <View style={styles.statsContainer}>
              <TouchableOpacity 
                style={styles.statBox}
                onPress={() => navigation.navigate('LeaderboardScreen')}
              >
                <View style={styles.iconCircle}>
                  <MaterialIcons name="leaderboard" size={24} color="#0095FF" />
                </View>
                <View style={styles.statTextContainer}>
                {  console.log("Rank", rank)} 
                  <Text style={styles.statNumber}>#{rank || "N/A"}</Text>
                  <Text style={styles.statLabel}>Leaderboard</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.statBox}>
                <View style={styles.iconCircle}>
                  <MaterialIcons name="flash-on" size={24} color="#FF9500" />
                </View>
                <View style={styles.statTextContainer}>
                  <Text style={styles.statNumber}>{events.length}</Text>
                  <Text style={styles.statLabel}>Events</Text>
                </View>
              </View>
            </View>

            <View style={styles.levelBox}>
              <View style={styles.levelHeader}>
                <View style={styles.levelCircle}>
                  <Text style={styles.levelNumberGold}>{userLevel}</Text>
                </View>
                <View style={styles.levelTextContainer}>
                  <Text style={styles.levelTitle}>Level {userLevel}</Text>
                  <Text style={styles.pointsToNext}>
                    {pointsToNextLevel} Points to next level
                  </Text>
                </View>
              </View>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${calculateProgress(userData.points || 0, userLevel)}%` }
                  ]} 
                />
                <View style={styles.pointsIndicator}>
                  <Text style={styles.currentPoints}>
                    {userData.points || 0} Points
                  </Text>
                  <Text style={styles.maxPoints}>
                    {userLevel * 1000} Points
                  </Text>
                </View>
              </View>
              <Text style={styles.eventsCreatedText}>
                Events Created: {userData.created_events_count || 0}
              </Text>
            </View>
          </View>
        )}

        {activeTab === "events" && (
          <View style={styles.eventsContainer}>
            {events.length > 0 ? (
              events.map((event, index) => {
                const isPast = isEventPast(event.date);
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.eventCard,
                      isPast && styles.pastEventCard
                    ]}
                    onPress={() => handleEventPress(event)}
                    disabled={isPast}
                  >
                    <Image
                      source={{ uri: event.image }}
                      style={[
                        styles.eventImage,
                        isPast && styles.pastEventImage
                      ]}
                    />
                    <View style={styles.eventInfo}>
                      <Text style={[
                        styles.eventName,
                        isPast && styles.pastEventText
                      ]}>
                        {event.event_name}
                      </Text>
                      <View style={styles.locationContainer}>
                        <MaterialIcons
                          name="location-on"
                          size={16}
                          color={isPast ? "#999" : "#666"}
                        />
                        <Text style={[
                          styles.locationText,
                          isPast && styles.pastEventText
                        ]}>
                          {event.location}
                        </Text>
                      </View>
                      <View style={styles.ratingContainer}>
                        <MaterialIcons 
                          name="star" 
                          size={16} 
                          color={isPast ? "#999" : "#FFD700"} 
                        />
                        <Text style={[
                          styles.ratingText,
                          isPast && styles.pastEventText
                        ]}>
                          {event.rating || "4.5"}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text style={styles.noEventsText}>No events created yet.</Text>
            )}
          </View>
        )}

        {activeTab === "calendar" && (
          <View style={styles.calendarContainer}>
            <Calendar markedDates={markedDates} onDayPress={handleDayPress} />
            <View style={styles.eventsContainer}>
              {eventsOnSelectedDate.length > 0 ? (
                eventsOnSelectedDate.map((event, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.eventCard}
                    onPress={() => handleEventPress(event)}
                  >
                    <Image
                      source={{ uri: event.image }}
                      style={styles.eventImage}
                    />
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventName}>{event.event_name}</Text>
                      <View style={styles.locationContainer}>
                        <MaterialIcons
                          name="location-on"
                          size={16}
                          color="#666"
                        />
                        <Text style={styles.locationText}>
                          {event.location}
                        </Text>
                      </View>
                      <View style={styles.ratingContainer}>
                        <MaterialIcons name="star" size={16} color="#FFD700" />
                        <Text style={styles.ratingText}>
                          {event.rating || "4.5"}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noEventsText}>No events for this day.</Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  fullPage: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2d4150",
  },
  profileContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2d4150",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#0095FF",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
  },
  tabTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 8,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statTextContainer: {
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0095FF",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  levelBox: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  levelHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  levelCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  levelNumberGold: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFD700",
  },
  levelTextContainer: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2d4150",
  },
  pointsToNext: {
    fontSize: 12,
    color: "#666",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#0095FF",
    borderRadius: 4,
  },
  pointsIndicator: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  currentPoints: {
    fontSize: 12,
    color: "#666",
  },
  maxPoints: {
    fontSize: 12,
    color: "#666",
  },
  eventsContainer: {
    marginTop: 16,
  },
  eventCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  },
  eventImage: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  eventInfo: {
    padding: 16,
  },
  eventName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d4150",
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  settingsMenu: {
    position: "absolute",
    top: 90,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  settingsOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingsOptionText: {
    fontSize: 16,
    color: "#2d4150",
  },
  logoutOption: {
    borderBottomWidth: 0,
  },
  logoutText: {
    fontSize: 16,
    color: "#FF3B30",
  },
  noEventsText: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
    fontSize: 14,
  },
  pastEventCard: {
    opacity: 0.7,
  },
  pastEventImage: {
    opacity: 0.7,
  },
  pastEventText: {
    color: "#999",
  },
  eventsCreatedText: {
    fontSize: 14,
    color: "#666",
    marginTop: 12,
    textAlign: "center",
  },
  loader: {
    marginTop: 20,
  },
});

export default ProfilePage;