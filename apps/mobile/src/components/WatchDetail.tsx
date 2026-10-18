import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { formatINR } from '../data/mock';
import { useApp } from '../store/AppStore';
import { useTheme } from '../theme/ThemeProvider';
import { Watch } from '../types';
import { Button } from './Button';
import { Card, ProBadge, SectionLabel, SiteAvatar, Tag } from './primitives';
import { Txt } from './Txt';

const intervalLabel = { '1h': 'Hourly', '30m': '30 min', '10m': '10 min' } as const;

/** Full details for one watch. Used by the details screen (phone) and the split view (web). */
export function WatchDetail({ watch, onDeleted }: { watch: Watch; onDeleted?: () => void }) {
  const { colors } = useTheme();
  const { togglePause, deleteWatch, setFeedback, checkNow } = useApp();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState<null | 'check' | 'pause' | 'delete'>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (kind: 'check' | 'pause' | 'delete', fn: () => Promise<void>) => {
    setBusy(kind);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };
  const failing = watch.pages.filter((p) => p.failing);

  const multi = watch.pages.length > 1;
  const priced = watch.pages.filter((p) => typeof p.price === 'number');
  const lowest = priced.length ? priced.reduce((a, b) => ((a.price ?? 0) <= (b.price ?? 0) ? a : b)) : null;

  const stats: { label: string; value: string; tone?: 'accent' | 'teal' }[] = [
    {
      label: 'Status',
      value: watch.status === 'goal_met' ? 'Goal met' : watch.status === 'paused' ? 'Paused' : 'Watching',
      tone: watch.status === 'goal_met' ? 'accent' : watch.status === 'watching' ? 'teal' : undefined,
    },
    lowest
      ? { label: 'Lowest', value: formatINR(lowest.price ?? 0) }
      : { label: 'Checks', value: intervalLabel[watch.interval] },
    lowest && watch.targetPrice
      ? { label: 'To target', value: formatINR(Math.max(0, (lowest.price ?? 0) - watch.targetPrice)) }
      : { label: 'Last check', value: watch.lastChecked },
  ];

  return (
    <View style={{ gap: 18 }}>
      <View>
        <Txt variant="title">{watch.name}</Txt>
        {multi ? (
          <Txt variant="small" color="muted" style={{ marginTop: 4 }}>{watch.goal}</Txt>
        ) : (
          <Pressable accessibilityRole="link" onPress={() => Linking.openURL(watch.pages[0].url)} style={styles.link}>
            <Txt variant="smallStrong" color="accentText">{watch.pages[0]?.site}</Txt>
            <Feather name="external-link" size={13} color={colors.accentText} />
          </Pressable>
        )}
      </View>

      <View style={styles.stats}>
        {stats.map((s) => (
          <View key={s.label} style={[styles.stat, { backgroundColor: colors.surface, borderColor: colors.line }]}>
            <Txt variant="caption" color="muted">{s.label}</Txt>
            <Txt
              variant="smallStrong"
              style={{ marginTop: 3, fontFamily: 'Figtree_700Bold', color: s.tone === 'accent' ? colors.accentText : s.tone === 'teal' ? colors.tealText : colors.text }}
            >
              {s.value}
            </Txt>
          </View>
        ))}
      </View>

      {failing.length ? (
        <Card tone="sunken" style={{ flexDirection: 'row', gap: 10 }}>
          <Feather name="alert-triangle" size={16} color={colors.danger} style={{ marginTop: 2 }} />
          <Txt variant="small" color="textSoft" style={{ flex: 1 }}>
            {failing.map((p) => `${p.site}: ${p.lastError ?? 'not reachable'}`).join('\n')}
            {'\n'}I'll keep trying on every check.
          </Txt>
        </Card>
      ) : null}

      {watch.status === 'watching' ? (
        <Button
          kind="outline"
          size="md"
          icon="refresh-cw"
          label={busy === 'check' ? 'Checking…' : `Check now · last checked ${watch.lastChecked}`}
          disabled={busy !== null}
          onPress={() => run('check', () => checkNow(watch.id))}
        />
      ) : null}

      {!multi ? (
        <Txt variant="small" color="textSoft">Goal: {watch.goal}</Txt>
      ) : (
        <View style={{ gap: 10 }}>
          <SectionLabel
            right={
              <Pressable accessibilityRole="button" onPress={() => router.push('/pro')} style={styles.row}>
                <Txt variant="smallStrong" color="accentText">+ Add site</Txt>
                <ProBadge />
              </Pressable>
            }
          >
            Sites
          </SectionLabel>
          <Card style={{ paddingVertical: 0 }}>
            {[...watch.pages]
              .sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
              .map((p, i, arr) => (
                <View key={p.id} style={[styles.siteRow, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.line }]}>
                  <SiteAvatar site={p.site} />
                  <View style={{ flex: 1 }}>
                    <View style={styles.row}>
                      <Txt variant="bodyStrong">{p.site}</Txt>
                      {lowest && p.id === lowest.id ? <Tag label="Lowest" tone="teal" /> : null}
                    </View>
                    <Txt variant="caption" color="muted" style={{ marginTop: 2 }}>Checked {p.lastChecked}</Txt>
                  </View>
                  {typeof p.price === 'number' ? (
                    <Txt variant="bodyStrong" style={{ fontFamily: 'Figtree_700Bold', color: lowest && p.id === lowest.id ? colors.text : colors.textSoft }}>
                      {formatINR(p.price)}
                    </Txt>
                  ) : null}
                </View>
              ))}
          </Card>
        </View>
      )}

      <View style={{ gap: 12 }}>
        <SectionLabel>Timeline</SectionLabel>
        {watch.timeline.map((e, i) => {
          const last = i === watch.timeline.length - 1;
          return (
            <View key={e.id} style={styles.tlRow}>
              <View style={styles.tlRail}>
                <View
                  style={[
                    styles.tlDot,
                    e.kind === 'alert'
                      ? { backgroundColor: colors.accent, width: 14, height: 14, borderRadius: 7 }
                      : e.kind === 'started'
                        ? { backgroundColor: colors.lineStrong }
                        : e.kind === 'error'
                        ? { borderWidth: 2, borderColor: colors.danger }
                        : { borderWidth: 2, borderColor: colors.lineStrong },
                  ]}
                />
                {!last ? <View style={[styles.tlLine, { backgroundColor: colors.line }]} /> : null}
              </View>
              <View style={{ flex: 1, paddingBottom: last ? 0 : 14 }}>
                <View style={styles.row}>
                  <Txt variant="caption" color="muted">
                    {e.when}
                    {e.kind === 'alert' ? ' · Alert' : e.kind === 'error' ? ' · Problem' : ''}
                  </Txt>
                  {e.site ? <Tag label={e.site} /> : null}
                </View>
                {e.kind === 'alert' ? (
                  <Card tone="accent" style={{ marginTop: 8, padding: 14 }}>
                    <Txt variant="bodyStrong" style={{ fontFamily: 'Figtree_700Bold' }}>{e.title}</Txt>
                    <Txt variant="small" color="textSoft" style={{ marginTop: 4 }}>{e.text}</Txt>
                    <View style={[styles.row, { marginTop: 12 }]}>
                      <Button label="Open link" size="sm" style={{ flex: 1 }} onPress={() => Linking.openURL(e.link ?? watch.pages[0].url)} />
                      <FeedbackButton icon="thumbs-up" label="Useful" active={e.feedback === 'useful'} tone="good" onPress={() => setFeedback(watch.id, e.id, e.feedback === 'useful' ? null : 'useful')} />
                      <FeedbackButton icon="thumbs-down" label="Not useful" active={e.feedback === 'not_useful'} tone="bad" onPress={() => setFeedback(watch.id, e.id, e.feedback === 'not_useful' ? null : 'not_useful')} />
                    </View>
                    {e.feedback ? <Txt variant="caption" style={{ marginTop: 10, color: colors.tealText }}>Thanks, this helps tune your alerts.</Txt> : null}
                  </Card>
                ) : (
                  <Txt variant="small" color={e.kind === 'started' ? 'muted' : 'textSoft'} style={[{ marginTop: 4 }, e.kind === 'error' && { color: colors.danger }]}>{e.text}</Txt>
                )}
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.actions}>
        <Button
          kind="secondary"
          size="md"
          icon={watch.status === 'watching' ? 'pause' : 'play'}
          label={busy === 'pause' ? 'Saving…' : watch.status === 'watching' ? 'Pause' : watch.status === 'goal_met' ? 'Watch again' : 'Resume'}
          style={{ flex: 1 }}
          disabled={busy !== null}
          onPress={() => run('pause', () => togglePause(watch.id))}
        />
        <Button
          kind="danger"
          size="md"
          icon="trash-2"
          label={busy === 'delete' ? 'Deleting…' : confirmDelete ? 'Tap to confirm' : 'Delete'}
          style={{ flex: 1 }}
          disabled={busy !== null}
          onPress={() => {
            if (!confirmDelete) return setConfirmDelete(true);
            run('delete', async () => {
              await deleteWatch(watch.id);
              onDeleted?.();
            });
          }}
        />
      </View>
      {error ? <Txt variant="small" align="center" style={{ color: colors.danger }}>{error}</Txt> : null}
      <Txt variant="caption" color="muted" align="center">Always confirm on the official website.</Txt>
    </View>
  );
}

function FeedbackButton({ icon, label, active, tone, onPress }: { icon: 'thumbs-up' | 'thumbs-down'; label: string; active: boolean; tone: 'good' | 'bad'; onPress: () => void }) {
  const { colors } = useTheme();
  const on = tone === 'good' ? { bg: colors.tealBg, fg: colors.tealText, border: colors.teal } : { bg: colors.dangerBg, fg: colors.danger, border: colors.danger };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.fb, active ? { backgroundColor: on.bg, borderColor: on.border } : { borderColor: colors.lineStrong }]}
    >
      <Feather name={icon} size={17} color={active ? on.fg : colors.textSoft} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, alignSelf: 'flex-start' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stats: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1 },
  siteRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  tlRow: { flexDirection: 'row', gap: 14 },
  tlRail: { width: 14, alignItems: 'center' },
  tlDot: { width: 12, height: 12, borderRadius: 6, marginTop: 2 },
  tlLine: { flex: 1, width: 2, marginTop: 4 },
  fb: { width: 44, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 4 },
});
