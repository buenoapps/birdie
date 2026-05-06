import {
  buildHourlyTriggers,
  notificationIdFor,
  parseNotificationId,
} from '@/lib/scheduler';

describe('buildHourlyTriggers', () => {
  it('returns 14 triggers (08:00–21:00) when birthday is in the future', () => {
    const now = new Date(2026, 0, 1);
    const triggers = buildHourlyTriggers('1990-08-23', now);
    expect(triggers).toHaveLength(14);
    expect(triggers[0].getHours()).toBe(8);
    expect(triggers[13].getHours()).toBe(21);
    triggers.forEach((t) => {
      expect(t.getMonth()).toBe(7);
      expect(t.getDate()).toBe(23);
    });
  });

  it('drops past hours when run mid-day on the birthday', () => {
    const now = new Date(2026, 7, 23, 14, 30);
    const triggers = buildHourlyTriggers('1990-08-23', now);
    expect(triggers[0].getHours()).toBe(15);
    expect(triggers[triggers.length - 1].getHours()).toBe(21);
    expect(triggers).toHaveLength(7);
  });

  it('returns empty after the window closes', () => {
    const now = new Date(2026, 7, 23, 22, 0);
    const triggers = buildHourlyTriggers('1990-08-23', now);
    expect(triggers).toHaveLength(0);
  });

  it('respects custom window', () => {
    const now = new Date(2026, 0, 1);
    const triggers = buildHourlyTriggers('1990-08-23', now, { startHour: 9, endHour: 12 });
    expect(triggers.map((t) => t.getHours())).toEqual([9, 10, 11, 12]);
  });

  it('returns empty when window is reversed', () => {
    const now = new Date(2026, 0, 1);
    expect(buildHourlyTriggers('1990-08-23', now, { startHour: 20, endHour: 8 })).toEqual([]);
  });
});

describe('notificationIdFor / parseNotificationId', () => {
  it('round-trips a stable id', () => {
    const trigger = new Date(2026, 7, 23, 14);
    const id = notificationIdFor('friend', 42, trigger);
    expect(id).toBe('birthday-friend-42-20260823-14');
    expect(parseNotificationId(id)).toEqual({
      personType: 'friend',
      personId: 42,
      year: 2026,
    });
  });

  it('rejects non-birthday ids', () => {
    expect(parseNotificationId('reminder-xyz')).toBeNull();
    expect(parseNotificationId('birthday-bogus')).toBeNull();
  });
});
