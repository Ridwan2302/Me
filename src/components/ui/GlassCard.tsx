import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../theme/ThemeContext';
import { radii, shadow, spacing } from '../../theme/tokens';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  radius?: number;
  elevation?: 'sm' | 'md' | 'lg';
}

export function GlassCard({ children, style, padding = spacing.md, radius = radii.lg, elevation = 'md' }: GlassCardProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          borderRadius: radius,
          borderWidth: 1,
          borderColor: theme.border,
          overflow: 'hidden',
          backgroundColor: theme.surface,
        },
        shadow(theme, elevation),
        style,
      ]}
    >
      <BlurView
        intensity={theme.name === 'dark' ? 32 : 46}
        tint={theme.name === 'dark' ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
      <View style={{ padding }}>{children}</View>
    </View>
  );
}
