import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useNavigation, useRoute } from "@react-navigation/native";
import Navbar from "../navbar/Navbar";
import { BASE_URL } from "../../Api";
import Modal from 'react-native-modal';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons'; 

const UserProfilePage = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId, reportedBy } = route.params; 
  const [userData, setUserData] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const banReasons = [
    "Inappropriate behavior",
    "Spam",
    "Fake account",
    "Harassment",
    "Violation of terms",
    "Other"
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/users/${userId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const fetchUserEvents = async () => {
      try {
        const response = await fetch(`${BASE_URL}/users/${userId}/events`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching user events:', error);
      }
    };

    fetchUserData();
    fetchUserEvents();
    setLoading(false);
  }, [userId]);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleConfirm = () => {
    if (selectedReason === 'Other' && !customReason.trim()) {
      alert('Please enter a custom reason');
      return;
    }
    const reason = selectedReason === 'Other' ? customReason.trim() : selectedReason;
    console.log('Selected reason:', reason);
    toggleModal();
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <Navbar />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleModal}>
          <MaterialIcons name="flag" size={24} color="red" />
        </TouchableOpacity>
      </View>
      <ScrollView>
        <View style={styles.profileHeader}>
          {userData && (
            <>
              <Image
                source={{
                  uri:
                    userData.profile_picture ||
                    "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541",
                }}
                style={styles.profileImage}
              />
              <Text style={styles.userName}>{userData.name}</Text>
            </>
          )}
        </View>
        <View style={styles.eventsContainer}>
          <Text style={styles.eventsTitle}>Events</Text>
          {events.length > 0 ? (
            events.map((event, index) => (
              <View key={index} style={styles.eventItem}>
                <Text style={styles.eventName}>{event.name}</Text>
                <Text style={styles.eventLocation}>{event.location}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noEventsText}>No events found</Text>
          )}
        </View>
      </ScrollView>
      <Modal isVisible={isModalVisible}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Report User</Text>
          <Picker
            selectedValue={selectedReason}
            onValueChange={(itemValue) => setSelectedReason(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select a reason" value="" />
            {banReasons.map((reason, index) => (
              <Picker.Item key={index} label={reason} value={reason} />
            ))}
          </Picker>
          {selectedReason === 'Other' && (
            <TextInput
              style={styles.input}
              placeholder="Enter custom reason..."
              value={customReason}
              onChangeText={setCustomReason}
            />
          )}
          <View style={styles.buttonContainer}>
            <Button title="Cancel" onPress={toggleModal} color="red" />
            <Button title="Confirm" onPress={handleConfirm} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  profileHeader: {
    alignItems: "center",
    padding: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  eventsContainer: {
    padding: 20,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  eventItem: {
    marginBottom: 10,
  },
  eventName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  eventLocation: {
    fontSize: 14,
    color: "gray",
  },
  noEventsText: {
    fontSize: 16,
    color: "gray",
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 10,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});

export default UserProfilePage;