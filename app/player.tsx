import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { colors } from '../styles/commonStyles';
import { useAffirmationStore, BackingTrack } from '@/store/affirmationStore';
import { useSettingsStore } from '@/store/settingsStore';
import { audioService } from '@/services/audioService';
import { audioAssets } from '@/assets/audio/audioAssets';

const { width: screenWidth } = Dimensions.get('window');

export default function PlayerScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const { id } = useLocalSearchParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaybackActive, setIsPlaybackActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showBackingTracks, setShowBackingTracks] = useState(false);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    affirmations,
    backingTracks,
    currentAffirmation,
    currentBackingTrack,
    isHydrated,
    affirmationVolume,
    backingTrackVolume,
    setCurrentAffirmation,
    setCurrentBackingTrack,
    setAffirmationVolume,
    setBackingTrackVolume,
    incrementPlays,
  } = useAffirmationStore();

  const { settings } = useSettingsStore();

  const startProgressTracking = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    progressInterval.current = setInterval(async () => {
      const status = await audioService.getStatus();
      if (status) {
        setCurrentTime(status.currentTime);
        setDuration(status.duration);
        setIsPlaybackActive(status.isPlaying);
        if (status.isFinished) {
          if (progressInterval.current) {
            clearInterval(progressInterval.current);
          }
          setCurrentTime(0);
          setIsPlaybackActive(false);
        }
      }
    }, 1000);
  };

  useEffect(() => {
    const loadInitialAffirmation = async () => {
      if (id) {
        const affirmation = affirmations.find(a => a.id === id);
        if (affirmation) {
          setIsLoading(true);
          setCurrentAffirmation(affirmation);
          try {
            const audioSource = audioAssets[affirmation.audioUri]?.asset;
            if (!audioSource) {
              Alert.alert('Error', 'Could not find the selected audio track.');
              setIsLoading(false);
              return;
            }

            await audioService.loadAffirmationAudio(audioSource);
            await audioService.play(affirmationVolume, backingTrackVolume, settings.fadeInDuration);
            setIsPlaybackActive(true);
            const status = await audioService.getStatus();
            if (status) {
              setDuration(status.duration);
            }
            startProgressTracking();
          } catch (error) {
            console.error('Failed to play affirmation:', error);
            Alert.alert('Error', 'Could not play the selected audio track.');
          }
          setIsLoading(false);
        }
      }
    };
    loadInitialAffirmation();
  }, [id, affirmations, setCurrentAffirmation, settings.fadeInDuration]);

  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      audioService.stop(settings.fadeOutDuration);
    };
  }, [settings.fadeOutDuration]);

  if (!fontsLoaded || !isHydrated) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!currentAffirmation) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>No affirmation selected.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handlePlayPause = async () => {
    if (isPlaybackActive) {
      await audioService.pause();
      setIsPlaybackActive(false);
    } else {
      await audioService.play(affirmationVolume, backingTrackVolume, settings.fadeInDuration);
      setIsPlaybackActive(true);
    }
  };

  const handleStop = async () => {
    await audioService.stop(settings.fadeOutDuration);
    setIsPlaybackActive(false);
    router.back();
  };

  const handleAffirmationVolumeChange = async (volume: number) => {
    setAffirmationVolume(volume);
    await audioService.setAffirmationVolume(volume);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getNextAffirmationTime = () => {
    const loopGapSeconds = currentAffirmation.loopGap * 60;
    const timeUntilNext = loopGapSeconds - (currentTime % loopGapSeconds);
    return formatTime(timeUntilNext);
  };

  const renderWaveform = () => {
    const progress = duration > 0 ? currentTime / duration : 0;
    const waveformBars = 50;
    
    return (
      <View style={styles.waveformContainer}>
        {Array.from({ length: waveformBars }).map((_, index) => {
          const barProgress = index / waveformBars;
          const isActive = barProgress <= progress;
          const height = Math.random() * 30 + 10; // Random height for visual effect
          
          return (
            <View
              key={index}
              style={[
                styles.waveformBar,
                {
                  height,
                  backgroundColor: isActive ? colors.primary : colors.border,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  const handleSelectBackingTrack = (track: BackingTrack) => {
    setCurrentBackingTrack(track);
    audioService.loadBackingTrack(track.uri);
  };

  const renderBackingTrackSelector = () => (
    <View style={styles.backingTrackSelector}>
      <Text style={[styles.sectionTitle, { fontFamily: 'Inter_600SemiBold' }]}>
        Choose Backing Track
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[
            styles.backingTrackCard,
            !currentBackingTrack && styles.selectedTrackCard,
          ]}
          onPress={() => {
            setCurrentBackingTrack(null);
            audioService.unloadBackingTrack();
          }}
        >
          <Ionicons name="close" size={24} color={colors.textSecondary} />
          <Text style={styles.trackTitle}>No Track</Text>
        </TouchableOpacity>
        
        {backingTracks.map((track) => (
          <TouchableOpacity
            key={track.id}
            style={[
              styles.backingTrackCard,
              currentBackingTrack?.id === track.id && styles.selectedTrackCard,
            ]}
            onPress={() => {
              handleSelectBackingTrack(track);
            }}
          >
            <Ionicons name="musical-notes" size={24} color={colors.primary} />
            <Text style={styles.trackTitle}>{track.title}</Text>
            <Text style={styles.trackFrequency}>{track.frequency}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { fontFamily: 'Inter_700Bold' }]}>
          Player
        </Text>
        <TouchableOpacity
          onPress={() => setShowBackingTracks(!showBackingTracks)}
          style={styles.trackButton}
        >
          <Ionicons name="musical-notes" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Now Playing Bar */}
      {currentAffirmation && (
        <TouchableOpacity
          style={styles.nowPlayingBar}
          onPress={() => {
            // Optional: expand or navigate to detailed player
          }}
        >
          <Text style={styles.nowPlayingText} numberOfLines={1}>
            🎵 Now Playing: {currentAffirmation.title}
          </Text>
          <TouchableOpacity onPress={handlePlayPause} style={styles.nowPlayingPlayPause}>
            {isPlaybackActive ? (
              <Ionicons name="pause" size={24} color={colors.primary} />
            ) : (
              <Ionicons name="play" size={24} color={colors.primary} />
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Affirmation Info */}
        <View style={styles.affirmationInfo}>
          <Text style={styles.affirmationTitle} numberOfLines={2}>
            {currentAffirmation?.title || 'Loading...'}
          </Text>
          <View style={styles.affirmationMetaContainer}>
            <View style={styles.metaTag}>
              <Ionicons name="pricetag" size={14} color={colors.primary} />
              <Text style={styles.metaText}>{currentAffirmation?.intent}</Text>
            </View>
            <View style={styles.metaTag}>
              <Ionicons name="color-palette" size={14} color={colors.secondary} />
              <Text style={styles.metaText}>{currentAffirmation?.tone}</Text>
            </View>
          </View>
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressContainer}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={[styles.progressFill, { width: `${(currentTime / duration) * 100}%` }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
            <View style={styles.progressBackground} />
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Text style={styles.durationText}>{formatTime(duration)}</Text>
          </View>
        </View>

        {/* Waveform */}
        {renderWaveform()}

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={handleStop}>
            <Ionicons name="stop" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
            {isPlaybackActive ? (
              <Ionicons name="pause" size={48} color={colors.primary} />
            ) : (
              <Ionicons name="play" size={48} color={colors.primary} />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={() => {}}>
            <Ionicons name="repeat" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Volume Controls */}
        <View style={styles.volumeControls}>
          <View style={styles.volumeControl}>
            <View style={styles.volumeHeader}>
              <Ionicons name="volume-low" size={20} color={colors.text} />
              <Text style={styles.volumeLabel}>Affirmation Volume</Text>
            </View>
            <Slider
              style={styles.volumeSlider}
              minimumValue={0}
              maximumValue={1}
              value={affirmationVolume}
              onValueChange={handleAffirmationVolumeChange}
            />
            <Text style={styles.volumeValue}>{Math.round(affirmationVolume * 100)}%</Text>
          </View>
          <View style={styles.volumeControl}>
            <View style={styles.volumeHeader}>
              <Ionicons name="volume-low" size={20} color={colors.text} />
              <Text style={styles.volumeLabel}>Backing Track Volume</Text>
            </View>
            <Slider
              style={styles.volumeSlider}
              minimumValue={0}
              maximumValue={1}
              value={backingTrackVolume}
              onValueChange={(volume) => setBackingTrackVolume(volume)}
            />
            <Text style={styles.volumeValue}>{Math.round(backingTrackVolume * 100)}%</Text>
          </View>
        </View>

        {/* Backing Track Selector */}
        {showBackingTracks && renderBackingTrackSelector()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 12,
  },
  trackButton: {
    padding: 12,
  },
  title: {
    fontSize: 24,
    color: colors.text,
  },
  nowPlayingBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  nowPlayingText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: colors.text,
    marginRight: 12,
  },
  nowPlayingPlayPause: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  affirmationInfo: {
    padding: 24,
  },
  affirmationTitle: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: colors.text,
  },
  affirmationMetaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  metaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
    marginLeft: 8,
  },
  progressSection: {
    padding: 24,
  },
  progressContainer: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  progressBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: colors.border,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  timeText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: colors.textSecondary,
  },
  durationText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: colors.textSecondary,
  },
  waveformContainer: {
    flexDirection: 'row',
    padding: 24,
  },
  waveformBar: {
    width: 2,
    marginHorizontal: 1,
    backgroundColor: colors.border,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 24,
  },
  controlButton: {
    padding: 20,
  },
  playButton: {
    marginHorizontal: 40,
  },
  volumeControls: {
    padding: 24,
  },
  volumeControl: {
    marginBottom: 32,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  volumeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  volumeLabel: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: colors.text,
    marginLeft: 8,
  },
  volumeSlider: {
    width: '100%',
    height: 40,
  },
  volumeValue: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: colors.primary,
    textAlign: 'right',
    marginTop: 8,
  },
  backingTrackSelector: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: colors.text,
    marginBottom: 20,
  },
  backingTrackCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginRight: 16,
    alignItems: 'center',
    minWidth: 140,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedTrackCard: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}15`,
    shadowColor: colors.primary,
    shadowOpacity: 0.1,
  },
  trackTitle: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: colors.text,
    textAlign: 'center',
    marginTop: 12,
  },
  trackFrequency: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  centeredContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Inter_400Regular',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: colors.primary,
  },
});
