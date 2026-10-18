import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../src/components/Button';
import { GoogleDot } from '../src/components/GoogleDot';
import { LighthouseHero, Logo } from '../src/components/Logo';
import { Card, StatusPill } from '../src/components/primitives';
import { Screen } from '../src/components/Screen';
import { ThemeToggle } from '../src/components/ThemeToggle';
import { Txt } from '../src/components/Txt';
import { useLayout } from '../src/hooks/useLayout';
import { useApp } from '../src/store/AppStore';
import { useTheme } from '../src/theme/ThemeProvider';
import { fonts } from '../src/theme/tokens';

const SLIDES = [
  {
    title: "Stop refreshing.\nWe'll tell you when it happens.",
    body: "Results, admit cards, price drops, new job posts. Say what you're waiting for in plain words, and Lightkeeper checks the page for you.",
  },
  {
    title: 'Watch two stores,\nget one alert.',
    body: 'Add Amazon and Flipkart to the same watch. We alert you on whichever drops first.',
  },
  {
    title: 'Only when it matters.',
    body: 'One clear line with the direct link. No spam, no promos, quiet at night.',
  },
];

export default function Welcome() {
  const { isWide } = useLayout();
  return isWide ? <WideLanding /> : <PhoneWelcome />;
}

function PhoneWelcome() {
  const { colors } = useTheme();
  const [slide, setSlide] = useState(0);
  const s = SLIDES[slide];
  const last = slide === SLIDES.length - 1;
  return (
    <Screen
      footer={
        <>
          <Button label={last ? 'Get started' : 'Next'} onPress={() => (last ? router.push('/sign-in') : setSlide(slide + 1))} />
          <Button kind="ghost" label="I already have an account" onPress={() => router.push('/sign-in')} />
        </>
      }
    >
      <Logo />
      <View style={styles.heroWrap}>
        <LighthouseHero size={290} />
      </View>
      <Txt variant="overline" color="accentText">Keeping watch, so you don't have to</Txt>
      <Txt variant="hero" style={{ marginTop: 12 }}>{s.title}</Txt>
      <Txt color="muted" style={{ marginTop: 12 }}>{s.body}</Txt>
      <View style={styles.dots} accessibilityLabel={`Slide ${slide + 1} of ${SLIDES.length}`}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, { width: i === slide ? 22 : 6, backgroundColor: i === slide ? colors.accent : colors.lineStrong }]} />
        ))}
      </View>
    </Screen>
  );
}

/** The web landing page: same entry route, laid out for big screens with sign-in right on it. */
function WideLanding() {
  const { colors } = useTheme();
  const { signIn, continueAsGuest } = useApp();
  const [email, setEmail] = useState('');

  const go = (fn: () => void) => {
    fn();
    router.replace('/notifications');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.wideInner}>
          <View style={styles.nav}>
            <Logo size={20} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <ThemeToggle />
              <Button kind="ghost" size="md" label="Ready-made watches" onPress={() => go(continueAsGuest)} />
              <Button kind="secondary" size="md" label="Sign in" onPress={() => router.push('/sign-in')} />
            </View>
          </View>

          <View style={styles.heroRow}>
            <View style={{ flex: 1, minWidth: 340 }}>
              <Txt variant="overline" color="accentText">Keeping watch, so you don't have to</Txt>
              <Txt style={{ fontFamily: fonts.display, fontSize: 56, lineHeight: 60, letterSpacing: -1, color: colors.text, marginTop: 16 }}>
                Stop refreshing.{'\n'}We'll tell you the moment it happens.
              </Txt>
              <Txt color="muted" style={{ marginTop: 18, maxWidth: 520, fontSize: 18, lineHeight: 28 }}>
                Exam results, admit cards, price drops, new job posts. Paste a link, say what you're waiting for, and Lightkeeper checks the page for you.
              </Txt>

              <View style={{ marginTop: 30, maxWidth: 440, gap: 12 }}>
                <Button kind="invert" label="Continue with Google" leading={<GoogleDot />} onPress={() => go(signIn)} />
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor={colors.muted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    accessibilityLabel="Email"
                    style={[styles.input, { borderColor: colors.line, backgroundColor: colors.surface, color: colors.text }]}
                  />
                  <Button label="Email me a link" size="md" style={{ height: 52 }} onPress={() => go(signIn)} />
                </View>
                <Button kind="dashed" size="md" label="Try without signing in" iconRight="arrow-right" onPress={() => go(continueAsGuest)} />
                <Txt variant="small" color="muted">Free: 3 watches, 2 sites each. Guests get 1 watch.</Txt>
              </View>
            </View>

            <View style={{ flex: 1, minWidth: 340, alignItems: 'center' }}>
              <Card style={{ width: '100%', maxWidth: 440, padding: 20, gap: 12, borderRadius: 28 }}>
                <Card tone="accent" style={{ padding: 14 }}>
                  <Txt variant="caption" color="muted">Lightkeeper · now</Txt>
                  <Txt variant="h3" style={{ marginTop: 6 }}>GATE 2027 admit card is out</Txt>
                  <Txt variant="small" color="textSoft">Download it from the candidate portal.</Txt>
                </Card>
                {[
                  ['OnePlus 13 under ₹50,000', 'Amazon, Flipkart'],
                  ['SSC CGL 2026 Tier 1 result', 'ssc.gov.in'],
                ].map(([t, s]) => (
                  <View key={t} style={[styles.miniRow, { backgroundColor: colors.bg, borderColor: colors.line }]}>
                    <View style={{ flex: 1 }}>
                      <Txt variant="bodyStrong">{t}</Txt>
                      <Txt variant="small" color="muted">{s}</Txt>
                    </View>
                    <StatusPill status="watching" />
                  </View>
                ))}
              </Card>
            </View>
          </View>

          <Txt variant="title" style={{ marginTop: 56 }}>How it works</Txt>
          <View style={styles.steps}>
            {[
              ['Paste a link', 'Any public page: a results site, a product page, a careers page. Or pick a ready-made watch.'],
              ["Say what you're waiting for", '"Tell me when the admit card is out." AI turns it into a precise check.'],
              ['Get one clear alert', 'A notification with a one-line summary and the direct link. No spam.'],
            ].map(([t, b], i) => (
              <Card key={t} style={{ flex: 1, minWidth: 240, padding: 22 }}>
                <Txt style={{ fontFamily: fonts.display, fontSize: 28, lineHeight: 32, color: colors.accentText }}>{i + 1}</Txt>
                <Txt variant="h3" style={{ marginTop: 8 }}>{t}</Txt>
                <Txt variant="small" color="muted" style={{ marginTop: 6 }}>{b}</Txt>
              </Card>
            ))}
          </View>

          <View style={[styles.footer, { borderTopColor: colors.line }]}>
            <Txt variant="small" color="muted">Lightkeeper · Always confirm on the official website.</Txt>
            <Txt variant="small" color="textSoft">Privacy policy · Terms</Txt>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  heroWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 300, marginVertical: 8 },
  dots: { flexDirection: 'row', gap: 8, marginTop: 24 },
  dot: { height: 6, borderRadius: 3 },
  wideInner: { width: '100%', maxWidth: 1200, alignSelf: 'center', paddingHorizontal: 24, paddingBottom: 24 },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20, flexWrap: 'wrap', gap: 12 },
  heroRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 48, alignItems: 'center', marginTop: 40 },
  input: { flex: 1, minWidth: 0, height: 52, borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, fontFamily: fonts.regular, fontSize: 16 },
  miniRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1 },
  steps: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 20 },
  footer: { marginTop: 56, paddingTop: 22, borderTopWidth: 1, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
});
