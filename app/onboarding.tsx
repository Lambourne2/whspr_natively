import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { useSettingsStore } from '../store/settingsStore';

const { width: screenWidth } = Dimensions.get('window');

const ONBOARDING_SLIDES = [
  {
    id: 1,
    icon: 'moon',
    title: 'Welcome to Whspr',
    subtitle: 'Your Personal Sleep Affirmation Studio',
    description: 'Create custom affirmations with AI and soothing backing tracks for peaceful sleep and positive transformation.',
    gradient: [colors.primary, colors.secondary],
  },
  {
    id: 2,
    icon: 'sparkles',
    title: 'AI-Powered Affirmations',
    subtitle: 'Personalized Just for You',
    description: 'Our AI creates unique affirmations based on your intentions, tone preferences, and personal goals.',
    gradient: [colors.secondary, '#8B5CF6'],
  },
  {
    id: 3,
    icon: 'musical-notes',
    title: 'Healing Sound Frequencies',
    subtitle: 'Science-Backed Audio',
    description: 'Choose from Delta, Theta, Alpha waves and Solfeggio frequencies (432Hz, 528Hz, 852Hz) for deeper relaxation.',
    gradient: ['#8B5CF6', '#EC4899'],
  },
  {
    id: 4,
    icon: 'cloud-offline',
    title: 'Works Offline',
    subtitle: 'Always Available',
    description: 'Once created, your affirmations work completely offline. No internet required for your nightly routine.',
    gradient: ['#EC4899', '#F59E0B'],
  },
  {
    id: 5,
    icon: 'shield-checkmark',
    title: 'Privacy First',
    subtitle: 'Your Data Stays Private',
    description: 'All your affirmations are stored locally on your device. We never store or share your personal content.',
    gradient: ['#F59E0B', colors.primary],
  },
];

export default function OnboardingScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const { updateSettings } = useSettingsStore();

  if (!fontsLoaded) {
    return null;
  }

  const handleNext = () => {
    if (currentSlide < ONBOARDING_SLIDES.length - 1) {
      const nextSlide = currentSlide + 1;
      setCurrentSlide(nextSlide);
      scrollViewRef.current?.scrollTo({
        x: nextSlide * screenWidth,
        animated: true,
      });
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    updateSettings({ hasCompletedOnboarding: true });
    router.replace('/');
  };

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setCurrentSlide(slideIndex);
  };

  const renderSlide = (slide: typeof ONBOARDING_SLIDES[0], index: number) => (
    <View key={slide.id} style={[styles.slide, { width: screenWidth }]}>
      <View style={styles.slideContent}>
        <LinearGradient
          colors={slide.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconContainer}
        >
          <Ionicons name={slide.icon as any} size={60} color={colors.text} />
        </LinearGradient>

        <Text style={[styles.slideTitle, { fontFamily: 'Inter_700Bold' }]}>
          {slide.title}
        </Text>

        <Text style={[styles.slideSubtitle, { fontFamily: 'Inter_600SemiBold' }]}>
          {slide.subtitle}
        </Text>

        <Text style={[styles.slideDescription, { fontFamily: 'Inter_400Regular' }]}>
          {slide.description}
        </Text>
      </View>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.pagination}>
      {ONBOARDING_SLIDES.map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            {
              backgroundColor: index === currentSlide ? colors.primary : colors.border,
              width: index === currentSlide ? 24 : 8,
            },
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={commonStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.placeholder} />
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={[styles.skipText, { fontFamily: 'Inter_600SemiBold' }]}>
            Skip
          </Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {ONBOARDING_SLIDES.map(renderSlide)}
      </ScrollView>

      {/* Pagination */}
      {renderPagination()}

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[buttonStyles.primary, styles.nextButton]}
          onPress={handleNext}
        >
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[buttonStyles.primary, { margin: 0 }]}
          >
            <View style={styles.nextButtonContent}>
              <Text style={[commonStyles.text, { fontFamily: 'Inter_600SemiBold', color: colors.text }]}>
                {currentSlide === ONBOARDING_SLIDES.length - 1 ? 'Get Started' : 'Next'}
              </Text>
              <Ionicons
                name={currentSlide === ONBOARDING_SLIDES.length - 1 ? 'checkmark' : 'arrow-forward'}
                size={20}
                color={colors.text}
                style={{ marginLeft: 8 }}
              />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  placeholder: {
    width: 60,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
    maxWidth: 400,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  slideTitle: {
    fontSize: 28,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  slideSubtitle: {
    fontSize: 18,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  slideDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  navigation: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  nextButton: {
    marginTop: 0,
  },
  nextButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

