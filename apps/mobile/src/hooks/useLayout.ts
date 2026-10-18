import { useWindowDimensions } from 'react-native';

/** Breakpoints: phones use the bottom tab bar; wide screens (web/tablets) get the sidebar and split views. */
export function useLayout() {
  const { width, height } = useWindowDimensions();
  return {
    width,
    height,
    isWide: width >= 900, // sidebar instead of bottom tabs
    isSplit: width >= 1100, // list + detail side by side
  };
}
