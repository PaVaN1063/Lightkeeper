// Colour tokens for both themes. Screens never use raw hex values:
// they read `colors.<token>` from useTheme(), so light and dark stay in sync.

export type ColorTokens = {
  bg: string;
  surface: string;
  surface2: string;
  sunken: string;
  nav: string;
  line: string;
  lineStrong: string;
  text: string;
  textSoft: string;
  muted: string;
  accent: string;
  onAccent: string;
  accentText: string;
  accentSoftBg: string;
  accentSoftBorder: string;
  teal: string;
  tealBg: string;
  tealText: string;
  pausedBg: string;
  pausedText: string;
  danger: string;
  dangerBg: string;
  dangerBorder: string;
  invertBg: string;
  invertText: string;
  backdrop: string;
  beam: string;
  tower: string;
  stripe: string;
};

export const dark: ColorTokens = {
  bg: '#0B1220',
  surface: '#141D30',
  surface2: '#1C2740',
  sunken: '#11192A',
  nav: '#0F1828',
  line: '#27344F',
  lineStrong: '#33415F',
  text: '#EEF2F8',
  textSoft: '#C7D1E4',
  muted: '#9AA8C2',
  accent: '#FFB547',
  onAccent: '#1A1204',
  accentText: '#FFB547',
  accentSoftBg: '#1E2537',
  accentSoftBorder: '#4A3D22',
  teal: '#5BD6C3',
  tealBg: '#173B3A',
  tealText: '#7FE6D6',
  pausedBg: '#222B3E',
  pausedText: '#B4BFD3',
  danger: '#FF9A8B',
  dangerBg: '#1E1618',
  dangerBorder: '#4A2A2A',
  invertBg: '#EEF2F8',
  invertText: '#0B1220',
  backdrop: 'rgba(5, 9, 18, 0.72)',
  beam: '#FFB547',
  tower: '#EEF2F8',
  stripe: '#E2583E',
};

export const light: ColorTokens = {
  bg: '#F5F6FA',
  surface: '#FFFFFF',
  surface2: '#EEF1F7',
  sunken: '#F0F2F8',
  nav: '#FFFFFF',
  line: '#DFE4EE',
  lineStrong: '#C9D1E0',
  text: '#0E1726',
  textSoft: '#34405A',
  muted: '#5E6B85',
  accent: '#FFB547',
  onAccent: '#1A1204',
  accentText: '#9A5B00',
  accentSoftBg: '#FFF6E6',
  accentSoftBorder: '#F2C77A',
  teal: '#1BA88F',
  tealBg: '#DDF5F0',
  tealText: '#0B6B5B',
  pausedBg: '#ECEFF5',
  pausedText: '#4E5A72',
  danger: '#C23A26',
  dangerBg: '#FDEDEA',
  dangerBorder: '#F3C2B9',
  invertBg: '#0E1726',
  invertText: '#FFFFFF',
  backdrop: 'rgba(14, 23, 38, 0.45)',
  beam: '#FFB547',
  tower: '#FFFFFF',
  stripe: '#E2583E',
};

export const radius = { sm: 10, md: 14, lg: 20, xl: 24, pill: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };

export const fonts = {
  display: 'BricolageGrotesque_800ExtraBold',
  displayBold: 'BricolageGrotesque_700Bold',
  regular: 'Figtree_400Regular',
  medium: 'Figtree_500Medium',
  semibold: 'Figtree_600SemiBold',
  bold: 'Figtree_700Bold',
};
