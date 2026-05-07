import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Brand, Colors } from '@/constants/theme';
import { useBirdieData } from '@/hooks/use-birdie-data';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { t } from '@/lib/i18n';
import { type ParsedImport, getStagedImport, setStagedImport } from '@/lib/import';

export default function ImportReviewScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { family, createFamilyMember, createFriend } = useBirdieData();

  const [staged] = useState<ParsedImport | null>(() => getStagedImport());
  const [selectedFamily, setSelectedFamily] = useState<Set<number>>(new Set());
  const [selectedFriends, setSelectedFriends] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);

  const totalParsed = useMemo(
    () => (staged ? staged.family.length + staged.friends.length : 0),
    [staged]
  );

  if (!staged || totalParsed === 0) {
    return (
      <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.empty}>
          <Text style={[styles.title, { color: colors.text }]}>{t('screen.import.review.title')}</Text>
          <Text style={[styles.hint, { color: colors.textMuted }]}>{t('screen.import.review.noItems')}</Text>
          <PrimaryButton variant="ghost" title={t('screen.import.review.closeCta')} onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const toggleFamily = (idx: number) => {
    setSelectedFamily((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };
  const toggleFriend = (idx: number) => {
    setSelectedFriends((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const selectedCount = selectedFamily.size + selectedFriends.size;

  const onImport = async () => {
    if (selectedCount === 0 || importing) return;
    setImporting(true);
    try {
      const newFamilyByName = new Map<string, number>();
      for (const idx of selectedFamily) {
        const item = staged.family[idx];
        const created = await createFamilyMember({
          name: item.name,
          birthday: item.birthday,
          color: item.color,
        });
        newFamilyByName.set(item.name, created.id);
      }

      const allFamilyByName = new Map<string, number>();
      for (const m of family) allFamilyByName.set(m.name, m.id);
      for (const [name, id] of newFamilyByName) allFamilyByName.set(name, id);

      for (const idx of selectedFriends) {
        const item = staged.friends[idx];
        const assigneeIds = item.assigneeNames
          .map((n) => allFamilyByName.get(n))
          .filter((id): id is number => id !== undefined);
        await createFriend({
          name: item.name,
          birthday: item.birthday,
          notes: item.notes ?? null,
          assigneeIds,
        });
      }

      const importedCount = selectedCount;
      setStagedImport(null);
      Alert.alert(
        t('screen.import.review.successTitle'),
        t('screen.import.review.successBody', { count: importedCount }),
        [{ text: t('screen.import.review.closeCta'), onPress: () => router.back() }]
      );
    } catch (err) {
      Alert.alert(t('screen.settings.importErrorTitle'), String(err));
      setImporting(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>{t('screen.import.review.title')}</Text>
          <Text style={[styles.hint, { color: colors.textMuted }]}>
            {t('screen.import.review.subtitleParsed', { count: totalParsed })}
            {staged.ignored > 0
              ? ` · ${t('screen.import.review.subtitleIgnored', { count: staged.ignored })}`
              : ''}
          </Text>
        </View>

        {staged.family.length > 0 && (
          <Section title={t('screen.import.review.familyHeader')} colors={colors}>
            {staged.family.map((item, idx) => (
              <ImportRow
                key={`family-${idx}`}
                checked={item.isDuplicate || selectedFamily.has(idx)}
                disabled={item.isDuplicate}
                onToggle={() => toggleFamily(idx)}
                title={item.name}
                subtitle={item.birthday}
                badge={item.isDuplicate ? t('screen.import.review.alreadyExists') : null}
                accent={item.color}
                colors={colors}
              />
            ))}
          </Section>
        )}

        {staged.friends.length > 0 && (
          <Section title={t('screen.import.review.friendsHeader')} colors={colors}>
            {staged.friends.map((item, idx) => (
              <ImportRow
                key={`friend-${idx}`}
                checked={item.isDuplicate || selectedFriends.has(idx)}
                disabled={item.isDuplicate}
                onToggle={() => toggleFriend(idx)}
                title={item.name}
                subtitle={
                  item.assigneeNames.length > 0
                    ? `${item.birthday} · ${item.assigneeNames.join(', ')}`
                    : item.birthday
                }
                badge={item.isDuplicate ? t('screen.import.review.alreadyExists') : null}
                accent={Brand.sky}
                colors={colors}
              />
            ))}
          </Section>
        )}

        <PrimaryButton
          title={t('screen.import.review.importCta', { count: selectedCount })}
          onPress={onImport}
          disabled={selectedCount === 0 || importing}
        />
        <PrimaryButton variant="ghost" title={t('screen.import.review.closeCta')} onPress={() => router.back()} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  colors,
  children,
}: {
  title: string;
  colors: typeof Colors.light;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{title}</Text>
      <View style={{ gap: 8 }}>{children}</View>
    </View>
  );
}

type RowProps = {
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
  title: string;
  subtitle: string;
  badge: string | null;
  accent: string;
  colors: typeof Colors.light;
};

function ImportRow({ checked, disabled, onToggle, title, subtitle, badge, accent, colors }: RowProps) {
  return (
    <Pressable
      onPress={disabled ? undefined : onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: colors.surface,
          borderColor: checked ? accent : colors.border,
          borderWidth: checked ? 2 : 1,
          opacity: pressed && !disabled ? 0.85 : disabled ? 0.6 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.checkbox,
          {
            borderColor: checked ? accent : colors.border,
            backgroundColor: checked ? accent : 'transparent',
          },
        ]}
      >
        {checked && <Text style={styles.checkboxMark}>✓</Text>}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.rowSubtitle, { color: colors.textMuted }]} numberOfLines={1}>
          {subtitle}
        </Text>
        {badge ? <Text style={[styles.badge, { color: colors.accent }]}>{badge}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, gap: 18, paddingBottom: 40 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, gap: 12 },
  title: { fontSize: 24, fontWeight: '800' },
  hint: { fontSize: 14, lineHeight: 20, marginTop: 4 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxMark: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  rowTitle: { fontSize: 16, fontWeight: '700' },
  rowSubtitle: { fontSize: 13, marginTop: 2 },
  badge: { fontSize: 12, fontWeight: '700', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
});
