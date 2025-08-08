import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  primary: '#8B5CF6',      // Purple from logo
  secondary: '#6366F1',    // Blue from logo
  accent: '#A855F7',       // Light purple
  background: '#0F0F23',   // Very dark blue
  backgroundAlt: '#1A1B3A', // Dark purple-blue
  surface: '#252547',      // Medium dark surface
  text: '#F8FAFC',         // Almost white
  textSecondary: '#CBD5E1', // Light gray
  textMuted: '#94A3B8',    // Muted gray
  border: '#374151',       // Dark border
  success: '#10B981',      // Green
  warning: '#F59E0B',      // Orange
  error: '#EF4444',        // Red
};

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

interface CommonStyles {
  wrapper: ViewStyle;
  wrapperCentered: ViewStyle;
  container: ViewStyle;
  content: ViewStyle;
  centerContent: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  text: TextStyle;
  textMuted: TextStyle;
  card: ViewStyle;
  input: TextStyle;
}

export const commonStyles = StyleSheet.create<CommonStyles>({
  wrapper: {
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  wrapperCentered: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 24,
  },
  textMuted: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textMuted,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: 8,
  },
});

export const gradientStyle = {
  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
};