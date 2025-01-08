import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import io from "socket.io-client";
import axios from "axios";
import VoiceMessageHandler from "./components/VoiceMessageHandler";
import AudioMessage from "./components/AudioMessage";
import ImageMessageHandler from "./components/ImageMessageHandler";
import { BASE_URL } from "../../Api";
import { useRoute, useNavigation } from '@react-navigation/native';
import WebView from 'react-native-webview';
const ChatDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user ,  chatId , currentUserId } = route.params
  
 



  // const { user, chatId, currentUserId } = route.params;
  // console.log(route.params, "salem");

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const scrollViewRef = useRef(null);
  const socketRef = useRef(null);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const roomName = "Test123";
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [isOutgoingCall, setIsOutgoingCall] = useState(false);
  const [currentCallData, setCurrentCallData] = useState(null);

  const initializeSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socket = io(BASE_URL, {
      transports: ["websocket"],
      reconnection: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to socket server");
      if (chatId) {
        socket.emit("joinChat", chatId);
      }
    });

    // Recevoir les messages des autres utilisateurs uniquement
    socket.on("receiveMessage", (data) => {
      if (data.senderId !== currentUserId) {
        setMessages((prevMessages) => [...prevMessages, data]);
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    });

    socket.on("receiveVideoCall", (data) => {
      if (data.receiverId === currentUserId) {
        setIsIncomingCall(true);
        setCurrentCallData(data);
      }
    });

    socket.on("receiveVideoCallAccepted", (data) => {
      setIsOutgoingCall(false);
      setIsVideoCallActive(true);
    });

    socket.on("receiveVideoCallRejected", (data) => {
      setIsOutgoingCall(false);
      Alert.alert("Call Rejected", "The user rejected your call");
    });

    socket.on("receiveVideoCallEnded", (data) => {
      setIsVideoCallActive(false);
      setIsIncomingCall(false);
      setIsOutgoingCall(false);
      setCurrentCallData(null);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    return socket;
  }, [chatId, currentUserId]);

  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await axios.get(`${BASE_URL}/chats/${chatId}/messages`);
      setMessages(response.data || []);
    } catch (error) {
      console.error("Error loading messages:", error.response || error);
      Alert.alert("Error", "Failed to load messages. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [chatId]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await axios.post(
        `${BASE_URL}/chats/${chatId}/messages`,
        {
          content: newMessage,
          senderId: currentUserId,
          messageType: "TEXT",
        }
      );

      const messageData = response.data;
      
      // Ajouter le message à la liste locale
      setMessages((prev) => [...prev, messageData]);
      
      // Émettre le message aux autres utilisateurs
      socketRef.current.emit("newMessage", {
        ...messageData,
        chatId: chatId
      });

      setNewMessage("");
      scrollViewRef.current?.scrollToEnd({ animated: true });
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message");
    }
  }, [chatId, currentUserId, newMessage]);

  const handleAudioMessage = useCallback(
    (audioMessage) => {
      // Update local state for sender
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          ...audioMessage,
          sender_id: currentUserId,
          sent_at: new Date().toISOString(),
          message_type: "AUDIO",
          status: "sending",
        },
      ]);

      // Emit socket event for receivers
      socketRef.current.emit("newMessage", {
        ...audioMessage,
        sender_id: currentUserId,
        chatId: chatId,
        message_type: "AUDIO",
      });

      scrollViewRef.current?.scrollToEnd({ animated: true });
    },
    [currentUserId, chatId]
  );

  const handleVideoCall = () => {
    setIsOutgoingCall(true);
    const callData = {
      chatId,
      callerId: currentUserId,
      callerName: currentUserId.toString(),
      receiverId: user.user_id,
      channelName: `call_${chatId}_${Date.now()}`
    };
    setCurrentCallData(callData);
    socketRef.current?.emit("videoCallRequest", callData);
  
    // Auto-cancel call after 30 seconds
    setTimeout(() => {
      if (isOutgoingCall) {
        setIsOutgoingCall(false);
        socketRef.current?.emit("videoCallEnd", callData);
      }
    }, 30000);
  };

  const acceptCall = () => {
    if (!currentCallData) return;
    
    setIsIncomingCall(false);
    setIsVideoCallActive(true);
    socketRef.current?.emit("videoCallAccepted", {
      ...currentCallData,
      receiverId: currentUserId
    });
  };

  const rejectCall = () => {
    if (!currentCallData) return;

    setIsIncomingCall(false);
    socketRef.current?.emit("videoCallRejected", {
      ...currentCallData,
      receiverId: currentUserId
    });
    setCurrentCallData(null);
  };

  const endCall = () => {
    if (!currentCallData) return;

    setIsVideoCallActive(false);
    socketRef.current?.emit("videoCallEnd", {
      ...currentCallData,
      callerId: currentUserId
    });
    setCurrentCallData(null);
  };

  useEffect(() => {
    const socket = initializeSocket();
    
    // Charger les messages au montage du composant
    loadMessages();

    return () => {
      if (socket) {
        socket.off("receiveMessage");
        socket.disconnect();
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
            {new Date(message.sent_at).toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Text>
        )}
        {message.message_type === "IMAGE" ? (
          <View style={[
            styles.messageContainer,
            isCurrentUser ? styles.messageSent : styles.messageReceived
          ]}>
            <TouchableOpacity onPress={() => setSelectedImage(message.content)}>
              <Image
                source={{ uri: message.content }}
                style={[
                  styles.messageImage,
                  isCurrentUser
                    ? styles.messageImageSent
                    : styles.messageImageReceived,
                ]}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={[
              styles.messageContainer,
              message.message_type === 'SYSTEM' ? styles.messageContainerSystem : 
              isCurrentUser ? styles.messageSent : styles.messageReceived,
            ]}
          >
            <View style={[
              styles.messageContent,
              message.message_type === 'SYSTEM' && styles.messageContentSystem
            ]}>
              {!isCurrentUser && message.message_type !== 'SYSTEM' && (
                <Image
                  source={{ uri: message.sender?.profile_picture }}
                  style={styles.messageUserImage}
                />
              )}
              <View
                style={[
                  styles.messageTextContainer,
                  isCurrentUser
                    ? styles.messageTextContainerSent
                    : message.message_type === 'SYSTEM'
                    ? styles.messageTextContainerSystem
                    : styles.messageTextContainerReceived,
                ]}
              >
                {message.message_type === "AUDIO" ? (
                  <AudioMessage
                    audioUrl={message.voice_file_url || message.content}
                    isCurrentUser={isCurrentUser}
                    sender={message.sender}
                    timestamp={message.sent_at}
                  />
                ) : (
                  <Text
                    style={[
                      styles.messageText,
                      isCurrentUser
                        ? styles.messageTextSent
                        : message.message_type === 'SYSTEM'
                        ? styles.messageTextSystem
                        : styles.messageTextReceived,
                    ]}
                  >
                    {message.content}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}
      </React.Fragment>
    );
  };

  const VideoCallScreen = ({ channelName, endCall }) => {
    const domain = 'meet.jit.si';
    const userInfo = {
      displayName: user.username,
      email: user.email,
      avatarURL: user.profile_picture
    };

    // Create the Jitsi Meet URL with configuration parameters
    const url = `https://${domain}/${channelName}`;

    return (
      <View style={styles.videoCallContainer}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={endCall}
        >
          <Ionicons name="close" size={24} color="#FFF" />
        </TouchableOpacity>
        <WebView
          source={{ uri: url }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback={true}
          userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36"
          onMessage={(event) => {
            console.log('Received message from Jitsi Meet:', event.nativeEvent.data);
          }}
          injectedJavaScript={`
            // Auto-join the meeting and configure the interface
            window.onload = () => {
              const domain = '${domain}';
              const options = {
                roomName: '${channelName}',
                width: '100%',
                height: '100%',
                parentNode: document.body,
                configOverwrite: {
                  prejoinPageEnabled: false,
                  startWithAudioMuted: false,
                  startWithVideoMuted: false,
                  disableDeepLinking: true,
                  hideConferenceSubject: true,
                  hideConferenceTimer: true,
                  hideParticipantsStats: true,
                  toolbarButtons: ['hangup', 'camera', 'microphone'],
                  disableInitialGUM: false,
                  enableClosePage: false,
                  readOnlyName: true,
                  remoteVideoMenu: {
                    disableKick: true,
                    disableGrantModerator: true,
                  },
                  notifications: [],
                  buttonsWithNotifyClick: [],
                },
                interfaceConfigOverwrite: {
                  TOOLBAR_BUTTONS: ['hangup', 'camera', 'microphone'],
                  SHOW_JITSI_WATERMARK: false,
                  SHOW_WATERMARK_FOR_GUESTS: false,
                  SHOW_BRAND_WATERMARK: false,
                  SHOW_POWERED_BY: false,
                  SHOW_PROMOTIONAL_CLOSE_PAGE: false,
                  DEFAULT_BACKGROUND: '#000000',
                  DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                  DISABLE_VIDEO_BACKGROUND: true,
                  MOBILE_APP_PROMO: false,
                  HIDE_INVITE_MORE_HEADER: true,
                  DISABLE_PRESENCE_STATUS: true,
                  DISABLE_TRANSCRIPTION_SUBTITLES: true,
                  DISABLE_RINGING: true,
                  SETTINGS_SECTIONS: ['devices'],
                  DEFAULT_LOCAL_DISPLAY_NAME: '${userInfo.displayName}',
                  DEFAULT_REMOTE_DISPLAY_NAME: '',
                },
                userInfo: ${JSON.stringify(userInfo)},
              };

              const api = new JitsiMeetExternalAPI(domain, options);
              
              // Auto-join the conference
              api.addEventListener('videoConferenceJoined', () => {
                // Additional configurations after joining
                api.executeCommand('displayName', '${userInfo.displayName}');
                api.executeCommand('avatarUrl', '${userInfo.avatarURL}');
                
                // Hide various UI elements
                api.executeCommand('setTileView', true);
                api.executeCommand('toggleChat', false);
                api.executeCommand('toggleShareScreen', false);
                api.executeCommand('toggleRaiseHand', false);
              });

              // Handle participant left
              api.addEventListener('participantLeft', () => {
                window.ReactNativeWebView.postMessage('participantLeft');
              });

              // Handle connection issues
              api.addEventListener('connectionEstablished', () => {
                console.log('Connection established');
              });

              api.addEventListener('connectionFailed', () => {
                window.ReactNativeWebView.postMessage('connectionFailed');
              });

              // Auto-join the room
              api.executeCommand('joinRoom');
            }
            true;
          `}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
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
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.callIcon} 
            onPress={() => {/* Handle audio call */}}
          >
            <Ionicons name="call" size={22} color="#4FA5F5" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.callIcon} 
            onPress={handleVideoCall}
          >
            <Ionicons name="videocam" size={24} color="#4FA5F5" />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading messages...</Text>
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText} numberOfLines={1} ellipsizeMode="tail">You can start conversation now</Text>
          </View>
        ) : (
          messages.map((message, index) => renderMessage(message, index))
        )}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <View style={styles.inputContainer}>
        <ImageMessageHandler
          chatId={chatId}
          currentUserId={currentUserId}
          onImageUpload={(imageMessage) => {
            // Ajouter l'image localement
            setMessages((prev) => [...prev, imageMessage]);
            
            // Émettre le message d'image aux autres utilisateurs
            socketRef.current?.emit("newMessage", {
              ...imageMessage,
              chatId: chatId,
              senderId: currentUserId,
              messageType: "IMAGE"
            });
            
            // Faire défiler jusqu'au nouveau message
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }}
        />
        <VoiceMessageHandler
          chatId={chatId}
          currentUserId={currentUserId}
          onAudioMessage={handleAudioMessage}
        />
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          <View style={styles.sendButtonContainer}>
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={!!selectedImage}
        onRequestClose={() => setSelectedImage(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedImage(null)}
        >
          <Image
            source={{ uri: selectedImage }}
            style={styles.modalImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isIncomingCall}
        onRequestClose={rejectCall}
      >
        <View style={styles.callModal}>
          <View style={styles.callModalContent}>
            <Image
              source={{ uri: user.profile_picture }}
              style={styles.callerImage}
            />
            <Text style={styles.callerName}>{user.username}</Text>
            <Text style={styles.callStatus}>Incoming video call...</Text>
            <View style={styles.callActions}>
              <TouchableOpacity 
                style={[styles.callButton, styles.rejectButton]}
                onPress={rejectCall}
              >
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.callButton, styles.acceptButton]}
                onPress={acceptCall}
              >
                <Ionicons name="videocam" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isOutgoingCall}
        onRequestClose={() => {
          setIsOutgoingCall(false);
          endCall();
        }}
      >
        <View style={styles.callModal}>
          <View style={styles.callModalContent}>
            <Image
              source={{ uri: user.profile_picture }}
              style={styles.callerImage}
            />
            <Text style={styles.callerName}>{user.username}</Text>
            <Text style={styles.callStatus}>Calling...</Text>
            <TouchableOpacity 
              style={[styles.callButton, styles.rejectButton]}
              onPress={() => {
                setIsOutgoingCall(false);
                endCall();
              }}
            >
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {isVideoCallActive && (
        <Modal
          animationType="slide"
          transparent={false}
          visible={isVideoCallActive}
          onRequestClose={endCall}
        >
          <VideoCallScreen 
            channelName={currentCallData?.channelName}
            endCall={endCall}
          />
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 44,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginLeft: 10,
  },
  callIcon: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(79, 165, 245, 0.1)",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  username: {
    fontSize: 18,
    fontWeight: "600",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "rgba(98, 0, 238, 0.05)",
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 4,
  },
  userNameContainer: {
    flex: 1,
  },
  userStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  userName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000000",
    letterSpacing: 0.3,
    marginRight: 8,
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#666",
    marginRight: 8,
  },
  userUsername: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  headerIcons: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(98, 0, 238, 0.05)",
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FAFAFA",
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  messageContainerSystem: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  messageSent: {
    justifyContent: "flex-end",
  },
  messageReceived: {
    justifyContent: "flex-start",
  },
  messageContent: {
    flexDirection: 'row',
    maxWidth: '80%',
    alignItems: 'flex-end',
  },
  messageContentSystem: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  messageUserImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    backgroundColor: "#f0f2f5",
    borderWidth: 1,
    borderColor: "#fff",
  },
  messageTextContainer: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    maxWidth: "100%",
    backgroundColor: "transparent",
  },
  messageTextContainerSent: {
    backgroundColor: "#4FA5F5",
  },
  messageTextContainerReceived: {
    backgroundColor: "#E8E8E8",
  },
  messageTextContainerSystem: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignSelf: 'center',
    marginVertical: 10,
    borderRadius: 15,
    maxWidth: '70%',
    padding: 8,
  },
  messageText: {
    fontSize: 16,
  },
  messageTextSent: {
    color: "#FFFFFF",
  },
  messageTextReceived: {
    color: "#000000",
  },
  messageTextSystem: {
    color: '#666',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  messageTime: {
    fontSize: 9,
    marginTop: 2,
    alignSelf: "flex-end",
    fontWeight: "400",
  },
  messageTimeSent: {
    color: "rgba(255,255,255,0.8)",
  },
  messageTimeReceived: {
    color: "#8e8e8e",
  },
  dateText: {
    textAlign: "center",
    color: "#666",
    fontSize: 12,
    fontWeight: "600",
    marginVertical: 20,
    backgroundColor: "#fff",
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    letterSpacing: 0.3,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    marginBottom:78
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 12,
    backgroundColor: "#F0F0F0",
    marginRight: 8,
  },
  sendButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4FA5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    transform: [{ translateY: -10 }],
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
    width: '100%',
  },
  messageSendingStatus: {
    fontSize: 10,
    color: "#8e8e8e",
    marginTop: 4,
    alignSelf: "flex-end",
    fontStyle: "italic",
  },
  messageFailedStatus: {
    backgroundColor: "#fff3f3",
  },
  messageFailedText: {
    fontSize: 10,
    color: "#d32f2f",
    marginTop: 4,
    alignSelf: "flex-end",
    fontWeight: "600",
  },
  bottomSpacing: {
    height: 20,
  },
  imageWrapper: {
    backgroundColor: "transparent",
    padding: 0,
    margin: 0,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginVertical: 5,
  },
  messageImageSent: {
    alignSelf: 'flex-end',
    marginLeft: 60,
    marginRight: 10,
  },
  messageImageReceived: {
    alignSelf: 'flex-start',
    marginRight: 60,
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: "100%",
    height: "90%",
  },
  videoCallContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  webview: {
    flex: 1,
  },
  callModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callModalContent: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    width: '80%',
  },
  callerImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  callerName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  callStatus: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  callActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  callButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
});

export default ChatDetails;
