import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import * as Speech from 'expo-speech';
import { useRouter } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import { useVoiceStore } from '../store/voiceStore';

const AIVoiceSelectScreen = () => {
  const [voices, setVoices] = useState<Speech.Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const router = useRouter();
  const setSelectedVoice = useVoiceStore((state) => state.setSelectedVoice);
  const selectedVoice = useVoiceStore((state) => state.selectedVoice);

  useEffect(() => {
    const loadVoices = async () => {
      try {
        const availableVoices = await Speech.getAvailableVoicesAsync();
        setVoices(availableVoices);
      } catch (err) {
        Alert.alert('Error', 'Could not load voices.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadVoices();
  }, []);

  const handleSelectVoice = (voice: Speech.Voice) => {
    setSelectedVoice(voice.identifier);
    router.back();
  };

  const handlePreviewVoice = (voice: Speech.Voice) => {
    setPreviewingVoice(voice.identifier);
    Speech.speak('This is a preview of your selected voice.', { voice: voice.identifier });
    setTimeout(() => setPreviewingVoice(null), 1500);
  };

  if (loading) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 10 }}>Select a Voice</Text>
      <FlatList
        data={voices}
        keyExtractor={(item) => item.identifier}
        renderItem={({ item }) => {
          const isSelected = selectedVoice === item.identifier;
          return (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 12,
                marginVertical: 4,
                backgroundColor: colors.surface,
                borderRadius: 8,
                borderWidth: isSelected ? 2 : 0,
                borderColor: colors.primary,
              }}
            >
              <TouchableOpacity onPress={() => handleSelectVoice(item)} style={{ flex: 1 }}>
                <Text style={{ fontSize: 16 }}>{item.name || item.identifier}</Text>
                <Text style={{ fontSize: 12, color: '#555' }}>
                  {item.language} • {item.quality}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handlePreviewVoice(item)}
                style={{ padding: 6, backgroundColor: colors.primary, borderRadius: 6 }}
              >
                <Text style={{ color: '#fff', fontSize: 12 }}>
                  {previewingVoice === item.identifier ? 'Previewing...' : 'Preview'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
};

export default AIVoiceSelectScreen;
