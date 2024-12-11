import React, { useState } from "react";
import { View, Text, TextInput, Switch, StyleSheet, TouchableOpacity, Alert, Modal } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from 'axios';
import { useRouter } from 'expo-router';
import MapPicker from '../Homepage/Mappicker'; 

const AddNewEvent = () => {
  const router = useRouter();
  const [eventName, setEventName] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("Sports");
  const [participants, setParticipants] = useState("10");
  const [price, setPrice] = useState("0");
  const [isFree, setIsFree] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapLocation, setMapLocation] = useState({ latitude: 36.65640, longitude: 10.18991 });

  const toggleFree = () => {
    setIsFree(!isFree);
    if (!isFree) setPrice("0");
  };

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
    setLocation(`Lat: ${location.latitude}, Lon: ${location.longitude}`);  
    setShowMapModal(false); 
  };

  const createEvent = async () => {
    // Frontend validation
    if (!eventName || !note || !date || !startTime || !endTime || !location || !participants || !price) {
      Alert.alert(
        'Error!',
        'Please fill in all fields before creating the event.',
        [{ text: 'Okay' }]
      );
      return; 
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

      await axios.post('http://192.168.100.120:3000/events/create', eventData);
      
      Alert.alert(
        'Success!',
        'Event created successfully!', 
        [{ text: 'Okay', onPress: () => router.push('Match/Matchingpage') }]
      );

      // Reset form
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
      >
        <MapPicker onLocationSelect={handleLocationSelect} initialLocation={mapLocation} />
        
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
      <View style={styles.row}>
        <Text>Free</Text>
        <Switch value={isFree} onValueChange={toggleFree} />
      </View>
      <TouchableOpacity
        style={styles.createButton}
        onPress={createEvent}
      >
        <Text style={styles.createButtonText}>Create Event</Text>
      </TouchableOpacity>
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
    marginTop: 16,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#6200ee",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default AddNewEvent;