import React, { useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Screen } from '../src/components/ui/Screen';
import { ScreenHeader } from '../src/components/ui/ScreenHeader';
import { GlassCard } from '../src/components/ui/GlassCard';
import { PressableScale } from '../src/components/ui/PressableScale';
import { useTheme } from '../src/theme/ThemeContext';
import { fonts, spacing } from '../src/theme/tokens';
import { useAppStore } from '../src/store/appStore';
import { useCreatureStore } from '../src/store/creatureStore';
import { MOODS, moodEmoji } from '../src/lib/moodMeta';
import { MoodValue } from '../src/types';

const DAY = 86400000;

function dayKey(ts: number) {
  return new Date(ts).toISOString().slice(0, 10);
}

export default function Mood() {
  const theme = useTheme();
  const moodLogs = useAppStore((s) => s.moodLogs);
  const addMoodLog = useAppStore((s) => s.addMoodLog);
  const deleteMoodLog = useAppStore((s) => s.deleteMoodLog);
  const setMood = useCreatureStore((s) => s.setMood);
  const bounce = useCreatureStore((s) => s.bounce);
  const [note, setNote] = useState('');
  const [selected, setSelected] = useState<MoodValue | null>(null);

  const last14 = useMemo(() => {
    const days: { key: string; label: string; avg: number | null }[] = [];
    for (let i = 13; i >= 0; i--) {
      const ts = Date.now() - i * DAY;
      const key = dayKey(ts);
      const logs = moodLogs.filter((l) => dayKey(l.createdAt) === key);
      const avg = logs.length ? logs.reduce((a, b) => a + b.value, 0) / logs.length : null;
      days.push({ key, label: new Date(ts).toLocaleDateString('fr-FR', { weekday: 'narrow' }), avg });
    }
    return days;
  }, [moodLogs]);

  const handleLog = () => {
    if (!selected) return;
    addMoodLog(selected, note.trim() || undefined);
    setMood(selected >= 4 ? 'celebrating' : selected === 3 ? 'happy' : 'empathetic');
    bounce();
    setTimeout(() => setMood('idle'), 2000);
    setNote('');
    setSelected(null);
  };

  return (
    <Screen>
      <ScreenHeader title="Humeur" subtitle="Ton évolution émotionnelle au fil du temps" emoji="🌤️" />

      <GlassCard style={{ marginBottom: spacing.md }}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary, marginBottom: spacing.sm }]}>
          Comment te sens-tu maintenant ?
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm }}>
          {MOODS.map((m) => (
            <PressableScale key={m.value} onPress={() => setSelected(m.value)}>
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 15,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: selected === m.value ? theme.accentSoft : 'transparent',
                  borderWidth: selected === m.value ? 1 : 0,
                  borderColor: theme.accent,
                }}
              >
                <Text style={{ fontSize: 22 }}>{m.emoji}</Text>
              </View>
            </PressableScale>
          ))}
        </View>
        {selected ? (
          <Animated.View entering={FadeIn}>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Un mot sur ce que tu ressens (optionnel)"
              placeholderTextColor={theme.textTertiary}
              style={{
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 12,
                padding: 10,
                color: theme.textPrimary,
                fontFamily: fonts.body,
                marginBottom: spacing.sm,
              }}
            />
            <PressableScale onPress={handleLog}>
              <View style={{ backgroundColor: theme.accent, borderRadius: 999, paddingVertical: 10, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontFamily: fonts.bodySemiBold, fontSize: 14 }}>Enregistrer</Text>
              </View>
            </PressableScale>
          </Animated.View>
        ) : null}
      </GlassCard>

      <GlassCard style={{ marginBottom: spacing.md }}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary, marginBottom: spacing.md }]}>
          14 derniers jours
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 90 }}>
          {last14.map((d) => (
            <View key={d.key} style={{ alignItems: 'center', width: 18 }}>
              <View
                style={{
                  width: 10,
                  height: d.avg ? Math.max(6, (d.avg / 5) * 70) : 4,
                  borderRadius: 6,
                  backgroundColor: d.avg ? theme.accent : theme.border,
                  marginBottom: 6,
                }}
              />
              <Text style={{ fontSize: 9, color: theme.textTertiary, fontFamily: fonts.body }}>{d.label}</Text>
            </View>
          ))}
        </View>
      </GlassCard>

      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Historique</Text>
      {moodLogs.length === 0 ? (
        <Text style={{ color: theme.textSecondary, fontFamily: fonts.body, marginTop: 8 }}>
          Aucune humeur enregistrée pour le moment.
        </Text>
      ) : (
        moodLogs.map((log) => (
          <GlassCard key={log.id} style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 22, marginRight: 10 }}>{moodEmoji(log.value)}</Text>
              <View style={{ flex: 1 }}>
                {log.note ? (
                  <Text style={{ color: theme.textPrimary, fontFamily: fonts.body, fontSize: 13 }}>{log.note}</Text>
                ) : null}
                <Text style={{ color: theme.textTertiary, fontFamily: fonts.body, fontSize: 11 }}>
                  {new Date(log.createdAt).toLocaleString('fr-FR')}
                </Text>
              </View>
              <PressableScale onPress={() => deleteMoodLog(log.id)} gaze={false}>
                <Ionicons name="trash-outline" size={16} color={theme.textTertiary} />
              </PressableScale>
            </View>
          </GlassCard>
        ))
      )}
    </Screen>
  );
}

const styles = {
  cardTitle: { fontFamily: fonts.bodySemiBold, fontSize: 15 },
  sectionTitle: { fontFamily: fonts.displayMedium, fontSize: 17, marginBottom: 8 },
};
