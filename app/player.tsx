import { Text, View, TouchableOpacity, Slider } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { commonStyles, colors } from '../styles/commonStyles';

export default function PlayerScreen() {
  const { id } = useLocalSearchParams();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(300); // 5 minutes default
  const [volume, setVolume] = useState(0.7);
  const [backgroundSound, setBackgroundSound] = useState<Audio.Sound | null>(null);

  // Mock affirmation data - in real app this would come from storage/API
  const affirmation = {
    id: id,
    title: 'Deep Sleep Meditation',
    text: 'I am calm and peaceful. My mind is quiet and my body is relaxed. I release all tension and stress from my day. I am safe and secure. Sleep comes easily to me now.',
    music: 'Ocean Waves',
    voice: 'Calm & Soothing',
    duration: '5:30'
  };

  useEffect(() => {
    // Set up audio session
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    return () => {
      // Cleanup
      if (backgroundSound) {
        backgroundSound.unloadAsync();
      }
      Speech.stop();
    };
  }, []);

  const playAffirmation = async () => {
    try {
      console.log('Starting affirmation playback');
      setIsPlaying(true);

      // Load and play background music (placeholder - in real app would load actual audio files)
      // For demo purposes, we'll just use speech synthesis
      
      // Configure speech options
      const speechOptions = {
        voice: 'com.apple.ttsbundle.Samantha-compact', // iOS voice
        rate: 0.4, // Slow, calming pace
        pitch: 0.8, // Slightly lower pitch
        volume: volume,
      };

      // Start speaking the affirmation
      Speech.speak(affirmation.text, {
        ...speechOptions,
        onStart: () => {
          console.log('Speech started');
        },
        onDone: () => {
          console.log('Speech completed');
          setIsPlaying(false);
        },
        onStopped: () => {
          console.log('Speech stopped');
          setIsPlaying(false);
        },
        onError: (error) => {
          console.log('Speech error:', error);
          setIsPlaying(false);
        },
      });

    } catch (error) {
      console.error('Error playing affirmation:', error);
      setIsPlaying(false);
    }
  };

  const stopAffirmation = () => {
    console.log('Stopping affirmation');
    Speech.stop();
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!fontsLoaded) {
    return null;
  }

  console.log('PlayerScreen rendered for affirmation:', id);

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.content}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 40 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 16 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[commonStyles.title, { fontFamily: 'Inter_700Bold', flex: 1, textAlign: 'left' }]}>
            Now Playing
          </Text>
          <TouchableOpacity
            onPress={() => {
              console.log('Share affirmation');
            }}
          >
            <Ionicons name="share-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Album Art / Visualization */}
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 280,
              height: 280,
              borderRadius: 140,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
            }}
          >
            <Ionicons 
              name={isPlaying ? "radio" : "moon"} 
              size={120} 
              color={colors.text} 
              style={{ opacity: 0.8 }}
            />
          </LinearGradient>
          
          <Text style={[commonStyles.title, { fontFamily: 'Inter_700Bold', fontSize: 24, marginBottom: 8 }]}>
            {affirmation.title}
          </Text>
          <Text style={[commonStyles.textMuted, { fontFamily: 'Inter_400Regular', textAlign: 'center' }]}>
            {affirmation.music} • {affirmation.voice}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={{ marginBottom: 32 }}>
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={0}
            maximumValue={duration}
            value={currentTime}
            onValueChange={setCurrentTime}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbStyle={{ backgroundColor: colors.primary, width: 20, height: 20 }}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <Text style={[commonStyles.textMuted, { fontFamily: 'Inter_400Regular' }]}>
              {formatTime(currentTime)}
            </Text>
            <Text style={[commonStyles.textMuted, { fontFamily: 'Inter_400Regular' }]}>
              {formatTime(duration)}
            </Text>
          </View>
        </View>

        {/* Controls */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
          <TouchableOpacity
            style={{ marginHorizontal: 20 }}
            onPress={() => {
              console.log('Previous track');
            }}
          >
            <Ionicons name="play-skip-back" size={32} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              borderRadius: 40,
              width: 80,
              height: 80,
              alignItems: 'center',
              justifyContent: 'center',
              marginHorizontal: 20,
            }}
            onPress={isPlaying ? stopAffirmation : playAffirmation}
          >
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={36} 
              color={colors.text} 
              style={{ marginLeft: isPlaying ? 0 : 4 }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginHorizontal: 20 }}
            onPress={() => {
              console.log('Next track');
            }}
          >
            <Ionicons name="play-skip-forward" size={32} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Volume Control */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32 }}>
          <Ionicons name="volume-low" size={20} color={colors.textMuted} />
          <Slider
            style={{ flex: 1, marginHorizontal: 16 }}
            minimumValue={0}
            maximumValue={1}
            value={volume}
            onValueChange={setVolume}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbStyle={{ backgroundColor: colors.primary, width: 16, height: 16 }}
          />
          <Ionicons name="volume-high" size={20} color={colors.textMuted} />
        </View>

        {/* Additional Controls */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
          <TouchableOpacity
            style={{ alignItems: 'center' }}
            onPress={() => {
              console.log('Toggle repeat');
            }}
          >
            <Ionicons name="repeat" size={24} color={colors.textMuted} />
            <Text style={[commonStyles.textMuted, { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 4 }]}>
              Repeat
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ alignItems: 'center' }}
            onPress={() => {
              console.log('Toggle timer');
            }}
          >
            <Ionicons name="timer" size={24} color={colors.textMuted} />
            <Text style={[commonStyles.textMuted, { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 4 }]}>
              Timer
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ alignItems: 'center' }}
            onPress={() => {
              console.log('Add to favorites');
            }}
          >
            <Ionicons name="heart-outline" size={24} color={colors.textMuted} />
            <Text style={[commonStyles.textMuted, { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 4 }]}>
              Favorite
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}