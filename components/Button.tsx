import { Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../styles/commonStyles';

interface ButtonProps {
  text: string;
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  accessibilityLabel?: string; // <-- Added here
}

const styles = StyleSheet.create({
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
  disabled: {
    opacity: 0.5,
  },
  primaryText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  ghostText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default function Button({ 
  text, 
  onPress, 
  style, 
  textStyle, 
  variant = 'primary',
  disabled = false,
  accessibilityLabel,   // <-- Added here
}: ButtonProps) {
  const buttonStyle = [
    styles[variant],
    disabled && styles.disabled,
    style
  ];

  const defaultTextStyle = variant === 'primary' ? styles.primaryText :
                          variant === 'secondary' ? styles.secondaryText :
                          styles.ghostText;

  return (
    <TouchableOpacity 
      style={buttonStyle} 
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      accessibilityLabel={accessibilityLabel} // <-- Pass it here
    >
      <Text style={[defaultTextStyle, textStyle]}>
        {text}
      </Text>
    </TouchableOpacity>
  );
}
