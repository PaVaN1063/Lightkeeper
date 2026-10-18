import { Feather } from '@expo/vector-icons';
import React from 'react';
import { DimensionValue, Pressable, StyleSheet, View } from 'react-native';
import { formatINR } from '../data/mock';
import { useTheme } from '../theme/ThemeProvider';
import { radius } from '../theme/tokens';
import { Watch } from '../types';
import { StatusPill, Tag } from './primitives';
import { Txt } from './Txt';

export function WatchCard({ watch, onPress, selected }: { watch: Watch; onPress: () => void; selected?: boolean }) {
  const { colors } = useTheme();
  const met = watch.status === 'goal_met';
  const multi = watch.pages.length > 1;
  const priced = watch.pages.filter((p) => typeof p.price === 'number');
  const lowest = priced.length ? priced.reduce((a, b) => ((a.price ?? 0) <= (b.price ?? 0) ? a : b)) : null;
  const progress = lowest && watch.targetPrice ? Math.min(1, watch.targetPrice / (lowest.price ?? 1)) : 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${watch.name}, ${watch.status.replace('_', ' ')}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: met ? colors.accentSoftBg : colors.surface,
          borderColor: met || selected ? colors.accent : colors.line,
          borderWidth: selected ? 2 : 1,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={styles.top}>
        <StatusPill status={watch.status} />
        <Txt variant="caption" color="muted">{watch.statusNote}</Txt>
      </View>
      <Txt variant="h3" style={{ marginTop: 12 }}>{watch.name}</Txt>

      {multi ? (
        <View style={[styles.row, { marginTop: 6 }]}>
          <Tag label={`${watch.pages.length} sites`} />
          <Txt variant="small" color="muted" numberOfLines={1} style={{ flex: 1 }}>
            {watch.pages.map((p) => p.site).join(', ')}
          </Txt>
        </View>
      ) : (
        <Txt variant="small" color="muted" style={{ marginTop: 2 }}>{watch.pages[0]?.site}</Txt>
      )}

      {met && watch.aiSummary ? (
        <View style={[styles.summary, { backgroundColor: colors.surface }]}>
          <Feather name="zap" size={15} color={colors.accentText} style={{ marginTop: 2 }} />
          <Txt variant="small" color="textSoft" style={{ flex: 1 }}>{watch.aiSummary}</Txt>
        </View>
      ) : null}

      {lowest && watch.targetPrice && watch.status !== 'paused' ? (
        <View style={{ marginTop: 14 }}>
          <View style={styles.top}>
            <Txt variant="small" color="textSoft">
              {multi ? 'Lowest ' : 'Now '}
              <Txt variant="smallStrong">{formatINR(lowest.price ?? 0)}</Txt>
              {multi ? ` on ${capitalise(lowest.site)}` : ''}
            </Txt>
            <Txt variant="small" color="muted">Target {formatINR(watch.targetPrice)}</Txt>
          </View>
          <View style={[styles.track, { backgroundColor: colors.line }]}>
            <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` as DimensionValue, backgroundColor: colors.teal }]} />
          </View>
        </View>
      ) : null}
    </Pressable>
  );
}

export function capitalise(site: string) {
  const name = site.split('.')[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, padding: 16 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  summary: { marginTop: 12, padding: 12, borderRadius: 14, flexDirection: 'row', gap: 10 },
  track: { marginTop: 8, height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
});
