import React, { useState, useEffect } from 'react';
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

interface CreateFormData {
  intent: string;
  tone: string;
  voice: string;
  loopGap: number;
  customTitle?: string;
}

const INTENTS = [
  { id: 'sleep', label: 'Deep Sleep', icon: 'moon', description: 'Peaceful rest and relaxation' },
  { id: 'confidence', label: 'Confidence', icon: 'star', description: 'Self-assurance and empowerment' },
  { id: 'healing', label: 'Healing', icon: 'heart', description: 'Physical and emotional wellness' },
  { id: 'abundance', label: 'Abundance', icon: 'diamond', description: 'Prosperity and success' },
  { id: 'love', label: 'Self-Love', icon: 'heart-circle', description: 'Self-acceptance and compassion' },
  { id: 'focus', label: 'Focus', icon: 'eye', description: 'Mental clarity and concentration' },
];

const TONES = [
  { id: 'soft', label: 'Soft & Gentle', description: 'Calm and soothing delivery' },
  { id: 'neutral', label: 'Neutral', description: 'Balanced and clear delivery' },
  { id: 'uplifting', label: 'Uplifting', description: 'Energetic and motivating delivery' },
];

const VOICES = [
  { id: 'soft_female', label: 'Soft Female', description: 'Gentle and nurturing voice' },
  { id: 'calm_male', label: 'Calm Male', description: 'Deep and reassuring voice' },
  { id: 'warm_female', label: 'Warm Female', description: 'Friendly and comforting voice' },
  { id: 'gentle_male', label: 'Gentle Male', description: 'Soft and peaceful voice' },
];

