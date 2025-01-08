import React, { useEffect, useState } from 'react';
import { View,Text, StyleSheet, TouchableOpacity,Image, ScrollView,Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import Navbar from '../navbar/Navbar';
import { BASE_URL } from "../../Api";

const MessagePage = (props) => {
  const [matches, setMatches] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigation = useNavigation();

  // Function to decode JWT token
  const decodeJWT = (token) => {
    const base64Payload = token.split('.')[1];
    const payload = Buffer.from(base64Payload, 'base64').toString('utf-8');
    return JSON.parse(payload);
  };

  useEffect(() => {
    
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          throw new Error('Token not found');
        }

        const decodedToken = decodeJWT(token); // Use the decode function directly
        if (decodedToken?.userId) {
          setCurrentUserId(decodedToken.userId);
          fetchAcceptedMatches(decodedToken.userId); // Fetch accepted matches
        } else {
          throw new Error('User ID not found in token');
        }
      } catch (error) {
        console.error('Error loading token:', error);
        Alert.alert('Error', 'Failed to load user data. Please log in again.');
      }
    };

    loadToken();
  }, []);

  const fetchLastMessage = async (chatId) => {
    try {
      const response = await axios.get(`${BASE_URL}/chats/${chatId}/lastMessage`);
      return response.data;
    } catch (error) {
      console.error('Error fetching last message:', error);
      return null;
    }
  };

  const fetchAcceptedMatches = async (userId) => {
    try {
      const response = await axios.get(`${BASE_URL}/matches/accepted/${userId}`);
      const matchesWithLastMessage = await Promise.all(
        response.data.map(async (match) => {
          const lastMessage = await fetchLastMessage(match.chat_id);
          return { ...match, lastMessage };
        })
      );
      setMatches(matchesWithLastMessage);
    } catch (error) {
      console.error('Error fetching accepted matches:', error);
      Alert.alert('Error', 'Failed to load accepted matches.');
    }
  };

  const renderLastMessage = (lastMessage) => {
    if (!lastMessage) return 'Start a new conversation!';
    switch (lastMessage.message_type) {
      case 'TEXT':
        return lastMessage.content;
      case 'IMAGE':
        return 'You received an image';
      case 'AUDIO':
        return 'New voice message';
      default:
        return 'Start a new conversation!';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Messages List */}
      <ScrollView style={styles.messagesList}>
        {matches.map((match, index) => (  
          <TouchableOpacity
            key={index}
            style={styles.messageItem}
            onPress={() => {
              navigation.navigate('ChatDetails', {
                user: match.user_1.user_id === currentUserId ? match.user_2 : match.user_1,
                chatId: match.chat_id,
                currentUserId: currentUserId
              });
            }}
          >
            <Image source={{ uri: match.user_1.profile_picture || match.user_2.profile_picture }} style={styles.userImage} />
            <View style={styles.messageContent}>
              <View style={styles.messageHeader}>
                <Text style={styles.userName}>{match.user_1.user_id === currentUserId ? match.user_2.username : match.user_1.username}</Text>
                <Text style={styles.messageTime}>{new Date(match.matched_at).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.messageText} numberOfLines={1}>
                {renderLastMessage(match.lastMessage)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Navbar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  messagesList: {
    flex: 1,
  },
  messageItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
  },
  messageText: {
    fontSize: 14,
    color: '#666',
  },
});

export default MessagePage;