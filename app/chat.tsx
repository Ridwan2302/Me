import React, { useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../src/components/ui/Screen';
import { GlassCard } from '../src/components/ui/GlassCard';
import { PressableScale } from '../src/components/ui/PressableScale';
import { Creature } from '../src/components/creature/Creature';
import { useTheme } from '../src/theme/ThemeContext';
import { fonts, radii, spacing } from '../src/theme/tokens';
import { useAppStore } from '../src/store/appStore';
import { useCreatureStore } from '../src/store/creatureStore';
import { analyzeMessage, generateReply } from '../src/lib/aiEngine';
import { ChatMessage } from '../src/types';
import { useRouter } from 'expo-router';

export default function Chat() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const messages = useAppStore((s) => s.messages);
  const addMessage = useAppStore((s) => s.addMessage);
  const addMemory = useAppStore((s) => s.addMemory);
  const memories = useAppStore((s) => s.memories);
  const mood = useCreatureStore((s) => s.mood);
  const setMood = useCreatureStore((s) => s.setMood);
  const bounce = useCreatureStore((s) => s.bounce);
  const bounceToken = useCreatureStore((s) => s.bounceToken);
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    addMessage({ role: 'user', text });
    setMood('thinking');

    const analysis = analyzeMessage(text);
    analysis.memories.forEach((m) => addMemory({ ...m, source: 'chat' }));

    const lowerWords = text.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
    const related = memories.filter((m) =>
      lowerWords.some((w) => m.detail.toLowerCase().includes(w))
    );

    setTimeout(() => {
      const replyText = generateReply(analysis, related);
      addMessage({ role: 'me', text: replyText, mood: analysis.mood });
      setMood(analysis.mood);
      if (analysis.mood === 'celebrating' || analysis.mood === 'happy') bounce();
      setTimeout(() => setMood('idle'), 2200);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }, 850 + Math.random() * 500);

    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen scroll={false}>
        <View style={{ flex: 1, paddingTop: insets.top - 4 }}>
          <View style={styles.header}>
            <PressableScale onPress={() => router.back()} gaze={false} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={20} color={theme.textPrimary} />
            </PressableScale>
            <Creature mood={mood} size={40} bounceToken={bounceToken} />
            <View style={{ marginLeft: spacing.sm }}>
              <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Me</Text>
              <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                {mood === 'thinking' ? 'réfléchit…' : 'toujours là pour toi'}
              </Text>
            </View>
          </View>

          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12, paddingTop: 8, gap: 10 }}
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInUp.duration(320)} style={{ alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '82%' }}>
                {item.role === 'me' ? (
                  <LinearGradient
                    colors={theme.name === 'dark' ? ['#3A2E63', '#2A2050'] : ['#EFE6FF', '#F7EEFB']}
                    style={styles.bubbleMe}
                  >
                    <Text style={[styles.bubbleText, { color: theme.textPrimary }]}>{item.text}</Text>
                  </LinearGradient>
                ) : (
                  <View style={[styles.bubbleUser, { backgroundColor: theme.accent }]}>
                    <Text style={[styles.bubbleText, { color: '#fff' }]}>{item.text}</Text>
                  </View>
                )}
              </Animated.View>
            )}
          />

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={[styles.inputRow, { paddingBottom: insets.bottom + 12 }]}>
              <GlassCard padding={4} radius={radii.pill} style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextInput
                    value={input}
                    onChangeText={(t) => {
                      setInput(t);
                      if (t.length > 0 && mood !== 'listening') setMood('listening');
                      if (t.length === 0 && mood === 'listening') setMood('idle');
                    }}
                    placeholder="Écris quelque chose à Me…"
                    placeholderTextColor={theme.textTertiary}
                    style={[styles.input, { color: theme.textPrimary }]}
                    multiline
                    onSubmitEditing={handleSend}
                  />
                  <Pressable
                    onPress={handleSend}
                    style={[styles.sendBtn, { backgroundColor: theme.accent }]}
                    accessibilityLabel="Envoyer"
                  >
                    <Ionicons name="arrow-up" size={18} color="#fff" />
                  </Pressable>
                </View>
              </GlassCard>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  headerTitle: { fontFamily: fonts.displayMedium, fontSize: 17 },
  headerSubtitle: { fontFamily: fonts.body, fontSize: 12 },
  bubbleMe: {
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    borderRadius: 20,
    borderBottomRightRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleText: { fontFamily: fonts.body, fontSize: 14.5, lineHeight: 20 },
  inputRow: { paddingHorizontal: 20, paddingTop: 6 },
  input: { flex: 1, fontFamily: fonts.body, fontSize: 14.5, maxHeight: 100, paddingHorizontal: 12, paddingVertical: 8 },
  sendBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginRight: 2 },
});
