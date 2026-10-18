import { router } from 'expo-router';
import React from 'react';
import { Button } from '../src/components/Button';
import { Screen } from '../src/components/Screen';
import { Txt } from '../src/components/Txt';

export default function NotFound() {
  return (
    <Screen>
      <Txt variant="title" style={{ marginTop: 40 }}>Nothing to watch here</Txt>
      <Txt color="muted" style={{ marginTop: 8 }}>This page doesn't exist.</Txt>
      <Button label="Go home" style={{ marginTop: 24 }} onPress={() => router.replace('/')} />
    </Screen>
  );
}
