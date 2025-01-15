import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useNavigation
} from "@react-navigation/native";
import axios from "axios";
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SearchBar from './SearchBar';
import Sidebar from './Sidebar';
import { BASE_URL } from "../../Api";
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const getStyles = (isSidebarVisible, isDarkMode) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: isDarkMode ? '#121212' : '#F7FAFF',
    paddingBottom: 16,
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: isDarkMode ? '#121212' : '#F7FAFF',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: isDarkMode ? '#121212' : '#FFFFFF',
    paddingBottom: 24,
  },
  header: {
    backgroundColor: isDarkMode ? '#2A2A2A' : 'rgba(255, 255, 255, 0.98)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? '#333' : 'rgba(79, 165, 245, 0.1)',
    shadowColor: isDarkMode ? '#333' : '#4FA5F5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: isDarkMode ? '#333' : '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: isDarkMode ? '#333' : '#4FA5F5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: isDarkMode ? '#FFFFFF' : '#4FA5F5',
    letterSpacing: 0.5,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(79, 165, 245, 0.04)',
    padding: 6,
    borderRadius: 14,
  },
  iconButton: {
    position: 'relative',
    padding: 8,
    backgroundColor: isDarkMode ? '#333' : '#FFFFFF',
    borderRadius: 12,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: isDarkMode ? '#333' : '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: isDarkMode ? '#FF4B4B' : '#FF4B4B',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: isDarkMode ? '#333' : '#FFFFFF',
  },
  cartBadgeText: {
    color: isDarkMode ? '#FFFFFF' : '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: isDarkMode ? '#FFFFFF' : '#2D3748',
    marginVertical: 20,
    paddingHorizontal: 4,
  },
  collectionDescription: {
    fontSize: 16,
    color: isDarkMode ? '#BDC3C7' : '#555',
    marginVertical: 10,
    paddingHorizontal: 4,
    textAlign: 'center',
  },
  collectionFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  collectionFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  collectionFeatureText: {
    fontSize: 14,
    color: isDarkMode ? '#BDC3C7' : '#333',
    marginLeft: 6,
  },
  productContainer: {
    position: 'relative',
    width: '100%',
    height: 500,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    overflow: 'hidden',
  },
  card: {
    width: '70%',
    height: 'auto',
    backgroundColor: isDarkMode ? '#333' : '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    padding: 10,
    marginVertical: 10,
    alignItems: 'center',
  },
  cardImageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  badgeContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
  },
  badgeNew: {
    backgroundColor: isDarkMode ? '#4FA5F5' : '#4FA5F5',
    borderRadius: 4,
    padding: 4,
    marginRight: 8,
  },
  badgeBestSeller: {
    backgroundColor: isDarkMode ? '#FF4B4B' : '#FF4B4B',
    borderRadius: 4,
    padding: 4,
  },
  badgeText: {
    fontSize: 12,
    color: isDarkMode ? '#FFFFFF' : '#FFFFFF',
    fontWeight: '600',
  },
  cardContentOverlay: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: isDarkMode ? '#FFFFFF' : '#333',
    textAlign: 'center',
    marginVertical: 4,
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: isDarkMode ? '#FFFFFF' : '#333',
    textAlign: 'center',
    marginVertical: 4,
  },
  stockStatus: {
    fontSize: 14,
    color: isDarkMode ? '#BDC3C7' : '#333',
    textAlign: 'center',
    marginVertical: 4,
  },
  quickViewButton: {
    backgroundColor: isDarkMode ? '#4FA5F5' : '#4FA5F5',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    height: 40,
    elevation: 2,
    marginVertical: 8,
  },
  quickViewText: {
    fontSize: 14,
    color: isDarkMode ? '#FFFFFF' : '#FFFFFF',
    fontWeight: '600',
  },
  cardRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.15)',
    padding: 12,
    borderRadius: 16,
    marginTop: 16,
  },
  ratingText: {
    color: isDarkMode ? '#FFFFFF' : '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: isDarkMode ? '#BDC3C7' : '#BDC3C7',
    marginLeft: 8,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 8,
    marginBottom: 8,
  },
  favoriteButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: isDarkMode ? '#333' : '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  favoriteButtonActive: {
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.9)',
  },
  cartButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: isDarkMode ? '#4FA5F5' : '#4FA5F5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: isDarkMode ? '#4FA5F5' : '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  cartButtonSuccess: {
    backgroundColor: isDarkMode ? '#48BB78' : '#48BB78',
  },
  cartButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartAnimation: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -25 }],
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: isDarkMode ? '#333' : '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: isDarkMode ? '#333' : '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  navButtonLeft: {
    left: 16,
  },
  navButtonRight: {
    right: 16,
  },
  discountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? '#333' : '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: isDarkMode ? '#333' : '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  discountImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: isDarkMode ? '#444' : '#F0F0F0',
  },
  discountInfo: {
    flex: 1,
    marginLeft: 12,
  },
  discountTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: isDarkMode ? '#FFFFFF' : '#333',
    marginBottom: 4,
  },
  discountPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: isDarkMode ? '#FF4B4B' : '#FF4B4B',
  },
  discountOldPrice: {
    fontSize: 14,
    color: isDarkMode ? '#BDC3C7' : '#A0AEC0',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  discountSavings: {
    fontSize: 12,
    color: isDarkMode ? '#48BB78' : '#48BB78',
    fontWeight: '500',
    marginTop: 2,
  },
  discountCartButton: {
    backgroundColor: isDarkMode ? '#4FA5F5' : '#4FA5F5',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    height: 40,
    elevation: 2,
    marginLeft: 8,
  },
  discountDescription: {
    fontSize: 12,
    color: isDarkMode ? '#BDC3C7' : '#718096',
    marginTop: 2,
  },
  discountFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  discountFeature: {
    backgroundColor: isDarkMode ? 'rgba(79, 165, 245, 0.1)' : 'rgba(79, 165, 245, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 2,
  },
  discountFeatureText: {
    color: isDarkMode ? '#4FA5F5' : '#4FA5F5',
    fontSize: 10,
    fontWeight: '500',
  },
  viewAllButtonInline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? '#4FA5F5' : '#4FA5F5',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    justifyContent: 'center',
    elevation: 2,
  },
  viewAllTextInline: {
    color: isDarkMode ? '#FFFFFF' : '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
  notificationContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: isDarkMode ? 'rgba(79, 165, 245, 0.95)' : 'rgba(79, 165, 245, 0.95)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: isDarkMode ? '#4FA5F5' : '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
    marginBottom: 24,
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIcon: {
    marginRight: 12,
  },
  notificationText: {
    color: isDarkMode ? '#FFFFFF' : '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  notificationSuccess: {
    backgroundColor: isDarkMode ? 'rgba(72, 187, 120, 0.95)' : 'rgba(72, 187, 120, 0.95)',
  },
  notificationError: {
    backgroundColor: isDarkMode ? 'rgba(245, 101, 101, 0.95)' : 'rgba(245, 101, 101, 0.95)',
  },
  notificationWarning: {
    backgroundColor: isDarkMode ? 'rgba(246, 173, 85, 0.95)' : 'rgba(246, 173, 85, 0.95)',
  },
  swipeHint: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeHintText: {
    fontSize: 14,
    color: isDarkMode ? '#FFFFFF' : '#FFFFFF',
    marginRight: 8,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  specialOffersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  specialOffersTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: isDarkMode ? '#FFFFFF' : '#2D3748',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.5)',
  },
  exploreButton: {
    backgroundColor: isDarkMode ? '#4FA5F5' : '#4FA5F5',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    shadowColor: isDarkMode ? '#4FA5F5' : '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  exploreButtonText: {
    color: isDarkMode ? '#FFFFFF' : '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tooltipContainer: {
    position: 'absolute',
    backgroundColor: isDarkMode ? 'rgba(79, 165, 245, 0.98)' : 'rgba(79, 165, 245, 0.98)',
    padding: 16,
    borderRadius: 16,
    maxWidth: 250,
    shadowColor: isDarkMode ? '#4FA5F5' : '#4FA5F5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
    backdropFilter: 'blur(8px)',
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.2)',
  },
  tooltipText: {
    color: isDarkMode ? '#FFFFFF' : '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '500',
    textShadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  tooltipArrow: {
    position: 'absolute',
    width: 20,
    height: 10,
    backgroundColor: isDarkMode ? 'rgba(79, 165, 245, 0.98)' : 'rgba(79, 165, 245, 0.98)',
    transform: [{ rotate: '45deg' }],
    top: -5,
    left: '50%',
    marginLeft: -10,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.2)',
  },
  welcomeBannerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: isDarkMode ? 'rgba(79, 165, 245, 0.98)' : 'rgba(79, 165, 245, 0.98)',
    paddingVertical: 20,
    paddingHorizontal: 24,
    zIndex: 100,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: isDarkMode ? '#4FA5F5' : '#4FA5F5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 12,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.2)',
    borderTopWidth: 0,
  },
  welcomeBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcomeBannerText: {
    color: isDarkMode ? '#FFFFFF' : '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textShadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.5,
  },
  welcomeBannerIcon: {
    marginRight: 16,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    borderRadius: 50,
    shadowColor: isDarkMode ? '#000' : '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  welcomeBannerClose: {
    padding: 8,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.2)',
    borderRadius: 30,
    marginLeft: 16,
  },
  guideOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.8)',
    zIndex: 999,
    backdropFilter: 'blur(4px)',
  },
  guideSpotlight: {
    position: 'absolute',
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.1)',
    borderRadius: 100,
    zIndex: 1000,
    borderWidth: 2,
    borderColor: isDarkMode ? '#4FA5F5' : '#4FA5F5',
    shadowColor: isDarkMode ? '#4FA5F5' : '#4FA5F5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  guideText: {
    color: isDarkMode ? '#FFFFFF' : '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 16,
    lineHeight: 24,
    textShadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  guideButton: {
    backgroundColor: isDarkMode ? '#4FA5F5' : '#4FA5F5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 16,
    shadowColor: isDarkMode ? '#4FA5F5' : '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.3)',
  },
  guideButtonText: {
    color: isDarkMode ? '#FFFFFF' : '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  guideProgress: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  guideProgressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.3)',
  },
  guideProgressDotActive: {
    backgroundColor: isDarkMode ? '#4FA5F5' : '#4FA5F5',
    width: 24,
  },
  pulseAnimation: {
    position: 'absolute',
    borderRadius: 100,
  },
  tooltipIcon: {
    marginRight: 8,
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 'auto',
    marginBottom: 20,
  },
  darkThemeToggle: {
    backgroundColor: '#2A2A2A',
  },
  lightThemeToggle: {
    backgroundColor: '#F0F0F0',
  },
  themeToggleText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  darkText: {
    color: '#FFFFFF',
  },
  lightText: {
    color: '#000000',
  },
});

