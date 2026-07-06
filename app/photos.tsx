import React, { useState } from 'react';
import { Image, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';
import { Screen } from '../src/components/ui/Screen';
import { ScreenHeader } from '../src/components/ui/ScreenHeader';
import { GlassCard } from '../src/components/ui/GlassCard';
import { PressableScale } from '../src/components/ui/PressableScale';
import { useTheme } from '../src/theme/ThemeContext';
import { fonts, radii, spacing } from '../src/theme/tokens';
import { useAppStore } from '../src/store/appStore';
import { useCreatureStore } from '../src/store/creatureStore';

export default function Photos() {
  const theme = useTheme();
  const photos = useAppStore((s) => s.photos);
  const addPhoto = useAppStore((s) => s.addPhoto);
  const updatePhoto = useAppStore((s) => s.updatePhoto);
  const deletePhoto = useAppStore((s) => s.deletePhoto);
  const setMood = useCreatureStore((s) => s.setMood);
  const bounce = useCreatureStore((s) => s.bounce);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [caption, setCaption] = useState('');

  const handlePick = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: true,
    });
    if (result.canceled) return;
    result.assets.forEach((a) => addPhoto(a.uri));
    setMood('happy');
    bounce();
    setTimeout(() => setMood('idle'), 1600);
  };

  return (
    <Screen>
      <ScreenHeader title="Photos" subtitle="Les images qui racontent ton histoire" emoji="🖼️" />

      <PressableScale onPress={handlePick}>
        <GlassCard style={{ marginBottom: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="images-outline" size={20} color={theme.accent} />
            <Text style={{ color: theme.accent, fontFamily: fonts.bodySemiBold, fontSize: 14 }}>
              Ajouter des photos
            </Text>
          </View>
        </GlassCard>
      </PressableScale>

      {photos.length === 0 ? (
        <Text style={{ color: theme.textSecondary, fontFamily: fonts.body, marginTop: 12 }}>
          Aucune photo pour l'instant.
        </Text>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 }}>
          {photos.map((p) => (
            <Animated.View key={p.id} layout={Layout.springify()} entering={FadeIn} style={{ width: '48%' }}>
              <GlassCard padding={6} radius={radii.md}>
                <Image
                  source={{ uri: p.uri }}
                  style={{ width: '100%', aspectRatio: 1, borderRadius: 14 }}
                  resizeMode="cover"
                />
                {editingId === p.id ? (
                  <TextInput
                    value={caption}
                    onChangeText={setCaption}
                    placeholder="Légende…"
                    placeholderTextColor={theme.textTertiary}
                    autoFocus
                    onBlur={() => {
                      updatePhoto(p.id, { caption: caption.trim() || undefined });
                      setEditingId(null);
                    }}
                    style={{ color: theme.textPrimary, fontFamily: fonts.body, fontSize: 12, marginTop: 6 }}
                  />
                ) : (
                  <PressableScale
                    onPress={() => {
                      setEditingId(p.id);
                      setCaption(p.caption ?? '');
                    }}
                    gaze={false}
                  >
                    <Text
                      numberOfLines={1}
                      style={{ color: p.caption ? theme.textSecondary : theme.textTertiary, fontFamily: fonts.body, fontSize: 12, marginTop: 6 }}
                    >
                      {p.caption ?? 'Ajouter une légende…'}
                    </Text>
                  </PressableScale>
                )}
                <PressableScale onPress={() => deletePhoto(p.id)} gaze={false} style={{ marginTop: 4, alignSelf: 'flex-end' }}>
                  <Ionicons name="trash-outline" size={14} color={theme.textTertiary} />
                </PressableScale>
              </GlassCard>
            </Animated.View>
          ))}
        </View>
      )}
    </Screen>
  );
}
