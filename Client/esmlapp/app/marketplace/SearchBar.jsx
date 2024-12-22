import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import axios from 'axios';

const SearchBar = ({ onSelectProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.trim().length > 0) {
        fetchSearchResults();
      } else {
        setResults([]);
        setDropdownVisible(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const fetchSearchResults = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`http://192.168.1.101:3000/product/search`, {
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
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search for products..."
        placeholderTextColor="#999"
        style={styles.searchInput}
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      {isDropdownVisible && (
        <View style={styles.dropdown}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#6A5AE0" style={styles.loadingIndicator} />
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
            />
          ) : (
            <Text style={styles.noResultsText}>No results found</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 20,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: 'transparent',
  },
  searchInput: {
    height: 56,
    borderColor: '#6A5AE0',
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingRight: 48,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
    fontWeight: '500',
    shadowColor: '#6A5AE0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  searchInputFocused: {
    borderColor: '#4C3ED9',
    backgroundColor: '#FAFAFA',
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  dropdown: {
    position: 'absolute',
    top: 64,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 8,
    zIndex: 1000,
    maxHeight: 350,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    transform: [{ translateY: 0 }],
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
    transform: [{ scale: 1 }],
  },
  resultItemActive: {
    backgroundColor: '#F8FAFF',
    borderLeftWidth: 3,
    borderLeftColor: '#6A5AE0',
  },
  resultItemPressed: {
    backgroundColor: '#F9FAFB',
    transform: [{ scale: 0.995 }],
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
    justifyContent: 'center',
  },
  resultText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    letterSpacing: 0.3,
    includeFontPadding: false,
  },
  resultTextHighlight: {
    backgroundColor: '#EEF2FF',
    color: '#6A5AE0',
    borderRadius: 4,
    overflow: 'hidden',
    paddingHorizontal: 2,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingIndicator: {
    transform: [{ scale: 1.2 }],
  },
  loadingText: {
    marginTop: 8,
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
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.3,
    lineHeight: 20,
  },
  noResultsSubText: {
    marginTop: 4,
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
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
  },
  clearButtonText: {
    color: '#4B5563',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 22,
  },
  resultMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 8,
  },
  resultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  resultBadgeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  resultBadgeSuccess: {
    backgroundColor: '#ECFDF5',
  },
  resultBadgeSuccessText: {
    color: '#059669',
  },
  resultBadgeError: {
    backgroundColor: '#FEF2F2',
  },
  resultBadgeErrorText: {
    color: '#DC2626',
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
  },
});

export default SearchBar;
