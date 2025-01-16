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
  ScrollView
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
      searches = searches.slice(0, 10);
      await AsyncStorage.setItem('recentSearches', JSON.stringify(searches));
      setRecentSearches(searches);
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  const removeSearchItem = async (indexToRemove) => {
    try {
      const updatedSearches = recentSearches.filter((_, index) => index !== indexToRemove);
      await AsyncStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
      setRecentSearches(updatedSearches);
    } catch (error) {
      console.error('Error removing search item:', error);
    }
  };

  const clearRecentSearches = async () => {
    try {
      await AsyncStorage.removeItem('recentSearches');
      setRecentSearches([]);
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setResults([]);
    setDropdownVisible(false);
    searchRef.current?.focus();
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

  const fetchSearchResults = async (searchValue = searchTerm) => {
    if (!searchValue.trim()) {
      setResults([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/product/search`, {
        params: { productName: searchValue },
        headers: { 'Content-Type': 'application/json' }
      });
      setResults(response.data);
      if (searchValue.trim()) {
        saveRecentSearch(searchValue.trim());
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
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

  const handleRecentSearchSelect = (search) => {
    setSearchTerm(search);
    fetchSearchResults(search);
  };

  const renderSearchResult = (item, index) => {
    const imageUrl = item.image_url || item.image || 'https://res.cloudinary.com/sportsmate/image/upload/v1705330085/placeholder-image.jpg';

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
            <Image
              source={{ uri: imageUrl }}
              style={styles.resultImage}
              resizeMode="cover"
              onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
            />
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

  return (
    <View style={styles.mainContainer}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#A0AEC0" style={styles.searchIcon} />
        <TextInput
          ref={searchRef}
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          onFocus={() => {
            setIsFocused(true);
            if (searchTerm.length > 0 || recentSearches.length > 0) {
              setDropdownVisible(true);
            }
          }}
          onBlur={() => {
            setTimeout(() => {
              if (!searchTerm.length) {
                setDropdownVisible(false);
              }
            }, 200);
          }}
          placeholderTextColor="#A0AEC0"
        />
        {searchTerm ? (
          <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#A0AEC0" />
          </TouchableOpacity>
        ) : null}
      </View>
      
      {dropdownVisible && (
        <View style={styles.dropdownContainer}>
          <ScrollView
            style={styles.resultsList}
            contentContainerStyle={styles.resultsContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {isLoading ? (
              <ActivityIndicator style={styles.loader} color="#4FA5F5" />
            ) : results.length > 0 ? (
              results.map((item, index) => renderSearchResult(item, index))
            ) : searchTerm.length > 0 ? (
              <Text style={styles.noResults}>No products found</Text>
            ) : null}
          </ScrollView>
        </View>
      )}
      {!searchTerm && recentSearches.length > 0 && (
        <View style={styles.recentSearchesContainer}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Recent Searches</Text>
            <TouchableOpacity 
              onPress={clearRecentSearches}
              style={styles.clearAllButton}
            >
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            style={styles.recentList}
            showsVerticalScrollIndicator={false}
          >
            {recentSearches.map((search, index) => (
              <View
                key={index}
                style={styles.recentSearchItem}
              >
                <TouchableOpacity 
                  style={styles.recentSearchContent}
                  onPress={() => handleRecentSearchSelect(search)}
                >
                  <Ionicons name="time-outline" size={20} color="#A0AEC0" />
                  <Text style={styles.recentSearchText}>{search}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.removeSearchButton}
                  onPress={() => removeSearchItem(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#A0AEC0" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    position: 'relative',
    zIndex: 999,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dropdownContainer: {
    position: 'absolute',
    top: '100%',
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  resultsList: {
    maxHeight: 400,
  },
  resultsContent: {
    paddingVertical: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
    paddingVertical: 6,
    height: 40,
  },
  clearButton: {
    padding: 4,
  },
  loader: {
    padding: 20,
  },
  noResults: {
    padding: 16,
    textAlign: 'center',
    color: '#A0AEC0',
    fontSize: 15,
  },
  recentSearchesContainer: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recentList: {
    maxHeight: 200,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  recentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3748',
  },
  clearAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  clearAllText: {
    color: '#4FA5F5',
    fontSize: 14,
    fontWeight: '500',
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  recentSearchContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 40,
  },
  recentSearchText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#4A5568',
  },
  removeSearchButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  resultItem: {
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  resultButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F7FAFF',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  resultTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2D3748',
    marginBottom: 4,
  },
  resultPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4FA5F5',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#4A5568',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#A0AEC0',
    marginLeft: 4,
  },
});

export default SearchBar;
