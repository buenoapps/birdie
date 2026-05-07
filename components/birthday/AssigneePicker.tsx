import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { FamilyMember } from '@/db/types';
import { t } from '@/lib/i18n';

type Props = {
  members: FamilyMember[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
};

export function AssigneePicker({ members, selectedIds, onChange }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  if (members.length === 0) {
    return (
      <View>
        <Text style={[styles.label, { color: colors.textMuted }]}>{t('form.assigneesLabel')}</Text>
        <Text style={[styles.empty, { color: colors.textMuted }]}>
          {t('form.assigneesEmpty')}
        </Text>
      </View>
    );
  }

  const toggle = (id: number) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{t('form.assigneesLabel')}</Text>
      <View style={styles.chips}>
        {members.map((m) => {
          const selected = selectedIds.includes(m.id);
          return (
            <Pressable
              key={m.id}
              onPress={() => toggle(m.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? m.color : colors.surface,
                  borderColor: selected ? m.color : colors.border,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: selected ? '#FFFFFF' : colors.text }]}>
                {m.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  label: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: { fontSize: 14, fontWeight: '600' },
  empty: { fontSize: 14, lineHeight: 20 },
});
