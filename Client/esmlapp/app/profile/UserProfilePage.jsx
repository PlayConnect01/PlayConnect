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
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const fetchUserEvents = async () => {
      try {
        // Use the correct endpoint for getting participated events
        const response = await fetch(`${BASE_URL}/events/getParticipated/${userId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching user events:', error);
        setEvents([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
      fetchUserEvents();
    } else {
      setLoading(false);
    }
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
              <Text style={styles.userName}>{userData.username}</Text>
            </>
          )}
        </View>
        <View style={styles.eventsContainer}>
          <Text style={styles.sectionTitle}>Participated Events</Text>
          {events.length === 0 ? (
            <Text style={styles.noEventsText}>No events participated yet</Text>
          ) : (
            events.map((event) => {
              const eventDate = new Date(event.date);
              const isPastEvent = eventDate < new Date();
              
              return (
                <TouchableOpacity
                  key={event.event_id}
                  style={[
                    styles.eventCard,
                    isPastEvent && styles.pastEventCard
                  ]}
                  onPress={() => {
                    if (!isPastEvent) {
                      navigation.navigate('EventDetails', { eventId: event.event_id });
                    }
                  }}
                  disabled={isPastEvent}
                >
                  <Image
                    source={{ uri: event.image }}
                    style={[
                      styles.eventImage,
                      isPastEvent && styles.pastEventImage
                    ]}
                  />
                  <View style={styles.eventInfo}>
                    <View style={styles.eventHeader}>
                      <Text style={[
                        styles.eventName,
                        isPastEvent && styles.pastEventText
                      ]}>
                        {event.event_name}
                      </Text>
                      {isPastEvent && (
                        <Text style={styles.pastEventBadge}>Past Event</Text>
                      )}
                    </View>
                    <View style={styles.eventDetail}>
                      <MaterialIcons name="location-on" size={16} color={isPastEvent ? "#999" : "#666"} />
                      <Text style={[
                        styles.eventText,
                        isPastEvent && styles.pastEventText
                      ]}>
                        {event.location}
                      </Text>
                    </View>
                    <View style={styles.eventDetail}>
                      <MaterialIcons name="event" size={16} color={isPastEvent ? "#999" : "#666"} />
                      <Text style={[
                        styles.eventText,
                        isPastEvent && styles.pastEventText
                      ]}>
                        {new Date(event.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Text>
                    </View>
                    <View style={styles.eventDetail}>
                      <MaterialIcons name="access-time" size={16} color={isPastEvent ? "#999" : "#666"} />
                      <Text style={[
                        styles.eventText,
                        isPastEvent && styles.pastEventText
                      ]}>
                        {new Date(event.start_time).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </View>
                    <View style={styles.categoryPriceContainer}>
                      <Text style={[
                        styles.category,
                        isPastEvent && styles.pastEventCategory
                      ]}>
                        {event.category}
                      </Text>
                      <Text style={[
                        styles.price,
                        isPastEvent && styles.pastEventText
                      ]}>
                        ${event.price}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
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
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  eventInfo: {
    padding: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    flex: 1,
  },
  categoryPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  category: {
    backgroundColor: '#e8f4ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    color: '#0095FF',
    fontSize: 12,
    fontWeight: '600',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  noEventsText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
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
  pastEventCard: {
    opacity: 0.7,
    backgroundColor: '#f5f5f5',
  },
  pastEventImage: {
    opacity: 0.5,
  },
  pastEventText: {
    color: '#999',
  },
  pastEventCategory: {
    backgroundColor: '#f0f0f0',
    color: '#999',
  },
  pastEventBadge: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
});

export default UserProfilePage;