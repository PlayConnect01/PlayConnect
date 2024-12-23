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
          name="home-outline"
          size={24}
          color={isActive("Homep") ? "white" : "gray"}
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
          name="chatbubble-outline"
          size={24}
          color={isActive("MessagePage") ? "white" : "gray"}
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
        style={[styles.navItem, isActive("Match") && styles.activeItem]}
        onPress={() => navigation.navigate("Match")}
      >
        <Icon
          name="flame-outline"
          size={24}
          color={isActive("Match") ? "white" : "gray"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.navItem,
          isActive("MarketplaceHome") && styles.activeItem,
        ]}
        onPress={() => navigation.navigate("MarketplaceHome")}
      >
        <Icon
          name="cart-outline"
          size={24}
          color={isActive("MarketplaceHome") ? "white" : "gray"}
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
          name="person-outline"
          size={24}
          color={isActive("Profile") ? "white" : "gray"}
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
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  navItem: {
    alignItems: "center",
  },
  activeItem: {
    backgroundColor: "#6200ee",
    borderRadius: 30,
    padding: 12,
  },
  navText: {
    color: "gray",
    marginTop: 5,
  },
  navTextActive: {
    color: "white",
    marginTop: 5,
  },
});

export default Navbar;
