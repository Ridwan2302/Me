import { MoodValue } from '../types';

export const MOODS: { value: MoodValue; emoji: string; label: string }[] = [
  { value: 1, emoji: '😔', label: 'Difficile' },
  { value: 2, emoji: '😕', label: 'Bof' },
  { value: 3, emoji: '😊', label: 'Bien' },
  { value: 4, emoji: '😄', label: 'Super' },
  { value: 5, emoji: '🤩', label: 'Incroyable' },
];

export function moodEmoji(value: MoodValue) {
  return MOODS.find((m) => m.value === value)?.emoji ?? '😊';
}

export function moodLabel(value: MoodValue) {
  return MOODS.find((m) => m.value === value)?.label ?? '';
}
