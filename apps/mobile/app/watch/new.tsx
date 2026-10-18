import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { Card, IconButton, ProBadge, Segmented, SiteAvatar } from '../../src/components/primitives';
import { Screen } from '../../src/components/Screen';
import { Txt } from '../../src/components/Txt';
import { previewSentence, siteFromUrl } from '../../src/data/mock';
import { useLayout } from '../../src/hooks/useLayout';
import { useApp } from '../../src/store/AppStore';
import { useTheme } from '../../src/theme/ThemeProvider';
import { fonts } from '../../src/theme/tokens';
import { CheckInterval } from '../../src/types';

const SUGGESTIONS = ['Any change', 'A word appears…', 'Price drops below…', 'Back in stock'];
const SUGGESTION_TEXT: Record<string, string> = {
  'Any change': 'Tell me when anything on this page changes',
  'A word appears…': 'Tell me when the word "result" appears',
  'Price drops below…': 'Tell me when the price drops below ₹',
  'Back in stock': 'Tell me when it is back in stock',
};

export default function NewWatch() {
  const { colors } = useTheme();
  const { isWide } = useLayout();
  const { draft, setDraft, limits, activeCount, createWatchFromDraft } = useApp();

  const sites = draft.urls.map(siteFromUrl).filter((s): s is string => !!s);
  const canContinue = sites.length > 0 && draft.goal.trim().length > 3;
  const atPageLimit = draft.urls.length >= limits.pagesPerWatch;

  const setUrl = (i: number, value: string) => setDraft({ urls: draft.urls.map((u, j) => (j === i ? value : u)) });
  const removeUrl = (i: number) => setDraft({ urls: draft.urls.length === 1 ? [''] : draft.urls.filter((_, j) => j !== i) });
  const addPage = () => (atPageLimit ? router.push('/pro') : setDraft({ urls: [...draft.urls, ''] }));

  const close = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)'));
  const start = () => {
    createWatchFromDraft();
    router.replace('/(tabs)');
  };

  const form = (
    <View style={{ gap: 0 }}>
      <View style={styles.labelRow}>
        <Txt variant="smallStrong" color="textSoft">Pages to watch</Txt>
        <Txt variant="caption" color="muted">{draft.urls.length} of {limits.pagesPerWatch} free</Txt>
      </View>
      <View style={{ gap: 8 }}>
        {draft.urls.map((url, i) => {
          const site = siteFromUrl(url);
          return (
            <View key={i} style={[styles.urlRow, { backgroundColor: colors.surface, borderColor: colors.line }]}>
              {site ? <SiteAvatar site={site} /> : <Feather name="link" size={18} color={colors.muted} style={{ marginLeft: 8 }} />}
              <View style={{ flex: 1, minWidth: 0 }}>
                <TextInput
                  value={url}
                  onChangeText={(v) => setUrl(i, v)}
                  placeholder="Paste a link, e.g. ssc.gov.in/results"
                  placeholderTextColor={colors.muted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  accessibilityLabel={`Page ${i + 1} link`}
                  style={[styles.urlInput, { color: colors.text }]}
                />
                {site ? <Txt variant="caption" color="tealText">{site} · page found</Txt> : null}
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel={`Remove page ${i + 1}`} onPress={() => removeUrl(i)} style={styles.remove}>
                <Feather name="x" size={16} color={colors.muted} />
              </Pressable>
            </View>
          );
        })}
        <Pressable
          accessibilityRole="button"
          onPress={addPage}
          style={[styles.addPage, { borderColor: colors.lineStrong }]}
        >
          <Feather name="plus" size={16} color={colors.textSoft} />
          <Txt variant="smallStrong" color="textSoft">Add another page</Txt>
          {atPageLimit ? <ProBadge /> : null}
        </Pressable>
      </View>
      <Txt variant="caption" color="muted" style={{ marginTop: 8 }}>You'll get one alert from whichever page meets your goal first.</Txt>

      <Txt variant="smallStrong" color="textSoft" style={{ marginTop: 22, marginBottom: 8 }}>What are you waiting for?</Txt>
      <View>
        <TextInput
          value={draft.goal}
          onChangeText={(v) => setDraft({ goal: v })}
          placeholder="Tell me when the result is out"
          placeholderTextColor={colors.muted}
          multiline
          accessibilityLabel="What are you waiting for?"
          style={[styles.goal, { color: colors.text, backgroundColor: colors.surface, borderColor: draft.goal ? colors.accent : colors.line }]}
        />
        <Pressable accessibilityRole="button" accessibilityLabel="Speak your goal" style={[styles.mic, { backgroundColor: colors.surface2 }]}>
          <Feather name="mic" size={19} color={colors.accentText} />
        </Pressable>
      </View>
      <View style={styles.suggestions}>
        {SUGGESTIONS.map((s) => (
          <Pressable key={s} accessibilityRole="button" onPress={() => setDraft({ goal: SUGGESTION_TEXT[s] })} style={[styles.suggestion, { borderColor: colors.line }]}>
            <Txt variant="caption" color="textSoft" style={{ fontFamily: fonts.semibold, fontSize: 13 }}>{s}</Txt>
          </Pressable>
        ))}
      </View>

      <Txt variant="smallStrong" color="textSoft" style={{ marginTop: 22, marginBottom: 8 }}>How often to check</Txt>
      <Segmented<CheckInterval>
        value={draft.interval}
        onChange={(v) => (v === '1h' ? setDraft({ interval: v }) : router.push('/pro'))}
        options={[
          { value: '1h', label: 'Every hour' },
          { value: '30m', label: '30 min', locked: true },
          { value: '10m', label: '10 min', locked: true },
        ]}
      />
    </View>
  );

  const preview = (
    <Card tone="accent" style={{ padding: 22, borderRadius: 24, gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Feather name="zap" size={18} color={colors.accentText} />
        <Txt variant="overline" color="accentText">Live preview</Txt>
      </View>
      <Txt style={{ fontFamily: fonts.regular, fontSize: 18, lineHeight: 27, color: colors.text }}>
        {canContinue ? previewSentence(sites, draft.goal, draft.interval) : 'Add a link and tell me what you are waiting for. I will rewrite it here.'}
      </Txt>
      <Txt variant="small" color="textSoft">Counts as 1 watch · {activeCount} of {limits.watches} used</Txt>
      <Button label="Start watching" disabled={!canContinue} onPress={start} />
      <Txt variant="caption" color="textSoft">Always confirm on the official website before acting on an alert.</Txt>
    </Card>
  );

  if (isWide) {
    return (
      <Screen maxWidth={1120}>
        <View style={styles.wideHeader}>
          <IconButton icon="chevron-left" label="Back to watches" onPress={close} />
          <Txt variant="title">New watch</Txt>
        </View>
        <View style={styles.wideRow}>
          <Card style={{ flex: 1.3, minWidth: 420, padding: 24, borderRadius: 24 }}>{form}</Card>
          <View style={{ flex: 1, minWidth: 320 }}>{preview}</View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <>
          <Button label="Continue" icon="zap" disabled={!canContinue} onPress={() => router.push('/watch/confirm')} />
          <Txt variant="caption" color="muted" align="center">Free plan · {activeCount} of {limits.watches} watches used</Txt>
        </>
      }
    >
      <View style={styles.phoneHeader}>
        <IconButton icon="x" label="Close" onPress={close} />
        <Txt variant="h2" style={{ fontFamily: fonts.displayBold, fontSize: 20 }}>New watch</Txt>
      </View>
      <View style={{ marginTop: 22 }}>{form}</View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  phoneHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  wideHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 22 },
  wideRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 },
  urlRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, paddingLeft: 10, paddingRight: 4, borderRadius: 16, borderWidth: 1 },
  urlInput: { fontFamily: fonts.medium, fontSize: 15, paddingVertical: 6 },
  remove: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  addPage: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 50, borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed' },
  goal: { minHeight: 84, borderRadius: 16, borderWidth: 1, padding: 14, paddingRight: 64, fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, textAlignVertical: 'top' },
  mic: { position: 'absolute', right: 10, bottom: 10, width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  suggestion: { height: 34, paddingHorizontal: 12, borderRadius: 17, borderWidth: 1, justifyContent: 'center' },
});
