import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { UpcomingBirthday } from '@/db/types';
import { formatRelativeDays } from '@/lib/dates';

type Props = {
  item: UpcomingBirthday;
  onPress?: () => void;
};

export function BirthdayCard({ item, onPress }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const isToday = item.daysUntil === 0;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: isToday ? Brand.partyPink : colors.border,
          borderWidth: isToday ? 2 : 1,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: item.color }]}>
        <Text style={styles.avatarText}>{initials(item.name)}</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          {item.personType === 'friend' ? (
            <View style={[styles.tag, { backgroundColor: colors.accentSoft }]}>
              <Text style={[styles.tagText, { color: colors.accent }]}>friend</Text>
            </View>
          ) : (
            <View style={[styles.tag, { backgroundColor: '#FFF3C4' }]}>
              <Text style={[styles.tagText, { color: Brand.sunshineDeep }]}>family</Text>
            </View>
          )}
        </View>
        <Text style={[styles.subline, { color: colors.textMuted }]}>
          {isToday ? '🎂 Birthday today!' : formatRelativeDays(item.daysUntil)}
          {item.ageOnNext !== null ? ` · turning ${item.ageOnNext}` : ''}
        </Text>
        {item.assigneeNames.length > 0 && (
          <Text style={[styles.subline, { color: colors.textMuted }]} numberOfLines={1}>
            Friend of {item.assigneeNames.join(', ')}
          </Text>
        )}
        {item.acknowledgedThisYear && isToday && (
          <Text style={[styles.acked, { color: colors.success }]}>✓ Message sent</Text>
        )}
      </View>
    </Pressable>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    gap: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    flexShrink: 1,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subline: {
    fontSize: 13,
  },
  acked: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
});
