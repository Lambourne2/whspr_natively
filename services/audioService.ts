import { Audio, AVPlaybackStatus, AVPlaybackStatusSuccess } from 'expo-av';

type PlayAudioOptions = {
  affirmationUri: string;
  backingTrackUri?: string;
  affirmationVolume?: number;
  backingTrackVolume?: number;
  fadeInDurationMs?: number;
};

class AudioService {
  private affirmationSound: Audio.Sound | null = null;
  private backingTrackSound: Audio.Sound | null = null;

  private affirmationVolume: number = 1;
  private backingTrackVolume: number = 1;

  async playAudio(options: PlayAudioOptions) {
    const {
      affirmationUri,
      backingTrackUri,
      affirmationVolume = 1,
      backingTrackVolume = 1,
      fadeInDurationMs = 1000,
    } = options;

    this.affirmationVolume = affirmationVolume;
    this.backingTrackVolume = backingTrackVolume;

    try {
      // Affirmation
      if (this.affirmationSound) {
        await this.affirmationSound.unloadAsync();
        this.affirmationSound = null;
      }
      this.affirmationSound = new Audio.Sound();
      await this.affirmationSound.loadAsync({ uri: affirmationUri });
      await this.affirmationSound.setIsLoopingAsync(false);
      await this.affirmationSound.setVolumeAsync(0);
      await this.affirmationSound.playAsync();
      await this.fadeVolume(this.affirmationSound, 0, affirmationVolume, fadeInDurationMs);

      // Backing Track (optional)
      if (backingTrackUri) {
        if (this.backingTrackSound) {
          await this.backingTrackSound.unloadAsync();
          this.backingTrackSound = null;
        }
        this.backingTrackSound = new Audio.Sound();
        await this.backingTrackSound.loadAsync({ uri: backingTrackUri });
        await this.backingTrackSound.setIsLoopingAsync(true);
        await this.backingTrackSound.setVolumeAsync(0);
        await this.backingTrackSound.playAsync();
        await this.fadeVolume(this.backingTrackSound, 0, backingTrackVolume, fadeInDurationMs);
      }
    } catch (error) {
      console.error('AudioService playAudio error:', error);
      throw error;
    }
  }

  async loadBackingTrack(uri: string) {
    try {
      if (this.backingTrackSound) {
        await this.backingTrackSound.unloadAsync();
        this.backingTrackSound = null;
      }
      this.backingTrackSound = new Audio.Sound();
      await this.backingTrackSound.loadAsync({ uri });
      await this.backingTrackSound.setIsLoopingAsync(true);
      await this.backingTrackSound.setVolumeAsync(this.backingTrackVolume);
      await this.backingTrackSound.playAsync();
    } catch (error) {
      console.error('AudioService loadBackingTrack error:', error);
      throw error;
    }
  }

  async unloadBackingTrack() {
    if (this.backingTrackSound) {
      try {
        await this.backingTrackSound.stopAsync();
        await this.backingTrackSound.unloadAsync();
      } catch (error) {
        console.error('AudioService unloadBackingTrack error:', error);
      } finally {
        this.backingTrackSound = null;
      }
    }
  }

  async pauseAll() {
    try {
      if (this.affirmationSound) {
        await this.affirmationSound.pauseAsync();
      }
      if (this.backingTrackSound) {
        await this.backingTrackSound.pauseAsync();
      }
    } catch (error) {
      console.error('AudioService pauseAll error:', error);
    }
  }

  async stopAll(fadeOutDurationMs = 1000) {
    try {
      if (this.affirmationSound) {
        await this.fadeVolume(this.affirmationSound, this.affirmationVolume, 0, fadeOutDurationMs);
        await this.affirmationSound.stopAsync();
        await this.affirmationSound.unloadAsync();
        this.affirmationSound = null;
      }
      if (this.backingTrackSound) {
        await this.fadeVolume(this.backingTrackSound, this.backingTrackVolume, 0, fadeOutDurationMs);
        await this.backingTrackSound.stopAsync();
        await this.backingTrackSound.unloadAsync();
        this.backingTrackSound = null;
      }
    } catch (error) {
      console.error('AudioService stopAll error:', error);
    }
  }

  async setAffirmationVolume(volume: number) {
    this.affirmationVolume = volume;
    if (this.affirmationSound) {
      await this.affirmationSound.setVolumeAsync(volume);
    }
  }

  async setBackingTrackVolume(volume: number) {
    this.backingTrackVolume = volume;
    if (this.backingTrackSound) {
      await this.backingTrackSound.setVolumeAsync(volume);
    }
  }

  /** Returns status info of affirmation playback or null */
  async getStatus() {
    if (!this.affirmationSound) return null;

    try {
      const status = await this.affirmationSound.getStatusAsync();
      if (!status.isLoaded) return null;

      // Type guard for successful playback status
      if ('isPlaying' in status) {
        return {
          isPlaying: status.isPlaying,
          currentTime: status.positionMillis / 1000,
          duration: status.durationMillis ? status.durationMillis / 1000 : 0,
          isFinished: status.didJustFinish ?? false,
        };
      }
      return null;
    } catch (error) {
      console.error('AudioService getStatus error:', error);
      return null;
    }
  }

  private async fadeVolume(sound: Audio.Sound, from: number, to: number, durationMs: number) {
    const steps = 10;
    const stepDuration = durationMs / steps;
    const volumeStep = (to - from) / steps;

    for (let i = 1; i <= steps; i++) {
      const newVolume = from + volumeStep * i;
      await sound.setVolumeAsync(Math.min(1, Math.max(0, newVolume)));
      await this.sleep(stepDuration);
    }
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const audioService = new AudioService();
