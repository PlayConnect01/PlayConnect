import React from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import Navbar from "../navbar/Navbar.jsx"; // Adjust the path if needed.

const MainLayout = ({ children }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>{children}</View>
      <View style={styles.navContainer}>
        <Navbar />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  navContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
  },
});

export default MainLayout;
