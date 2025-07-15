import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { commonStyles, colors } from '../styles/commonStyles';
import { useAffirmationStore, BackingTrack } from '../store/affirmationStore';
import { useSettingsStore } from '../store/settingsStore';
import { audioService } from '../services/audioService';

const { width: screenWidth } = Dimensions.get('window');

export default function PlayerScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const { id } = useLocalSearchParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [showBackingTracks, setShowBackingTracks] = useState(false);

  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    affirmations,
    backingTracks,
    currentAffirmation,
    currentBackingTrack,
    isPlaying,
    isHydrated, // Get the hydration state
    affirmationVolume,
    backingTrackVolume,
    setCurrentAffirmation,
    setCurrentBackingTrack,
    setAffirmationVolume,
    setBackingTrackVolume,
    incrementPlays,
    playCurrentAffirmation,
    pause,
    stop,
  } = useAffirmationStore();

  const { settings } = useSettingsStore();



  useEffect(() => {
    const loadInitialAffirmation = async () => {
      if (id) {
        const affirmation = affirmations.find(a => a.id === id);
        if (affirmation) {
          setIsLoading(true);
          setCurrentAffirmation(affirmation);
          if (affirmation.duration && typeof affirmation.duration === 'string') {
            const parts = affirmation.duration.split(':');
            if (parts.length === 2 && parts[0] !== undefined && parts[1] !== undefined) {
              const minutes = parseInt(parts[0], 10);
              const seconds = parseInt(parts[1], 10);
              if (!isNaN(minutes) && !isNaN(seconds)) {
                setDuration(minutes * 60 + seconds);
              }
            }
          }
          await audioService.loadAffirmationAudio(affirmation.audioUri);
          await playCurrentAffirmation();
          setIsLoading(false);
        }
      }
    };
    loadInitialAffirmation();
  }, [id, affirmations, setCurrentAffirmation, playCurrentAffirmation]);

  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      // Call stop to ensure fade-out and cleanup
      stop();
    };
  }, []);

  if (!fontsLoaded || !isHydrated) {
    return (
      <View style={commonStyles.wrapperCentered}>
        <Text style={commonStyles.text}>Loading Player...</Text>
      </View>
    );
  }

  if (!currentAffirmation) {
    return (
      <View style={commonStyles.wrapperCentered}>
        <Text style={commonStyles.text}>No affirmation selected.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={commonStyles.text}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handlePlayPause = async () => {
    if (isPlaying) {
      pause();
    } else {
      playCurrentAffirmation();
    }
  };

  const handleStop = async () => {
    await stop();
    setCurrentTime(0);
  };

  const startProgressTracking = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    progressInterval.current = setInterval(async () => {
      const status = await audioService.getStatus();
      if (status) {
        setCurrentTime(status.currentTime);
        setDuration(status.duration);
        if (status.isFinished) {
          useAffirmationStore.getState().setIsPlaying(false);
          if (progressInterval.current) {
            clearInterval(progressInterval.current);
            progressInterval.current = null;
          }
        }
      }
    }, 1000);
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
    <View style={commonStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[commonStyles.title, { fontFamily: 'Inter_700Bold' }]}>
          Player
        </Text>
        <TouchableOpacity
          onPress={() => setShowBackingTracks(!showBackingTracks)}
          style={styles.trackButton}
        >
          <Ionicons name="musical-notes" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Affirmation Info */}
        <View style={styles.affirmationInfo}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.affirmationArt}
          >
            <Ionicons name="moon" size={60} color={colors.text} />
          </LinearGradient>
          
          <Text style={[styles.affirmationTitle, { fontFamily: 'Inter_700Bold' }]}>
            {currentAffirmation.title}
          </Text>
          <Text style={[styles.affirmationMeta, { fontFamily: 'Inter_400Regular' }]}>
            {currentAffirmation.intent} • {currentAffirmation.tone} • {currentAffirmation.plays} plays
          </Text>
        </View>

        {/* Waveform */}
        <View style={styles.waveformSection}>
          {renderWaveform()}
          <View style={styles.timeInfo}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>

        {/* Next Affirmation Timer */}
        {isPlaying && (
          <View style={styles.nextAffirmationTimer}>
            <Text style={[styles.timerLabel, { fontFamily: 'Inter_400Regular' }]}>
              Next affirmation in:
            </Text>
            <Text style={[styles.timerValue, { fontFamily: 'Inter_700Bold' }]}>
              {getNextAffirmationTime()}
            </Text>
          </View>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleStop}
            disabled={!isPlaying}
          >
            <Ionicons name="stop" size={32} color={!isPlaying ? colors.textSecondary : colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.playButton, isLoading && styles.disabledButton]}
            onPress={handlePlayPause}
            disabled={isLoading}
          >
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.playButtonGradient}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={40}
                color={colors.text}
              />
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="repeat" size={32} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Volume Controls */}
        <View style={styles.volumeControls}>
          <View style={styles.volumeControl}>
            <View style={styles.volumeHeader}>
              <Ionicons name="mic" size={20} color={colors.primary} />
              <Text style={[styles.volumeLabel, { fontFamily: 'Inter_600SemiBold' }]}>
                Affirmations
              </Text>
            </View>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={0}
              maximumValue={1}
              value={affirmationVolume}
              onValueChange={handleAffirmationVolumeChange}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
            />
            <Text style={styles.volumeValue}>{Math.round(affirmationVolume * 100)}%</Text>
          </View>

          <View style={styles.volumeControl}>
            <View style={styles.volumeHeader}>
              <Ionicons name="musical-notes" size={20} color={colors.secondary} />
              <Text style={[styles.volumeLabel, { fontFamily: 'Inter_600SemiBold' }]}>
                Backing Track
              </Text>
            </View>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={0}
              maximumValue={1}
              value={backingTrackVolume}
              onValueChange={handleBackingTrackVolumeChange}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
            />
            <Text style={styles.volumeValue}>{Math.round(backingTrackVolume * 100)}%</Text>
          </View>
        </View>

        {/* Backing Track Selector */}
        {showBackingTracks && renderBackingTrackSelector()}

        {/* Affirmation Texts */}
        <View style={styles.affirmationTexts}>
          <Text style={[styles.sectionTitle, { fontFamily: 'Inter_600SemiBold' }]}>
            Your Affirmations
          </Text>
          {currentAffirmation.affirmationTexts.map((text, index) => (
            <View key={index} style={styles.affirmationTextCard}>
              <Text style={[styles.affirmationText, { fontFamily: 'Inter_400Regular' }]}>
                {text}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  trackButton: {
    padding: 8,
  },
  affirmationInfo: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  affirmationArt: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  affirmationTitle: {
    fontSize: 24,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  affirmationMeta: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  waveformSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 60,
    marginBottom: 12,
  },
  waveformBar: {
    width: (screenWidth - 80) / 50,
    borderRadius: 2,
    marginHorizontal: 1,
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  nextAffirmationTimer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  timerLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  timerValue: {
    fontSize: 20,
    color: colors.primary,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  controlButton: {
    padding: 16,
  },
  playButton: {
    marginHorizontal: 32,
  },
  playButtonGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  volumeControls: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  volumeControl: {
    marginBottom: 24,
  },
  volumeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  volumeLabel: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
  },
  volumeSlider: {
    width: '100%',
    height: 40,
  },
  volumeValue: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  backingTrackSelector: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 16,
  },
  backingTrackCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 120,
    borderWidth: 2,
    borderColor: colors.border,
  },
  selectedTrackCard: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  trackTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginTop: 8,
  },
  trackFrequency: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  affirmationTexts: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  affirmationTextCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  affirmationText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
});

