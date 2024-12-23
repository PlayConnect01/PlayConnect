import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';

const CategoryEvents = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { categoryName } = route.params;

  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get('http://192.168.104.10:3000/events/getAll')
      .then((response) => {
        setAllEvents(response.data);
        const events = response.data.filter((event) => event.category === categoryName);
        setFilteredEvents(events);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching events:', error);
        setError(error);
        setLoading(false);
      });
  }, [categoryName]);

  // Loading state
  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>Unable to load events. Please try again.</Text>
      </View>
    );
  }

  // No events in this category
  if (filteredEvents.length === 0) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#555" />
          </TouchableOpacity>
          <Text style={styles.categoryName}>{categoryName}</Text>
        </View>

        <View style={styles.centeredContainer}>
          <Ionicons 
            name="calendar-outline" 
            size={64} 
            color="#CCCCCC" 
            style={styles.noEventsIcon}
          />
          <Text style={styles.noEventsTitle}>No Events Found</Text>
          <Text style={styles.noEventsSubtitle}>
            There are currently no events in the {categoryName} category.
          </Text>
        </View>
      </ScrollView>
    );
  }

  // Events exist
  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#555" />
          </TouchableOpacity>
          <Text style={styles.categoryName}>{categoryName}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.eventsGrid}>
          {filteredEvents.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventItem}
              onPress={() =>
                navigation.navigate('Homepage/EventDetails', {
                  eventId: event.event_id,
                })
              }
            >
              <Image
                source={{
                  uri: event.image || 'https://via.placeholder.com/300x200',
                }}
                style={styles.eventImage}
              />
              <View style={styles.eventDetails}>
                <Text style={styles.eventText}>{event.event_name}</Text>
                <View style={styles.eventRow}>
                  <Ionicons name="location-outline" size={16} color="#555" />
                  <Text style={styles.eventDetailText}>{event.location}</Text>
                </View>
                <View style={styles.eventRow}>
                  <Ionicons name="calendar-outline" size={16} color="#555" />
                  <Text style={styles.eventDetailText}>{event.date}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  centeredContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  eventsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  eventItem: {
    width: '47%',
    marginBottom: 20,
  },
  eventImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },
  eventDetails: {
    marginTop: 10,
  },
  eventText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  eventDetailText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#555',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  noEventsIcon: {
    marginBottom: 20,
  },
  noEventsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  noEventsSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default CategoryEvents;