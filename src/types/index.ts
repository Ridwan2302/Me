export type CreatureMood =
  | 'idle'
  | 'happy'
  | 'curious'
  | 'thinking'
  | 'sleepy'
  | 'surprised'
  | 'empathetic'
  | 'celebrating'
  | 'listening';

export type MemoryCategory =
  | 'personality'
  | 'preference'
  | 'emotion'
  | 'goal'
  | 'habit'
  | 'person'
  | 'event'
  | 'other';

export interface MemoryItem {
  id: string;
  category: MemoryCategory;
  label: string;
  detail: string;
  source: 'chat' | 'journal' | 'manual' | 'mood' | 'goal' | 'habit' | 'people';
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'me';
  text: string;
  createdAt: number;
  mood?: CreatureMood;
}

export interface JournalEntry {
  id: string;
  title: string;
  body: string;
  mood?: MoodValue;
  createdAt: number;
  updatedAt: number;
}

export type MoodValue = 1 | 2 | 3 | 4 | 5;

export interface MoodLog {
  id: string;
  value: MoodValue;
  note?: string;
  createdAt: number;
}

export interface Goal {
  id: string;
  title: string;
  detail?: string;
  progress: number; // 0-100
  targetDate?: number;
  done: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Habit {
  id: string;
  title: string;
  emoji: string;
  streak: number;
  bestStreak: number;
  completedDates: string[]; // ISO yyyy-mm-dd
  createdAt: number;
}

export interface TimelineEvent {
  id: string;
  title: string;
  detail?: string;
  date: number;
  emoji?: string;
  createdAt: number;
}

export interface PhotoItem {
  id: string;
  uri: string;
  caption?: string;
  createdAt: number;
}

export interface NoteItem {
  id: string;
  title: string;
  body: string;
  createdAt: number;
  updatedAt: number;
}

export interface Person {
  id: string;
  name: string;
  relationship: string;
  notes?: string;
  importantDate?: number;
  emoji: string;
  createdAt: number;
}

export interface SouvenirItem {
  id: string;
  title: string;
  detail: string;
  emoji: string;
  createdAt: number;
}
