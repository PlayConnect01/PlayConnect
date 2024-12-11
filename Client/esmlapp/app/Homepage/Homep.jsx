import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios"; // Import axios for API requests

const { width } = Dimensions.get("window"); // Get device width for responsiveness

const App = () => {
  const [categories, setCategories] = useState([]); // State to store categories data
  const [loading, setLoading] = useState(true); // Loading state to handle API request state

  // Fetch categories from the backend
  useEffect(() => {
    axios
      .get("http://localhost:3000/sports")
      .then((response) => {
        setCategories(response.data); // Set the response data to categories
        setLoading(false); // Set loading to false once data is fetched
        console.log(response.data,'888888888888888888888888888888888888888')
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
        setLoading(false); // Set loading to false if there’s an error
      });
  }, []);

  const competitions = ["Football", "Tennis", "E-Sports"];

  const events = [
    { id: "1", image: "https://via.placeholder.com/150", name: "Football" },
    { id: "2", image: "https://via.placeholder.com/150", name: "Basketball" },
    { id: "3", image: "https://via.placeholder.com/150", name: "Gym" },
    { id: "4", image: "https://via.placeholder.com/150", name: "Box" },
    { id: "5", image: "https://via.placeholder.com/150", name: "E-Gaming" },
    { id: "6", image: "https://via.placeholder.com/150", name: "Swimming" },
  ];

  if (loading) {
    return <Text>Loading...</Text>; // Display a loading message while waiting for the data
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.date}>Friday, 20 May</Text>
          <Text style={styles.greeting}>Good Morning</Text>
        </View>
        <View style={styles.headerIcons}>
          <Ionicons name="notifications-outline" size={24} color="#555" />
          <Ionicons name="settings-outline" size={24} color="#555" style={{ marginLeft: 15 }} />
        </View>
      </View>

      {/* Today's Events */}
      <View style={styles.eventsCard}>
        <Text style={styles.cardText}>Today's Events</Text>
        <Text style={styles.cardProgress}>15/20</Text>
      </View>

      {/* Categories Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Category</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
        {categories.map((category) => (
          <View key={category.id} style={styles.categoryItem}>
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={styles.categoryName}>{category.name}</Text> {/* Display the name property */}
          </View>
        ))}
      </ScrollView>

      {/* Competitions Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Competition of the Week</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.competitions}>
        {competitions.map((competition, index) => (
          <View key={index} style={styles.competitionItem}>
            <MaterialCommunityIcons name="trophy-outline" size={24} color="#555" />
            <Text style={styles.competitionText}>{competition}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Events Grid */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Events</Text>
      </View>
      <ScrollView contentContainerStyle={styles.eventsGrid}>
        {events.map((event) => (
          <View key={event.id} style={styles.eventItem}>
            <Image source={{ uri: event.image }} style={styles.eventImage} />
            <Text style={styles.eventText}>{event.name}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
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
    marginTop: 10,
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
    marginRight: 20,
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
    paddingBottom: 20,
  },
  eventItem: {
    width: width * 0.45,
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 15,
    backgroundColor: "#f0f0f0",
  },
  eventImage: {
    width: "100%",
    height: 120,
  },
  eventText: {
    padding: 10,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
});
