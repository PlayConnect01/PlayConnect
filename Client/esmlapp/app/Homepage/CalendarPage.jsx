import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { Calendar } from "react-native-calendars";
import { BASE_URL } from '../../Api';

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [events, setEvents] = useState([]);
  const navigation = useNavigation();

  const fetchEvents = (date) => {
    axios
      .get(`${BASE_URL}/events/getByDate/${date}`)
      .then((response) => {
        setEvents(response.data);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
        Alert.alert("Error", "Failed to load events. Please try again later.");
      });
  };

  useEffect(() => {
    fetchEvents(selectedDate);
  }, [selectedDate]);

  const handleDayPress = (day) => {
    const selectedDate = day.dateString;
    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

    setSelectedDate(selectedDate); // Set the selected date for display purposes

    if (selectedDate < today) { // Check if the selected date is in the past
      setEvents([]); // Clear events for past dates
    } else {
      fetchEvents(selectedDate); // Fetch events only for today or future dates
    }
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMarkedDates = () => {
    const marked = {};
    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

    for (let i = 0; i < 30; i++) { 
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split("T")[0];
      if (dateString !== today) { // Skip greying out the current day date
        marked[dateString] = { disabled: true, color: "#d3d3d3" }; // Grey out past dates
      }
    }

    // Mark the selected date
    marked[selectedDate] = { selected: true, marked: true, selectedColor: "#0095FF" };

    return marked;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Homepage/Homep")}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Calendar Title */}
      <Text style={styles.calendarTitle}>Events Calendar</Text>

      {/* Calendar */}
      <Calendar
        onDayPress={handleDayPress}
        markedDates={getMarkedDates()}
        theme={{
          selectedDayBackgroundColor: "blue",
          todayTextColor: "red",
          arrowColor: "#0095FF",
          monthTextColor: "#000",
          textDayFontFamily: "sans-serif",
          textMonthFontFamily: "sans-serif-bold",
          textDayFontSize: 16,
          textMonthFontSize: 20,
          textDayHeaderFontSize: 14,
        }}
      />

      {/* Event List */}
      <View style={styles.eventsContainer}>
        {events.length > 0 ? (
          <FlatList
            data={events}
            keyExtractor={(item) => item.event_id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.eventItem}
                onPress={() =>
                  navigation.navigate("Homepage/EventDetails", {
                    eventId: item.event_id,
                  })
                }
              >
                <Text style={styles.eventTitle}>{item.event_name}</Text>
                <View style={styles.eventTimeContainer}>
                  <MaterialCommunityIcons name="timer" size={16} color="#0095FF" />
                  <Text style={styles.eventTime}>{`${formatTime(item.start_time)} - ${formatTime(item.end_time)}`}</Text>
                  <MaterialCommunityIcons name="map-marker-outline" size={16} color="#0095FF" />
                  <Text style={styles.eventLocation}>{item.location}</Text>
                </View>
                <Text style={styles.eventParticipants}>
                  <MaterialCommunityIcons name="account-multiple" size={16} color="#555" />
                  {` Participants: ${item.participants}`}
                </Text>
              </TouchableOpacity>
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

      {/* Display message for past dates */}
      {events.length === 0 && selectedDate < new Date().toISOString().split("T")[0] && (
        <Text style={styles.noEventsText}>No events for this day.</Text>
      )}
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
  calendarTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#333",
  },
});

export default CalendarPage;
