import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const API_URL = 'http://192.168.0.201:3000';

const AudioMessage = ({ audioUrl, isCurrentUser, sender, timestamp }) => {
    const [sound, setSound] = useState();
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(false);
    const [duration, setDuration] = useState(0);
    const [position, setPosition] = useState(0);

    useEffect(() => {
        return sound
            ? () => {
                console.log('Unloading Sound');
                sound.unloadAsync();
            }
            : undefined;
    }, [sound]);

    useEffect(() => {
        async function setupAudio() {
            try {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: false,
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: false,
                    shouldDuckAndroid: true,
                    playThroughEarpieceAndroid: false,
                });
            } catch (error) {
                console.error('Error setting up audio:', error);
            }
        }
        setupAudio();
    }, []);

    const getCorrectUrl = (url) => {
        if (!url) return url;
        // If it's a relative URL, prepend the correct API URL
        if (url.startsWith('/')) {
            return `${API_URL}${url}`;
        }
        // If it's a full URL but with wrong IP, replace it
        return url.replace(/http:\/\/\d+\.\d+\.\d+\.\d+:\d+/, API_URL);
    };

    const updatePlaybackStatus = (status) => {
        if (status.isLoaded) {
            setPosition(status.positionMillis);
            setDuration(status.durationMillis);
        }
    };

    const playSound = async () => {
        try {
            setLoading(true);

            if (sound) {
                if (isPlaying) {
                    await sound.pauseAsync();
                    setIsPlaying(false);
                } else {
                    await sound.playAsync();
                    setIsPlaying(true);
                }
            } else {
                const correctUrl = getCorrectUrl(audioUrl);
                console.log('Loading audio from:', correctUrl);
                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri: correctUrl },
                    { shouldPlay: true },
                    updatePlaybackStatus
                );

                setSound(newSound);
                setIsPlaying(true);

                newSound.setOnPlaybackStatusUpdate((status) => {
                    updatePlaybackStatus(status);
                    if (status.didJustFinish) {
                        setIsPlaying(false);
                        setPosition(0);
                    }
                });
            }
        } catch (error) {
            console.error('Error playing sound:', error);
        } finally {
            setLoading(false);
        }
    };

    const progress = duration > 0 ? (position / duration) : 0;

    return (
        <View style={styles.audioMessageContainer}>
            <TouchableOpacity 
                onPress={playSound} 
                style={styles.playButtonContainer}
                disabled={loading}
            >
                <View style={styles.playButton}>
                    {loading ? (
                        <ActivityIndicator color="#000" size="small" />
                    ) : (
                        <MaterialCommunityIcons 
                            name={isPlaying ? "pause" : "play"} 
                            size={28} 
                            color="#000"
                        />
                    )}
                </View>
            </TouchableOpacity>

            <View style={styles.waveformContainer}>
                {Array(40).fill(0).map((_, index) => {
                    const barHeight = Math.sin((index / 2) * 0.5) * 0.5 + 0.5;
                    return (
                        <View
                            key={index}
                            style={[
                                styles.waveformBar,
                                {
                                    height: barHeight * 20,
                                    opacity: index / 40 <= progress ? 1 : 0.3
                                }
                            ]}
                        />
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    audioMessageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    playButtonContainer: {
        marginRight: 12,
    },
    playButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    waveformContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 30,
    },
    waveformBar: {
        width: 3,
        marginHorizontal: 1,
        backgroundColor: '#000',
        borderRadius: 1.5,
    },
});

export default AudioMessage;
