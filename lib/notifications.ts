import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { acknowledgmentsRepo } from '@/db/repositories/acknowledgments';
import { familyRepo } from '@/db/repositories/family';
import { friendsRepo } from '@/db/repositories/friends';
import type { PersonType } from '@/db/types';

import { daysUntil, nextOccurrence } from './dates';
import {
  DEFAULT_WINDOW,
  NOTIFICATION_ID_PREFIX,
  buildHourlyTriggers,
  notificationIdFor,
  parseNotificationId,
} from './scheduler';

const ANDROID_CHANNEL = 'birthday-reminders';
const SYNC_HORIZON_DAYS = 14;

let handlerInstalled = false;

export function installNotificationHandler() {
  if (handlerInstalled) return;
  handlerInstalled = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function ensurePermissions(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const result = await Notifications.requestPermissionsAsync();
  return result.granted;
}

export async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL, {
    name: 'Birthday reminders',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
  });
}

type ScheduledItem = {
  id: string;
  personType: PersonType;
  personId: number;
  year: number;
  trigger: Date;
  title: string;
  body: string;
};

async function buildPlannedSchedule(now: Date): Promise<ScheduledItem[]> {
  const [family, friends] = await Promise.all([familyRepo.list(), friendsRepo.list()]);
  const planned: ScheduledItem[] = [];

  const considerPerson = async (
    personType: PersonType,
    personId: number,
    name: string,
    birthday: string
  ) => {
    const days = daysUntil(birthday, now);
    if (days < 0 || days > SYNC_HORIZON_DAYS) return;
    const occurrence = nextOccurrence(birthday, now);
    const year = occurrence.getFullYear();
    const acknowledged = await acknowledgmentsRepo.isAcknowledged(personType, personId, year);
    if (acknowledged) return;
    const triggers = buildHourlyTriggers(birthday, now, DEFAULT_WINDOW);
    for (const trigger of triggers) {
      planned.push({
        id: notificationIdFor(personType, personId, trigger),
        personType,
        personId,
        year,
        trigger,
        title: `🎂 It's ${name}'s birthday!`,
        body: 'Tap when you\'ve sent your birthday wishes — Birdie will stop nudging.',
      });
    }
  };

  for (const member of family) {
    await considerPerson('family', member.id, member.name, member.birthday);
  }
  for (const friend of friends) {
    await considerPerson('friend', friend.id, friend.name, friend.birthday);
  }
  return planned;
}

/**
 * Reconcile planned vs. existing scheduled notifications. Cancels stale ones,
 * schedules missing ones. Idempotent — safe to call repeatedly.
 */
export async function syncBirthdayNotifications(now: Date = new Date()): Promise<void> {
  const granted = await ensurePermissions();
  if (!granted) return;
  await ensureAndroidChannel();

  const planned = await buildPlannedSchedule(now);
  const plannedIds = new Set(planned.map((p) => p.id));

  const existing = await Notifications.getAllScheduledNotificationsAsync();
  const existingBirthdayIds = new Set<string>();
  for (const item of existing) {
    if (typeof item.identifier === 'string' && item.identifier.startsWith(NOTIFICATION_ID_PREFIX)) {
      existingBirthdayIds.add(item.identifier);
      if (!plannedIds.has(item.identifier)) {
        await Notifications.cancelScheduledNotificationAsync(item.identifier);
      }
    }
  }

  for (const item of planned) {
    if (existingBirthdayIds.has(item.id)) continue;
    await Notifications.scheduleNotificationAsync({
      identifier: item.id,
      content: {
        title: item.title,
        body: item.body,
        data: {
          personType: item.personType,
          personId: item.personId,
          year: item.year,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: item.trigger,
        channelId: Platform.OS === 'android' ? ANDROID_CHANNEL : undefined,
      },
    });
  }
}

/**
 * Cancel every pending notification for one person+year (called when user
 * taps "I sent a message!").
 */
export async function cancelForPerson(
  personType: PersonType,
  personId: number,
  year: number
): Promise<void> {
  const existing = await Notifications.getAllScheduledNotificationsAsync();
  for (const item of existing) {
    const parsed = typeof item.identifier === 'string' ? parseNotificationId(item.identifier) : null;
    if (parsed && parsed.personType === personType && parsed.personId === personId && parsed.year === year) {
      await Notifications.cancelScheduledNotificationAsync(item.identifier);
    }
  }
}
