import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import axios from "axios";
import Navbar from "../navbar/Navbar";
import { BASE_URL } from '../../.env';
const { width } = Dimensions.get("window");

const App = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [competitions, setCompetitions] = useState([]);
  const [eventCategories, setEventCategories] = useState([
    { id: "1", name: "All Type" },
  ]);
  const [selectedCategory, setSelectedCategory] = useState("All Type");
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const navigation = useNavigation();


  useEffect(() => {
    axios
      .get(`${BASE_URL}/sports`)
      .then((response) => {
        setCategories(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
        setLoading(false);
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
      .get(`${BASE_URL}/events/getAll`)
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
  }, []);

  useEffect(() => {
    if (selectedCategory === "All Type") {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(
        events.filter((event) => event.category === selectedCategory)
      );
    }
  }, [selectedCategory, events]);

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
  

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
            <Text style={styles.date}>{new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" })}</Text>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity onPress={() => navigation.navigate("Homepage/CalendarPage")}>
                <MaterialCommunityIcons
                  name="calendar-outline"
                  size={24}
                  color="#555"
                />
              </TouchableOpacity>
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#555"
                style={{ marginLeft: 15 }}
              />
            </View>
          </View>

          <View style={styles.eventsCard}>
            <Text style={styles.cardText}>Today's Events</Text>
            <Text style={styles.cardProgress}>15/20</Text>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Category</Text>
          </View>
          <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categories}
            >
              {categories.map((category) => (
                <View key={category.id} style={styles.categoryItem}>
                  <MaterialCommunityIcons
                    name={category.icon || "help-circle-outline"} 
                    size={30}
                    color="#555"
                    onPress={() =>
                      navigation.navigate("Homepage/CategoryEvents", {
                        categoryName: category.name,
                      })}
                  />
                  <Text style={styles.categoryName}>{category.name}</Text>
                </View>
              ))}
            </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Competition of the Week</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.competitions}
          >
            {competitions.map((competition) => (
              <View key={competition.tournament_id} style={styles.competitionItem}>
                <MaterialCommunityIcons
                  name="trophy-outline"
                  size={24}
                  color="#555"
                />
                <Text style={styles.competitionTitle}>
                  {competition.tournament_name}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Events Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Events</Text>
          </View>
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
                <Text style={styles.categoryText}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <ScrollView contentContainerStyle={styles.eventsGrid}>
        {filteredEvents.map((event) => (
          <TouchableOpacity
            key={event.id}
            style={styles.eventItem}
            onPress={() => navigation.navigate('Homepage/EventDetails', { eventId: event.event_id })}
          >
            <Image source={{ uri: event.image }} style={styles.eventImage} />
            <View style={styles.eventDetails}>
              <Text style={styles.eventText}>{event.name}</Text>
              <View style={styles.eventRow}>
                <Ionicons name="location-outline" size={16} color="#555" />
                <Text style={styles.eventDetailText}>{event.location}</Text>
              </View>
              <View style={styles.eventRow}>
                <Ionicons name="calendar-outline" size={16} color="#555" />
                <Text style={styles.eventDetailText}>{event.date}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

        </View>
      </ScrollView>
      <Navbar />
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate("Homepage/CreateEvent")}
      >
        <MaterialCommunityIcons name="plus" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  )
};

export default App;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  eventsCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#000",
    borderRadius: 15,
    padding: 15,
    marginVertical: 20,
  },
  cardText: {
    color: "#fff",
    fontSize: 16,
  },
  cardProgress: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
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
    paddingHorizontal: 10,
    minWidth: "100%",
  },
  categoryItem: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    aspectRatio: 1,
    marginBottom: 20,
  },
  categoryIcon: {
    fontSize: 30,
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
  competitionItem: {
    alignItems: "center",
    marginRight: 100,
    marginBottom: 10,
  },
  competitionText: {
    marginTop: 5,
    fontSize: 14,
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
  },
  selectedCategory: {
    backgroundColor: "#007BFF",
  },
  categoryText: {
    fontSize: 14,
    color: "#000",
  },
  floatingButton: {
    position: "absolute",
    bottom: 80,
    right: 20,
    width: 60,
    height: 60,
    backgroundColor: "#007BFF",
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
});