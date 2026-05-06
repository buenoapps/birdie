import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/ui/EmptyState';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Brand, Colors } from '@/constants/theme';
import { useBirdieData } from '@/hooks/use-birdie-data';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ageOnNextBirthday, daysUntil, formatRelativeDays } from '@/lib/dates';

export default function FamilyTab() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { family } = useBirdieData();

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Family</Text>
        <Pressable
          onPress={() => router.push('/family/new' as never)}
          accessibilityRole="button"
          accessibilityLabel="Add family member"
          style={[styles.fab, { backgroundColor: Brand.partyPink }]}
        >
          <IconSymbol name="plus" size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      {family.length === 0 ? (
        <View style={styles.empty}>
          <EmptyState
            title="Add your family"
            body="Start by adding the people in your household — kids, partner, parents."
          />
          <View style={{ alignItems: 'center', marginTop: 8 }}>
            <PrimaryButton title="Add a family member" onPress={() => router.push('/family/new' as never)} />
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {family.map((member) => {
            const age = ageOnNextBirthday(member.birthday);
            const days = daysUntil(member.birthday);
            return (
              <Pressable
                key={member.id}
                onPress={() => router.push(`/family/${member.id}` as never)}
                style={({ pressed }) => [
                  styles.row,
                  { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.9 : 1 },
                ]}
              >
                <View style={[styles.dot, { backgroundColor: member.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowName, { color: colors.text }]}>{member.name}</Text>
                  <Text style={[styles.rowSub, { color: colors.textMuted }]}>
                    {formatRelativeDays(days)}
                    {age !== null ? ` · turning ${age}` : ''}
                  </Text>
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
