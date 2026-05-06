import { buildCsvExport, buildJsonExport, exportFilename } from '@/lib/export';
import type { FamilyMember, Friend } from '@/db/types';

const family: FamilyMember[] = [
  { id: 1, name: 'Max', birthday: '2018-08-23', color: '#FFD43B', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 2, name: 'Lena', birthday: '2020-06-05', color: '#5EC8F8', createdAt: '2026-01-02T00:00:00.000Z' },
];

const friends: Friend[] = [
  {
    id: 10,
    name: 'Tim',
    birthday: '2018-06-02',
    notes: 'Allergic to peanuts',
    assigneeIds: [1],
    createdAt: '2026-02-01T00:00:00.000Z',
  },
  {
    id: 11,
    name: 'Anna, Jr.',
    birthday: '2019-12-31',
    notes: 'Says "hi" a lot',
    assigneeIds: [1, 2],
    createdAt: '2026-02-02T00:00:00.000Z',
  },
];

describe('buildJsonExport', () => {
  it('produces a structured payload with timestamp', () => {
    const now = new Date('2026-05-06T10:00:00.000Z');
    const json = buildJsonExport(family, friends, now);
    const parsed = JSON.parse(json);
    expect(parsed.exportedAt).toBe('2026-05-06T10:00:00.000Z');
    expect(parsed.family).toHaveLength(2);
    expect(parsed.friends).toHaveLength(2);
    expect(parsed.friends[1].assigneeIds).toEqual([1, 2]);
  });

  it('round-trips through JSON.parse', () => {
    const json = buildJsonExport(family, friends);
    expect(() => JSON.parse(json)).not.toThrow();
  });
});

describe('buildCsvExport', () => {
  it('starts with the header row', () => {
    const csv = buildCsvExport(family, friends);
    const firstLine = csv.split('\n')[0];
    expect(firstLine).toBe(
      'type,id,name,birthday,color,notes,assigneeIds,assigneeNames,createdAt'
    );
  });

  it('emits one row per family + friend', () => {
    const csv = buildCsvExport(family, friends);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(1 + family.length + friends.length);
  });

  it('escapes cells containing commas and quotes', () => {
    const csv = buildCsvExport(family, friends);
    expect(csv).toContain('"Anna, Jr."');
    expect(csv).toContain('"Says ""hi"" a lot"');
  });

  it('joins assignees with semicolons and resolves names', () => {
    const csv = buildCsvExport(family, friends);
    const annaLine = csv.split('\n').find((l) => l.startsWith('friend,11,'))!;
    expect(annaLine).toContain('1;2');
    expect(annaLine).toContain('Max;Lena');
  });

  it('leaves color empty for friends and notes empty for family', () => {
    const csv = buildCsvExport(family, friends);
    const maxLine = csv.split('\n').find((l) => l.startsWith('family,1,'))!;
    expect(maxLine.split(',')).toEqual(
      expect.arrayContaining(['family', '1', 'Max', '2018-08-23', '#FFD43B'])
    );
  });
});

describe('exportFilename', () => {
  it('formats as birdie-YYYYMMDD.<ext>', () => {
    expect(exportFilename('json', new Date(2026, 4, 6))).toBe('birdie-20260506.json');
    expect(exportFilename('csv', new Date(2026, 11, 1))).toBe('birdie-20261201.csv');
  });
});
