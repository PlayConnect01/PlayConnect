import React, { useState, useEffect, useRef, useCallback } from 'react';
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

const ChatDetails = ({ route, navigation }) => {
    const { user, chatId, currentUserId } = route.params;
    
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const scrollViewRef = useRef(null);
    const socketRef = useRef(null);
    const sentMessagesRef = useRef(new Set());

    const initializeSocket = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.disconnect();
        }

        socketRef.current = io(API_URL, {
            transports: ['websocket'],
            reconnection: true,
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('Connected to socket server');
            socket.emit('join_chat', { chatId, userId: currentUserId });
        });

        socket.on('receive_message', (message) => {
            setMessages((prevMessages) => {
                if (message.sender_id === currentUserId && 
                    sentMessagesRef.current.has(message.message_id)) {
                    return prevMessages;
                }
                const isDuplicate = prevMessages.some((msg) => 
                    msg.message_id === message.message_id
                );

                if (isDuplicate) return prevMessages;
                const filteredMessages = prevMessages.filter(
                    msg => msg.message_id !== `temp_${message.content}`
                );

                return [...filteredMessages, message];
            });
            sentMessagesRef.current.delete(message.message_id);
        });

        return () => {
            socket.emit('leave_chat', chatId);
            socket.disconnect();
        };
    }, [chatId, currentUserId]);
    const loadMessages = useCallback(async () => {
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
    }, [chatId]);
    const sendMessage = useCallback(async () => {
        if (!newMessage.trim()) return;

        const tempMessageId = `temp_${newMessage.trim()}`;
        const tempMessage = {
            message_id: tempMessageId,
            sender_id: currentUserId,
            content: newMessage.trim(),
            sent_at: new Date().toISOString(),
            status: 'sending',
        };

        setMessages((prev) => [...prev, tempMessage]);
        setNewMessage('');
        scrollViewRef.current?.scrollToEnd({ animated: true });

        try {
            const response = await axiosInstance.post(`/chats/${chatId}/messages`, {
                senderId: currentUserId,
                content: tempMessage.content,
            });
            sentMessagesRef.current.add(response.data.message_id);
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.message_id === tempMessageId ? { ...response.data, status: 'sent' } : msg
                )
            );
            socketRef.current?.emit('send_message', {
                chatId,
                senderId: currentUserId,
                message: response.data,
            });
        } catch (error) {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.message_id === tempMessageId ? { ...msg, status: 'failed' } : msg
                )
            );
            Alert.alert('Error', 'Failed to send message. Please try again.');
        }
    }, [chatId, currentUserId, newMessage]);
    useEffect(() => {
        loadMessages();
        const cleanup = initializeSocket();

        return cleanup;
    }, [initializeSocket, loadMessages]);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <View style={styles.container}>
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
                        const uniqueKey = `${message.message_id || 'temp'}-${index}`;

                        return (
                            <React.Fragment key={uniqueKey}>
                                {showDate && (
                                    <Text style={styles.dateText}>
                                        {formatDate(message.sent_at)}
                                    </Text>
                                )}
                                <View style={[
                                    styles.messageContainer,
                                    isCurrentUser ? styles.messageSent : styles.messageReceived,
                                    message.status === 'failed' && styles.messageFailedStatus
                                ]}>
                                    <Text style={[
                                        styles.messageText,
                                        isCurrentUser && { color: '#fff' }
                                    ]}>
                                        {message.content}
                                    </Text>
                                    {message.status === 'sending' && (
                                        <Text style={styles.messageSendingStatus}>Sending...</Text>
                                    )}
                                    {message.status === 'failed' && (
                                        <Text style={styles.messageFailedText}>Failed to send</Text>
                                    )}
                                </View>
                            </React.Fragment>
                        );
                    })
                )}
            </ScrollView>
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
    },
    messageSendingStatus: {
        fontSize: 10,
        color: '#888',
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    messageFailedStatus: {
        backgroundColor: '#ff4444',
    },
    messageFailedText: {
        fontSize: 10,
        color: '#fff',
        marginTop: 4,
        alignSelf: 'flex-end',
    }
});

export default ChatDetails;