export default function CreateScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CreateFormData>({
    intent: '',
    tone: '',
    voice: 'soft_female',
    loopGap: 10,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAffirmations, setGeneratedAffirmations] = useState<string[]>([]);

  const { addAffirmation } = useAffirmationStore();
  const { settings } = useSettingsStore();

  useEffect(() => {
    // Set default values from settings
    setFormData(prev => ({
      ...prev,
      voice: settings.defaultVoice,
      loopGap: settings.defaultLoopGap,
    }));
  }, [settings]);

  if (!fontsLoaded) {
    return null;
  }

  const steps = [
    'Choose Intent',
    'Select Tone',
    'Pick Voice',
    'Set Loop Gap',
    'Review & Generate',
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleGenerate = async () => {
    if (!formData.intent || !formData.tone || !formData.voice) {
      Alert.alert('Error', 'Please complete all steps before generating.');
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
            { text: 'Continue', onPress: () => proceedWithGeneration() },
          ]
        );
        return;
      }

      await proceedWithGeneration();
    } catch (error) {
      console.error('Generation error:', error);
      Alert.alert('Error', 'Failed to generate affirmations. Please try again.');
      setIsGenerating(false);
    }
  };

  const proceedWithGeneration = async () => {
    try {
      // Generate affirmation texts
      const response = await apiService.generateAffirmations({
        intent: formData.intent,
        tone: formData.tone,
        count: 12,
      });

      setGeneratedAffirmations(response.affirmations);

      // Create audio file
      const audioFile = await audioService.createAffirmationAudio(
        response.affirmations,
        formData.voice,
        formData.loopGap
      );

      // Create affirmation record
      const affirmation = {
        id: `affirmation_${Date.now()}`,
        title: formData.customTitle || `${INTENTS.find(i => i.id === formData.intent)?.label} Affirmations`,
        date: new Date().toISOString(),
        intent: formData.intent,
        tone: formData.tone,
        voice: formData.voice,
        loopGap: formData.loopGap,
        audioUri: audioFile.uri,
        duration: `${Math.floor(audioFile.duration / 60)}:${(audioFile.duration % 60).toFixed(0).padStart(2, '0')}`,
        plays: 0,
        affirmationTexts: response.affirmations,
      };

      addAffirmation(affirmation);

      Alert.alert(
        'Success!',
        'Your affirmations have been created successfully.',
        [
          { text: 'Create Another', onPress: () => resetForm() },
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

  const resetForm = () => {
    setCurrentStep(0);
    setFormData({
      intent: '',
      tone: '',
      voice: settings.defaultVoice,
      loopGap: settings.defaultLoopGap,
    });
    setGeneratedAffirmations([]);
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {steps.map((step, index) => (
        <View key={index} style={styles.stepItem}>
          <View
            style={[
              styles.stepCircle,
              {
                backgroundColor: index <= currentStep ? colors.primary : colors.surface,
                borderColor: index <= currentStep ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                { color: index <= currentStep ? colors.text : colors.textSecondary },
              ]}
            >
              {index + 1}
            </Text>
          </View>
          {index < steps.length - 1 && (
            <View
              style={[
                styles.stepLine,
                { backgroundColor: index < currentStep ? colors.primary : colors.border },
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderIntentStep = () => (
    <View style={styles.stepContent}>
      <Text style={[commonStyles.title, { fontFamily: 'Inter_700Bold', marginBottom: 8 }]}>
        What's your intention?
      </Text>
      <Text style={[commonStyles.subtitle, { fontFamily: 'Inter_400Regular', marginBottom: 24 }]}>
        Choose the focus for your affirmations
      </Text>

      {INTENTS.map((intent) => (
        <TouchableOpacity
          key={intent.id}
          style={[
            styles.optionCard,
            formData.intent === intent.id && styles.selectedCard,
          ]}
          onPress={() => setFormData({ ...formData, intent: intent.id })}
        >
          <View style={styles.optionContent}>
            <Ionicons
              name={intent.icon as any}
              size={24}
              color={formData.intent === intent.id ? colors.primary : colors.textSecondary}
            />
            <View style={styles.optionText}>
              <Text
                style={[
                  styles.optionTitle,
                  { color: formData.intent === intent.id ? colors.primary : colors.text },
                ]}
              >
                {intent.label}
              </Text>
              <Text style={styles.optionDescription}>{intent.description}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderToneStep = () => (
    <View style={styles.stepContent}>
      <Text style={[commonStyles.title, { fontFamily: 'Inter_700Bold', marginBottom: 8 }]}>
        Choose your tone
      </Text>
      <Text style={[commonStyles.subtitle, { fontFamily: 'Inter_400Regular', marginBottom: 24 }]}>
        How should your affirmations feel?
      </Text>

      {TONES.map((tone) => (
        <TouchableOpacity
          key={tone.id}
          style={[
            styles.optionCard,
            formData.tone === tone.id && styles.selectedCard,
          ]}
          onPress={() => setFormData({ ...formData, tone: tone.id })}
        >
          <View style={styles.optionContent}>
            <View style={styles.optionText}>
              <Text
                style={[
                  styles.optionTitle,
                  { color: formData.tone === tone.id ? colors.primary : colors.text },
                ]}
              >
                {tone.label}
              </Text>
              <Text style={styles.optionDescription}>{tone.description}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderVoiceStep = () => (
    <View style={styles.stepContent}>
      <Text style={[commonStyles.title, { fontFamily: 'Inter_700Bold', marginBottom: 8 }]}>
        Select voice
      </Text>
      <Text style={[commonStyles.subtitle, { fontFamily: 'Inter_400Regular', marginBottom: 24 }]}>
        Choose the voice for your affirmations
      </Text>

      {VOICES.map((voice) => (
        <TouchableOpacity
          key={voice.id}
          style={[
            styles.optionCard,
            formData.voice === voice.id && styles.selectedCard,
          ]}
          onPress={() => setFormData({ ...formData, voice: voice.id })}
        >
          <View style={styles.optionContent}>
            <Ionicons
              name="mic"
              size={24}
              color={formData.voice === voice.id ? colors.primary : colors.textSecondary}
            />
            <View style={styles.optionText}>
              <Text
                style={[
                  styles.optionTitle,
                  { color: formData.voice === voice.id ? colors.primary : colors.text },
                ]}
              >
                {voice.label}
              </Text>
              <Text style={styles.optionDescription}>{voice.description}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderLoopGapStep = () => (
    <View style={styles.stepContent}>
      <Text style={[commonStyles.title, { fontFamily: 'Inter_700Bold', marginBottom: 8 }]}>
        Set loop gap
      </Text>
      <Text style={[commonStyles.subtitle, { fontFamily: 'Inter_400Regular', marginBottom: 24 }]}>
        Time between affirmation repetitions
      </Text>

      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Gap: {formData.loopGap} minutes</Text>
        <View style={styles.sliderButtons}>
          {[5, 10, 15, 20, 30].map((minutes) => (
            <TouchableOpacity
              key={minutes}
              style={[
                styles.sliderButton,
                formData.loopGap === minutes && styles.selectedSliderButton,
              ]}
              onPress={() => setFormData({ ...formData, loopGap: minutes })}
            >
              <Text
                style={[
                  styles.sliderButtonText,
                  { color: formData.loopGap === minutes ? colors.text : colors.textSecondary },
                ]}
              >
                {minutes}m
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.customTitleContainer}>
        <Text style={styles.customTitleLabel}>Custom Title (Optional)</Text>
        <TextInput
          style={styles.customTitleInput}
          placeholder="Enter a custom title for your affirmations"
          placeholderTextColor={colors.textSecondary}
          value={formData.customTitle || ''}
          onChangeText={(text) => setFormData({ ...formData, customTitle: text })}
        />
      </View>
    </View>
  );

  const renderReviewStep = () => (
    <View style={styles.stepContent}>
      <Text style={[commonStyles.title, { fontFamily: 'Inter_700Bold', marginBottom: 8 }]}>
        Review & Generate
      </Text>
      <Text style={[commonStyles.subtitle, { fontFamily: 'Inter_400Regular', marginBottom: 24 }]}>
        Confirm your settings before generating
      </Text>

      <View style={styles.reviewCard}>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Intent:</Text>
          <Text style={styles.reviewValue}>
            {INTENTS.find(i => i.id === formData.intent)?.label}
          </Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Tone:</Text>
          <Text style={styles.reviewValue}>
            {TONES.find(t => t.id === formData.tone)?.label}
          </Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Voice:</Text>
          <Text style={styles.reviewValue}>
            {VOICES.find(v => v.id === formData.voice)?.label}
          </Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Loop Gap:</Text>
          <Text style={styles.reviewValue}>{formData.loopGap} minutes</Text>
        </View>
        {formData.customTitle && (
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Title:</Text>
            <Text style={styles.reviewValue}>{formData.customTitle}</Text>
          </View>
        )}
      </View>

      {isGenerating && (
        <View style={styles.generatingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.generatingText}>
            Generating your personalized affirmations...
          </Text>
        </View>
      )}
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderIntentStep();
      case 1:
        return renderToneStep();
      case 2:
        return renderVoiceStep();
      case 3:
        return renderLoopGapStep();
      case 4:
        return renderReviewStep();
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.intent !== '';
      case 1:
        return formData.tone !== '';
      case 2:
        return formData.voice !== '';
      case 3:
        return formData.loopGap > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <View style={commonStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[commonStyles.title, { fontFamily: 'Inter_700Bold' }]}>
          Create Affirmations
        </Text>
        <View style={styles.placeholder} />
      </View>

      {renderStepIndicator()}

      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        {currentStep < steps.length - 1 ? (
          <TouchableOpacity
            style={[buttonStyles.primary, !canProceed() && styles.disabledButton]}
            onPress={handleNext}
            disabled={!canProceed()}
          >
            <LinearGradient
              colors={canProceed() ? [colors.primary, colors.secondary] : [colors.surface, colors.surface]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[buttonStyles.primary, { margin: 0 }]}
            >
              <Text style={[commonStyles.text, { fontFamily: 'Inter_600SemiBold', color: colors.text }]}>
                Next
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[buttonStyles.primary, (isGenerating || !canProceed()) && styles.disabledButton]}
            onPress={handleGenerate}
            disabled={isGenerating || !canProceed()}
          >
            <LinearGradient
              colors={!isGenerating && canProceed() ? [colors.primary, colors.secondary] : [colors.surface, colors.surface]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[buttonStyles.primary, { margin: 0 }]}
            >
              <Text style={[commonStyles.text, { fontFamily: 'Inter_600SemiBold', color: colors.text }]}>
                {isGenerating ? 'Generating...' : 'Generate Affirmations'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
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
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  stepLine: {
    width: 40,
    height: 2,
    marginHorizontal: 8,
  },
  stepContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  optionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    marginLeft: 16,
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  sliderContainer: {
    marginBottom: 24,
  },
  sliderLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  sliderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderButton: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  selectedSliderButton: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  sliderButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  customTitleContainer: {
    marginTop: 24,
  },
  customTitleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  customTitleInput: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  reviewValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  generatingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  generatingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
  navigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: colors.background,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

