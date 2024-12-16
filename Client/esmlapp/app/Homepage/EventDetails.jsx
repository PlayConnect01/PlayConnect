import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';

const EventDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { eventId } = route.params;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`http://192.168.100.120:3000/events/getById/${eventId}`);
        setEvent(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response ? err.response.data : err.message);
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleAddParticipant = async () => {
    try {
      const userId = event.creator_id;
      await axios.post('http://192.168.100.120:3000/events/addParticipant', {
        eventId,
        userId,
      });

      Alert.alert('Success', 'You have been added to the event!');
      const updatedEvent = await axios.get(`http://192.168.100.120:3000/events/getById/${eventId}`);
      setEvent(updatedEvent.data);
    } catch (error) {
      if (error.response && error.response.status === 400 && error.response.data.error) {
        Alert.alert('Notice', error.response.data.error);
      } else {
        Alert.alert('Error', 'Failed to join the event. Please try again.');
      }
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {JSON.stringify(error)}</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No event found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Ionicons name="football-outline" size={24} color="black" />
        <Ionicons name="menu" size={24} color="black" />
      </View>

      <ScrollView>
        <Text style={styles.eventName}>{event.event_name}</Text>
        <Text style={styles.description}>{event.description}</Text>

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Ionicons name="person" size={16} color="gray" />
            <Text style={styles.infoText}>Event Creator: {event.creator ? event.creator.username : 'Unknown Creator'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={16} color="gray" />
            <Text style={styles.infoText}>Date: {new Date(event.date).toLocaleString()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={16} color="gray" />
            <Text style={styles.infoText}>Location: {event.location}</Text>
          </View>
          <Image
            source={{
              uri: `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(
                event.location
              )}&zoom=15&size=600x300&key=YOUR_API_KEY`,
            }}
            style={styles.map}
          />
        </View>

        <View style={styles.participantsContainer}>
          <Text style={styles.sectionTitle}>Participants: {event.event_participants?.length || 0} / {event.participants}</Text>

          <View style={styles.participantGrid}>
            {event.event_participants?.map((participant) => (
              <View key={participant.user_id} style={styles.participantItem}>
                <Ionicons name="person-circle" size={32} color="black" />
                <Text style={styles.participantName}>{participant.user.username}</Text>
              </View>
            ))}
          </View>

          {event.event_participants?.length === 0 && (
            <Text style={styles.infoText}>No participants yet. Be the first to join!</Text>
          )}

          <TouchableOpacity style={styles.addButton} onPress={handleAddParticipant}>
            <Ionicons name="add-circle" size={40} color="purple" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.navbar}>
        <Ionicons name="home-outline" size={24} color="black" />
        <Ionicons name="search" size={24} color="purple" />
        <Ionicons name="chatbubble-outline" size={24} color="black" />
        <Ionicons name="person-outline" size={24} color="black" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'red',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  eventName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  description: {
    fontSize: 14,
    color: 'gray',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  infoContainer: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    margin: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 8,
    color: 'gray',
  },
  map: {
    width: '100%',
    height: 150,
    marginTop: 8,
    borderRadius: 8,
  },
  participantsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  participantGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  participantItem: {
    alignItems: 'center',
    margin: 8,
  },
  participantName: {
    fontSize: 12,
    marginTop: 4,
    color: 'black',
  },
  addButton: {
    alignSelf: 'center',
    marginTop: 16,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'lightgray',
  },
});

export default EventDetails;