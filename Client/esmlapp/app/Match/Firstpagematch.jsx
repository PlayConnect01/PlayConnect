import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Match = () => {
  const navigation = useNavigation();
  
  const handleChatNow = () => {
    navigation.navigate('Matching');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image 
        source={require('../../assets/images/sportscube.png')} 
        style={styles.backgroundImage}
      />

      <View style={styles.matchCard}>
        <Image 
          source={require('../../assets/images/matchimage.jpg')} 
          style={styles.matchImage}
        />
        
        <Text style={styles.matchTitle}>Match</Text>
        
        <Text style={styles.matchDescription}>
          Matches are with online users who share interests and are nearby.
        </Text>
        
        <TouchableOpacity style={styles.chatButton} onPress={handleChatNow}>
          <Text style={styles.chatButtonText}>Chat now</Text>
        </TouchableOpacity>
        
        <TouchableOpacity>
          <Text style={styles.keepSwipingText}>Keep swiping</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  matchCard: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    width:'100%',
    height:'100%',
    alignItems: 'center',
  },
  matchImage: {
    width: 250,
    height: 250,
    marginTop: 100,
    borderRadius: 15,
    marginBottom: 20,
  },
  matchTitle: {
    color: '#4F3DDC',
    fontSize: 50,
    fontWeight: 'bold',
    marginBottom:-15,
  },
  matchDescription: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 60,
    margin:30,
    fontWeight: 'bold',

    fontSize: 20,
  },
  chatButton: {
    backgroundColor: '#4F3DDC',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 15,
    width: '80%',
  },
  chatButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  keepSwipingText: {
    color: '#CCCCCC',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default Match;