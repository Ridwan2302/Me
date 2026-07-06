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

export default function Notes() {
  const theme = useTheme();
  const notes = useAppStore((s) => s.notes);
  const addNote = useAppStore((s) => s.addNote);
  const updateNote = useAppStore((s) => s.updateNote);
  const deleteNote = useAppStore((s) => s.deleteNote);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const reset = () => {
    setTitle('');
    setBody('');
    setAdding(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!title.trim() && !body.trim()) return reset();
    if (editingId) {
      updateNote(editingId, { title: title.trim() || 'Sans titre', body: body.trim() });
    } else {
      addNote(title.trim() || 'Sans titre', body.trim());
    }
    reset();
  };

  return (
    <Screen>
      <ScreenHeader title="Notes" subtitle="Tes pense-bêtes et idées rapides" emoji="🗒️" />

      {adding || editingId ? (
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
              placeholder="Écris ta note…"
              placeholderTextColor={theme.textTertiary}
              multiline
              style={{ color: theme.textPrimary, fontFamily: fonts.body, fontSize: 14, minHeight: 80, textAlignVertical: 'top', paddingVertical: 6 }}
            />
            <View style={{ flexDirection: 'row', gap: 8, marginTop: spacing.sm }}>
              <PressableScale onPress={handleSave}>
                <View style={{ backgroundColor: theme.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 }}>
                  <Text style={{ color: '#fff', fontFamily: fonts.bodySemiBold, fontSize: 13 }}>Enregistrer</Text>
                </View>
              </PressableScale>
              <PressableScale onPress={reset}>
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
              <Text style={{ color: theme.accent, fontFamily: fonts.bodySemiBold, fontSize: 14 }}>Nouvelle note</Text>
            </View>
          </GlassCard>
        </PressableScale>
      )}

      {notes.length === 0 ? (
        <Text style={{ color: theme.textSecondary, fontFamily: fonts.body, marginTop: 12 }}>
          Aucune note pour l'instant.
        </Text>
      ) : (
        notes.map((n) => (
          <Animated.View key={n.id} layout={Layout.springify()}>
            <PressableScale
              onPress={() => {
                setEditingId(n.id);
                setTitle(n.title);
                setBody(n.body);
              }}
              gaze={false}
            >
              <GlassCard style={{ marginBottom: spacing.sm }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.textPrimary, fontFamily: fonts.bodySemiBold, fontSize: 15 }}>{n.title}</Text>
                    <Text numberOfLines={2} style={{ color: theme.textSecondary, fontFamily: fonts.body, fontSize: 13, marginTop: 3 }}>
                      {n.body}
                    </Text>
                  </View>
                  <PressableScale onPress={() => deleteNote(n.id)} gaze={false}>
                    <Ionicons name="trash-outline" size={16} color={theme.textTertiary} />
                  </PressableScale>
                </View>
              </GlassCard>
            </PressableScale>
          </Animated.View>
        ))
      )}
    </Screen>
  );
}
