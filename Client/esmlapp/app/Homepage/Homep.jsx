import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { BASE_URL } from "../../Api";
import Navbar from '../navbar/Navbar';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import NotificationsModal from '../components/NotificationsModal';

const { width } = Dimensions.get("window");

const iconMap = {
    american_soccer_american_soccer_football_rugby_icon_209383: require('./Icons/american_soccer_american_soccer_football_rugby_icon_209383.png'),
    controller_gamepad_game_controller_joystick_console_gaming_console_video_game_egames_esports_icon_209387: require('./Icons/controller_gamepad_game_controller_joystick_console_gaming_console_video_game_egames_esports_icon_209387.png'),
    court_sports_ball_basketball_icon_209379: require('./Icons/court_sports_ball_basketball_icon_209379.png'),
    equipment_weight_dumbbell_training_workout_exercise_fitness_gym_gymming_icon_209384: require('./Icons/equipment_weight_dumbbell_training_workout_exercise_fitness_gym_gymming_icon_209384.png'),
    game_sports_feather_tennis_racquet_badminton_shuttle_cock_icon_209374: require('./Icons/game_sports_feather_tennis_racquet_badminton_shuttle_cock_icon_209374.png'),
    grandmaster_indoor_game_queen_king_piece_strategy_chess_icon_209370: require('./Icons/grandmaster_indoor_game_queen_king_piece_strategy_chess_icon_209370.png'),
    olympic_sport_swim_water_pool_swimming_icon_209368: require('./Icons/olympic_sport_swim_water_pool_swimming_icon_209368.png'),
    play_ball_sports_sport_baseball_icon_209376: require('./Icons/play_ball_sports_sport_baseball_icon_209376.png'),
    player_gaming_sports_play_game_sport_table_tennis_icon_209385: require('./Icons/player_gaming_sports_play_game_sport_table_tennis_icon_209385.png'),
    schedule_alarm_watch_time_timer_stopwatch_icon_209377: require('./Icons/schedule_alarm_watch_time_timer_stopwatch_icon_209377.png'),
    sports_fitness_sport_gloves_boxing_icon_209382: require('./Icons/sports_fitness_sport_gloves_boxing_icon_209382.png'),
    sports_game_sport_ball_soccer_football_icon_209369: require('./Icons/sports_game_sport_ball_soccer_football_icon_209369.png'),
    tennis_ball_play_sport_game_ball_tennis_icon_209375: require('./Icons/tennis_ball_play_sport_game_ball_tennis_icon_209375.png'),
};

