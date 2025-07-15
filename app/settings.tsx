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

export default function SettingsScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const { settings, updateSettings, resetSettings, clearCache } = useSettingsStore();
  const { affirmations } = useAffirmationStore();



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

