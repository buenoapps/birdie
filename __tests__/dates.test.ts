import {
  ageOnNextBirthday,
  bucketFor,
  daysUntil,
  formatRelativeDays,
  isBirthdayToday,
  nextOccurrence,
  parseBirthday,
} from '@/lib/dates';

describe('parseBirthday', () => {
  it('parses YYYY-MM-DD with year', () => {
    expect(parseBirthday('1990-08-23')).toEqual({ year: 1990, month: 8, day: 23 });
  });

  it('treats year 0000 as unknown', () => {
    expect(parseBirthday('0000-08-23')).toEqual({ year: null, month: 8, day: 23 });
  });

  it('rejects malformed input', () => {
    expect(() => parseBirthday('1990/08/23')).toThrow();
    expect(() => parseBirthday('1990-13-23')).toThrow();
    expect(() => parseBirthday('not-a-date')).toThrow();
  });
});

describe('nextOccurrence', () => {
  it('returns this year if birthday is in the future', () => {
    const today = new Date(2026, 0, 1); // Jan 1
    const next = nextOccurrence('1990-08-23', today);
    expect(next.getFullYear()).toBe(2026);
    expect(next.getMonth()).toBe(7);
    expect(next.getDate()).toBe(23);
  });

  it('returns next year if birthday already passed', () => {
    const today = new Date(2026, 11, 1); // Dec 1
    const next = nextOccurrence('1990-08-23', today);
    expect(next.getFullYear()).toBe(2027);
    expect(next.getMonth()).toBe(7);
    expect(next.getDate()).toBe(23);
  });

  it('returns today when birthday is today', () => {
    const today = new Date(2026, 7, 23);
    const next = nextOccurrence('1990-08-23', today);
    expect(next.getFullYear()).toBe(2026);
    expect(next.getMonth()).toBe(7);
    expect(next.getDate()).toBe(23);
  });

  it('observes Feb 29 on Mar 1 in non-leap years', () => {
    const today = new Date(2025, 0, 1);
    const next = nextOccurrence('1996-02-29', today);
    expect(next.getMonth()).toBe(2); // March
    expect(next.getDate()).toBe(1);
  });

  it('keeps Feb 29 in leap years', () => {
    const today = new Date(2024, 0, 1);
    const next = nextOccurrence('1996-02-29', today);
    expect(next.getMonth()).toBe(1); // February
    expect(next.getDate()).toBe(29);
  });
});

describe('daysUntil', () => {
  it('returns 0 today', () => {
    expect(daysUntil('1990-08-23', new Date(2026, 7, 23, 14))).toBe(0);
  });

  it('returns 1 the day before', () => {
    expect(daysUntil('1990-08-23', new Date(2026, 7, 22))).toBe(1);
  });

  it('wraps to next year', () => {
    const today = new Date(2026, 11, 30);
    const days = daysUntil('1990-01-01', today);
    expect(days).toBe(2);
  });
});

describe('ageOnNextBirthday', () => {
  it('returns null if year is unknown', () => {
    expect(ageOnNextBirthday('0000-08-23', new Date(2026, 0, 1))).toBeNull();
  });

  it('computes age based on next occurrence year', () => {
    expect(ageOnNextBirthday('1990-08-23', new Date(2026, 0, 1))).toBe(36);
    expect(ageOnNextBirthday('1990-08-23', new Date(2026, 11, 1))).toBe(37);
  });
});

describe('isBirthdayToday', () => {
  it('is true on the day', () => {
    expect(isBirthdayToday('1990-08-23', new Date(2026, 7, 23, 9))).toBe(true);
  });
  it('is false otherwise', () => {
    expect(isBirthdayToday('1990-08-23', new Date(2026, 7, 24))).toBe(false);
  });
});

describe('bucketFor', () => {
  it.each`
    days | bucket
    ${0} | ${'today'}
    ${1} | ${'thisWeek'}
    ${7} | ${'thisWeek'}
    ${8} | ${'thisMonth'}
    ${31} | ${'thisMonth'}
    ${32} | ${'later'}
  `('$days → $bucket', ({ days, bucket }) => {
    expect(bucketFor(days)).toBe(bucket);
  });
});

describe('formatRelativeDays', () => {
  it('handles edge cases', () => {
    expect(formatRelativeDays(0)).toMatch(/today/i);
    expect(formatRelativeDays(1)).toMatch(/tomorrow/i);
    expect(formatRelativeDays(3)).toBe('In 3 days');
  });
});
