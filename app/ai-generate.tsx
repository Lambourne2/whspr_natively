import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { commonStyles, colors } from '../styles/commonStyles';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import Header from '../components/Header';
import { useAffirmationStore } from '../store/affirmationStore';
import { generateAffirmation } from '../services/aiService';

const AI_INTENTIONS = [
  'Sleep Better Tonight',
  'Release Daily Stress',
  'Build Self-Confidence',
  'Attract Abundance',
  'Heal Emotional Wounds',
  'Improve Relationships',
  'Boost Creativity',
  'Find Inner Peace',
  'Overcome Limiting Beliefs',
  'Manifest Dreams',
];

const PERSONALITY_TRAITS = [
  'Gentle and Nurturing',
  'Powerful and Confident',
  'Wise and Spiritual',
  'Playful and Light',
  'Grounded and Practical',
  'Creative and Artistic',
];

const DURATION_OPTIONS = [
  { label: '5 minutes', value: 5 },
  { label: '10 minutes', value: 10 },
  { label: '15 minutes', value: 15 },
  { label: '20 minutes', value: 20 },
  { label: '30 minutes', value: 30 },
];

export default function AIGenerateScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [selectedIntention, setSelectedIntention] = useState('');
  const [selectedPersonality, setSelectedPersonality] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(10);
  const [customContext, setCustomContext] = useState('');
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState<string[]>([]);

  const { addAffirmation } = useAffirmationStore();

  if (!fontsLoaded) {
    return null;
  }

  const handleGeneratePreview = async () => {
    if (!selectedIntention || !selectedPersonality || !title.trim()) {
      Alert.alert('Missing Information', 'Please select an intention, personality, and title.');
      return;
    }

    setIsGenerating(true);
    try {
      // Use real AI service instead of mock
      const affirmationData = {
        intention: selectedIntention,
        tone: selectedPersonality,
        voice: 'female-soft',
        customText: customContext,
      };

      const generated = await generateAffirmation(affirmationData);
      setGeneratedPreview(generated.texts);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate affirmation. Please try again.');
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAffirmation = async () => {
    if (generatedPreview.length === 0) {
      Alert.alert('No Preview', 'Please generate a preview first.');
      return;
    }

    setIsGenerating(true);
    try {
      const affirmationData = {
        intention: selectedIntention,
        tone: selectedPersonality,
        voice: 'female-soft', // Default voice for AI generation
        customText: customContext,
      };

      const generatedAffirmation = await generateAffirmation(affirmationData);
      
      const newAffirmation = {
        id: Date.now().toString(),
        title: title.trim(),
        date: new Date().toISOString().split('T')[0] || new Date().toISOString(),
        intent: selectedIntention,
        tone: selectedPersonality,
        voice: 'female-soft',
        loopGap: 3,
        audioUri: generatedAffirmation.audioUri,
        duration: `${selectedDuration}:00`,
        plays: 0,
        affirmationTexts: generatedAffirmation.texts,
      };

      addAffirmation(newAffirmation);
      Alert.alert('Success!', 'Your AI-generated affirmation has been saved.', [
        { text: 'OK', onPress: () => router.push('/library') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save affirmation. Please try again.');
      console.error('Save error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAIPreviewText = (intention: string, personality: string, context: string): string[] => {
    const baseTemplates = {
      'Sleep Better Tonight': [
        'As I prepare for sleep, my mind naturally begins to quiet and calm.',
        'I release the events of this day and welcome peaceful rest.',
        'My body knows exactly how to restore itself during sleep.',
        'I drift easily into deep, restorative sleep.',
      ],
      'Release Daily Stress': [
        'I consciously release all tension and stress from my body.',
        'With each breath, I let go of worry and embrace peace.',
        'Stress melts away as I connect with my inner calm.',
        'I am free from the weight of daily concerns.',
      ],
      'Build Self-Confidence': [
        'I trust in my abilities and inner wisdom completely.',
        'Confidence flows through me naturally and authentically.',
        'I am capable of achieving everything I set my mind to.',
        'I believe in myself and my unique gifts.',
      ],
      'Attract Abundance': [
        'I am a magnet for positive opportunities and experiences.',
        'Abundance flows to me from expected and unexpected sources.',
        'I am open to receiving all the good that life offers.',
        'Prosperity is my natural state of being.',
      ],
      'Heal Emotional Wounds': [
        'I lovingly release past hurts and embrace emotional healing.',
        'My heart is open to giving and receiving love.',
        'I forgive myself and others with compassion.',
        'Every day I grow stronger and more whole.',
      ],
      'Improve Relationships': [
        'I attract loving and supportive relationships into my life.',
        'I communicate with clarity, kindness, and compassion.',
        'My relationships are sources of joy and growth.',
        'I am worthy of deep, meaningful connections.',
      ],
      'Boost Creativity': [
        'Creative ideas flow to me effortlessly and abundantly.',
        'I trust my creative intuition and express myself freely.',
        'My mind is open to innovative solutions and inspiration.',
        'I am a channel for creative expression and beauty.',
      ],
      'Find Inner Peace': [
        'Peace is my natural state of being.',
        'I am centered and calm regardless of external circumstances.',
        'Tranquility fills every cell of my being.',
        'I choose peace over worry in every moment.',
      ],
      'Overcome Limiting Beliefs': [
        'I release all beliefs that no longer serve my highest good.',
        'I am capable of creating positive change in my life.',
        'My potential is unlimited and ever-expanding.',
        'I choose empowering thoughts that support my growth.',
      ],
      'Manifest Dreams': [
        'I am actively creating the life of my dreams.',
        'My dreams are valid and achievable.',
        'I align my thoughts and actions with my deepest desires.',
        'The universe conspires to support my highest aspirations.',
      ],
    };

    let affirmations = baseTemplates[intention as keyof typeof baseTemplates] || baseTemplates['Sleep Better Tonight'];
    
    // Adjust based on personality
    const personalityStyles = {
      'Gentle and Nurturing': (text: string) => text.replace(/\./g, ', with gentle love and care.'),
      'Powerful and Confident': (text: string) => text.replace(/\./g, ', with unwavering confidence and power.'),
      'Wise and Spiritual': (text: string) => text.replace(/\./g, ', guided by inner wisdom and spiritual truth.'),
      'Playful and Light': (text: string) => text.replace(/\./g, ', with joyful lightness and playful ease.'),
      'Grounded and Practical': (text: string) => text.replace(/\./g, ', in practical and grounded ways.'),
      'Creative and Artistic': (text: string) => text.replace(/\./g, ', through creative expression and artistic flow.'),
    };

    const styleAdjuster = personalityStyles[personality as keyof typeof personalityStyles];
    if (styleAdjuster) {
      affirmations = affirmations.map(styleAdjuster);
    }

    // Add context-specific affirmations
    if (context) {
      const contextAffirmations = [
        `Specifically, ${context}`,
        `I focus my intention on ${context}`,
        `My energy aligns with ${context}`,
      ];
      affirmations = [...affirmations, ...contextAffirmations];
    }

    return affirmations.slice(0, 4);
  };

  const renderSelector = (
    title: string,
    options: string[],
    selected: string,
    onSelect: (value: string) => void
  ) => (
    <View style={{ marginBottom: 24 }}>
      <Text style={[commonStyles.subtitle, { textAlign: 'left', marginBottom: 12 }]}>{title}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {options.map((option) => (
          <Button
            key={option}
            text={option}
            onPress={() => onSelect(option)}
            variant={selected === option ? 'primary' : 'secondary'}
            style={{ margin: 4 }}
          />
        ))}
      </View>
    </View>
  );

  const renderDurationSelector = () => (
    <View style={{ marginBottom: 24 }}>
      <Text style={[commonStyles.subtitle, { textAlign: 'left', marginBottom: 12 }]}>Duration</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {DURATION_OPTIONS.map((option) => (
          <Button
            key={option.value}
            text={option.label}
            onPress={() => setSelectedDuration(option.value)}
            variant={selectedDuration === option.value ? 'primary' : 'secondary'}
            style={{ margin: 4 }}
          />
        ))}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={commonStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        <View style={{ paddingTop: 20 }}>
          <Header 
            title="AI Generate" 
            showBackButton 
            onBackPress={() => router.back()}
            subtitle="Let AI create personalized affirmations for you"
          />

          {/* Title */}
          <View style={{ marginBottom: 24 }}>
            <Input
              placeholder="Name your AI affirmation..."
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Intention */}
          {renderSelector('What would you like to focus on?', AI_INTENTIONS, selectedIntention, setSelectedIntention)}

          {/* Personality */}
          {renderSelector('Choose the personality style', PERSONALITY_TRAITS, selectedPersonality, setSelectedPersonality)}

          {/* Duration */}
          {renderDurationSelector()}

          {/* Custom Context */}
          <View style={{ marginBottom: 24 }}>
            <Text style={[commonStyles.subtitle, { textAlign: 'left', marginBottom: 12 }]}>Personal Context (Optional)</Text>
            <Input
              placeholder="Share any specific situations, challenges, or goals you'd like the affirmations to address..."
              value={customContext}
              onChangeText={setCustomContext}
              multiline
              style={{ minHeight: 80 }}
            />
          </View>

          {/* Generate Preview Button */}
          <Button
            text={isGenerating ? 'Generating...' : 'Generate Preview'}
            onPress={handleGeneratePreview}
            disabled={isGenerating}
          />

          {/* Preview Section */}
          {generatedPreview.length > 0 && (
            <View style={{ marginTop: 24, marginBottom: 24 }}>
              <Text style={[commonStyles.subtitle, { textAlign: 'left', marginBottom: 16 }]}>Preview</Text>
              <Card>
                {generatedPreview.map((text, index) => (
                  <View key={index} style={{ marginBottom: 12 }}>
                    <Text style={[commonStyles.text, { fontStyle: 'italic' }]}>"{text}"</Text>
                  </View>
                ))}
              </Card>
              
              <View style={{ marginTop: 16 }}>
                <Button
                  text={isGenerating ? 'Saving...' : 'Save Affirmation'}
                  onPress={handleSaveAffirmation}
                  disabled={isGenerating}
                />
              </View>
            </View>
          )}

          {isGenerating && generatedPreview.length === 0 && (
            <View style={{ alignItems: 'center', marginTop: 16 }}>
              <Text style={commonStyles.textMuted}>AI is crafting your personalized affirmations...</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
