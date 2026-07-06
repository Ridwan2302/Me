import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../theme/ThemeContext';
import { fonts, spacing } from '../../theme/tokens';
import { PressableScale } from './PressableScale';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  emoji?: string;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, emoji, right }: ScreenHeaderProps) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View style={styles.row}>
      <PressableScale
        onPress={() => (router.canGoBack() ? router.back() : router.push('/'))}
        style={[styles.backBtn, { backgroundColor: theme.surfaceStrong, borderColor: theme.border }]}
        accessibilityLabel="Retour"
      >
        <Ionicons name="chevron-back" size={20} color={theme.textPrimary} />
      </PressableScale>
      <View style={{ flex: 1, marginLeft: spacing.sm }}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          {emoji ? `${emoji} ` : ''}
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.displayMedium,
    fontSize: 22,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    marginTop: 2,
  },
});
