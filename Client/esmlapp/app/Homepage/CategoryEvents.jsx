import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import { BASE_URL } from "../../Api";

const { width } = Dimensions.get("window");

const CategoryEvents = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { categoryName } = route.params; // Receive the category name from navigation params
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all events initially
    axios
      .get(`${BASE_URL}/events/getAll`)
      .then((response) => {
        setEvents(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // Filter events by the selected category
    if (categoryName === "All Type") {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(
        events.filter((event) => event.category === categoryName)
      );
    }
  }, [categoryName, events]);

  if (loading) {
    return <Text>Loading events...</Text>;
  }

  // Handle case when no events are found for the selected category
  if (filteredEvents.length === 0) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        {/* Back Arrow and Title */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate("Home")}>
            <Ionicons name="arrow-back" size={24} color="#555" />
          </TouchableOpacity>
          <Text style={styles.categoryTitle}>{categoryName} Events</Text>
        </View>

        {/* No Events Found Message */}
        <View style={styles.noEventsContainer}>
          <Text style={styles.noEventsText}>
            No events found in this category.
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back Arrow and Title */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#555" />
        </TouchableOpacity>
        <Text style={styles.categoryTitle}>{categoryName} Events</Text>
      </View>

      {/* Display Events */}
      <ScrollView contentContainerStyle={styles.eventsGrid}>
        {filteredEvents.map((event) => (
          <TouchableOpacity
            key={event.event_id}
            style={styles.eventItem}
            onPress={() =>
              navigation.navigate("EventDetails", {
                eventId: event.event_id,
              })
            }
          >
            <Image
              source={{
                uri: event.image || "https://via.placeholder.com/300x200",
              }}
              style={styles.eventImage}
            />
            <View style={styles.eventDetails}>
              <Text style={styles.eventText}>{event.event_name}</Text>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 10,
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
  noEventsContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 200,
  },
  noEventsText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
  },
});

export default CategoryEvents;
