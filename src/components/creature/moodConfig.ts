import { CreatureMood } from '../../types';

export interface MoodTargets {
  squint: number; // 0 = wide open, 1 = fully closed
  eyeScale: number; // overall eye size multiplier
  pupilScale: number;
  pupilOffsetY: number; // -1 up .. 1 down, relative
  browTilt: number; // degrees, eyebrow/eyelid tilt for curious/empathetic
  bodyTilt: number; // degrees, whole body tilt
  bounceStrength: number; // multiplier for idle bounce amplitude
  armLift: number; // 0..1
  mouthOpen: number; // 0..1, 1 = round "o"
  mouthSmile: number; // -1 frown .. 1 big smile
  floatSpeedMs: number;
}

export const moodConfig: Record<CreatureMood, MoodTargets> = {
  idle: {
    squint: 0.12,
    eyeScale: 1,
    pupilScale: 1,
    pupilOffsetY: 0,
    browTilt: 0,
    bodyTilt: 0,
    bounceStrength: 1,
    armLift: 0,
    mouthOpen: 0,
    mouthSmile: 0.35,
    floatSpeedMs: 2600,
  },
  happy: {
    squint: 0.62,
    eyeScale: 1,
    pupilScale: 1,
    pupilOffsetY: 0,
    browTilt: 0,
    bodyTilt: -3,
    bounceStrength: 1.6,
    armLift: 0.4,
    mouthOpen: 0,
    mouthSmile: 1,
    floatSpeedMs: 1800,
  },
  curious: {
    squint: 0.05,
    eyeScale: 1.08,
    pupilScale: 1.1,
    pupilOffsetY: -0.15,
    browTilt: 10,
    bodyTilt: 8,
    bounceStrength: 0.8,
    armLift: 0,
    mouthOpen: 0.25,
    mouthSmile: 0.4,
    floatSpeedMs: 2400,
  },
  thinking: {
    squint: 0.3,
    eyeScale: 1,
    pupilScale: 0.9,
    pupilOffsetY: -0.4,
    browTilt: -8,
    bodyTilt: -6,
    bounceStrength: 0.5,
    armLift: 0,
    mouthOpen: 0,
    mouthSmile: -0.1,
    floatSpeedMs: 3200,
  },
  sleepy: {
    squint: 0.92,
    eyeScale: 1,
    pupilScale: 0.8,
    pupilOffsetY: 0,
    browTilt: 0,
    bodyTilt: 12,
    bounceStrength: 0.25,
    armLift: 0,
    mouthOpen: 0.15,
    mouthSmile: -0.2,
    floatSpeedMs: 4200,
  },
  surprised: {
    squint: 0,
    eyeScale: 1.35,
    pupilScale: 0.7,
    pupilOffsetY: 0,
    browTilt: 0,
    bodyTilt: 0,
    bounceStrength: 2.1,
    armLift: 0.15,
    mouthOpen: 0.9,
    mouthSmile: 0.1,
    floatSpeedMs: 1400,
  },
  empathetic: {
    squint: 0.35,
    eyeScale: 1,
    pupilScale: 1,
    pupilOffsetY: 0.1,
    browTilt: -6,
    bodyTilt: 4,
    bounceStrength: 0.4,
    armLift: 0.1,
    mouthOpen: 0,
    mouthSmile: 0.5,
    floatSpeedMs: 3400,
  },
  celebrating: {
    squint: 0.6,
    eyeScale: 1.05,
    pupilScale: 1,
    pupilOffsetY: 0,
    browTilt: 0,
    bodyTilt: 0,
    bounceStrength: 2.6,
    armLift: 1,
    mouthOpen: 0.3,
    mouthSmile: 1,
    floatSpeedMs: 900,
  },
  listening: {
    squint: 0.08,
    eyeScale: 1.02,
    pupilScale: 1.05,
    pupilOffsetY: 0,
    browTilt: 4,
    bodyTilt: 2,
    bounceStrength: 0.6,
    armLift: 0,
    mouthOpen: 0,
    mouthSmile: 0.25,
    floatSpeedMs: 2200,
  },
};
