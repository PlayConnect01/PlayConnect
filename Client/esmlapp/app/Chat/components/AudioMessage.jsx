import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const API_URL = 'http://192.168.103.15:3000';

const AudioMessage = ({ audioUrl, isCurrentUser, sender, timestamp }) => {
    const [sound, setSound] = useState();
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(false);
    const [duration, setDuration] = useState(0);
    const [position, setPosition] = useState(0);
    const [waveformBars] = useState(() => {
        const numberOfBars = 30;
        return Array.from({ length: numberOfBars }, () => ({
            height: Math.random() * 0.7 + 0.3,
            active: false
        }));
    });

    useEffect(() => {
        return () => {
            if (sound) {
                console.log('Unloading Sound');
                sound.unloadAsync();
            }
        };
    }, [sound]);

    const cleanupSound = async () => {
        if (sound) {
            await sound.unloadAsync();
            setSound(null);
            setIsPlaying(false);
            setPosition(0);
        }
    };

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

    useEffect(() => {
        if (duration > 0 && waveformBars.length > 0) {
            const progress = position / duration;
            const activeBarIndex = Math.floor(progress * waveformBars.length);
            
            waveformBars.forEach((bar, index) => {
                bar.active = index <= activeBarIndex;
            });
        }
    }, [position, duration]);

    const getCorrectUrl = (url) => {
        if (!url) return url;
        if (url.startsWith('/')) {
            return `${API_URL}${url}`;
        }
        return url.replace(/http:\/\/\d+\.\d+\.\d+\.\d+:\d+/, API_URL);
    };

    const updatePlaybackStatus = (status) => {
        if (status.isLoaded) {
            setPosition(status.positionMillis);
            setDuration(status.durationMillis);
            
            if (status.didJustFinish) {
                setIsPlaying(false);
                setPosition(0);
                cleanupSound();
            }
        }
    };

    const playPause = async () => {
        try {
            setLoading(true);

            if (sound) {
                if (isPlaying) {
                    await sound.pauseAsync();
                    setIsPlaying(false);
                } else {
                    await sound.playFromPositionAsync(position);
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

                newSound.setOnPlaybackStatusUpdate(updatePlaybackStatus);
            }
        } catch (error) {
            console.error('Error playing audio:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.audioMessageContainer}>
            <TouchableOpacity 
                style={styles.playButtonContainer} 
                onPress={playPause}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color={isCurrentUser ? "#fff" : "#4FA5F5"} />
                ) : (
                    <View style={styles.playButton}>
                        <MaterialCommunityIcons
                            name={isPlaying ? "pause" : "play"}
                            size={24}
                            color={isCurrentUser ? "#fff" : "#4FA5F5"}
                        />
                    </View>
                )}
            </TouchableOpacity>
            
            <View style={styles.waveformContainer}>
                {waveformBars.map((bar, index) => (
                    <View
                        key={index}
                        style={[
                            styles.waveformBar,
                            {
                                height: bar.height * 20,
                                backgroundColor: bar.active 
                                    ? (isCurrentUser ? '#fff' : '#4FA5F5')
                                    : (isCurrentUser ? 'rgba(255,255,255,0.4)' : 'rgba(79,165,245,0.4)')
                            }
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    audioMessageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        minWidth: 150,
        maxWidth: '100%',
    },
    playButtonContainer: {
        marginRight: 8,
    },
    playButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    waveformContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 24,
        flex: 1,
        marginRight: 4,
    },
    waveformBar: {
        width: 2,
        marginHorizontal: 0.5,
        borderRadius: 1,
    },
});

export default AudioMessage;