import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Switch, StyleSheet, TouchableOpacity, Alert, Modal, Image } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import MapPicker from '../Homepage/Mappicker';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
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

const AddNewEvent = () => {
  const navigation = useNavigation();
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
  const [mapLocation, setMapLocation] = useState({ latitude: 37.78825, longitude: -122.4324 });
  const [sports, setSports] = useState([]);
  const [image, setImage] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Sorry, we need camera roll permissions to make this work!');
      }
    })();

    axios.get("http://192.168.100.120:3000/sports")
      .then((response) => {
        setSports(response.data);
      })
      .catch((error) => {
        console.error("Error fetching sports:", error);
        Alert.alert('Error', 'Failed to load sports categories.');
      });
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImageToCloudinary = async (imageUri) => {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'event-image.jpg',
    });
    formData.append('upload_preset', 'PlayConnect'); // Replace with your Cloudinary upload preset

    try {
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dc9siq9ry/image/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };

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
    if (!eventName || !note || !date || !startTime || !endTime || !location || !participants || !price) {
      Alert.alert(
        'Error!',
        'Please fill in all fields before creating the event.',
        [{ text: 'Okay' }]
      );
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error!', 'No authentication token found. Please log in again.');
        return;
      }

      const decodedToken = decodeToken(token);
      if (!decodedToken) {
        throw new Error('Failed to decode token');
      }

      const userId = decodedToken.id || decodedToken.user_id || decodedToken.userId;
      if (!userId) {
        throw new Error('Could not find user ID in token');
      }

      let imageUrl = null;
      if (image) {
        imageUrl = await uploadImageToCloudinary(image.uri);
      }

      const eventData = {
        eventName,
        note,
        date: date.toISOString(),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        location,
        category,
        participants: parseInt(participants, 10),
        price: parseFloat(price),
        isFree,
        creator_id: userId,
        imageUrl, // Add the Cloudinary URL
      };

      const response = await axios.post('http://192.168.100.120:3000/events/create', eventData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      Alert.alert(
        'Success!',
        'Event created successfully!',
        [{ text: 'Okay', onPress: () => navigation.navigate('Homepage/Homep') }]
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
      setImage(null);

    } catch (error) {
      console.error('Full error details:', error);
      Alert.alert(
        'Error!',
        'There was an issue creating the event. Please check the console for details.',
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
        <Picker.Item label="Sports" value="Sports" enabled={false} />
        {sports.map((sport, index) => (
          <Picker.Item key={index} label={sport.name} value={sport.name} />
        ))}
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

      <TouchableOpacity onPress={pickImage} style={styles.uploadButton}>
        <View style={styles.uploadContent}>
          <Icon name="cloud-upload-outline" size={24} color="#6200ee" />
          <Text style={styles.uploadText}>Upload Your Image Here</Text>
        </View>
      </TouchableOpacity>

      {image && (
        <Image source={{ uri: image.uri }} style={styles.previewImage} />
      )}

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
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  note: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    height: 100,
    textAlignVertical: 'top',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timeInput: {
    flex: 0.48,
  },
  select: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  column: {
    flex: 0.48,
  },
  modalContainer: {
    flex: 1,
  },
  closeArrow: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
    padding: 10,
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: '#6200ee',
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
  },
  uploadContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    marginLeft: 10,
    color: '#6200ee',
  },
  previewImage: {
    width: '100%',
    height: 200,
    marginBottom: 10,
    borderRadius: 5,
  },
  createButton: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AddNewEvent;