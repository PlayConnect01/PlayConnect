import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';


const MapPicker = ({ onLocationSelect, initialLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [searchQuery, setSearchQuery] = useState('');

  const reverseGeocode = async (coordinate) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinate.latitude}&lon=${coordinate.longitude}`
      );
      const data = await response.json();
      setSearchQuery(data.display_name || `Lat: ${coordinate.latitude.toFixed(5)}, Lon: ${coordinate.longitude.toFixed(5)}`);
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      setSearchQuery(`Lat: ${coordinate.latitude.toFixed(5)}, Lon: ${coordinate.longitude.toFixed(5)}`);
    }
  };

  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate);
    reverseGeocode(coordinate);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search location"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={handleMapPress}
      >
        {selectedLocation && <Marker coordinate={selectedLocation} />}
      </MapView>
      <TouchableOpacity style={styles.selectButton} onPress={() => onLocationSelect(selectedLocation)}>
        <Text style={styles.selectButtonText}>Select Location</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginTop: 10,
    marginHorizontal: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  map: {
    width: '100%',
    height: '80%',
  },
  selectButton: {
    backgroundColor: '#6200ee',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    margin: 10,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default MapPicker;