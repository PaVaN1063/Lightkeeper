import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MOCK_USER } from '../data/mock';
import { useLayout } from '../hooks/useLayout';
import { useApp } from '../store/AppStore';
import { useTheme } from '../theme/ThemeProvider';
import { Button } from './Button';
import { LogoMark, Logo } from './Logo';
import { Txt } from './Txt';

type IconName = React.ComponentProps<typeof Feather>['name'];

const TABS: Record<string, { label: string; icon: IconName | 'logo' }> = {
  index: { label: 'Watches', icon: 'logo' },
  explore: { label: 'Explore', icon: 'compass' },
  settings: { label: 'Settings', icon: 'settings' },
};

type TabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  /** Newer bottom-tabs passes navigateToTab(routeKey); older versions pass navigation. */
  navigateToTab?: (routeKey: string) => void;
  navigation?: { navigate: (name: string) => void };
};

function goToTab(props: TabBarProps, route: { key: string; name: string }) {
  if (props.navigateToTab) props.navigateToTab(route.key);
  else props.navigation?.navigate(route.name);
}

/** Bottom tab bar on phones, sidebar on wide screens (web, tablets). */
export function TabBar(props: TabBarProps) {
  const { isWide } = useLayout();
  return isWide ? <Sidebar {...props} /> : <BottomBar {...props} />;
}

function BottomBar(props: TabBarProps) {
  const { state } = props;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bottom, { backgroundColor: colors.nav, borderTopColor: colors.line, paddingBottom: Math.max(insets.bottom, 10) }]}>
      {state.routes.map((route, i) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        const on = state.index === i;
        const color = on ? colors.accentText : colors.muted;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => goToTab(props, route)}
            style={styles.bottomItem}
          >
            {tab.icon === 'logo' ? <LogoMark size={22} color={color} /> : <Feather name={tab.icon} size={21} color={color} />}
            <Txt variant="caption" style={{ color, fontFamily: on ? 'Figtree_700Bold' : 'Figtree_600SemiBold' }}>{tab.label}</Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

function Sidebar(props: TabBarProps) {
  const { state } = props;
  const { colors } = useTheme();
  const { session, activeCount, limits, watches } = useApp();
  const newAlerts = watches.filter((w) => w.status === 'goal_met').length;
  return (
    <View style={[styles.side, { backgroundColor: colors.nav, borderRightColor: colors.line }]}>
      <View style={{ paddingHorizontal: 10, paddingBottom: 18 }}>
        <Logo />
      </View>
      <Button label="New watch" icon="plus" size="md" style={{ marginBottom: 14 }} onPress={() => router.push(session === 'guest' && activeCount >= limits.watches ? '/save-account' : '/watch/new')} />
      {state.routes.map((route, i) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        const on = state.index === i;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => goToTab(props, route)}
            style={[styles.sideItem, on && { backgroundColor: colors.surface2 }]}
          >
            {tab.icon === 'logo' ? <LogoMark size={18} color={on ? colors.accentText : colors.muted} /> : <Feather name={tab.icon} size={18} color={on ? colors.accentText : colors.muted} />}
            <Txt variant="bodyStrong" style={{ color: on ? colors.text : colors.textSoft, flex: 1 }}>{tab.label}</Txt>
            {route.name === 'index' && newAlerts > 0 ? (
              <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                <Txt style={{ color: colors.onAccent, fontFamily: 'Figtree_700Bold', fontSize: 12, lineHeight: 14 }}>{newAlerts}</Txt>
              </View>
            ) : null}
          </Pressable>
        );
      })}

      <View style={{ flex: 1 }} />
      {session === 'guest' ? (
        <View style={[styles.account, { backgroundColor: colors.accentSoftBg, borderColor: colors.accentSoftBorder }]}>
          <Txt variant="smallStrong">Browsing as a guest</Txt>
          <Txt variant="caption" color="textSoft" style={{ marginTop: 4 }}>Save your account to keep more than 1 watch.</Txt>
          <Button label="Save account" size="sm" style={{ marginTop: 10 }} onPress={() => router.push('/save-account')} />
        </View>
      ) : (
        <View style={[styles.account, { backgroundColor: colors.surface, borderColor: colors.line }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={[styles.avatar, { backgroundColor: colors.surface2 }]}>
              <Txt variant="smallStrong">{MOCK_USER.initials}</Txt>
            </View>
            <View>
              <Txt variant="smallStrong">{MOCK_USER.name}</Txt>
              <Txt variant="caption" color="muted">Free plan</Txt>
            </View>
          </View>
          <Txt variant="caption" color="textSoft" style={{ marginTop: 12 }}>{activeCount} of {limits.watches} active watches</Txt>
          <View style={{ flexDirection: 'row', gap: 4, marginTop: 6 }}>
            {Array.from({ length: limits.watches }).map((_, i) => (
              <View key={i} style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: i < activeCount ? colors.accent : colors.lineStrong }} />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bottom: { flexDirection: 'row', borderTopWidth: 1, paddingTop: 10 },
  bottomItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, minHeight: 48 },
  side: { width: 256, height: '100%', borderRightWidth: 1, paddingHorizontal: 16, paddingVertical: 22, gap: 4 },
  sideItem: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 44, paddingHorizontal: 12, borderRadius: 12 },
  badge: { minWidth: 22, height: 22, paddingHorizontal: 6, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  account: { padding: 14, borderRadius: 16, borderWidth: 1 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
