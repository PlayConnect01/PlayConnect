import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const fetchEvents = (date) => {
    setLoading(true);

    axios
      .get(`http://192.168.104.4:3000/events/getByDate/${date}`)
      .then((response) => {
        setEvents(response.data);
        setLoading(false);        
      })
      .catch((error) => {
        setEvents([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEvents(selectedDate);
  }, [selectedDate]);

  const renderCalendar = () => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
    const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <View style={styles.calendar}>
        <View style={styles.calendarHeader}>
          <Text style={styles.calendarMonth}>
            {today.toLocaleString("default", { month: "long" })} {today.getFullYear()}
          </Text>
        </View>
        <View style={styles.calendarGrid}>
          {Array(firstDay)
            .fill(null)
            .map((_, index) => (
              <View key={`empty-${index}`} style={styles.calendarDay} />
            ))}
          {calendarDays.map((day) => {
            const dateString = `${today.getFullYear()}-${(today.getMonth() + 1)
              .toString()
              .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
            const isSelected = dateString === selectedDate;

            return (
              <TouchableOpacity
                key={day}
                style={[styles.calendarDay, isSelected && styles.selectedDay]}
                onPress={() => setSelectedDate(dateString)}
              >
                <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>{day}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
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
      </View>

      {renderCalendar()}

      
      <View style={styles.eventsContainer}>
        {events.length > 0 ? (
          events.map((item) => (
            <View key={item.event_id} style={styles.eventCard}>
              <Text style={styles.eventName}>{item.event_name}</Text>
              <Text style={styles.eventDate}>
                {new Date(item.start_time).toLocaleString()} - {new Date(item.end_time).toLocaleString()}
              </Text>
              <Text style={styles.eventLocation}>{item.location}</Text>
            </View>
          ))
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
  calendar: {
    padding: 20,
  },
  calendarHeader: {
    alignItems: "center",
    marginBottom: 10,
  },
  calendarMonth: {
    fontSize: 16,
    fontWeight: "bold",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  calendarDay: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
  },
  dayText: {
    fontSize: 14,
  },
  selectedDay: {
    backgroundColor: "#007BFF",
    borderColor: "#007BFF",
  },
  selectedDayText: {
    color: "#fff",
  },
  eventsContainer: {
    flex: 1,
    padding: 20,
  },
  eventCard: {
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
  },
  eventName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  eventDate: {
    fontSize: 14,
    color: "#555",
  },
  eventLocation: {
    fontSize: 14,
    color: "#007BFF",
  },
  noEventsText: {
    textAlign: "center",
    marginTop: 20,
    color: "#555",
  },
});

export default CalendarPage;
