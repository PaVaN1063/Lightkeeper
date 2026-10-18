import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { fonts, radius } from '../theme/tokens';
import { Txt } from './Txt';

type Kind = 'primary' | 'secondary' | 'invert' | 'ghost' | 'outline' | 'dashed' | 'danger';

type Props = {
  label: string;
  onPress?: () => void;
  kind?: Kind;
  icon?: React.ComponentProps<typeof Feather>['name'];
  iconRight?: React.ComponentProps<typeof Feather>['name'];
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  size?: 'md' | 'lg' | 'sm';
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  disabled?: boolean;
};

export function Button({ label, onPress, kind = 'primary', icon, iconRight, leading, trailing, size = 'lg', style, accessibilityLabel, disabled }: Props) {
  const { colors } = useTheme();
  const height = size === 'lg' ? 56 : size === 'md' ? 48 : 40;

  const palette: Record<Kind, { bg: string; fg: string; border?: string; dashed?: boolean }> = {
    primary: { bg: colors.accent, fg: colors.onAccent },
    secondary: { bg: colors.surface, fg: colors.text, border: colors.line },
    invert: { bg: colors.invertBg, fg: colors.invertText },
    ghost: { bg: 'transparent', fg: colors.textSoft },
    outline: { bg: 'transparent', fg: colors.text, border: colors.lineStrong },
    dashed: { bg: 'transparent', fg: colors.text, border: colors.lineStrong, dashed: true },
    danger: { bg: colors.dangerBg, fg: colors.danger, border: colors.dangerBorder },
  };
  const p = palette[kind];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          height,
          backgroundColor: p.bg,
          borderColor: p.border ?? 'transparent',
          borderWidth: p.border ? (p.dashed ? 1.5 : 1) : 0,
          borderStyle: p.dashed ? 'dashed' : 'solid',
          borderRadius: size === 'sm' ? 12 : radius.md + 2,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <View style={styles.row}>
        {leading}
        {icon ? <Feather name={icon} size={size === 'sm' ? 16 : 18} color={p.fg} /> : null}
        <Txt variant="button" style={{ color: p.fg, fontSize: size === 'sm' ? 14 : size === 'md' ? 15 : 16, fontFamily: kind === 'ghost' ? fonts.semibold : fonts.bold }}>
          {label}
        </Txt>
        {iconRight ? <Feather name={iconRight} size={16} color={p.fg} /> : null}
        {trailing}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
