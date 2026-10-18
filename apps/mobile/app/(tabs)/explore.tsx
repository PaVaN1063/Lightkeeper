import { Feather } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chip } from '../../src/components/primitives';
import { Txt } from '../../src/components/Txt';
import { useLayout } from '../../src/hooks/useLayout';
import { useApp } from '../../src/store/AppStore';
import { useTheme } from '../../src/theme/ThemeProvider';
import { fonts } from '../../src/theme/tokens';
import { SourceCategory } from '../../src/types';

const CATS: SourceCategory[] = ['Exams', 'Jobs', 'Results', 'Local'];

export default function Explore() {
  const { colors } = useTheme();
  const { isWide } = useLayout();
  const { sources, watchedSources, toggleSource } = useApp();
  const [cat, setCat] = useState<SourceCategory>('Exams');
  const [query, setQuery] = useState('');

  const list = useMemo(
    () =>
      sources.filter((s) =>
        query ? (s.name + ' ' + s.goal + ' ' + s.site).toLowerCase().includes(query.toLowerCase()) : s.category === cat,
      ),
    [sources, cat, query],
  );

  return (
    <SafeAreaView edges={isWide ? [] : ['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={[styles.content, isWide && { padding: 32, maxWidth: undefined }]}>
        <View>
          <Txt variant="title">{isWide ? 'Explore ready-made watches' : 'Explore'}</Txt>
          <Txt color="muted" style={{ marginTop: 4 }}>Official sources, already set up. One tap and you're watching.</Txt>
        </View>

        <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.line }]}>
          <Feather name="search" size={18} color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search exams, jobs, results"
            placeholderTextColor={colors.muted}
            accessibilityLabel="Search ready-made watches"
            style={{ flex: 1, color: colors.text, fontFamily: fonts.regular, fontSize: 15 }}
          />
        </View>

        <View style={styles.chips}>
          {CATS.map((c) => (
            <Chip key={c} label={c} selected={!query && cat === c} onPress={() => { setQuery(''); setCat(c); }} />
          ))}
        </View>

        <View style={styles.sectionHead}>
          <Txt variant="overline" color="muted">{query ? 'Results' : cat}</Txt>
          <Txt variant="small" color="muted">{list.length} sources</Txt>
        </View>

        <View style={[styles.grid, isWide && { flexDirection: 'row', flexWrap: 'wrap' }]}>
          {list.map((s) => {
            const on = !!watchedSources[s.id];
            return (
              <View
                key={s.id}
                style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.line }, isWide && { width: 300, flexDirection: 'column', alignItems: 'stretch' }]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: isWide ? undefined : 1 }}>
                  <View style={[styles.badge, { backgroundColor: colors.surface2 }]}>
                    <Txt style={{ fontFamily: fonts.display, fontSize: 12, lineHeight: 14, color: colors.accentText }}>{s.badge}</Txt>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Txt variant="bodyStrong" style={{ fontFamily: fonts.bold }}>{s.name}</Txt>
                    <Txt variant="small" color="textSoft">{s.goal}</Txt>
                    <Txt variant="caption" color="muted">{s.site}</Txt>
                  </View>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={on ? `Stop watching ${s.name}` : `Watch ${s.name}`}
                  onPress={() => toggleSource(s.id)}
                  style={[
                    styles.watchBtn,
                    on ? { backgroundColor: colors.tealBg, borderColor: colors.teal, borderWidth: 1 } : { backgroundColor: colors.accent },
                    isWide && { marginTop: 14, height: 42 },
                  ]}
                >
                  <Txt variant="smallStrong" style={{ fontFamily: fonts.bold, color: on ? colors.tealText : colors.onAccent }}>{on ? 'Watching' : 'Watch'}</Txt>
                </Pressable>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 16, width: '100%', maxWidth: 640, alignSelf: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 50, borderRadius: 16, borderWidth: 1, paddingHorizontal: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  grid: { gap: 10 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 18, borderWidth: 1 },
  badge: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  watchBtn: { height: 38, paddingHorizontal: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
