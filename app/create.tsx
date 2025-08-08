import { Text, View, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import Button from '../components/Button';

export default function CreateAffirmationScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [title, setTitle] = useState('');
  const [affirmationText, setAffirmationText] = useState('');
  const [selectedMusic, setSelectedMusic] = useState('rain');
  const [selectedVoice, setSelectedVoice] = useState('calm');

  const musicOptions = [
    { id: 'rain', name: 'Gentle Rain', icon: 'rainy' },
    { id: 'ocean', name: 'Ocean Waves', icon: 'water' },
    { id: 'forest', name: 'Forest Sounds', icon: 'leaf' },
    { id: 'piano', name: 'Soft Piano', icon: 'musical-notes' },
  ];

  const voiceOptions = [
    { id: 'calm', name: 'Calm & Soothing' },
    { id: 'warm', name: 'Warm & Gentle' },
    { id: 'deep', name: 'Deep & Relaxing' },
    { id: 'soft', name: 'Soft & Whispered' },
  ];

  if (!fontsLoaded) {
    return null;
  }

  const handleSave = () => {
    if (!title.trim() || !affirmationText.trim()) {
      Alert.alert('Missing Information', 'Please fill in both title and affirmation text.');
      return;
    }

    console.log('Saving affirmation:', { title, affirmationText, selectedMusic, selectedVoice });
    Alert.alert(
      'Affirmation Created!',
      'Your custom affirmation has been saved successfully.',
      [
        {
          text: 'Create Another',
          onPress: () => {
            setTitle('');
            setAffirmationText('');
          }
        },
        {
          text: 'Go to Library',
          onPress: () => router.push('/library')
        }
      ]
    );
  };

  console.log('CreateAffirmationScreen rendered');

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
            Create Affirmation
          </Text>
        </View>

        {/* Title Input */}
        <View style={{ marginBottom: 24 }}>
          <Text style={[commonStyles.text, { fontFamily: 'Inter_600SemiBold', marginBottom: 8 }]}>
            Title
          </Text>
          <TextInput
            style={[commonStyles.input, { fontFamily: 'Inter_400Regular' }]}
            placeholder="Enter affirmation title..."
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Affirmation Text */}
        <View style={{ marginBottom: 24 }}>
          <Text style={[commonStyles.text, { fontFamily: 'Inter_600SemiBold', marginBottom: 8 }]}>
            Affirmation Text
          </Text>
          <TextInput
            style={[commonStyles.input, { fontFamily: 'Inter_400Regular', height: 120, textAlignVertical: 'top' }]}
            placeholder="Write your affirmation here... e.g., 'I am calm, peaceful, and ready for restful sleep. My mind is quiet and my body is relaxed.'"
            placeholderTextColor={colors.textMuted}
            value={affirmationText}
            onChangeText={setAffirmationText}
            multiline
          />
        </View>

        {/* Background Music Selection */}
        <View style={{ marginBottom: 24 }}>
          <Text style={[commonStyles.text, { fontFamily: 'Inter_600SemiBold', marginBottom: 12 }]}>
            Background Music
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {musicOptions.map((music) => (
              <TouchableOpacity
                key={music.id}
                style={[
                  commonStyles.card,
                  {
                    flex: 1,
                    minWidth: '45%',
                    alignItems: 'center',
                    paddingVertical: 16,
                    borderColor: selectedMusic === music.id ? colors.primary : colors.border,
                    borderWidth: 2,
                  }
                ]}
                onPress={() => {
                  console.log(`Selected music: ${music.name}`);
                  setSelectedMusic(music.id);
                }}
              >
                <Ionicons 
                  name={music.icon as any} 
                  size={24} 
                  color={selectedMusic === music.id ? colors.primary : colors.textSecondary} 
                  style={{ marginBottom: 8 }}
                />
                <Text style={[
                  commonStyles.textMuted, 
                  { 
                    fontFamily: 'Inter_400Regular',
                    color: selectedMusic === music.id ? colors.primary : colors.textSecondary,
                    textAlign: 'center'
                  }
                ]}>
                  {music.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Voice Selection */}
        <View style={{ marginBottom: 32 }}>
          <Text style={[commonStyles.text, { fontFamily: 'Inter_600SemiBold', marginBottom: 12 }]}>
            Voice Style
          </Text>
          {voiceOptions.map((voice) => (
            <TouchableOpacity
              key={voice.id}
              style={[
                commonStyles.card,
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderColor: selectedVoice === voice.id ? colors.primary : colors.border,
                  borderWidth: 2,
                  marginBottom: 8,
                }
              ]}
              onPress={() => {
                console.log(`Selected voice: ${voice.name}`);
                setSelectedVoice(voice.id);
              }}
            >
              <Text style={[
                commonStyles.text, 
                { 
                  fontFamily: 'Inter_400Regular',
                  color: selectedVoice === voice.id ? colors.primary : colors.text
                }
              ]}>
                {voice.name}
              </Text>
              {selectedVoice === voice.id && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={{ marginBottom: 40 }}>
          <TouchableOpacity
            style={[buttonStyles.primary, { marginBottom: 16 }]}
            onPress={() => {
              console.log('Generate AI affirmation');
              router.push('/ai-generate');
            }}
          >
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[buttonStyles.primary, { margin: 0 }]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="sparkles" size={20} color={colors.text} style={{ marginRight: 8 }} />
                <Text style={[commonStyles.text, { fontFamily: 'Inter_600SemiBold', color: colors.text }]}>
                  Generate with AI
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={buttonStyles.secondary}
            onPress={handleSave}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="save" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
              <Text style={[commonStyles.text, { fontFamily: 'Inter_600SemiBold', color: colors.textSecondary }]}>
                Save Affirmation
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}