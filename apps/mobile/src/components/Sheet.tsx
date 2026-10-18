import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';

/** Bottom sheet used by modal routes (Pro upsell, Save account). Tapping the backdrop closes it. */
export function Sheet({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));
  return (
    <View style={styles.root}>
      <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={close} style={[StyleSheet.absoluteFill, { backgroundColor: colors.backdrop }]} />
      <View
        style={[
          styles.sheet,
          { backgroundColor: colors.surface, borderColor: colors.line, paddingBottom: Math.max(insets.bottom, 16) + 14 },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: colors.lineStrong }]} />
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  sheet: {
    width: '100%',
    maxWidth: 520,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 22,
    paddingTop: 12,
  },
  handle: { width: 40, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: 18 },
});
