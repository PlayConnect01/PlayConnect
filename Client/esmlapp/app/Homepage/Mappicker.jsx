import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import CustomAlert from '../../Alerts/CustomAlert';

const MapPicker = ({ onLocationSelect, initialLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [searchQuery, setSearchQuery] = useState('');
  const [address, setAddress] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    timeout: 3000
  });

  const showAlert = (title, message, timeout = 3000) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      timeout
    });
  };

  const hideAlert = () => {
    setAlertConfig({
      visible: false,
      title: '',
      message: '',
      timeout: 3000
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 3) {
        performSearch(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async (text) => {
    setIsSearching(true);
    try {
      const results = await searchLocation(text);
      setSearchResults(results);
    } catch (error) {
      showAlert('Error', 'Failed to search for location');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.length <= 3) {
      setSearchResults([]);
    }
  };

  const handleSelectResult = async (result) => {
    const newLocation = {
      address: result.formatted,
      latitude: result.geometry.lat,
      longitude: result.geometry.lng,
    };
    
    setSelectedLocation(newLocation);
    setAddress(result.formatted);
    setSearchQuery(result.formatted);
    setSearchResults([]);
    onLocationSelect(newLocation);
  };

  const handleMapPress = async (event) => {
    const { coordinate } = event.nativeEvent;
    setSearchResults([]);
    
    try {
      const addressResult = await reverseGeocode(coordinate.latitude, coordinate.longitude);
      if (addressResult) {
        const locationData = {
          address: addressResult,
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
        };
        setAddress(addressResult);
        setSearchQuery(addressResult);
        onLocationSelect(locationData);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      showAlert('Error', 'Failed to retrieve address from coordinates');
    }
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?key=e5ca5b12930a458eb87bec6ef03ddcb9&q=${latitude}+${longitude}&pretty=1`);
      if (!response.ok) {
        throw new Error('Failed to fetch address');
      }
      const data = await response.json();
      return data.results[0]?.formatted;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      throw error;
    }
  };

  const searchLocation = async (query) => {
    try {
      const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?key=e5ca5b12930a458eb87bec6ef03ddcb9&q=${query}&pretty=1`);
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }
      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error('Error searching location:', error);
      throw error;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a location..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {isSearching && <Text style={styles.searchingText}>Searching...</Text>}
      </View>

      {searchResults.length > 0 && (
        <View style={styles.resultsContainer}>
          {searchResults.map((result, index) => (
            <TouchableOpacity
              key={index}
              style={styles.resultItem}
              onPress={() => handleSelectResult(result)}
            >
              <Text style={styles.resultText}>{result.formatted}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <MapView
        style={styles.map}
        onPress={handleMapPress}
        initialRegion={{
          latitude: selectedLocation?.latitude || 0,
          longitude: selectedLocation?.longitude || 0,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {selectedLocation && (
          <Marker
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }}
          />
        )}
      </MapView>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={hideAlert}
        timeout={alertConfig.timeout}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: 'white',
    borderRadius: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  searchInput: {
    padding: 10,
    fontSize: 16,
  },
  searchingText: {
    padding: 10,
    textAlign: 'center',
    color: '#666',
  },
  resultsContainer: {
    position: 'absolute',
    top: 60,
    left: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    elevation: 3,
    zIndex: 1,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultText: {
    fontSize: 14,
  },
});

export default MapPicker;
