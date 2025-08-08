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
import { colors } from '../styles/commonStyles';
import { useAffirmationStore } from '@/store/affirmationStore';
import { useSettingsStore } from '@/store/settingsStore';
import { audioService } from '@/services/audioService';
import { audioAssets } from '@/assets/audio/audioAssets';
import { Asset } from 'expo-asset';

const { width: screenWidth } = Dimensions.get('window');

export default function SampleTracksPlayerScreen() {
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
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    affirmations,
    currentAffirmation,
    isHydrated,
    affirmationVolume,
    setCurrentAffirmation,
    setAffirmationVolume,
    incrementPlays,
  } = useAffirmationStore();

  const { settings } = useSettingsStore();

  // Helper to get URI string from audioAssets module number or string
  const getAudioUri = async (assetModule: number | string | undefined): Promise<string> => {
    if (!assetModule) return '';
    if (typeof assetModule === 'number') {
      const asset = Asset.fromModule(assetModule);
      if (!asset.localUri) {
        await asset.downloadAsync();
      }
      return asset.localUri || asset.uri || '';
    } else if (typeof assetModule === 'string') {
      return assetModule;
    }
    return '';
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
            const audioSourceModule = audioAssets[affirmation.audioUri]?.asset;
            const affirmationUri = await getAudioUri(audioSourceModule);

            if (!affirmationUri) {
              Alert.alert('Error', 'Could not find the selected audio track.');
              setIsLoading(false);
              return;
            }

            await audioService.playAudio({
              affirmationUri,
              backingTrackUri: '', // no backing track for sample player
              affirmationVolume,
              backingTrackVolume: 0,
              fadeInDurationMs: settings.fadeInDuration,
            });
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
  }, [id, affirmations, setCurrentAffirmation, affirmationVolume, settings.fadeInDuration]);

  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      audioService.stopAll(settings.fadeOutDuration).catch(console.error);
    };
  }, [settings.fadeOutDuration]);

  if (!fontsLoaded || !isHydrated) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.loadingText}>Loading Player...</Text>
      </View>
    );
  }

  if (!currentAffirmation) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>No sample track selected.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handlePlayPause = async () => {
    if (isPlaybackActive) {
      await audioService.pauseAll();
      setIsPlaybackActive(false);
    } else {
      try {
        const audioSourceModule = audioAssets[currentAffirmation.audioUri]?.asset;
        const affirmationUri = await getAudioUri(audioSourceModule);
        if (!affirmationUri) {
          Alert.alert('Error', 'Audio asset missing or invalid');
          return;
        }
        await audioService.playAudio({
          affirmationUri,
          backingTrackUri: '',
          affirmationVolume,
          backingTrackVolume: 0,
          fadeInDurationMs: settings.fadeInDuration,
        });
        setIsPlaybackActive(true);
        startProgressTracking();
      } catch (error) {
        console.error('Error playing audio:', error);
        Alert.alert('Error', 'Failed to play audio');
      }
    }
  };

  const handleStop = async () => {
    try {
      await audioService.stopAll(settings.fadeOutDuration);
      setIsPlaybackActive(false);
      router.back();
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  const handleVolumeChange = async (volume: number) => {
    setAffirmationVolume(volume);
    await audioService.setAffirmationVolume(volume);
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { fontFamily: 'Inter_700Bold' }]}>
          Sample Track
        </Text>
        <View style={styles.backButton}></View> {/* Empty view for spacing */}
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Track Info */}
        <View style={styles.affirmationInfo}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.affirmationArt}
          >
            <Ionicons name="musical-notes" size={60} color={colors.text} />
          </LinearGradient>

          <Text style={[styles.affirmationTitle, { fontFamily: 'Inter_700Bold' }]}>
            {currentAffirmation.title}
          </Text>
          <Text style={[styles.affirmationMeta, { fontFamily: 'Inter_400Regular' }]}>
            Sample Track • {currentAffirmation.plays} plays
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

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleStop}
            disabled={!isPlaybackActive}
          >
            <Ionicons name="stop" size={32} color={!isPlaybackActive ? colors.textSecondary : colors.text} />
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
                name={isPlaybackActive ? 'pause' : 'play'}
                size={40}
                color={colors.text}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Volume Control */}
        <View style={styles.volumeControls}>
          <View style={styles.volumeControl}>
            <View style={styles.volumeHeader}>
              <Ionicons name="volume-medium-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.volumeLabel, { fontFamily: 'Inter_600SemiBold' }]}>
                Volume
              </Text>
            </View>
            <Slider
              style={styles.volumeSlider}
              minimumValue={0}
              maximumValue={1}
              value={affirmationVolume}
              onValueChange={handleVolumeChange}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            <Text style={styles.volumeValue}>{Math.round(affirmationVolume * 100)}%</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.description}>
          <Text style={[styles.descriptionText, { fontFamily: 'Inter_400Regular' }]}>
            {currentAffirmation.affirmationTexts[0]}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centeredContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary,
  },
  scrollContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
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
  description: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  descriptionText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    textAlign: 'center',
  },
});
