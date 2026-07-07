import React, { useEffect } from 'react';
import { Text } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

interface FloatingEmojiProps {
  emoji: string;
  x: number;
  onDone: () => void;
}

export function FloatingEmoji({ emoji, x, onDone }: FloatingEmojiProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 1300, easing: Easing.out(Easing.quad) }, (finished) => {
      if (finished) runOnJS(onDone)();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: x,
    bottom: 0,
    opacity: 1 - progress.value,
    transform: [
      { translateY: -progress.value * 90 },
      { translateX: Math.sin(progress.value * Math.PI * 2) * 10 },
      { scale: 0.7 + progress.value * 0.6 },
    ],
  }));

  return (
    <Animated.View style={style} pointerEvents="none">
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
    </Animated.View>
  );
}
