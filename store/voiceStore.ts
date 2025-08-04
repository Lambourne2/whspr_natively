// store/voiceStore.ts
import { create } from 'zustand';

type VoiceStore = {
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
};

export const useVoiceStore = create<VoiceStore>((set) => ({
  selectedVoice: 'com.apple.ttsbundle.Samantha-compact', // default voice (iOS) – adjust for Android if needed
  setSelectedVoice: (voice) => set({ selectedVoice: voice }),
}));
