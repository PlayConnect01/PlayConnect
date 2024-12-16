import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    Image, 
    TextInput,
    ScrollView,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import io from 'socket.io-client';
import axios from 'axios';

const API_URL = 'http://192.168.103.3:3000';

// Axios instance
const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

axiosInstance.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
        Alert.alert('Error', errorMessage);
        return Promise.reject(error);
    }
);

const socket = io(API_URL, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 10
});

const ChatDetails = ({ route, navigation }) => {
    const { user, chatId, currentUserId } = route.params;

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const scrollViewRef = useRef();

    const loadMessages = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get(`/chats/${chatId}/messages`);
            setMessages(response.data || []);
        } catch (error) {
            console.error('Error loading messages:', error);
            Alert.alert('Error', 'Failed to load messages. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            const messageData = {
                senderId: currentUserId,
                content: newMessage.trim()
            };

            const response = await axiosInstance.post(`/chats/${chatId}/messages`, messageData);
            
            if (response.data) {
                // Emit the message to other users
                socket.emit('send_message', {
                    chatId,
                    message: response.data
                });

                // Optimistically add message to UI
                setMessages(prev => [...prev, response.data]);
                setNewMessage('');
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }
        } catch (error) {
            // Error interceptor handles error
        }
    };

    useEffect(() => {
        const setupSocketConnection = () => {
            socket.on('connect', () => {
                socket.emit('join_chat', { chatId, userId: currentUserId });
            });

            socket.on('receive_message', (message) => {
                // Avoid duplicates
                setMessages(prev => {
                    const isDuplicate = prev.some(m => m.message_id === message.message_id);
                    return isDuplicate ? prev : [...prev, message];
                });
                scrollViewRef.current?.scrollToEnd({ animated: true });
            });

            socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                Alert.alert('Connection Error', 'Unable to connect to chat server');
            });
        };

        setupSocketConnection();
        loadMessages();

        return () => {
            // Cleanup socket listeners
            socket.off('connect');
            socket.off('receive_message');
            socket.off('connect_error');
            socket.emit('leave_chat', chatId);
        };
    }, [chatId, currentUserId]);

    const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return (
        <View style={styles.container}>
            {/* Other UI Elements */}
            <ScrollView ref={scrollViewRef}>
                {messages.map((message, index) => {
                    const isCurrentUser = message.sender_id === currentUserId;
                    const showDate = index === 0 || 
                        formatDate(message.sent_at) !== formatDate(messages[index - 1].sent_at);

                    return (
                        <React.Fragment key={message.message_id}>
                            {showDate && <Text>{formatDate(message.sent_at)}</Text>}
                            <View style={isCurrentUser ? styles.messageSent : styles.messageReceived}>
                                <Text>{message.content}</Text>
                            </View>
                        </React.Fragment>
                    );
                })}
            </ScrollView>
            {/* Input and Send Button */}
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
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingTop: 44,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginLeft: 15,
    },
    userImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
    },
    userStatus: {
        fontSize: 12,
        color: '#666',
    },
    headerIcons: {
        flexDirection: 'row',
        gap: 15,
    },
    messagesContainer: {
        flex: 1,
        padding: 16,
    },
    messageContainer: {
        padding: 12,
        borderRadius: 20,
        maxWidth: '80%',
        marginBottom: 12,
    },
    messageReceived: {
        backgroundColor: '#f0f0f0',
        borderTopLeftRadius: 5,
        alignSelf: 'flex-start',
    },
    messageSent: {
        backgroundColor: '#6200ee',
        borderTopRightRadius: 5,
        alignSelf: 'flex-end',
    },
    messageText: {
        fontSize: 16,
        color: '#000',
    },
    dateText: {
        textAlign: 'center',
        color: '#666',
        marginVertical: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginRight: 10,
        fontSize: 16,
    },
    sendButton: {
        backgroundColor: '#6200ee',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    }
});

export default ChatDetails;