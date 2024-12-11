import React, { useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, PanResponder, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import userData from './data';
import { useNavigation } from '@react-navigation/native';

const Match = () => {
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const currentUser = userData[currentUserIndex];
  const position = useRef(new Animated.ValueXY()).current;
  const navigation = useNavigation();

  const handleNextUser = () => {
    if (currentUserIndex < userData.length - 1) {
      setCurrentUserIndex(prev => prev + 1);
    }
    position.setValue({ x: 0, y: 0 }); // Reset position
  };

  const handleMessagePress = () => {
    navigation.navigate('Messages'); // Navigue vers l'écran Messages
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event(
      [
        null,
        { dx: position.x, dy: position.y },
      ],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > 120) {
        // Swipe right - Like
        Animated.timing(position, {
          toValue: { x: 500, y: gesture.dy },
          duration: 300,
          useNativeDriver: false,
        }).start(() => handleNextUser());
      } else if (gesture.dx < -120) {
        // Swipe left - Dislike
        Animated.timing(position, {
          toValue: { x: -500, y: gesture.dy },
          duration: 300,
          useNativeDriver: false,
        }).start(() => handleNextUser());
      } else {
        // Return to center
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      }
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Find your team member</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={handleMessagePress}
          >
            <Ionicons name="mail-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardContainer}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.card,
            {
              transform: [
                { translateX: position.x },
                { translateY: position.y },
                { rotate: position.x.interpolate({
                    inputRange: [-200, 0, 200],
                    outputRange: ['-10deg', '0deg', '10deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <Image source={{ uri: currentUser.image }} style={styles.image} resizeMode="cover" />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {currentUser.name}, {currentUser.age}
            </Text>
            <Text style={styles.location}>
              © {currentUser.location} • {currentUser.distance}
            </Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{currentUser.status}</Text>
            </View>
          </View>
        </Animated.View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={[styles.actionButton, styles.dislikeButton]} onPress={() => handleNextUser()}>
          <Ionicons name="close" size={30} color="#FF3B30" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.likeButton]} onPress={() => handleNextUser()}>
          <Ionicons name="checkmark" size={30} color="#34C759" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'absolute',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  userInfo: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
  },
  userName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  location: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  statusBadge: {
    backgroundColor: 'rgba(147, 51, 234, 0.9)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  actionButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconButton: {
    padding: 5,
  },
});

export default Match;
