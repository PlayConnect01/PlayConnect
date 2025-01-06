import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  ScrollView,
  ImageBackground,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const MatchNotification = ({ notification, onAccept, onReject }) => {
  const [showModal, setShowModal] = useState(true);
  const likeScale = useRef(new Animated.Value(1)).current;
  const dislikeScale = useRef(new Animated.Value(1)).current;

  // Utiliser les données de l'expéditeur du match (user_1)
  const senderData = notification?.match?.user_1;
  const sportData = notification?.match?.sport;
  
  const senderName = senderData?.username || "Unknown User";
  const senderImage = senderData?.profile_picture || "default_image_url";
  const senderLocation = senderData?.location || "Location not specified";
  const senderSports = senderData?.sports?.map((sport) => sport.sport.name) || [];
  const matchSport = sportData?.name || "Unknown Sport";

  console.log("Match data:", { sender: senderData, sport: sportData }); // Pour déboguer

  const animateButton = (scale) => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleAccept = () => {
    if (notification?.match_id) {
      animateButton(likeScale);
      onAccept(notification.match_id);
    }
  };

  const handleReject = () => {
    if (notification?.match_id) {
      animateButton(dislikeScale);
      onReject(notification.match_id);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: senderImage }}
        style={styles.userImageBackground}
        imageStyle={styles.userImageStyle}
      >
        <LinearGradient
          colors={["transparent", "rgba(0, 0, 0, 0.95)"]}
          style={styles.gradient}
        >
          <View style={styles.userInfoContainer}>
            <Text style={styles.userNameModal}>{senderName}</Text>

            <View style={styles.infoSection}>
              <View style={styles.locationInfo}>
                <Ionicons name="location" size={20} color="#fff" />
                <Text style={styles.locationTextModal}>{senderLocation}</Text>
              </View>

              <View style={styles.sportsContainer}>
                <Text style={styles.sportsTitle}>Match request for:</Text>
                <View style={styles.sportBadge}>
                  <Ionicons name="football-outline" size={16} color="#fff" />
                  <Text style={styles.sportText}>{matchSport}</Text>
                </View>

                <Text style={styles.sportsTitle}>Also interested in:</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.sportsList}
                >
                  {senderSports
                    .filter(sport => sport !== matchSport)
                    .map((sport, index) => (
                      <View key={index} style={styles.sportBadge}>
                        <Ionicons name="football-outline" size={16} color="#fff" />
                        <Text style={styles.sportText}>{sport}</Text>
                      </View>
                    ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={handleReject}>
                <Animated.View
                  style={[
                    styles.actionButton,
                    styles.rejectButton,
                    { transform: [{ scale: dislikeScale }] },
                  ]}
                >
                  <Ionicons name="close" size={40} color="#FF3B30" />
                </Animated.View>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleAccept}>
                <Animated.View
                  style={[
                    styles.actionButton,
                    styles.acceptButton,
                    { transform: [{ scale: likeScale }] },
                  ]}
                >
                  <Ionicons name="heart" size={40} color="#4CD964" />
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "90%",
    height: "80%",
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  userImageBackground: {
    width: "100%",
    height: "100%",
  },
  userImageStyle: {
    resizeMode: "cover",
  },
  gradient: {
    flex: 1,
    justifyContent: "flex-end",
  },
  userInfoContainer: {
    width: "100%",
    padding: 25,
    paddingTop: 40,
  },
  userNameModal: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  infoSection: {
    width: "100%",
    marginBottom: 20,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  locationTextModal: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  sportsContainer: {
    width: "100%",
  },
  sportsTitle: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
    opacity: 0.9,
  },
  sportsList: {
    maxHeight: 50,
  },
  sportBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
  },
  sportText: {
    color: "#fff",
    marginLeft: 6,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 30,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.5,
    elevation: 8,
    backgroundColor: "#fff",
    padding: 2,
  },
  rejectButton: {
    backgroundColor: "#FF3B30",
  },
  acceptButton: {
    backgroundColor: "#4CD964",
  },
});

export default MatchNotification;
