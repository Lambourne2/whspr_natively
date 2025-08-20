import { Stack, router, useGlobalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { commonStyles } from '../styles/commonStyles';
import { useEffect, useState } from 'react';
import { setupErrorLogging } from '../utils/errorLogger';
import { useSettingsStore } from '../store/settingsStore';
import { useAffirmationStore } from '../store/affirmationStore';
import * as SplashScreen from 'expo-splash-screen';

const STORAGE_KEY = 'emulated_device';
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const actualInsets = useSafeAreaInsets();
  const { emulate } = useGlobalSearchParams<{ emulate?: string }>();
  const [storedEmulate, setStoredEmulate] = useState<string | null>(null);
  const { settings } = useSettingsStore();
  const {
    initializeBackingTracks,
    setCurrentBackingTrack,
    backingTracks,
    currentBackingTrack,
    setHydrated
  } = useAffirmationStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setupErrorLogging();

    if (Platform.OS === 'web') {
      if (emulate) {
        localStorage.setItem(STORAGE_KEY, emulate);
        setStoredEmulate(emulate);
      } else {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) setStoredEmulate(stored);
      }
    }
    setIsReady(true);
  }, [emulate]);

  useEffect(() => {
    if (backingTracks.length === 0) initializeBackingTracks();
    const firstTrack = backingTracks[0];
    if (firstTrack && !currentBackingTrack) {
      setCurrentBackingTrack(firstTrack);
    }
    setHydrated(true);
  }, [backingTracks, currentBackingTrack]);

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
      android: { top: 40, bottom: 0, left: 0, right: 0 }
    };
    const deviceToEmulate = storedEmulate || emulate;
    insetsToUse =
      deviceToEmulate
        ? simulatedInsets[deviceToEmulate as keyof typeof simulatedInsets] || actualInsets
        : actualInsets;
  }

  if (!isReady) return null;

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[
          commonStyles.wrapper,
          {
            paddingTop: insetsToUse.top,
            paddingBottom: insetsToUse.bottom,
            paddingLeft: insetsToUse.left,
            paddingRight: insetsToUse.right
          }
        ]}
      >
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#fff',
            animation: 'default'
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen
            name="library"
            options={{
              title: 'Library',
              headerRight: () => (
                <TouchableOpacity
                  onPress={() => router.push('/settings')}
                  style={{ marginRight: 12 }}
                >
                  <Ionicons name="settings-outline" size={24} color="#fff" />
                </TouchableOpacity>
              )
            }}
          />
          <Stack.Screen name="player" options={{ title: 'Player' }} />
          <Stack.Screen name="sample-tracks-player" options={{ title: 'Sample Tracks' }} />
          <Stack.Screen name="settings" options={{ title: 'Settings' }} />
          <Stack.Screen
            name="create"
            options={{
              title: 'Create Track',
              headerRight: () => (
                <TouchableOpacity
                  onPress={() => router.push('/settings')}
                  style={{ marginRight: 12 }}
                >
                  <Ionicons name="settings-outline" size={24} color="#fff" />
                </TouchableOpacity>
              )
            }}
          />
          <Stack.Screen name="ai-generate" options={{ title: 'AI Generate' }} />
          <Stack.Screen name="voice-settings" options={{ title: 'Voice Settings' }} />
          <Stack.Screen name="affirmation-player" options={{ title: 'Affirmation Player' }} />
        </Stack>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
