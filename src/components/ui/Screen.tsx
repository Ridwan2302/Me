import React from 'react';
import { ScrollView, ScrollViewProps, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';

interface ScreenProps extends ScrollViewProps {
  children: React.ReactNode;
  scroll?: boolean;
}

export function Screen({ children, scroll = true, contentContainerStyle, ...rest }: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const Content = scroll ? ScrollView : View;
  const contentProps = scroll
    ? {
        contentContainerStyle: [
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 120, paddingHorizontal: 20 },
          contentContainerStyle,
        ],
        showsVerticalScrollIndicator: false,
        ...rest,
      }
    : { style: { flex: 1, paddingTop: insets.top + 8, paddingHorizontal: 20 } };

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={theme.bg}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.9, y: 1 }}
      />
      <Content {...(contentProps as any)}>{children}</Content>
    </View>
  );
}
