import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text,
  TouchableOpacity, 
  SafeAreaView,
  Image 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const GradientButton = ({ onPress, title, style }) => (
  <TouchableOpacity 
    onPress={onPress}
    style={[styles.buttonContainer, style]}
  >
    <LinearGradient
      colors={['#0080FF', '#0A66C2', '#0080FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradient}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const App = () => {
  const navigation = useNavigation();

  const handleMatchNow = () => {
    navigation.navigate('Matchingpage');
  };

  const handleHome = () => {
    navigation.navigate('Homepage/Homep');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image 
        source={require('../../assets/images/find people with same interest.png')} 
        style={styles.backgroundImage}
      />

      <View style={styles.content}>
        <View style={styles.buttonsWrapper}>
          <GradientButton
            title="Match Now"
            onPress={handleMatchNow}
            style={styles.matchButton}
          />
          <GradientButton
            title="Go to home page"
            onPress={handleHome}
            style={styles.homeButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    paddingBottom: 50,
  },
  buttonsWrapper: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    borderRadius: 25,
    overflow: 'hidden',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gradient: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  matchButton: {
    marginBottom: 15,
  },
  homeButton: {
    marginBottom: 80,
  },
});

export default App;