const App = () => {
  const [categories, setCategories] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [eventCategories, setEventCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All Type");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split("")
              .map(function (c) {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
              })
              .join("")
          );
          const { userId } = JSON.parse(jsonPayload);
          setCurrentUserId(userId);
          fetchNotifications(userId);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, []);

  const fetchNotifications = async (userId) => {
    try {
      const response = await axios.get(`${BASE_URL}/notifications/${userId}`);
      if (response.data && Array.isArray(response.data)) {
        setUnreadNotifications(response.data.filter((n) => !n.read).length);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      const interval = setInterval(() => {
        fetchNotifications(currentUserId);
      }, 30000); // Check for new notifications every 30 seconds

      return () => clearInterval(interval);
    }
  }, [currentUserId]);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/sports`)
      .then((response) => {
        setCategories(response.data);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });

    axios
      .get(`${BASE_URL}/competetion`)
      .then((response) => {
        setCompetitions(response.data);
      })
      .catch((error) => {
        console.error("Error fetching competitions:", error);
      });

    axios
      .get(`${BASE_URL}/events/approved`)
      .then((response) => {
        const fetchedEvents = response.data;
        setEvents(fetchedEvents);
        setFilteredEvents(fetchedEvents);

        const uniqueCategories = [
          { id: "1", name: "All Type" },
          ...Array.from(
            new Set(fetchedEvents.map((event) => event.category))
          ).map((category, index) => ({
            id: (index + 2).toString(),
            name: category,
          })),
        ];
        setEventCategories(uniqueCategories);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
      });
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedCategory === "All Type") {
      setFilteredEvents(
        events.filter((event) =>
          event.event_name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredEvents(
        events.filter(
          (event) =>
            event.category === selectedCategory &&
            event.event_name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [selectedCategory, events, searchQuery]);

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      return "Good Morning";
    } else if (currentHour < 18) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleNotificationPress = () => {
    setShowNotifications(true);
    // Reset notification count when opening notifications
    setUnreadNotifications(0);
  };

  const handlePaymentPress = async () => {
    // Fetch user details using the userId
    const userDetailsResponse = await axios.get(`${BASE_URL}/users/${currentUserId}`);
    const userDetails = userDetailsResponse.data;
    navigation.navigate('Homepage/CreateEvent', {
      userDetails: userDetails // Pass fetched user details
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.date}>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </Text>
              <Text style={styles.greeting}>{getGreeting()}</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                onPress={() => navigation.navigate("Homepage/CalendarPage")}
              >
                <Ionicons name="calendar-outline" size={24} color="#555" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.notificationButton}
                onPress={handleNotificationPress}
              >
                <Ionicons name="notifications-outline" size={24} color="#555" />
                {unreadNotifications > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadNotifications > 99 ? "99+" : unreadNotifications}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#0095FF"
              style={styles.loader}
            />
          ) : (
            <>

              <View style={styles.searchBarContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search events..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              {searchQuery === "" && (
                <>

                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Category</Text>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categories}
                  >
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category.id} // Add unique key prop
                        onPress={() =>
                          navigation.navigate("Homepage/CategoryEvents", {
                            categoryName: category.name,
                          })
                        }
                        style={styles.categoryItemWrapper}
                      >
                        <View style={styles.categoryItem}>
                          <Image
                            source={iconMap[category.icon]}
                            style={styles.categoryIcon}
                          />
                        </View>
                        <Text style={styles.categoryName}>{category.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                      Competition of the Week
                    </Text>
                    <Text
                      style={styles.seeAll}
                      onPress={() =>
                        navigation.navigate("Homepage/TournamentList")
                      }
                    >
                      See All
                    </Text>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.competitions}
                  >
                    {competitions.map((competition) => (
                      <TouchableOpacity
                        key={competition.tournament_id} // Add unique key prop
                        style={styles.competitionItemWrapper}
                        onPress={() =>
                          navigation.navigate("Homepage/TournamentDetail", {
                            id: competition.tournament_id,
                          })
                        }
                      >
                        <View style={styles.competitionItem}>
                          <Image
                            source={require("./Icons/award_gold_medal_winner_cup_prize_trophy_icon_209386.png")}
                            style={styles.cupIcon}
                          />
                          <Text style={styles.competitionTitle}>
                            {competition.tournament_name}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>

              )}

              {searchQuery === "" && (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Events</Text>
                </View>
              )}

              {searchQuery === "" && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.categories}
                >
                  {eventCategories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryButton,
                        selectedCategory === category.name && styles.selectedCategory,
                      ]}
                      onPress={() => setSelectedCategory(category.name)}
                    >
                      <Text style={[
                        styles.categoryText,
                        selectedCategory === category.name && { color: "#fff" }
                      ]}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              <ScrollView
                contentContainerStyle={
                  searchQuery ? styles.singleEventGrid : styles.eventsGrid
                }
              >
                {filteredEvents.map((event) => (
                  <TouchableOpacity
                    key={event.id} // Add unique key prop
                    style={
                      searchQuery ? styles.fullWidthEventItem : styles.eventItem
                    }
                    onPress={() =>
                      navigation.navigate("Homepage/EventDetails", {
                        eventId: event.event_id,
                      })
                    }
                  >
                    <Image
                      source={{ uri: event.image }}
                      style={styles.eventImage}
                    />
                    <View style={styles.eventDetails}>
                      <Text style={styles.eventText}>{event.event_name}</Text>
                      <View style={styles.eventRow}>
                        <MaterialCommunityIcons
                          name="google-maps"
                          size={16}
                          color="#0095FF"
                        />
                        <Text style={styles.eventDetailText}>
                          {event.location}
                        </Text>
                      </View>
                      <View style={styles.eventRow}>
                        <MaterialCommunityIcons
                          name="calendar-outline"
                          size={16}
                          color="#0095FF"
                        />
                        <Text style={styles.eventDetailText}>
                          {formatDate(event.start_time)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>

          )}
        </View>
      </ScrollView>
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handlePaymentPress}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
      <Navbar />

      {/* Notifications Modal */}
      {showNotifications && currentUserId && (
        <NotificationsModal
          visible={showNotifications}
          onClose={() => setShowNotifications(false)}
          userId={currentUserId}
          onNotificationsUpdate={() => fetchNotifications(currentUserId)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  date: {
    fontSize: 14,
    color: "#666",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  headerIcons: {
    flexDirection: "row",
  },
  searchBarContainer: {
    marginVertical: 20,
  },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  seeAll: {
    fontSize: 14,
    color: "#007BFF",
  },
  categories: {
    flexDirection: "row",
    marginBottom: 20,
  },
  categoryItemWrapper: {
    alignItems: "center",
    marginRight: 15,
  },
  categoryItem: {
    width: 70,
    height: 70,
    borderRadius: 15,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  categoryName: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 5,
  },
  competitions: {
    flexDirection: "row",
    marginBottom: 20,
  },
  competitionItemWrapper: {
    alignItems: "center",
    marginRight: 20,
    marginBottom: 10,
  },
  competitionItem: {
    width: 110,
    height: 120,
    borderRadius: 15,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  competitionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#555",
  },
  eventsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  eventItem: {
    width: width * 0.44,
    marginBottom: 20,
  },
  eventImage: {
    width: "100%",
    height: 150,
    borderRadius: 10,
  },
  eventDetails: {
    marginTop: 10,
  },
  eventText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  eventDetailText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#555",
  },
  categoryButton: {
    backgroundColor: "#f0f0f0",
    borderRadius: 15,
    padding: 10,
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 10,
  },
  selectedCategory: {
    backgroundColor: "#0095FF",
    shadowColor: "#007BFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryText: {
    fontSize: 14,
    color: "#000",
  },
  categoryIcon: {
    width: 70,
    height: 70,
    resizeMode: "contain",
  },
  cupIcon: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  floatingButton: {
    position: "absolute",
    bottom: 80,
    right: 20,
    width: 60,
    height: 60,
    backgroundColor: "#0095FF",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 100,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  singleEventGrid: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "stretch",
  },
  fullWidthEventItem: {
    width: "100%",
    marginBottom: 20,
  },
  loader: {
    marginVertical: 20,
  },
  notificationButton: {
    position: "relative",
    marginLeft: 15,
    padding: 5,
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#ff4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default App;
