import React from 'react';
import { StyleProp, Text, TextProps, TextStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { ColorTokens, fonts } from '../theme/tokens';

type Variant = 'hero' | 'display' | 'title' | 'h2' | 'h3' | 'body' | 'bodyStrong' | 'small' | 'smallStrong' | 'caption' | 'overline' | 'button';

const variants: Record<Variant, TextStyle> = {
  hero: { fontFamily: fonts.display, fontSize: 36, lineHeight: 39, letterSpacing: -0.5 },
  display: { fontFamily: fonts.display, fontSize: 30, lineHeight: 34, letterSpacing: -0.4 },
  title: { fontFamily: fonts.display, fontSize: 28, lineHeight: 32, letterSpacing: -0.3 },
  h2: { fontFamily: fonts.display, fontSize: 24, lineHeight: 28, letterSpacing: -0.3 },
  h3: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 22 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 21 },
  small: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  smallStrong: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
  overline: { fontFamily: fonts.bold, fontSize: 13, lineHeight: 16, letterSpacing: 1, textTransform: 'uppercase' },
  button: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 20 },
};

type Props = TextProps & {
  variant?: Variant;
  color?: keyof ColorTokens;
  align?: TextStyle['textAlign'];
  style?: StyleProp<TextStyle>;
};

export function Txt({ variant = 'body', color = 'text', align, style, ...rest }: Props) {
  const { colors } = useTheme();
  return <Text {...rest} style={[variants[variant], { color: colors[color], textAlign: align }, style]} />;
}
