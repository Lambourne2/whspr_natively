import { View, Text, StyleSheet, ViewStyle, TextStyle, TouchableOpacity } from 'react-native';
import { colors } from '../styles/commonStyles';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void;
  disabled?: boolean;
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}

interface CardContentProps {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
}

const cardStyles = StyleSheet.create({
  card: {
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
  cardDisabled: {
    opacity: 0.5,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  content: {
  },
});

export default function Card({ children, style, onPress, disabled = false }: CardProps) {
  const cardStyle = [cardStyles.card, disabled && cardStyles.cardDisabled, style];
  
  if (onPress) {
    return (
      <TouchableOpacity 
        style={cardStyle} 
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  }
  
  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
}

Card.Header = function CardHeader({ title, subtitle, titleStyle, subtitleStyle }: CardHeaderProps) {
  return (
    <View style={cardStyles.header}>
      <Text style={[cardStyles.title, titleStyle]}>{title}</Text>
      {subtitle && <Text style={[cardStyles.subtitle, subtitleStyle]}>{subtitle}</Text>}
    </View>
  );
};

Card.Content = function CardContent({ children, style }: CardContentProps) {
  return (
    <View style={[cardStyles.content, style]}>
      {children}
    </View>
  );
};
