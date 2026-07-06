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

const EMOJIS = ['✨', '🎉', '🌅', '🏔️', '🎂', '💌', '🌊', '🎶'];

export default function Memories() {
  const theme = useTheme();
  const souvenirs = useAppStore((s) => s.souvenirs);
  const addSouvenir = useAppStore((s) => s.addSouvenir);
  const deleteSouvenir = useAppStore((s) => s.deleteSouvenir);
  const setMood = useCreatureStore((s) => s.setMood);
  const bounce = useCreatureStore((s) => s.bounce);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [emoji, setEmoji] = useState(EMOJIS[0]);

  const handleAdd = () => {
    if (!title.trim()) return;
    addSouvenir({ title: title.trim(), detail: detail.trim(), emoji });
    setTitle('');
    setDetail('');
    setAdding(false);
    setMood('celebrating');
    bounce();
    setTimeout(() => setMood('idle'), 2000);
  };

  return (
    <Screen>
      <ScreenHeader title="Souvenirs" subtitle="Les moments précieux que tu veux garder" emoji="✨" />

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
              placeholder="Ce moment, c'était…"
              placeholderTextColor={theme.textTertiary}
              autoFocus
              style={{ color: theme.textPrimary, fontFamily: fonts.bodySemiBold, fontSize: 15, paddingVertical: 6 }}
            />
            <TextInput
              value={detail}
              onChangeText={setDetail}
              placeholder="Pourquoi ça compte pour toi (optionnel)"
              placeholderTextColor={theme.textTertiary}
              multiline
              style={{ color: theme.textPrimary, fontFamily: fonts.body, fontSize: 13, paddingVertical: 6 }}
            />
            <View style={{ flexDirection: 'row', gap: 8, marginTop: spacing.sm }}>
              <PressableScale onPress={handleAdd}>
                <View style={{ backgroundColor: theme.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 }}>
                  <Text style={{ color: '#fff', fontFamily: fonts.bodySemiBold, fontSize: 13 }}>Garder ce souvenir</Text>
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
                Nouveau souvenir
              </Text>
            </View>
          </GlassCard>
        </PressableScale>
      )}

      {souvenirs.length === 0 ? (
        <Text style={{ color: theme.textSecondary, fontFamily: fonts.body, marginTop: 12 }}>
          Aucun souvenir gardé pour l'instant.
        </Text>
      ) : (
        souvenirs.map((s) => (
          <Animated.View key={s.id} layout={Layout.springify()}>
            <GlassCard style={{ marginBottom: spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 24, marginRight: 10 }}>{s.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.textPrimary, fontFamily: fonts.bodySemiBold, fontSize: 15 }}>{s.title}</Text>
                  {s.detail ? (
                    <Text style={{ color: theme.textSecondary, fontFamily: fonts.body, fontSize: 13, marginTop: 3 }}>
                      {s.detail}
                    </Text>
                  ) : null}
                  <Text style={{ color: theme.textTertiary, fontFamily: fonts.body, fontSize: 11, marginTop: 6 }}>
                    {new Date(s.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </Text>
                </View>
                <PressableScale onPress={() => deleteSouvenir(s.id)} gaze={false}>
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
