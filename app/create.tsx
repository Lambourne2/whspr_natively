import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import Button from '../components/Button';
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
        customText: customText.trim() || undefined,
      };

      const generatedAffirmation = await generateAffirmation(affirmationData);
      
      const newAffirmation = {
        id: Date.now().toString(),
        title: title.trim(),
        date: new Date().toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
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
      <Text style={[commonStyles.subtitle, { textAlign: 'left', marginBottom: 12 }] }>
        {title}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              commonStyles.card,
              {
                paddingVertical: 8,
                paddingHorizontal: 16,
                margin: 4,
                backgroundColor: selected === option ? colors.primary : colors.surface,
                borderColor: selected === option ? colors.primary : colors.border,
              },
            ]}
            onPress={() => onSelect(option)}
          >
            <Text
              style={[
                commonStyles.text,
                { fontSize: 14, color: selected === option ? colors.text : colors.textSecondary },
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
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
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textSecondary} />
            <Text style={[commonStyles.text, { marginLeft: 8 }]}>Back</Text>
          </TouchableOpacity>

          <Text style={[commonStyles.title, { marginBottom: 8 }]}>Create Affirmation</Text>
          <Text style={[commonStyles.subtitle, { marginBottom: 30, textAlign: 'left' }]}>
            Customize your perfect sleep affirmation
          </Text>

          {/* Title */}
          <View style={{ marginBottom: 24 }}>
            <Text style={[commonStyles.subtitle, { textAlign: 'left', marginBottom: 12 }]}>
              Title
            </Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Give your affirmation a name..."
              placeholderTextColor={colors.textMuted}
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
            <Text style={[commonStyles.subtitle, { textAlign: 'left', marginBottom: 12 }]}>
              Gap Between Repetitions: {loopGap}s
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => setLoopGap(Math.max(1, loopGap - 1))}
                style={[commonStyles.card, { padding: 8, marginRight: 12 }]}
              >
                <Ionicons name="remove" size={20} color={colors.text} />
              </TouchableOpacity>
              <View style={{ flex: 1, height: 2, backgroundColor: colors.border }}>
                <View
                  style={{
                    width: `${(loopGap / 10) * 100}%`,
                    height: 2,
                    backgroundColor: colors.primary,
                  }}
                />
              </View>
              <TouchableOpacity
                onPress={() => setLoopGap(Math.min(10, loopGap + 1))}
                style={[commonStyles.card, { padding: 8, marginLeft: 12 }]}
              >
                <Ionicons name="add" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Custom Text (Optional) */}
          <View style={{ marginBottom: 24 }}>
            <Text style={[commonStyles.subtitle, { textAlign: 'left', marginBottom: 12 }]}>
              Custom Text (Optional)
            </Text>
            <TextInput
              style={[commonStyles.input, { minHeight: 80, textAlignVertical: 'top' }]}
              placeholder="Add any specific affirmations you'd like to include..."
              placeholderTextColor={colors.textMuted}
              value={customText}
              onChangeText={setCustomText}
              multiline
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
