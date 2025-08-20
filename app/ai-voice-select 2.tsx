import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import * as Speech from 'expo-speech';
import { useRouter } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import { useVoiceStore } from '../store/voiceStore'; // <-- Import the store

const AIVoiceSelectScreen = () => {
  const [voices, setVoices] = useState<Speech.Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const setSelectedVoice = useVoiceStore((state) => state.setSelectedVoice); // <-- Get setter from store

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
    setSelectedVoice(voice.identifier); // <-- Save selected voice to global store

    router.back();

    // Optional: test speak after a short delay
    setTimeout(() => {
      Speech.speak('This is a test of your selected voice.', {
        voice: voice.identifier,
      });
    }, 300);
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
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleSelectVoice(item)}
            style={{
              padding: 12,
              borderBottomWidth: 1,
              borderBottomColor: '#eee',
              backgroundColor: colors.surface,
              borderRadius: 8,
              marginVertical: 4,
            }}
          >
            <Text style={{ fontSize: 16 }}>{item.name || item.identifier}</Text>
            <Text style={{ fontSize: 12, color: '#555' }}>
              {item.language} • {item.quality}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default AIVoiceSelectScreen;
