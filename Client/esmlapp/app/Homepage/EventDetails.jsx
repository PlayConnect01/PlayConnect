import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Modal } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import { BASE_URL } from '../../Api.js';
import MapView, { Marker } from 'react-native-maps';
import { Camera } from 'expo-camera';

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
  const [qrCode, setQrCode] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try { 
        const response = await axios.get(`${BASE_URL}/events/getById/${eventId}`);
        setEvent(response.data);
        
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          const decodedToken = decodeToken(token);
          const userId = decodedToken.id || decodedToken.user_id || decodedToken.userId;
          setIsCreator(response.data.creator_id === userId);
          const participantResponse = await axios.get(`${BASE_URL}/events/isUserParticipant/${eventId}/${userId}`);
          setUserJoined(participantResponse.data.isParticipant);

          if (participantResponse.data.isParticipant) {
            const qrResponse = await axios.get(`${BASE_URL}/events/getParticipantQR/${eventId}/${userId}`);
            setQrCode(qrResponse.data.qrCode);
          }
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

      const response = await axios.post(
        `${BASE_URL}/events/addParticipant`,
        { eventId, userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert('Success', 'You have been added to the event!');
      setUserJoined(true);

      // Display the QR code
      if (response.data.qrCode) {
        setQrCode(response.data.qrCode);
        setModalVisible(true);
      }

      const updatedEvent = await axios.get(`${BASE_URL}/events/getById/${eventId}`);
      setEvent(updatedEvent.data);
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
        `${BASE_URL}/events/removeParticipant`,
        { eventId, userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert('Success', 'You have successfully left the event!');
      const updatedEvent = await axios.get(`${BASE_URL}/events/getById/${eventId}`);
      setEvent(updatedEvent.data);
      setUserJoined(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to leave the event. Please try again.');
    }
  };

  const handleGoBack = () => {
    navigation.navigate("Homepage/Homep");
  };

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    const participantData = JSON.parse(data);
    setScannedData(participantData);
    setModalVisible(true);
  };

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  useEffect(() => {
    requestCameraPermission();
  }, []);

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
        {isCreator ? (
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <MaterialCommunityIcons name="qrcode-scan" size={30} color="black" />
          </TouchableOpacity>
        ) : (
          userJoined && qrCode && (
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <MaterialCommunityIcons name="qrcode" size={30} color="black" />
            </TouchableOpacity>
          )
        )}
      </View>

      <ScrollView>
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>{event.description}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Ionicons name="person" size={20} color="#0095FF" style={styles.detailIcon} />
            <Text style={styles.boldLabel}>Event Creator:</Text>
            <Text style={styles.boldContent}>{event.creator ? event.creator.username : 'Unknown'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={20} color="#0095FF" style={styles.detailIcon} />
            <Text style={styles.boldLabel}>Date:</Text>
            <Text style={styles.boldContent}>{new Date(event.date).toLocaleString()}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="location" size={20} color="#0095FF" style={styles.detailIcon} />
            <Text style={styles.boldLabel}>Location:</Text>
            <Text style={styles.boldContent}>{event.location}</Text>
          </View>
        </View>

        <View style={styles.imageContainer}>
          {event.latitude && event.longitude ? (
            <MapView
              style={styles.eventImage}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
              initialRegion={{
                latitude: event.latitude,
                longitude: event.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: event.latitude,
                  longitude: event.longitude,
                }}
              />
            </MapView>
          ) : (
            <Image
              source={{ uri: event.image || 'https://via.placeholder.com/300x150' }}
              style={styles.eventImage}
            />
          )}
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
                style={[styles.addButton, { backgroundColor: userJoined ? 'red' : '#0095FF' }]}
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
                <MaterialCommunityIcons name={userJoined ? 'account-remove' : 'account-plus'} size={27} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>

      </ScrollView>
      {isCreator && hasPermission && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
            setScanned(false);
          }}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <Camera
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              style={{ width: '100%', height: '100%' }}
            />
            {scanned && (
              <TouchableOpacity onPress={() => setScanned(false)} style={{ position: 'absolute', bottom: 50 }}>
                <Text style={{ fontSize: 18, color: 'white' }}>Tap to Scan Again</Text>
              </TouchableOpacity>
            )}
          </View>
        </Modal>
      )}
      {scannedData && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
            setScannedData(null);
          }}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View style={{ width: 300, height: 400, backgroundColor: 'white', padding: 20, alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Participant Approved</Text>
              <Image source={{ uri: scannedData.userProfilePicture }} style={{ width: 100, height: 100, borderRadius: 50, marginVertical: 20 }} />
              <Text style={{ fontSize: 16 }}>{scannedData.userName}</Text>
              <Text style={{ fontSize: 16, marginTop: 10 }}>{scannedData.eventName}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={{ marginTop: 20, color: 'blue' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
      {qrCode && !isCreator && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View style={{ width: 300, height: 300, backgroundColor: 'white', padding: 20, alignItems: 'center' }}>
              <Text>Your QR Code</Text>
              {qrCode && <Image source={{ uri: qrCode }} style={{ width: 200, height: 200 }} />}
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={{ marginTop: 20, color: 'blue' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
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
  imageContainer: {
    alignItems: 'center',
    marginVertical: 10,
    marginBottom: 50,
    height: 220,
    width: '100%',
  },
  eventImage: {
    width: '90%',
    height: 220,
    borderRadius: 10,
  },
  participantsContainer: { marginHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  participantGrid: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  participantItem: { alignItems: 'center', width: '45%', margin: 8 },
  participantName: { fontSize: 14, textAlign: 'center', marginTop: 4 },
  addButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    margin: 8,
    marginLeft: 60,
  },
  detailIcon: {
    marginRight: 10,
  },
  loadingText: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginTop: 50 },
  errorText: { fontSize: 16, color: 'red', textAlign: 'center', marginTop: 50 },
  descriptionContainer: { 
    margin: 16, 
    padding: 15, 
    backgroundColor: '#ffffff', 
    borderRadius: 10, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.5, 
    shadowRadius: 4, 
    elevation: 3,
  },
  descriptionText: { 
    fontSize: 16, 
    color: '#333',
    lineHeight: 24,
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  qrCodeImage: {
    width: 200,
    height: 200,
  },
});

export default EventDetails;