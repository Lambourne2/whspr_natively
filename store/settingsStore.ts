import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppSettings {
  theme: 'dark' | 'light';
  defaultVoice: string;
  defaultLoopGap: number;
  openRouterApiKey: string;
  elevenLabsApiKey: string;
  elevenLabsQuotaThreshold: number;
  maxConcurrentTtsCalls: number;
  hasCompletedOnboarding: boolean;
  notificationsEnabled: boolean;
  autoPlayEnabled: boolean;
  fadeInDuration: number;
  fadeOutDuration: number;
}

interface SettingsStore {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;
  clearCache: () => void;
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  defaultVoice: 'soft_female',
  defaultLoopGap: 10,
  openRouterApiKey: '',
  elevenLabsApiKey: '',
  elevenLabsQuotaThreshold: 1000,
  maxConcurrentTtsCalls: 3,
  hasCompletedOnboarding: false,
  notificationsEnabled: true,
  autoPlayEnabled: false,
  fadeInDuration: 3,
  fadeOutDuration: 3,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,

      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),

      resetSettings: () =>
        set({ settings: defaultSettings }),

      clearCache: () => {
        // This will be implemented to clear audio cache and temporary files
        console.log('Cache cleared');
      },
    }),
    {
      name: 'whspr-settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

