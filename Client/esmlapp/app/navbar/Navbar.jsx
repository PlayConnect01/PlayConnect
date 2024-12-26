import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";

const Navbar = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const isActive = (screenName) => route.name === screenName;

  return (
    <View style={styles.navbar}>
      <TouchableOpacity
        style={[styles.navItem, isActive("Homep") && styles.activeItem]}
        onPress={() => navigation.navigate("Homep")}
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
        onPress={() => navigation.navigate("Chat/MessagePage")}
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
        onPress={() => navigation.navigate("Match/Firstpagematch")}
      >
        <View style={[styles.centerButtonInner, isActive("Match") && styles.activeCenterButtonInner]}>
          <Icon
            name="flame"
            size={28}
            color={isActive("Match") ? "#000" : "#FFFFFF"}
          />
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, isActive("MarketplaceHome") && styles.activeItem]}
        onPress={() => navigation.navigate("MarketplaceHome")}
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
        onPress={() => navigation.navigate("Profile")}
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
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    height: 65,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    minWidth: 60,
  },
  activeItem: {
    // No background color change for active state
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
    marginTop: -20,
  },
  centerButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#60A5FA",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#60A5FA",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  activeCenterButtonInner: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#60A5FA",
  },
});

export default Navbar;