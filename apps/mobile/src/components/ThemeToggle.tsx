import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemeMode, useTheme } from '../theme/ThemeProvider';
import { Txt } from './Txt';

const OPTIONS: { value: ThemeMode; icon: React.ComponentProps<typeof Feather>['name']; label: string }[] = [
  { value: 'system', icon: 'monitor', label: 'System' },
  { value: 'light', icon: 'sun', label: 'Light' },
  { value: 'dark', icon: 'moon', label: 'Dark' },
];

/** Compact System / Light / Dark switch for the web sidebar and landing page header. */
export function ThemeToggle({ showLabel = false }: { showLabel?: boolean }) {
  const { colors, mode, setMode } = useTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: colors.surface, borderColor: colors.line }]} accessibilityRole="radiogroup" accessibilityLabel="Theme">
      {OPTIONS.map((o) => {
        const on = mode === o.value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityLabel={`${o.label} theme`}
            accessibilityState={{ selected: on }}
            onPress={() => setMode(o.value)}
            style={[styles.item, on && { backgroundColor: colors.invertBg }, showLabel && { flex: 1 }]}
          >
            <Feather name={o.icon} size={15} color={on ? colors.invertText : colors.muted} />
            {showLabel ? <Txt variant="caption" style={{ color: on ? colors.invertText : colors.muted, fontFamily: 'Figtree_600SemiBold' }}>{o.label}</Txt> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 12, borderWidth: 1 },
  item: { height: 34, minWidth: 36, paddingHorizontal: 8, borderRadius: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
});
