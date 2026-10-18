import React from 'react';
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  /** Caps content width on big screens so phone-style screens stay readable on the web. */
  maxWidth?: number;
  edges?: Edge[];
  contentStyle?: StyleProp<ViewStyle>;
  footer?: React.ReactNode;
};

export function Screen({ children, scroll = true, maxWidth = 560, edges = ['top', 'bottom'], contentStyle, footer }: Props) {
  const { colors } = useTheme();
  const inner = <View style={[styles.inner, { maxWidth }, contentStyle]}>{children}</View>;
  return (
    <SafeAreaView edges={edges} style={[styles.root, { backgroundColor: colors.bg }]}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {inner}
        </ScrollView>
      ) : (
        inner
      )}
      {footer ? <View style={[styles.footer, { maxWidth }]}>{footer}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  inner: { flexGrow: 1, width: '100%', alignSelf: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  footer: { width: '100%', alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 16, paddingTop: 8, gap: 6 },
});
