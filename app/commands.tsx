import React from 'react';
import { Text, View } from 'react-native';
import { Screen } from '../src/components/ui/Screen';
import { ScreenHeader } from '../src/components/ui/ScreenHeader';
import { GlassCard } from '../src/components/ui/GlassCard';
import { useTheme } from '../src/theme/ThemeContext';
import { fonts, spacing } from '../src/theme/tokens';

const COMMANDS: { emoji: string; title: string; description: string }[] = [
  {
    emoji: '👆',
    title: 'Toucher Me',
    description: "Une tape sur Me ouvre la conversation, comme si tu lui tapais sur l'épaule.",
  },
  {
    emoji: '🫂',
    title: 'Appui long',
    description: 'Garde ton doigt appuyé sur Me pour lui faire un gros câlin.',
  },
  {
    emoji: '🤗',
    title: 'Caresser',
    description: 'Le bouton Caresser lui fait de petites caresses affectueuses.',
  },
  {
    emoji: '🍪',
    title: 'Nourrir',
    description: 'Le bouton Nourrir lui donne un petit cookie — il adore ça.',
  },
  {
    emoji: '🪶',
    title: 'Chatouiller',
    description: 'Le bouton Chatouiller le fait rire aux éclats.',
  },
  {
    emoji: '🌙',
    title: 'Border',
    description: "Le bouton Border l'endort tout doucement pour une petite sieste.",
  },
];

export default function Commands() {
  const theme = useTheme();

  return (
    <Screen>
      <ScreenHeader
        title="Commandes"
        subtitle="Comment jouer avec ta peluche digitale"
        emoji="🧸"
      />

      {COMMANDS.map((c) => (
        <GlassCard key={c.title} style={{ marginBottom: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.accentSoft,
                marginRight: spacing.sm,
              }}
            >
              <Text style={{ fontSize: 20 }}>{c.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: theme.textPrimary }]}>{c.title}</Text>
              <Text style={[styles.description, { color: theme.textSecondary }]}>{c.description}</Text>
            </View>
          </View>
        </GlassCard>
      ))}
    </Screen>
  );
}

const styles = {
  title: { fontFamily: fonts.bodySemiBold, fontSize: 15 },
  description: { fontFamily: fonts.body, fontSize: 13, marginTop: 2 },
};
