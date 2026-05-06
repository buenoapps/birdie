import { StyleSheet, Text, View } from 'react-native';

import { Birdie } from '@/components/mascot/Birdie';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = {
  title: string;
  body?: string;
};

export function EmptyState({ title, body }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  return (
    <View style={styles.container}>
      <Birdie size={140} />
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {body ? <Text style={[styles.body, { color: colors.textMuted }]}>{body}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
  },
  body: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
});
