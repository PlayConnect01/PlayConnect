import React, { useState } from "react";
import { View, Text, TextInput, Switch, StyleSheet, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";

const AddNewEvent = ({ navigation }) => {
  const navigate = useNavigation()
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

  const toggleFree = () => {
    setIsFree(!isFree);
    if (!isFree) setPrice("0");
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
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
      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />
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
        onPress={() => navigation.navigate("/Test")}       >
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
  note : {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingBottom : 50,
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
  select :  {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginVertical: 8,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  } , 
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

// export default AddNewEvent;
