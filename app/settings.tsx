import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  StyleSheet,
  Linking,
  AlertButton,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { useSettingsStore } from '../store/settingsStore';
import { useAffirmationStore } from '../store/affirmationStore';

const LOOP_GAP_OPTIONS = [5, 10, 15, 20, 30];
const DEFAULT_VOICE_OPTIONS = [
  { id: 'soft_female', label: 'Soft Female' },
  { id: 'warm_female', label: 'Warm Female' },
  { id: 'deep_male', label: 'Deep Male' },
  { id: 'calm_male', label: 'Calm Male' },
  { id: 'neutral', label: 'Neutral' },
];
const MAX_TTS_OPTIONS = [1, 2, 3, 4, 5];
const ELEVEN_QUOTA_OPTIONS = [500, 1000, 2000, 5000, 10000];

export default function SettingsScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const { settings, updateSettings, resetSettings, clearCache } = useSettingsStore();
  const { affirmations } = useAffirmationStore();

  // Local state for BYOK (OpenRouter)
  const [showOpenRouterEditor, setShowOpenRouterEditor] = useState(!settings.openRouterApiKey);
  const [tempOpenRouterKey, setTempOpenRouterKey] = useState(settings.openRouterApiKey || '');
  const [showOpenRouterKey, setShowOpenRouterKey] = useState(false);
  const [testingOpenRouterKey, setTestingOpenRouterKey] = useState(false);
  
  // Local state for ElevenLabs key editor
  const [showElevenLabsEditor, setShowElevenLabsEditor] = useState(!settings.elevenLabsApiKey);
  const [tempElevenLabsKey, setTempElevenLabsKey] = useState(settings.elevenLabsApiKey || '');
  const [showElevenLabsKey, setShowElevenLabsKey] = useState(false);
  const [testingElevenLabsKey, setTestingElevenLabsKey] = useState(false);

  const handleTestAndSaveOpenRouterKey = async () => {
    if (!tempOpenRouterKey || tempOpenRouterKey.trim().length < 10) {
      Alert.alert('Invalid Key', 'Please enter a valid OpenRouter API key.');
      return;
    }
    try {
      setTestingOpenRouterKey(true);
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${tempOpenRouterKey.trim()}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://whspr.app',
          'X-Title': 'Whspr',
        },
      });
      if (!response.ok) {
        throw new Error(`Status ${response.status}`);
      }
      updateSettings({ openRouterApiKey: tempOpenRouterKey.trim() });
      Alert.alert('Success', 'OpenRouter API key validated and saved.');
      setShowOpenRouterEditor(false);
    } catch (e) {
      Alert.alert('Key test failed', 'We could not validate this key. Please verify and try again.');
    } finally {
      setTestingOpenRouterKey(false);
    }
  };

  const handleTestAndSaveElevenLabsKey = async () => {
    if (!tempElevenLabsKey || tempElevenLabsKey.trim().length < 10) {
      Alert.alert('Invalid Key', 'Please enter a valid ElevenLabs API key.');
      return;
    }
    try {
      setTestingElevenLabsKey(true);
      const response = await fetch('https://api.elevenlabs.io/v1/user', {
        method: 'GET',
        headers: {
          'xi-api-key': tempElevenLabsKey.trim(),
        },
      });
      if (!response.ok) {
        throw new Error(`Status ${response.status}`);
      }
      updateSettings({ elevenLabsApiKey: tempElevenLabsKey.trim() });
      Alert.alert('Success', 'ElevenLabs API key validated and saved.');
      setShowElevenLabsEditor(false);
    } catch (e) {
      Alert.alert('Key test failed', 'We could not validate this ElevenLabs key. Please verify and try again.');
    } finally {
      setTestingElevenLabsKey(false);
    }
  };



  if (!fontsLoaded) {
    return null;
  }



  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will remove all cached audio files and temporary data. Your affirmations will remain but may need to be re-downloaded. Continue?',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => {} },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            clearCache();
            Alert.alert('Success', 'Cache cleared successfully.');
          },
        },
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'This will reset all settings to their default values. Your affirmations and API keys will be preserved. Continue?',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => {} },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetSettings();
            Alert.alert('Success', 'Settings reset to defaults.');
          },
        },
      ]
    );
  };

  const handleShowOnboarding = () => {
    updateSettings({ hasCompletedOnboarding: false });
    router.push('/onboarding');
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { fontFamily: 'Inter_600SemiBold' }]}>
        {title}
      </Text>
      {children}
    </View>
  );

  const renderSettingItem = (
    icon: string,
    title: string,
    description?: string,
    rightComponent?: React.ReactNode,
    onPress?: () => void
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <Ionicons name={icon as any} size={24} color={colors.primary} />
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { fontFamily: 'Inter_600SemiBold' }]}>
            {title}
          </Text>
          {description && (
            <Text style={[styles.settingDescription, { fontFamily: 'Inter_400Regular' }]}>
              {description}
            </Text>
          )}
        </View>
      </View>
      {rightComponent}
    </TouchableOpacity>
  );

  return (
    <View style={commonStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[commonStyles.title, { fontFamily: 'Inter_700Bold' }]}>
          Settings
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>


        {/* Voice & Audio */}
        {renderSection(
          'Voice & Audio',
          <View>


            {renderSettingItem(
              'mic',
              'Default Voice',
              (DEFAULT_VOICE_OPTIONS.find(v => v.id === settings.defaultVoice)?.label || settings.defaultVoice),
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />,
              () => {
                Alert.alert(
                  'Select Default Voice',
                  'Preferred voice for generated audio',
                  DEFAULT_VOICE_OPTIONS.map(
                    (v) => (
                      {
                        text: v.label,
                        onPress: () => updateSettings({ defaultVoice: v.id }),
                      } as AlertButton
                    )
                  ).concat([{ text: 'Cancel', style: 'cancel', onPress: () => {} }])
                );
              }
            )}

            {renderSettingItem(
              'time',
              'Default Loop Gap',
              `${settings.defaultLoopGap} minutes`,
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />,
              () => {
                Alert.alert(
                  'Select Default Loop Gap',
                  'Time between affirmation repetitions',
                  LOOP_GAP_OPTIONS.map(
                    (gap) =>
                      ({
                        text: `${gap} minutes`,
                        onPress: () => updateSettings({ defaultLoopGap: gap }),
                      } as AlertButton)
                  ).concat([{ text: 'Cancel', style: 'cancel', onPress: () => {} }])
                );
              }
            )}

            {renderSettingItem(
              'volume-high',
              'Fade In Duration',
              `${settings.fadeInDuration} seconds`,
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />,
              () => {
                Alert.alert(
                  'Fade In Duration',
                  'How long audio takes to fade in',
                  [1, 2, 3, 5, 10]
                    .map(
                      (duration) =>
                        ({
                          text: `${duration} seconds`,
                          onPress: () => updateSettings({ fadeInDuration: duration }),
                        } as AlertButton)
                    )
                    .concat([{ text: 'Cancel', style: 'cancel', onPress: () => {} }])
                );
              }
            )}

            {renderSettingItem(
              'volume-low',
              'Fade Out Duration',
              `${settings.fadeOutDuration} seconds`,
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />,
              () => {
                Alert.alert(
                  'Fade Out Duration',
                  'How long audio takes to fade out',
                  [1, 2, 3, 5, 10]
                    .map(
                      (duration) =>
                        ({
                          text: `${duration} seconds`,
                          onPress: () => updateSettings({ fadeOutDuration: duration }),
                        } as AlertButton)
                    )
                    .concat([{ text: 'Cancel', style: 'cancel', onPress: () => {} }])
                );
              }
            )}

            {renderSettingItem(
              'speedometer',
              'Max Concurrent TTS',
              `${settings.maxConcurrentTtsCalls}`,
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />,
              () => {
                Alert.alert(
                  'Max Concurrent TTS Calls',
                  'Controls parallel text-to-speech requests',
                  MAX_TTS_OPTIONS.map(
                    (n) => (
                      {
                        text: `${n}`,
                        onPress: () => updateSettings({ maxConcurrentTtsCalls: n }),
                      } as AlertButton
                    )
                  ).concat([{ text: 'Cancel', style: 'cancel', onPress: () => {} }])
                );
              }
            )}

            {renderSettingItem(
              'settings',
              'Voice Settings (Advanced)',
              'Detailed voice and playback options',
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />,
              () => router.push('/voice-settings')
            )}
          </View>
        )}

        {/* App Preferences */}
        {renderSection(
          'App Preferences',
          <View>
            {renderSettingItem(
              'moon',
              'Theme',
              settings.theme === 'dark' ? 'Dark Mode' : 'Light Mode',
              <Switch
                value={settings.theme === 'dark'}
                onValueChange={(value) => updateSettings({ theme: value ? 'dark' : 'light' })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.text}
              />
            )}

            {renderSettingItem(
              'notifications',
              'Notifications',
              'Enable app notifications',
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(value) => updateSettings({ notificationsEnabled: value })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.text}
              />
            )}

            {renderSettingItem(
              'play',
              'Auto-Play',
              'Automatically start playing when opening player',
              <Switch
                value={settings.autoPlayEnabled}
                onValueChange={(value) => updateSettings({ autoPlayEnabled: value })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.text}
              />
            )}
          </View>
        )}

        {/* API Keys */}
        {renderSection(
          'API Keys',
          <View>
            {renderSettingItem(
              'key',
              'OpenRouter API Key',
              settings.openRouterApiKey ? 'Configured' : 'Not configured',
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />,
              () => {
                setTempOpenRouterKey(settings.openRouterApiKey || '');
                setShowOpenRouterEditor(true);
              }
            )}

            {showOpenRouterEditor && (
              <View style={styles.apiKeyContainer}>
                <Text style={[styles.apiKeyLabel, { fontFamily: 'Inter_600SemiBold' }]}>OpenRouter API Key</Text>
                <View style={{ position: 'relative' }}>
                  <TextInput
                    style={styles.apiKeyInput}
                    placeholder="sk-..."
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showOpenRouterKey}
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={tempOpenRouterKey}
                    onChangeText={setTempOpenRouterKey}
                  />
                  <TouchableOpacity
                    style={{ position: 'absolute', right: 12, top: 14 }}
                    onPress={() => setShowOpenRouterKey(!showOpenRouterKey)}
                    accessibilityLabel={showOpenRouterKey ? 'Hide key' : 'Show key'}
                  >
                    <Ionicons name={showOpenRouterKey ? 'eye-off' : 'eye'} size={22} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.apiKeyHelp, { fontFamily: 'Inter_400Regular' }]}>Your key is stored on this device and used only for OpenRouter requests.</Text>
                <TouchableOpacity onPress={() => Linking.openURL('https://openrouter.ai/keys')}>
                  <Text style={[styles.apiKeyHelp, { color: colors.accent, textDecorationLine: 'underline' }]}>Get an API key: https://openrouter.ai/keys</Text>
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', marginTop: 12 }}>
                  <TouchableOpacity
                    style={[buttonStyles.primary, { flex: 1 }]}
                    onPress={handleTestAndSaveOpenRouterKey}
                    disabled={!tempOpenRouterKey || tempOpenRouterKey.trim().length < 10 || testingOpenRouterKey}
                  >
                    <Text style={{ color: colors.text, fontWeight: '600' }}>{testingOpenRouterKey ? 'Testing…' : 'Test & Save'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[buttonStyles.secondary, { flex: 1, marginLeft: 12 }]}
                    onPress={() => {
                      setShowOpenRouterEditor(false);
                      setTempOpenRouterKey(settings.openRouterApiKey || '');
                    }}
                  >
                    <Text style={{ color: colors.text }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
                {settings.openRouterApiKey ? (
                  <TouchableOpacity
                    style={[buttonStyles.ghost, { marginTop: 8 }]}
                    onPress={() => {
                      Alert.alert('Remove Key?', 'This will clear your OpenRouter API key.', [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Remove', style: 'destructive', onPress: () => updateSettings({ openRouterApiKey: '' }) },
                      ]);
                    }}
                  >
                    <Text style={{ color: colors.error }}>Remove Key</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )}

            {renderSettingItem(
              'key',
              'ElevenLabs API Key',
              settings.elevenLabsApiKey ? 'Configured' : 'Not configured',
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />,
              () => {
                setTempElevenLabsKey(settings.elevenLabsApiKey || '');
                setShowElevenLabsEditor(true);
              }
            )}

            {showElevenLabsEditor && (
              <View style={styles.apiKeyContainer}>
                <Text style={[styles.apiKeyLabel, { fontFamily: 'Inter_600SemiBold' }]}>ElevenLabs API Key</Text>
                <View style={{ position: 'relative' }}>
                  <TextInput
                    style={styles.apiKeyInput}
                    placeholder="elevenlabs_..."
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showElevenLabsKey}
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={tempElevenLabsKey}
                    onChangeText={setTempElevenLabsKey}
                  />
                  <TouchableOpacity
                    style={{ position: 'absolute', right: 12, top: 14 }}
                    onPress={() => setShowElevenLabsKey(!showElevenLabsKey)}
                    accessibilityLabel={showElevenLabsKey ? 'Hide key' : 'Show key'}
                  >
                    <Ionicons name={showElevenLabsKey ? 'eye-off' : 'eye'} size={22} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.apiKeyHelp, { fontFamily: 'Inter_400Regular' }]}>Used for text-to-speech only. Stored on this device.</Text>
                <View style={{ flexDirection: 'row', marginTop: 12 }}>
                  <TouchableOpacity
                    style={[buttonStyles.primary, { flex: 1 }]}
                    onPress={handleTestAndSaveElevenLabsKey}
                    disabled={!tempElevenLabsKey || tempElevenLabsKey.trim().length < 10 || testingElevenLabsKey}
                  >
                    <Text style={{ color: colors.text, fontWeight: '600' }}>{testingElevenLabsKey ? 'Testing…' : 'Test & Save'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[buttonStyles.secondary, { flex: 1, marginLeft: 12 }]}
                    onPress={() => {
                      setShowElevenLabsEditor(false);
                      setTempElevenLabsKey(settings.elevenLabsApiKey || '');
                    }}
                  >
                    <Text style={{ color: colors.text }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
                {settings.elevenLabsApiKey ? (
                  <TouchableOpacity
                    style={[buttonStyles.ghost, { marginTop: 8 }]}
                    onPress={() => {
                      Alert.alert('Remove Key?', 'This will clear your ElevenLabs API key.', [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Remove', style: 'destructive', onPress: () => updateSettings({ elevenLabsApiKey: '' }) },
                      ]);
                    }}
                  >
                    <Text style={{ color: colors.error }}>Remove Key</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )}

            {renderSettingItem(
              'stats-chart',
              'ElevenLabs Quota Threshold',
              `${settings.elevenLabsQuotaThreshold} chars`,
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />,
              () => {
                Alert.alert(
                  'Quota Threshold',
                  'Warn me when remaining characters fall below…',
                  ELEVEN_QUOTA_OPTIONS.map(
                    (n) => (
                      {
                        text: `${n} chars`,
                        onPress: () => updateSettings({ elevenLabsQuotaThreshold: n }),
                      } as AlertButton
                    )
                  ).concat([{ text: 'Cancel', style: 'cancel', onPress: () => {} }])
                );
              }
            )}
          </View>
        )}

        {/* Data & Storage */}
        {renderSection(
          'Data & Storage',
          <View>
            {renderSettingItem(
              'folder',
              'Storage Used',
              `${affirmations.length} affirmations stored locally`
            )}

            {renderSettingItem(
              'trash',
              'Clear Cache',
              'Remove temporary files and cached data',
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />,
              handleClearCache
            )}
          </View>
        )}

        {/* Help & Support */}
        {renderSection(
          'Help & Support',
          <View>
            {renderSettingItem(
              'help-circle',
              'Show Onboarding',
              'View the welcome tutorial again',
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />,
              handleShowOnboarding
            )}

            {renderSettingItem(
              'refresh',
              'Reset Settings',
              'Reset all settings to defaults',
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />,
              handleResetSettings
            )}

            {renderSettingItem(
              'information-circle',
              'App Version',
              '1.0.0'
            )}
          </View>
        )}

        <View style={styles.footer}>
          <Text style={[styles.footerText, { fontFamily: 'Inter_400Regular' }]}>
            Whspr - Your Personal Sleep Affirmation Studio
          </Text>
          <Text style={[styles.footerText, { fontFamily: 'Inter_400Regular' }]}>
            Made with ❤️ for peaceful sleep
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    marginBottom: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  apiKeyContainer: {
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  apiKeyLabel: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  apiKeyInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  apiKeyHelp: {
    fontSize: 14,
    color: colors.textSecondary,
    paddingHorizontal: 20,
    marginTop: 12,
    lineHeight: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
});

