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

import { commonStyles, colors, buttonStyles } from '@/styles/commonStyles';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';


import { audioTitles } from '@/assets/audio/audioAssets';

export default function AffirmationPlayerScreen() {
  const router = useRouter();
  const { addAffirmation } = useAffirmationStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectTrack = (trackKey: string) => {
    const trackTitle = audioTitles[trackKey];

    if (!trackTitle) {
      Alert.alert('Error', 'Selected track is invalid.');
      return;
    }

    const newAffirmation = {
      id: `local_${Date.now()}`,
      title: trackTitle,
      date: new Date().toISOString(),
      intent: trackTitle, // Using title for intent for simplicity
      tone: 'binaural_beat',
      voice: 'local_audio',
      loopGap: 0,
      audioUri: trackKey, // Store the key, not the asset id
      duration: '900', // Approx 15 mins, can be updated later
      plays: 0,
      affirmationTexts: [`Enjoy the soothing tones of ${trackTitle}.`],
    };

    addAffirmation(newAffirmation);
    // Redirect to the sample-tracks-player instead of the main player
    router.push(`/sample-tracks-player?id=${newAffirmation.id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Binaural Beats</Text>
        <Text style={styles.subtitle}>
          Select a frequency to begin your session.
        </Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading your session...</Text>
          </View>
        ) : (
          <View style={styles.intentsContainer}>
            {Object.keys(audioTitles).map((key) => (
              <Pressable
                key={key}
                style={buttonStyles.primary}
                onPress={() => handleSelectTrack(key)}
              >
                <Text style={styles.buttonText}>{audioTitles[key]}</Text>
              </Pressable>
            ))}
          </View>
        )}
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