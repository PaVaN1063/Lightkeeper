import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { fonts } from '../theme/tokens';
import { Txt } from './Txt';

/** Simple "G" mark for the Google button. Swap for the official asset when wiring real Google sign-in. */
export function GoogleDot() {
  const { colors } = useTheme();
  return (
    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.invertText, alignItems: 'center', justifyContent: 'center' }}>
      <Txt style={{ fontFamily: fonts.bold, fontSize: 13, lineHeight: 16, color: colors.invertBg }}>G</Txt>
    </View>
  );
}
