import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const TournamentList = () => {
  const [tournaments, setTournaments] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await fetch('http://192.168.104.10:3000/competetion/Teams');
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
          <Text style={styles.statValue}>{tournament.point_reward}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tournaments</Text>
      </View>
      <ScrollView style={styles.container}>
        {tournaments.map(renderTournamentCard)}
      </ScrollView>
    </SafeAreaView>
  );
};

const TournamentDetail = ({ route }) => {
  const [tournament, setTournament] = useState(null);
  const { id } = route.params;

  useEffect(() => {
    fetchTournamentDetails(id);
  }, [id]);

  const fetchTournamentDetails = async (tournamentId) => {
    try {
      const response = await fetch(`http://192.168.104.10:3000/competetion/${tournamentId}`);
      const tournamentData = await response.json();
      setTournament(tournamentData);
    } catch (error) {
      console.error('Error fetching tournament details:', error);
    }
  };

  if (!tournament) {
    return <Text style={styles.loading}>Loading...</Text>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.tournamentHeader}>
          <Text style={styles.tournamentTitle}>{tournament.tournament_name}</Text>
          <View style={styles.sportBadge}>
            <Text style={styles.sportName}>{tournament.sport.name}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.dateContainer}>
              <MaterialCommunityIcons name="calendar" size={20} color="#0095FF" />
              <Text style={styles.dateRange}>
                {new Date(tournament.start_date).toLocaleDateString()} - 
                {new Date(tournament.end_date).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="trophy" size={24} color="#0095FF" />
              <Text style={styles.statValue}>{tournament.point_reward}</Text>
              <Text style={styles.statLabel}>Points Reward</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="account-group" size={24} color="#0095FF" />
              <Text style={styles.statValue}>{tournament.teams?.length || 0}</Text>
              <Text style={styles.statLabel}>Teams</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Participating Teams</Text>
          {tournament.teams?.map(team => (
            <TouchableOpacity key={team.team_id} style={styles.teamItem}>
              <View style={styles.teamContent}>
                <View style={styles.teamHeader}>
                  <Text style={styles.teamName}>{team.team_name}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
                </View>
                <View style={styles.teamInfo}>
                  <View style={styles.infoItem}>
                    <MaterialCommunityIcons name="account-group" size={16} color="#666" />
                    <Text style={styles.infoText}>{team.members?.length || 0} Members</Text>
                  </View>
                  {team.creator && (
                    <View style={styles.infoItem}>
                      <MaterialCommunityIcons name="account" size={16} color="#666" />
                      <Text style={styles.infoText}>Captain: {team.creator.username}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tournamentHeader: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tournamentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tournamentName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  sportBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  sportName: {
    color: '#0095FF',
    fontSize: 14,
    fontWeight: '600',
  },
  infoRow: {
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateLabel: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  dateRange: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  teamItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  teamContent: {
    flex: 1,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '500',
  },
  teamInfo: {
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    color: '#666',
    fontSize: 14,
  },
  loading: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export { TournamentList, TournamentDetail };