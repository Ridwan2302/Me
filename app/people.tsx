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

const EMOJIS = ['💗', '👨‍👩‍👧', '🧑‍🤝‍🧑', '💫', '🐾', '👶', '🎓', '💼'];

export default function People() {
  const theme = useTheme();
  const people = useAppStore((s) => s.people);
  const addPerson = useAppStore((s) => s.addPerson);
  const deletePerson = useAppStore((s) => s.deletePerson);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [notes, setNotes] = useState('');
  const [emoji, setEmoji] = useState(EMOJIS[0]);

  const handleAdd = () => {
    if (!name.trim()) return;
    addPerson({ name: name.trim(), relationship: relationship.trim() || 'Important·e', notes: notes.trim() || undefined, emoji });
    setName('');
    setRelationship('');
    setNotes('');
    setAdding(false);
  };

  return (
    <Screen>
      <ScreenHeader title="Personnes importantes" subtitle="Les gens qui comptent dans ta vie" emoji="💞" />

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
              value={name}
              onChangeText={setName}
              placeholder="Prénom"
              placeholderTextColor={theme.textTertiary}
              autoFocus
              style={{ color: theme.textPrimary, fontFamily: fonts.bodySemiBold, fontSize: 15, paddingVertical: 6 }}
            />
            <TextInput
              value={relationship}
              onChangeText={setRelationship}
              placeholder="Relation (ex : ma sœur, mon meilleur ami…)"
              placeholderTextColor={theme.textTertiary}
              style={{ color: theme.textPrimary, fontFamily: fonts.body, fontSize: 13, paddingVertical: 6 }}
            />
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Ce qu'il faut savoir (optionnel)"
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
              <Ionicons name="person-add-outline" size={20} color={theme.accent} />
              <Text style={{ color: theme.accent, fontFamily: fonts.bodySemiBold, fontSize: 14 }}>
                Ajouter une personne
              </Text>
            </View>
          </GlassCard>
        </PressableScale>
      )}

      {people.length === 0 ? (
        <Text style={{ color: theme.textSecondary, fontFamily: fonts.body, marginTop: 12 }}>
          Personne d'ajouté pour l'instant.
        </Text>
      ) : (
        people.map((p) => (
          <Animated.View key={p.id} layout={Layout.springify()}>
            <GlassCard style={{ marginBottom: spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 26, marginRight: 10 }}>{p.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.textPrimary, fontFamily: fonts.bodySemiBold, fontSize: 15 }}>{p.name}</Text>
                  <Text style={{ color: theme.accent, fontFamily: fonts.bodyMedium, fontSize: 12 }}>{p.relationship}</Text>
                  {p.notes ? (
                    <Text style={{ color: theme.textSecondary, fontFamily: fonts.body, fontSize: 13, marginTop: 3 }}>
                      {p.notes}
                    </Text>
                  ) : null}
                </View>
                <PressableScale onPress={() => deletePerson(p.id)} gaze={false}>
                  <Ionicons name="trash-outline" size={16} color={theme.textTertiary} />
                </PressableScale>
              </View>
            </GlassCard>
          </Animated.View>
        ))
      )}
    </Screen>
  );
}
