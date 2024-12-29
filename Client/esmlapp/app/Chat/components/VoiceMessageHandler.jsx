import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Text,
} from "react-native";
import { Audio } from "expo-av";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
<<<<<<< HEAD
import {BASE_URL} from "../../../api"
=======
import {BASE_URL} from "../../../Api"
>>>>>>> 0c99f25d94dbcc0ca8d801efce82d1f3edc953b8

const VoiceMessageHandler = ({ onAudioMessage, chatId, currentUserId }) => {
  const recordingRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
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
      if (permission.status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );

        recordingRef.current = recording;
        setIsRecording(true);
        setRecordingDuration(0);

        // Démarrer le compteur
        timerRef.current = setInterval(() => {
          setRecordingDuration((prev) => prev + 1);
        }, 1000);
      } else {
        Alert.alert(
          "Permission required",
          "Please grant microphone permission to record audio messages."
        );
      }
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Error", "Failed to start recording");
    }
  };

  const stopRecording = async () => {
    try {
      if (!recordingRef.current) return;

      // Arrêter le compteur
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setIsRecording(false);
      setRecordingDuration(0);
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      await uploadAudio(uri);
    } catch (error) {
      console.error("Failed to stop recording:", error);
      Alert.alert("Error", "Failed to stop recording");
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const uploadAudio = async (uri) => {
    if (!uri) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("audio", {
      uri,
      type: "audio/m4a",
      name: "audio.m4a",
    });
    formData.append("senderId", currentUserId);

    try {
      const response = await axios.post(
        `${BASE_URL}/chats/audio/${chatId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data) {
        onAudioMessage({
          content: response.data.content || response.data.fileUrl,
          message_type: "AUDIO",
          sender_id: currentUserId,
          chat_id: chatId,
          sent_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Failed to upload audio:", error);
      Alert.alert("Error", "Failed to upload audio message");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {isRecording && (
        <Text style={styles.timer}>{formatDuration(recordingDuration)}</Text>
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={isRecording ? stopRecording : startRecording}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#4FA5F5" />
        ) : (
          <MaterialCommunityIcons
            name={isRecording ? "stop" : "microphone"}
            size={24}
            color={isRecording ? "#FF0000" : "#4FA5F5"}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  button: {
    padding: 8,
    backgroundColor: "transparent",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  timer: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
});

export default VoiceMessageHandler;
