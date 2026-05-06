import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Brand, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { parseBirthday } from '@/lib/dates';

export type PersonFormValues = {
  name: string;
  birthday: string; // YYYY-MM-DD
  notes?: string;
};

type Props = {
  initial?: Partial<PersonFormValues>;
  showNotes?: boolean;
  onChange: (values: PersonFormValues, isValid: boolean) => void;
};

export function PersonForm({ initial, showNotes, onChange }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const [name, setName] = useState(initial?.name ?? '');
  const [birthday, setBirthday] = useState(initial?.birthday ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const validate = (next: { name: string; birthday: string }) => {
    const trimmed = next.name.trim();
    let validBirthday = false;
    try {
      parseBirthday(next.birthday);
      validBirthday = true;
    } catch {
      validBirthday = false;
    }
    return trimmed.length > 0 && validBirthday;
  };

  const propagate = (n: string, b: string, note: string) => {
    onChange({ name: n.trim(), birthday: b, notes: note }, validate({ name: n, birthday: b }));
  };

  return (
    <View style={styles.container}>
      <Field label="Name" colors={colors}>
        <TextInput
          value={name}
          onChangeText={(v) => {
            setName(v);
            propagate(v, birthday, notes);
          }}
          placeholder="e.g. Max"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        />
      </Field>

      <Field label="Birthday (YYYY-MM-DD)" colors={colors}>
        <TextInput
          value={birthday}
          onChangeText={(v) => {
            setBirthday(v);
            propagate(name, v, notes);
          }}
          placeholder="2018-08-23"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        />
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          Use 0000 for the year if you don&apos;t know it (e.g. 0000-08-23).
        </Text>
      </Field>

      {showNotes && (
        <Field label="Notes (optional)" colors={colors}>
          <TextInput
            value={notes}
            onChangeText={(v) => {
              setNotes(v);
              propagate(name, birthday, v);
            }}
            placeholder="Loves dinosaurs, allergic to peanuts…"
            placeholderTextColor={colors.textMuted}
            multiline
            style={[
              styles.input,
              styles.multiline,
              { color: colors.text, borderColor: colors.border },
            ]}
          />
        </Field>
      )}
    </View>
  );
}

function Field({
  label,
  colors,
  children,
}: {
  label: string;
  colors: typeof Colors.light;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      {children}
    </View>
  );
}

export const ColorPicker = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) => {
  const swatches = [
    Brand.partyPink,
    Brand.sunshineDeep,
    Brand.sky,
    Brand.mint,
    '#B68CFF',
    '#FF8E5C',
  ];
  return (
    <View style={swatchStyles.row}>
      {swatches.map((color) => (
        <Pressable
          key={color}
          onPress={() => onChange(color)}
          accessibilityRole="button"
          accessibilityLabel={`Select color ${color}`}
          style={[
            swatchStyles.swatch,
            { backgroundColor: color },
            value === color && swatchStyles.selected,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 16 },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  hint: { fontSize: 12 },
});

const swatchStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: '#000',
  },
});
