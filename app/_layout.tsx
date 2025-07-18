import { Slot, Stack, router, useGlobalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, SafeAreaView } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import { useEffect, useState } from 'react';
import { setupErrorLogging } from '../utils/errorLogger';
import { useSettingsStore } from '../store/settingsStore';
import { useAffirmationStore } from '../store/affirmationStore';
import * as SplashScreen from 'expo-splash-screen';

const STORAGE_KEY = 'emulated_device';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const actualInsets = useSafeAreaInsets();
  const { emulate } = useGlobalSearchParams<{ emulate?: string }>();
  const [storedEmulate, setStoredEmulate] = useState<string | null>(null);
  const { settings } = useSettingsStore();
  const { initializeBackingTracks, setCurrentBackingTrack, backingTracks, currentBackingTrack, setHydrated } = useAffirmationStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Set up global error logging
    setupErrorLogging();

    if (Platform.OS === 'web') {
      if (emulate) {
        localStorage.setItem(STORAGE_KEY, emulate);
        setStoredEmulate(emulate);
      } else {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setStoredEmulate(stored);
        }
      }
    }
    setIsReady(true);
  }, [emulate]);

  useEffect(() => {
    // Initialize backing tracks and set a default if not already set.
    if (backingTracks.length === 0) {
      initializeBackingTracks();
    }

    const firstTrack = backingTracks[0];
    if (firstTrack && !currentBackingTrack) {
      setCurrentBackingTrack(firstTrack);
    }

    // Signal that the store is hydrated and ready.
    setHydrated(true);
  }, [backingTracks, currentBackingTrack, initializeBackingTracks, setCurrentBackingTrack, setHydrated]);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
      if (!settings.hasCompletedOnboarding) {
        router.replace('/onboarding');
      }
    }
  }, [isReady, settings.hasCompletedOnboarding]);

  let insetsToUse = actualInsets;

  if (Platform.OS === 'web') {
    const simulatedInsets = {
      ios: { top: 47, bottom: 20, left: 0, right: 0 },
      android: { top: 40, bottom: 0, left: 0, right: 0 },
    };

    const deviceToEmulate = storedEmulate || emulate;
    insetsToUse = deviceToEmulate ? simulatedInsets[deviceToEmulate as keyof typeof simulatedInsets] || actualInsets : actualInsets;
  }

  if (!isReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[commonStyles.wrapper, {
          paddingTop: insetsToUse.top,
          paddingBottom: insetsToUse.bottom,
          paddingLeft: insetsToUse.left,
          paddingRight: insetsToUse.right,
       }]}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'default',
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />

          <Stack.Screen name="library" options={{ headerShown: false }} />
          <Stack.Screen name="player" options={{ headerShown: false }} />
          <Stack.Screen name="sample-tracks-player" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
