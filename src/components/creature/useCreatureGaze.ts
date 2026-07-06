import { useRef } from 'react';
import { Dimensions, View } from 'react-native';
import { useCreatureStore } from '../../store/creatureStore';

// Approximates "the creature glances at what you're about to touch" by
// mapping a pressed element's position on screen to a -1..1 gaze vector.
export function useCreatureGaze() {
  const setGaze = useCreatureStore((s) => s.setGaze);
  const ref = useRef<View>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lookHere = () => {
    ref.current?.measureInWindow((x, y, width, height) => {
      const { width: sw, height: sh } = Dimensions.get('window');
      const cx = x + width / 2;
      const cy = y + height / 2;
      setGaze({ x: (cx / sw) * 2 - 1, y: (cy / sh) * 2 - 1 });
    });
    if (resetTimer.current) clearTimeout(resetTimer.current);
  };

  const lookAway = () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setGaze(null), 500);
  };

  return { ref, onPressIn: lookHere, onHoverIn: lookHere, onPressOut: lookAway, onHoverOut: lookAway };
}
