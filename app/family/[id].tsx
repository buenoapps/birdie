import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { ColorPicker, PersonForm, type PersonFormValues } from '@/components/birthday/PersonForm';
import { ModalScreen } from '@/components/ui/ModalScreen';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Brand, Colors } from '@/constants/theme';
import { useBirdieData } from '@/hooks/use-birdie-data';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { t } from '@/lib/i18n';

export default function EditFamilyMember() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { id } = useLocalSearchParams<{ id: string }>();
  const numericId = Number(id);
  const { family, updateFamilyMember, deleteFamilyMember } = useBirdieData();
  const member = useMemo(() => family.find((m) => m.id === numericId), [family, numericId]);

  const [values, setValues] = useState<PersonFormValues>({
    name: member?.name ?? '',
    birthday: member?.birthday ?? '',
  });
  const [valid, setValid] = useState(true);
  const [color, setColor] = useState(member?.color ?? Brand.partyPink);
  const [saving, setSaving] = useState(false);

  if (!member) {
    return (
      <ModalScreen>
        <Text style={{ color: colors.text }}>{t('screen.family.notFound')}</Text>
      </ModalScreen>
    );
  }

  const onSave = async () => {
    if (!valid || saving) return;
    setSaving(true);
    try {
      await updateFamilyMember(member.id, { name: values.name, birthday: values.birthday, color });
      router.back();
    } catch (err) {
      Alert.alert(t('modal.saveErrorTitle'), String(err));
      setSaving(false);
    }
  };

  const onDelete = () => {
    Alert.alert(t('modal.deleteFamilyTitle'), t('modal.deleteFamilyBody', { name: member.name }), [
      { text: t('modal.cancelCta'), style: 'cancel' },
      {
        text: t('modal.deleteCta'),
        style: 'destructive',
        onPress: async () => {
          await deleteFamilyMember(member.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <ModalScreen>
      <Text style={[styles.title, { color: colors.text }]}>{t('modal.editFamilyTitle')}</Text>
      <PersonForm
        initial={values}
        onChange={(next, isValid) => {
          setValues(next);
          setValid(isValid);
        }}
      />
      <View style={{ gap: 6 }}>
        <Text style={[styles.label, { color: colors.textMuted }]}>{t('form.colorLabel')}</Text>
        <ColorPicker value={color} onChange={setColor} />
      </View>
      <PrimaryButton title={saving ? t('modal.savingCta') : t('modal.saveChangesCta')} onPress={onSave} disabled={!valid || saving} />
      <PrimaryButton variant="ghost" title={t('modal.deleteCta')} onPress={onDelete} />
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800' },
  label: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
});
