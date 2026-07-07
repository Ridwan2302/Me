import React from 'react';
import { GestureResponderEvent, Pressable, StyleProp, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useCreatureGaze } from '../creature/useCreatureGaze';

interface PressableScaleProps {
  children: React.ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
  onLongPress?: (e: GestureResponderEvent) => void;
  delayLongPress?: number;
  style?: StyleProp<ViewStyle>;
  gaze?: boolean;
  haptic?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PressableScale({
  children,
  onPress,
  onLongPress,
  delayLongPress,
  style,
  gaze = true,
  haptic = true,
  disabled,
  accessibilityLabel,
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const gazeHandlers = useCreatureGaze();

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View ref={gaze ? gazeHandlers.ref : undefined} collapsable={false} style={style}>
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        disabled={disabled}
        onPressIn={() => {
          scale.value = withSpring(0.94, { damping: 14, stiffness: 260 });
          if (gaze) gazeHandlers.onPressIn();
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 10, stiffness: 200 });
          if (gaze) gazeHandlers.onPressOut();
        }}
        onHoverIn={gaze ? gazeHandlers.onHoverIn : undefined}
        onHoverOut={gaze ? gazeHandlers.onHoverOut : undefined}
        onPress={(e) => {
          if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress?.(e);
        }}
        onLongPress={
          onLongPress
            ? (e) => {
                if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onLongPress(e);
              }
            : undefined
        }
        delayLongPress={delayLongPress}
        style={animStyle}
      >
        {children}
      </AnimatedPressable>
    </View>
  );
}
