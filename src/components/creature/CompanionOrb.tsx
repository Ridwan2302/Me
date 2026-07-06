import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Creature } from './Creature';
import { useCreatureStore } from '../../store/creatureStore';

const HIDDEN_ON = ['/', '/chat'];

export function CompanionOrb() {
  const pathname = usePathname();
  const router = useRouter();
  const mood = useCreatureStore((s) => s.mood);
  const insets = useSafeAreaInsets();

  if (HIDDEN_ON.includes(pathname)) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      exiting={FadeOut.duration(200)}
      style={[styles.wrap, { bottom: insets.bottom + 22 }]}
      pointerEvents="box-none"
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Parler à Me"
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/chat');
        }}
        hitSlop={12}
      >
        <Creature mood={mood} size={44} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 8,
    zIndex: 50,
  },
});
