import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Eye } from './Eye';
import { moodConfig } from './moodConfig';
import { CreatureMood } from '../../types';
import { creatureGradient, creatureGlow } from '../../theme/tokens';

export interface CreatureProps {
  mood: CreatureMood;
  size?: number;
  gaze?: { x: number; y: number };
  autoSleep?: boolean;
  bounceToken?: number;
  style?: ViewStyle;
}

const SLEEP_DELAY = 9000;

export function Creature({
  mood,
  size = 120,
  gaze,
  autoSleep = false,
  bounceToken,
  style,
}: CreatureProps) {
  const [dozing, setDozing] = useState(false);
  const sleepTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (sleepTimer.current) clearTimeout(sleepTimer.current);
    setDozing(false);
    if (autoSleep && mood === 'idle') {
      sleepTimer.current = setTimeout(() => setDozing(true), SLEEP_DELAY);
    }
    return () => {
      if (sleepTimer.current) clearTimeout(sleepTimer.current);
    };
  }, [mood, autoSleep]);

  const effectiveMood: CreatureMood = dozing ? 'sleepy' : mood;
  const cfg = moodConfig[effectiveMood];

  const squint = useSharedValue(cfg.squint);
  const eyeScale = useSharedValue(cfg.eyeScale);
  const pupilScale = useSharedValue(cfg.pupilScale);
  const pupilOffsetY = useSharedValue(cfg.pupilOffsetY);
  const browTilt = useSharedValue(cfg.browTilt);
  const bodyTiltTarget = useSharedValue(cfg.bodyTilt);
  const bounceStrength = useSharedValue(cfg.bounceStrength);
  const armLift = useSharedValue(cfg.armLift);
  const mouthOpen = useSharedValue(cfg.mouthOpen);
  const mouthSmile = useSharedValue(cfg.mouthSmile);

  const blink = useSharedValue(0);
  const floatY = useSharedValue(0);
  const sway = useSharedValue(0);
  const scalePop = useSharedValue(1);
  const glowPulse = useSharedValue(0.7);
  const gazeX = useSharedValue(0);
  const gazeY = useSharedValue(0);
  const armFlutter = useSharedValue(0);

  useEffect(() => {
    const spring = { damping: 12, stiffness: 90 };
    squint.value = withTiming(cfg.squint, { duration: 320 });
    eyeScale.value = withSpring(cfg.eyeScale, spring);
    pupilScale.value = withSpring(cfg.pupilScale, spring);
    pupilOffsetY.value = withTiming(cfg.pupilOffsetY, { duration: 320 });
    browTilt.value = withSpring(cfg.browTilt, spring);
    bodyTiltTarget.value = withSpring(cfg.bodyTilt, spring);
    bounceStrength.value = withTiming(cfg.bounceStrength, { duration: 400 });
    armLift.value = withSpring(cfg.armLift, spring);
    mouthOpen.value = withTiming(cfg.mouthOpen, { duration: 260 });
    mouthSmile.value = withTiming(cfg.mouthSmile, { duration: 260 });

    floatY.value = withRepeat(
      withTiming(-10 * cfg.bounceStrength, {
        duration: cfg.floatSpeedMs,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );
    armFlutter.value = withRepeat(
      withTiming(1, { duration: cfg.floatSpeedMs * 1.4, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [effectiveMood]);

  useEffect(() => {
    sway.value = withRepeat(
      withTiming(1, { duration: 3400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    glowPulse.value = withRepeat(
      withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    if (gaze) {
      gazeX.value = withSpring(Math.max(-1, Math.min(1, gaze.x)), { damping: 14 });
      gazeY.value = withSpring(Math.max(-1, Math.min(1, gaze.y)), { damping: 14 });
    } else {
      gazeX.value = withSpring(0);
      gazeY.value = withSpring(0);
    }
  }, [gaze?.x, gaze?.y]);

  useEffect(() => {
    if (bounceToken === undefined) return;
    scalePop.value = withSequence(
      withTiming(1.28, { duration: 140, easing: Easing.out(Easing.quad) }),
      withSpring(1, { damping: 6, stiffness: 140 })
    );
  }, [bounceToken]);

  // aperiodic blinking, skipped while dozing (slow heavy-lidded look instead)
  useEffect(() => {
    let cancelled = false;
    function scheduleBlink() {
      const delay = 2400 + Math.random() * 3200;
      const id = setTimeout(() => {
        if (cancelled) return;
        if (!dozing) {
          blink.value = withSequence(
            withTiming(1, { duration: 90 }),
            withTiming(0, { duration: 130 })
          );
        }
        scheduleBlink();
      }, delay);
      return id;
    }
    const id = scheduleBlink();
    return () => {
      cancelled = true;
      clearTimeout(id as unknown as number);
    };
  }, [dozing]);

  const wrapperStyle = useAnimatedStyle(() => {
    const swayDeg = interpolate(sway.value, [0, 1], [-4, 4]);
    return {
      transform: [
        { translateY: floatY.value },
        { rotate: `${bodyTiltTarget.value + swayDeg}deg` },
        { scale: scalePop.value },
      ],
    };
  });

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowPulse.value, [0, 1], [0.45, 0.75]),
    transform: [{ scale: interpolate(glowPulse.value, [0, 1], [0.96, 1.06]) }],
  }));

  const armLeftStyle = useAnimatedStyle(() => {
    const flutter = interpolate(armFlutter.value, [0, 1], [-4, 4]);
    return {
      transform: [
        { translateY: -armLift.value * size * 0.32 + flutter },
        { rotate: `${-20 - armLift.value * 40}deg` },
      ],
    };
  });
  const armRightStyle = useAnimatedStyle(() => {
    const flutter = interpolate(armFlutter.value, [0, 1], [4, -4]);
    return {
      transform: [
        { translateY: -armLift.value * size * 0.32 + flutter },
        { rotate: `${20 + armLift.value * 40}deg` },
      ],
    };
  });

  const antennaLeftStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-14 + interpolate(sway.value, [0, 1], [-6, 6])}deg` }],
  }));
  const antennaRightStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${14 + interpolate(sway.value, [0, 1], [6, -6])}deg` }],
  }));

  const mouthStyle = useAnimatedStyle(() => {
    const baseW = size * 0.16 + mouthSmile.value * size * 0.05;
    const baseH = size * 0.05;
    const oSize = size * 0.16;
    const w = interpolate(mouthOpen.value, [0, 1], [baseW, oSize]);
    const h = interpolate(mouthOpen.value, [0, 1], [baseH, oSize]);
    return {
      width: w,
      height: h,
      borderRadius: h,
    };
  });

  const eyeSize = size * 0.24;
  const scleraColor = 'rgba(255,255,255,0.95)';
  const pupilColor = '#3A2E63';
  const lidColor = creatureGradient[0];

  return (
    <View style={[{ width: size * 1.9, height: size * 1.9, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glow,
          {
            width: size * 1.7,
            height: size * 1.7,
            borderRadius: size,
            backgroundColor: creatureGlow,
          },
          glowStyle,
        ]}
      />
      <Animated.View style={wrapperStyle}>
        {/* antennae */}
        <Animated.View
          style={[styles.antenna, { left: size * 0.28, height: size * 0.22 }, antennaLeftStyle]}
        >
          <View style={[styles.antennaTip, { backgroundColor: creatureGradient[2] }]} />
        </Animated.View>
        <Animated.View
          style={[styles.antenna, { right: size * 0.28, height: size * 0.22 }, antennaRightStyle]}
        >
          <View style={[styles.antennaTip, { backgroundColor: creatureGradient[2] }]} />
        </Animated.View>

        {/* arms */}
        <Animated.View
          style={[
            styles.arm,
            { width: size * 0.22, height: size * 0.14, left: -size * 0.06, top: size * 0.55 },
            armLeftStyle,
          ]}
        >
          <LinearGradient
            colors={creatureGradient}
            style={StyleSheet.absoluteFill as ViewStyle}
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.arm,
            { width: size * 0.22, height: size * 0.14, right: -size * 0.06, top: size * 0.55 },
            armRightStyle,
          ]}
        >
          <LinearGradient
            colors={creatureGradient}
            style={StyleSheet.absoluteFill as ViewStyle}
          />
        </Animated.View>

        {/* body */}
        <LinearGradient
          colors={creatureGradient}
          start={{ x: 0.2, y: 0.1 }}
          end={{ x: 0.9, y: 1 }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View style={{ flexDirection: 'row', gap: size * 0.1, marginBottom: size * 0.1 }}>
            <Eye
              size={eyeSize}
              squint={squint}
              blink={blink}
              eyeScale={eyeScale}
              pupilScale={pupilScale}
              pupilOffsetY={pupilOffsetY}
              gazeX={gazeX}
              gazeY={gazeY}
              browTilt={browTilt}
              browSign={-1}
              scleraColor={scleraColor}
              pupilColor={pupilColor}
              lidColor={lidColor}
            />
            <Eye
              size={eyeSize}
              squint={squint}
              blink={blink}
              eyeScale={eyeScale}
              pupilScale={pupilScale}
              pupilOffsetY={pupilOffsetY}
              gazeX={gazeX}
              gazeY={gazeY}
              browTilt={browTilt}
              browSign={1}
              scleraColor={scleraColor}
              pupilColor={pupilColor}
              lidColor={lidColor}
            />
          </View>
          <Animated.View
            style={[{ backgroundColor: 'rgba(58,46,99,0.5)' }, mouthStyle]}
          />
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
  },
  antenna: {
    position: 'absolute',
    width: 3,
    top: -18,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
  },
  antennaTip: {
    position: 'absolute',
    top: -6,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  arm: {
    position: 'absolute',
    borderRadius: 999,
    overflow: 'hidden',
  },
});
