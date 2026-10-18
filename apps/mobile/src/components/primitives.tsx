import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { radius } from '../theme/tokens';
import { WatchStatus } from '../types';
import { Txt } from './Txt';

type IconName = React.ComponentProps<typeof Feather>['name'];

export function Card({ children, style, tone = 'default' }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; tone?: 'default' | 'accent' | 'sunken' }) {
  const { colors } = useTheme();
  const tones = {
    default: { backgroundColor: colors.surface, borderColor: colors.line },
    accent: { backgroundColor: colors.accentSoftBg, borderColor: colors.accentSoftBorder },
    sunken: { backgroundColor: colors.sunken, borderColor: 'transparent' },
  };
  return <View style={[styles.card, tones[tone], style]}>{children}</View>;
}

export function IconButton({ icon, onPress, label, style }: { icon: IconName; onPress?: () => void; label: string; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.iconBtn, { backgroundColor: colors.surface, opacity: pressed ? 0.8 : 1 }, style]}
    >
      <Feather name={icon} size={20} color={colors.text} />
    </Pressable>
  );
}

export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={[
        styles.chip,
        selected ? { backgroundColor: colors.invertBg, borderColor: colors.invertBg } : { backgroundColor: colors.surface, borderColor: colors.line },
      ]}
    >
      <Txt variant="smallStrong" style={{ color: selected ? colors.invertText : colors.textSoft }}>
        {label}
      </Txt>
    </Pressable>
  );
}

export function StatusPill({ status }: { status: WatchStatus }) {
  const { colors } = useTheme();
  if (status === 'goal_met') {
    return (
      <View style={[styles.pill, { backgroundColor: colors.accent }]}>
        <Feather name="check" size={12} color={colors.onAccent} />
        <Txt variant="caption" style={{ color: colors.onAccent, fontFamily: 'Figtree_700Bold' }}>Goal met</Txt>
      </View>
    );
  }
  if (status === 'paused') {
    return (
      <View style={[styles.pill, { backgroundColor: colors.pausedBg }]}>
        <Feather name="pause" size={11} color={colors.pausedText} />
        <Txt variant="caption" style={{ color: colors.pausedText, fontFamily: 'Figtree_700Bold' }}>Paused</Txt>
      </View>
    );
  }
  return (
    <View style={[styles.pill, { backgroundColor: colors.tealBg }]}>
      <View style={[styles.dot, { backgroundColor: colors.teal }]} />
      <Txt variant="caption" style={{ color: colors.tealText, fontFamily: 'Figtree_700Bold' }}>Watching</Txt>
    </View>
  );
}

export function ProBadge() {
  const { colors } = useTheme();
  return (
    <View style={[styles.pro, { backgroundColor: colors.accent }]}>
      <Txt style={{ color: colors.onAccent, fontFamily: 'Figtree_700Bold', fontSize: 10, lineHeight: 12, letterSpacing: 0.4 }}>PRO</Txt>
    </View>
  );
}

export function Tag({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'teal' }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.tag, { backgroundColor: tone === 'teal' ? colors.tealBg : colors.surface2 }]}>
      <Txt variant="caption" style={{ color: tone === 'teal' ? colors.tealText : colors.textSoft, fontFamily: 'Figtree_700Bold' }}>
        {label}
      </Txt>
    </View>
  );
}

export function SectionLabel({ children, right }: { children: string; right?: React.ReactNode }) {
  return (
    <View style={styles.sectionRow}>
      <Txt variant="overline" color="muted">{children}</Txt>
      {right}
    </View>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; icon?: IconName; locked?: boolean }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.segment, { backgroundColor: colors.surface, borderColor: colors.line }]} accessibilityRole="radiogroup">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            style={[styles.segmentItem, on && { backgroundColor: colors.invertBg }]}
          >
            {o.icon ? <Feather name={o.icon} size={15} color={on ? colors.invertText : colors.muted} /> : null}
            <Txt variant="smallStrong" style={{ color: on ? colors.invertText : colors.muted }}>{o.label}</Txt>
            {o.locked ? <Txt style={{ color: colors.accentText, fontFamily: 'Figtree_700Bold', fontSize: 10, lineHeight: 12 }}>PRO</Txt> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

export function SiteAvatar({ site, size = 34 }: { site: string; size?: number }) {
  const { colors } = useTheme();
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.3, backgroundColor: colors.invertBg, alignItems: 'center', justifyContent: 'center' }}>
      <Txt style={{ color: colors.invertText, fontFamily: 'Figtree_700Bold', fontSize: 15, lineHeight: 18 }}>{site.charAt(0).toLowerCase()}</Txt>
    </View>
  );
}

export function IconTile({ icon, tone = 'teal', size = 36 }: { icon: IconName; tone?: 'teal' | 'accent' | 'muted'; size?: number }) {
  const { colors } = useTheme();
  const color = tone === 'teal' ? colors.teal : tone === 'accent' ? colors.accentText : colors.muted;
  const bg = tone === 'accent' ? colors.accentSoftBg : colors.surface2;
  return (
    <View style={{ width: size, height: size, borderRadius: 12, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Feather name={icon} size={size * 0.5} color={color} />
    </View>
  );
}

export function Divider() {
  const { colors } = useTheme();
  return <View style={{ height: 1, backgroundColor: colors.line }} />;
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: 1, padding: 16 },
  iconBtn: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  chip: { height: 34, paddingHorizontal: 14, borderRadius: 17, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 26, paddingHorizontal: 10, borderRadius: 13, alignSelf: 'flex-start' },
  dot: { width: 7, height: 7, borderRadius: 4 },
  pro: { height: 20, paddingHorizontal: 7, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  tag: { height: 22, paddingHorizontal: 8, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  segment: { flexDirection: 'row', gap: 6, padding: 5, borderRadius: 16, borderWidth: 1 },
  segmentItem: { flex: 1, height: 44, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
});
