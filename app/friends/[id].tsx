import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { AssigneePicker } from '@/components/birthday/AssigneePicker';
import { PersonForm, type PersonFormValues } from '@/components/birthday/PersonForm';
import { ModalScreen } from '@/components/ui/ModalScreen';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Colors } from '@/constants/theme';
import { useBirdieData } from '@/hooks/use-birdie-data';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function EditFriend() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { id } = useLocalSearchParams<{ id: string }>();
  const numericId = Number(id);
  const { friends, family, updateFriend, deleteFriend } = useBirdieData();
  const friend = useMemo(() => friends.find((f) => f.id === numericId), [friends, numericId]);

  const [values, setValues] = useState<PersonFormValues>({
    name: friend?.name ?? '',
    birthday: friend?.birthday ?? '',
    notes: friend?.notes ?? '',
  });
  const [valid, setValid] = useState(true);
  const [assigneeIds, setAssigneeIds] = useState<number[]>(friend?.assigneeIds ?? []);
  const [saving, setSaving] = useState(false);

  if (!friend) {
    return (
      <ModalScreen>
        <Text style={{ color: colors.text }}>Friend not found.</Text>
      </ModalScreen>
    );
  }

  const onSave = async () => {
    if (!valid || saving) return;
    setSaving(true);
    try {
      await updateFriend(friend.id, {
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

  const onDelete = () => {
    Alert.alert('Delete friend?', `${friend.name} will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteFriend(friend.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <ModalScreen>
      <Text style={[styles.title, { color: colors.text }]}>Edit friend</Text>
      <PersonForm
        initial={values}
        showNotes
        onChange={(next, isValid) => {
          setValues(next);
          setValid(isValid);
        }}
      />
      <AssigneePicker members={family} selectedIds={assigneeIds} onChange={setAssigneeIds} />
      <PrimaryButton title={saving ? 'Saving…' : 'Save changes'} onPress={onSave} disabled={!valid || saving} />
      <PrimaryButton variant="ghost" title="Delete" onPress={onDelete} />
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800' },
});
