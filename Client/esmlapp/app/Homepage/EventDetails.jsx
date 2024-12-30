import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Modal } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import { BASE_URL } from '../../Api.js';
import MapView, { Marker } from 'react-native-maps';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';

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
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [stripeKey, setStripeKey] = useState(null);

  // Fetch Stripe key from backend
  useEffect(() => {
    const fetchStripeKey = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/payment/config`);
        setStripeKey(response.data.publishableKey);
      } catch (err) {
        console.error('Error fetching Stripe key:', err);
        Alert.alert('Error', 'Failed to initialize payment system');
      }
    };
    fetchStripeKey();
  }, []);

  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/events/getById/${eventId}`);
        setEvent(response.data);
        
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          const decodedToken = decodeToken(token);
          const userId = decodedToken.id || decodedToken.user_id || decodedToken.userId;

          setUserJoined(response.data.event_participants.some(participant => 
            participant.user_id === userId));
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
      // Create payment intent on the server
      const response = await axios.post(`${BASE_URL}/payment/process`, {
        userId,
        amount: amount,
        items: [{
          eventId: event.event_id,
          eventName: event.event_name,
          price: amount
        }]
      });

      const { clientSecret } = response.data;

      // Initialize the payment sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'PlayConnect',
        style: 'automatic',
        appearance: {
          colors: {
            primary: '#0095FF',
            background: '#ffffff',
            componentBackground: '#f3f8fa',
          },
        },
      });

      if (initError) {
        throw new Error(initError.message);
      }

      // Present the payment sheet
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

      await axios.post(
        `${BASE_URL}/events/addParticipant`,
        { eventId, userId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const updatedEvent = await axios.get(`${BASE_URL}/events/getById/${eventId}`);
      setEvent(updatedEvent.data);
      setUserJoined(true);
      return true;
    } catch (error) {
      console.error('Add participant error:', error);
      throw error;
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

      // Show warning before leaving the event
      Alert.alert(
        '⚠️ Warning!', // Added warning icon before the title
        'Are you sure you want to leave this event?  If you leave, you will not be able to get your money back.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Leave',
            style: 'destructive', // This makes the button red on iOS
            onPress: async () => {
              try {
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
            },
          },
        ],
        { 
          cancelable: false,
          titleStyle: { color: 'red' } // Note: This may not work on all devices as Alert styling is limited
        }
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to leave the event. Please try again.');
    }
  }

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
          // Handle paid event
          const paymentSuccess = await initializePayment(event.price, userId);
          if (!paymentSuccess) {
            Alert.alert('Notice', 'Payment was cancelled');
            return;
          }
          
          // Add participant after successful payment
          await handleAddParticipant();
          Alert.alert('Success', `Payment successful and you have joined the event!`);
        } catch (error) {
          Alert.alert('Error', error.message || 'Payment failed. Please try again.');
          return;
        }
      } else {
        // Handle free event
        await handleAddParticipant();
        Alert.alert('Success', 'You have joined the event!');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to join event. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleGoBack = () => {
    navigation.navigate("Homepage/Homep");
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
        </ScrollView>

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
});


export default EventDetails;