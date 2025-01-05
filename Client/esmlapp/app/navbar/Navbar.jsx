import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import io from "socket.io-client";
import { BASE_URL } from "../../Api";

const Navbar = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);

  useEffect(() => {
    console.log("Initializing socket connection in Navbar");

    if (!socketRef.current) {
      socketRef.current = io(BASE_URL, {
        transports: ["websocket"],
        reconnection: true,
      });

      const socket = socketRef.current;

      socket.on("connect", () => {
        console.log("Navbar socket connected successfully");
      });

      socket.on("newNotification", (data) => {
        console.log("New notification received:", data);
        if (route.name !== "Messages") {
          console.log("Incrementing unread count");
          setUnreadCount((prev) => prev + 1);
        }
      });

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });
    }

    return () => {
      if (socketRef.current) {
        console.log("Disconnecting socket in Navbar cleanup");
        socketRef.current.off("newNotification");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Reset unread count when entering MessagePage
  useEffect(() => {
    if (route.name === "Messages") {
      console.log("Resetting unread count");
      setUnreadCount(0);
    }
  }, [route.name]);

  const isActive = (screenName) => {
    const currentRoute = route.name;
    return currentRoute === screenName;
  };

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity
          style={[styles.navItem]}
          onPress={() => navigation.navigate("Home")}
        >
          <Icon
            name="home"
            size={24}
            color={isActive("Home") ? "#0095FF" : "#64748B"}
          />
          <Text style={isActive("Home") ? styles.navTextActive : styles.navText}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem]}
          onPress={() => navigation.navigate("Messages")}
        >
          <View style={styles.iconContainer}>
            <Icon
              name="chatbubble"
              size={24}
              color={isActive("Messages") ? "#0095FF" : "#64748B"}
            />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          <Text style={isActive("Messages") ? styles.navTextActive : styles.navText}>
            Message
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.centerButton, isActive("Match") && styles.activeCenterButton]}
          onPress={() => navigation.navigate("Match")}
        >
          <View style={styles.centerButtonInner}>
            <Icon name="flame" size={28} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem]}
          onPress={() => navigation.navigate("Marketplace")}
        >
          <Icon
            name="cart"
            size={24}
            color={isActive("Marketplace") ? "#0095FF" : "#64748B"}
          />
          <Text style={isActive("Marketplace") ? styles.navTextActive : styles.navText}>
            Market
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem]}
          onPress={() => navigation.navigate("ProfilePage")}
        >
          <Icon
            name="person"
            size={24}
            color={isActive("ProfilePage") ? "#0095FF" : "#64748B"}
          />
          <Text style={isActive("ProfilePage") ? styles.navTextActive : styles.navText}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    zIndex: 1000,
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 75,
    backgroundColor: "#FFFFFF",
    paddingBottom: Platform.OS === 'ios' ? 25 : 15,
    paddingTop: 10,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    minWidth: 70,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  activeItem: {
    backgroundColor: "#F0F7FF",
    borderRadius: 12,
  },
  navText: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  navTextActive: {
    color: "#0095FF",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
  },
  centerButton: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -30,
  },
  centerButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#0095FF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0095FF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  activeCenterButton: {
    backgroundColor: "#007ACC",
  },
  iconContainer: {
    position: "relative",
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    right: -8,
    top: -8,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default Navbar;