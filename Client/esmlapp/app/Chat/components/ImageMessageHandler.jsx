import React, { useState, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { BASE_URL } from "../../../Api";



const ImageMessageHandler = ({ chatId, currentUserId, onImageUpload }) => {
  const [uploading, setUploading] = useState(false);

  const pickImage = useCallback(async () => {
    try {
      console.log("Attempting to pick image...");

      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission needed",
          "Please grant permission to access your photos."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setUploading(true);
        const formData = new FormData();
        formData.append("image", {
          uri: result.assets[0].uri,
          type: "image/jpeg",
          name: "image.jpg",
        });
        formData.append("chatId", chatId);
        formData.append("senderId", currentUserId);

        try {
          console.log("Uploading to:", `${BASE_URL}/chats/upload/image`);
          const response = await axios({
            method: "post",
            url: `${BASE_URL}/chats/upload/image`,
            data: formData,
            headers: {
              "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
            },
          });

          console.log("Upload response:", response.data);

          if (response.data) {
            // Remove any existing socket event listeners before sending
            onImageUpload({
              content: response.data.content || response.data.secure_url,
              message_type: "IMAGE",
              sender_id: currentUserId,
              chat_id: chatId,
              sent_at: new Date().toISOString(),
              message_id: response.data.message_id, // Add message_id if available
            });
          }
        } catch (error) {
          console.error("Error uploading image:", error);
          Alert.alert("Error", "Failed to upload image. Please try again.");
        }
        setUploading(false);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
      setUploading(false);
    }
  }, [chatId, currentUserId, onImageUpload]);

  return (
    <TouchableOpacity
      style={styles.imageButton}
      onPress={pickImage}
      disabled={uploading}
    >
      {uploading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="image" size={20} color="#FFFFFF" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  imageButton: {
    padding: 8,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4FA5F5",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ImageMessageHandler;
