import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { AssigneePicker } from '@/components/birthday/AssigneePicker';
import { PersonForm, type PersonFormValues } from '@/components/birthday/PersonForm';
import { ModalScreen } from '@/components/ui/ModalScreen';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Colors } from '@/constants/theme';
import { useBirdieData } from '@/hooks/use-birdie-data';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function NewFriend() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { family, createFriend } = useBirdieData();

  const [values, setValues] = useState<PersonFormValues>({ name: '', birthday: '', notes: '' });
  const [valid, setValid] = useState(false);
  const [assigneeIds, setAssigneeIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    if (!valid || saving) return;
    setSaving(true);
    try {
      await createFriend({
        name: values.name,
        birthday: values.birthday,
        notes: values.notes ?? null,
        assigneeIds,
      });
      router.back();
    } catch (err) {
      Alert.alert('Could not save', String(err));
      setSaving(false);
    }
  };

  return (
    <ModalScreen>
      <Text style={[styles.title, { color: colors.text }]}>New friend</Text>
      <PersonForm
        initial={values}
        showNotes
        onChange={(next, isValid) => {
          setValues(next);
          setValid(isValid);
        }}
      />
      <AssigneePicker members={family} selectedIds={assigneeIds} onChange={setAssigneeIds} />
      <PrimaryButton title={saving ? 'Saving…' : 'Save'} onPress={onSave} disabled={!valid || saving} />
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800' },
});
