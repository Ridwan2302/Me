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

export default function Goals() {
  const theme = useTheme();
  const goals = useAppStore((s) => s.goals);
  const addGoal = useAppStore((s) => s.addGoal);
  const updateGoal = useAppStore((s) => s.updateGoal);
  const deleteGoal = useAppStore((s) => s.deleteGoal);
  const setMood = useCreatureStore((s) => s.setMood);
  const bounce = useCreatureStore((s) => s.bounce);
  const [title, setTitle] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAdd = () => {
    if (!title.trim()) return;
    addGoal({ title: title.trim() });
    setTitle('');
    setAdding(false);
    setMood('curious');
    setTimeout(() => setMood('idle'), 1600);
  };

  const bump = (id: string, progress: number, done: boolean) => {
    const next = Math.max(0, Math.min(100, progress));
    updateGoal(id, { progress: next, done: next >= 100 });
    if (next >= 100 && !done) {
      setMood('celebrating');
      bounce();
      setTimeout(() => setMood('idle'), 2400);
    }
  };

  return (
    <Screen>
      <ScreenHeader title="Objectifs" subtitle="Ce que tu veux accomplir, avec Me à tes côtés" emoji="🎯" />

      {adding ? (
        <Animated.View entering={FadeIn}>
          <GlassCard style={{ marginBottom: spacing.md }}>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Nom de l'objectif…"
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
                Nouvel objectif
              </Text>
            </View>
          </GlassCard>
        </PressableScale>
      )}

      {goals.length === 0 ? (
        <Text style={{ color: theme.textSecondary, fontFamily: fonts.body, marginTop: 12 }}>
          Aucun objectif pour l'instant.
        </Text>
      ) : (
        goals.map((g) => (
          <Animated.View key={g.id} layout={Layout.springify()}>
            <GlassCard style={{ marginBottom: spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: theme.textPrimary,
                      fontFamily: fonts.bodySemiBold,
                      fontSize: 15,
                      textDecorationLine: g.done ? 'line-through' : 'none',
                    }}
                  >
                    {g.title}
                  </Text>
                  {g.detail ? (
                    <Text style={{ color: theme.textSecondary, fontFamily: fonts.body, fontSize: 12, marginTop: 2 }}>
                      {g.detail}
                    </Text>
                  ) : null}
                </View>
                <PressableScale onPress={() => deleteGoal(g.id)} gaze={false}>
                  <Ionicons name="trash-outline" size={16} color={theme.textTertiary} />
                </PressableScale>
              </View>

              <View style={{ marginTop: spacing.sm }}>
                <View style={{ height: 8, borderRadius: 4, backgroundColor: theme.border, overflow: 'hidden' }}>
                  <View
                    style={{
                      height: '100%',
                      width: `${g.progress}%`,
                      borderRadius: 4,
                      backgroundColor: g.done ? theme.success : theme.accent,
                    }}
                  />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <Text style={{ color: theme.textTertiary, fontFamily: fonts.body, fontSize: 12 }}>
                    {g.progress}% {g.done ? '· Terminé 🎉' : ''}
                  </Text>
                  {!g.done && (
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <PressableScale onPress={() => bump(g.id, g.progress - 10, g.done)}>
                        <View style={[stylesBtn, { backgroundColor: theme.surfaceStrong }]}>
                          <Ionicons name="remove" size={14} color={theme.textPrimary} />
                        </View>
                      </PressableScale>
                      <PressableScale onPress={() => bump(g.id, g.progress + 10, g.done)}>
                        <View style={[stylesBtn, { backgroundColor: theme.accent }]}>
                          <Ionicons name="add" size={14} color="#fff" />
                        </View>
                      </PressableScale>
                    </View>
                  )}
                </View>
              </View>
            </GlassCard>
          </Animated.View>
        ))
      )}
    </Screen>
  );
}

const stylesBtn = { width: 26, height: 26, borderRadius: 13, alignItems: 'center' as const, justifyContent: 'center' as const };
