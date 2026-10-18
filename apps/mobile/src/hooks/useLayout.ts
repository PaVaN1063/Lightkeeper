import { useState } from 'react';
import { LayoutChangeEvent, Platform, useWindowDimensions } from 'react-native';

export const isWeb = Platform.OS === 'web';

/**
 * Breakpoints.
 * - Phones (and phone-width browsers): bottom tab bar, floating + button.
 * - 768px+ : sidebar navigation (laptops, tablets, desktop browsers).
 * - 1100px+: watch list and watch details side by side.
 */
export function useLayout() {
  const { width, height } = useWindowDimensions();
  return {
    width,
    height,
    isWide: width >= 768,
    isSplit: width >= 1100,
    sidebarWidth: width >= 1200 ? 256 : 220,
  };
}

/**
 * Responsive grid: measures its container and works out how many columns fit.
 * Use `onLayout` on the grid container and give each item `itemStyle`.
 */
export function useGrid(minItemWidth: number, gap = 12) {
  const [containerWidth, setContainerWidth] = useState(0);
  const columns = containerWidth > 0 ? Math.max(1, Math.floor((containerWidth + gap) / (minItemWidth + gap))) : 1;
  const itemWidth = containerWidth > 0 ? (containerWidth - gap * (columns - 1)) / columns : undefined;
  return {
    columns,
    gap,
    onLayout: (e: LayoutChangeEvent) => {
      const w = Math.floor(e.nativeEvent.layout.width);
      if (w !== containerWidth) setContainerWidth(w);
    },
    containerStyle: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap },
    itemStyle: itemWidth ? { width: itemWidth } : { width: '100%' as const },
  };
}
