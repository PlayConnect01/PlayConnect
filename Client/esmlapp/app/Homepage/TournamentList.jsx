import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { BASE_URL } from "../../Api";

const TournamentList = () => {
  const [tournaments, setTournaments] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await fetch(`${BASE_URL}/competetion/Teams`);
      const data = await response.json();
      setTournaments(data);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
    }
  };

  const renderTournamentCard = (tournament) => (
    <TouchableOpacity
      key={tournament.tournament_id}
      style={styles.card}
      onPress={() =>
        navigation.navigate("TournamentDetail", {
          id: tournament.tournament_id,
        })
      }
    >
      <View style={styles.cardHeader}>
        <Text style={styles.tournamentName}>{tournament.tournament_name}</Text>
        <View style={styles.sportBadge}>
          <Text style={styles.sportName}>{tournament.sport.name}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.dateContainer}>
          <MaterialCommunityIcons name="calendar" size={20} color="#0095FF" />
          <Text style={styles.dateLabel}>
            {new Date(tournament.start_date).toLocaleDateString()} -
            {new Date(tournament.end_date).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem} key="teams-stat">
          <MaterialCommunityIcons
            name="account-group"
            size={24}
            color="#0095FF"
            key="teams-icon"
          />
          <Text style={styles.statValue}>{tournament.teams?.length || 0}</Text>
          <Text style={styles.statLabel}>Teams</Text>
        </View>
        <View style={styles.statItem} key="points-stat">
          <MaterialCommunityIcons
            name="trophy"
            size={24}
            color="#0095FF"
            key="trophy-icon"
          />
          <Text style={styles.statValue}>{tournament.point_reward}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#555" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tournaments</Text>
      </View>
      <ScrollView style={styles.container}>
        {tournaments.map(renderTournamentCard)}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  tournamentName: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  sportBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  sportName: {
    color: "#0095FF",
    fontSize: 14,
    fontWeight: "600",
  },
  infoRow: {
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateLabel: {
    marginLeft: 8,
    color: "#666",
    fontSize: 14,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
});

export default TournamentList;
