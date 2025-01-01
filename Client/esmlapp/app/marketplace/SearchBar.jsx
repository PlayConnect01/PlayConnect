import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Image,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from "../../Api";
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const SearchBar = ({ onSelectProduct }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [categoryResults, setCategoryResults] = useState([]);
  const navigation = useNavigation();

  const animatedValue = new Animated.Value(0);
  const animatedItems = useRef([]).current;

  const getAnimatedValues = (index) => {
    if (!animatedItems[index]) {
      animatedItems[index] = {
        fadeAnim: new Animated.Value(0),
        translateY: new Animated.Value(20),
      };
    }
    return animatedItems[index];
  };

  const animateItem = (index) => {
    const { fadeAnim, translateY } = getAnimatedValues(index);
    fadeAnim.setValue(0);
    translateY.setValue(20);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    loadRecentSearches();
    fetchTrendingProducts();
  }, []);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  useEffect(() => {
    if (results.length > 0) {
      results.forEach((_, index) => {
        animateItem(index);
      });
    }
  }, [results]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.trim().length > 0) {
        Promise.all([
          fetchSearchResults(),
          fetchCategoryResults(),
        ]);
      } else {
        setResults([]);
        setCategoryResults([]);
        setDropdownVisible(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const loadRecentSearches = async () => {
    try {
      const searches = await AsyncStorage.getItem('recentSearches');
      if (searches) {
        setRecentSearches(JSON.parse(searches));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const saveRecentSearch = async (term) => {
    try {
      let searches = await AsyncStorage.getItem('recentSearches');
      searches = searches ? JSON.parse(searches) : [];
      
      // Remove if exists and add to front
      searches = searches.filter(s => s !== term);
      searches.unshift(term);
      
      // Keep only last 5 searches
      searches = searches.slice(0, 5);
      
      await AsyncStorage.setItem('recentSearches', JSON.stringify(searches));
      setRecentSearches(searches);
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  const fetchTrendingProducts = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/product/trending`);
      setTrendingProducts(response.data);
    } catch (error) {
      console.error("Error fetching trending products:", error);
    }
  };

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
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategoryResults = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/product/category-search`, {
        params: { query: searchTerm },
      });
      setCategoryResults(response.data);
    } catch (error) {
      console.error("Error fetching category results:", error);
      setCategoryResults([]);
    }
  };

  const handleSelectProduct = (product) => {
    onSelectProduct(product);
    saveRecentSearch(product.name);
    setSearchTerm("");
    setResults([]);
    setDropdownVisible(false);
    setIsFocused(false);
    navigation.navigate('ProductDetail', { 
      productId: product.product_id,
      productName: product.name 
    });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setDropdownVisible(true);
  };

  const renderSectionTitle = (title) => (
    <View style={styles.sectionTitleContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const renderRecentSearches = () => (
    recentSearches.length > 0 && (
      <View style={styles.section}>
        {renderSectionTitle('Recent Searches')}
        {recentSearches.map((term, index) => (
          <TouchableOpacity
            key={index}
            style={styles.recentSearchItem}
            onPress={() => setSearchTerm(term)}
          >
            <Ionicons name="time-outline" size={20} color="#6B7280" />
            <Text style={styles.recentSearchText}>{term}</Text>
          </TouchableOpacity>
        ))}
      </View>
    )
  );

  const renderTrendingProducts = () => (
    trendingProducts.length > 0 && (
      <View style={styles.section}>
        {renderSectionTitle('Trending Products')}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trendingScroll}>
          {trendingProducts.map((product) => (
            <TouchableOpacity
              key={product.product_id}
              style={styles.trendingItem}
              onPress={() => handleSelectProduct(product)}
            >
              <Image source={{ uri: product.image_url }} style={styles.trendingImage} />
              <Text style={styles.trendingName} numberOfLines={1}>{product.name}</Text>
              <Text style={styles.trendingPrice}>${product.price}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    )
  );

  const renderCategoryResults = () => (
    categoryResults.length > 0 && (
      <View style={styles.section}>
        {renderSectionTitle('Categories')}
        {categoryResults.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryItem}
            onPress={() => navigation.navigate('CategoryProducts', { categoryId: category.id })}
          >
            <Ionicons name="folder-outline" size={20} color="#6B7280" />
            <Text style={styles.categoryText}>{category.name}</Text>
            <Text style={styles.categoryCount}>{category.productCount} items</Text>
          </TouchableOpacity>
        ))}
      </View>
    )
  );

  const animatedStyles = {
    transform: [
      {
        scale: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.02],
        }),
      },
    ],
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
          style={[styles.searchInput, isFocused && styles.searchInputFocused]}
          value={searchTerm}
          onChangeText={setSearchTerm}
          onFocus={handleFocus}
          onBlur={() => {
            if (!searchTerm) {
              setDropdownVisible(false);
              setIsFocused(false);
            }
          }}
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setSearchTerm("");
              setResults([]);
            }}
          >
            <Text style={styles.clearButtonText}>×</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      {isDropdownVisible && (
        <View style={styles.dropdownWrapper}>
          <ScrollView 
            style={styles.dropdown}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.dropdownContentContainer}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#4F46E5" />
                <Text style={styles.loadingText}>Searching...</Text>
              </View>
            ) : searchTerm.length > 0 ? (
              <View>
                {renderCategoryResults()}
                {results.length > 0 ? (
                  <View>
                    {renderSectionTitle('Products')}
                    {results.map((item, index) => (
                      <Animated.View
                        key={item.product_id.toString()}
                        style={[
                          styles.resultItemContainer,
                          {
                            opacity: getAnimatedValues(index).fadeAnim,
                            transform: [{ translateY: getAnimatedValues(index).translateY }]
                          }
                        ]}
                      >
                        <TouchableOpacity
                          style={styles.resultItem}
                          onPress={() => handleSelectProduct(item)}
                          activeOpacity={0.7}
                        >
                          <Image
                            source={{ uri: item.image_url }}
                            style={styles.resultImage}
                          />
                          <View style={styles.textContainer}>
                            <Text style={styles.resultText} numberOfLines={2}>
                              {item.name}
                            </Text>
                            <View style={styles.detailsContainer}>
                              <View style={styles.ratingAndReviewContainer}>
                                <View style={styles.ratingContainer}>
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Ionicons
                                      key={star}
                                      name={star <= Math.floor(Number(item.rating || 0)) ? "star" : "star-outline"}
                                      size={16}
                                      color={star <= Math.floor(Number(item.rating || 0)) ? "#FBC02D" : "#CBD5E0"}
                                      style={styles.starIcon}
                                    />
                                  ))}
                                  <Text style={styles.ratingText}>
                                    {Number(item.rating || 0).toFixed(1)}
                                  </Text>
                                </View>
                                <Text style={styles.reviewCount}>
                                  ({Number(item.rating_count || 0)} reviews)
                                </Text>
                              </View>
                              <View style={styles.priceSection}>
                                <View style={styles.priceContainer}>
                                  {item.original_price && Number(item.original_price) > Number(item.price) && (
                                    <Text style={styles.originalPrice}>
                                      ${Number(item.original_price || 0).toFixed(2)}
                                    </Text>
                                  )}
                                  <Text style={styles.priceText}>
                                    ${Number(item.price || 0).toFixed(2)}
                                  </Text>
                                </View>
                                {item.original_price && Number(item.original_price) > Number(item.price) && (
                                  <View style={styles.discountBadge}>
                                    <Text style={styles.discountText}>
                                      {Math.round(((Number(item.original_price) - Number(item.price)) / Number(item.original_price)) * 100)}% OFF
                                    </Text>
                                  </View>
                                )}
                              </View>
                              {item.stock_status && (
                                <Text style={[
                                  styles.stockStatus,
                                  { color: item.stock_status === 'In Stock' ? '#059669' : '#DC2626' }
                                ]}>
                                  {item.stock_status}
                                </Text>
                              )}
                              {item.description && (
                                <Text style={styles.description} numberOfLines={2}>
                                  {item.description}
                                </Text>
                              )}
                            </View>
                          </View>
                        </TouchableOpacity>
                      </Animated.View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.noResultsContainer}>
                    <Text style={styles.noResultsText}>No results found</Text>
                    <Text style={styles.noResultsSubText}>Try a different search term</Text>
                  </View>
                )}
              </View>
            ) : (
              <View>
                {renderRecentSearches()}
                {renderTrendingProducts()}
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 20,
    zIndex: 1000,
  },
  searchContainer: {
    position: "relative",
    zIndex: 1001,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    shadowColor: "#4FA5F5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 15,
    transform: [{ scale: 1 }],
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  searchInput: {
    height: 56,
    paddingHorizontal: 24,
    paddingRight: 48,
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  searchInputFocused: {
    borderColor: "#4FA5F5",
    backgroundColor: "#F8FAFF",
    transform: [{ scale: 1.01 }],
  },
  dropdownWrapper: {
    position: 'absolute',
    top: 65,
    left: 0,
    right: 0,
    zIndex: 1002,
  },
  dropdown: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    borderWidth: 1,
    borderColor: "#EEF2FF",
    maxHeight: 300,
  },
  dropdownContentContainer: {
    paddingVertical: 8,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#F8FAFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2FF",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4F46E5",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  resultsList: {
    flex: 1,
  },
  resultsContentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultItemContainer: {
    marginVertical: 6,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EEF2FF",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  resultImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#F8FAFF',
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
    gap: 4,
  },
  resultText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 20,
  },
  detailsContainer: {
    gap: 6,
  },
  ratingAndReviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  starIcon: {
    marginRight: 2,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F46E5',
  },
  reviewCount: {
    fontSize: 13,
    color: '#6B7280',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  originalPrice: {
    fontSize: 13,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4F46E5',
  },
  discountBadge: {
    backgroundColor: '#FDF2F8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FBCFE8',
  },
  discountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EC4899',
  },
  stockStatus: {
    fontSize: 13,
    fontWeight: '500',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 6,
    lineHeight: 18,
  },
  loadingContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#4F46E5",
    fontWeight: "500",
  },
  noResultsContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  noResultsText: {
    fontSize: 16,
    color: "#4F46E5",
    fontWeight: "600",
    marginBottom: 8,
  },
  noResultsSubText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: 'center',
    lineHeight: 20,
  },
  clearButton: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: [{ translateY: -12 }],
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1003,
  },
  clearButtonText: {
    color: "#4F46E5",
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 22,
  },
  separator: {
    height: 1,
    backgroundColor: "#EEF2FF",
    marginVertical: 6,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: "#EEF2FF",
  },
  recentSearchText: {
    marginLeft: 12,
    fontSize: 15,
    color: "#4F46E5",
    fontWeight: "500",
  },
  trendingScroll: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  trendingItem: {
    width: 140,
    marginHorizontal: 6,
    padding: 12,
    alignItems: 'center',
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EEF2FF",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  trendingImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#F8FAFF',
  },
  trendingName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: 'center',
    marginBottom: 6,
  },
  trendingPrice: {
    fontSize: 14,
    color: "#4F46E5",
    fontWeight: "700",
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: "#EEF2FF",
  },
  categoryText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "500",
  },
  categoryCount: {
    fontSize: 13,
    color: "#4F46E5",
    fontWeight: "600",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  resultsContainer: {
    maxHeight: 380,
  },
  suggestionsContainer: {
    maxHeight: 380,
  },
});

export default SearchBar;
