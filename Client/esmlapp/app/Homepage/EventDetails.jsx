import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const EventDetails = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get('http://192.168.103.8:3000/events/getAll'); 
        setEvent(response.data[0]); 
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, []);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  if (!event) {
    return <Text>No event found.</Text>; 
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={24} color="black" />
        <Ionicons name="football-outline" size={24} color="black" style={styles.icon} />
        <Ionicons name="menu" size={24} color="black" style={styles.icon} />
      </View>

      <ScrollView>
        <Text style={styles.eventName}>{event.event_name}</Text>
        <Text style={styles.description}>{event.description}</Text>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Event creator: {event.creator_id}</Text>
          <Text style={styles.infoText}>Date: {new Date(event.date).toLocaleString()}</Text>
          <Text style={styles.infoText}>Location: {event.location}</Text>
          <Image
            source={{ uri: 'https://via.placeholder.com/150' }}
            style={styles.map}
          />
        </View>

        <View style={styles.participantsContainer}>
          <Text style={styles.sectionTitle}>
            Participants: {event.participants || 0}/10
          </Text>

          <View style={styles.teamsContainer}>
            <View style={styles.teamSection}>
              <Text style={styles.teamTitle}>Home</Text>
              <Text>5/5</Text>
              {[...Array(5)].map((_, index) => (
                <View key={index} style={styles.participantItem}>
                  <Ionicons name="person-circle" size={24} color="black" />
                  <Text>Participant {index + 1}</Text>
                  <Ionicons name="star" size={16} color="gold" />
                </View>
              ))}
      
            </View>
          
            <View style={styles.teamSection}>
              <Text style={styles.teamTitle}>Away</Text>
              <Text>4/5</Text>
              {[...Array(4)].map((_, index) => (
                <View key={index} style={styles.participantItem}>
                  <Ionicons name="person-circle" size={24} color="black" />
                  <Text>Participant {index + 1}</Text>
                  <Ionicons name="star" size={16} color="gold" />
                </View>
              ))}
              <TouchableOpacity style={styles.addButton}>
                <Ionicons name="add-circle" size={24} color="purple" />
              </TouchableOpacity>
            </View>
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  icon: {
    marginHorizontal: 8,
  },
  eventName: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 16,
  },
  description: {
    fontSize: 14,
    color: 'gray',
    marginHorizontal: 16,
  },
  infoContainer: {
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
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
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  teamSection: {
    flex: 1,
    alignItems: 'center',
  },
  teamTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  addButton: {
    marginTop: 8,
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
