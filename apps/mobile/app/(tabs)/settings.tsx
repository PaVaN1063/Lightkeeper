import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { Card, SectionLabel, Segmented } from '../../src/components/primitives';
import { Txt } from '../../src/components/Txt';
import { MOCK_USER } from '../../src/data/mock';
import { isWeb, useLayout } from '../../src/hooks/useLayout';
import { useApp } from '../../src/store/AppStore';
import { ThemeMode, useTheme } from '../../src/theme/ThemeProvider';

export default function Settings() {
  const { colors, mode, setMode } = useTheme();
  const { isWide } = useLayout();
  const { session, activeCount, limits, signOut } = useApp();
  const guest = session === 'guest';
  const [alerts, setAlerts] = useState({ push: true, quiet: true, broken: true });

  const toggles: { key: keyof typeof alerts; label: string; sub: string }[] = [
    { key: 'push', label: isWeb ? 'Browser alerts' : 'Push alerts', sub: isWeb ? 'Notifications in this browser when a watch meets its goal' : 'When a watch meets its goal' },
    { key: 'quiet', label: 'Quiet hours', sub: '11 PM to 7 AM' },
    { key: 'broken', label: 'Tell me if a page breaks', sub: 'When a site fails several checks in a row' },
  ];

  return (
    <SafeAreaView edges={isWide ? [] : ['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={[styles.content, isWide && { padding: 32 }]}>
        <Txt variant="title">Settings</Txt>

        {guest ? (
          <Card tone="accent">
            <Txt variant="bodyStrong">You're using Lightkeeper as a guest</Txt>
            <Txt variant="small" color="textSoft" style={{ marginTop: 4 }}>Save your account to keep your watch and add more.</Txt>
            <Button label="Save my account" size="sm" style={{ marginTop: 12 }} onPress={() => router.push('/save-account')} />
          </Card>
        ) : (
          <Card style={styles.profile}>
            <View style={[styles.avatar, { backgroundColor: colors.surface2 }]}>
              <Txt variant="bodyStrong">{MOCK_USER.initials}</Txt>
            </View>
            <View style={{ flex: 1 }}>
              <Txt variant="bodyStrong" style={{ fontSize: 16 }}>{MOCK_USER.name}</Txt>
              <Txt variant="small" color="muted">{MOCK_USER.email} · Google</Txt>
            </View>
          </Card>
        )}

        <Card tone="accent">
          <View style={styles.between}>
            <Txt variant="bodyStrong">{guest ? 'Guest' : 'Free plan'}</Txt>
            <Txt variant="small" color="textSoft">{activeCount} of {limits.watches} active {limits.watches === 1 ? 'watch' : 'watches'}</Txt>
          </View>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
            {Array.from({ length: limits.watches }).map((_, i) => (
              <View key={i} style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: i < activeCount ? colors.accent : colors.lineStrong }} />
            ))}
          </View>
          <View style={[styles.between, { marginTop: 12, gap: 12 }]}>
            <Txt variant="small" color="textSoft" style={{ flex: 1 }}>Pro: 25 watches, 10 sites each, checks every 5–10 min, Telugu and Hindi</Txt>
            <Button label="Coming soon" size="sm" onPress={() => router.push('/pro')} />
          </View>
        </Card>

        <SectionLabel>Appearance</SectionLabel>
        <Segmented<ThemeMode>
          value={mode}
          onChange={setMode}
          options={[
            { value: 'system', label: 'System', icon: 'smartphone' },
            { value: 'light', label: 'Light', icon: 'sun' },
            { value: 'dark', label: 'Dark', icon: 'moon' },
          ]}
        />
        <Txt variant="caption" color="muted" style={{ marginTop: -6 }}>
          {mode === 'system' ? 'Follows your phone or computer setting.' : `Always ${mode}.`}
        </Txt>

        <SectionLabel>Alerts</SectionLabel>
        <Card style={{ paddingVertical: 0 }}>
          {toggles.map((t, i) => (
            <View key={t.key} style={[styles.row, i < toggles.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.line }]}>
              <View style={{ flex: 1 }}>
                <Txt variant="bodyStrong">{t.label}</Txt>
                <Txt variant="small" color="muted" style={{ marginTop: 2 }}>{t.sub}</Txt>
              </View>
              <Switch
                accessibilityLabel={t.label}
                value={alerts[t.key]}
                onValueChange={(v) => setAlerts((a) => ({ ...a, [t.key]: v }))}
                trackColor={{ false: colors.lineStrong, true: colors.teal }}
                thumbColor="#FFFFFF"
              />
            </View>
          ))}
        </Card>

        <SectionLabel>Account</SectionLabel>
        <Card style={{ paddingVertical: 0 }}>
          {isWeb ? <LinkRow label="Install Lightkeeper on this device" onPress={() => router.push('/install')} /> : null}
          <LinkRow label="Privacy policy" />
          <LinkRow label="Help and feedback" />
          <LinkRow
            label="Sign out"
            onPress={() => {
              signOut();
              router.replace('/welcome');
            }}
          />
          <LinkRow label="Delete account and data" danger last />
        </Card>

        <Txt variant="caption" color="muted" align="center">Lightkeeper 0.1.0 · Keeping watch, so you don't have to.</Txt>
      </ScrollView>
    </SafeAreaView>
  );
}

function LinkRow({ label, onPress, danger, last }: { label: string; onPress?: () => void; danger?: boolean; last?: boolean }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.link, !last && { borderBottomWidth: 1, borderBottomColor: colors.line }]}
    >
      <Txt variant="bodyStrong" style={{ color: danger ? colors.danger : colors.text }}>{label}</Txt>
      {!danger ? <Feather name="chevron-right" size={16} color={colors.muted} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40, gap: 14, width: '100%', maxWidth: 640, alignSelf: 'center' },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  link: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 50 },
});
