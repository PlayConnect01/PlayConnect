import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { Calendar } from "react-native-calendars";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation
import AsyncStorage from "@react-native-async-storage/async-storage";
import Navbar from "../navbar/Navbar";
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
        setUserData(userResponse.data.user);

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
        acc[date] = { marked: true, dotColor: "#6F61E8" };
      }
      return acc;
    },
    {}
  );

  const handleEventPress = (event) => {
    navigation.navigate("Homepage/EventDetails", { eventId: event.event_id });
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      navigation.navigate("auth/LoginScreen");
    } catch (error) {
      console.error("Error logging out:", error);
      Alert.alert("Error", "Failed to logout");
    }
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
              navigation.navigate("profile/EditProfile");
              // Add your edit profile navigation/function here
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
              <View style={styles.statBox}>
                <View style={styles.iconCircle}>
                  <MaterialIcons name="leaderboard" size={24} color="#6F61E8" />
                </View>
                <View style={styles.statTextContainer}>
                  <Text style={styles.statNumber}>#{rank || "N/A"}</Text>
                  <Text style={styles.statLabel}>Leaderboard</Text>
                </View>
              </View>
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
                <View style={styles.progressBar} />
                <View style={styles.pointsIndicator}>
                  <Text style={styles.currentPoints}>
                    {userData.points || 0}
                  </Text>
                  <Text style={styles.maxPoints}>{1000 * userLevel}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === "events" && (
          <View style={styles.eventsContainer}>
            {events.length > 0 ? (
              events.map((event, index) => (
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
                      <Text style={styles.locationText}>{event.location}</Text>
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
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 0,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileContainer: {
    alignItems: "center",
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: "gray",
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
    backgroundColor: "#f5f5f5",
    borderRadius: 15,
    padding: 4,
    marginHorizontal: 0,
    height: 50,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: "#6F61E8",
  },
  tabText: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
  },
  tabTextActive: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingHorizontal: 0,
    width: "100%",
  },
  statBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    width: "48%",
    height: 70,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginHorizontal: 0,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statTextContainer: {
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  levelBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  levelHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  levelCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  levelNumberGold: {
    color: "#FFD700",
    fontSize: 24,
    fontWeight: "bold",
  },
  levelTextContainer: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  pointsToNext: {
    fontSize: 14,
    color: "#666",
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: "#F0F0F0",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    width: "75%", // Adjust based on actual progress
    backgroundColor: "#FFD700",
    borderRadius: 6,
  },
  pointsIndicator: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  currentPoints: {
    fontSize: 14,
    color: "#666",
  },
  maxPoints: {
    fontSize: 14,
    color: "#666",
  },
  eventContainer: {
    flexDirection: "row",
    marginVertical: 10,
    backgroundColor: "#f5f5f5",
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
    fontWeight: "bold",
  },
  eventDate: {
    color: "gray",
    fontSize: 14,
  },
  eventDescription: {
    fontSize: 14,
    color: "gray",
  },
  noEventsText: {
    color: "gray",
    textAlign: "center",
    marginTop: 20,
  },
  calendarContainer: {
    marginTop: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  settingsMenu: {
    position: "absolute",
    top: 90,
    right: 16,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
    width: 150, // Fixed width for the menu
  },
  settingsOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingsOptionText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  logoutOption: {
    borderBottomWidth: 0, // Remove border from last item
  },
  logoutText: {
    fontSize: 16,
    color: "red",
    fontWeight: "500",
  },
  achievementContainer: {
    paddingHorizontal: 0,
  },
  eventsContainer: {
    flex: 1,
    paddingHorizontal: 0,
  },
  eventCard: {
    marginBottom: 80,
    backgroundColor: "#fff",
    borderRadius: 15,
    overflow: "hidden", // This ensures the image respects the border radius
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventImage: {
    width: "100%",
    height: 200, // Increased height
    resizeMode: "cover",
  },
  eventInfo: {
    padding: 16,
  },
  eventName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
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
  noEventsText: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
    fontSize: 16,
  },
});

export default ProfilePage;
