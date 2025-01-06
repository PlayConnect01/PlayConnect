import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Animated, Dimensions, Platform, Easing } from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const First = () => {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const decorativeAnim = useRef(new Animated.Value(0)).current;
  const lottieRef = useRef(null);

  useEffect(() => {
    // Initial animations
    Animated.parallel([
      // Ripple effect
      Animated.sequence([
        Animated.timing(rippleAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
        Animated.timing(rippleAnim, {
          toValue: 0.7,
          duration: 250,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(rippleAnim, {
              toValue: 1,
              duration: 500,
              easing: Easing.bezier(0.25, 0.1, 0.25, 1),
              useNativeDriver: true,
            }),
            Animated.timing(rippleAnim, {
              toValue: 0.7,
              duration: 500,
              easing: Easing.bezier(0.25, 0.1, 0.25, 1),
              useNativeDriver: true,
            }),
          ])
        ),
      ]),
      // Rotation animation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ),
      // Decorative circle animation
      Animated.timing(decorativeAnim, {
        toValue: 1,
        duration: 500,
        delay: 250,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
      // Logo animations
      Animated.sequence([
        Animated.delay(250),
        Animated.parallel([
          Animated.spring(fadeAnim, {
            toValue: 1,
            friction: 6,
            tension: 50,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 6,
            tension: 50,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();

    // Navigate after animation
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
        Animated.timing(rippleAnim, {
          toValue: 0,
          duration: 250,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
        Animated.timing(decorativeAnim, {
          toValue: 0,
          duration: 250,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
      ]).start(() => {
        navigation.replace('Landing');
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation, fadeAnim, scaleAnim, rippleAnim, rotateAnim, decorativeAnim]);

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 2],
  });

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a237e', '#1565c0', '#0d47a1']}
        style={styles.gradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        locations={[0, 0.5, 1]}
      >
        <Animated.View
          style={[
            styles.rippleContainer,
            {
              transform: [
                { scale: rippleScale },
                { rotate },
              ],
              opacity: rippleAnim,
            },
          ]}
        >
          <View style={styles.ripple} />
        </Animated.View>

        <View style={styles.animationContainer}>
          <LottieView
            ref={lottieRef}
            source={require('./animation.json')}
            autoPlay
            loop
            style={styles.animation}
          />
        </View>

        <Animated.View
          style={[
            styles.decorativeCircle,
            {
              opacity: decorativeAnim,
              transform: [
                { scale: decorativeAnim },
                { rotate: rotate },
              ],
            },
          ]}
        />

        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['-10deg', '10deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <Image
            source={require('./logo.png')}
            style={styles.logo}
          />
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rippleContainer: {
    position: 'absolute',
    width: width * 2,
    height: width * 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ripple: {
    width: '100%',
    height: '100%',
    borderRadius: width,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  decorativeCircle: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  animationContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  logo: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
});

export default First;