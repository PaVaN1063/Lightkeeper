import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { Logo } from '../../src/components/Logo';
import { Card, Chip, IconTile } from '../../src/components/primitives';
import { Txt } from '../../src/components/Txt';
import { WatchCard } from '../../src/components/WatchCard';
import { WatchDetail } from '../../src/components/WatchDetail';
import { MOCK_USER } from '../../src/data/mock';
import { useLayout } from '../../src/hooks/useLayout';
import { useApp } from '../../src/store/AppStore';
import { useTheme } from '../../src/theme/ThemeProvider';
import { fonts } from '../../src/theme/tokens';
import { WatchStatus } from '../../src/types';

type Filter = 'all' | WatchStatus;
const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'goal_met', label: 'Goal met' },
  { value: 'watching', label: 'Watching' },
  { value: 'paused', label: 'Paused' },
];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export default function Watches() {
  const { colors } = useTheme();
  const { isWide, isSplit } = useLayout();
  const { watches, session, activeCount, limits } = useApp();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const guest = session === 'guest';
  const newAlerts = watches.filter((w) => w.status === 'goal_met').length;
  const list = useMemo(
    () =>
      watches
        .filter((w) => filter === 'all' || w.status === filter)
        .filter((w) => !query || (w.name + ' ' + w.pages.map((p) => p.site).join(' ')).toLowerCase().includes(query.toLowerCase())),
    [watches, filter, query],
  );
  const selected = watches.find((w) => w.id === selectedId) ?? watches[0];

  const addWatch = () => {
    if (activeCount >= limits.watches) router.push(guest ? '/save-account' : '/pro');
    else router.push('/watch/new');
  };
  const open = (id: string) => (isSplit ? setSelectedId(id) : router.push(`/watch/${id}`));

  const header = (
    <View style={styles.headerRow}>
      <View style={{ flex: 1, minWidth: 240 }}>
        <Txt variant="title">{guest ? 'Your watch is on' : `${greeting()}, ${MOCK_USER.firstName}`}</Txt>
        <Txt color="muted" style={{ marginTop: 4 }}>
          {guest ? "We'll alert you on this device." : `${watches.length} watches`}
          {!guest && newAlerts > 0 ? <Txt variant="bodyStrong" color="accentText">{` · ${newAlerts} new alert`}</Txt> : null}
        </Txt>
      </View>
      {isWide ? (
        <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.line }]}>
          <Feather name="search" size={16} color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search your watches"
            placeholderTextColor={colors.muted}
            accessibilityLabel="Search your watches"
            style={{ flex: 1, color: colors.text, fontFamily: fonts.regular, fontSize: 15 }}
          />
        </View>
      ) : null}
    </View>
  );

  const banners = (
    <>
      {guest ? (
        <Card tone="accent">
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <IconTile icon="shield" tone="accent" size={38} />
            <View style={{ flex: 1 }}>
              <Txt variant="bodyStrong">You're using Lightkeeper as a guest</Txt>
              <Txt variant="small" color="textSoft" style={{ marginTop: 3 }}>
                Save your account so this watch isn't lost if you change phones, and to add more watches.
              </Txt>
            </View>
          </View>
          <Button label="Save my account" size="sm" style={{ marginTop: 14 }} onPress={() => router.push('/save-account')} />
        </Card>
      ) : null}
      {Platform.OS === 'web' ? (
        <View style={[styles.webStrip, { backgroundColor: colors.sunken, borderColor: colors.line }]}>
          <Feather name="bell" size={18} color={colors.teal} />
          <Txt variant="small" color="textSoft" style={{ flex: 1, minWidth: 200 }}>
            <Txt variant="smallStrong">Alerts are on in this browser.</Txt> Install Lightkeeper so they arrive even when the browser is closed.
          </Txt>
          <Pressable accessibilityRole="link" onPress={() => router.push('/install')}>
            <Txt variant="smallStrong" color="accentText">Install as app</Txt>
          </Pressable>
        </View>
      ) : null}
    </>
  );

  const listColumn = (
    <View style={{ gap: 12 }}>
      {!guest ? (
        <View style={styles.chips}>
          {FILTERS.map((f) => (
            <Chip key={f.value} label={f.label} selected={filter === f.value} onPress={() => setFilter(f.value)} />
          ))}
        </View>
      ) : null}
      {list.map((w) => (
        <WatchCard key={w.id} watch={w} selected={isSplit && selected?.id === w.id} onPress={() => open(w.id)} />
      ))}
      {list.length === 0 ? (
        <Card tone="sunken" style={{ alignItems: 'center', paddingVertical: 28 }}>
          <Txt color="muted">Nothing here yet.</Txt>
        </Card>
      ) : null}
      {guest ? (
        <View style={[styles.lockHint, { borderColor: colors.lineStrong }]}>
          <Feather name="lock" size={18} color={colors.muted} />
          <Txt variant="small" color="muted" style={{ flex: 1 }}>Guests can keep 1 watch. Save your account for 3 free watches.</Txt>
        </View>
      ) : null}
    </View>
  );

  // Wide screens: header + list (+ detail panel on very wide screens). Phones: classic list with a floating + button.
  if (isWide) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={styles.wideContent}>
        {header}
        {banners}
        <View style={styles.split}>
          <View style={{ flex: 1, minWidth: 340, maxWidth: isSplit ? 480 : 640 }}>{listColumn}</View>
          {isSplit && selected ? (
            <Card style={{ flex: 1.4, minWidth: 420, padding: 24, borderRadius: 24 }}>
              <WatchDetail key={selected.id} watch={selected} onDeleted={() => setSelectedId(null)} />
            </Card>
          ) : null}
        </View>
      </ScrollView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={styles.phoneContent}>
        <View style={styles.topBar}>
          <Logo size={17} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={guest ? 'Guest account' : 'Account'}
            onPress={() => (guest ? router.push('/save-account') : router.push('/settings'))}
            style={[styles.avatar, { backgroundColor: colors.surface2 }, guest && { width: 'auto', paddingHorizontal: 12, flexDirection: 'row', gap: 6 }]}
          >
            {guest ? <Feather name="user" size={14} color={colors.text} /> : null}
            <Txt variant="smallStrong">{guest ? 'Guest' : MOCK_USER.initials}</Txt>
          </Pressable>
        </View>
        {header}
        {banners}
        {listColumn}
      </ScrollView>
      <Pressable accessibilityRole="button" accessibilityLabel="Add a watch" onPress={addWatch} style={[styles.fab, { backgroundColor: colors.accent }]}>
        <Feather name="plus" size={26} color={colors.onAccent} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  phoneContent: { padding: 20, paddingBottom: 110, gap: 16, width: '100%', maxWidth: 640, alignSelf: 'center' },
  wideContent: { padding: 32, gap: 18 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 16 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 46, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, width: 300 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  webStrip: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1 },
  lockHint: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 20, borderWidth: 1.5, borderStyle: 'dashed' },
  split: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, alignItems: 'flex-start' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
});
