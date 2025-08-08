import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import Button from '../components/Button';
import { useAffirmationStore } from '../store/affirmationStore';

const VOICE_OPTIONS = [
  { id: 'female-soft', name: 'Female - Soft', description: 'Gentle and calming female voice' },
  { id: 'female-warm', name: 'Female - Warm', description: 'Warm and nurturing female voice' },
  { id: 'male-deep', name: 'Male - Deep', description: 'Deep and resonant male voice' },
  { id: 'male-calm', name: 'Male - Calm', description: 'Calm and soothing male voice' },
  { id: 'neutral-gentle', name: 'Neutral - Gentle', description: 'Gender-neutral gentle voice' },
];

const SPEED_OPTIONS = [
  { id: 'slow', name: 'Slow', value: 0.7, description: 'Relaxed pace for deep relaxation' },
  { id: 'normal', name: 'Normal', value: 1.0, description: 'Standard speaking pace' },
  { id: 'fast', name: 'Fast', value: 1.3, description: 'Faster pace for energizing affirmations' },
];

export default function VoiceSettingsScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const {
    affirmationVolume,
    backingTrackVolume,
    setAffirmationVolume,
    setBackingTrackVolume,
  } = useAffirmationStore();

  const [selectedVoice, setSelectedVoice] = useState('female-soft');
  const [selectedSpeed, setSelectedSpeed] = useState('normal');
  const [fadeInOut, setFadeInOut] = useState(true);
  const [backgroundNoise, setBackgroundNoise] = useState(true);
  const [repeatCount, setRepeatCount] = useState(3);

  if (!fontsLoaded) {
    return null;
  }

  const handleSave = () => {
    // Save settings to store or async storage
    // For now, just navigate back
    router.back();
  };

  const renderVoiceOption = (voice: typeof VOICE_OPTIONS[0]) => (
    <TouchableOpacity
      key={voice.id}
      style={[
        commonStyles.card,
        {
          marginBottom: 12,
          borderColor: selectedVoice === voice.id ? colors.primary : colors.border,
          borderWidth: 2,
        },
      ]}
      onPress={() => setSelectedVoice(voice.id)}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={[commonStyles.text, { fontFamily: 'Inter_600SemiBold', marginBottom: 4 }]}>
            {voice.name}
          </Text>
          <Text style={[commonStyles.textMuted, { fontSize: 14 }]}>
            {voice.description}
          </Text>
        </View>
        {selectedVoice === voice.id && (
          <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSpeedOption = (speed: typeof SPEED_OPTIONS[0]) => (
    <TouchableOpacity
      key={speed.id}
      style={[
        commonStyles.card,
        {
          marginBottom: 12,
          borderColor: selectedSpeed === speed.id ? colors.primary : colors.border,
          borderWidth: 2,
        },
      ]}
      onPress={() => setSelectedSpeed(speed.id)}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={[commonStyles.text, { fontFamily: 'Inter_600SemiBold', marginBottom: 4 }]}>
            {speed.name}
          </Text>
          <Text style={[commonStyles.textMuted, { fontSize: 14 }]}>
            {speed.description}
          </Text>
        </View>
        {selectedSpeed === speed.id && (
          <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={commonStyles.container}>
      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textSecondary} />
          <Text style={[commonStyles.text, { marginLeft: 8 }]}>Back</Text>
        </TouchableOpacity>

        <Text style={[commonStyles.title, { marginBottom: 8 }]}>Voice Settings</Text>
        <Text style={[commonStyles.subtitle, { marginBottom: 30, textAlign: 'left' }]}>
          Customize how your affirmations sound
        </Text>

        {/* Voice Selection */}
        <View style={{ marginBottom: 32 }}>
          <Text style={[commonStyles.subtitle, { textAlign: 'left', marginBottom: 16 }]}>
            Voice Selection
          </Text>
          {VOICE_OPTIONS.map(renderVoiceOption)}
        </View>

        {/* Speed Selection */}
        <View style={{ marginBottom: 32 }}>
          <Text style={[commonStyles.subtitle, { textAlign: 'left', marginBottom: 16 }]}>
            Speaking Speed
          </Text>
          {SPEED_OPTIONS.map(renderSpeedOption)}
        </View>

        {/* Volume Controls */}
        <View style={{ marginBottom: 32 }}>
          <Text style={[commonStyles.subtitle, { textAlign: 'left', marginBottom: 16 }]}>
            Volume Settings
          </Text>
          
          <View style={[commonStyles.card, { marginBottom: 16 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={commonStyles.text}>Affirmation Volume</Text>
              <Text style={commonStyles.textMuted}>{Math.round(affirmationVolume * 100)}%</Text>
            </View>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={0}
              maximumValue={1}
              value={affirmationVolume}
              onValueChange={setAffirmationVolume}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
          </View>

          <View style={commonStyles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={commonStyles.text}>Backing Track Volume</Text>
              <Text style={commonStyles.textMuted}>{Math.round(backingTrackVolume * 100)}%</Text>
            </View>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={0}
              maximumValue={1}
              value={backingTrackVolume}
              onValueChange={setBackingTrackVolume}
              minimumTrackTintColor={colors.secondary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.secondary}
            />
          </View>
        </View>

        {/* Additional Settings */}
        <View style={{ marginBottom: 32 }}>
          <Text style={[commonStyles.subtitle, { textAlign: 'left', marginBottom: 16 }]}>
            Additional Settings
          </Text>

          <View style={[commonStyles.card, { marginBottom: 12 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={[commonStyles.text, { fontFamily: 'Inter_600SemiBold', marginBottom: 4 }]}>
                  Fade In/Out
                </Text>
                <Text style={commonStyles.textMuted}>Smooth audio transitions</Text>
              </View>
              <Switch
                value={fadeInOut}
                onValueChange={setFadeInOut}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={fadeInOut ? colors.text : colors.textMuted}
              />
            </View>
          </View>

          <View style={[commonStyles.card, { marginBottom: 12 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={[commonStyles.text, { fontFamily: 'Inter_600SemiBold', marginBottom: 4 }]}>
                  Background Ambience
                </Text>
                <Text style={commonStyles.textMuted}>Subtle nature sounds</Text>
              </View>
              <Switch
                value={backgroundNoise}
                onValueChange={setBackgroundNoise}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={backgroundNoise ? colors.text : colors.textMuted}
              />
            </View>
          </View>

          <View style={commonStyles.card}>
            <View style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[commonStyles.text, { fontFamily: 'Inter_600SemiBold' }]}>
                  Repeat Count
                </Text>
                <Text style={commonStyles.textMuted}>{repeatCount}x</Text>
              </View>
              <Text style={commonStyles.textMuted}>How many times to repeat affirmations</Text>
            </View>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={1}
              maximumValue={5}
              step={1}
              value={repeatCount}
              onValueChange={setRepeatCount}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
          </View>
        </View>

        <Button text="Save Settings" onPress={handleSave} />
      </ScrollView>
    </View>
  );
}
