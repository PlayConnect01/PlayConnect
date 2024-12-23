import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';


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

global.Buffer = Buffer;

const EventDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { eventId } = route.params;

  const [event, setEvent] = useState(null);
  const [userJoined, setUserJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`http://192.168.104.10:3000/events/getById/${eventId}`);
        setEvent(response.data);
        
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          const decodedToken = decodeToken(token);
          setUserJoined(response.data.event_participants.some(participant => participant.user_id === decodedToken.id));
        }
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
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.error("Token not found in AsyncStorage");
        Alert.alert('Error', 'You are not logged in. Please log in to join the event.');
        return;
      }

      const decodedToken = decodeToken(token);
      if (!decodedToken) {
        Alert.alert('Error', 'Invalid token. Please log in again.');
        return;
      }

      const userId = decodedToken.id || decodedToken.user_id || decodedToken.userId;
      if (!userId) {
        Alert.alert('Error', 'Failed to retrieve user information.');
        return;
      }

      await axios.post(
        'http://192.168.104.10:3000/events/addParticipant',
        { eventId, userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert('Success', 'You have been added to the event!');
      const updatedEvent = await axios.get(`http://192.168.104.10:3000/events/getById/${eventId}`);
      setEvent(updatedEvent.data);
      setUserJoined(true);
    } catch (error) {
      if (error.response && error.response.status === 400 && error.response.data.error) {
        Alert.alert('Notice', error.response.data.error);
      } else {
        Alert.alert('Error', 'Failed to join the event. Please try again.');
      }
    }
  };

  const handleRemoveParticipant = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.error("Token not found in AsyncStorage");
        Alert.alert('Error', 'You are not logged in. Please log in to leave the event.');
        return;
      }

      const decodedToken = decodeToken(token);
      if (!decodedToken) {
        Alert.alert('Error', 'Invalid token. Please log in again.');
        return;
      }

      const userId = decodedToken.id || decodedToken.user_id || decodedToken.userId;
      if (!userId) {
        Alert.alert('Error', 'Failed to retrieve user information.');
        return;
      }

      await axios.post(
        'http://192.168.104.10:3000/events/removeParticipant',
        { eventId, userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert('Success', 'You have successfully left the event!');
      const updatedEvent = await axios.get(`http://192.168.104.10:3000/events/getById/${eventId}`);
      setEvent(updatedEvent.data);
      setUserJoined(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to leave the event. Please try again.');
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
      </View>

      <ScrollView>
        <View style={styles.eventNameContainer}>
          <Ionicons name="football" size={24} color="black" style={styles.iconSpacing} />
          <Text style={styles.eventName}>{event.event_name}</Text>
        </View>

        <Text style={styles.description}>{event.description}</Text>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Ionicons name="person" size={20} color="black" style={styles.detailIcon} />
            <Text style={styles.boldLabel}>Event Creator:</Text>
            <Text style={styles.boldContent}>{event.creator ? event.creator.username : 'Unknown'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={20} color="black" style={styles.detailIcon} />
            <Text style={styles.boldLabel}>Date:</Text>
            <Text style={styles.boldContent}>{new Date(event.date).toLocaleString()}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="location" size={20} color="black" style={styles.detailIcon} />
            <Text style={styles.boldLabel}>Location:</Text>
            <Text style={styles.boldContent}>{event.location}</Text>
          </View>
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={{ uri: event.image || 'https://via.placeholder.com/300x150' }}
            style={styles.eventImage}
          />
        </View>

        <View style={styles.participantsContainer}>
          <Text style={styles.sectionTitle}>
            Participants: {event.event_participants?.length || 0} / {event.participants}
          </Text>
          <View style={styles.participantGrid}>
            {event.event_participants?.map((participant) => (
              <View key={participant.user_id} style={styles.participantItem}>
                <Ionicons name="person-circle" size={40} color="black" />
                <Text style={styles.participantName}>{participant.user.username}</Text>
              </View>
            ))}

            {event.event_participants?.length < event.participants && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  if (userJoined) {
                    Alert.alert(
                      'Confirmation',
                      'Are you sure you want to quit this event?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Yes', onPress: handleRemoveParticipant },
                      ]
                    );
                  } else {
                    Alert.alert(
                      'Confirmation',
                      'Are you sure you want to join this event?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Yes', onPress: handleAddParticipant },
                      ]
                    );
                  }
                }}
              >
                <Ionicons name={userJoined ? 'remove' : 'add'} size={30} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  eventNameContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16 },
  iconSpacing: { marginRight: 8 },
  eventName: { fontSize: 22, fontWeight: 'bold' },
  description: { fontSize: 14, color: 'gray', margin: 16 },
  detailsContainer: { marginHorizontal: 16, marginBottom: 16 },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  boldLabel: { fontSize: 16, fontWeight: 'bold', flex: 2 },
  boldContent: { fontSize: 16, textAlign: 'right', flex: 3 },
  imageContainer: { alignItems: 'center', marginVertical: 10, marginBottom: 50 },
  eventImage: { width: 350, height: 220, borderRadius: 10 },
  participantsContainer: { marginHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  participantGrid: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  participantItem: { alignItems: 'center', width: '45%', margin: 8 },
  participantName: { fontSize: 14, textAlign: 'center', marginTop: 4 },
  addButton: {
    width: 50,
    height: 50,
    backgroundColor: 'orange',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    margin: 8,
    marginLeft:60
  },
  detailIcon: {
    marginRight: 10,
  },
  loadingText: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginTop: 50 },
  errorText: { fontSize: 16, color: 'red', textAlign: 'center', marginTop: 50 },
});

export default EventDetails;