import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Birdie } from '@/components/mascot/Birdie';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Brand, Colors } from '@/constants/theme';
import type { PersonType } from '@/db/types';
import { useBirdieData } from '@/hooks/use-birdie-data';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ageOnNextBirthday, formatLongDate, formatRelativeDays, nextOccurrence } from '@/lib/dates';
import { t } from '@/lib/i18n';

export default function BirthdayDetail() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { type, id } = useLocalSearchParams<{ type: PersonType; id: string }>();
  const numericId = Number(id);

  const { family, friends, upcoming, markBirthdaySent, unmarkBirthdaySent } = useBirdieData();

  const person = useMemo(() => {
    if (type === 'family') return family.find((m) => m.id === numericId);
    if (type === 'friend') return friends.find((f) => f.id === numericId);
    return undefined;
  }, [type, numericId, family, friends]);

  const upcomingItem = upcoming.find(
    (u) => u.personType === type && u.personId === numericId
  );

  if (!person) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text, padding: 20 }}>{t('screen.detail.notFound')}</Text>
      </SafeAreaView>
    );
  }

  const occurrence = nextOccurrence(person.birthday);
  const year = occurrence.getFullYear();
  const age = ageOnNextBirthday(person.birthday);
  const isToday = upcomingItem?.daysUntil === 0;
  const acked = upcomingItem?.acknowledgedThisYear ?? false;

  const onMarkSent = async () => {
    await markBirthdaySent(type as PersonType, numericId, year);
  };
  const onUnmark = async () => {
    await unmarkBirthdaySent(type as PersonType, numericId, year);
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <Birdie size={160} withConfetti={isToday} />
          <Text style={[styles.name, { color: colors.text }]}>{person.name}</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {isToday ? t('screen.detail.todayBanner') : formatRelativeDays(upcomingItem?.daysUntil ?? 0)}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Row label={t('screen.detail.nextBirthday')} value={formatLongDate(occurrence)} colors={colors} />
          {age !== null && <Row label={t('screen.detail.turning')} value={`${age}`} colors={colors} />}
          {type === 'friend' && upcomingItem?.assigneeNames.length ? (
            <Row label={t('screen.detail.friendOf')} value={upcomingItem.assigneeNames.join(', ')} colors={colors} />
          ) : null}
          {type === 'friend' && 'notes' in person && person.notes ? (
            <Row label={t('screen.detail.notes')} value={person.notes} colors={colors} />
          ) : null}
        </View>

        {isToday && !acked && (
          <PrimaryButton
            title={t('screen.detail.sentCta')}
            onPress={onMarkSent}
            style={{ backgroundColor: Brand.partyPink }}
          />
        )}
        {isToday && acked && (
          <View style={{ gap: 10 }}>
            <Text style={[styles.acked, { color: colors.success }]}>
              {t('screen.detail.sentAcked')}
            </Text>
            <PrimaryButton variant="ghost" title={t('screen.detail.undoCta')} onPress={onUnmark} />
          </View>
        )}

        <PrimaryButton variant="ghost" title={t('screen.detail.closeCta')} onPress={() => router.back()} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, gap: 20 },
  hero: { alignItems: 'center', gap: 4 },
  name: { fontSize: 26, fontWeight: '800' },
  subtitle: { fontSize: 16 },
  card: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    gap: 14,
  },
  row: { gap: 4 },
  rowLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  rowValue: { fontSize: 16 },
  acked: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
});
