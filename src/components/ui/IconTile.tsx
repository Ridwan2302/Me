import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../theme/ThemeContext';
import { fonts, radii, spacing } from '../../theme/tokens';
import { GlassCard } from './GlassCard';
import { PressableScale } from './PressableScale';

interface IconTileProps {
  href: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  accentFrom: string;
  accentTo: string;
}

export function IconTile({ href, label, icon, accentFrom, accentTo }: IconTileProps) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <PressableScale onPress={() => router.push(href as any)} style={{ width: '31%' }}>
      <GlassCard padding={spacing.sm} radius={radii.md} elevation="sm">
        <View style={{ alignItems: 'center', gap: 8 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: accentFrom,
            }}
          >
            <Ionicons name={icon} size={20} color={accentTo} />
          </View>
          <Text
            numberOfLines={1}
            style={{ fontFamily: fonts.bodyMedium, fontSize: 12, color: theme.textPrimary }}
          >
            {label}
          </Text>
        </View>
      </GlassCard>
    </PressableScale>
  );
}
