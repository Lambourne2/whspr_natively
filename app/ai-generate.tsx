import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { useAffirmationStore } from '../store/affirmationStore';
import { useSettingsStore } from '../store/settingsStore';
import { apiService } from '../services/apiService';
import { audioService } from '../services/audioService';

const QUICK_PROMPTS = [
  {
    id: 'sleep-anxiety',
    title: 'Sleep & Anxiety Relief',
    prompt: 'I need help falling asleep and reducing anxiety',
    intent: 'sleep',
    tone: 'soft',
  },
  {
    id: 'morning-confidence',
    title: 'Morning Confidence Boost',
    prompt: 'I want to start my day with confidence and energy',
    intent: 'confidence',
    tone: 'uplifting',
  },
  {
    id: 'self-love',
    title: 'Self-Love & Acceptance',
    prompt: 'I want to practice self-love and acceptance',
    intent: 'love',
    tone: 'soft',
  },
  {
    id: 'healing-recovery',
    title: 'Healing & Recovery',
    prompt: 'I need support for healing and recovery',
    intent: 'healing',
    tone: 'neutral',
  },
  {
    id: 'abundance-success',
    title: 'Abundance & Success',
    prompt: 'I want to attract abundance and success',
    intent: 'abundance',
    tone: 'uplifting',
  },
  {
    id: 'focus-productivity',
    title: 'Focus & Productivity',
    prompt: 'I need better focus and productivity',
    intent: 'focus',
    tone: 'neutral',
  },
];

