import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { commonStyles, colors } from '../styles/commonStyles';

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={commonStyles.container}>
      <ScrollView 
        style={commonStyles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroSection}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <Ionicons name="moon" size={48} color={colors.text} />
          </LinearGradient>
          
          <Text style={[styles.title, { fontFamily: 'Inter_700Bold' }]}>
            Whspr
          </Text>
          <Text style={[styles.subtitle, { fontFamily: 'Inter_400Regular' }]}>
            Transform your sleep with personalized affirmations
          </Text>
        </View>

        <View style={styles.featureCards}>
          <TouchableOpacity 
            style={styles.featureCard} 
            onPress={() => router.push('/create')}
          >
            <LinearGradient
              colors={[colors.primary + '20', colors.secondary + '20']}
              style={styles.cardIcon}
            >
              <Ionicons name="add-circle" size={32} color={colors.primary} />
            </LinearGradient>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { fontFamily: 'Inter_600SemiBold' }]}>
                Create
              </Text>
              <Text style={[styles.cardSubtitle, { fontFamily: 'Inter_400Regular' }]}>
                Build custom affirmations
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.featureCard} 
            onPress={() => router.push('/ai-generate')}
          >
            <LinearGradient
              colors={[colors.primary + '20', colors.secondary + '20']}
              style={styles.cardIcon}
            >
              <Ionicons name="sparkles" size={32} color={colors.primary} />
            </LinearGradient>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { fontFamily: 'Inter_600SemiBold' }]}>
                AI Generate
              </Text>
              <Text style={[styles.cardSubtitle, { fontFamily: 'Inter_400Regular' }]}>
                Let AI create for you
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.featureCard} 
            onPress={() => router.push('/library')}
          >
            <LinearGradient
              colors={[colors.primary + '20', colors.secondary + '20']}
              style={styles.cardIcon}
            >
              <Ionicons name="library" size={32} color={colors.primary} />
            </LinearGradient>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { fontFamily: 'Inter_600SemiBold' }]}>
                Library
              </Text>
              <Text style={[styles.cardSubtitle, { fontFamily: 'Inter_400Regular' }]}>
                Your saved affirmations
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => router.push('/voice-settings')}
        >
          <Ionicons name="settings" size={24} color={colors.textSecondary} />
          <Text style={[styles.settingsText, { fontFamily: 'Inter_500Medium' }]}>
            Settings
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  heroGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 36,
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  featureCards: {
    marginBottom: 32,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: colors.surface,
    borderRadius: 25,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingsText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 8,
  },
});