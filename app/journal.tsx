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
import { MOODS, moodEmoji } from '../src/lib/moodMeta';
import { MoodValue } from '../src/types';

export default function Journal() {
  const theme = useTheme();
  const journal = useAppStore((s) => s.journal);
  const addJournalEntry = useAppStore((s) => s.addJournalEntry);
  const deleteJournalEntry = useAppStore((s) => s.deleteJournalEntry);
  const setMood = useCreatureStore((s) => s.setMood);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [mood, setEntryMood] = useState<MoodValue | undefined>();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!title.trim() && !body.trim()) return;
    addJournalEntry({ title: title.trim() || 'Sans titre', body: body.trim(), mood });
    setTitle('');
    setBody('');
    setEntryMood(undefined);
    setAdding(false);
    setMood('empathetic');
    setTimeout(() => setMood('idle'), 1600);
  };

  return (
    <Screen>
      <ScreenHeader title="Journal" subtitle="Un espace rien qu'à toi pour poser tes pensées" emoji="📔" />

      {adding ? (
        <Animated.View entering={FadeIn}>
          <GlassCard style={{ marginBottom: spacing.md }}>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Titre"
              placeholderTextColor={theme.textTertiary}
              autoFocus
              style={{ color: theme.textPrimary, fontFamily: fonts.bodySemiBold, fontSize: 16, paddingVertical: 6 }}
            />
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder="Écris ce que tu as sur le cœur…"
              placeholderTextColor={theme.textTertiary}
              multiline
              style={{ color: theme.textPrimary, fontFamily: fonts.body, fontSize: 14, minHeight: 90, textAlignVertical: 'top', paddingVertical: 6 }}
            />
            <View style={{ flexDirection: 'row', gap: 6, marginVertical: spacing.sm }}>
              {MOODS.map((m) => (
                <PressableScale key={m.value} onPress={() => setEntryMood(m.value)}>
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: mood === m.value ? theme.accentSoft : 'transparent',
                    }}
                  >
                    <Text style={{ fontSize: 17 }}>{m.emoji}</Text>
                  </View>
                </PressableScale>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <PressableScale onPress={handleAdd}>
                <View style={{ backgroundColor: theme.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 }}>
                  <Text style={{ color: '#fff', fontFamily: fonts.bodySemiBold, fontSize: 13 }}>Enregistrer</Text>
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
                Nouvelle entrée
              </Text>
            </View>
          </GlassCard>
        </PressableScale>
      )}

      {journal.length === 0 ? (
        <Text style={{ color: theme.textSecondary, fontFamily: fonts.body, marginTop: 12 }}>
          Ton journal est vide pour l'instant.
        </Text>
      ) : (
        journal.map((entry) => {
          const expanded = expandedId === entry.id;
          return (
            <Animated.View key={entry.id} layout={Layout.springify()}>
              <PressableScale onPress={() => setExpandedId(expanded ? null : entry.id)} gaze={false}>
                <GlassCard style={{ marginBottom: spacing.sm }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    {entry.mood ? <Text style={{ fontSize: 20, marginRight: 8 }}>{moodEmoji(entry.mood)}</Text> : null}
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.textPrimary, fontFamily: fonts.bodySemiBold, fontSize: 15 }}>
                        {entry.title}
                      </Text>
                      <Text
                        numberOfLines={expanded ? undefined : 2}
                        style={{ color: theme.textSecondary, fontFamily: fonts.body, fontSize: 13, marginTop: 4, lineHeight: 19 }}
                      >
                        {entry.body}
                      </Text>
                      <Text style={{ color: theme.textTertiary, fontFamily: fonts.body, fontSize: 11, marginTop: 6 }}>
                        {new Date(entry.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </Text>
                    </View>
                    <PressableScale onPress={() => deleteJournalEntry(entry.id)} gaze={false}>
                      <Ionicons name="trash-outline" size={16} color={theme.textTertiary} />
                    </PressableScale>
                  </View>
                </GlassCard>
              </PressableScale>
            </Animated.View>
          );
        })
      )}
    </Screen>
  );
}
