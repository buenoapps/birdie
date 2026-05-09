import { useRouter, useScrollToTop } from 'expo-router';
import { useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/ui/EmptyState';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Brand, Colors } from '@/constants/theme';
import { useBirdieData } from '@/hooks/use-birdie-data';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ageOnNextBirthday, daysUntil, formatRelativeDays } from '@/lib/dates';
import { t } from '@/lib/i18n';

export default function FriendsTab() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { friends, family } = useBirdieData();
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);

  const memberById = new Map(family.map((m) => [m.id, m]));

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t('screen.friends.title')}</Text>
        <Pressable
          onPress={() => router.push('/friends/new' as never)}
          accessibilityRole="button"
          accessibilityLabel={t('screen.friends.addAccessibility')}
          style={[styles.fab, { backgroundColor: Brand.partyPink }]}
        >
          <IconSymbol name="plus" size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      {friends.length === 0 ? (
        <View style={styles.empty}>
          <EmptyState
            title={t('screen.friends.emptyTitle')}
            body={t('screen.friends.emptyBody')}
          />
          <View style={{ alignItems: 'center', marginTop: 8 }}>
            <PrimaryButton title={t('screen.friends.addCta')} onPress={() => router.push('/friends/new' as never)} />
          </View>
        </View>
      ) : (
        <ScrollView ref={scrollRef} contentContainerStyle={styles.list}>
          {friends.map((friend) => {
            const age = ageOnNextBirthday(friend.birthday);
            const days = daysUntil(friend.birthday);
            const assignees = friend.assigneeIds
              .map((id) => memberById.get(id)?.name)
              .filter(Boolean)
              .join(', ');
            return (
              <Pressable
                key={friend.id}
                onPress={() => router.push(`/friends/${friend.id}` as never)}
                style={({ pressed }) => [
                  styles.row,
                  { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.9 : 1 },
                ]}
              >
                <View style={[styles.dot, { backgroundColor: Brand.sky }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowName, { color: colors.text }]}>{friend.name}</Text>
                  <Text style={[styles.rowSub, { color: colors.textMuted }]}>
                    {formatRelativeDays(days)}
                    {age !== null ? ` · ${t('card.turningSuffix', { age })}` : ''}
                  </Text>
                  {assignees ? (
                    <Text style={[styles.rowSub, { color: colors.textMuted }]} numberOfLines={1}>
                      {t('screen.friends.friendOfPrefix', { names: assignees })}
                    </Text>
                  ) : null}
                </View>
                <IconSymbol name="chevron.right" size={18} color={colors.icon as string} />
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: { fontSize: 28, fontWeight: '800' },
  fab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { padding: 20, paddingTop: 8, gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  dot: { width: 12, height: 12, borderRadius: 6 },
  rowName: { fontSize: 17, fontWeight: '700' },
  rowSub: { fontSize: 13, marginTop: 2 },
  empty: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
});
