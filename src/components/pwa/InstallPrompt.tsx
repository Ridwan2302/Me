import React, { useEffect, useState } from 'react';
import { Image, Platform, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { GlassCard } from '../ui/GlassCard';
import { PressableScale } from '../ui/PressableScale';
import { useTheme } from '../../theme/ThemeContext';
import { fonts, spacing } from '../../theme/tokens';

const DISMISS_KEY = 'me:install-prompt-dismissed';

function isStandalone() {
  if (typeof window === 'undefined') return false;
  const mql = window.matchMedia?.('(display-mode: standalone)').matches;
  const iosStandalone = (window.navigator as any).standalone === true;
  return Boolean(mql || iosStandalone);
}

function isIOS() {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream;
}

export function InstallPrompt() {
  const theme = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [dismissed, setDismissed] = useState(true);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (isStandalone()) return;
    const alreadyDismissed = window.localStorage?.getItem(DISMISS_KEY) === '1';
    if (alreadyDismissed) return;

    setDismissed(false);
    if (isIOS()) setShowIosHint(true);

    const onBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const onInstalled = () => {
      window.localStorage?.setItem(DISMISS_KEY, '1');
      setDismissed(true);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (Platform.OS !== 'web' || dismissed) return null;
  if (!deferredPrompt && !showIosHint) return null;

  const dismiss = () => {
    window.localStorage?.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    dismiss();
  };

  return (
    <Animated.View entering={FadeInDown.duration(400)} exiting={FadeOutUp.duration(250)}>
      <GlassCard style={{ marginBottom: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={{ uri: '/icons/icon-192.png' }}
            style={{ width: 40, height: 40, borderRadius: 12, marginRight: 12 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.textPrimary, fontFamily: fonts.bodySemiBold, fontSize: 14 }}>
              Installe Me sur ton écran d'accueil
            </Text>
            <Text style={{ color: theme.textSecondary, fontFamily: fonts.body, fontSize: 12, marginTop: 2 }}>
              {showIosHint && !deferredPrompt
                ? "Appuie sur Partager, puis \"Sur l'écran d'accueil\""
                : 'Ouvre Me en un instant, comme une vraie application.'}
            </Text>
          </View>
          {deferredPrompt ? (
            <PressableScale onPress={handleInstall} gaze={false}>
              <View style={{ backgroundColor: theme.accent, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999 }}>
                <Text style={{ color: '#fff', fontFamily: fonts.bodySemiBold, fontSize: 13 }}>Installer</Text>
              </View>
            </PressableScale>
          ) : null}
          <PressableScale onPress={dismiss} gaze={false} style={{ marginLeft: 8 }}>
            <Ionicons name="close" size={18} color={theme.textTertiary} />
          </PressableScale>
        </View>
      </GlassCard>
    </Animated.View>
  );
}
