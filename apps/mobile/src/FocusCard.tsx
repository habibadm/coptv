import type { ReactNode } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from './theme';

interface Props {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
  hasTVPreferredFocus?: boolean;
}

/** Tarjeta que se toca en el teléfono y se selecciona con el control remoto en la TV (se agranda y se marca). */
export function FocusCard({ onPress, style, children, hasTVPreferredFocus }: Props) {
  return (
    <Pressable
      onPress={onPress}
      hasTVPreferredFocus={hasTVPreferredFocus}
      style={({ focused }) => [style, focused && styles.focused]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  focused: {
    transform: [{ scale: 1.08 }],
    borderColor: colors.focus,
    borderWidth: 3,
    zIndex: 1,
  },
});
