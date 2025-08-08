import { Text, View, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';

export default function AIGenerateScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [prompt, setPrompt] = useState('');
  const [selectedTone, setSelectedTone] = useState('calming');
  const [selectedLength, setSelectedLength] = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');

  const toneOptions = [
    { id: 'calming', name: 'Calming & Peaceful', icon: 'leaf' },
    { id: 'empowering', name: 'Empowering & Strong', icon: 'flash' },
    { id: 'loving', name: 'Loving & Compassionate', icon: 'heart' },
    { id: 'confident', name: 'Confident & Bold', icon: 'star' },
  ];

  const lengthOptions = [
    { id: 'short', name: 'Short (1-2 min)', description: 'Quick affirmation' },
    { id: 'medium', name: 'Medium (3-5 min)', description: 'Standard length' },
    { id: 'long', name: 'Long (5-8 min)', description: 'Deep meditation' },
  ];

  const samplePrompts = [
    'Help me sleep peacefully and wake up refreshed',
    'Build my confidence for an important presentation',
    'Release stress and anxiety from my day',
    'Cultivate self-love and acceptance',
    'Manifest abundance and success',
    'Heal from past trauma and find peace',
  ];

  if (!fontsLoaded) {
    return null;
  }

  const generateAffirmation = async () => {
    if (!prompt.trim()) {
      Alert.alert('Missing Prompt', 'Please enter what you&apos;d like your affirmation to focus on.');
      return;
    }

    setIsGenerating(true);
    console.log('Generating AI affirmation with:', { prompt, selectedTone, selectedLength });

    // Simulate AI generation (in real app, this would call an AI API)
    setTimeout(() => {
      const mockGeneratedText = `I am calm and at peace. My mind is clear and focused. I release all worries and embrace tranquility. Every breath I take fills me with serenity. I am worthy of rest and relaxation. My body knows how to heal and restore itself. I trust in my ability to find peace within. Tonight, I sleep deeply and wake refreshed. I am grateful for this moment of stillness. Peace flows through every part of my being.`;
      
      setGeneratedText(mockGeneratedText);
      setIsGenerating(false);
      console.log('AI generation completed');
    }, 3000);
  };

  const saveAffirmation = () => {
    if (!generatedText) return;
    
    console.log('Saving AI-generated affirmation');
    Alert.alert(
      'Affirmation Saved!',
      'Your AI-generated affirmation has been saved to your library.',
      [
        {
          text: 'Generate Another',
          onPress: () => {
            setGeneratedText('');
            setPrompt('');
          }
        },
        {
          text: 'Go to Library',
          onPress: () => router.push('/library')
        }
      ]
    );
  };

  console.log('AIGenerateScreen rendered');

  return (
    <View style={commonStyles.container}>
      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 30 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 16 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[commonStyles.title, { fontFamily: 'Inter_700Bold', flex: 1, textAlign: 'left' }]}>
            AI Generate
          </Text>
        </View>

        {/* Prompt Input */}
        <View style={{ marginBottom: 24 }}>
          <Text style={[commonStyles.text, { fontFamily: 'Inter_600SemiBold', marginBottom: 8 }]}>
            What would you like your affirmation to focus on?
          </Text>
          <TextInput
            style={[commonStyles.input, { fontFamily: 'Inter_400Regular', height: 100, textAlignVertical: 'top' }]}
            placeholder="e.g., I want to feel more confident and peaceful before sleep..."
            placeholderTextColor={colors.textMuted}
            value={prompt}
            onChangeText={setPrompt}
            multiline
          />
        </View>

        {/* Sample Prompts */}
        <View style={{ marginBottom: 24 }}>
          <Text style={[commonStyles.text, { fontFamily: 'Inter_600SemiBold', marginBottom: 12 }]}>
            Or try one of these:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 12, paddingRight: 20 }}>
              {samplePrompts.map((samplePrompt, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    backgroundColor: colors.surface,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                    maxWidth: 200,
                  }}
                  onPress={() => {
                    console.log(`Selected sample prompt: ${samplePrompt}`);
                    setPrompt(samplePrompt);
                  }}
                >
                  <Text style={[commonStyles.textMuted, { fontFamily: 'Inter_400Regular', fontSize: 14 }]}>
                    {samplePrompt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Tone Selection */}
        <View style={{ marginBottom: 24 }}>
          <Text style={[commonStyles.text, { fontFamily: 'Inter_600SemiBold', marginBottom: 12 }]}>
            Choose a tone:
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {toneOptions.map((tone) => (
              <TouchableOpacity
                key={tone.id}
                style={[
                  commonStyles.card,
                  {
                    flex: 1,
                    minWidth: '45%',
                    alignItems: 'center',
                    paddingVertical: 16,
                    borderColor: selectedTone === tone.id ? colors.primary : colors.border,
                    borderWidth: 2,
                  }
                ]}
                onPress={() => {
                  console.log(`Selected tone: ${tone.name}`);
                  setSelectedTone(tone.id);
                }}
              >
                <Ionicons 
                  name={tone.icon as any} 
                  size={24} 
                  color={selectedTone === tone.id ? colors.primary : colors.textSecondary} 
                  style={{ marginBottom: 8 }}
                />
                <Text style={[
                  commonStyles.textMuted, 
                  { 
                    fontFamily: 'Inter_400Regular',
                    color: selectedTone === tone.id ? colors.primary : colors.textSecondary,
                    textAlign: 'center',
                    fontSize: 12,
                  }
                ]}>
                  {tone.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Length Selection */}
        <View style={{ marginBottom: 32 }}>
          <Text style={[commonStyles.text, { fontFamily: 'Inter_600SemiBold', marginBottom: 12 }]}>
            Affirmation length:
          </Text>
          {lengthOptions.map((length) => (
            <TouchableOpacity
              key={length.id}
              style={[
                commonStyles.card,
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderColor: selectedLength === length.id ? colors.primary : colors.border,
                  borderWidth: 2,
                  marginBottom: 8,
                }
              ]}
              onPress={() => {
                console.log(`Selected length: ${length.name}`);
                setSelectedLength(length.id);
              }}
            >
              <View>
                <Text style={[
                  commonStyles.text, 
                  { 
                    fontFamily: 'Inter_600SemiBold',
                    color: selectedLength === length.id ? colors.primary : colors.text
                  }
                ]}>
                  {length.name}
                </Text>
                <Text style={[
                  commonStyles.textMuted, 
                  { 
                    fontFamily: 'Inter_400Regular',
                    color: selectedLength === length.id ? colors.primary : colors.textMuted,
                    fontSize: 12,
                  }
                ]}>
                  {length.description}
                </Text>
              </View>
              {selectedLength === length.id && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={[buttonStyles.primary, { marginBottom: 24, opacity: isGenerating ? 0.7 : 1 }]}
          onPress={generateAffirmation}
          disabled={isGenerating}
        >
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[buttonStyles.primary, { margin: 0 }]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons 
                name={isGenerating ? "hourglass" : "sparkles"} 
                size={20} 
                color={colors.text} 
                style={{ marginRight: 8 }} 
              />
              <Text style={[commonStyles.text, { fontFamily: 'Inter_600SemiBold', color: colors.text }]}>
                {isGenerating ? 'Generating...' : 'Generate Affirmation'}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Generated Result */}
        {generatedText && (
          <View style={{ marginBottom: 40 }}>
            <Text style={[commonStyles.text, { fontFamily: 'Inter_600SemiBold', marginBottom: 12 }]}>
              Generated Affirmation:
            </Text>
            <View style={[commonStyles.card, { borderColor: colors.primary, borderWidth: 2 }]}>
              <Text style={[commonStyles.text, { fontFamily: 'Inter_400Regular', lineHeight: 24 }]}>
                {generatedText}
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <TouchableOpacity
                style={[buttonStyles.secondary, { flex: 1 }]}
                onPress={generateAffirmation}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="refresh" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
                  <Text style={[commonStyles.text, { fontFamily: 'Inter_600SemiBold', color: colors.textSecondary }]}>
                    Regenerate
                  </Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[buttonStyles.primary, { flex: 1 }]}
                onPress={saveAffirmation}
              >
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[buttonStyles.primary, { margin: 0 }]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="save" size={20} color={colors.text} style={{ marginRight: 8 }} />
                    <Text style={[commonStyles.text, { fontFamily: 'Inter_600SemiBold', color: colors.text }]}>
                      Save
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}