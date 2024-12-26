import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";

const Navbar = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const isActive = (screenName) => route.name === screenName;

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity
          style={[styles.navItem, isActive("Homep") && styles.activeItem]}
          onPress={() => navigation.navigate("Homepage/Homep")}
        >
          <Icon
            name="home"
            size={24}
            color={isActive("Homep") ? "#000" : "#9CA3AF"}
          />
          <Text style={isActive("Homep") ? styles.navTextActive : styles.navText}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, isActive("MessagePage") && styles.activeItem]}
          onPress={() => navigation.navigate("MessagePage")}
        >
          <Icon
            name="chatbubble"
            size={24}
            color={isActive("MessagePage") ? "#000" : "#9CA3AF"}
          />
          <Text
            style={
              isActive("MessagePage") ? styles.navTextActive : styles.navText
            }
          >
            Message
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.centerButton, isActive("Match") && styles.activeCenterButton]}
          onPress={() => navigation.navigate("Match")}
        >
          <View style={styles.centerButtonInner}>
            <Icon
              name="flame"
              size={28}
              color="#FFFFFF"
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, isActive("MarketplaceHome") && styles.activeItem]}
          onPress={() => navigation.navigate("marketplace/marketplace")}
        >
          <Icon
            name="cart"
            size={24}
            color={isActive("MarketplaceHome") ? "#000" : "#9CA3AF"}
          />
          <Text
            style={
              isActive("MarketplaceHome") ? styles.navTextActive : styles.navText
            }
          >
            Market
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, isActive("Profile") && styles.activeItem]}
          onPress={() => navigation.navigate("profile/ProfilePage")}
        >
          <Icon
            name="person"
            size={24}
            color={isActive("Profile") ? "#000" : "#9CA3AF"}
          />
          <Text
            style={isActive("Profile") ? styles.navTextActive : styles.navText}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 65,
    paddingBottom: 0,
    backgroundColor: '#FFFFFF',
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    minWidth: 60,
  },
  activeItem: {
    backgroundColor: "#0095FF",
    borderRadius: 30,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  navText: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 4,
  },
  navTextActive: {
    color: "#000000",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  centerButton: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -15,
  },
  centerButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#0095FF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0095FF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  activeCenterButton: {
    // Add any specific active states for the center button if needed
  },
});

export default Navbar;