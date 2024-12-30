import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const GooglePayForm = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Google Pay Payment Form</Text>
      {/* Add form fields here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
});

export default GooglePayForm;
