import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';
import { Screen } from '../src/components/ui/Screen';
import { ScreenHeader } from '../src/components/ui/ScreenHeader';
import { GlassCard } from '../src/components/ui/GlassCard';
import { PressableScale } from '../src/components/ui/PressableScale';
import { useTheme } from '../src/theme/ThemeContext';
import { fonts, spacing } from '../src/theme/tokens';
import { useAppStore } from '../src/store/appStore';
import { useCreatureStore } from '../src/store/creatureStore';

const EMOJIS = ['💧', '🏃', '📖', '🧘', '🥗', '😴', '☀️', '✍️'];
const todayISO = () => new Date().toISOString().slice(0, 10);

export default function Habits() {
  const theme = useTheme();
  const habits = useAppStore((s) => s.habits);
  const addHabit = useAppStore((s) => s.addHabit);
  const toggleHabitToday = useAppStore((s) => s.toggleHabitToday);
  const deleteHabit = useAppStore((s) => s.deleteHabit);
  const setMood = useCreatureStore((s) => s.setMood);
  const bounce = useCreatureStore((s) => s.bounce);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState(EMOJIS[0]);

  const handleAdd = () => {
    if (!title.trim()) return;
    addHabit(title.trim(), emoji);
    setTitle('');
    setAdding(false);
  };

  const handleToggle = (id: string, done: boolean) => {
    toggleHabitToday(id);
    if (!done) {
      setMood('happy');
      bounce();
      setTimeout(() => setMood('idle'), 1600);
    }
  };

  return (
    <Screen>
      <ScreenHeader title="Habitudes" subtitle="Petits gestes répétés, grands changements" emoji="🔁" />

      {adding ? (
        <Animated.View entering={FadeIn}>
          <GlassCard style={{ marginBottom: spacing.md }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.sm }}>
              {EMOJIS.map((e) => (
                <PressableScale key={e} onPress={() => setEmoji(e)}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: emoji === e ? theme.accentSoft : 'transparent',
                      borderWidth: emoji === e ? 1 : 0,
                      borderColor: theme.accent,
                    }}
                  >
                    <Text style={{ fontSize: 18 }}>{e}</Text>
                  </View>
                </PressableScale>
              ))}
            </View>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Nom de l'habitude…"
              placeholderTextColor={theme.textTertiary}
              autoFocus
              style={{ color: theme.textPrimary, fontFamily: fonts.body, fontSize: 15, paddingVertical: 6 }}
            />
            <View style={{ flexDirection: 'row', gap: 8, marginTop: spacing.sm }}>
              <PressableScale onPress={handleAdd}>
                <View style={{ backgroundColor: theme.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 }}>
                  <Text style={{ color: '#fff', fontFamily: fonts.bodySemiBold, fontSize: 13 }}>Ajouter</Text>
                </View>
              </PressableScale>
              <PressableScale onPress={() => setAdding(false)}>
                <View style={{ backgroundColor: theme.surfaceStrong, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 }}>
                  <Text style={{ color: theme.textPrimary, fontFamily: fonts.bodyMedium, fontSize: 13 }}>Annuler</Text>
                </View>
              </PressableScale>
            </View>
          </GlassCard>
        </Animated.View>
      ) : (
        <PressableScale onPress={() => setAdding(true)}>
          <GlassCard style={{ marginBottom: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="add-circle-outline" size={20} color={theme.accent} />
              <Text style={{ color: theme.accent, fontFamily: fonts.bodySemiBold, fontSize: 14 }}>
                Nouvelle habitude
              </Text>
            </View>
          </GlassCard>
        </PressableScale>
      )}

      {habits.length === 0 ? (
        <Text style={{ color: theme.textSecondary, fontFamily: fonts.body, marginTop: 12 }}>
          Aucune habitude suivie pour l'instant.
        </Text>
      ) : (
        habits.map((h) => {
          const done = h.completedDates.includes(todayISO());
          return (
            <Animated.View key={h.id} layout={Layout.springify()}>
              <GlassCard style={{ marginBottom: spacing.sm }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 26, marginRight: 12 }}>{h.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.textPrimary, fontFamily: fonts.bodySemiBold, fontSize: 15 }}>
                      {h.title}
                    </Text>
                    <Text style={{ color: theme.textTertiary, fontFamily: fonts.body, fontSize: 12 }}>
                      🔥 {h.streak} jour{h.streak > 1 ? 's' : ''} · record {h.bestStreak}
                    </Text>
                  </View>
                  <PressableScale onPress={() => handleToggle(h.id, done)}>
                    <View
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 17,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: done ? theme.success : theme.surfaceStrong,
                        marginRight: 8,
                      }}
                    >
                      <Ionicons name="checkmark" size={18} color={done ? '#fff' : theme.textTertiary} />
                    </View>
                  </PressableScale>
                  <PressableScale onPress={() => deleteHabit(h.id)} gaze={false}>
                    <Ionicons name="trash-outline" size={16} color={theme.textTertiary} />
                  </PressableScale>
                </View>
              </GlassCard>
            </Animated.View>
          );
        })
      )}
    </Screen>
  );
}
