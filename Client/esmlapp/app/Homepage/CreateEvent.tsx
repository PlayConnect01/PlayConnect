import React, { useState } from "react";
import { View, Text, TextInput, Switch, StyleSheet, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker"; // For dropdowns
import DateTimePicker from "@react-native-community/datetimepicker";

const AddNewEvent = () => {
  const [eventName, setEventName] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("Sports");
  const [participants, setParticipants] = useState("10");
  const [price, setPrice] = useState("0");
  const [isFree, setIsFree] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const toggleFree = () => {
    setIsFree(!isFree);
    if (!isFree) setPrice("0"); // If toggled to free, reset price to 0
  };

  const onDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add New Event</Text>
      {/* Event Name */}
      <TextInput
        style={styles.input}
        placeholder="Event name*"
        value={eventName}
        onChangeText={setEventName}
      />

      {/* Note */}
      <TextInput
        style={styles.input}
        placeholder="Type the note here..."
        value={note}
        onChangeText={setNote}
      />

      {/* Date */}
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
        <Text>{date ? date.toDateString() : "Date"}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker value={date || new Date()} onChange={onDateChange} mode="date" />
      )}

      {/* Start Time and End Time */}
      <View style={styles.timeContainer}>
        <TextInput
          style={[styles.input, styles.timeInput]}
          placeholder="Start time"
          value={startTime ? startTime.toTimeString() : ""}
        />
        <TextInput
          style={[styles.input, styles.timeInput]}
          placeholder="End time"
          value={endTime ? endTime.toTimeString() : ""}
        />
      </View>

      {/* Location */}
      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />

      {/* Category Dropdown */}
      <Picker
        selectedValue={category}
        style={styles.input}
        onValueChange={(itemValue) => setCategory(itemValue)}
      >
        <Picker.Item label="Sports" value="Sports" />
        <Picker.Item label="Music" value="Music" />
        <Picker.Item label="Education" value="Education" />
        {/* Add more categories here */}
      </Picker>

      {/* Participants and Price */}
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

      {/* Free Switch */}
      <View style={styles.row}>
        <Text>Free</Text>
        <Switch value={isFree} onValueChange={toggleFree} />
      </View>

      {/* Create Event Button */}
      <TouchableOpacity style={styles.createButton}>
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
});

export default AddNewEvent;
