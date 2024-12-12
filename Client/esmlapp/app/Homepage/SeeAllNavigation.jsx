import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import axios from "axios";

const SeeAllPage = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:3000/sports")
      .then((response) => {
        setCategories(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.dateText}>Friday, 20 May</Text>
          <Text style={styles.header}>All Category</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("CalendarPage")}>
          <MaterialCommunityIcons
            name="calendar-outline"
            size={24}
            color="#555"
          />
        </TouchableOpacity>
      </View>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        numColumns={3} 
        columnWrapperStyle={styles.row} 
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <Image source={{ uri: item.icon }} style={styles.cardImage} />
            <Text style={styles.cardText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default SeeAllPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  dateText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "left",
  },
  row: {
    justifyContent: "space-between", // Ensure spacing between cards
    marginBottom: 20,
  },
  card: {
    width: "30%", // Adjust to fit 3 columns
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    elevation: 3, // For slight shadow effect
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardImage: {
    width: 50,
    height: 50,
    resizeMode: "contain",
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    color: "#333",
  },
});
