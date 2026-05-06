import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ColorPicker, PersonForm, type PersonFormValues } from '@/components/birthday/PersonForm';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Brand, Colors } from '@/constants/theme';
import { useBirdieData } from '@/hooks/use-birdie-data';
import { useColorScheme } from '@/hooks/use-color-scheme';

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
      <View style={[styles.container, { backgroundColor: colors.background, padding: 20 }]}>
        <Text style={{ color: colors.text }}>Family member not found.</Text>
      </View>
    );
  }

  const onSave = async () => {
    if (!valid || saving) return;
    setSaving(true);
    try {
      await updateFamilyMember(member.id, { name: values.name, birthday: values.birthday, color });
      router.back();
    } catch (err) {
      Alert.alert('Could not save', String(err));
      setSaving(false);
    }
  };

  const onDelete = () => {
    Alert.alert('Delete family member?', `${member.name} and all friend assignments will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteFamilyMember(member.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: colors.text }]}>Edit family member</Text>
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
        <PrimaryButton title={saving ? 'Saving…' : 'Save changes'} onPress={onSave} disabled={!valid || saving} />
        <PrimaryButton variant="ghost" title="Delete" onPress={onDelete} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, gap: 18 },
  title: { fontSize: 24, fontWeight: '800' },
  label: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
});
