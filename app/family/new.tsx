import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { ColorPicker, PersonForm, type PersonFormValues } from '@/components/birthday/PersonForm';
import { ModalScreen } from '@/components/ui/ModalScreen';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Brand, Colors } from '@/constants/theme';
import { useBirdieData } from '@/hooks/use-birdie-data';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function NewFamilyMember() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { createFamilyMember } = useBirdieData();

  const [values, setValues] = useState<PersonFormValues>({ name: '', birthday: '' });
  const [valid, setValid] = useState(false);
  const [color, setColor] = useState(Brand.partyPink);
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    if (!valid || saving) return;
    setSaving(true);
    try {
      await createFamilyMember({ name: values.name, birthday: values.birthday, color });
      router.back();
    } catch (err) {
      Alert.alert('Could not save', String(err));
      setSaving(false);
    }
  };

  return (
    <ModalScreen>
      <Text style={[styles.title, { color: colors.text }]}>New family member</Text>
      <PersonForm
        initial={values}
        onChange={(next, isValid) => {
          setValues(next);
          setValid(isValid);
        }}
      />
      <View style={{ gap: 6 }}>
        <Text style={[styles.label, { color: colors.textMuted }]}>Color</Text>
        <ColorPicker value={color} onChange={setColor} />
      </View>
      <PrimaryButton title={saving ? 'Saving…' : 'Save'} onPress={onSave} disabled={!valid || saving} />
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800' },
  label: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
});
