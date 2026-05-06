import { acknowledgmentsRepo } from '@/db/repositories/acknowledgments';
import { familyRepo } from '@/db/repositories/family';
import { friendsRepo } from '@/db/repositories/friends';
import type { FamilyMember, Friend, UpcomingBirthday } from '@/db/types';
import { Brand } from '@/constants/theme';

import { ageOnNextBirthday, daysUntil, nextOccurrence } from './dates';

function toIsoDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export async function loadUpcomingBirthdays(now: Date = new Date()): Promise<UpcomingBirthday[]> {
  const [family, friends, acks] = await Promise.all([
    familyRepo.list(),
    friendsRepo.list(),
    acknowledgmentsRepo.list(),
  ]);
  return mergeUpcoming({ family, friends, acks, now });
}

export function mergeUpcoming(input: {
  family: FamilyMember[];
  friends: Friend[];
  acks: { personType: 'family' | 'friend'; personId: number; year: number }[];
  now?: Date;
}): UpcomingBirthday[] {
  const now = input.now ?? new Date();
  const memberById = new Map(input.family.map((m) => [m.id, m]));
  const ackKey = (t: 'family' | 'friend', id: number, y: number) => `${t}:${id}:${y}`;
  const ackSet = new Set(input.acks.map((a) => ackKey(a.personType, a.personId, a.year)));

  const items: UpcomingBirthday[] = [];

  for (const member of input.family) {
    const next = nextOccurrence(member.birthday, now);
    items.push({
      personType: 'family',
      personId: member.id,
      name: member.name,
      birthday: member.birthday,
      nextOccurrence: toIsoDate(next),
      daysUntil: daysUntil(member.birthday, now),
      ageOnNext: ageOnNextBirthday(member.birthday, now),
      color: member.color || Brand.partyPink,
      assigneeNames: [],
      acknowledgedThisYear: ackSet.has(ackKey('family', member.id, next.getFullYear())),
    });
  }

  for (const friend of input.friends) {
    const next = nextOccurrence(friend.birthday, now);
    const assigneeNames = friend.assigneeIds
      .map((id) => memberById.get(id)?.name)
      .filter((n): n is string => Boolean(n));
    items.push({
      personType: 'friend',
      personId: friend.id,
      name: friend.name,
      birthday: friend.birthday,
      nextOccurrence: toIsoDate(next),
      daysUntil: daysUntil(friend.birthday, now),
      ageOnNext: ageOnNextBirthday(friend.birthday, now),
      color: Brand.sky,
      assigneeNames,
      acknowledgedThisYear: ackSet.has(ackKey('friend', friend.id, next.getFullYear())),
    });
  }

  items.sort((a, b) => a.daysUntil - b.daysUntil || a.name.localeCompare(b.name));
  return items;
}
