import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getStyles } from './styles/MarketplaceStyles';

const SpecialOffers = ({ 
  discounts, 
  addToCart, 
  showQuickView, 
  isDarkMode 
}) => {
  const styles = getStyles(false, isDarkMode);

  if (!discounts || discounts.length === 0) return null;

  return (
    <View style={styles.specialOffersSection}>
      <View style={styles.specialOffersHeader}>
        <Text style={styles.specialOffersTitle}>Special Offers</Text>
        <View style={styles.specialOffersBadge}>
          <Text style={styles.specialOffersBadgeText}>Limited Time</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.specialOffersContainer}
      >
        {discounts.map((product) => (
          <TouchableOpacity
            key={product.product_id}
            style={styles.specialOfferCard}
            onPress={() => showQuickView(product)}
          >
            <View style={styles.specialOfferImageContainer}>
              <Image
                source={{ uri: product.image_url }}
                style={styles.specialOfferImage}
                resizeMode="cover"
              />
              <View style={styles.discountBadge}>
                <Text style={styles.discountBadgeText}>-{product.discount}%</Text>
              </View>
            </View>

            <View style={styles.specialOfferContent}>
              <Text style={styles.specialOfferName} numberOfLines={2}>
                {product.name}
              </Text>
              
              <View style={styles.specialOfferPricing}>
                <Text style={styles.specialOfferCurrentPrice}>
                  ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                </Text>
                <Text style={styles.specialOfferOriginalPrice}>
                  ${product.price}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.specialOfferAddButton}
                onPress={() => addToCart(product)}
              >
                <MaterialIcons name="add-shopping-cart" size={20} color="#FFFFFF" />
                <Text style={styles.specialOfferAddButtonText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default SpecialOffers;
