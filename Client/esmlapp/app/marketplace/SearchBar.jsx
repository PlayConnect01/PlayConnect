import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../Api';
const SearchBar = ({ onSelectProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Animation value for search bar focus
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.trim().length > 0) {
        fetchSearchResults();
      } else {
        setResults([]);
        setDropdownVisible(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const fetchSearchResults = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/product/search`, {
        params: { productName: searchTerm },
      });
      setResults(response.data);
      setDropdownVisible(true);
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProduct = (product) => {
    onSelectProduct(product);
    setSearchTerm('');
    setResults([]);
    setDropdownVisible(false);
    setIsFocused(false);
  };

  const animatedStyles = {
    transform: [{
      scale: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.02],
      }),
    }],
    shadowOpacity: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.1, 0.25],
    }),
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.searchContainer, animatedStyles]}>
        <TextInput
          placeholder="Search for products..."
          placeholderTextColor="#9CA3AF"
          style={[
            styles.searchInput,
            isFocused && styles.searchInputFocused,
          ]}
          value={searchTerm}
          onChangeText={setSearchTerm}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay hiding the dropdown to allow for item selection
            setTimeout(() => {
              if (!isDropdownVisible) {
                setIsFocused(false);
              }
            }, 200);
          }}
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setSearchTerm('');
              setDropdownVisible(false);
              setResults([]);
            }}
          >
            <Text style={styles.clearButtonText}>×</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      {isDropdownVisible && (
        <Animated.View style={[styles.dropdown, {
          opacity: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.9, 1],
          }),
        }]}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#6A5AE0" />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          ) : results.length > 0 ? (
            <FlatList
              data={results}
              keyExtractor={(item) => item.product_id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => handleSelectProduct(item)}
                >
                  <View style={styles.textContainer}>
                    <Text style={styles.resultText}>{item.name}</Text>
                  </View>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              style={styles.resultsList}
            />
          ) : (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>No results found</Text>
              <Text style={styles.noResultsSubText}>Try a different search term</Text>
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 20,
    zIndex: 1000, // Ensure the container stays above other elements
    elevation: 1000, // For Android
  },
  searchContainer: {
    position: 'relative',
    zIndex: 1001, // Higher than container
    elevation: 1001, // For Android
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#6A5AE0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  searchInput: {
    height: 60,
    paddingHorizontal: 24,
    paddingRight: 48,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  searchInputFocused: {
    borderColor: '#6A5AE0',
    backgroundColor: '#FAFAFA',
  },
  dropdown: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 1002, // Higher than searchContainer
    zIndex: 1002, // Higher than searchContainer
    maxHeight: 350,
    overflow: 'hidden',
  },
  resultsList: {
    maxHeight: 350,
  },
  resultItem: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  textContainer: {
    flex: 1,
  },
  resultText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    letterSpacing: 0.3,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  noResultsContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  noResultsText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  noResultsSubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#9CA3AF',
  },
  clearButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -12 }],
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1003,
    elevation: 1003,
  },
  clearButtonText: {
    color: '#4B5563',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 22,
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
});

export default SearchBar;