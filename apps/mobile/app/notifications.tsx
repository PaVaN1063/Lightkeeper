import { router } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { Button } from '../src/components/Button';
import { Card, IconTile } from '../src/components/primitives';
import { Screen } from '../src/components/Screen';
import { Txt } from '../src/components/Txt';
import { useTheme } from '../src/theme/ThemeProvider';

const POINTS = [
  { icon: 'clock' as const, title: 'Only when your goal is met', sub: 'Not every time a page moves a comma' },
  { icon: 'check-square' as const, title: 'One clear line, with the link', sub: '"GATE 2027 admit card is out. Download it here."' },
  { icon: 'slash' as const, title: 'No spam, no promos', sub: 'Quiet hours are on by default at night' },
];

/** Shown after sign-in. The real permission prompt (expo-notifications / Web Push) is wired in later. */
export default function Notifications() {
  const { colors, scheme } = useTheme();
  const finish = () => router.replace('/(tabs)');
  return (
    <Screen
      footer={
        <>
          <Button label="Allow notifications" onPress={finish} />
          <Button kind="ghost" label="Not now" onPress={finish} />
        </>
      }
    >
      <View style={styles.art}>
        <Svg width={220} height={200} viewBox="0 0 220 200" style={StyleSheet.absoluteFill}>
          <Circle cx={110} cy={100} r={96} fill={scheme === 'dark' ? '#131C2F' : '#E7ECF6'} />
          <Circle cx={110} cy={100} r={70} fill="none" stroke={colors.accent} strokeOpacity={0.25} strokeWidth={2} />
          <Circle cx={110} cy={100} r={46} fill={colors.accent} fillOpacity={0.14} />
        </Svg>
        <Feather name="bell" size={60} color={colors.accentText} />
      </View>

      <Txt variant="display" align="center" style={{ marginTop: 24 }}>We only speak up{'\n'}when it matters</Txt>
      <Txt color="muted" align="center" style={{ marginTop: 10, maxWidth: 320, alignSelf: 'center' }}>
        Alerts are the whole point of Lightkeeper. Allow notifications so you never miss the moment.
      </Txt>

      <Card style={{ marginTop: 28, paddingVertical: 4 }}>
        {POINTS.map((p, i) => (
          <View key={p.title} style={[styles.point, i < POINTS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.line }]}>
            <IconTile icon={p.icon} />
            <View style={{ flex: 1 }}>
              <Txt variant="bodyStrong">{p.title}</Txt>
              <Txt variant="small" color="muted" style={{ marginTop: 2 }}>{p.sub}</Txt>
            </View>
          </View>
        ))}
      </Card>

      {Platform.OS === 'web' ? (
        <Txt variant="caption" color="muted" align="center" style={{ marginTop: 16 }}>
          On iPhone, add Lightkeeper to your Home Screen first. We'll show you how.
        </Txt>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  art: { width: 220, height: 200, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  point: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
});
