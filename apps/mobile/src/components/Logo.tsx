import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';
import { Txt } from './Txt';

/** The lighthouse mark, drawn as a stroke icon. */
export function LogoMark({ size = 26, color }: { size?: number; color?: string }) {
  const { colors } = useTheme();
  const c = color ?? colors.accentText;
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M13 13h6l2 15H11z" />
      <Path d="M12 13l4-5 4 5" />
      <Path d="M12.5 20.5h7" />
      <Path d="M4 9l6 2.5M28 9l-6 2.5" />
      <Path d="M7 28h18" />
    </Svg>
  );
}

export function Logo({ size = 18 }: { size?: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }} accessibilityRole="header">
      <LogoMark size={size + 8} />
      <Txt style={{ fontFamily: 'BricolageGrotesque_700Bold', fontSize: size, lineHeight: size + 4 }}>Lightkeeper</Txt>
    </View>
  );
}

/** Welcome-screen illustration: lighthouse at night with its beam. */
export function LighthouseHero({ size = 300 }: { size?: number }) {
  const { colors, scheme } = useTheme();
  const disk = scheme === 'dark' ? '#131C2F' : '#E7ECF6';
  const rock = scheme === 'dark' ? '#1F2B45' : '#C9D3E6';
  const wave1 = scheme === 'dark' ? '#3A4B70' : '#AEBBD4';
  const wave2 = scheme === 'dark' ? '#2A3756' : '#C9D3E6';
  return (
    <Svg width={size} height={size * 0.94} viewBox="0 0 320 300" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Circle cx={160} cy={150} r={138} fill={disk} />
      <Path d="M160 92 L20 40 L20 150 Z" fill={colors.beam} opacity={0.16} />
      <Path d="M160 92 L300 46 L300 140 Z" fill={colors.beam} opacity={0.26} />
      <Circle cx={78} cy={62} r={1.6} fill={colors.muted} />
      <Circle cx={248} cy={196} r={1.4} fill={colors.muted} />
      <Circle cx={214} cy={40} r={1.8} fill={colors.muted} />
      <Path d="M140 230 L146 110 L174 110 L180 230 Z" fill={colors.tower} stroke={scheme === 'light' ? '#C9D3E6' : 'none'} />
      <Path d="M143.5 170 L176.5 170 L178 196 L142 196 Z" fill={colors.stripe} />
      <Path d="M145 134 L175 134 L176 152 L144 152 Z" fill={colors.stripe} />
      <Rect x={146} y={88} width={28} height={22} rx={3} fill={colors.beam} />
      <Path d="M140 88 L160 70 L180 88 Z" fill={colors.tower} stroke={scheme === 'light' ? '#C9D3E6' : 'none'} />
      <Rect x={138} y={108} width={44} height={5} rx={2} fill={scheme === 'dark' ? '#2A3756' : '#8C9AB5'} />
      <Path d="M96 232 Q160 220 224 232 L240 250 L80 250 Z" fill={rock} />
      <Path d="M40 256 Q70 246 100 256 T160 256 T220 256 T280 256" stroke={wave1} strokeWidth={3} fill="none" strokeLinecap="round" />
      <Path d="M64 272 Q94 262 124 272 T184 272 T244 272" stroke={wave2} strokeWidth={3} fill="none" strokeLinecap="round" />
    </Svg>
  );
}
