import React from 'react';
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

interface EyeProps {
  size: number;
  squint: SharedValue<number>;
  blink: SharedValue<number>;
  eyeScale: SharedValue<number>;
  pupilScale: SharedValue<number>;
  pupilOffsetY: SharedValue<number>;
  gazeX: SharedValue<number>;
  gazeY: SharedValue<number>;
  browTilt: SharedValue<number>;
  browSign: 1 | -1;
  scleraColor: string;
  pupilColor: string;
  lidColor: string;
}

export function Eye({
  size,
  squint,
  blink,
  eyeScale,
  pupilScale,
  pupilOffsetY,
  gazeX,
  gazeY,
  browTilt,
  browSign,
  scleraColor,
  pupilColor,
  lidColor,
}: EyeProps) {
  const containerStyle = useAnimatedStyle(() => {
    const s = size * eyeScale.value;
    return {
      width: s,
      height: s,
      borderRadius: s / 2,
      transform: [{ rotate: `${browTilt.value * browSign}deg` }],
    };
  });

  const pupilStyle = useAnimatedStyle(() => {
    const p = size * 0.46 * pupilScale.value;
    return {
      width: p,
      height: p,
      borderRadius: p / 2,
      transform: [
        { translateX: gazeX.value * size * 0.16 },
        { translateY: gazeY.value * size * 0.16 + pupilOffsetY.value * size * 0.2 },
      ],
    };
  });

  const lidStyle = useAnimatedStyle(() => {
    const closeAmount = Math.max(squint.value, blink.value);
    const s = size * eyeScale.value;
    return {
      height: Math.max(0, Math.min(1, closeAmount)) * s,
      borderTopLeftRadius: s / 2,
      borderTopRightRadius: s / 2,
    };
  });

  return (
    <Animated.View
      style={[
        {
          backgroundColor: scleraColor,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
        },
        containerStyle,
      ]}
    >
      <Animated.View style={[{ backgroundColor: pupilColor }, pupilStyle]}>
        <Animated.View
          style={{
            position: 'absolute',
            top: '18%',
            left: '20%',
            width: '30%',
            height: '30%',
            borderRadius: 999,
            backgroundColor: 'rgba(255,255,255,0.85)',
          }}
        />
      </Animated.View>
      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: lidColor,
          },
          lidStyle,
        ]}
      />
    </Animated.View>
  );
}
