import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../config/theme';

export default function CustomButton({ title, onPress, variant = 'primary', style }) {
  const isSecondary = variant === 'secondary';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.button, isSecondary ? styles.secondary : styles.primary, style]}>
      <Text style={[styles.label, isSecondary && styles.secondaryLabel]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  primary: { backgroundColor: COLORS.primary },
  secondary: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  label: { fontSize: 15, fontFamily: FONTS.inter, fontWeight: '500', color: COLORS.card },
  secondaryLabel: { color: COLORS.secondary },
});
