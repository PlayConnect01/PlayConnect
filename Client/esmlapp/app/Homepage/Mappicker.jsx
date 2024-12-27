// import React, { useState, useEffect } from 'react';
// import { View, StyleSheet, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
// import MapView, { Marker } from 'react-native-maps';

// const MapPicker = ({ onLocationSelect, initialLocation }) => {
//   const [selectedLocation, setSelectedLocation] = useState(initialLocation);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [address, setAddress] = useState('');
//   const [searchResults, setSearchResults] = useState([]);
//   const [isSearching, setIsSearching] = useState(false);

//   // Add debounce for search
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (searchQuery.length > 3) {
//         performSearch(searchQuery);
//       }
//     }, 500);

//     return () => clearTimeout(timer);
//   }, [searchQuery]);

//   const performSearch = async (text) => {
//     setIsSearching(true);
//     const results = await searchLocation(text);
//     setSearchResults(results);
//     setIsSearching(false);
//   };

//   const handleSearch = (text) => {
//     setSearchQuery(text);
//     if (text.length <= 3) {
//       setSearchResults([]);
//     }
//   };

//   const handleSelectResult = async (result) => {
//     const newLocation = {
//       address: result.formatted, // Address from OpenCage API
//       latitude: result.geometry.lat,
//       longitude: result.geometry.lng,
//     };
    
//     setSelectedLocation(newLocation);
//     setAddress(result.formatted);
//     setSearchQuery(result.formatted);
//     setSearchResults([]);
//     onLocationSelect(newLocation);
//   };

//   const handleMapPress = async (event) => {
//     const { coordinate } = event.nativeEvent;
//     setSearchResults([]);
    
//     try {
//       const addressResult = await reverseGeocode(coordinate.latitude, coordinate.longitude);
//       if (addressResult) {
//         const locationData = {
//           address: addressResult,
//           latitude: coordinate.latitude,
//           longitude: coordinate.longitude,
//         };
//         setAddress(addressResult);
//         setSearchQuery(addressResult);
//         onLocationSelect(locationData);
//       }
//     } catch (error) {
//       console.error('Error reverse geocoding:', error);
//       Alert.alert('Error', 'Failed to retrieve address from coordinates.');
//     }
//   };

//   const reverseGeocode = async (latitude, longitude) => {
//     try {
//       const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?key=e5ca5b12930a458eb87bec6ef03ddcb9&q=${latitude}+${longitude}&pretty=1`);
//       if (!response.ok) {
//         throw new Error('Failed to fetch address');
//       }
//       const data = await response.json();
//       return data.results[0]?.formatted; // Adjust based on OpenCage API response structure
//     } catch (error) {
//       console.error('Error reverse geocoding:', error);
//       throw error;
//     }
//   };

//   const searchLocation = async (query) => {
//     try {
//       const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?key=e5ca5b12930a458eb87bec6ef03ddcb9&q=${query}&pretty=1`);
//       if (!response.ok) {
//         throw new Error('Failed to fetch search results');
//       }
//       const data = await response.json();
//       return data.results; // Assuming OpenCage returns results here
//     } catch (error) {
//       console.error('Error searching location:', error);
//       throw error;
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.searchContainer}>
//         <TextInput
//           style={styles.searchInput}
//           placeholder="Search for a location..."
//           value={searchQuery}
//           onChangeText={handleSearch}
//           onFocus={() => {
//             if (searchQuery.length > 3) {
//               performSearch(searchQuery);
//             }
//           }}
//         />
//         {searchResults.length > 0 && (
//           <View style={styles.searchResults}>
//             {searchResults.map((result, index) => (
//               <TouchableOpacity
//                 key={index}
//                 style={styles.searchResultItem}
//                 onPress={() => handleSelectResult(result)}
//               >
//                 <Text style={styles.searchResultText}>{result.formatted}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         )}
//       </View>
//       <MapView
//         style={styles.map}
//         region={{
//           latitude: selectedLocation.latitude,
//           longitude: selectedLocation.longitude,
//           latitudeDelta: 0.0922,
//           longitudeDelta: 0.0421,
//         }}
//         onPress={handleMapPress}
//       >
//         {selectedLocation && (
//           <Marker 
//             coordinate={selectedLocation}
//             title={address || "Selected Location"}
//           />
//         )}
//       </MapView>
//       {address && (
//         <View style={styles.addressContainer}>
//           <Text style={styles.addressText} numberOfLines={2}>
//             Selected Location: {address}
//           </Text>
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   searchContainer: {
//     zIndex: 2,
//     position: 'absolute',
//     top: 10,
//     left: 10,
//     right: 10,
//   },
//   searchInput: {
//     height: 40,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     paddingHorizontal: 10,
//     borderRadius: 5,
//     backgroundColor: 'white',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   map: {
//     flex: 1,
//   },
//   addressContainer: {
//     position: 'absolute',
//     bottom: 20,
//     left: 10,
//     right: 10,
//     backgroundColor: 'white',
//     padding: 15,
//     borderRadius: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   addressText: {
//     fontSize: 14,
//     color: '#333',
//   },
//   searchResults: {
//     backgroundColor: 'white',
//     borderRadius: 5,
//     marginTop: 5,
//     maxHeight: 200,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   searchResultItem: {
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   searchResultText: {
//     fontSize: 14,
//   },
// });

// export default MapPicker;
