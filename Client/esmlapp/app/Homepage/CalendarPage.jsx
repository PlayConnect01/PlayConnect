import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { Calendar } from "react-native-calendars";
import { BASE_URL } from "../../Api";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
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
    setSelectedDate(selectedDate);
    fetchEvents(selectedDate);
  };


  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };


  const formatDisplayDate = (dateString) => {
    try {
      // Ensure we're working with a valid date string
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // If date is invalid, return today's date
        return new Date().toLocaleDateString("en-US", {
          weekday: "long",
          day: "numeric",
          month: "long",
        });
      }
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return new Date().toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
    }
  };

  const formatEventDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return `${month} ${day}${getOrdinalSuffix(day)}, ${year}`;
  };


  const getMarkedDates = () => {
    const marked = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString().split('T')[0];

    // Mark past dates as disabled
    for (let i = 1; i <= 30; i++) {
      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - i);
      const dateString = pastDate.toISOString().split('T')[0];
      marked[dateString] = { 
        disabled: true, 
        disableTouchEvent: true,
        marked: false,
        dotColor: 'transparent'
      };
    }

    // Only mark the selected date if it's today or in the future
    if (selectedDate && selectedDate >= todayString) {
      marked[selectedDate] = {
        selected: true,
        selectedColor: "#0095FF",
      };
    }

    // Mark today
    marked[todayString] = {
      selected: selectedDate === todayString,
      selectedColor: "#0095FF",
    };

    return marked;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Calendar Title and Selected Date */}
      <Text style={styles.calendarTitle}>Events Calendar</Text>
      <Text style={styles.selectedDate}>{formatDisplayDate(selectedDate)}</Text>

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
                  navigation.navigate("EventDetails", {
                    eventId: item.event_id,
                  })
                }
              >
                <Text style={styles.eventTitle}>{item.event_name}</Text>
                <View style={styles.eventDetailsContainer}>
                  <View style={styles.eventDetail}>
                    <MaterialCommunityIcons
                      name="calendar"
                      size={16}
                      color="#0095FF"
                      style={styles.icon}
                    />
                    <Text style={styles.eventText}>
                      {formatEventDate(item.date)}
                    </Text>
                  </View>
                  <View style={styles.eventDetail}>
                    <MaterialCommunityIcons
                      name="map-marker-outline"
                      size={16}
                      color="#0095FF"
                      style={styles.icon}
                    />
                    <Text style={styles.eventText}>{item.location}</Text>
                  </View>
                  <View style={styles.eventDetail}>
                    <MaterialCommunityIcons
                      name="account-group-outline"
                      size={16}
                      color="#0095FF"
                      style={styles.icon}
                    />
                    <Text style={styles.eventText}>
                      {item.participants} Participants
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <Text style={styles.noEventsText}>No events for this day.</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate("AddNewEvent")}
      >
        <MaterialCommunityIcons name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Display message for past dates */}
      {events.length === 0 &&
        selectedDate < new Date().toISOString().split("T")[0] && (
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
  eventDetailsContainer: {
    marginTop: 8,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    marginRight: 8,
  },
  eventText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
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
  calendarTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#333",
  },
  selectedDate: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
});

export default CalendarPage;
