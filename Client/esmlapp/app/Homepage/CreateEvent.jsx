import React from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';

const ProfileScreen = () => {
  const reviews = [
    {
      id: '1',
      reviewer: 'Bessie Cooper',
      date: 'Order Jan 24, 2024',
      rating: 5.0,
      review: 'consectetur fringilla lobortis, faucibus nec at Cras felis, vitae quis eu tempor adipiscing Sed consectetur non...'
    },
    {
      id: '2',
      reviewer: 'Bessie Cooper',
      date: 'Order Jan 24, 2024',
      rating: 5.0,
      review: 'Sed non placerat non, maximus odio id est. lobortis, vehicula, non sit viverra lorem. tincidunt dui. fringilla...'
    }
  ];

  const renderReview = ({ item }) => (
    <View style={styles.reviewContainer}>
      <Text style={styles.reviewText}>"{item.review}"</Text>
      <View style={styles.reviewerInfo}>
        <Text style={styles.reviewerName}>{item.reviewer}</Text>
        <Text style={styles.reviewDate}>{item.date}</Text>
        <View style={styles.ratingContainer}>
          <Icon name="star" type="font-awesome" color="#FFA500" size={14} />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Profile</Text>
        <Icon name="cog" type="font-awesome" size={20} style={styles.settingsIcon} />
      </View>
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: 'https://via.placeholder.com/80' }}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>Arya Muller</Text>
        <Text style={styles.profileEmail}>albertflores@mail.com</Text>
        <Icon name="check-circle" type="font-awesome" color="green" size={14} />
      </View>
      <TouchableOpacity style={styles.editProfileButton}>
        <Text style={styles.editProfileText}>Edit Profile</Text>
        <Icon name="chevron-down" type="font-awesome" size={14} />
      </TouchableOpacity>
      <View style={styles.tabContainer}>
        <Text style={styles.tab}>Services</Text>
        <Text style={styles.tab}>Products</Text>
        <Text style={[styles.tab, styles.activeTab]}>Reviews</Text>
      </View>
      <FlatList
        data={reviews}
        renderItem={renderReview}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.reviewList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  settingsIcon: {
    color: '#000',
  },
  profileContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: '#777',
  },
  editProfileButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
  },
  editProfileText: {
    fontSize: 14,
    marginRight: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  tab: {
    fontSize: 16,
    color: '#777',
  },
  activeTab: {
    color: '#fff',
    backgroundColor: '#6200EE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  reviewList: {
    marginTop: 10,
  },
  reviewContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  reviewText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  reviewerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  reviewDate: {
    fontSize: 12,
    color: '#777',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 5,
  },
});

export default ProfileScreen;
