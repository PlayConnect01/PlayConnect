import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { Calendar } from "react-native-calendars";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const fetchEvents = (date) => {
    setLoading(true);
    axios
      .get(`http://192.168.104.10:3000/events/getByDate/${date}`)
      .then((response) => {
        setEvents(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
        Alert.alert("Error", "Failed to load events. Please try again later.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEvents(selectedDate);
  }, [selectedDate]);

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    fetchEvents(day.dateString);
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Homepage/Homep")}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Calendar */}
      <Calendar
        onDayPress={handleDayPress}
        markedDates={{
          [selectedDate]: { selected: true, marked: true, selectedColor: "blue" },
        }}
        theme={{
          selectedDayBackgroundColor: "blue",
          todayTextColor: "red",
          arrowColor: "blue",
        }}
      />

      {/* Event List */}
      <View style={styles.eventsContainer}>
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : events.length > 0 ? (
          <FlatList
            data={events}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.eventItem}>
                <View style={styles.eventTimeContainer}>
                  <Text style={styles.eventTime}>{item.time}</Text>
                  <MaterialCommunityIcons name="map-marker-outline" size={16} color="#555" />
                  <Text style={styles.eventLocation}>{item.location}</Text>
                </View>
                <Text style={styles.eventTitle}>{item.title}</Text>
                <Text style={styles.eventParticipants}>
                  <MaterialCommunityIcons name="account-multiple" size={16} color="#555" />
                  {` Participants: ${item.participants}`}
                </Text>
              </View>
            )}
          />
        ) : (
          <Text style={styles.noEventsText}>No events for this day.</Text>
        )}
      </View>


      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate("Homepage/CreateEvent")}
      >
        <MaterialCommunityIcons name="plus" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  eventsContainer: {
    flex: 1,
    padding: 20,
  },
  loadingText: {
    textAlign: "center",
    color: "#555",
    fontSize: 16,
  },
  noEventsText: {
    textAlign: "center",
    color: "#aaa",
    fontSize: 16,
  },
  eventItem: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  eventTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  eventTime: {
    fontSize: 14,
    color: "#555",
    marginRight: 5,
  },
  eventLocation: {
    fontSize: 14,
    color: "#555",
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  eventParticipants: {
    fontSize: 14,
    color: "#555",
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
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
});

export default CalendarPage;
