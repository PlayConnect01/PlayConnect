import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

const Navbar = () => {
    const navigation = useNavigation();
  return (
    <View style={styles.navbar}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("Homepage/Homep")}
      >
        <Icon name="home-outline" size={24} color="black" />
        <Text style={styles.navText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("Chat/MessagePage")}
      >
        <Icon name="chatbubble-outline" size={24} color="gray" />
        <Text style={styles.navTextInactive}>Message</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, styles.activeItem]}
        onPress={() => navigation.navigate("Match")}
      >
        <Icon name="flame-outline" size={24} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("marketplace/Home")}
      >
        <Icon name="cart-outline" size={24} color="gray" />
        <Text style={styles.navTextInactive}>Market</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("profile/ProfilePage")}
      >
        <Icon name="person-outline" size={24} color="gray" />
        <Text style={styles.navTextInactive}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#s",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  navItem: {
    alignItems: "center",
  },
  activeItem: {
    backgroundColor: "#0095FF",
    borderRadius: 30,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  navText: {
    color: "black",
    marginTop: 5,
  },
  navTextInactive: {
    color: "gray",
    marginTop: 5,
  },
});

export default Navbar;
