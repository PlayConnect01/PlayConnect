import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Switch, StyleSheet, TouchableOpacity, Alert, Modal, Image, ScrollView, ImageBackground } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import MapPicker from '../Homepage/Mappicker';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navbar from "../navbar/Navbar";
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
  const [mapLocation, setMapLocation] = useState({ latitude: 36.85749, longitude: 10.16440 });
  const [sports, setSports] = useState([]);
  const [image, setImage] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Sorry, we need camera roll permissions to make this work!');
      }
    })();

    axios.get("http://192.168.103.9:3000/sports")
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
    formData.append('upload_preset', 'PlayConnect'); 

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
        console.log(imageUrl);
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
        image: imageUrl, 
      };

      const response = await axios.post('http://192.168.103.9:3000/events/create', eventData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      Alert.alert(
        'Success!',
        'Event created successfully!',
        [{ text: 'Okay', onPress: () => navigation.navigate('Homepage/Homep') }]
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
      <ImageBackground
        source={{ uri: 'https://i.pinimg.com/736x/42/b7/14/42b714cb88c1de11592dacdae7161066.jpg' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.formContainer}>
              <View style={styles.headerContainer}>
                <Text style={styles.header}>Create New Event</Text>
                <Text style={styles.subHeader}>Fill in the details below</Text>
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.sectionTitle}>Basic Information</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Event name*"
                  value={eventName}
                  onChangeText={setEventName}
                  placeholderTextColor="#666"
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Type the note here..."
                  value={note}
                  onChangeText={setNote}
                  multiline={true}
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.sectionTitle}>Date & Time</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateTimeButton}>
                  <Icon name="calendar-outline" size={24} color="#6200ee" style={styles.dateTimeIcon} />
                  <Text style={styles.dateTimeText}>{date ? date.toDateString() : "Select Date"}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker value={date || new Date()} onChange={onDateChange} mode="date" />
                )}

                <View style={styles.timeContainer}>
                  <TouchableOpacity 
                    onPress={() => setShowStartTimePicker(true)} 
                    style={[styles.dateTimeButton, styles.timeButton]}
                  >
                    <Icon name="time-outline" size={24} color="#6200ee" style={styles.dateTimeIcon} />
                    <Text style={styles.dateTimeText}>
                      {startTime ? startTime.toLocaleTimeString() : "Start Time"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => setShowEndTimePicker(true)} 
                    style={[styles.dateTimeButton, styles.timeButton]}
                  >
                    <Icon name="time-outline" size={24} color="#6200ee" style={styles.dateTimeIcon} />
                    <Text style={styles.dateTimeText}>
                      {endTime ? endTime.toLocaleTimeString() : "End Time"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.sectionTitle}>Location</Text>
                <TouchableOpacity onPress={() => setShowMapModal(true)} style={styles.inputWithIcon}>
                  <Text style={styles.placeholder}>{location || "Select Location"}</Text>
                  <Icon name="location-outline" size={24} color="#8D8D8D" />
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
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.sectionTitle}>Category</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={category}
                    style={styles.pickerStyle}
                    onValueChange={(itemValue) => setCategory(itemValue)}
                  >
                    <Picker.Item label="Sports" value="Sports" enabled={false} />
                    {sports.map((sport, index) => (
                      <Picker.Item key={index} label={sport.name} value={sport.name} />
                    ))}
                  </Picker>
                </View>
              </View>
              <View style={styles.inputSection}>
                <Text style={styles.sectionTitle}>Participants</Text>
                <View style={styles.inputGroup}>
                  <View style={styles.inlineInput}>
                    <Icon name="people-outline" size={24} color="#8D8D8D" style={styles.inputIcon} />
                    <Text style={styles.label}>Participants:</Text>
                    <TextInput
                      style={[styles.numberInput, styles.smallInput]}
                      keyboardType="numeric"
                      value={participants}
                      onChangeText={setParticipants}
                    />
                  </View>
                </View>
              </View>
              <View style={styles.inputSection}>
                <Text style={styles.sectionTitle}>Price</Text>
                <View style={styles.inputGroup}>
                  <View style={styles.inlineInput}>
                    <Icon name="wallet-outline" size={24} color="#8D8D8D" style={styles.inputIcon} />
                    <Text style={styles.label}>Price:</Text>
                    <TextInput
                      style={[styles.numberInput, styles.smallInput]}
                      keyboardType="numeric"
                      value={price}
                      onChangeText={setPrice}
                      editable={!isFree}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.sectionTitle}>Free</Text>
                <View style={styles.row}>
                  <Text>Free</Text>
                  <Switch value={isFree} onValueChange={toggleFree} />
                </View>
              </View>
              <View style={styles.inputSection}>
                <Text style={styles.sectionTitle}>Image</Text>
                <TouchableOpacity onPress={pickImage} style={styles.uploadButton}>
                  <View style={styles.uploadContent}>
                    <Icon name="cloud-upload-outline" size={24} color="#8D8D8D" />
                    <Text style={styles.uploadText}>Upload Your Image Here</Text>
                  </View>
                </TouchableOpacity>

                {image && (
                  <Image source={{ uri: image.uri }} style={styles.previewImage} />
                )}
              </View>

              <TouchableOpacity
                style={styles.createButton}
                onPress={createEvent}
              >
                <Text style={styles.createButtonText}>Create Event</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </ImageBackground>
      <Navbar />
    </View>
  );
};

const styles = StyleSheet.create({
  inputWithIcon: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeholder: {
    color: '#8D8D8D',
  },
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    padding: 20,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  inputSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    paddingLeft: 5,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0e7fe',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  dateTimeIcon: {
    marginRight: 10,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#6200ee',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeButton: {
    flex: 0.48,
  },
  pickerContainer: {
    backgroundColor: '#f0e7fe',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
  },
  createButton: {
    backgroundColor: '#6200ee',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#6200ee',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 10,
  },
  numberInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    width: '100%',
  },
  pickerStyle: {
    height: 50,
  },
  inlineInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  inputIcon: {
    marginRight: 10,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 10,
    width: 100,
  },
  smallInput: {
    width: 100,
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
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 15,
    marginBottom: 5,
  },
  uploadContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    marginLeft: 10,
    color: '#8D8D8D',
  },
  previewImage: {
    width: '100%',
    height: 200,
    marginBottom: 10,
    borderRadius: 5,
  },
});

export default AddNewEvent;
