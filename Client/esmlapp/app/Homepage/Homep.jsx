import React from "react";
import { View, Text } from 'react-native';

const App = () => {
  const categories = [
    { id: "1", icon: "🏀", name: "Basketball" },
    { id: "2", icon: "🏓", name: "Tennis" },
    { id: "3", icon: "🎮", name: "E-Sports" },
  ];

  const competitions = ["Football", "Tennis", "E-Sports"];

  const events = [
    { id: "1", image: "https://via.placeholder.com/150", name: "Football" },
    { id: "2", image: "https://via.placeholder.com/150", name: "Basketball" },
    { id: "3", image: "https://via.placeholder.com/150", name: "Gym" },
    { id: "4", image: "https://via.placeholder.com/150", name: "Box" },
    { id: "5", image: "https://via.placeholder.com/150", name: "E-Gaming" },
    { id: "6", image: "https://via.placeholder.com/150", name: "Swimming" },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.date}>Friday, 20 May</Text>
          <Text style={styles.greeting}>Good Morning</Text>
        </View>
        <View style={styles.headerIcons}>
          <Text style={styles.icon}>🔔</Text>
          <Text style={{ ...styles.icon, marginLeft: 15 }}>⚙️</Text>
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
        <a href="#" style={styles.seeAll}>
          See All
        </a>
      </View>
      <View style={styles.categories}>
        {categories.map((category) => (
          <View key={category.id} style={styles.categoryItem}>
            <Text>{category.icon}</Text>
          </View>
        ))}
      </View>

      {/* Competitions Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Competition of the Week</Text>
        <a href="#" style={styles.seeAll}>
          See All
        </a>
      </View>
      <View style={styles.competitions}>
        {competitions.map((competition, index) => (
          <View key={index} style={styles.competitionItem}>
            <Text style={styles.icon}>🏆</Text>
            <Text style={styles.competitionText}>{competition}</Text>
          </View>
        ))}
      </View>

      {/* Events Grid */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Events</Text>
      </View>
      <View style={styles.eventsGrid}>
        {events.map((event) => (
          <View key={event.id} style={styles.eventItem}>
            <img
              src={event.image}
              alt={event.name}
              style={styles.eventImage}
            />
            <Text style={styles.eventText}>{event.name}</Text>
          </View>
        ))}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <View style={styles.navButton}>
          <Text style={styles.icon}>🏠</Text>
          <Text style={styles.navButtonText}>Home</Text>
        </View>
        <View style={styles.navButton}>
          <Text style={styles.icon}>📅</Text>
          <Text style={styles.navButtonText}>Events</Text>
        </View>
        <View style={styles.navButtonCenter}>
          <Text style={styles.icon}>➕</Text>
        </View>
        <View style={styles.navButton}>
          <Text style={styles.icon}>💬</Text>
          <Text style={styles.navButtonText}>Chat</Text>
        </View>
        <View style={styles.navButton}>
          <Text style={styles.icon}>👤</Text>
          <Text style={styles.navButtonText}>Profile</Text>
        </View>
      </View>
    </View>
  );
};

export default App;

// Updated styles for JSX
const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    backgroundColor: "#fff",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "40px",
  },
  date: {
    fontSize: "14px",
    color: "#666",
  },
  greeting: {
    fontSize: "24px",
    fontWeight: "bold",
  },
  headerIcons: {
    display: "flex",
  },
  icon: {
    fontSize: "24px",
    color: "#555",
  },
  eventsCard: {
    backgroundColor: "#000",
    color: "#fff",
    padding: "20px",
    borderRadius: "15px",
    marginTop: "20px",
    marginBottom: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardText: {
    fontSize: "16px",
  },
  cardProgress: {
    fontSize: "16px",
    fontWeight: "bold",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "bold",
  },
  seeAll: {
    fontSize: "14px",
    color: "#007BFF",
    textDecoration: "none",
  },
  categories: {
    display: "flex",
    overflowX: "auto",
  },
  categoryItem: {
    backgroundColor: "#f5f5f5",
    padding: "15px",
    borderRadius: "50%",
    margin: "10px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "70px",
    height: "70px",
  },
  competitions: {
    display: "flex",
    overflowX: "auto",
  },
  competitionItem: {
    margin: "10px",
    textAlign: "center",
  },
  competitionText: {
    marginTop: "5px",
    fontSize: "14px",
    color: "#555",
  },
  eventsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "10px",
  },
  eventItem: {
    borderRadius: "15px",
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    textAlign: "center",
  },
  eventImage: {
    width: "100%",
    height: "120px",
    objectFit: "cover",
  },
  eventText: {
    fontSize: "14px",
    fontWeight: "bold",
    padding: "10px",
    color: "#333",
  },
  bottomNav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: "10px",
    borderTop: "1px solid #eee",
  },
  navButton: {
    textAlign: "center",
  },
  navButtonText: {
    fontSize: "12px",
    color: "#555",
    marginTop: "5px",
  },
  navButtonCenter: {
    position: "absolute",
    bottom: "10px",
    left: "calc(50% - 24px)",
  },
};
