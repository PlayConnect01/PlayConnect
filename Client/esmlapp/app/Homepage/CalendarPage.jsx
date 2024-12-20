import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const navigation = useNavigation();

  const fetchEvents = (date) => {
    setLoading(true);
    const formattedDate = new Date(date).toISOString().split("T")[0];
    axios
      .get(`http://192.168.104.4:3000/events/getByDate/${formattedDate}`)
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
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
    fetchEvents(today);
  }, []);

  const handleDateChange = (event, date) => {
    setShowPicker(false);
    if (date) {
      setSelectedDate(date);
      fetchEvents(date.toISOString().split("T")[0]);
    }
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
        <Text style={styles.headerText}>Calendar</Text>
        <TouchableOpacity>
          <MaterialCommunityIcons name="calendar-outline" size={24} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Date Picker */}
      <View style={styles.datePickerContainer}>
        <TouchableOpacity onPress={() => setShowPicker(true)}>
          <Text>Select a date</Text>
        </TouchableOpacity>
        {showPicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </View>

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
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
  },
  datePickerContainer: {
    marginVertical: 20,
    alignItems: 'center',
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
});

export default CalendarPage;
