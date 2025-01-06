import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BASE_URL } from "../../Api";

const CompetitionPage = () => {
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
      console.error('Error fetching tournaments:', error);
    }
  };

  const renderTournamentCard = (tournament) => (
    <TouchableOpacity 
      key={tournament.tournament_id}
      style={styles.card}
      onPress={() => navigation.navigate('TournamentDetail', { id: tournament.tournament_id })}
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
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="account-group" size={24} color="#0095FF" />
          <Text style={styles.statValue}>{tournament.teams?.length || 0}</Text>
          <Text style={styles.statLabel}>Teams</Text>
        </View>
        
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="trophy" size={24} color="#0095FF" />
          <Text style={styles.statValue}>{tournament.matches?.length || 0}</Text>
          <Text style={styles.statLabel}>Matches</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Tournaments</Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateTournament')}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#fff" />
            <Text style={styles.createButtonText}>Create</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.content}>
          {tournaments.map(renderTournamentCard)}
        </View>
        <Text
          style={styles.seeAll}
          onPress={() =>
            navigation.navigate("TournamentList")
          }
        >
          See All
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0095FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '500',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tournamentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  sportBadge: {
    backgroundColor: '#E5F2FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  sportName: {
    color: '#0095FF',
    fontWeight: '500',
  },
  infoRow: {
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateLabel: {
    marginLeft: 8,
    color: '#4B5563',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 4,
  },
  statLabel: {
    color: '#6B7280',
    marginTop: 2,
  },
  seeAll: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 4,
  },
});

export default CompetitionPage;