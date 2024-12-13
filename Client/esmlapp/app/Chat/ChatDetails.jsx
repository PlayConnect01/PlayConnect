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

const API_URL = 'http://192.168.1.191:3000';

// Créer une instance axios configurée
const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Intercepteur pour gérer les erreurs
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
    console.log('Chat ID:', chatId);

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const scrollViewRef = useRef();

    // Charger l'historique des messages
    const loadMessages = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get(`http://192.168.1.191:3000/chats/${chatId}/messages`);
            console.log(response.data)
            if (response.data) {
                setMessages(response.data);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
            Alert.alert('Error', 'Failed to load messages. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    // Envoyer un message
    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            const messageData = {
                senderId: currentUserId,
                content: newMessage.trim()
            };

            const response = await axiosInstance.post(`/chats/${chatId}/messages`, messageData);
            
            if (response.data) {
                // Émettre le message via socket
                socket.emit('send_message', {
                    chatId,
                    message: response.data
                });
                
                setNewMessage('');
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }
        } catch (error) {
            // L'intercepteur gèrera l'erreur
        }
    };

    useEffect(() => {
        const setupSocketConnection = () => {
            socket.on('connect', () => {
                console.log('Connected to socket server');
                socket.emit('join_chat', { chatId, userId: currentUserId });
            });

            socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                Alert.alert('Connection Error', 'Unable to connect to chat server');
            });

            socket.on('receive_message', (message) => {
                setMessages(prev => [...prev, message]);
                scrollViewRef.current?.scrollToEnd({ animated: true });
            });
        };

        setupSocketConnection();
        loadMessages();

        return () => {
            socket.off('connect');
            socket.off('connect_error');
            socket.off('receive_message');
            socket.emit('leave_chat', chatId);
        };
    }, [chatId, currentUserId]);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };
    const fetchMessages = async (chatId) => {
        try {
            const response = await axios.get(`http://192.168.1.191:3000/chats/${chatId}/messages`);
            // Process the response
            console.log('Messagessssssssss:', response.data);
        } catch (error) {
            console.error('Error loading messages:', error);
            Alert.alert('Error', 'Failed to load messages. ' + error.message);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <View style={styles.userInfo}>
                    <Image source={{ uri: user.image }} style={styles.userImage} />
                    <View>
                        <Text style={styles.userName}>{user.name}</Text>
                        <Text style={styles.userStatus}>{user.status}</Text>
                    </View>
                </View>
                <View style={styles.headerIcons}>
                    <TouchableOpacity>
                        <Ionicons name="call" size={24} color="#6200ee" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Ionicons name="videocam" size={24} color="#6200ee" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Messages */}
            <ScrollView 
                ref={scrollViewRef}
                style={styles.messagesContainer}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <Text>Loading messages...</Text>
                    </View>
                ) : messages.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text>No messages yet. Start the conversation!</Text>
                    </View>
                ) : (
                    messages.map((message, index) => {
                        const isCurrentUser = message.sender_id === currentUserId;
                        const showDate = index === 0 || 
                            formatDate(message.sent_at) !== formatDate(messages[index - 1].sent_at);

                        return (
                            <React.Fragment key={message.message_id}>
                                {showDate && (
                                    <Text style={styles.dateText}>
                                        {formatDate(message.sent_at)}
                                    </Text>
                                )}
                                <View style={[
                                    styles.messageContainer,
                                    isCurrentUser ? styles.messageSent : styles.messageReceived
                                ]}>
                                    <Text style={[
                                        styles.messageText,
                                        isCurrentUser && { color: '#fff' }
                                    ]}>
                                        {message.content}
                                    </Text>
                                </View>
                            </React.Fragment>
                        );
                    })
                )}
            </ScrollView>

            {/* Input Area */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Send Message"
                    placeholderTextColor="#666"
                    value={newMessage}
                    onChangeText={setNewMessage}
                    onSubmitEditing={sendMessage}
                />
                <TouchableOpacity 
                    style={styles.sendButton}
                    onPress={sendMessage}
                >
                    <Ionicons 
                        name={newMessage.trim() ? "send" : "mic"} 
                        size={24} 
                        color="#fff" 
                    />
                </TouchableOpacity>
            </View>
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