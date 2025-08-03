import { Audio, AudioMode, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { encode } from 'base-64';


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

  async loadBackingTrack(uri: string): Promise<void> {
    await this.initialize();
    try {
      if (this.backingTrackSound) {
        await this.backingTrackSound.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync({ uri });
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