const Marketplace = () => {
  const navigation = useNavigation();   
  const { isDarkMode, toggleTheme } = useTheme();
  const [products, setProducts] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [cartProducts, setCartProducts] = useState([]);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [addingToCartId, setAddingToCartId] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const [currentGuideStep, setCurrentGuideStep] = useState(0);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);

  const styles = getStyles(isSidebarVisible, isDarkMode);
  
  // Animation refs
  const notificationTimeout = useRef(null);
  const animationValues = useRef({
    scale: new Animated.Value(1),
    success: new Animated.Value(0)
  }).current;
  const bannerAnimation = useRef(new Animated.Value(0)).current;
  const spotlightPosition = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const guideSteps = [
    {
      target: 'search',
      text: 'Search for your favorite products here',
      icon: 'magnify',
      position: { top: 60, left: 20 }
    },
    {
      target: 'categories',
      text: 'Browse through different categories',
      icon: 'view-grid',
      position: { top: 120, left: 20 }
    },
    {
      target: 'cart',
      text: 'View your shopping cart',
      icon: 'cart',
      position: { top: 60, right: 20 }
    }
  ];

  const renderWelcomeBanner = () => {
    if (!showWelcomeBanner) return null;

    return (
      <Animated.View
        style={[
          styles.welcomeBannerContainer,
          {
            transform: [
              {
                translateY: bannerAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-200, 0]
                })
              }
            ],
            opacity: bannerAnimation
          }
        ]}
      >
        <View style={styles.welcomeBannerContent}>
          <Animated.View
            style={[
              styles.welcomeBannerIcon,
              {
                transform: [
                  {
                    scale: scaleAnim
                  },
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg']
                    })
                  }
                ]
              }
            ]}
          >
            <MaterialCommunityIcons
              name="shopping-outline"
              size={28}
              color="#FFFFFF"
            />
          </Animated.View>

          <Animated.Text 
            style={[
              styles.welcomeBannerText,
              {
                transform: [
                  {
                    translateX: bannerAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0]
                    })
                  }
                ]
              }
            ]}
          >
            Welcome to sportsmate Marketplace! 🎉
          </Animated.Text>

          <TouchableOpacity
            style={styles.welcomeBannerClose}
            onPress={() => {
              Animated.parallel([
                Animated.timing(bannerAnimation, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                  easing: Easing.out(Easing.ease)
                }),
                Animated.timing(scaleAnim, {
                  toValue: 0,
                  duration: 200,
                  useNativeDriver: true
                })
              ]).start(() => setShowWelcomeBanner(false));
            }}
          >
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '180deg']
                    })
                  }
                ]
              }}
            >
              <MaterialCommunityIcons 
                name="close" 
                size={20} 
                color="#FFFFFF" 
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const animateWelcomeBanner = () => {
    Animated.sequence([
      Animated.spring(bannerAnimation, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true
      }),
      Animated.delay(3000),
      Animated.timing(bannerAnimation, {
        toValue: 0,
        duration: 800,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true
      })
    ]).start(() => setShowWelcomeBanner(false));
  };

  useEffect(() => {
    const checkFirstVisit = async () => {
      try {
        const hasVisited = await AsyncStorage.getItem('hasVisitedMarketplace');
        if (!hasVisited) {
          setShowGuide(true);
          await AsyncStorage.setItem('hasVisitedMarketplace', 'true');
          animateWelcomeBanner();
        }
      } catch (error) {
        console.error('Error checking first visit:', error);
      }
    };

    checkFirstVisit();
  }, []);

  useEffect(() => {
    if (showGuide) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1500,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease)
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease)
          })
        ])
      ).start();

      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
          easing: Easing.linear
        })
      ).start();

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.back)
      }).start();
    }

    return () => {
      pulseAnim.setValue(1);
      rotateAnim.setValue(0);
      fadeAnim.setValue(0);
    };
  }, [showGuide, pulseAnim, rotateAnim, fadeAnim]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const [allProductsResponse, topDiscountedResponse] = await Promise.all([
        axios.get(`${BASE_URL}/product/discounted`),
        axios.get(`${BASE_URL}/product/discounted/top-three`),
      ]);
      setProducts(allProductsResponse.data);
      setDiscounts(topDiscountedResponse.data);
    } catch (error) {
      // Don't show error for empty favorites
      if (error.response?.status === 404 && error.config?.url.includes('favorites')) {
        return;
      }
      console.error("Error fetching products:", {
        message: error.message,
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data
      });
      setNotification({ message: "Failed to load products. Please try again.", type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCartCount = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userDataStr = await AsyncStorage.getItem('userData');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const userId = userData?.user_id;

      if (token && userId) {
        const response = await axios.get(`${BASE_URL}/cart/count/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartCount(response.data.count);
        setCartProducts(response.data.products || []);
      } else {
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
      setNotification({ message: "Failed to load cart count. Please try again.", type: 'error' });
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCartCount();
  }, [fetchProducts, fetchCartCount]);

  useEffect(() => {
    return () => {
      if (notificationTimeout.current) {
        clearTimeout(notificationTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userDataStr = await AsyncStorage.getItem('userData');
        const userData = userDataStr ? JSON.parse(userDataStr) : null;
        const userId = userData?.user_id;

        if (token && userId) {
          try {
            const response = await axios.get(`${BASE_URL}/favorites/favorites/${userId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data) {
              const favoriteIds = response.data.map(fav => fav.product_id);
              setFavoriteProducts(favoriteIds);
            }
          } catch (error) {
            // Handle 404 gracefully - user might not have any favorites yet
            if (error.response?.status === 404) {
              console.log('No favorites found for user');
              setFavoriteProducts([]);
            } else {
              console.error("Error loading favorites:", error);
              showNotification("Failed to load favorites", "error");
            }
          }
        } else {
          // User not logged in - this is normal, just set empty favorites
          setFavoriteProducts([]);
        }
      } catch (error) {
        console.error("Error in loadFavorites:", error);
        showNotification("Error loading favorites", "error");
      }
    };

    loadFavorites();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([fetchProducts(), fetchCartCount()]).then(() =>
      setRefreshing(false)
    );
  }, [fetchProducts, fetchCartCount]);

  const showNotification = (message, type = 'info', duration = 2000) => {
    if (notificationTimeout.current) {
      clearTimeout(notificationTimeout.current);
    }
    
    setNotification({ message, type });
    notificationTimeout.current = setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, duration);
  };

  const animateCartButton = (productId) => {
    setAddingToCartId(productId);
    Animated.sequence([
      Animated.spring(animationValues.scale, {
        toValue: 0.8,
        useNativeDriver: true,
        duration: 100
      }),
      Animated.spring(animationValues.scale, {
        toValue: 1,
        useNativeDriver: true,
        duration: 100
      }),
      Animated.timing(animationValues.success, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();

    // Reset after animation
    setTimeout(() => {
      Animated.timing(animationValues.success, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }).start(() => {
        setAddingToCartId(null);
      });
    }, 1500);
  };

  const addToCart = useCallback(async (product) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userDataStr = await AsyncStorage.getItem('userData');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const userId = userData?.user_id;
      
      if (!token || !userId) {
        showNotification("Please login to add items to cart", "warning");
        navigation.navigate('Login');
        return;
      }

      if (!product?.product_id) {
        showNotification("Invalid product", "error");
        return;
      }

      if (cartProducts.some(item => item.product_id === product.product_id)) {
        showNotification("Product already in cart!", "warning");
        navigation.navigate('Cart');
        return;
      }

      animateCartButton(product.product_id);

      const response = await axios.post(
        `${BASE_URL}/cart/cart/add`,
        {
          userId: parseInt(userId),
          productId: product.product_id,
          quantity: 1,
          price: product.price,
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      if (response.status === 201) {
        const productWithQuantity = {
          ...product,
          quantity: 1
        };
        setCartProducts(prev => [...prev, productWithQuantity]);
        setCartCount(prevCount => prevCount + 1);
        showNotification(`${product.name} added to cart! 🛒`, "success");
        
        // Update local storage
        const existingCart = await AsyncStorage.getItem('cartProducts');
        const cartProductsList = existingCart ? JSON.parse(existingCart) : [];
        cartProductsList.push(productWithQuantity);
        await AsyncStorage.setItem('cartProducts', JSON.stringify(cartProductsList));
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
      showNotification(error.response?.data?.message || "Error adding to cart", "error");
      setAddingToCartId(null);
    }
  }, [cartProducts, navigation, showNotification]);

  const calculateDiscountedPrice = useCallback((price, discount) => {
    const originalPrice = parseFloat(price);
    const discountValue = parseFloat(discount);
    return isNaN(originalPrice) || isNaN(discountValue)
      ? 0
      : originalPrice - originalPrice * (discountValue / 100);
  }, []);

  const handleSelectCategory = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  const toggleFavorite = useCallback(async (product) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userDataStr = await AsyncStorage.getItem('userData');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const userId = userData?.user_id;

      if (!token || !userId) {
        showNotification("Please login to manage favorites", "warning");
        navigation.navigate('Login'); 
        return;
      }

      const isAlreadyFavorite = favoriteProducts.includes(product.product_id);

      if (isAlreadyFavorite) {
        // First get the favorite_id
        const favoritesResponse = await axios.get(
          `${BASE_URL}/favorites/favorites/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        const favorite = favoritesResponse.data.find(fav => fav.product_id === product.product_id);
        
        if (!favorite) {
          showNotification("Could not find favorite to remove", "error");
          return;
        }

        // Remove from favorites using favorite_id
        await axios.delete(
          `${BASE_URL}/favorites/favorites/item/${favorite.favorite_id}`,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        setFavoriteProducts(prev => prev.filter(id => id !== product.product_id));
        showNotification("Removed from favorites ❌", "success");
      } else {
        // Add to favorites
        await axios.post(
          `${BASE_URL}/favorites/favorites/add`,
          {
            userId: parseInt(userId),
            productId: product.product_id
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        setFavoriteProducts(prev => [...prev, product.product_id]);
        showNotification("Added to favorites ❤️", "success");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      if (error.response?.status === 401) {
        showNotification("Please login to manage favorites", "warning");
        navigation.navigate('Login'); 
      } else {
        showNotification(error.response?.data?.message || "Failed to update favorites", "error");
      }
    }
  }, [favoriteProducts, navigation, showNotification]);

  const showNextProduct = () => {
    setCurrentProductIndex((prevIndex) =>
      prevIndex < products.length - 1 ? prevIndex + 1 : 0
    );
  };

  const showPreviousProduct = () => {
    setCurrentProductIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : products.length - 1
    );
  };

  const currentProduct = products[currentProductIndex];

  const showQuickView = (product) => {
    navigation.navigate('ProductDetail', { 
      productId: product.product_id, 
      productName: product.name 
    }); 
  };

  const renderGuide = () => {
    if (!showGuide) return null;

    const currentStep = guideSteps[currentGuideStep];
    const spotlightSize = 80;

    return (
      <Animated.View 
        style={[
          styles.guideOverlay,
          { opacity: fadeAnim }
        ]}
      >
        {/* Pulse effect */}
        <Animated.View
          style={[
            styles.pulseAnimation,
            {
              ...currentStep.position,
              width: spotlightSize * 1.5,
              height: spotlightSize * 1.5,
              backgroundColor: isDarkMode ? 'rgba(79, 165, 245, 0.2)' : 'rgba(79, 165, 245, 0.2)',
              transform: [{ scale: pulseAnim }]
            }
          ]}
        />
        
        {/* Main spotlight */}
        <Animated.View
          style={[
            styles.guideSpotlight,
            {
              width: spotlightSize,
              height: spotlightSize,
              ...currentStep.position,
              transform: [
                {
                  scale: spotlightPosition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1]
                  })
                }
              ]
            }
          ]}
        />

        {/* Tooltip */}
        <View style={[styles.tooltipContainer, currentStep.position]}>
          <Animated.View
            style={[
              styles.tooltipIcon,
              {
                transform: [
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg']
                    })
                  }
                ]
              }
            ]}
          >
            <MaterialCommunityIcons
              name={currentStep.icon}
              size={24}
              color="#FFFFFF"
            />
          </Animated.View>

          <Text style={styles.tooltipText}>{currentStep.text}</Text>

          {/* Progress dots */}
          <View style={styles.guideProgress}>
            {guideSteps.map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.guideProgressDot,
                  currentGuideStep === index && styles.guideProgressDotActive,
                  {
                    transform: [
                      {
                        scale: currentGuideStep === index ? pulseAnim : 1
                      }
                    ]
                  }
                ]}
              />
            ))}
          </View>

          {/* Navigation button */}
          <TouchableOpacity
            style={styles.guideButton}
            onPress={() => {
              if (currentGuideStep < guideSteps.length - 1) {
                // Next step animation
                Animated.sequence([
                  Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true
                  }),
                  Animated.timing(spotlightPosition, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true
                  })
                ]).start(() => {
                  setCurrentGuideStep(currentGuideStep + 1);
                  Animated.parallel([
                    Animated.timing(fadeAnim, {
                      toValue: 1,
                      duration: 300,
                      useNativeDriver: true
                    }),
                    Animated.spring(spotlightPosition, {
                      toValue: 1,
                      tension: 50,
                      friction: 7,
                      useNativeDriver: true
                    })
                  ]).start();
                });
              } else {
                // Exit animation
                Animated.parallel([
                  Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true
                  }),
                  Animated.timing(spotlightPosition, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true
                  })
                ]).start(() => setShowGuide(false));
              }
            }}
          >
            <Text style={styles.guideButtonText}>
              {currentGuideStep < guideSteps.length - 1 ? 'Next' : 'Got it!'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderWelcomeBanner()}
      {renderGuide()}
      <View style={styles.mainContainer}>
        {isSidebarVisible && (
          <View style={styles.sidebar}>
            <TouchableOpacity 
              style={[styles.themeToggle, isDarkMode ? styles.darkThemeToggle : styles.lightThemeToggle]} 
              onPress={toggleTheme}
            >
              <MaterialIcons 
                name={isDarkMode ? 'light-mode' : 'dark-mode'} 
                size={24} 
                color={isDarkMode ? '#FFFFFF' : '#000000'} 
              />
              <Text style={[styles.themeToggleText, isDarkMode ? styles.darkText : styles.lightText]}>
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </Text>
            </TouchableOpacity>
            <Sidebar onSelectCategory={handleSelectCategory} isDarkMode={isDarkMode} />
          </View>
        )}
        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
                <FontAwesome name={isSidebarVisible ? "times" : "bars"} size={20} color="#333" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Marketplace</Text>
              <View style={styles.headerIcons}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Cart')}
                  style={styles.iconButton}
                >
                  <FontAwesome name="shopping-cart" size={20} color="#333" />
                  {cartCount > 0 && (
                    <View style={styles.cartBadge}>
                      <Text style={styles.cartBadgeText}>{cartCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => navigation.navigate('Favorites')}
                >
                  <FontAwesome name="heart-o" size={20} color="#333" />   
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
            bounces={true}
            overScrollMode="always"
          >
            <SearchBar onSelectProduct={() => {}} />
            <Text style={styles.sectionTitle}>Some of Our Collection</Text>
           
            {currentProduct && (
              <View style={styles.productContainer}>
                <TouchableOpacity style={[styles.navButton, styles.navButtonLeft]} onPress={showPreviousProduct}>
                  <FontAwesome name="chevron-left" size={24} color="#4FA5F5" />
                </TouchableOpacity>
                
                <View style={styles.card}>
                  <View style={styles.badgeContainer}>
                    {currentProduct.isNew && (
                      <View style={styles.badgeNew}>
                        <Text style={styles.badgeText}>New Arrival</Text>
                      </View>
                    )}
                    {currentProduct.isBestSeller && (
                      <View style={styles.badgeBestSeller}>
                        <Text style={styles.badgeText}>Best Seller</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.cardImageContainer}>
                    <Image
                      source={{ uri: currentProduct.image_url }}
                      style={styles.cardImage}
                    />
                  </View>
                  
                  <View style={styles.cardContentOverlay}>
                    <Text style={styles.cardTitle}>{currentProduct.name}</Text>
                    <Text style={styles.cardPrice}>${currentProduct.price}</Text>
                    <Text style={styles.stockStatus}>{currentProduct.stockStatus}</Text>
                    <TouchableOpacity style={styles.quickViewButton} onPress={() => showQuickView(currentProduct)}>
                      <Text style={styles.quickViewText}>Quick View</Text>
                    </TouchableOpacity>

                    <View style={styles.cardRatingContainer}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FontAwesome
                          key={`star-${star}`}
                          name={star <= currentProduct.rating ? "star" : "star-o"}
                          size={20}
                          color={star <= currentProduct.rating ? "#FFD700" : "#BDC3C7"}
                          style={{ marginHorizontal: 2 }}
                        />
                      ))}
                      <Text style={styles.ratingText}>{currentProduct.rating.toFixed(1)}</Text>
                      <Text style={styles.reviewCount}>({currentProduct.reviewCount} reviews)</Text>
                    </View>
                    
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={[
                          styles.favoriteButton,
                          favoriteProducts.includes(currentProduct.product_id) && styles.favoriteButtonActive
                        ]}
                        onPress={() => toggleFavorite(currentProduct)}
                      >
                        <Ionicons
                          name={favoriteProducts.includes(currentProduct.product_id) ? "heart" : "heart-dislike"} 
                          size={24} 
                          color={favoriteProducts.includes(currentProduct.product_id) ? "#FF4B4B" : "#4FA5F5"} 
                        />
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[
                          styles.cartButton,
                          addingToCartId === currentProduct.product_id && styles.cartButtonSuccess
                        ]} 
                        onPress={() => addToCart(currentProduct)}
                        disabled={addingToCartId === currentProduct.product_id}
                      >
                        <Animated.View 
                          style={[
                            styles.cartButtonContent,
                            {
                              transform: [
                                { 
                                  scale: addingToCartId === currentProduct.product_id ? 
                                    animationValues.scale : 1 
                                }
                              ]
                            }
                          ]}
                        >
                          {addingToCartId === currentProduct.product_id ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <FontAwesome name="shopping-cart" size={24} color="#FFFFFF" />
                        )}
                        </Animated.View>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                
                <TouchableOpacity style={[styles.navButton, styles.navButtonRight]} onPress={showNextProduct}>
                  <FontAwesome name="chevron-right" size={24} color="#4FA5F5" />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.specialOffersHeader}>
              <Text style={styles.specialOffersTitle}>Special Offers</Text>
              <TouchableOpacity
                style={styles.viewAllButtonInline}
                onPress={() => navigation.navigate('AllDiscountedProducts')}
              >
                <Text style={styles.viewAllTextInline}>View All Offers</Text>
                <FontAwesome name="arrow-right" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            {discounts.map((discount) => {
              const discountedPrice = calculateDiscountedPrice(
                discount.price,
                discount.discount
              );
              const savings = discount.price - discountedPrice;
              return (
                <TouchableOpacity
                  key={discount.product_id}
                  style={styles.discountItem}
                  onPress={() => navigation.navigate('ProductDetail', {
                    productId: discount.product_id,
                    product: {
                      id: discount.product_id,
                      name: discount.name,
                      image_url: discount.image_url,
                      price: discountedPrice.toFixed(2),
                      oldPrice: discount.price,
                      description: discount.description || 'Experience premium quality and exceptional value with this exclusive offer.',
                      discount: discount.discount
                    }
                  })}
                >
                  <View style={styles.discountImageContainer}>
                    <Image
                      source={{ uri: discount.image_url }}
                      style={styles.discountImage}
                    />
                  </View>
                  <View style={styles.discountInfo}>
                    <Text style={styles.discountTitle}>{discount.name}</Text>
                    <View style={styles.discountPriceContainer}>
                      <Text style={styles.discountPrice}>
                        ${discountedPrice.toFixed(2)}
                      </Text>
                      <Text style={styles.discountOldPrice}>
                        ${discount.price}
                      </Text>
                    </View>
                    <Text style={styles.discountSavings}>
                      You save: ${savings.toFixed(2)} ({discount.discount}% OFF)
                    </Text>
                    <View style={styles.discountFeatures}>
                      <View style={styles.discountFeature}>
                        <Text style={styles.discountFeatureText}>Free Shipping</Text>
                      </View>
                      <View style={styles.discountFeature}>
                        <Text style={styles.discountFeatureText}>30-Day Return</Text>
                      </View>
                      <View style={styles.discountFeature}>
                        <Text style={styles.discountFeatureText}>Warranty Included</Text>
                      </View>
                    </View>
                    <Text style={styles.discountDescription} numberOfLines={2}>
                      {discount.description || 'Experience premium quality and exceptional value with this exclusive offer.'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.discountCartButton,
                      addingToCartId === discount.product_id && styles.discountCartButtonSuccess
                    ]}
                    onPress={() => addToCart(discount)}
                    disabled={addingToCartId === discount.product_id}
                  >
                    <Animated.View 
                      style={[
                        styles.cartButtonContent,
                        {
                          transform: [
                            { 
                              scale: addingToCartId === discount.product_id ? 
                                animationValues.scale : 1 
                            }
                          ]
                        }
                      ]}
                    >
                      {addingToCartId === discount.product_id ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <FontAwesome name="shopping-cart" size={20} color="#FFFFFF" />
                      )}
                    </Animated.View>
                  </TouchableOpacity>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountBadgeText}>{discount.discount}%</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6e3de8" />
      </View>
          )}

      {notification.message && (
            <Animated.View style={[
              styles.notificationContainer,
              notification.type === 'success' && styles.notificationSuccess,
              notification.type === 'error' && styles.notificationError,
              notification.type === 'warning' && styles.notificationWarning,
            ]}>
          <View style={styles.notificationContent}>
            <FontAwesome
              name={
                notification.type === 'success' ? 'check-circle' :
                notification.type === 'error' ? 'times-circle' :
                notification.type === 'warning' ? 'exclamation-circle' : 'info-circle'
              }
              size={24}
              color="#FFFFFF"
              style={styles.notificationIcon}
            />
            <Text style={styles.notificationText}>{notification.message}</Text>
          </View>
            </Animated.View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Marketplace;