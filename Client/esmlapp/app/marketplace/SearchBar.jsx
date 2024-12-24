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
  },
  searchInput: {
    height: 50,
    borderColor: '#6A5AE0',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  dropdown: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 5,
    zIndex: 1,
    maxHeight: 300,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  resultText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  resultPrice: {
    fontSize: 14,
    color: '#6A5AE0',
    marginTop: 5,
  },
  loadingIndicator: {
    marginVertical: 10,
  },
  noResultsText: {
    padding: 15,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default SearchBar;
