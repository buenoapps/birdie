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
import { t } from '@/lib/i18n';

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
        <Text style={{ color: colors.text }}>{t('screen.friends.notFound')}</Text>
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
      Alert.alert(t('modal.saveErrorTitle'), String(err));
      setSaving(false);
    }
  };

  const onDelete = () => {
    Alert.alert(t('modal.deleteFriendTitle'), t('modal.deleteFriendBody', { name: friend.name }), [
      { text: t('modal.cancelCta'), style: 'cancel' },
      {
        text: t('modal.deleteCta'),
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
      <Text style={[styles.title, { color: colors.text }]}>{t('modal.editFriendTitle')}</Text>
      <PersonForm
        initial={values}
        showNotes
        onChange={(next, isValid) => {
          setValues(next);
          setValid(isValid);
        }}
      />
      <AssigneePicker members={family} selectedIds={assigneeIds} onChange={setAssigneeIds} />
      <PrimaryButton title={saving ? t('modal.savingCta') : t('modal.saveChangesCta')} onPress={onSave} disabled={!valid || saving} />
      <PrimaryButton variant="ghost" title={t('modal.deleteCta')} onPress={onDelete} />
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800' },
});
