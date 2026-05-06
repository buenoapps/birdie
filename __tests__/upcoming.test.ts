import { mergeUpcoming } from '@/lib/upcoming';
import type { FamilyMember, Friend } from '@/db/types';

const today = new Date(2026, 5, 1); // June 1 2026

const family: FamilyMember[] = [
  { id: 1, name: 'Max', birthday: '2018-08-23', color: '#FFD43B', createdAt: 'x' },
  { id: 2, name: 'Lena', birthday: '2020-06-05', color: '#5EC8F8', createdAt: 'x' },
];

const friends: Friend[] = [
  { id: 10, name: 'Tim', birthday: '2018-06-02', notes: null, assigneeIds: [1], createdAt: 'x' },
  { id: 11, name: 'Anna', birthday: '2019-12-31', notes: null, assigneeIds: [1, 2], createdAt: 'x' },
];

describe('mergeUpcoming', () => {
  it('sorts by daysUntil ascending', () => {
    const result = mergeUpcoming({ family, friends, acks: [], now: today });
    expect(result.map((r) => r.name)).toEqual(['Tim', 'Lena', 'Max', 'Anna']);
  });

  it('attaches assignee names from family lookup', () => {
    const result = mergeUpcoming({ family, friends, acks: [], now: today });
    const anna = result.find((r) => r.name === 'Anna')!;
    expect(anna.assigneeNames).toEqual(['Max', 'Lena']);
  });

  it('marks acknowledged when an ack matches person+year', () => {
    const result = mergeUpcoming({
      family,
      friends,
      acks: [{ personType: 'friend', personId: 10, year: 2026 }],
      now: today,
    });
    expect(result.find((r) => r.name === 'Tim')!.acknowledgedThisYear).toBe(true);
    expect(result.find((r) => r.name === 'Anna')!.acknowledgedThisYear).toBe(false);
  });

  it('computes age for the next birthday', () => {
    const result = mergeUpcoming({ family, friends, acks: [], now: today });
    expect(result.find((r) => r.name === 'Max')!.ageOnNext).toBe(8);
    expect(result.find((r) => r.name === 'Tim')!.ageOnNext).toBe(8);
  });
});
