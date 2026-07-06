import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeId } from '../lib/id';
import {
  ChatMessage,
  Goal,
  Habit,
  JournalEntry,
  MemoryCategory,
  MemoryItem,
  MoodLog,
  MoodValue,
  NoteItem,
  Person,
  PhotoItem,
  SouvenirItem,
  TimelineEvent,
} from '../types';

function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

interface AppState {
  hasHydrated: boolean;
  userName: string;
  onboarded: boolean;
  memories: MemoryItem[];
  messages: ChatMessage[];
  journal: JournalEntry[];
  moodLogs: MoodLog[];
  goals: Goal[];
  habits: Habit[];
  timeline: TimelineEvent[];
  photos: PhotoItem[];
  notes: NoteItem[];
  people: Person[];
  souvenirs: SouvenirItem[];

  setHasHydrated: (v: boolean) => void;
  setUserName: (name: string) => void;
  completeOnboarding: () => void;

  addMemory: (m: Omit<MemoryItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMemory: (id: string, patch: Partial<MemoryItem>) => void;
  deleteMemory: (id: string) => void;
  togglePinMemory: (id: string) => void;

  addMessage: (msg: Omit<ChatMessage, 'id' | 'createdAt'>) => ChatMessage;

  addJournalEntry: (e: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateJournalEntry: (id: string, patch: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: string) => void;

  addMoodLog: (value: MoodValue, note?: string) => void;
  deleteMoodLog: (id: string) => void;

  addGoal: (g: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'done' | 'progress'> & { progress?: number }) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  addHabit: (title: string, emoji: string) => void;
  toggleHabitToday: (id: string) => void;
  deleteHabit: (id: string) => void;

  addTimelineEvent: (e: Omit<TimelineEvent, 'id' | 'createdAt'>) => void;
  deleteTimelineEvent: (id: string) => void;

  addPhoto: (uri: string, caption?: string) => void;
  updatePhoto: (id: string, patch: Partial<PhotoItem>) => void;
  deletePhoto: (id: string) => void;

  addNote: (title: string, body: string) => void;
  updateNote: (id: string, patch: Partial<NoteItem>) => void;
  deleteNote: (id: string) => void;

  addPerson: (p: Omit<Person, 'id' | 'createdAt'>) => void;
  updatePerson: (id: string, patch: Partial<Person>) => void;
  deletePerson: (id: string) => void;

  addSouvenir: (s: Omit<SouvenirItem, 'id' | 'createdAt'>) => void;
  deleteSouvenir: (id: string) => void;
}

const now = Date.now();
const DAY = 86400000;

const seedMemories: MemoryItem[] = [
  {
    id: makeId(),
    category: 'preference',
    label: 'Aime le café le matin',
    detail: "Tu m'as dit préférer démarrer la journée avec un café plutôt qu'un thé.",
    source: 'chat',
    createdAt: now - DAY * 3,
    updatedAt: now - DAY * 3,
    pinned: true,
  },
  {
    id: makeId(),
    category: 'personality',
    label: 'Créatif et curieux',
    detail: 'Tu poses souvent des questions profondes et aimes explorer de nouvelles idées.',
    source: 'chat',
    createdAt: now - DAY * 5,
    updatedAt: now - DAY * 5,
  },
  {
    id: makeId(),
    category: 'goal',
    label: 'Apprendre à mieux dormir',
    detail: "Tu travailles sur l'amélioration de ton sommeil ces dernières semaines.",
    source: 'goal',
    createdAt: now - DAY * 2,
    updatedAt: now - DAY * 2,
  },
];

const seedMessages: ChatMessage[] = [
  {
    id: makeId(),
    role: 'me',
    text: "Bonjour ! Je suis Me, ton compagnon. Je suis tout content de faire ta connaissance. Raconte-moi quelque chose sur toi ?",
    createdAt: now - DAY * 3,
    mood: 'happy',
  },
];

const seedGoals: Goal[] = [
  {
    id: makeId(),
    title: 'Mieux dormir',
    detail: 'Se coucher avant minuit 5 jours par semaine',
    progress: 40,
    done: false,
    createdAt: now - DAY * 6,
    updatedAt: now - DAY,
  },
];

const seedHabits: Habit[] = [
  {
    id: makeId(),
    title: 'Boire de l\'eau',
    emoji: '💧',
    streak: 2,
    bestStreak: 5,
    completedDates: [todayISO(-1), todayISO(-2)],
    createdAt: now - DAY * 10,
  },
];

const seedTimeline: TimelineEvent[] = [
  {
    id: makeId(),
    title: "Première conversation avec Me",
    detail: 'Le début de notre histoire.',
    date: now - DAY * 3,
    emoji: '✨',
    createdAt: now - DAY * 3,
  },
];

const seedPeople: Person[] = [
  {
    id: makeId(),
    name: 'Maman',
    relationship: 'Famille',
    notes: 'Toujours de bon conseil.',
    emoji: '💗',
    createdAt: now - DAY * 8,
  },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      userName: '',
      onboarded: false,
      memories: seedMemories,
      messages: seedMessages,
      journal: [],
      moodLogs: [],
      goals: seedGoals,
      habits: seedHabits,
      timeline: seedTimeline,
      photos: [],
      notes: [],
      people: seedPeople,
      souvenirs: [],

      setHasHydrated: (v) => set({ hasHydrated: v }),
      setUserName: (name) => set({ userName: name }),
      completeOnboarding: () => set({ onboarded: true }),

      addMemory: (m) =>
        set((s) => ({
          memories: [
            { ...m, id: makeId(), createdAt: Date.now(), updatedAt: Date.now() },
            ...s.memories,
          ],
        })),
      updateMemory: (id, patch) =>
        set((s) => ({
          memories: s.memories.map((m) =>
            m.id === id ? { ...m, ...patch, updatedAt: Date.now() } : m
          ),
        })),
      deleteMemory: (id) => set((s) => ({ memories: s.memories.filter((m) => m.id !== id) })),
      togglePinMemory: (id) =>
        set((s) => ({
          memories: s.memories.map((m) => (m.id === id ? { ...m, pinned: !m.pinned } : m)),
        })),

      addMessage: (msg) => {
        const full: ChatMessage = { ...msg, id: makeId(), createdAt: Date.now() };
        set((s) => ({ messages: [...s.messages, full] }));
        return full;
      },

      addJournalEntry: (e) =>
        set((s) => ({
          journal: [
            { ...e, id: makeId(), createdAt: Date.now(), updatedAt: Date.now() },
            ...s.journal,
          ],
        })),
      updateJournalEntry: (id, patch) =>
        set((s) => ({
          journal: s.journal.map((j) => (j.id === id ? { ...j, ...patch, updatedAt: Date.now() } : j)),
        })),
      deleteJournalEntry: (id) => set((s) => ({ journal: s.journal.filter((j) => j.id !== id) })),

      addMoodLog: (value, note) =>
        set((s) => ({
          moodLogs: [{ id: makeId(), value, note, createdAt: Date.now() }, ...s.moodLogs],
        })),
      deleteMoodLog: (id) => set((s) => ({ moodLogs: s.moodLogs.filter((m) => m.id !== id) })),

      addGoal: (g) =>
        set((s) => ({
          goals: [
            {
              ...g,
              progress: g.progress ?? 0,
              done: false,
              id: makeId(),
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
            ...s.goals,
          ],
        })),
      updateGoal: (id, patch) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch, updatedAt: Date.now() } : g)),
        })),
      deleteGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      addHabit: (title, emoji) =>
        set((s) => ({
          habits: [
            {
              id: makeId(),
              title,
              emoji,
              streak: 0,
              bestStreak: 0,
              completedDates: [],
              createdAt: Date.now(),
            },
            ...s.habits,
          ],
        })),
      toggleHabitToday: (id) =>
        set((s) => ({
          habits: s.habits.map((h) => {
            if (h.id !== id) return h;
            const today = todayISO();
            const already = h.completedDates.includes(today);
            const completedDates = already
              ? h.completedDates.filter((d) => d !== today)
              : [...h.completedDates, today];
            const yesterday = todayISO(-1);
            let streak = h.streak;
            if (!already) {
              streak = h.completedDates.includes(yesterday) ? h.streak + 1 : 1;
            } else {
              streak = Math.max(0, h.streak - 1);
            }
            return {
              ...h,
              completedDates,
              streak,
              bestStreak: Math.max(h.bestStreak, streak),
            };
          }),
        })),
      deleteHabit: (id) => set((s) => ({ habits: s.habits.filter((h) => h.id !== id) })),

      addTimelineEvent: (e) =>
        set((s) => ({
          timeline: [{ ...e, id: makeId(), createdAt: Date.now() }, ...s.timeline],
        })),
      deleteTimelineEvent: (id) =>
        set((s) => ({ timeline: s.timeline.filter((t) => t.id !== id) })),

      addPhoto: (uri, caption) =>
        set((s) => ({
          photos: [{ id: makeId(), uri, caption, createdAt: Date.now() }, ...s.photos],
        })),
      updatePhoto: (id, patch) =>
        set((s) => ({ photos: s.photos.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      deletePhoto: (id) => set((s) => ({ photos: s.photos.filter((p) => p.id !== id) })),

      addNote: (title, body) =>
        set((s) => ({
          notes: [
            { id: makeId(), title, body, createdAt: Date.now(), updatedAt: Date.now() },
            ...s.notes,
          ],
        })),
      updateNote: (id, patch) =>
        set((s) => ({
          notes: s.notes.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n)),
        })),
      deleteNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

      addPerson: (p) =>
        set((s) => ({ people: [{ ...p, id: makeId(), createdAt: Date.now() }, ...s.people] })),
      updatePerson: (id, patch) =>
        set((s) => ({ people: s.people.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      deletePerson: (id) => set((s) => ({ people: s.people.filter((p) => p.id !== id) })),

      addSouvenir: (sv) =>
        set((s) => ({
          souvenirs: [{ ...sv, id: makeId(), createdAt: Date.now() }, ...s.souvenirs],
        })),
      deleteSouvenir: (id) =>
        set((s) => ({ souvenirs: s.souvenirs.filter((sv) => sv.id !== id) })),
    }),
    {
      name: 'me-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (s) => {
        const { hasHydrated, ...rest } = s;
        return rest;
      },
    }
  )
);

export type { MemoryCategory };
