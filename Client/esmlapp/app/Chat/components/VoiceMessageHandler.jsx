import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    TouchableOpacity, 
    StyleSheet, 
    Alert,
    ActivityIndicator,
    Text,
} from 'react-native';
import { Audio } from 'expo-av';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL } from '../../../Api';


const API_URL = BASE_URL;

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Accept': 'application/json',
    }
});

const VoiceMessageHandler = ({ onAudioUploaded, chatId, currentUserId }) => {
    const recordingRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        return () => {
            if (recordingRef.current) {
                recordingRef.current.stopAndUnloadAsync();
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            if (recordingRef.current) {
                await recordingRef.current.stopAndUnloadAsync();
                recordingRef.current = null;
            }

            const permission = await Audio.requestPermissionsAsync();
            if (permission.status === 'granted') {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                });

                const { recording } = await Audio.Recording.createAsync(
                    Audio.RecordingOptionsPresets.HIGH_QUALITY
                );

                recordingRef.current = recording;
                setIsRecording(true);
            } else {
                Alert.alert('Permission required', 'Please grant microphone permission to record audio messages.');
            }
        } catch (error) {
            console.error('Failed to start recording:', error);
            Alert.alert('Error', 'Failed to start recording');
        }
    };

    const stopRecording = async () => {
        try {
            if (!recordingRef.current) return;

            setIsRecording(false);
            await recordingRef.current.stopAndUnloadAsync();
            const uri = recordingRef.current.getURI();
            recordingRef.current = null;
            await uploadAudio(uri);
        } catch (error) {
            console.error('Failed to stop recording:', error);
            Alert.alert('Error', 'Failed to stop recording');
        }
    };

    const uploadAudio = async (uri) => {
        try {
            setUploading(true);
            const formData = new FormData();
            
            formData.append('audio', {
                uri: uri,
                type: 'audio/m4a',
                name: 'recording.m4a'
            });
            formData.append('senderId', currentUserId.toString());

            console.log('Uploading to:', `${API_URL}/chats/audio/${chatId}`);

            const response = await api.post(`/chats/audio/${chatId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Upload response:', response.data);

            if (response.data) {
                // Create a message object that matches the server's format
                const audioMessage = {
                    message_id: `temp_${Date.now()}`,
                    content: response.data.voice_file_url,
                    voice_file_url: response.data.voice_file_url,
                    message_type: 'AUDIO'
                };

                // Call the callback with the audio message
                onAudioUploaded(audioMessage);
                
                // Emit socket event for real-time updates
                if (window.socket) {
                    window.socket.emit('send_audio', {
                        chatId,
                        senderId: currentUserId,
                        audioUrl: response.data.voice_file_url,
                        messageType: 'AUDIO'
                    });
                }
            }
        } catch (error) {
            console.error('Error uploading audio:', error);
            Alert.alert('Error', 'Failed to upload audio message');
        } finally {
            setUploading(false);
        }
    };

    return (
        <TouchableOpacity 
            onPress={isRecording ? stopRecording : startRecording}
            style={styles.recordButton}
        >
            {uploading ? (
                <ActivityIndicator color="#6B46C1" size="small" />
            ) : (
                <MaterialCommunityIcons
                    name={isRecording ? "stop" : "microphone"}
                    size={24}
                    color="#6B46C1"
                />
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    recordButton: {
        padding: 8,
    },
});

export default VoiceMessageHandler;