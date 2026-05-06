import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BirthdayCard } from '@/components/birthday/BirthdayCard';
import { BirdieHead } from '@/components/mascot/BirdieHead';
import { EmptyState } from '@/components/ui/EmptyState';
import { Colors } from '@/constants/theme';
import type { UpcomingBirthday } from '@/db/types';
import { useBirdieData } from '@/hooks/use-birdie-data';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { bucketFor } from '@/lib/dates';

const SECTION_LABELS: Record<ReturnType<typeof bucketFor>, string> = {
  today: '🎉 Today',
  thisWeek: 'This week',
  thisMonth: 'This month',
  later: 'Later',
};

export default function UpcomingScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { upcoming, ready } = useBirdieData();

  const sections = useMemo(() => groupByBucket(upcoming), [upcoming]);

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <BirdieHead size={56} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>Birdie</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Never miss a birthday again
          </Text>
        </View>
      </View>

      {ready && upcoming.length === 0 ? (
        <View style={styles.empty}>
          <EmptyState
            title="No birthdays yet"
            body="Add your family in the Family tab, then start adding their friends."
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {sections.map(({ key, items }) => (
            <View key={key} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
                {SECTION_LABELS[key]}
              </Text>
              <View style={{ gap: 10 }}>
                {items.map((item) => (
                  <BirthdayCard
                    key={`${item.personType}-${item.personId}`}
                    item={item}
                    onPress={() =>
                      router.push(`/birthday/${item.personType}/${item.personId}` as never)
                    }
                  />
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function groupByBucket(items: UpcomingBirthday[]) {
  const order: ReturnType<typeof bucketFor>[] = ['today', 'thisWeek', 'thisMonth', 'later'];
  const grouped = new Map<ReturnType<typeof bucketFor>, UpcomingBirthday[]>();
  for (const item of items) {
    const key = bucketFor(item.daysUntil);
    const list = grouped.get(key) ?? [];
    list.push(item);
    grouped.set(key, list);
  }
  return order
    .filter((k) => (grouped.get(k)?.length ?? 0) > 0)
    .map((key) => ({ key, items: grouped.get(key)! }));
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 14, marginTop: 2 },
  list: { padding: 20, paddingTop: 8, gap: 24 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  empty: { flex: 1, justifyContent: 'center' },
});
