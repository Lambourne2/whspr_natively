import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView, 
  Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons'; // For back arrow
import Header from '../components/Header';
import Button from '../components/Button';
import { commonStyles, colors } from '../styles/commonStyles';

const INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS = 1;
const INTERRUPTION_MODE_ANDROID_DUCK_OTHERS = 1;

const AUDIO_TRACKS = [
  { name: '48hz Theta Waves', file: require('../assets/audio/48hzThetaWaves.mp3') },
  { name: '54hz Delta Waves', file: require('../assets/audio/054hzDeltaWaves.mp3') },
  { name: "423hz Earth's Frequency", file: require('../assets/audio/423hzEarthsNaturalFrequency.mp3') },
  { name: '528hz Love Frequency', file: require('../assets/audio/528hzLoveFrequency.mp3') },
  { name: '813hz Alpha Waves', file: require('../assets/audio/813hzAlphaWaves.mp3') },
  { name: '852hz Third Eye Chakra', file: require('../assets/audio/852hzThirdEyeChakra.mp3') },
];

type AudioTrack = typeof AUDIO_TRACKS[number];

export default function CreateTrackScreen() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [affirmationText, setAffirmationText] = useState('');
  const [aiVoiceEnabled, setAiVoiceEnabled] = useState(false);
  const [voiceRecordEnabled, setVoiceRecordEnabled] = useState(false);
  const [affirmationVolume, setAffirmationVolume] = useState(0.8);
  const [backingTrackVolume, setBackingTrackVolume] = useState(1);
  const [duration, setDuration] = useState(10);

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordedURI, setRecordedURI] = useState<string | null>(null);
  const [recordedSound, setRecordedSound] = useState<Audio.Sound | null>(null);

  const audioPlaybackRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      if (audioPlaybackRef.current) {
        audioPlaybackRef.current.stopAsync().catch(() => {});
        audioPlaybackRef.current.unloadAsync().catch(() => {});
        audioPlaybackRef.current = null;
      }
      if (recordedSound) {
        recordedSound.unloadAsync().catch(() => {});
      }
    };
  }, [recordedSound]);

  useEffect(() => {
    if (audioPlaybackRef.current) {
      audioPlaybackRef.current.setVolumeAsync(backingTrackVolume).catch(() => {});
    }
  }, [backingTrackVolume]);

  const toggleAudio = useCallback(
    async (track: AudioTrack) => {
      try {
        if (audioPlaybackRef.current) {
          await audioPlaybackRef.current.setVolumeAsync(backingTrackVolume * 0.3);
          await audioPlaybackRef.current.unloadAsync();
          audioPlaybackRef.current = null;
        }
        const { sound } = await Audio.Sound.createAsync(track.file, {
          shouldPlay: true,
          isLooping: true,
        });
        audioPlaybackRef.current = sound;
        await sound.setVolumeAsync(backingTrackVolume);
        await sound.playAsync();
        setSelectedTrack(track.name);
      } catch (error) {
        console.error('Error toggling audio:', error);
      }
    },
    [backingTrackVolume]
  );

  const toggleSwitch = useCallback((type: 'ai' | 'record') => {
    if (type === 'ai') {
      setAiVoiceEnabled(true);
      setVoiceRecordEnabled(false);
    } else {
      setAiVoiceEnabled(false);
      setVoiceRecordEnabled(true);
    }
  }, []);

  // 1. Pause backing track when starting recording
const startRecording = async () => {
  try {
    // Request permissions etc (your existing code)...
    
    // Pause backing audio if playing
    if (audioPlaybackRef.current) {
      await audioPlaybackRef.current.pauseAsync();
    }

    // Continue your recording start code here...
  } catch (err) {
    console.error('Failed to start recording', err);
  }
};

// 2. Resume backing track after recording stops
const stopRecording = async () => {
  try {
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecordedURI(uri);
    setRecording(null);

    // Resume backing audio if paused
    if (audioPlaybackRef.current) {
      await audioPlaybackRef.current.playAsync();
    }
  } catch (err) {
    console.error('Failed to stop recording', err);
  }
};

