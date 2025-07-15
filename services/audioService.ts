import { Audio, AudioMode, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { encode } from 'base-64';
import { apiService, TTSRequest } from './apiService';

export interface AudioFile {
  uri: string;
  duration: number;
}

class AudioService {
  private static instance: AudioService;
  private affirmationSound: Audio.Sound | null = null;
  private backingTrackSound: Audio.Sound | null = null;
  private isInitialized = false;

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const config = this.getAudioModeConfig();
      await Audio.setAudioModeAsync(config);
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize audio service:', error);
      throw error;
    }
  }

  private getAudioModeConfig(): AudioMode {
    return {
      staysActiveInBackground: true,
      allowsRecordingIOS: false,
      interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
      playsInSilentModeIOS: true,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    };
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      const charCode = bytes[i];
      if (charCode !== undefined) {
        binary += String.fromCharCode(charCode);
      }
    }
    return encode(binary);
  }

  private async getAudioDuration(uri: string | number): Promise<number> {
    try {
      const source = typeof uri === 'string' ? { uri } : uri;
      const { sound, status } = await Audio.Sound.createAsync(source);
      await sound.unloadAsync();
      if (status.isLoaded && status.durationMillis) {
        return status.durationMillis / 1000;
      }
      return 0;
    } catch (error) {
      console.error(`Failed to get duration for ${uri}:`, error);
      return 0;
    }
  }

  async createAffirmationAudio(
    affirmations: string[],
    voice: string,
    loopGapMinutes: number
  ): Promise<AudioFile> {
    await this.initialize();

    try {
      const audioSegments: string[] = [];
      for (const text of affirmations) {
        const ttsRequest: TTSRequest = { text, voice };
        const ttsResponse = await apiService.synthesizeSpeech(ttsRequest);
        const base64Audio = this.arrayBufferToBase64(ttsResponse.audioData);
        audioSegments.push(base64Audio);
      }

      if (audioSegments.length === 0) {
        throw new Error('No audio could be generated.');
      }

      const finalBase64 = audioSegments[0];
      const fileName = `affirmation_${Date.now()}.mp3`;
      const docDir = FileSystem.documentDirectory;

      if (!docDir) {
        console.error('FileSystem.documentDirectory is null or undefined.');
        throw new Error('Document directory is not available.');
      }

      const fileUri = `${docDir}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, finalBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const duration = await this.getAudioDuration(fileUri);
      return {
        uri: fileUri,
        duration,
      };
    } catch (error) {
      console.error('Failed to create affirmation audio:', error);
      throw error;
    }
  }
  
  async loadAffirmationAudio(uri: string): Promise<void> {
    await this.initialize();
    try {
      if (this.affirmationSound) {
        await this.affirmationSound.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync({ uri });
      this.affirmationSound = sound;
    } catch (error) {
      console.error('Failed to load affirmation audio:', error);
      throw error;
    }
  }

  async loadBackingTrack(uri: string | number): Promise<void> {
    await this.initialize();
    try {
      if (this.backingTrackSound) {
        await this.backingTrackSound.unloadAsync();
      }
      // Correctly handle local vs remote URIs
      const source = typeof uri === 'number' ? uri : { uri };
      const { sound } = await Audio.Sound.createAsync(source);
      this.backingTrackSound = sound;
    } catch (error) {
      console.error('Failed to load backing track:', error);
      throw error;
    }
  }

  async unloadBackingTrack(): Promise<void> {
    if (this.backingTrackSound) {
      await this.backingTrackSound.unloadAsync();
      this.backingTrackSound = null;
    }
  }

  async play(
    affirmationVolume: number = 0.8,
    backingTrackVolume: number = 0.6,
    fadeInDuration: number = 3000
  ): Promise<void> {
    await this.initialize();
    try {
      const promises: Promise<any>[] = [];
      if (this.affirmationSound) {
        promises.push(this.affirmationSound.playAsync());
      }
      if (this.backingTrackSound) {
        promises.push(this.backingTrackSound.playAsync());
      }
      await Promise.all(promises);
      if (fadeInDuration > 0) {
        await this.fadeIn(affirmationVolume, backingTrackVolume, fadeInDuration);
      } else {
        await this.setVolumes(affirmationVolume, backingTrackVolume);
      }
    } catch (error) {
      console.error('Failed to play audio:', error);
      throw error;
    }
  }

  async pause(): Promise<void> {
    try {
      const promises: Promise<any>[] = [];
      if (this.affirmationSound) {
        promises.push(this.affirmationSound.pauseAsync());
      }
      if (this.backingTrackSound) {
        promises.push(this.backingTrackSound.pauseAsync());
      }
      await Promise.all(promises);
    } catch (error) {
      console.error('Failed to pause audio:', error);
      throw error;
    }
  }

  async stop(fadeOutDuration: number = 3000): Promise<void> {
    try {
      if (fadeOutDuration > 0) {
        await this.fadeOut(fadeOutDuration);
      }
      const promises: Promise<any>[] = [];
      if (this.affirmationSound) {
        promises.push(this.affirmationSound.stopAsync());
      }
      if (this.backingTrackSound) {
        promises.push(this.backingTrackSound.stopAsync());
      }
      await Promise.all(promises);
    } catch (error) {
      console.error('Failed to stop audio:', error);
      throw error;
    }
  }

  async setAffirmationVolume(volume: number): Promise<void> {
    if (this.affirmationSound) {
      await this.affirmationSound.setVolumeAsync(volume);
    }
  }

  async setBackingTrackVolume(volume: number): Promise<void> {
    if (this.backingTrackSound) {
      await this.backingTrackSound.setVolumeAsync(volume);
    }
  }

  async setVolumes(affirmationVolume: number, backingTrackVolume: number): Promise<void> {
    try {
      const promises: Promise<any>[] = [];
      if (this.affirmationSound) {
        promises.push(this.affirmationSound.setVolumeAsync(affirmationVolume));
      }
      if (this.backingTrackSound) {
        promises.push(this.backingTrackSound.setVolumeAsync(backingTrackVolume));
      }
      await Promise.all(promises);
    } catch (error) {
      console.error('Failed to set volumes:', error);
      throw error;
    }
  }

  async getStatus(): Promise<{
    currentTime: number;
    duration: number;
    isPlaying: boolean;
    isFinished: boolean;
  } | null> {
    if (!this.affirmationSound) {
      return null;
    }
    const status = await this.affirmationSound.getStatusAsync();
    if (!status.isLoaded) {
      return null;
    }
    return {
      currentTime: (status.positionMillis ?? 0) / 1000,
      duration: (status.durationMillis ?? 0) / 1000,
      isPlaying: status.isPlaying,
      isFinished: status.didJustFinish,
    };
  }

  private async fadeIn(
    targetAffirmationVolume: number,
    targetBackingTrackVolume: number,
    duration: number
  ): Promise<void> {
    const steps = 20;
    const stepDuration = duration / steps;
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const affirmationVolume = targetAffirmationVolume * progress;
      const backingTrackVolume = targetBackingTrackVolume * progress;
      await this.setVolumes(affirmationVolume, backingTrackVolume);
      await new Promise(resolve => setTimeout(resolve, stepDuration));
    }
  }

  private async fadeOut(duration: number): Promise<void> {
    let currentAffirmationVolume = 0;
    let currentBackingTrackVolume = 0;

    if (this.affirmationSound) {
      const status = await this.affirmationSound.getStatusAsync();
      if (status.isLoaded) currentAffirmationVolume = status.volume ?? 0;
    }

    if (this.backingTrackSound) {
      const status = await this.backingTrackSound.getStatusAsync();
      if (status.isLoaded) currentBackingTrackVolume = status.volume ?? 0;
    }

    const steps = 20;
    const stepDuration = duration / steps;
    for (let i = steps; i >= 0; i--) {
      const progress = i / steps;
      const affirmationVolume = currentAffirmationVolume * progress;
      const backingTrackVolume = currentBackingTrackVolume * progress;
      await this.setVolumes(affirmationVolume, backingTrackVolume);
      await new Promise(resolve => setTimeout(resolve, stepDuration));
    }
  }

  async cleanup(): Promise<void> {
    try {
      if (this.affirmationSound) {
        await this.affirmationSound.unloadAsync();
        this.affirmationSound = null;
      }
      if (this.backingTrackSound) {
        await this.backingTrackSound.unloadAsync();
        this.backingTrackSound = null;
      }
    } catch (error) {
      console.error('Failed to cleanup audio service:', error);
    }
  }
}

export const audioService = AudioService.getInstance();













