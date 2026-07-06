import React, { useMemo, useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';
import { Screen } from '../src/components/ui/Screen';
import { ScreenHeader } from '../src/components/ui/ScreenHeader';
import { GlassCard } from '../src/components/ui/GlassCard';
import { PressableScale } from '../src/components/ui/PressableScale';
import { useTheme } from '../src/theme/ThemeContext';
import { fonts, radii, spacing } from '../src/theme/tokens';
import { useAppStore } from '../src/store/appStore';
import { MemoryCategory, MemoryItem } from '../src/types';

const CATEGORY_LABEL: Record<MemoryCategory, string> = {
  personality: 'Personnalité',
  preference: 'Préférences',
  emotion: 'Émotions',
  goal: 'Objectifs',
  habit: 'Habitudes',
  person: 'Personnes',
  event: 'Évènements',
  other: 'Autre',
};

const CATEGORY_ORDER: MemoryCategory[] = [
  'person',
  'preference',
  'emotion',
  'goal',
  'habit',
  'personality',
  'event',
  'other',
];

function MemoryCard({ item }: { item: MemoryItem }) {
  const theme = useTheme();
  const updateMemory = useAppStore((s) => s.updateMemory);
  const deleteMemory = useAppStore((s) => s.deleteMemory);
  const togglePinMemory = useAppStore((s) => s.togglePinMemory);
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(item.label);
  const [detail, setDetail] = useState(item.detail);

  const confirmDelete = () => {
    Alert.alert('Oublier ce souvenir ?', 'Me ne s\'en souviendra plus.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Oublier', style: 'destructive', onPress: () => deleteMemory(item.id) },
    ]);
  };

  return (
    <Animated.View layout={Layout.springify()} entering={FadeIn}>
      <GlassCard style={{ marginBottom: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.eyebrow, { color: theme.accent }]}>
              {CATEGORY_LABEL[item.category]}
            </Text>
            {editing ? (
              <TextInput
                value={label}
                onChangeText={setLabel}
                style={[styles.editInput, { color: theme.textPrimary, borderColor: theme.border }]}
              />
            ) : (
              <Text style={[styles.title, { color: theme.textPrimary }]}>{item.label}</Text>
            )}
          </View>
          <PressableScale onPress={() => togglePinMemory(item.id)} gaze={false} style={{ padding: 4 }}>
            <Ionicons
              name={item.pinned ? 'star' : 'star-outline'}
              size={18}
              color={item.pinned ? theme.warning : theme.textTertiary}
            />
          </PressableScale>
        </View>

        {editing ? (
          <TextInput
            value={detail}
            onChangeText={setDetail}
            multiline
            style={[styles.editInput, { color: theme.textSecondary, borderColor: theme.border, marginTop: 6 }]}
          />
        ) : (
          <Text style={[styles.detail, { color: theme.textSecondary }]}>{item.detail}</Text>
        )}

        <View style={{ flexDirection: 'row', marginTop: spacing.sm, gap: 10 }}>
          {editing ? (
            <>
              <PressableScale
                onPress={() => {
                  updateMemory(item.id, { label, detail });
                  setEditing(false);
                }}
              >
                <View style={[styles.pillBtn, { backgroundColor: theme.accent }]}>
                  <Text style={[styles.pillBtnText, { color: '#fff' }]}>Enregistrer</Text>
                </View>
              </PressableScale>
              <PressableScale onPress={() => setEditing(false)}>
                <View style={[styles.pillBtn, { backgroundColor: theme.surfaceStrong }]}>
                  <Text style={[styles.pillBtnText, { color: theme.textPrimary }]}>Annuler</Text>
                </View>
              </PressableScale>
            </>
          ) : (
            <>
              <PressableScale onPress={() => setEditing(true)}>
                <View style={[styles.pillBtn, { backgroundColor: theme.surfaceStrong }]}>
                  <Ionicons name="pencil-outline" size={13} color={theme.textPrimary} />
                  <Text style={[styles.pillBtnText, { color: theme.textPrimary }]}>Modifier</Text>
                </View>
              </PressableScale>
              <PressableScale onPress={confirmDelete}>
                <View style={[styles.pillBtn, { backgroundColor: 'rgba(255,80,80,0.12)' }]}>
                  <Ionicons name="trash-outline" size={13} color={theme.danger} />
                  <Text style={[styles.pillBtnText, { color: theme.danger }]}>Oublier</Text>
                </View>
              </PressableScale>
            </>
          )}
        </View>
      </GlassCard>
    </Animated.View>
  );
}

export default function MemoryCenter() {
  const theme = useTheme();
  const memories = useAppStore((s) => s.memories);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<MemoryCategory | 'all'>('all');

  const filtered = useMemo(() => {
    return memories
      .filter((m) => (filter === 'all' ? true : m.category === filter))
      .filter((m) =>
        query.trim()
          ? `${m.label} ${m.detail}`.toLowerCase().includes(query.toLowerCase())
          : true
      )
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt);
  }, [memories, query, filter]);

  const present = CATEGORY_ORDER.filter((c) => memories.some((m) => m.category === c));

  return (
    <Screen>
      <ScreenHeader
        title="Centre de mémoire"
        subtitle="Tout ce que Me retient — visible et modifiable à tout moment"
        emoji="🧠"
      />

      <GlassCard padding={spacing.xs} radius={radii.pill} style={{ marginBottom: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 }}>
          <Ionicons name="search" size={16} color={theme.textTertiary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher un souvenir…"
            placeholderTextColor={theme.textTertiary}
            style={{ flex: 1, marginLeft: 8, paddingVertical: 8, color: theme.textPrimary, fontFamily: fonts.body }}
          />
        </View>
      </GlassCard>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md }}>
        <PressableScale onPress={() => setFilter('all')}>
          <View
            style={[
              styles.chip,
              { backgroundColor: filter === 'all' ? theme.accent : theme.surfaceStrong },
            ]}
          >
            <Text style={{ color: filter === 'all' ? '#fff' : theme.textPrimary, fontFamily: fonts.bodyMedium, fontSize: 12 }}>
              Tout
            </Text>
          </View>
        </PressableScale>
        {present.map((c) => (
          <PressableScale key={c} onPress={() => setFilter(c)}>
            <View
              style={[
                styles.chip,
                { backgroundColor: filter === c ? theme.accent : theme.surfaceStrong },
              ]}
            >
              <Text style={{ color: filter === c ? '#fff' : theme.textPrimary, fontFamily: fonts.bodyMedium, fontSize: 12 }}>
                {CATEGORY_LABEL[c]}
              </Text>
            </View>
          </PressableScale>
        ))}
      </View>

      {filtered.length === 0 ? (
        <Text style={{ color: theme.textSecondary, fontFamily: fonts.body, textAlign: 'center', marginTop: 40 }}>
          Rien ici pour l'instant. Discute avec Me pour créer des souvenirs.
        </Text>
      ) : (
        filtered.map((m) => <MemoryCard key={m.id} item={m} />)
      )}
    </Screen>
  );
}

const styles = {
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 10, textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: 2 },
  title: { fontFamily: fonts.bodySemiBold, fontSize: 15 },
  detail: { fontFamily: fonts.body, fontSize: 13, marginTop: 4, lineHeight: 18 },
  editInput: { fontFamily: fonts.body, fontSize: 13, borderWidth: 1, borderRadius: 10, padding: 8 },
  pillBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  pillBtnText: { fontFamily: fonts.bodyMedium, fontSize: 12 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 },
};
