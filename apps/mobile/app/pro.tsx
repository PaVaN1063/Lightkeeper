import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { Button } from '../src/components/Button';
import { ProBadge } from '../src/components/primitives';
import { Sheet } from '../src/components/Sheet';
import { Txt } from '../src/components/Txt';
import { useTheme } from '../src/theme/ThemeProvider';

const PERKS = ['Up to 10 sites per watch', '25 watches instead of 3', 'Checks every 5–10 minutes', 'Alerts in Telugu and Hindi'];

export default function Pro() {
  const { colors } = useTheme();
  const close = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)'));
  return (
    <Sheet>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <ProBadge />
        <Txt variant="small" color="muted">Lightkeeper Pro</Txt>
      </View>
      <Txt variant="h2" style={{ marginTop: 14 }}>Watch more, check faster</Txt>
      <Txt color="muted" style={{ marginTop: 8 }}>Free watches cover 2 sites each, checked every hour. Pro is for when every minute counts.</Txt>
      <View style={{ gap: 14, marginTop: 20 }}>
        {PERKS.map((p) => (
          <View key={p} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Feather name="check" size={20} color={colors.teal} />
            <Txt>{p}</Txt>
          </View>
        ))}
      </View>
      <Button label="Join the Pro waitlist" style={{ marginTop: 26 }} onPress={close} />
      <Button kind="ghost" label="Maybe later" style={{ marginTop: 4 }} onPress={close} />
    </Sheet>
  );
}
