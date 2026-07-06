import React, { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Screen } from '../src/components/ui/Screen';
import { GlassCard } from '../src/components/ui/GlassCard';
import { PressableScale } from '../src/components/ui/PressableScale';
import { IconTile } from '../src/components/ui/IconTile';
import { Creature } from '../src/components/creature/Creature';
import { useCreatureStore } from '../src/store/creatureStore';
import { useAppStore } from '../src/store/appStore';
import { useTheme } from '../src/theme/ThemeContext';
import { fonts, spacing } from '../src/theme/tokens';
import { MoodValue } from '../src/types';
import { MOODS } from '../src/lib/moodMeta';
import { InstallPrompt } from '../src/components/pwa/InstallPrompt';

const SECTIONS: { href: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { href: '/journal', label: 'Journal', icon: 'book-outline' },
  { href: '/memories', label: 'Souvenirs', icon: 'sparkles-outline' },
  { href: '/mood', label: 'Humeur', icon: 'happy-outline' },
  { href: '/goals', label: 'Objectifs', icon: 'flag-outline' },
  { href: '/habits', label: 'Habitudes', icon: 'repeat-outline' },
  { href: '/timeline', label: 'Chronologie', icon: 'time-outline' },
  { href: '/photos', label: 'Photos', icon: 'image-outline' },
  { href: '/notes', label: 'Notes', icon: 'document-text-outline' },
  { href: '/people', label: 'Personnes', icon: 'people-outline' },
  { href: '/memory-center', label: 'Mémoire IA', icon: 'hardware-chip-outline' },
];

function useGreeting() {
  return useMemo(() => {
    const h = new Date().getHours();
    if (h < 5) return 'Encore réveillé·e ?';
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bel après-midi';
    return 'Bonsoir';
  }, []);
}

export default function Home() {
  const theme = useTheme();
  const router = useRouter();
  const greeting = useGreeting();
  const mood = useCreatureStore((s) => s.mood);
  const setMood = useCreatureStore((s) => s.setMood);
  const bounce = useCreatureStore((s) => s.bounce);
  const bounceToken = useCreatureStore((s) => s.bounceToken);
  const gaze = useCreatureStore((s) => s.gaze);
  const messages = useAppStore((s) => s.messages);
  const addMoodLog = useAppStore((s) => s.addMoodLog);
  const memories = useAppStore((s) => s.memories);
  const [pickedMood, setPickedMood] = useState<MoodValue | null>(null);

  useEffect(() => {
    setMood('happy');
    bounce();
    const t = setTimeout(() => setMood('idle'), 1600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lastMessage = messages[messages.length - 1];
  const highlightMemory = memories.find((m) => m.pinned) ?? memories[0];

  const handleMoodPick = (v: MoodValue) => {
    setPickedMood(v);
    addMoodLog(v);
    setMood(v >= 4 ? 'celebrating' : v === 3 ? 'happy' : 'empathetic');
    bounce();
    setTimeout(() => setMood('idle'), 1800);
  };

  return (
    <Screen>
      <Animated.View entering={FadeInDown.duration(500)}>
        <Text style={[styles.greeting, { color: theme.textSecondary }]}>{greeting}</Text>
        <Text style={[styles.slogan, { color: theme.textPrimary }]}>
          Me — l'IA qui grandit avec toi.
        </Text>
      </Animated.View>

      <InstallPrompt />

      <PressableScale onPress={() => router.push('/chat')} gaze={false} style={{ alignSelf: 'center' }}>
        <Creature mood={mood} gaze={gaze ?? undefined} size={128} autoSleep bounceToken={bounceToken} />
      </PressableScale>

      <Animated.View entering={FadeInDown.delay(100).duration(500)}>
        <PressableScale onPress={() => router.push('/chat')}>
          <GlassCard style={{ marginTop: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Parler à Me</Text>
                <Text numberOfLines={2} style={[styles.cardBody, { color: theme.textSecondary }]}>
                  {lastMessage ? lastMessage.text : 'Dis-moi comment tu te sens aujourd’hui.'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </View>
          </GlassCard>
        </PressableScale>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(160).duration(500)}>
        <GlassCard style={{ marginTop: spacing.md }}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary, marginBottom: spacing.sm }]}>
            Comment te sens-tu ?
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {MOODS.map((m) => (
              <PressableScale key={m.value} onPress={() => handleMoodPick(m.value)}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor:
                      pickedMood === m.value ? theme.accentSoft : 'transparent',
                  }}
                >
                  <Text style={{ fontSize: 24 }}>{m.emoji}</Text>
                </View>
              </PressableScale>
            ))}
          </View>
        </GlassCard>
      </Animated.View>

      {highlightMemory ? (
        <Animated.View entering={FadeInDown.delay(220).duration(500)}>
          <PressableScale onPress={() => router.push('/memory-center')}>
            <GlassCard style={{ marginTop: spacing.md }}>
              <Text style={[styles.eyebrow, { color: theme.accent }]}>Ce dont je me souviens</Text>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{highlightMemory.label}</Text>
              <Text numberOfLines={2} style={[styles.cardBody, { color: theme.textSecondary }]}>
                {highlightMemory.detail}
              </Text>
            </GlassCard>
          </PressableScale>
        </Animated.View>
      ) : null}

      <Animated.View entering={FadeInDown.delay(280).duration(500)}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Explorer</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 }}>
          {SECTIONS.map((s) => (
            <IconTile
              key={s.href}
              href={s.href}
              label={s.label}
              icon={s.icon}
              accentFrom={theme.accentSoft}
              accentTo={theme.accent}
            />
          ))}
        </View>
      </Animated.View>
    </Screen>
  );
}

const styles = {
  greeting: { fontFamily: fonts.body, fontSize: 15, marginTop: 4 },
  slogan: { fontFamily: fonts.display, fontSize: 26, marginBottom: spacing.md },
  cardTitle: { fontFamily: fonts.bodySemiBold, fontSize: 16 },
  cardBody: { fontFamily: fonts.body, fontSize: 13, marginTop: 2 },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  sectionTitle: { fontFamily: fonts.displayMedium, fontSize: 18, marginTop: spacing.lg, marginBottom: spacing.sm },
};
