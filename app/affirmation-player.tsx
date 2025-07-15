import React, { useState } from 'react';
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAffirmationStore } from '@/store/affirmationStore';
import { audioService } from '@/services/audioService';
import { apiService } from '@/services/apiService';
import { commonStyles, colors, buttonStyles } from '@/styles/commonStyles';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

const QUICK_INTENTS = ['Confidence', 'Gratitude', 'Peace', 'Success', 'Health'];

export default function AffirmationPlayerScreen() {
  const router = useRouter();
  const {
    addAffirmation,
    backingTracks,
    currentBackingTrack,
    setCurrentBackingTrack,
    affirmationVolume,
    backingTrackVolume,
    setAffirmationVolume,
    setBackingTrackVolume,
  } = useAffirmationStore();

  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateAndPlay = async (intent: string) => {
    setIsLoading(true);
    try {
      const response = await apiService.generateAffirmations({
        intent,
        tone: 'reassuring',
        count: 1,
      });

      if (!response.affirmations || response.affirmations.length === 0) {
        throw new Error('No affirmations were generated.');
      }

      const audioFile = await audioService.createAffirmationAudio(
        response.affirmations,
        'soft_female',
        0
      );

      const newAffirmation = {
        id: `temp_${Date.now()}`,
        title: `${intent} Affirmation`,
        date: new Date().toISOString(),
        intent,
        tone: 'reassuring',
        voice: 'soft_female',
        loopGap: 0,
        audioUri: audioFile.uri,
        duration: audioFile.duration.toString(),
        plays: 0,
        affirmationTexts: response.affirmations,
      };

      addAffirmation(newAffirmation);

      router.push(`/player?id=${newAffirmation.id}`);
    } catch (error: any) {
      console.error('Error generating or playing audio:', error);
      Alert.alert(
        'Generation Error',
        error.message ||
          'Failed to generate affirmation. Please check your API keys and network connection.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Quick Generate</Text>
        <Text style={styles.subtitle}>
          Instantly generate and play a single affirmation based on an intent.
        </Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Generating your affirmation...</Text>
          </View>
        ) : (
          <View style={styles.intentsContainer}>
            {QUICK_INTENTS.map((intent) => (
              <Pressable
                key={intent}
                style={buttonStyles.primary}
                onPress={() => handleGenerateAndPlay(intent)}
              >
                <Text style={styles.buttonText}>{intent}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.divider} />

        <Text style={styles.label}>Background Music</Text>
        <View style={styles.trackSelector}>
          {backingTracks.map((track) => (
            <Pressable
              key={track.id}
              style={[
                styles.trackButton,
                currentBackingTrack?.id === track.id && styles.trackButtonSelected,
              ]}
              onPress={() => setCurrentBackingTrack(track)}
            >
              <Text style={styles.trackButtonText}>{track.title}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.volumeContainer}>
          <View style={styles.sliderRow}>
            <Ionicons name="person" size={20} color={colors.textSecondary} />
            <Slider
              style={styles.slider}
              value={affirmationVolume}
              onValueChange={setAffirmationVolume}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.text}
            />
          </View>
          <View style={styles.sliderRow}>
            <Ionicons name="musical-notes" size={20} color={colors.textSecondary} />
            <Slider
              style={styles.slider}
              value={backingTrackVolume}
              onValueChange={setBackingTrackVolume}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.text}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    ...commonStyles.title,
    marginBottom: 8,
  },
  subtitle: {
    ...commonStyles.text,
    textAlign: 'center',
    marginBottom: 30,
    color: colors.textSecondary,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  loadingText: {
    ...commonStyles.text,
    marginTop: 10,
    color: colors.primary,
  },
  intentsContainer: {
    gap: 15,
  },
  buttonText: {
    ...commonStyles.text,
    color: colors.text,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 30,
  },
  label: {
    ...commonStyles.subtitle,
    color: colors.textSecondary,
    marginBottom: 15,
  },
  trackSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  trackButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  trackButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  trackButtonText: {
    ...commonStyles.text,
    color: colors.textSecondary,
    fontSize: 14,
  },
  volumeContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: colors.surface,
    borderRadius: 10,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  slider: {
    flex: 1,
    height: 40,
    marginLeft: 10,
  },
});