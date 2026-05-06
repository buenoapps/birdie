/**
 * Pure scheduler: given a birthday occurrence date and an hour window, produce
 * the list of trigger Dates for hourly notifications. Past hours (relative to
 * `now`) are filtered out so re-runs don't try to schedule stale triggers.
 */

import { nextOccurrence } from './dates';

export type ScheduleWindow = {
  startHour: number; // inclusive, 0-23
  endHour: number; // inclusive, 0-23
};

export const DEFAULT_WINDOW: ScheduleWindow = { startHour: 8, endHour: 21 };

/**
 * Hourly triggers on the next occurrence of `birthday`, between window hours.
 * Only returns Dates strictly after `now`.
 */
export function buildHourlyTriggers(
  birthday: string,
  now: Date = new Date(),
  window: ScheduleWindow = DEFAULT_WINDOW
): Date[] {
  if (window.startHour > window.endHour) return [];
  const occurrence = nextOccurrence(birthday, now);
  const triggers: Date[] = [];
  for (let hour = window.startHour; hour <= window.endHour; hour++) {
    const trigger = new Date(
      occurrence.getFullYear(),
      occurrence.getMonth(),
      occurrence.getDate(),
      hour,
      0,
      0,
      0
    );
    if (trigger.getTime() > now.getTime()) {
      triggers.push(trigger);
    }
  }
  return triggers;
}

/**
 * Stable identifier for a single notification. Used so re-running sync is
 * idempotent — we can detect already-scheduled notifications and cancel
 * orphaned ones.
 */
export function notificationIdFor(
  personType: 'family' | 'friend',
  personId: number,
  trigger: Date
): string {
  const yyyy = trigger.getFullYear();
  const mm = String(trigger.getMonth() + 1).padStart(2, '0');
  const dd = String(trigger.getDate()).padStart(2, '0');
  const hh = String(trigger.getHours()).padStart(2, '0');
  return `birthday-${personType}-${personId}-${yyyy}${mm}${dd}-${hh}`;
}

export const NOTIFICATION_ID_PREFIX = 'birthday-';

export function parseNotificationId(
  id: string
): { personType: 'family' | 'friend'; personId: number; year: number } | null {
  // birthday-{type}-{id}-{yyyymmdd}-{hh}
  const match = /^birthday-(family|friend)-(\d+)-(\d{4})\d{4}-\d{2}$/.exec(id);
  if (!match) return null;
  return {
    personType: match[1] as 'family' | 'friend',
    personId: Number(match[2]),
    year: Number(match[3]),
  };
}
