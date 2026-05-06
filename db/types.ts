export type PersonType = 'family' | 'friend';

export type FamilyMember = {
  id: number;
  name: string;
  birthday: string; // YYYY-MM-DD or --MM-DD if year unknown
  color: string;
  createdAt: string;
};

export type Friend = {
  id: number;
  name: string;
  birthday: string;
  notes: string | null;
  assigneeIds: number[];
  createdAt: string;
};

export type Acknowledgment = {
  personType: PersonType;
  personId: number;
  year: number;
  sentAt: string;
};

export type UpcomingBirthday = {
  personType: PersonType;
  personId: number;
  name: string;
  birthday: string;
  nextOccurrence: string; // YYYY-MM-DD
  daysUntil: number;
  ageOnNext: number | null;
  color: string;
  assigneeNames: string[];
  acknowledgedThisYear: boolean;
};
