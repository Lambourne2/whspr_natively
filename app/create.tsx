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
import { Audio } from 'expo-av';  // Audio includes RECORDING_OPTIONS_PRESET_HIGH_QUALITY
import { useRouter } from 'expo-router';
import Header from '../components/Header';
import Button from '../components/Button';
import { commonStyles, colors } from '../styles/commonStyles';


const AUDIO_TRACKS = [
  { name: '48hz Theta Waves', file: require('../assets/audio/48hzThetaWaves.mp3') },
  { name: '54hz Delta Waves', file: require('../assets/audio/054hzDeltaWaves.mp3') },
  { name: "423hz Earth's Frequency", file: require('../assets/audio/423hzEarthsNaturalFrequency.mp3') },
  { name: '528hz Love Frequency', file: require('../assets/audio/528hzLoveFrequency.mp3') },
  { name: '813hz Alpha Waves', file: require('../assets/audio/813hzAlphaWaves.mp3') },
  { name: '852hz Third Eye Chakra', file: require('../assets/audio/852hzThirdEyeChakra.mp3') },
];

type AudioTrack = typeof AUDIO_TRACKS[number];

const recordingOptions = {
  android: {
    extension: '.m4a',
    outputFormat: 2, // MPEG_4
    audioEncoder: 3, // AAC
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
  },
  ios: {
    extension: '.caf',
    audioQuality: 127, // High
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  isMeteringEnabled: true,
};


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
          await audioPlaybackRef.current.stopAsync();
          await audioPlaybackRef.current.unloadAsync();
          audioPlaybackRef.current = null;
        }

        const { sound } = await Audio.Sound.createAsync(track.file, {
          shouldPlay: true,
          isLooping: true,
        });

        audioPlaybackRef.current = sound;

        // Boost backing track volume for better loudness
        const boostedVolume = Math.min(1, backingTrackVolume * 1.6);
        await sound.setVolumeAsync(boostedVolume);

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

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        console.warn('Microphone permission not granted');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const newRecording = new Audio.Recording();
      const recordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: 2, // MPEG_4
          audioEncoder: 3, // AAC
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.caf',
          audioQuality: 127, // High quality
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        isMeteringEnabled: true,
      };      await newRecording.startAsync();

      setRecording(newRecording);
      setRecordedURI(null);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordedURI(uri);
      setRecording(null);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const playRecording = async () => {
    if (!recordedURI) return;

    try {
      if (recordedSound) {
        await recordedSound.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync({ uri: recordedURI });
      setRecordedSound(sound);

      // Boost playback volume for loudness
      const boostedVolume = Math.min(1, affirmationVolume * 2);
      await sound.setVolumeAsync(boostedVolume);

      await sound.playAsync();
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
        <Header
          title="Create Track"
          subtitle="Build your personalized sleep journey"
        />
  
        <TextInput
          placeholder="Enter track title"
          value={title}
          onChangeText={setTitle}
          style={commonStyles.input}
          accessibilityLabel="Track title input"
        />
  
        <Text style={commonStyles.subtitle}>Select Backing Track</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {AUDIO_TRACKS.map((track) => (
            <TouchableOpacity
              key={track.name}
              onPress={() => toggleAudio(track)}
              style={{
                padding: 12,
                borderRadius: 12,
                backgroundColor: selectedTrack === track.name ? colors.primary : colors.surface,
                margin: 6,
              }}
              accessibilityRole="button"
              accessibilityLabel={`Select backing track ${track.name}`}
            >
              <Text style={{ color: selectedTrack === track.name ? '#fff' : colors.textMuted }}>
                {track.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
  
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
  
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 16 }}>
          <Button
            text="AI Voice"
            onPress={() => {
              toggleSwitch('ai');
              router.push({
                pathname: '/ai-voice-select',
                params: { affirmationText },
              });
            }}
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