// 3. Play recorded voice + backing audio together
const playRecording = async () => {
  if (!recordedURI) return;

  try {
    // Play backing audio if not playing
    if (audioPlaybackRef.current) {
      const status = await audioPlaybackRef.current.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await audioPlaybackRef.current.playAsync();
      }
      await audioPlaybackRef.current.setVolumeAsync(backingTrackVolume);
    }

    // Play recorded voice on top
    if (recordedSound) {
      await recordedSound.unloadAsync();
    }
    const { sound } = await Audio.Sound.createAsync({ uri: recordedURI });
    setRecordedSound(sound);
    await sound.setVolumeAsync(affirmationVolume);
    await sound.playAsync();

    // Optional: You might want to sync start times here for better alignment
  } catch (err) {
    console.error('Failed to play recording', err);
  }
};
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[commonStyles.container, { paddingHorizontal: 16 }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Back Button and Centered Title + Subtitle */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 16 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
            <Feather name="arrow-left" size={28} color={colors.text} />
          </TouchableOpacity>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 28,
                fontWeight: '700',
                color: colors.text,
                textAlign: 'center',
              }}
              accessibilityRole="header"
            >
              Create Track
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: colors.textSecondary,
                marginTop: 4,
                textAlign: 'center',
              }}
            >
              Build your personalized meditation journey
            </Text>
          </View>

          <View style={{ width: 40 }} />
        </View>

        {/* Track Title Input */}
        <TextInput
          placeholder="Enter track title"
          value={title}
          onChangeText={setTitle}
          style={commonStyles.input}
          accessibilityLabel="Track title input"
        />

        {/* Backing Tracks Grid */}
        <Text style={[commonStyles.subtitle, { marginTop: 24, marginBottom: 12 }]}>
          Select Backing Track
        </Text>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          {AUDIO_TRACKS.map((track) => (
            <TouchableOpacity
              key={track.name}
              onPress={() => toggleAudio(track)}
              style={{
                width: '30%', // 3 per row
                padding: 12,
                borderRadius: 12,
                backgroundColor: selectedTrack === track.name ? colors.primary : colors.surface,
                marginBottom: 16,
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 80,
              }}
              accessibilityRole="button"
              accessibilityLabel={`Select backing track ${track.name}`}
            >
              <Text
                style={{
                  color: selectedTrack === track.name ? '#fff' : colors.textMuted,
                  fontSize: 14,
                  textAlign: 'center',
                }}
              >
                {track.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Affirmations Input */}
        <Text style={[commonStyles.subtitle, { marginTop: 24 }]}>Affirmations</Text>
        <TextInput
          placeholder="Write your own affirmations..."
          value={affirmationText}
          onChangeText={setAffirmationText}
          multiline
          style={[commonStyles.input, { minHeight: 80 }]}
          accessibilityLabel="Affirmations input"
        />
        <Text style={commonStyles.textMuted}>
          Write your own affirmations above. You can use AI Voice to speak it or record your own voice.
        </Text>

        {/* AI Voice / Record Switch Buttons */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 16 }}>
          <Button
            text="AI Voice"
            onPress={() => toggleSwitch('ai')}
            variant={aiVoiceEnabled ? 'primary' : 'secondary'}
            style={{ paddingVertical: 6, paddingHorizontal: 12 }}
          />
          <Button
            text="AI Generate"
            onPress={() => router.push('/ai-generate')}
            variant="secondary"
            style={{ paddingVertical: 6, paddingHorizontal: 12 }}
          />
          <Button
            text="Record"
            onPress={() => toggleSwitch('record')}
            variant={voiceRecordEnabled ? 'primary' : 'secondary'}
            style={{ paddingVertical: 6, paddingHorizontal: 12 }}
          />
        </View>

        {/* Voice Recording Controls */}
        {voiceRecordEnabled && (
          <View style={{ alignItems: 'center', gap: 10, marginBottom: 20 }}>
            {!recording ? (
              <Button text="Start Recording" onPress={startRecording} variant="primary" />
            ) : (
              <Button text="Stop Recording" onPress={stopRecording} variant="secondary" />
            )}
            {recordedURI && (
              <Button text="Play Recording" onPress={playRecording} variant="secondary" />
            )}
          </View>
        )}

        {/* Volume Sliders */}
        <Text style={commonStyles.subtitle}>Affirmation Volume</Text>
        <Slider
          minimumValue={0}
          maximumValue={1}
          step={0.05}
          value={affirmationVolume}
          onValueChange={setAffirmationVolume}
          accessibilityLabel="Adjust affirmation volume"
        />

        <Text style={commonStyles.subtitle}>Backing Track Volume</Text>
        <Slider
          minimumValue={0}
          maximumValue={1}
          step={0.05}
          value={backingTrackVolume}
          onValueChange={setBackingTrackVolume}
          accessibilityLabel="Adjust backing track volume"
        />

        <Text style={commonStyles.subtitle}>Duration: {duration} min</Text>
        <Slider
          minimumValue={1}
          maximumValue={30}
          step={1}
          value={duration}
          onValueChange={setDuration}
          accessibilityLabel="Set track duration in minutes"
        />

        {/* Create Track Button */}
        <Button
          text="Create Track"
          onPress={() => console.log('Saving...')}
          style={{ marginVertical: 24 }}
          accessibilityLabel="Create track button"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
