import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ParsedGoal } from '../../src/api/mappers';
import { Button } from '../../src/components/Button';
import { Card, IconButton } from '../../src/components/primitives';
import { Screen } from '../../src/components/Screen';
import { Txt } from '../../src/components/Txt';
import { formatINR, siteFromUrl } from '../../src/data/mock';
import { useApp } from '../../src/store/AppStore';
import { useTheme } from '../../src/theme/ThemeProvider';
import { fonts } from '../../src/theme/tokens';

const TYPE_LABEL: Record<string, string> = { keyword: 'New words appear', price: 'Price drops below', any_change: 'Any change on the page' };

export default function ConfirmWatch() {
  const { colors } = useTheme();
  const { draft, parseDraft, createWatchFromDraft } = useApp();
  const [parsed, setParsed] = useState<ParsedGoal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const sites = draft.urls.map(siteFromUrl).filter((s): s is string => !!s);

  // Ask the server how it understood the goal (rules today, Gemini later).
  useEffect(() => {
    parseDraft()
      .then(setParsed)
      .catch((e) => setError((e as Error).message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = async () => {
    setBusy(true);
    setError(null);
    try {
      await createWatchFromDraft();
      router.replace('/(tabs)');
    } catch (e) {
      const err = e as { code?: string; message?: string };
      if (err.code === 'LIMIT_WATCHES' || err.code === 'LIMIT_PAGES') router.push('/pro');
      setError(err.message ?? 'Could not create the watch.');
    } finally {
      setBusy(false);
    }
  };

  const rows: [string, string][] = [
    ['Pages', (parsed?.sites ?? sites).join(', ') || '—'],
    ['Check every', draft.interval === '1h' ? '1 hour' : draft.interval],
    ['Alert when', parsed ? TYPE_LABEL[parsed.conditionType] ?? parsed.conditionType : '…'],
    ['Counts as', '1 watch'],
  ];

  return (
    <Screen
      footer={
        <>
          <Button label={busy ? 'Checking the page…' : 'Start watching'} disabled={busy || !parsed} onPress={start} />
          <Button kind="ghost" label="Edit goal" onPress={() => router.back()} />
        </>
      }
    >
      <View style={styles.header}>
        <IconButton icon="chevron-left" label="Back" onPress={() => router.back()} />
        <Txt variant="small" color="muted">Step 2 of 2</Txt>
      </View>

      <Txt variant="display" style={{ marginTop: 26 }}>Here's what I'll watch for</Txt>

      <Card style={{ marginTop: 22, padding: 18, borderRadius: 22 }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={[styles.spark, { backgroundColor: colors.accentSoftBg }]}>
            <Feather name="zap" size={18} color={colors.accentText} />
          </View>
          {parsed ? (
            <Txt style={{ flex: 1, fontFamily: fonts.regular, fontSize: 17, lineHeight: 26, color: colors.text }}>{parsed.summary}</Txt>
          ) : error ? null : (
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <ActivityIndicator color={colors.accent} />
              <Txt color="muted">Reading your goal…</Txt>
            </View>
          )}
        </View>
        {parsed && (parsed.keywords.length > 0 || parsed.priceTarget) ? (
          <View style={styles.tags}>
            {parsed.priceTarget ? <View style={[styles.tag, { backgroundColor: colors.surface2 }]}><Txt variant="caption" color="textSoft">Target {formatINR(parsed.priceTarget)}</Txt></View> : null}
            {parsed.keywords.map((k) => (
              <View key={k} style={[styles.tag, { backgroundColor: colors.surface2 }]}>
                <Txt variant="caption" color="textSoft">"{k}"</Txt>
              </View>
            ))}
            {sites.length > 1 ? <View style={[styles.tag, { backgroundColor: colors.surface2 }]}><Txt variant="caption" color="textSoft">First match wins</Txt></View> : null}
          </View>
        ) : null}
      </Card>

      {error ? (
        <Card tone="sunken" style={{ marginTop: 14 }}>
          <Txt variant="small" style={{ color: colors.danger }}>{error}</Txt>
        </Card>
      ) : null}

      <Card style={{ marginTop: 14, paddingVertical: 0, borderRadius: 22 }}>
        {rows.map(([k, v], i) => (
          <View key={k} style={[styles.row, i < rows.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.line }]}>
            <Txt variant="small" color="muted">{k}</Txt>
            <Txt variant="smallStrong" style={{ flexShrink: 1, textAlign: 'right' }}>{v}</Txt>
          </View>
        ))}
      </Card>

      <Card tone="sunken" style={{ marginTop: 14, flexDirection: 'row', gap: 10, padding: 14 }}>
        <Feather name="info" size={16} color={colors.muted} style={{ marginTop: 2 }} />
        <Txt variant="small" color="muted" style={{ flex: 1 }}>Always confirm on the official website before acting on an alert.</Txt>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  spark: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  tag: { height: 30, paddingHorizontal: 12, borderRadius: 15, justifyContent: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingVertical: 14 },
});
