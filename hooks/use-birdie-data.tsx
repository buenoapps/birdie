import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { acknowledgmentsRepo } from '@/db/repositories/acknowledgments';
import { familyRepo } from '@/db/repositories/family';
import { friendsRepo } from '@/db/repositories/friends';
import type { Acknowledgment, FamilyMember, Friend, PersonType, UpcomingBirthday } from '@/db/types';
import { mergeUpcoming } from '@/lib/upcoming';
import { cancelForPerson, syncBirthdayNotifications } from '@/lib/notifications';

type State = {
  ready: boolean;
  family: FamilyMember[];
  friends: Friend[];
  acks: Acknowledgment[];
};

type Actions = {
  refresh: () => Promise<void>;
  createFamilyMember: (input: { name: string; birthday: string; color: string }) => Promise<FamilyMember>;
  updateFamilyMember: (id: number, input: { name: string; birthday: string; color: string }) => Promise<void>;
  deleteFamilyMember: (id: number) => Promise<void>;
  createFriend: (input: { name: string; birthday: string; notes?: string | null; assigneeIds: number[] }) => Promise<Friend>;
  updateFriend: (id: number, input: { name: string; birthday: string; notes?: string | null; assigneeIds: number[] }) => Promise<void>;
  deleteFriend: (id: number) => Promise<void>;
  markBirthdaySent: (type: PersonType, id: number, year: number) => Promise<void>;
  unmarkBirthdaySent: (type: PersonType, id: number, year: number) => Promise<void>;
};

type ContextValue = State & Actions & { upcoming: UpcomingBirthday[] };

const BirdieDataContext = createContext<ContextValue | null>(null);

export function BirdieDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ ready: false, family: [], friends: [], acks: [] });

  const refresh = useCallback(async () => {
    const [family, friends, acks] = await Promise.all([
      familyRepo.list(),
      friendsRepo.list(),
      acknowledgmentsRepo.list(),
    ]);
    setState({ ready: true, family, friends, acks });
  }, []);

  useEffect(() => {
    refresh().catch((err) => {
      console.warn('Failed to load Birdie data', err);
      setState((s) => ({ ...s, ready: true }));
    });
  }, [refresh]);

  const syncAndRefresh = useCallback(async () => {
    await refresh();
    syncBirthdayNotifications().catch((err) => console.warn('Notification sync failed', err));
  }, [refresh]);

  const actions = useMemo<Actions>(
    () => ({
      refresh,
      createFamilyMember: async (input) => {
        const created = await familyRepo.create(input);
        await syncAndRefresh();
        return created;
      },
      updateFamilyMember: async (id, input) => {
        await familyRepo.update(id, input);
        await syncAndRefresh();
      },
      deleteFamilyMember: async (id) => {
        await familyRepo.remove(id);
        await syncAndRefresh();
      },
      createFriend: async (input) => {
        const created = await friendsRepo.create(input);
        await syncAndRefresh();
        return created;
      },
      updateFriend: async (id, input) => {
        await friendsRepo.update(id, input);
        await syncAndRefresh();
      },
      deleteFriend: async (id) => {
        await friendsRepo.remove(id);
        await syncAndRefresh();
      },
      markBirthdaySent: async (type, id, year) => {
        await acknowledgmentsRepo.markSent(type, id, year);
        await cancelForPerson(type, id, year).catch(() => {});
        await refresh();
      },
      unmarkBirthdaySent: async (type, id, year) => {
        await acknowledgmentsRepo.clear(type, id, year);
        await syncAndRefresh();
      },
    }),
    [refresh, syncAndRefresh]
  );

  const upcoming = useMemo(
    () => mergeUpcoming({ family: state.family, friends: state.friends, acks: state.acks }),
    [state.family, state.friends, state.acks]
  );

  const value: ContextValue = { ...state, ...actions, upcoming };

  return <BirdieDataContext.Provider value={value}>{children}</BirdieDataContext.Provider>;
}

export function useBirdieData(): ContextValue {
  const ctx = useContext(BirdieDataContext);
  if (!ctx) {
    throw new Error('useBirdieData must be used inside BirdieDataProvider');
  }
  return ctx;
}
