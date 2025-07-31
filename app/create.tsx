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
import Header from '../components/Header';
import { useAffirmationStore } from '../store/affirmationStore';
import { generateAffirmation } from '../services/aiService';

const INTENTIONS = [
  'Deep Sleep',
  'Stress Relief',
  'Self-Love',
  'Confidence',
  'Gratitude',
  'Healing',
  'Success',
  'Inner Peace',
  'Anxiety Relief',
  'Positive Energy',
];

const TONES = [
  'Gentle & Calming',
  'Empowering',
  'Nurturing',
  'Uplifting',
  'Grounding',
  'Soothing',
];

const VOICES = [
  'Female - Soft',
  'Female - Warm',
  'Male - Deep',
  'Male - Calm',
  'Neutral - Gentle',
];

export default function CreateAffirmationScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [selectedIntention, setSelectedIntention] = useState('');
  const [selectedTone, setSelectedTone] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [customText, setCustomText] = useState('');
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loopGap, setLoopGap] = useState(3);

  const { addAffirmation, backingTracks } = useAffirmationStore();

  if (!fontsLoaded) {
    return null;
  }

  const handleGenerate = async () => {
    if (!selectedIntention || !selectedTone || !selectedVoice || !title.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    setIsGenerating(true);
    try {
      const affirmationData = {
        intention: selectedIntention,
        tone: selectedTone,
        voice: selectedVoice,
        ...(customText.trim() && { customText: customText.trim() }),
      };

      const generatedAffirmation = await generateAffirmation(affirmationData);
      
      const newAffirmation = {
        id: Date.now().toString(),
        title: title.trim(),
        date: new Date().toISOString().split('T')[0] || new Date().toISOString(),
        intent: selectedIntention,
        tone: selectedTone,
        voice: selectedVoice,
        loopGap,
        audioUri: generatedAffirmation.audioUri,
        duration: generatedAffirmation.duration,
        plays: 0,
        affirmationTexts: generatedAffirmation.texts,
      };

      addAffirmation(newAffirmation);
      Alert.alert('Success!', 'Your affirmation has been created.', [
        { text: 'OK', onPress: () => router.push('/library') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate affirmation. Please try again.');
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderSelector = (
    title: string,
    options: string[],
    selected: string,
    onSelect: (value: string) => void
  ) => (
    <View style={{ marginBottom: 24 }}>
      <Text style={[commonStyles.subtitle, { textAlign: 'left', marginBottom: 12 }] }>{title}</Text>
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

  return (
    <KeyboardAvoidingView
      style={commonStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        <View style={{ paddingTop: 20 }}>
          <Header 
            title="Create Affirmation" 
            showBackButton 
            onBackPress={() => router.back()}
            subtitle="Customize your perfect sleep affirmation"
          />

          {/* Title */}
          <View style={{ marginBottom: 24 }}>
            <Input
              placeholder="Give your affirmation a name..."
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Intention */}
          {renderSelector('Intention', INTENTIONS, selectedIntention, setSelectedIntention)}

          {/* Tone */}
          {renderSelector('Tone', TONES, selectedTone, setSelectedTone)}

          {/* Voice */}
          {renderSelector('Voice', VOICES, selectedVoice, setSelectedVoice)}

          {/* Loop Gap */}
          <View style={{ marginBottom: 24 }}>
            <Text style={[commonStyles.subtitle, { textAlign: 'left', marginBottom: 12 }]}>Gap Between Repetitions: {loopGap}s</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Button
                text="-"
                onPress={() => setLoopGap(Math.max(1, loopGap - 1))}
                variant="secondary"
                style={{ padding: 8, marginRight: 12, minWidth: 40 }}
              />
              <View style={{ flex: 1, height: 2, backgroundColor: colors.border }}>
                <View
                  style={{
                    width: `${(loopGap / 10) * 100}%`,
                    height: 2,
                    backgroundColor: colors.primary,
                  }}
                />
              </View>
              <Button
                text="+"
                onPress={() => setLoopGap(Math.min(10, loopGap + 1))}
                variant="secondary"
                style={{ padding: 8, marginLeft: 12, minWidth: 40 }}
              />
            </View>
          </View>

          {/* Custom Text (Optional) */}
          <View style={{ marginBottom: 24 }}>
            <Text style={[commonStyles.subtitle, { textAlign: 'left', marginBottom: 12 }]}>Custom Text (Optional)</Text>
            <Input
              placeholder="Add any specific affirmations you'd like to include..."
              value={customText}
              onChangeText={setCustomText}
              multiline
              style={{ minHeight: 80 }}
            />
          </View>

          {/* Generate Button */}
          <Button
            text={isGenerating ? 'Generating...' : 'Create Affirmation'}
            onPress={handleGenerate}
            disabled={isGenerating}
          />

          {isGenerating && (
            <View style={{ alignItems: 'center', marginTop: 16 }}>
              <Text style={commonStyles.textMuted}>This may take a moment...</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
