import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios"; // Import axios for API requests

const { width } = Dimensions.get("window"); // Get device width for responsiveness

const App = () => {
  const [categories, setCategories] = useState([]); // State to store categories data
  const [loading, setLoading] = useState(true); // Loading state to handle API request state
  const [competitions, setCompetitions] = useState([]);
 
  // Fetch categories from the backend
  useEffect(() => {
    axios
      .get("http://localhost:3000/sports")
      .then((response) => {
        setCategories(response.data); // Set the response data to categories
        setLoading(false); // Set loading to false once data is fetched
        console.log(response.data,'888888888888888888888888888888888888888')
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
        setLoading(false); // Set loading to false if there’s an error
      });

      axios.get("http://localhost:3000/competetion").then((response) => {
        setCompetitions(response.data);
      });

  }, []);



  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const onStartTimeChange = (event, selectedTime) => {
    setShowStartTimePicker(false);
    if (selectedTime) setStartTime(selectedTime);
  };

  const onEndTimeChange = (event, selectedTime) => {
    setShowEndTimePicker(false);
    if (selectedTime) setEndTime(selectedTime);
  };

  const handleLocationSelect = (location) => {
    setMapLocation(location);
    setLocation(`Lat: ${location.latitude}, Lon: ${location.longitude}`); // Update location input
    setShowMapModal(false); // Close the map modal
  };

  const createEvent = async () => {
    // Frontend validation
    if (!eventName || !note || !date || !startTime || !endTime || !location || !participants || !price) {
      Alert.alert(
        'Error!',
        'Please fill in all fields before creating the event.',
        [{ text: 'Okay' }]
      );
      return; // Exit the function if validation fails
    }

    try {
      const eventData = {
        eventName,
        note,
        date,
        startTime,
        endTime,
        location,
        category,
        participants,
        price,
        isFree
      };

      await axios.post('http://192.168.103.8:3000/events/create', eventData);
      
      Alert.alert(
        'Success!',
        'Event created successfully!', 
        [{ text: 'Okay', onPress: () => router.push('Homepage/Test') }]
      );

      setEventName('');
      setNote('');
      setDate(null);
      setStartTime(null);
      setEndTime(null);
      setLocation('');
      setCategory('Sports');
      setParticipants('10');
      setPrice('0');
      setIsFree(false);

    } catch (error) {
      Alert.alert(
        'Error!',
        'There was an issue creating the event.',
        [{ text: 'Okay' }]
      );
    }
  };

  if (loading) {
    return <Text>Loading...</Text>; // Display a loading message while waiting for the data
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add New Event</Text>
      <TextInput
        style={styles.input}
        placeholder="Event name*"
        value={eventName}
        onChangeText={setEventName}
      />
      <TextInput
        style={styles.note}
        placeholder="Type the note here..."
        value={note}
        onChangeText={setNote}
      />
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
        <Text>{date ? date.toDateString() : "Date"}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker value={date || new Date()} onChange={onDateChange} mode="date" />
      )}
      <View style={styles.timeContainer}>
        <TouchableOpacity onPress={() => setShowStartTimePicker(true)} style={[styles.input, styles.timeInput]}>
          <Text>{startTime ? startTime.toLocaleTimeString() : "Start time"}</Text>
        </TouchableOpacity>
        {showStartTimePicker && (
          <DateTimePicker
            value={startTime || new Date()}
            onChange={onStartTimeChange}
            mode="time"
          />
        )}
        <TouchableOpacity onPress={() => setShowEndTimePicker(true)} style={[styles.input, styles.timeInput]}>
          <Text>{endTime ? endTime.toLocaleTimeString() : "End time"}</Text>
        </TouchableOpacity>
        {showEndTimePicker && (
          <DateTimePicker
            value={endTime || new Date()}
            onChange={onEndTimeChange}
            mode="time"
          />
        )}
      </View>

      <TouchableOpacity onPress={() => setShowMapModal(true)} style={styles.input}>
        <Text>{location || "Select Location"}</Text>
      </TouchableOpacity>
      <Modal
        visible={showMapModal}
        animationType="slide"
        onRequestClose={() => setShowMapModal(false)} 
        transparent={false} 
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={() => setShowMapModal(false)} style={styles.closeArrow}>
            <Icon name="arrow-back" size={30} color="#fff" />
          </TouchableOpacity>
          <MapPicker onLocationSelect={handleLocationSelect} initialLocation={mapLocation} />
        </View>
      </Modal>

      <Picker
        selectedValue={category}
        style={styles.select}
        onValueChange={(itemValue) => setCategory(itemValue)}
      >
        <Picker.Item label="Sports" value="Sports" />
        <Picker.Item label="Music" value="Music" />
        <Picker.Item label="Education" value="Education" />
      </Picker>
      <View style={styles.row}>
        <View style={styles.column}>
          <Text>Participants:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={participants}
            onChangeText={setParticipants}
          />
        </View>
        <View style={styles.column}>
          <Text>Price:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
            editable={!isFree}
          />
        </View>
      </View>
      <View style={styles.eventsCard}>
        <Text style={styles.cardText}>Today's Events</Text>
        <Text style={styles.cardProgress}>15/20</Text>
      </View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Category</Text>
        <TouchableOpacity onPress={() => navigation.navigate("SeeAllNavigation")}>
  <Text style={styles.seeAll}>See All</Text>
</TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
        {categories.map((category) => (
          <View key={category.id} style={styles.categoryItem}>
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={styles.categoryName}>{category.name}</Text> 
          </View>
        ))}
      </ScrollView>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Competition of the Week</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.competitions}>
        {competitions.map((competition) => (
          <View key={competition.tournament_id} style={styles.competitionItem}>
              <MaterialCommunityIcons name="trophy-outline" size={24} color="#555" />
            <Text style={styles.competitionTitle}>{competition.tournament_name}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Events Grid */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Events</Text>
      </View>
      <ScrollView contentContainerStyle={styles.eventsGrid}>
        {events.map((event) => (
          <View key={event.id} style={styles.eventItem}>
            <Image source={{ uri: event.image }} style={styles.eventImage} />
            <Text style={styles.eventText}>{event.name}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  note: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingBottom: 50,
    marginVertical: 8,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  select: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginVertical: 8,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  column: {
    flex: 1,
    marginHorizontal: 4,
  },
  createButton: {
    backgroundColor: "#6200ee",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 18,
fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000', 
  },
  categories: {
    flexDirection: "row",
    marginBottom: 20,
    paddingHorizontal: 10,
    minWidth: "100%",
  },
  categoryItem: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    aspectRatio: 1,
    marginBottom: 20,
  },
  categoryIcon: {
    fontSize: 30,
  },
  categoryName: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 5
  },
  competitions: {
    flexDirection: "row",
    marginBottom: 20,
  },
  competitionItem: {
    alignItems: "center",
    marginRight: 100,
    marginBottom: 10
  },
  competitionText: {
    marginTop: 5,
    fontSize: 14,
    color: "#555",
  },
  eventsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  eventItem: {
    width: width * 0.45,
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 15,
    backgroundColor: "#f0f0f0",
  },
  eventImage: {
    width: "100%",
    height: 120,
  },
  eventText: {
    padding: 10,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
});

export default AddNewEvent;