export default function AIGenerateScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  const { addAffirmation } = useAffirmationStore();
  const { settings } = useSettingsStore();

  if (!fontsLoaded) {
    return null;
  }

  const handleQuickGenerate = async (prompt: typeof QUICK_PROMPTS[0]) => {
    if (!settings.openRouterApiKey || !settings.elevenLabsApiKey) {
      Alert.alert(
        'API Keys Required',
        'Please configure your OpenRouter and ElevenLabs API keys in Settings before generating affirmations.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Settings', onPress: () => router.push('/settings') },
        ]
      );
      return;
    }

    setSelectedPrompt(prompt.id);
    setIsGenerating(true);

    try {
      // Check ElevenLabs quota
      const quota = await apiService.checkQuota();
      if (quota.remaining < settings.elevenLabsQuotaThreshold) {
        Alert.alert(
          'Low Quota Warning',
          `You have ${quota.remaining} characters remaining in your ElevenLabs quota. Continue anyway?`,
          [
            { text: 'Cancel', style: 'cancel', onPress: () => {
              setIsGenerating(false);
              setSelectedPrompt(null);
            }},
            { text: 'Continue', onPress: () => proceedWithGeneration(prompt) },
          ]
        );
        return;
      }

      await proceedWithGeneration(prompt);
    } catch (error) {
      console.error('Generation error:', error);
      Alert.alert('Error', 'Failed to generate affirmations. Please try again.');
      setIsGenerating(false);
      setSelectedPrompt(null);
    }
  };

  const handleCustomGenerate = async () => {
    if (!customPrompt.trim()) {
      Alert.alert('Error', 'Please enter a custom prompt.');
      return;
    }

    if (!settings.openRouterApiKey || !settings.elevenLabsApiKey) {
      Alert.alert(
        'API Keys Required',
        'Please configure your OpenRouter and ElevenLabs API keys in Settings before generating affirmations.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Settings', onPress: () => router.push('/settings') },
        ]
      );
      return;
    }

    setIsGenerating(true);

    try {
      // Check ElevenLabs quota
      const quota = await apiService.checkQuota();
      if (quota.remaining < settings.elevenLabsQuotaThreshold) {
        Alert.alert(
          'Low Quota Warning',
          `You have ${quota.remaining} characters remaining in your ElevenLabs quota. Continue anyway?`,
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setIsGenerating(false) },
            { text: 'Continue', onPress: () => proceedWithCustomGeneration() },
          ]
        );
        return;
      }

      await proceedWithCustomGeneration();
    } catch (error) {
      console.error('Generation error:', error);
      Alert.alert('Error', 'Failed to generate affirmations. Please try again.');
      setIsGenerating(false);
    }
  };

  const proceedWithGeneration = async (prompt: typeof QUICK_PROMPTS[0]) => {
    try {
      // Generate affirmation texts
      const response = await apiService.generateAffirmations({
        intent: prompt.intent,
        tone: prompt.tone,
        count: 10,
      });

      // Create audio file
      const audioFile = await audioService.createAffirmationAudio(
        response.affirmations,
        settings.defaultVoice,
        settings.defaultLoopGap
      );

      // Create affirmation record
      const affirmation = {
        id: `affirmation_${Date.now()}`,
        title: prompt.title,
        date: new Date().toISOString(),
        intent: prompt.intent,
        tone: prompt.tone,
        voice: settings.defaultVoice,
        loopGap: settings.defaultLoopGap,
        mp3Uri: audioFile.uri,
        duration: `${Math.floor(audioFile.duration / 60)}:${(audioFile.duration % 60).toFixed(0).padStart(2, '0')}`,
        plays: 0,
        affirmationTexts: response.affirmations,
      };

      addAffirmation(affirmation);

      Alert.alert(
        'Success!',
        'Your affirmations have been created successfully.',
        [
          { text: 'Create Another', onPress: () => {
            setSelectedPrompt(null);
            setCustomPrompt('');
          }},
          { text: 'Play Now', onPress: () => router.push(`/player?id=${affirmation.id}`) },
        ]
      );
    } catch (error) {
      console.error('Generation error:', error);
      Alert.alert('Error', 'Failed to generate affirmations. Please try again.');
    } finally {
      setIsGenerating(false);
      setSelectedPrompt(null);
    }
  };

  const proceedWithCustomGeneration = async () => {
    try {
      // For custom prompts, we'll use a general approach
      const response = await apiService.generateAffirmations({
        intent: 'custom',
        tone: 'neutral',
        count: 10,
      });

      // Create audio file
      const audioFile = await audioService.createAffirmationAudio(
        response.affirmations,
        settings.defaultVoice,
        settings.defaultLoopGap
      );

      // Create affirmation record
      const affirmation = {
        id: `affirmation_${Date.now()}`,
        title: 'Custom Affirmations',
        date: new Date().toISOString(),
        intent: 'custom',
        tone: 'neutral',
        voice: settings.defaultVoice,
        loopGap: settings.defaultLoopGap,
        mp3Uri: audioFile.uri,
        duration: `${Math.floor(audioFile.duration / 60)}:${(audioFile.duration % 60).toFixed(0).padStart(2, '0')}`,
        plays: 0,
        affirmationTexts: response.affirmations,
      };

      addAffirmation(affirmation);

      Alert.alert(
        'Success!',
        'Your custom affirmations have been created successfully.',
        [
          { text: 'Create Another', onPress: () => setCustomPrompt('') },
          { text: 'Play Now', onPress: () => router.push(`/player?id=${affirmation.id}`) },
        ]
      );
    } catch (error) {
      console.error('Generation error:', error);
      Alert.alert('Error', 'Failed to generate affirmations. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={commonStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[commonStyles.title, { fontFamily: 'Inter_700Bold' }]}>
          AI Generate
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <Ionicons name="sparkles" size={40} color={colors.text} />
          </LinearGradient>
          <Text style={[commonStyles.title, { fontFamily: 'Inter_700Bold', marginTop: 16 }]}>
            AI-Powered Affirmations
          </Text>
          <Text style={[commonStyles.subtitle, { fontFamily: 'Inter_400Regular', textAlign: 'center' }]}>
            Let AI create personalized affirmations based on your needs
          </Text>
        </View>

        {/* Quick Prompts */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontFamily: 'Inter_600SemiBold' }]}>
            Quick Generate
          </Text>
          <Text style={[styles.sectionSubtitle, { fontFamily: 'Inter_400Regular' }]}>
            Choose from popular affirmation themes
          </Text>

          {QUICK_PROMPTS.map((prompt) => (
            <TouchableOpacity
              key={prompt.id}
              style={[
                styles.promptCard,
                selectedPrompt === prompt.id && isGenerating && styles.generatingCard,
              ]}
              onPress={() => handleQuickGenerate(prompt)}
              disabled={isGenerating}
            >
              <View style={styles.promptContent}>
                <View style={styles.promptText}>
                  <Text style={[styles.promptTitle, { fontFamily: 'Inter_600SemiBold' }]}>
                    {prompt.title}
                  </Text>
                  <Text style={[styles.promptDescription, { fontFamily: 'Inter_400Regular' }]}>
                    {prompt.prompt}
                  </Text>
                </View>
                {selectedPrompt === prompt.id && isGenerating ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Ionicons name="arrow-forward" size={20} color={colors.textSecondary} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom Prompt */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontFamily: 'Inter_600SemiBold' }]}>
            Custom Prompt
          </Text>
          <Text style={[styles.sectionSubtitle, { fontFamily: 'Inter_400Regular' }]}>
            Describe what you need affirmations for
          </Text>

          <TextInput
            style={styles.customInput}
            placeholder="e.g., I need help with public speaking confidence..."
            placeholderTextColor={colors.textSecondary}
            value={customPrompt}
            onChangeText={setCustomPrompt}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[
              buttonStyles.primary,
              (!customPrompt.trim() || isGenerating) && styles.disabledButton,
            ]}
            onPress={handleCustomGenerate}
            disabled={!customPrompt.trim() || isGenerating}
          >
            <LinearGradient
              colors={customPrompt.trim() && !isGenerating ? [colors.primary, colors.secondary] : [colors.surface, colors.surface]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[buttonStyles.primary, { margin: 0 }]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {isGenerating && !selectedPrompt ? (
                  <ActivityIndicator size="small" color={colors.text} style={{ marginRight: 8 }} />
                ) : (
                  <Ionicons name="sparkles" size={20} color={colors.text} style={{ marginRight: 8 }} />
                )}
                <Text style={[commonStyles.text, { fontFamily: 'Inter_600SemiBold', color: colors.text }]}>
                  {isGenerating && !selectedPrompt ? 'Generating...' : 'Generate Custom Affirmations'}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={[styles.sectionTitle, { fontFamily: 'Inter_600SemiBold' }]}>
            Tips for Better Results
          </Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="bulb" size={16} color={colors.primary} />
              <Text style={[styles.tipText, { fontFamily: 'Inter_400Regular' }]}>
                Be specific about your goals and challenges
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="heart" size={16} color={colors.primary} />
              <Text style={[styles.tipText, { fontFamily: 'Inter_400Regular' }]}>
                Focus on positive outcomes you want to achieve
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="time" size={16} color={colors.primary} />
              <Text style={[styles.tipText, { fontFamily: 'Inter_400Regular' }]}>
                Mention when you plan to use the affirmations
              </Text>
            </View>
          </View>
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
  placeholder: {
    width: 40,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  heroGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    color: colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  promptCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  generatingCard: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  promptContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promptText: {
    flex: 1,
    marginRight: 12,
  },
  promptTitle: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  promptDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  customInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
    minHeight: 100,
  },
  disabledButton: {
    opacity: 0.5,
  },
  tipsSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  tipsList: {
    marginTop: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 12,
    flex: 1,
  },
});

