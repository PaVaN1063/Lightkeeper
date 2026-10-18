import { router } from 'expo-router';
import React, { useState } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';
import { Button } from '../src/components/Button';
import { LogoMark } from '../src/components/Logo';
import { IconButton } from '../src/components/primitives';
import { Screen } from '../src/components/Screen';
import { Txt } from '../src/components/Txt';
import { useApp } from '../src/store/AppStore';
import { useTheme } from '../src/theme/ThemeProvider';
import { fonts } from '../src/theme/tokens';
import { GoogleDot } from '../src/components/GoogleDot';

export default function SignIn() {
  const { colors } = useTheme();
  const { signIn, continueAsGuest } = useApp();
  const [email, setEmail] = useState('');

  // Mock auth: every option "succeeds" and moves on. Firebase Auth replaces this later.
  const go = (fn: () => void) => {
    fn();
    router.replace('/notifications');
  };

  return (
    <Screen
      footer={
        <Txt variant="caption" color="muted" align="center">
          By continuing you agree to our Terms and Privacy policy. We only store your email and your watches.
        </Txt>
      }
    >
      <IconButton icon="chevron-left" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/welcome'))} />

      <View style={[styles.mark, { backgroundColor: colors.surface }]}>
        <LogoMark size={34} />
      </View>
      <Txt variant="display" style={{ marginTop: 20 }}>Sign in to start watching</Txt>
      <Txt color="muted" style={{ marginTop: 8 }}>Your watches stay in sync on every phone and browser you sign in on.</Txt>

      <View style={{ gap: 12, marginTop: 26 }}>
        <Button kind="invert" label="Continue with Google" leading={<GoogleDot />} onPress={() => go(signIn)} />
        {Platform.OS === 'ios' ? <Button kind="secondary" icon="smartphone" label="Continue with Apple" onPress={() => go(signIn)} /> : null}
      </View>

      <View style={styles.or}>
        <View style={[styles.line, { backgroundColor: colors.line }]} />
        <Txt variant="small" color="muted">or use email</Txt>
        <View style={[styles.line, { backgroundColor: colors.line }]} />
      </View>

      <Txt variant="smallStrong" color="textSoft" style={{ marginBottom: 8 }}>Email</Txt>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        placeholderTextColor={colors.muted}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        accessibilityLabel="Email"
        style={[styles.input, { borderColor: colors.line, backgroundColor: colors.surface, color: colors.text }]}
      />
      <Button label="Send me a sign-in link" style={{ marginTop: 12 }} onPress={() => go(signIn)} />

      <Button kind="dashed" size="md" label="Try without signing in" iconRight="arrow-right" style={{ marginTop: 20 }} onPress={() => go(continueAsGuest)} />
      <Txt variant="caption" color="muted" align="center" style={{ marginTop: 8 }}>Guests get 1 watch. Save your account anytime to keep it.</Txt>
    </Screen>
  );
}

const styles = StyleSheet.create({
  mark: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  or: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 22 },
  line: { flex: 1, height: 1 },
  input: { height: 54, borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, fontFamily: fonts.regular, fontSize: 16 },
});
