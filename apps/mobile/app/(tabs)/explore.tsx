import { Feather } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chip } from '../../src/components/primitives';
import { Txt } from '../../src/components/Txt';
import { useGrid, useLayout } from '../../src/hooks/useLayout';
import { useApp } from '../../src/store/AppStore';
import { useTheme } from '../../src/theme/ThemeProvider';
import { fonts } from '../../src/theme/tokens';
import { Source, SourceCategory } from '../../src/types';

const CATS: SourceCategory[] = ['Exams', 'Jobs', 'Results', 'Local'];

export default function Explore() {
  const { colors } = useTheme();
  const { isWide } = useLayout();
  const { sources, watchedSources, toggleSource } = useApp();
  const [cat, setCat] = useState<SourceCategory>('Exams');
  const [query, setQuery] = useState('');
  // Cards are at least 280px wide: 1 column on phones, 2–4 on tablets and laptops.
  const grid = useGrid(280, 12);

  const list = useMemo(
    () =>
      sources.filter((s) =>
        query ? (s.name + ' ' + s.goal + ' ' + s.site).toLowerCase().includes(query.toLowerCase()) : s.category === cat,
      ),
    [sources, cat, query],
  );

  return (
    <SafeAreaView edges={isWide ? [] : ['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={[styles.content, isWide ? styles.contentWide : styles.contentPhone]}>
        <View style={styles.header}>
          <View style={{ flex: 1, minWidth: 260 }}>
            <Txt variant="title">{isWide ? 'Explore ready-made watches' : 'Explore'}</Txt>
            <Txt color="muted" style={{ marginTop: 4 }}>Official sources, already set up. One tap and you're watching.</Txt>
          </View>
          <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.line }, isWide && { width: 320, flexGrow: 0 }]}>
            <Feather name="search" size={18} color={colors.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search exams, jobs, results"
              placeholderTextColor={colors.muted}
              accessibilityLabel="Search ready-made watches"
              style={{ flex: 1, minWidth: 0, color: colors.text, fontFamily: fonts.regular, fontSize: 15 }}
            />
          </View>
        </View>

        <View style={styles.chips}>
          {CATS.map((c) => (
            <Chip key={c} label={c} selected={!query && cat === c} onPress={() => { setQuery(''); setCat(c); }} />
          ))}
        </View>

        <View style={styles.sectionHead}>
          <Txt variant="overline" color="muted">{query ? 'Results' : cat}</Txt>
          <Txt variant="small" color="muted">{list.length} {list.length === 1 ? 'source' : 'sources'}</Txt>
        </View>

        <View onLayout={grid.onLayout} style={grid.containerStyle}>
          {list.map((s) => (
            <View key={s.id} style={grid.itemStyle}>
              <SourceCard source={s} watching={!!watchedSources[s.id]} onToggle={() => toggleSource(s.id)} stacked={grid.columns > 1} />
            </View>
          ))}
        </View>

        {list.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.sunken }]}>
            <Txt color="muted">No ready-made watches match "{query}". You can still add any page with New watch.</Txt>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

/** One source. In a single column it's a compact row; in a grid the button sits under the text. */
function SourceCard({ source: s, watching, onToggle, stacked }: { source: Source; watching: boolean; onToggle: () => void; stacked: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.line }, stacked ? styles.cardStacked : styles.cardRow]}>
      <View style={styles.cardTop}>
        <View style={[styles.badge, { backgroundColor: colors.surface2 }]}>
          <Txt style={{ fontFamily: fonts.display, fontSize: 12, lineHeight: 14, color: colors.accentText }}>{s.badge}</Txt>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Txt variant="bodyStrong" style={{ fontFamily: fonts.bold }} numberOfLines={1}>{s.name}</Txt>
          <Txt variant="small" color="textSoft" numberOfLines={1}>{s.goal}</Txt>
          <Txt variant="caption" color="muted" numberOfLines={1}>{s.site}</Txt>
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: watching }}
        accessibilityLabel={watching ? `Stop watching ${s.name}` : `Watch ${s.name}`}
        onPress={onToggle}
        style={({ pressed }) => [
          styles.watchBtn,
          watching ? { backgroundColor: colors.tealBg, borderColor: colors.teal, borderWidth: 1 } : { backgroundColor: colors.accent },
          stacked && { alignSelf: 'stretch', height: 42 },
          { opacity: pressed ? 0.85 : 1 },
        ]}
      >
        {watching ? <Feather name="check" size={15} color={colors.tealText} /> : null}
        <Txt variant="smallStrong" style={{ fontFamily: fonts.bold, color: watching ? colors.tealText : colors.onAccent }}>{watching ? 'Watching' : 'Watch'}</Txt>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16, width: '100%', alignSelf: 'center' },
  contentPhone: { padding: 20, paddingBottom: 32, maxWidth: 640 },
  contentWide: { padding: 32, maxWidth: 1280 },
  header: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 16 },
  search: { flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 10, height: 48, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  card: { borderRadius: 18, borderWidth: 1, padding: 14, gap: 12 },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardStacked: { flexDirection: 'column', height: '100%' as const, justifyContent: 'space-between' },
  cardTop: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  watchBtn: { height: 38, paddingHorizontal: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  empty: { padding: 20, borderRadius: 16, alignItems: 'center' },
});
