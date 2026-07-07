import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
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
  /** When true, the creature autonomously wanders left/right within stageWidth, hopping as it goes. */
  roam?: boolean;
  stageWidth?: number;
}

const SLEEP_DELAY = 9000;

// Builds a gravity-style bounce path: an initial jump/impact, then a few
// decaying bounces, like a dropped ball settling on the floor.
function buildBounce(peak: number, ratios: number[] = [1, 0.48, 0.2]) {
  const jumpSteps = [];
  let firstImpactMs = 0;
  for (let i = 0; i < ratios.length; i++) {
    const r = ratios[i];
    const h = peak * r;
    const dur = Math.max(90, Math.min(280, 200 * Math.sqrt(r)));
    jumpSteps.push(withTiming(-h, { duration: dur, easing: Easing.out(Easing.quad) }));
    jumpSteps.push(withTiming(0, { duration: dur, easing: Easing.in(Easing.quad) }));
    if (i === 0) firstImpactMs = dur * 2;
  }
  return {
    jump: withSequence(...jumpSteps),
    squash: withDelay(firstImpactMs, withSequence(withTiming(1, { duration: 55 }), withTiming(0, { duration: 140 }))),
  };
}

export function Creature({
  mood,
  size = 120,
  gaze,
  autoSleep = false,
  bounceToken,
  style,
  roam = false,
  stageWidth,
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
  const glowPulse = useSharedValue(0.7);
  const gazeX = useSharedValue(0);
  const gazeY = useSharedValue(0);
  const armFlutter = useSharedValue(0);
  // gooey idle wobble: two independent slow sine loops, out of phase, so the
  // body keeps jiggling like a soft blob of gel even at rest.
  const jiggleX = useSharedValue(0);
  const jiggleY = useSharedValue(0);

  // ground physics: jumpY is height above the floor (0 = resting), squash is
  // impact deformation (0 = neutral), roamX/roamTilt drive autonomous walking.
  const jumpY = useSharedValue(0);
  const squash = useSharedValue(0);
  const roamX = useSharedValue(0);
  const roamTilt = useSharedValue(0);
  const lastRoamX = useRef(0);

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
    jiggleX.value = withRepeat(
      withTiming(1, { duration: 2100, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    jiggleY.value = withRepeat(
      withTiming(1, { duration: 1750, easing: Easing.inOut(Easing.sin) }),
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

  // real gravity bounce off the floor, triggered whenever bounceToken changes
  useEffect(() => {
    if (bounceToken === undefined) return;
    const { jump, squash: squashAnim } = buildBounce(size * 0.55);
    jumpY.value = jump;
    squash.value = squashAnim;
  }, [bounceToken]);

  // autonomous roaming: wander to a random point along the stage, hopping as it goes, then pause
  useEffect(() => {
    if (!roam || !stageWidth) return;
    let cancelled = false;
    let innerTimer: ReturnType<typeof setTimeout> | null = null;

    const range = Math.max(0, (stageWidth - size * 1.4) / 2);

    function step() {
      if (cancelled) return;
      const target = (Math.random() * 2 - 1) * range;
      const distance = Math.abs(target - lastRoamX.current);
      const direction = target > lastRoamX.current ? 1 : -1;
      const duration = 900 + distance * 2.2;
      lastRoamX.current = target;

      roamTilt.value = withTiming(direction * 9, { duration: 220 });
      roamX.value = withTiming(target, { duration, easing: Easing.inOut(Easing.quad) });

      const { jump, squash: squashAnim } = buildBounce(size * 0.16, [1, 0.4]);
      jumpY.value = jump;
      squash.value = squashAnim;

      const dwell = 1600 + Math.random() * 2600;
      innerTimer = setTimeout(() => {
        if (cancelled) return;
        roamTilt.value = withTiming(0, { duration: 260 });
        step();
      }, duration + dwell);
    }

    const startTimer = setTimeout(step, 1200);
    return () => {
      cancelled = true;
      clearTimeout(startTimer);
      if (innerTimer) clearTimeout(innerTimer);
    };
  }, [roam, stageWidth, size]);

  const wrapperStyle = useAnimatedStyle(() => {
    const swayDeg = interpolate(sway.value, [0, 1], [-4, 4]);
    const squashScaleY = 1 - squash.value * 0.22;
    const squashScaleX = 1 + squash.value * 0.16;
    const goo = interpolate(jiggleX.value, [0, 1], [-0.05, 0.05]);
    const gooInverse = interpolate(jiggleY.value, [0, 1], [0.05, -0.05]);
    return {
      transform: [
        { translateX: roamX.value },
        { translateY: floatY.value + jumpY.value },
        { rotate: `${bodyTiltTarget.value + swayDeg + roamTilt.value}deg` },
        { scaleY: squashScaleY + gooInverse },
        { scaleX: squashScaleX + goo },
      ],
    };
  });

  // subtle pseudo-3D head tilt: perspective + rotateX/Y following gaze, like the
  // body is a glossy sphere turning toward what it's looking at.
  const perspectiveStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 600 },
      { rotateX: `${-gazeY.value * 10}deg` },
      { rotateY: `${gazeX.value * 14}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowPulse.value, [0, 1], [0.45, 0.75]),
    transform: [{ scale: interpolate(glowPulse.value, [0, 1], [0.96, 1.06]) }],
  }));

  // the ground shadow: shrinks and fades as the creature gets further from the floor
  const shadowStyle = useAnimatedStyle(() => {
    const height = Math.abs(floatY.value * 0.4 + jumpY.value);
    const t = Math.min(1, height / (size * 0.6));
    return {
      opacity: interpolate(t, [0, 1], [0.38, 0.08]),
      transform: [{ scaleX: interpolate(t, [0, 1], [1, 0.55]) }, { scaleY: interpolate(t, [0, 1], [1, 0.55]) }],
    };
  });

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

  const boxWidth = roam && stageWidth ? stageWidth : size * 1.9;
  const boxHeight = size * 2.3;
  // how far above the floor the creature's resting body-bottom sits, so the
  // glow can center on it and the shadow can sit exactly at floor level
  const floorMargin = size * 0.3;

  return (
    <View style={[{ width: boxWidth, height: boxHeight }, style]}>
      <View style={styles.stage}>
        {/* floor shadow: pinned to the floor line, independent of the creature's own transform */}
        <View style={[styles.groundLayer, { bottom: 0 }]} pointerEvents="none">
          <Animated.View
            style={[
              styles.shadow,
              { width: size * 0.9, height: size * 0.32, borderRadius: size },
              shadowStyle,
            ]}
          />
        </View>
        <View style={[styles.groundLayer, { bottom: floorMargin - size * 0.5 }]} pointerEvents="none">
          <Animated.View
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
        </View>

        {/* creature: a normal flex child resting on the floor; jump/float/roam are pure transforms */}
        <View style={[styles.groundLayer, { bottom: floorMargin }]}>
          <Animated.View style={wrapperStyle}>
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

        {/* body: perspective wrapper gives the glossy sphere a sense of turning in 3D space */}
        <Animated.View style={perspectiveStyle}>
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
              overflow: 'hidden',
            }}
          >
            {/* ambient occlusion: grounds the sphere with a soft shadow at its base */}
            <LinearGradient
              colors={['rgba(30,15,50,0)', 'rgba(30,15,50,0.3)']}
              style={StyleSheet.absoluteFill as ViewStyle}
              start={{ x: 0.5, y: 0.6 }}
              end={{ x: 0.5, y: 1 }}
              pointerEvents="none"
            />
            {/* wet catch-light: a soft round highlight plus a tiny bright sheen dot, like light on gel */}
            <View
              style={{
                position: 'absolute',
                width: size * 0.34,
                height: size * 0.34,
                borderRadius: size * 0.17,
                top: size * 0.09,
                left: size * 0.13,
                backgroundColor: 'rgba(255,255,255,0.28)',
              }}
              pointerEvents="none"
            />
            <View
              style={{
                position: 'absolute',
                width: size * 0.09,
                height: size * 0.09,
                borderRadius: size * 0.045,
                top: size * 0.12,
                left: size * 0.19,
                backgroundColor: 'rgba(255,255,255,0.55)',
              }}
              pointerEvents="none"
            />

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
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
  },
  groundLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  glow: {},
  shadow: {
    backgroundColor: '#2A1740',
  },
  arm: {
    position: 'absolute',
    borderRadius: 999,
    overflow: 'hidden',
  },
});
