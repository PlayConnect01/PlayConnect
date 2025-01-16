import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Modal, TextInput, Button, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import { BASE_URL } from '../../Api.js';
import MapView, { Marker } from 'react-native-maps';
import { Camera } from 'expo-camera';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import EventReviews from './EventReviews.jsx';

const formatTime = (timeString) => {
  if (!timeString) return '';
  
  // If timeString is already in HH:mm format, just parse the hours and minutes
  if (timeString.includes(':')) {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }
  
  // Fallback for full date string
  const date = new Date(timeString);
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

const getOrdinalSuffix = (day) => {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  return `${month} ${day}${getOrdinalSuffix(day)} ${year}`;
};

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
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

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
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [stripeKey, setStripeKey] = useState(null);
  const [userId, setUserId] = useState(null); // Add userId state

  // Add useEffect to get userId from token
  useEffect(() => {
    const getUserId = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          const decodedToken = decodeToken(token);
          const id = decodedToken.id || decodedToken.user_id || decodedToken.userId;
          setUserId(id);
        }
      } catch (error) {
        console.error('Error getting userId:', error);
      }
    };
    getUserId();
  }, []);

  // Fetch Stripe key from backend
  useEffect(() => {
    const fetchStripeKey = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/payments/config`);
        setStripeKey(response.data.publishableKey);
      } catch (err) {
        console.error('Error fetching Stripe key:', err);
        Alert.alert('Error', 'Failed to initialize payment system');
      }
    };
    fetchStripeKey();
  }, []);

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



const initializePayment = async (amount, userId) => {
  try {
    const response = await axios.post(`${BASE_URL}/payments/process`, {
      userId,
      amount: amount,
      items: [{
        eventId: event.event_id,
        eventName: event.event_name,
        price: amount
      }]
    });

    const { clientSecret } = response.data;

    const { error: initError } = await initPaymentSheet({
      paymentIntentClientSecret: clientSecret,
      merchantDisplayName: 'PlayConnect',
      style: 'automatic',
      appearance: {
        colors: {
          primary: '#0095FF',
          background: '#ffffff',
          componentBackground: '#ffffff',
          componentBorder: '#000000',
          componentDivider: '#000000',
          primaryText: '#000000',
          secondaryText: '#333333',
          componentText: '#000000',
          placeholderText: '#999999'
        },
        shapes: {
          borderRadius: 12,
          borderWidth: 1
        },
        primaryButton: {
          colors: {
            background: '#0095FF',
            text: '#ffffff'
          }
        }
      }
    });

    if (initError) {
      throw new Error(initError.message);
    }

    const { error: presentError } = await presentPaymentSheet();
    
    if (presentError) {
      if (presentError.code === 'Canceled') {
        return false;
      }
      throw new Error(presentError.message);
    }

    return true;
  } catch (error) {
    console.error('Payment initialization error:', error);
    throw error;
  }
};

  const handleAddParticipant = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('You are not logged in. Please log in to join the event.');
      }

      const decodedToken = decodeToken(token);
      if (!decodedToken) {
        throw new Error('Invalid token. Please log in again.');
      }

      const userId = decodedToken.id || decodedToken.user_id || decodedToken.userId;

      // Add participant to event
      const response = await axios.post(
        `${BASE_URL}/events/addParticipant`,
        { eventId, userId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.qrCode) {
        setQrCode(response.data.qrCode);
        setModalVisible(true);
      }

      // Update event data and user joined status
      const updatedEvent = await axios.get(`${BASE_URL}/events/getById/${eventId}`);
      setEvent(updatedEvent.data);
      setUserJoined(true);

      // Show success message with points
      Alert.alert(
        "Success",
        "You have joined the event and earned 100 points!",
        [{ text: "OK" }]
      );

      return true;
    } catch (error) {
      console.error('Add participant error:', error);
      throw error;
    }
  };

  const handleRemoveParticipant = async () => {
    Alert.alert(
      "Leave Event",
      "Are you sure you want to leave this event? You will lose 100 points.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await axios.delete(
                `${BASE_URL}/events/removeParticipant/${eventId}/${userId}`
              );

              if (response.status === 200) {
                setEvent(prevEvent => ({
                  ...prevEvent,
                  event_participants: prevEvent.event_participants.filter(
                    participant => participant.user_id !== userId
                  )
                }));
                setUserJoined(false);
                Alert.alert(
                  "Success",
                  "You have left the event and lost 100 points",
                  [{ text: "OK" }]
                );
              }
            } catch (error) {
              console.error("Error removing participant:", error);
              Alert.alert(
                "Error",
                "Failed to remove you from the event. Please try again.",
                [{ text: "OK" }]
              );
            }
          }
        }
      ]
    );
  };

  const handleJoinEvent = async () => {
    try {
      setIsProcessingPayment(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'Please login to join events');
        return;
      }

      const decodedToken = decodeToken(token);
      const userId = decodedToken.id || decodedToken.user_id || decodedToken.userId;

      if (event.price && event.price > 0) {
        try {
          const paymentSuccess = await initializePayment(event.price, userId);
          if (!paymentSuccess) {
            Alert.alert('Notice', 'Payment was cancelled');
            return;
          }
          
          await handleAddParticipant();
          Alert.alert('Success', 'Payment successful and you have joined the event!');
        } catch (error) {
          Alert.alert('Error', error.message || 'Payment failed. Please try again.');
          return;
        }
      } else {
        await handleAddParticipant();
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to join event. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleBarCodeScanned = ({ type, data }) => {
    console.log('QR code scanned:', data);
    setScanned(true);
    const participantData = JSON.parse(data);
    setScannedData(participantData);
    setModalVisible(false);
  };

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    console.log('Camera permission status:', status);
    setHasPermission(status === 'granted');
  };

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const handleGoBack = () => {
    navigation.navigate("Home");
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
    <StripeProvider publishableKey={stripeKey}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          {isCreator ? (
            <TouchableOpacity onPress={() => {
              console.log('QR code scan icon clicked');
              if (hasPermission) {
                setModalVisible(true);
              } else {
                Alert.alert('Error', 'Camera permission is not granted.');
              }
            }}>
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
          <View style={styles.eventNameContainer}>
            <Text style={styles.eventName}>{event.event_name}</Text>
          </View>

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
              <Text style={styles.boldLabel}>Date & Time:</Text>
              <Text style={styles.boldContent}>
                {`${formatDate(event.date)} at ${formatTime(event.start_time)} - ${formatTime(event.end_time)}`}
              </Text>
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
                   <TouchableOpacity onPress={() => navigation.navigate('UserProfilePage', { userId: participant.user_id, reportedBy: userId })}>
                  <Ionicons name="person-circle" size={40} color="black" />
                  </TouchableOpacity>
                  <Text style={styles.participantName}>{participant.user.username}</Text>
                </View>
              ))}

              {event.event_participants?.length < event.participants && (
                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: userJoined ? 'red' : '#0095FF' }]}
                  onPress={() => {
                    if (userJoined) {
                      handleRemoveParticipant();
                    } else {
                      handleJoinEvent();
                    }
                  }}
                >
                  <MaterialCommunityIcons 
                  name={userJoined ? 'account-remove' : 'account-plus'} 
                  size={27} 
                  color="white" 
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <EventReviews eventId={eventId} navigation={navigation} userJoined={userJoined} userId={userId} />
      </ScrollView>

      {/* Payment Processing Modal */}
      <Modal
        visible={isProcessingPayment}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.paymentModalContent}>
            <Text style={styles.paymentModalTitle}>Processing Payment</Text>
            <View style={styles.paymentProcessing}>
              <Text style={styles.processingText}>Please wait...</Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* QR Code Scanner Modal for Creator */}
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

      {/* Scanned Data Modal */}
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

      {/* QR Code Display Modal for Participants */}
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
  </StripeProvider>
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
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
paymentModalContent: {
  backgroundColor: 'white',
  padding: 20,
  borderRadius: 10,
  width: '80%',
  alignItems: 'center',
},
paymentModalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 20,
},
paymentProcessing: {
  marginVertical: 20,
},
processingText: {
  fontSize: 16,
  color: '#666',
},
closeButton: {
  marginTop: 20,
  padding: 10,
  backgroundColor: '#ddd',
  borderRadius: 5,
},
closeButtonText: {
  color: '#333',
  fontSize: 16,
},
joinButton: {
  position: 'absolute',
  bottom: 20,
  right: 20,
  padding: 15,
  borderRadius: 10,
  elevation: 3,
},
joinButtonText: {
  color: 'white',
  fontSize: 16,
  fontWeight: 'bold',
},
deleteButton: {
  alignSelf: 'flex-end',
  marginTop: 8,
  padding: 4,
  borderRadius: 4,
  backgroundColor: '#ff6b6b',
},
deleteButtonText: {
  color: '#fff',
  fontSize: 14,
  fontWeight: 'bold',
},
cancelButton: {
  marginRight: 12,
  padding: 8,
  borderRadius: 4,
},
cancelButtonText: {
  fontSize: 16,
  color: '#666',
},
submitButton: {
  backgroundColor: '#0095FF',
  padding: 8,
  borderRadius: 4,
},
submitButtonText: {
  fontSize: 16,
  color: '#fff',
  fontWeight: 'bold',
},
starRatingContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 16,
},
starRating: {
  flexDirection: 'row',
  marginLeft: 8,
},
star: {
  fontSize: 24,
  color: '#ccc',
},
selectedStar: {
  fontSize: 24,
  color: '#FFD700',
},
});

export default EventDetails;