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
            // Get audio source from assets and verify it is a string URI
            const audioSource = audioAssets[affirmation.audioUri]?.asset;

            if (typeof audioSource !== 'string') {
              console.warn('audioSource is not a string URI:', audioSource);
              Alert.alert('Error', 'Audio source is invalid.');
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

  const handleBackingTrackVolumeChange = async (volume: number) => {
    setBackingTrackVolume(volume);
    await audioService.setBackingTrackVolume(volume);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  const handleSelectBackingTrack = async (track: BackingTrack | null) => {
    setCurrentBackingTrack(track);
    if (track) {
      const backingTrackUri = track.uri;
      if (typeof backingTrackUri === 'string') {
        await audioService.loadBackingTrack(backingTrackUri);
      } else {
        Alert.alert('Error', 'Backing track URI is invalid.');
      }
    } else {
      await audioService.unloadBackingTrack();
    }
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
            handleSelectBackingTrack(null);
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
              onValueChange={handleBackingTrackVolumeChange}
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
  title: {
    fontSize: 20,
    color: colors.text,
  },
  trackButton: {
    padding: 12,
  },
  nowPlayingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  nowPlayingText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  nowPlayingPlayPause: {
    padding: 8,
  },
  content: {
    padding: 16,
  },
  affirmationInfo: {
    marginBottom: 16,
  },
  affirmationTitle: {
    fontSize: 24,
    color: colors.text,
    marginBottom: 8,
  },
  affirmationMetaContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  metaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  progressSection: {
    marginVertical: 16,
  },
  progressContainer: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.border,
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 3,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  durationText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 16,
  },
  waveformBar: {
    width: (screenWidth - 40) / 50,
    marginHorizontal: 1,
    borderRadius: 2,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 24,
  },
  controlButton: {
    padding: 16,
  },
  playButton: {
    padding: 16,
  },
  volumeControls: {
    marginBottom: 24,
  },
  volumeControl: {
    marginBottom: 16,
  },
  volumeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  volumeLabel: {
    fontSize: 14,
    color: colors.text,
  },
  volumeSlider: {
    width: '100%',
    height: 40,
  },
  volumeValue: {
    textAlign: 'right',
    color: colors.textSecondary,
    fontSize: 12,
  },
  backingTrackSelector: {
    marginTop: 16,
  },
  backingTrackCard: {
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
    width: 100,
  },
  selectedTrackCard: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  trackTitle: {
    marginTop: 6,
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
  trackFrequency: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 14,
    color: colors.primary,
  },
});
