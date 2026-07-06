import React, { useMemo, useState } from 'react';
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

const EMOJIS = ['✨', '🎓', '💼', '❤️', '🏡', '🌍', '🎉', '👶'];

function parseFrenchDate(input: string): number | null {
  const match = input.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [, d, m, y] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return Number.isNaN(date.getTime()) ? null : date.getTime();
}

export default function Timeline() {
  const theme = useTheme();
  const timeline = useAppStore((s) => s.timeline);
  const addTimelineEvent = useAppStore((s) => s.addTimelineEvent);
  const deleteTimelineEvent = useAppStore((s) => s.deleteTimelineEvent);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [dateText, setDateText] = useState('');
  const [emoji, setEmoji] = useState(EMOJIS[0]);

  const sorted = useMemo(() => [...timeline].sort((a, b) => b.date - a.date), [timeline]);

  const handleAdd = () => {
    if (!title.trim()) return;
    const date = parseFrenchDate(dateText) ?? Date.now();
    addTimelineEvent({ title: title.trim(), detail: detail.trim() || undefined, date, emoji });
    setTitle('');
    setDetail('');
    setDateText('');
    setAdding(false);
  };

  return (
    <Screen>
      <ScreenHeader title="Chronologie" subtitle="L'histoire de ta vie, racontée dans le temps" emoji="🕰️" />

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
              placeholder="Quel évènement ?"
              placeholderTextColor={theme.textTertiary}
              autoFocus
              style={{ color: theme.textPrimary, fontFamily: fonts.bodySemiBold, fontSize: 15, paddingVertical: 6 }}
            />
            <TextInput
              value={dateText}
              onChangeText={setDateText}
              placeholder="Date JJ/MM/AAAA (optionnel, sinon aujourd'hui)"
              placeholderTextColor={theme.textTertiary}
              style={{ color: theme.textPrimary, fontFamily: fonts.body, fontSize: 13, paddingVertical: 6 }}
            />
            <TextInput
              value={detail}
              onChangeText={setDetail}
              placeholder="Détail (optionnel)"
              placeholderTextColor={theme.textTertiary}
              multiline
              style={{ color: theme.textPrimary, fontFamily: fonts.body, fontSize: 13, paddingVertical: 6 }}
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
                Nouvel évènement
              </Text>
            </View>
          </GlassCard>
        </PressableScale>
      )}

      <View style={{ marginTop: spacing.sm }}>
        {sorted.map((event, idx) => (
          <Animated.View key={event.id} layout={Layout.springify()} style={{ flexDirection: 'row' }}>
            <View style={{ alignItems: 'center', width: 28 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.accent }} />
              {idx < sorted.length - 1 ? (
                <View style={{ width: 2, flex: 1, backgroundColor: theme.border, marginTop: 4 }} />
              ) : null}
            </View>
            <View style={{ flex: 1, marginBottom: spacing.md }}>
              <GlassCard>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <Text style={{ fontSize: 20, marginRight: 8 }}>{event.emoji ?? '✨'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.textPrimary, fontFamily: fonts.bodySemiBold, fontSize: 14 }}>
                      {event.title}
                    </Text>
                    {event.detail ? (
                      <Text style={{ color: theme.textSecondary, fontFamily: fonts.body, fontSize: 12, marginTop: 2 }}>
                        {event.detail}
                      </Text>
                    ) : null}
                    <Text style={{ color: theme.textTertiary, fontFamily: fonts.body, fontSize: 11, marginTop: 4 }}>
                      {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </Text>
                  </View>
                  <PressableScale onPress={() => deleteTimelineEvent(event.id)} gaze={false}>
                    <Ionicons name="trash-outline" size={15} color={theme.textTertiary} />
                  </PressableScale>
                </View>
              </GlassCard>
            </View>
          </Animated.View>
        ))}
      </View>
    </Screen>
  );
}
