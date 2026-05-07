/**
 * Pure date helpers used across the app. Birthday is stored as YYYY-MM-DD.
 * If the year is unknown, callers can pass `0000` (we still compute occurrences
 * but skip age).
 */

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export type ParsedBirthday = {
  year: number | null;
  month: number; // 1-12
  day: number; // 1-31
};

export function parseBirthday(value: string): ParsedBirthday {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new Error(`Invalid birthday string: ${value}`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    throw new Error(`Invalid birthday string: ${value}`);
  }
  return { year: year === 0 ? null : year, month, day };
}

export function formatBirthday(p: ParsedBirthday): string {
  const yyyy = String(p.year ?? 0).padStart(4, '0');
  const mm = String(p.month).padStart(2, '0');
  const dd = String(p.day).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Build a Date for the next occurrence of the given month/day on or after `from`.
 * Feb 29 in non-leap years is observed on Mar 1.
 */
export function nextOccurrence(birthday: string, from: Date = new Date()): Date {
  const { month, day } = parseBirthday(birthday);
  const today = startOfLocalDay(from);

  const buildFor = (year: number): Date => {
    if (month === 2 && day === 29 && !isLeapYear(year)) {
      return new Date(year, 2, 1); // Mar 1
    }
    return new Date(year, month - 1, day);
  };

  let candidate = buildFor(today.getFullYear());
  if (candidate.getTime() < today.getTime()) {
    candidate = buildFor(today.getFullYear() + 1);
  }
  return candidate;
}

export function daysUntil(birthday: string, from: Date = new Date()): number {
  const next = nextOccurrence(birthday, from);
  const today = startOfLocalDay(from);
  return Math.round((next.getTime() - today.getTime()) / ONE_DAY_MS);
}

/**
 * Age the person will turn at their next occurrence. Returns null if the
 * birth year is unknown.
 */
export function ageOnNextBirthday(birthday: string, from: Date = new Date()): number | null {
  const { year } = parseBirthday(birthday);
  if (year === null) return null;
  const next = nextOccurrence(birthday, from);
  return next.getFullYear() - year;
}

/**
 * True if the next occurrence of this birthday is *today*.
 */
export function isBirthdayToday(birthday: string, from: Date = new Date()): boolean {
  return daysUntil(birthday, from) === 0;
}

/**
 * Bucket label for grouping in lists.
 */
export function bucketFor(daysAway: number): 'today' | 'thisWeek' | 'thisMonth' | 'later' {
  if (daysAway === 0) return 'today';
  if (daysAway <= 7) return 'thisWeek';
  if (daysAway <= 31) return 'thisMonth';
  return 'later';
}

import { t } from './i18n';

export function formatRelativeDays(daysAway: number): string {
  if (daysAway === 0) return t('date.today');
  if (daysAway === 1) return t('date.tomorrow');
  if (daysAway < 7) return t('date.inDays', { count: daysAway });
  if (daysAway < 14) return t('date.nextWeek');
  if (daysAway < 31) return t('date.inDays', { count: daysAway });
  if (daysAway < 60) return t('date.nextMonth');
  return t('date.inDays', { count: daysAway });
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function formatLongDate(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}
