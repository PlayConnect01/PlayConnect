import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    Image, 
    TextInput,
    ScrollView,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import io from 'socket.io-client';
import axios from 'axios';
import VoiceMessageHandler from './components/VoiceMessageHandler';
import AudioMessage from './components/AudioMessage';
import VideoCall from './components/VideoCall';

const API_URL = 'http://192.168.103.14:3000';

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
    const [isInVideoCall, setIsInVideoCall] = useState(false);
    const scrollViewRef = useRef(null);
    const socketRef = useRef(null);
    const sentMessagesRef = useRef(new Set());

  const initializeSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socket = io(BASE_URL, {
      transports: ["websocket"],
      reconnection: true,
    });

        socketRef.current = socket;
        window.socket = socket;

        socket.on('connect', () => {
            console.log('Connected to socket server');
            socket.emit('join_chat', { chatId, userId: currentUserId });
        });

        socket.on('receive_message', (message) => {
            console.log('Received message:', message);
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

                if (message.message_type === 'AUDIO') {
                    message.voice_file_url = message.content;
                }

                return [...filteredMessages, message];
            });
            sentMessagesRef.current.delete(message.message_id);
            
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        return socket;
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

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim()) return;

        const tempMessageId = `temp_${newMessage.trim()}`;
        const tempMessage = {
            message_id: tempMessageId,
            sender_id: currentUserId,
            content: newMessage.trim(),
            sent_at: new Date().toISOString(),
            sender: {
                username: user.name,
                profile_picture: user.image
            },
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
    }, [chatId, currentUserId, newMessage, user]);

    const handleAudioMessage = useCallback((audioMessage) => {
        console.log('Handling audio message:', audioMessage);
        setMessages(prevMessages => [...prevMessages, {
            ...audioMessage,
            sender_id: currentUserId,
            sent_at: new Date().toISOString(),
            message_type: 'AUDIO',
            status: 'sending'
        }]);
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [currentUserId]);

    useEffect(() => {
        loadMessages();
        const socket = initializeSocket();
        
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            if (window.socket) {
                window.socket = null;
            }
        };
    }, [initializeSocket, loadMessages]);

  const renderMessage = (message, index) => {
    const isCurrentUser = message.sender_id === currentUserId;
    const showDate =
      index === 0 ||
      new Date(message.sent_at).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }) !==
        new Date(messages[index - 1].sent_at).toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        return (
            <React.Fragment key={message.message_id || `temp-${index}`}>
                {showDate && (
                    <Text style={styles.dateText}>
                        {new Date(message.sent_at).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        })}
                    </Text>
                )}
                <View style={[
                    styles.messageContainer,
                    isCurrentUser ? styles.messageSent : styles.messageReceived
                ]}>
                    <View style={styles.messageContent}>
                        {!isCurrentUser && (
                            <Image 
                                source={{ uri: message.sender?.profile_picture }} 
                                style={styles.messageUserImage} 
                            />
                        )}
                        <View style={[
                            styles.messageTextContainer,
                            isCurrentUser ? styles.messageTextContainerSent : styles.messageTextContainerReceived
                        ]}>
                            {message.message_type === 'AUDIO' ? (
                                <AudioMessage 
                                    audioUrl={message.voice_file_url || message.content} 
                                    isCurrentUser={isCurrentUser}
                                    sender={message.sender}
                                    timestamp={message.sent_at}
                                />
                            ) : (
                                <Text style={[
                                    styles.messageText,
                                    isCurrentUser ? styles.messageTextSent : styles.messageTextReceived
                                ]}>
                                    {message.content}
                                </Text>
                            )}
                        </View>
                    </View>
                </View>
            </React.Fragment>
        );
    };

    return (
        <View style={styles.container}>
            {isInVideoCall ? (
                <VideoCall
                    chatId={chatId}
                    currentUserId={currentUserId}
                    recipientId={user.id}
                    onEndCall={() => setIsInVideoCall(false)}
                />
            ) : (
                <>
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Ionicons name="arrow-back" size={24} color="#000" />
                            </TouchableOpacity>
                            <Image 
                                source={{ uri: user.profile_picture }} 
                                style={styles.profileImage} 
                            />
                            <Text style={styles.username}>{user.username}</Text>
                        </View>
                        <TouchableOpacity onPress={() => setIsInVideoCall(true)}>
                            <Ionicons name="videocam" size={24} color="#4F3DDC" />
                        </TouchableOpacity>
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
                            messages.map((message, index) => renderMessage(message, index))
                        )}
                        <View style={styles.bottomSpacing} />
                    </ScrollView>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={newMessage}
                            onChangeText={setNewMessage}
                            placeholder="Type a message..."
                            multiline
                        />
                        <VoiceMessageHandler 
                            onAudioUploaded={handleAudioMessage}
                            chatId={chatId}
                            currentUserId={currentUserId}
                        />
                        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                            <Ionicons name="send" size={24} color="#007AFF" />
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingTop: 44,
        paddingBottom: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginHorizontal: 10,
    },
    username: {
        fontSize: 18,
        fontWeight: '600',
    },
    backButton: {
        padding: 8,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(98, 0, 238, 0.05)',
    },
    userInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 4,
    },
    userNameContainer: {
        flex: 1,
    },
    userStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userName: {
        fontSize: 17,
        fontWeight: '600',
        color: '#000000',
        letterSpacing: 0.3,
        marginRight: 8,
    },
    dotSeparator: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: '#666',
        marginRight: 8,
    },
    userUsername: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    headerIcons: {
        flexDirection: 'row',
        gap: 12,
    },
    iconButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(98, 0, 238, 0.05)',
    },
    messagesContainer: {
        flex: 1,
        padding: 16,
        backgroundColor: '#FAFAFA',
    },
    messageContainer: {
        marginBottom: 4,
        maxWidth: '70%',
    },
    messageContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    messageReceived: {
        alignSelf: 'flex-start',
        marginRight: 40,
    },
    messageSent: {
        alignSelf: 'flex-end',
        marginLeft: 40,
    },
    messageUserImage: {
        width: 28,
        height: 28,
        borderRadius: 14,
        marginRight: 8,
        backgroundColor: '#f0f2f5',
        borderWidth: 1,
        borderColor: '#fff',
    },
    messageTextContainer: {
        padding: 8,
        paddingHorizontal: 12,
        borderRadius: 16,
        maxWidth: '100%',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
    },
    messageTextContainerReceived: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    messageTextContainerSent: {
        backgroundColor: '#6200ee',
        borderTopRightRadius: 4,
        elevation: 2,
        shadowColor: '#6200ee',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    messageText: {
        fontSize: 14,
        lineHeight: 18,
        color: '#1a1a1a',
    },
    messageTextSent: {
        color: '#fff',
    },
    messageTextReceived: {
        color: '#1a1a1a',
    },
    messageTime: {
        fontSize: 9,
        marginTop: 2,
        alignSelf: 'flex-end',
        fontWeight: '400',
    },
    messageTimeSent: {
        color: 'rgba(255,255,255,0.8)',
    },
    messageTimeReceived: {
        color: '#8e8e8e',
    },
    dateText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 12,
        fontWeight: '600',
        marginVertical: 20,
        backgroundColor: '#fff',
        alignSelf: 'center',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        letterSpacing: 0.3,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    input: {
        flex: 1,
        height: 40,
        borderRadius: 20,
        paddingHorizontal: 12,
        backgroundColor: '#F0F0F0',
        marginRight: 8,
    },
    sendButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#6200ee',
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
        color: '#8e8e8e',
        marginTop: 4,
        alignSelf: 'flex-end',
        fontStyle: 'italic',
    },
    messageFailedStatus: {
        backgroundColor: '#fff3f3',
    },
    messageFailedText: {
        fontSize: 10,
        color: '#d32f2f',
        marginTop: 4,
        alignSelf: 'flex-end',
        fontWeight: '600',
    },
    bottomSpacing: {
        height: 20,
    },
});

export default ChatDetails;
