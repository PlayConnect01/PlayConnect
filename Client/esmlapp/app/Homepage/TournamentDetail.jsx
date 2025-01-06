import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
  Image,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { BASE_URL } from "../../Api";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';

global.Buffer = Buffer;

const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
  } catch (error) {
    console.error('Token decoding error:', error);
    return null;
  }
};

const TournamentDetail = () => {
  const [tournament, setTournament] = useState(null);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showTeamDetailsModal, setShowTeamDetailsModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params;

  useEffect(() => {
    const getUserId = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
          const decodedToken = decodeToken(token);
          setCurrentUserId(decodedToken?.userId);
        }
      } catch (error) {
        console.error("Error getting user ID:", error);
      }
    };

    getUserId();
  }, []);

  useEffect(() => {
    fetchTournamentDetails(id);
  }, [id]);

  const fetchTournamentDetails = async (tournamentId) => {
    try {
      const response = await fetch(`${BASE_URL}/competetion/${tournamentId}`);
      const tournamentData = await response.json();
      setTournament(tournamentData);
      navigation.setOptions({ title: tournamentData.tournament_name });
    } catch (error) {
      console.error("Error fetching tournament details:", error);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      Alert.alert("Error", "Please enter a team name");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Error", "Please login to create a team");
        return;
      }

      const decodedToken = decodeToken(token);
      if (!decodedToken) {
        Alert.alert("Error", "Invalid session. Please login again");
        return;
      }

      const response = await fetch(`${BASE_URL}/competetion/${id}/teams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          teamName: teamName.trim(),
          userId: decodedToken.userId 
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert("Success", "Team created successfully!");
        setShowCreateTeamModal(false);
        setTeamName("");
        fetchTournamentDetails(id);
      } else {
        Alert.alert("Error", data.error || "Failed to create team");
      }
    } catch (error) {
      console.error("Error creating team:", error);
      Alert.alert("Error", "Failed to create team");
    }
  };

  const handleViewTeam = async (team) => {
    try {
      const response = await fetch(`${BASE_URL}/competetion/teams/${team.team_id}`);
      const teamData = await response.json();
      setSelectedTeam(teamData);
      setShowTeamDetailsModal(true);
    } catch (error) {
      console.error("Error fetching team details:", error);
      Alert.alert("Error", "Failed to fetch team details");
    }
  };

  const handleJoinTeam = async (team) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Error", "Please login to join a team");
        return;
      }

      const decodedToken = decodeToken(token);
      if (!decodedToken) {
        Alert.alert("Error", "Invalid session. Please login again");
        return;
      }

      const response = await fetch(`${BASE_URL}/competetion/teams/${team.team_id}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: decodedToken.userId }),
      });

      const data = await response.json();
      if (data.success) {
        setQrCode(data.qrCode);
        Alert.alert("Success", "Successfully joined the team! Your QR code has been generated.");
        handleViewTeam(team);
      } else {
        Alert.alert("Error", data.error || "Failed to join team");
      }
    } catch (error) {
      console.error("Error joining team:", error);
      Alert.alert("Error", "Failed to join team");
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!tournament) {
    return <Text style={styles.loading}>Loading...</Text>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate("TournamentList")}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#555" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tournament.tournament_name}</Text>
      </View>
      <ScrollView style={styles.container}>
        <View style={styles.tournamentHeader}>
          <Text style={styles.tournamentTitle}>
            {tournament.tournament_name}
          </Text>
          {tournament.sport && (
            <View style={styles.sportBadge}>
              <Text style={styles.sportName}>{tournament.sport.name}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <View style={styles.dateContainer}>
              <MaterialCommunityIcons
                name="calendar"
                size={20}
                color="#0095FF"
              />
              <Text style={styles.dateRange}>
                {formatDate(tournament.start_date)} -
                {formatDate(tournament.end_date)}
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
              <MaterialCommunityIcons
                name="account-group"
                size={24}
                color="#0095FF"
              />
              <Text style={styles.statValue}>
                {tournament.teams?.length || 0}
              </Text>
              <Text style={styles.statLabel}>Teams</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Participating Teams</Text>
            <TouchableOpacity
              style={styles.createTeamButton}
              onPress={() => setShowCreateTeamModal(true)}
            >
              <MaterialCommunityIcons name="plus" size={24} color="#fff" />
              <Text style={styles.createTeamButtonText}>Create Team</Text>
            </TouchableOpacity>
          </View>
          {tournament.teams?.map((team) => (
            <TouchableOpacity 
              key={team.team_id} 
              style={styles.teamItem}
              onPress={() => handleViewTeam(team)}
            >
              <View style={styles.teamContent}>
                <View style={styles.teamHeader}>
                  <Text style={styles.teamName}>{team.team_name}</Text>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={24}
                    color="#666"
                  />
                </View>
                <View style={styles.teamInfo}>
                  <View style={styles.infoItem}>
                    <MaterialCommunityIcons
                      name="account-group"
                      size={16}
                      color="#666"
                    />
                    <Text style={styles.infoText}>
                      {team.members?.length || 0} Members
                    </Text>
                  </View>
                  {team.creator && (
                    <View style={styles.infoItem}>
                      <MaterialCommunityIcons
                        name="account"
                        size={16}
                        color="#666"
                      />
                      <Text style={styles.infoText}>
                        Captain: {team.creator.username}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Create Team Modal */}
      <Modal
        visible={showCreateTeamModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateTeamModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Team</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter team name"
              value={teamName}
              onChangeText={setTeamName}
              autoCapitalize="words"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateTeamModal(false)}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateTeam}
              >
                <Text style={[styles.modalButtonText, styles.createButtonText]}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        visible={showQRModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, styles.qrModalContent]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Team QR Code</Text>
              <TouchableOpacity
                onPress={() => setShowQRModal(false)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            {qrCode && (
              <View style={styles.qrCodeContainer}>
                <Image
                  source={{ uri: qrCode }}
                  style={styles.qrCode}
                  resizeMode="contain"
                />
                <Text style={styles.qrCodeText}>Show this QR code to verify your team membership</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Team Details Modal */}
      <Modal
        visible={showTeamDetailsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTeamDetailsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, styles.teamDetailsModal]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Team Details</Text>
              <TouchableOpacity
                onPress={() => setShowTeamDetailsModal(false)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedTeam && (
              <ScrollView style={styles.teamDetailsContent}>
                <View style={styles.teamHeaderSection}>
                  <Text style={styles.teamDetailName}>{selectedTeam.team_name}</Text>
                  {currentUserId && selectedTeam.members?.some(
                    member => member.user_id === parseInt(currentUserId)
                  ) && (
                    <TouchableOpacity
                      style={styles.qrButton}
                      onPress={() => setShowQRModal(true)}
                    >
                      <MaterialCommunityIcons name="qrcode" size={24} color="#0095FF" />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.membersSection}>
                  <Text style={styles.membersSectionTitle}>Team Members</Text>
                  {selectedTeam.members?.map((member) => (
                    <View key={member.team_member_id} style={styles.memberItem}>
                      <MaterialCommunityIcons
                        name={member.role === "CAPTAIN" ? "account-star" : "account"}
                        size={24}
                        color="#0095FF"
                      />
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>{member.user.username}</Text>
                        <Text style={styles.memberRole}>{member.role}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                {currentUserId && !selectedTeam.members?.some(
                  member => member.user_id === parseInt(currentUserId)
                ) && (
                  <TouchableOpacity
                    style={styles.joinTeamButton}
                    onPress={() => handleJoinTeam(selectedTeam)}
                  >
                    <MaterialCommunityIcons name="account-plus" size={24} color="#fff" />
                    <Text style={styles.joinTeamButtonText}>Join Team</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  tournamentHeader: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tournamentTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  sportBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 16,
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
  dateRange: {
    marginLeft: 8,
    fontSize: 16,
    color: "#666",
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
  section: {
    backgroundColor: "#fff",
    marginTop: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  createTeamButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007BFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createTeamButtonText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "600",
  },
  teamItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  teamContent: {
    flex: 1,
  },
  teamHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  teamName: {
    fontSize: 16,
    fontWeight: "500",
  },
  teamInfo: {
    gap: 8,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    color: "#666",
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    width: "80%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  createButton: {
    backgroundColor: '#0095FF',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButtonText: {
    color: '#333',
  },
  createButtonText: {
    color: '#fff',
  },
  loading: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  teamDetailsModal: {
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    padding: 5,
  },
  teamDetailsContent: {
    flex: 1,
  },
  teamDetailName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  qrCode: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
  qrCodeText: {
    fontSize: 16,
    color: '#666',
  },
  membersSection: {
    marginTop: 20,
  },
  membersSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  memberInfo: {
    marginLeft: 10,
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  memberRole: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  joinTeamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0095FF',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  joinTeamButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  qrModalContent: {
    height: 'auto',
    paddingVertical: 20,
  },
  teamHeaderSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  qrButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
});

export default TournamentDetail;
