import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { Button } from '../src/components/Button';
import { GoogleDot } from '../src/components/GoogleDot';
import { IconTile } from '../src/components/primitives';
import { Sheet } from '../src/components/Sheet';
import { Txt } from '../src/components/Txt';
import { useApp } from '../src/store/AppStore';

/** Shown to guests when they hit the 1-watch limit or tap "Save account". Later: Firebase linkWithCredential. */
export default function SaveAccount() {
  const { signIn } = useApp();
  const close = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)'));
  const save = () => {
    signIn();
    router.replace('/(tabs)');
  };
  return (
    <Sheet>
      <IconTile icon="shield" tone="accent" size={56} />
      <Txt variant="h2" style={{ marginTop: 16 }}>Save your account to add more watches</Txt>
      <Txt color="muted" style={{ marginTop: 8 }}>
        You're using Lightkeeper as a guest. Saving takes one tap, keeps your watch, and lets you use Lightkeeper on another phone or the web.
      </Txt>
      <View style={{ gap: 10, marginTop: 22 }}>
        <Button kind="invert" label="Save with Google" leading={<GoogleDot />} onPress={save} />
        <Button kind="secondary" icon="mail" label="Save with email link" onPress={save} />
      </View>
      <Button kind="ghost" label="Not now" style={{ marginTop: 6 }} onPress={close} />
    </Sheet>
  );
}
