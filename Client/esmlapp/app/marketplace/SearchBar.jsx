import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Image,
  Pressable,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../Api';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const SearchBar = ({ onSelectProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const searchTimeout = useRef(null);

  const navigation = useNavigation();

  const loadRecentSearches = async () => {
    try {
      const savedSearches = await AsyncStorage.getItem('recentSearches');
      if (savedSearches) {
        setRecentSearches(JSON.parse(savedSearches));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const saveRecentSearch = async (searchTerm) => {
    try {
      let searches = [...recentSearches];
      searches = [searchTerm, ...searches.filter(term => term !== searchTerm)];
      searches = searches.slice(0, 5);
      await AsyncStorage.setItem('recentSearches', JSON.stringify(searches));
      setRecentSearches(searches);
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  useEffect(() => {
    loadRecentSearches();
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    if (results.length > 0) {
      Animated.spring(fadeAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [results]);

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (searchTerm.trim().length > 0) {
      searchTimeout.current = setTimeout(() => {
        fetchSearchResults();
        setDropdownVisible(true);
      }, 300);
    } else {
      setResults([]);
      setDropdownVisible(false);
    }
  }, [searchTerm]);

  const fetchSearchResults = async () => {
    setIsLoading(true);
    try {
      console.log('Searching for:', searchTerm);
      const response = await axios.get(`${BASE_URL}/product/search`, {
        params: { productName: searchTerm },
        headers: {
          'Content-Type': 'application/json',
        }
      });
      console.log('Search response:', response.data);
      setResults(response.data);
    } catch (error) {
      console.error("Error fetching search results:", error.response?.data || error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProduct = (product) => {
    onSelectProduct(product);
    saveRecentSearch(product.name);
    setSearchTerm("");
    setResults([]);
    setDropdownVisible(false);
    setIsFocused(false);
    navigation.navigate('ProductDetail', { productId: product.product_id });
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setResults([]);
    setDropdownVisible(false);
    searchRef.current?.focus();
  };

  const handleRecentSearchSelect = (search) => {
    setSearchTerm(search);
    fetchSearchResults();
  };

  const renderSearchResult = (item, index) => {
    const imageUrl = item.image_url ? `${BASE_URL}/${item.image_url}` : null;

    return (
      <Animated.View
        key={item.product_id}
        style={[
          styles.resultItem,
          {
            opacity: fadeAnim,
            transform: [{
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0]
              })
            }]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.resultButton}
          onPress={() => handleSelectProduct(item)}
        >
          <View style={styles.imageContainer}>
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.resultImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.resultImage, styles.placeholderImage]}>
                <Ionicons name="image-outline" size={24} color="#999" />
              </View>
            )}
          </View>
          <View style={styles.resultTextContainer}>
            <Text style={styles.resultTitle} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.resultPrice}>${item.price.toFixed(2)}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{item.rating}</Text>
              <Text style={styles.reviewCount}>({item.review_count})</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator style={styles.loader} color="#0066cc" />;
    }

    if (results.length > 0) {
      return (
        <View style={styles.resultsList}>
          {results.map((item, index) => (
            renderSearchResult(item, index)
          ))}
        </View>
      );
    }

    if (searchTerm.length > 0) {
      return <Text style={styles.noResults}>No products found</Text>;
    }

    if (recentSearches.length > 0) {
      return (
        <View style={styles.recentSearches}>
          <Text style={styles.recentTitle}>Recent Searches</Text>
          {recentSearches.map((search, index) => (
            <TouchableOpacity
              key={index}
              style={styles.recentItem}
              onPress={() => handleRecentSearchSelect(search)}
            >
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.recentText}>{search}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.container}>
        <View style={[styles.searchContainer, isFocused && styles.searchContainerFocused]}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            ref={searchRef}
            style={styles.input}
            placeholder="Search products..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            onFocus={() => {
              setIsFocused(true);
              setDropdownVisible(true);
            }}
            returnKeyType="search"
            onSubmitEditing={fetchSearchResults}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity 
              onPress={handleClearSearch} 
              style={styles.clearButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        {dropdownVisible && (
          <View style={styles.dropdownContainer}>
            {renderContent()}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    position: 'relative',
    zIndex: 999,
    elevation: 999,
  },
  container: {
    marginHorizontal: 16,
    marginTop: 8,
    position: 'relative',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    zIndex: 1000,
    elevation: 1000,
  },
  searchContainerFocused: {
    borderColor: '#0066cc',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
    paddingVertical: 8,
  },
  clearButton: {
    padding: 8,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 998,
    overflow: 'scroll',
  },
  resultsList: {
    maxHeight: 300,
    paddingVertical: 4,
  },
  resultItem: {
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  resultButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  imageContainer: {
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  resultImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  resultTextContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  resultPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0066cc',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#888',
    marginLeft: 4,
  },
  noResults: {
    padding: 20,
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
  recentSearches: {
    padding: 8,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  recentText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  loader: {
    padding: 20,
  },
});

export default SearchBar;
