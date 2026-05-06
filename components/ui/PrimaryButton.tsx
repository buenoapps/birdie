import { Pressable, StyleSheet, Text, type PressableProps, type ViewStyle } from 'react-native';

import { Brand, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = Omit<PressableProps, 'style'> & {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: ViewStyle;
};

export function PrimaryButton({ title, variant = 'primary', style, ...rest }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const palette = {
    primary: { bg: Brand.partyPink, fg: '#FFFFFF' },
    secondary: { bg: Brand.sunshine, fg: Brand.ink },
    ghost: { bg: 'transparent', fg: colors.text },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: palette.bg, opacity: pressed ? 0.85 : 1 },
        variant === 'ghost' && { borderWidth: 1, borderColor: colors.border },
        style,
      ]}
      {...rest}
    >
      <Text style={[styles.label, { color: palette.fg }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
});
