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
import * as Speech from 'expo-speech';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
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
  const recordedPlaybackRef = useRef<Audio.Sound | null>(null);

  const [isBackingPlaying, setIsBackingPlaying] = useState(false);
  const [isRecordedPlaying, setIsRecordedPlaying] = useState(false);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [recordedPosition, setRecordedPosition] = useState(0);

  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);

  /** Cleanup on unmount */
  useEffect(() => {
    return () => {
      if (audioPlaybackRef.current) {
        audioPlaybackRef.current.stopAsync().catch(() => {});
        audioPlaybackRef.current.unloadAsync().catch(() => {});
        audioPlaybackRef.current = null;
      }
      if (recordedPlaybackRef.current) {
        recordedPlaybackRef.current.stopAsync().catch(() => {});
        recordedPlaybackRef.current.unloadAsync().catch(() => {});
        recordedPlaybackRef.current = null;
      }
      if (recordedSound) {
        recordedSound.unloadAsync().catch(() => {});
      }
    };
  }, [recordedSound]);

  /** Update backing track volume */
  useEffect(() => {
    if (audioPlaybackRef.current) {
      audioPlaybackRef.current.setVolumeAsync(backingTrackVolume).catch(() => {});
    }
  }, [backingTrackVolume]);

  /** Toggle backing track */
  const toggleAudio = useCallback(
    async (track: AudioTrack) => {
      try {
        if (selectedTrack === track.name && audioPlaybackRef.current) {
          const status = await audioPlaybackRef.current.getStatusAsync();
          if (status.isPlaying) {
            await audioPlaybackRef.current.pauseAsync();
            setIsBackingPlaying(false);
            return;
          } else {
            await audioPlaybackRef.current.playAsync();
            setIsBackingPlaying(true);
            return;
          }
        }

        if (audioPlaybackRef.current) {
          await audioPlaybackRef.current.stopAsync();
          await audioPlaybackRef.current.unloadAsync();
          audioPlaybackRef.current = null;
        }
        const { sound } = await Audio.Sound.createAsync(track.file, {
          shouldPlay: true,
          isLooping: true,
          volume: backingTrackVolume,
        });
        audioPlaybackRef.current = sound;

        sound.setOnPlaybackStatusUpdate((status) => {
          setIsBackingPlaying(status.isPlaying ?? false);
        });

        await sound.playAsync();
        setSelectedTrack(track.name);
      } catch (error) {
        console.error('Error toggling audio:', error);
      }
    },
    [backingTrackVolume, selectedTrack]
  );

  const pauseBacking = async () => {
    if (audioPlaybackRef.current) {
      const status = await audioPlaybackRef.current.getStatusAsync();
      if (status.isPlaying) {
        await audioPlaybackRef.current.pauseAsync();
        setIsBackingPlaying(false);
      }
    }
  };

  /** Recording Functions */
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        alert('Permission to access microphone is required!');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        interruptionModeIOS: INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });

      if (audioPlaybackRef.current && isBackingPlaying) {
        await audioPlaybackRef.current.pauseAsync();
        setIsBackingPlaying(false);
      }

      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordedURI(uri || null);
      setRecording(null);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeIOS: INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });

      if (recordedPlaybackRef.current) {
        await recordedPlaybackRef.current.unloadAsync();
        recordedPlaybackRef.current = null;
      }
      if (uri) {
        const { sound } = await Audio.Sound.createAsync({ uri });
        recordedPlaybackRef.current = sound;

        const status = await sound.getStatusAsync();
        setRecordedDuration(status.durationMillis ?? 0);
        setRecordedPosition(0);

        sound.setOnPlaybackStatusUpdate((status) => {
          if (!status.isLoaded) return;
          setRecordedPosition(status.positionMillis);
          setIsRecordedPlaying(status.isPlaying ?? false);
          if (status.didJustFinish) {
            setIsRecordedPlaying(false);
            setRecordedPosition(status.durationMillis ?? 0);
          }
        });
      }

      if (audioPlaybackRef.current && selectedTrack) {
        await audioPlaybackRef.current.playAsync();
        setIsBackingPlaying(true);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const playRecording = async () => {
    if (!recordedURI) return;
    try {
      if (audioPlaybackRef.current) {
        await audioPlaybackRef.current.setPositionAsync(0);
        await audioPlaybackRef.current.playAsync();
        setIsBackingPlaying(true);
      }
      if (recordedPlaybackRef.current) {
        await recordedPlaybackRef.current.setPositionAsync(0);
        await recordedPlaybackRef.current.playAsync();
        setIsRecordedPlaying(true);
      }
    } catch (err) {
      console.error('Failed to play recording', err);
    }
  };

  const pauseAllAudio = async () => {
    if (audioPlaybackRef.current) {
      await audioPlaybackRef.current.pauseAsync();
      setIsBackingPlaying(false);
    }
    if (recordedPlaybackRef.current) {
      await recordedPlaybackRef.current.pauseAsync();
      setIsRecordedPlaying(false);
    }
  };

  const seekRecorded = async (value: number) => {
    if (recordedPlaybackRef.current) {
      await recordedPlaybackRef.current.setPositionAsync(value);
      setRecordedPosition(value);
    }
  };

  const resetRecording = async () => {
    if (recordedPlaybackRef.current) {
      await recordedPlaybackRef.current.stopAsync();
      await recordedPlaybackRef.current.unloadAsync();
      recordedPlaybackRef.current = null;
    }
    setRecordedURI(null);
    setRecordedSound(null);
    setRecordedDuration(0);
    setRecordedPosition(0);
    setIsRecordedPlaying(false);
  };

  /** AI / Record toggle */
  const toggleSwitch = useCallback((type: 'ai' | 'record') => {
    if (type === 'ai') {
      setAiVoiceEnabled(true);
      setVoiceRecordEnabled(false);
    } else {
      setAiVoiceEnabled(false);
      setVoiceRecordEnabled(true);
    }
  }, []);

  /** Speak affirmations using selected TTS voice */
  const speakAffirmations = (text: string) => {
    if (!text) return;
    Speech.stop();
    Speech.speak(text, {
      voice: selectedVoice || undefined,
      pitch: 1,
      rate: 1,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[commonStyles.container, { paddingHorizontal: 16 }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 16 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
            <Feather name="arrow-left" size={28} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text, textAlign: 'center' }} accessibilityRole="header">
              Create Track
            </Text>
            <Text style={{ fontSize: 16, color: colors.textSecondary, marginTop: 4, textAlign: 'center' }}>
              Build your personalized meditation journey
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/settings')} style={{ padding: 8 }}>
            <Feather name="settings" size={28} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Track title */}
        <TextInput placeholder="Enter track title" value={title} onChangeText={setTitle} style={commonStyles.input} accessibilityLabel="Track title input" />

        {/* Backing tracks */}
        <Text style={[commonStyles.subtitle, { marginTop: 24, marginBottom: 12 }]}>Select Backing Track</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 }}>
          {AUDIO_TRACKS.map((track) => (
            <TouchableOpacity
              key={track.name}
              onPress={() => toggleAudio(track)}
              style={{
                width: '30%',
                padding: 12,
                borderRadius: 12,
                backgroundColor: selectedTrack === track.name ? colors.primary : colors.surface,
                marginBottom: 16,
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 80,
              }}
            >
              <Text style={{ color: selectedTrack === track.name ? '#fff' : colors.textMuted, fontSize: 14, textAlign: 'center' }}>
                {track.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedTrack && (
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20 }}>
            <Button text={isBackingPlaying ? 'Pause Backing Track' : 'Play Backing Track'} onPress={async () => { if (isBackingPlaying) { await pauseBacking(); } else if (audioPlaybackRef.current) { await audioPlaybackRef.current.playAsync(); setIsBackingPlaying(true); } }} variant="secondary" style={{ paddingVertical: 6, paddingHorizontal: 12 }} />
          </View>
        )}

        {/* Affirmations */}
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

        {/* AI / Record / Generate buttons */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 16 }}>
          <Button text="AI Voice" onPress={() => toggleSwitch('ai')} variant={aiVoiceEnabled ? 'primary' : 'secondary'} style={{ paddingVertical: 6, paddingHorizontal: 12 }} />
          <Button text="AI Generate" onPress={() => router.push('/ai-generate')} variant="secondary" style={{ paddingVertical: 6, paddingHorizontal: 12 }} />
          <Button text="Record" onPress={() => toggleSwitch('record')} variant={voiceRecordEnabled ? 'primary' : 'secondary'} style={{ paddingVertical: 6, paddingHorizontal: 12 }} />
        </View>

        {/* AI Voice preview */}
        {aiVoiceEnabled && (
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Button text="Preview AI Voice" onPress={() => speakAffirmations(affirmationText)} variant="primary" />
          </View>
        )}

        {/* Recording controls */}
        {voiceRecordEnabled && (
          <View style={{ alignItems: 'center', gap: 10, marginBottom: 20 }}>
            {!recording ? (
              <Button text="Start Recording" onPress={startRecording} variant="primary" />
            ) : (
              <Button text="Stop Recording" onPress={stopRecording} variant="secondary" />
            )}
            {recordedURI && (
              <>
                <Button text={isRecordedPlaying ? "Pause Recording Playback" : "Play Recording"} onPress={() => {
                  if (isRecordedPlaying) {
                    pauseAllAudio();
                  } else {
                    playRecording();
                  }
                }} variant="secondary" />
                <Slider
                  minimumValue={0}
                  maximumValue={recordedDuration}
                  step={1000}
                  value={recordedPosition}
                  onValueChange={seekRecorded}
                  style={{ width: '90%', marginTop: 10 }}
                  accessibilityLabel="Seek recorded voice"
                />
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '90%', marginTop: 10 }}>
                  <Button text="Restart Recording" onPress={resetRecording} variant="secondary" />
                </View>
              </>
            )}
          </View>
        )}

        {/* Volume Sliders */}
        <Text style={commonStyles.subtitle}>Affirmation Volume</Text>
        <Slider minimumValue={0} maximumValue={1} step={0.05} value={affirmationVolume} onValueChange={setAffirmationVolume} accessibilityLabel="Adjust affirmation volume" />

        <Text style={commonStyles.subtitle}>Backing Track Volume</Text>
        <Slider minimumValue={0} maximumValue={1} step={0.05} value={backingTrackVolume} onValueChange={async (value) => { setBackingTrackVolume(value); if (audioPlaybackRef.current) { await audioPlaybackRef.current.setVolumeAsync(value); } }} accessibilityLabel="Adjust backing track volume" />

        <Text style={commonStyles.subtitle}>Duration: {duration} min</Text>
        <Slider minimumValue={1} maximumValue={30} step={1} value={duration} onValueChange={setDuration} accessibilityLabel="Set track duration in minutes" />

        <Button text="Create Track" onPress={() => console.log('Saving...')} style={{ marginVertical: 24 }} accessibilityLabel="Create track button" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
