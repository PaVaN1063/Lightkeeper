import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Button } from '../src/components/Button';
import { LogoMark } from '../src/components/Logo';
import { Card, IconButton, Segmented } from '../src/components/primitives';
import { Screen } from '../src/components/Screen';
import { Txt } from '../src/components/Txt';
import { useTheme } from '../src/theme/ThemeProvider';

type Device = 'iphone' | 'android' | 'computer';

function detectDevice(): Device {
  if (Platform.OS === 'ios') return 'iphone';
  if (Platform.OS === 'android') return 'android';
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iphone';
  if (/Android/i.test(ua)) return 'android';
  return 'computer';
}

/** Web install guide. iPhones only deliver web alerts to apps on the Home Screen, so this matters. */
export default function Install() {
  const { colors } = useTheme();
  const [device, setDevice] = useState<Device>(detectDevice());
  const back = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)'));

  return (
    <Screen footer={<Button kind="ghost" label="Remind me later" onPress={back} />}>
      <View style={styles.header}>
        <IconButton icon="chevron-left" label="Back" onPress={back} />
        <Txt variant="small" color="muted">Install Lightkeeper</Txt>
      </View>

      <View style={{ marginTop: 20 }}>
        <Segmented<Device>
          value={device}
          onChange={setDevice}
          options={[
            { value: 'iphone', label: 'iPhone', icon: 'smartphone' },
            { value: 'android', label: 'Android', icon: 'smartphone' },
            { value: 'computer', label: 'Computer', icon: 'monitor' },
          ]}
        />
      </View>

      {device === 'iphone' ? (
        <>
          <Txt variant="display" style={{ marginTop: 22 }}>Get alerts on your iPhone</Txt>
          <Txt color="muted" style={{ marginTop: 8 }}>iPhones only send website alerts to apps on the Home Screen. It takes 10 seconds.</Txt>
          <View style={{ gap: 10, marginTop: 20 }}>
            <Step n={1} text="Tap the Share button in Safari's bar" icon={<Feather name="share" size={20} color="#5AA9FF" />} />
            <Step n={2} text="Scroll and choose Add to Home Screen" icon={<Feather name="plus-square" size={20} color={colors.text} />} />
            <Step n={3} text="Open Lightkeeper from the new icon and allow alerts" icon={<LogoMark size={22} />} />
          </View>
          <Card tone="accent" style={[styles.warn]}>
            <Feather name="alert-circle" size={16} color={colors.accentText} style={{ marginTop: 2 }} />
            <Txt variant="small" color="textSoft" style={{ flex: 1 }}>A bookmark isn't enough. Lightkeeper must be on your Home Screen for alerts to reach you.</Txt>
          </Card>
        </>
      ) : device === 'android' ? (
        <>
          <Txt variant="display" style={{ marginTop: 22 }}>Install for reliable alerts</Txt>
          <Txt color="muted" style={{ marginTop: 8 }}>Get alerts even when Chrome is closed, with an icon on your home screen.</Txt>
          <View style={{ gap: 10, marginTop: 20 }}>
            <Option icon="download" title="Download the Android app" sub="Best alerts and share-from-Amazon. Recommended" highlight />
            <Option icon="smartphone" title="Install the web app" sub="One tap from Chrome's menu: Install app" />
          </View>
        </>
      ) : (
        <>
          <Txt variant="display" style={{ marginTop: 22 }}>Install on your computer</Txt>
          <Txt color="muted" style={{ marginTop: 8 }}>In Chrome or Edge, click the install icon at the right end of the address bar. Lightkeeper opens in its own window and alerts arrive while the browser runs.</Txt>
          <View style={{ gap: 10, marginTop: 20 }}>
            <Option icon="monitor" title="Install Lightkeeper" sub="Chrome or Edge: address bar › Install" highlight />
          </View>
        </>
      )}
    </Screen>
  );
}

function Step({ n, text, icon }: { n: number; text: string; icon: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <Card style={styles.step}>
      <View style={[styles.num, { backgroundColor: colors.accent }]}>
        <Txt variant="smallStrong" style={{ color: colors.onAccent, fontFamily: 'Figtree_700Bold' }}>{n}</Txt>
      </View>
      <Txt style={{ flex: 1 }}>{text}</Txt>
      <View style={[styles.stepIcon, { backgroundColor: colors.surface2 }]}>{icon}</View>
    </Card>
  );
}

function Option({ icon, title, sub, highlight }: { icon: React.ComponentProps<typeof Feather>['name']; title: string; sub: string; highlight?: boolean }) {
  const { colors } = useTheme();
  return (
    <Card tone={highlight ? 'accent' : 'default'} style={[styles.step, highlight && { borderColor: colors.accent }]}>
      <View style={[styles.optIcon, { backgroundColor: highlight ? colors.accent : colors.surface2 }]}>
        <Feather name={icon} size={20} color={highlight ? colors.onAccent : colors.text} />
      </View>
      <View style={{ flex: 1 }}>
        <Txt variant="bodyStrong">{title}</Txt>
        <Txt variant="small" color="muted" style={{ marginTop: 2 }}>{sub}</Txt>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 },
  num: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  stepIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  optIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  warn: { flexDirection: 'row', gap: 10, padding: 14, marginTop: 14 },
});
