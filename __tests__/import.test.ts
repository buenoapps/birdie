import type { FamilyMember, Friend } from '@/db/types';
import { buildCsvExport, buildJsonExport } from '@/lib/export';
import {
  annotateDuplicates,
  detectFormat,
  parse,
  parseCsvImport,
  parseCsvRows,
  parseJsonImport,
} from '@/lib/import';

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

describe('detectFormat', () => {
  it('returns json for object/array roots', () => {
    expect(detectFormat('{"family":[]}')).toBe('json');
    expect(detectFormat('[]')).toBe('json');
    expect(detectFormat('  \n  {"a":1}')).toBe('json');
  });

  it('returns csv for everything else non-empty', () => {
    expect(detectFormat('type,name,birthday\nfamily,Max,2018-08-23')).toBe('csv');
  });

  it('returns null for empty input', () => {
    expect(detectFormat('')).toBeNull();
    expect(detectFormat('   \n\t')).toBeNull();
  });
});

describe('parseCsvRows', () => {
  it('handles quoted cells with commas and escaped quotes', () => {
    const rows = parseCsvRows('a,"b, c","d ""e"" f"\n1,2,3');
    expect(rows).toEqual([
      ['a', 'b, c', 'd "e" f'],
      ['1', '2', '3'],
    ]);
  });

  it('handles \\r\\n line endings', () => {
    expect(parseCsvRows('a,b\r\n1,2\r\n')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });
});

describe('parseJsonImport', () => {
  it('parses the canonical export shape', () => {
    const json = buildJsonExport(family, friends);
    const result = parseJsonImport(json);
    expect(result.family).toHaveLength(2);
    expect(result.friends).toHaveLength(2);
    expect(result.ignored).toBe(0);
    expect(result.family[0]).toMatchObject({ name: 'Max', birthday: '2018-08-23', color: '#FFD43B' });
  });

  it('rejects malformed JSON', () => {
    expect(() => parseJsonImport('{not json')).toThrow();
  });

  it('rejects non-object roots', () => {
    expect(() => parseJsonImport('"hello"')).toThrow();
  });

  it('counts items with missing required fields as ignored', () => {
    const result = parseJsonImport(
      JSON.stringify({
        family: [{ name: 'Ok', birthday: '2010-01-01' }, { name: '', birthday: '2010-01-01' }, { name: 'Bad', birthday: 'nope' }],
        friends: [],
      })
    );
    expect(result.family).toHaveLength(1);
    expect(result.ignored).toBe(2);
  });

  it('extracts assigneeNames from friends', () => {
    const result = parseJsonImport(
      JSON.stringify({
        family: [],
        friends: [{ name: 'Anna', birthday: '2019-12-31', assigneeNames: ['Max', 'Lena'] }],
      })
    );
    expect(result.friends[0].assigneeNames).toEqual(['Max', 'Lena']);
  });
});

describe('parseCsvImport', () => {
  it('round-trips a buildCsvExport string', () => {
    const csv = buildCsvExport(family, friends);
    const result = parseCsvImport(csv);
    expect(result.family.map((m) => m.name)).toEqual(['Max', 'Lena']);
    expect(result.friends.map((f) => f.name).sort()).toEqual(['Anna, Jr.', 'Tim']);
    const anna = result.friends.find((f) => f.name === 'Anna, Jr.')!;
    expect(anna.assigneeNames).toEqual(['Max', 'Lena']);
    expect(anna.notes).toContain('hi');
  });

  it('increments ignored on bad rows', () => {
    const csv = [
      'type,id,name,birthday,color,notes,assigneeIds,assigneeNames,createdAt',
      'family,1,Max,2018-08-23,#FFD43B,,,,x',
      'unknown,2,Mystery,2020-01-01,,,,,x',
      'family,3,Bad,not-a-date,,,,,x',
    ].join('\n');
    const result = parseCsvImport(csv);
    expect(result.family).toHaveLength(1);
    expect(result.ignored).toBe(2);
  });

  it('throws when the header is missing required columns', () => {
    expect(() => parseCsvImport('foo,bar\n1,2')).toThrow();
  });
});

describe('parse delegation', () => {
  it('routes JSON to parseJsonImport', () => {
    const json = buildJsonExport(family, friends);
    expect(parse(json).family).toHaveLength(2);
  });
  it('routes CSV to parseCsvImport', () => {
    const csv = buildCsvExport(family, friends);
    expect(parse(csv).friends).toHaveLength(2);
  });
});

describe('annotateDuplicates', () => {
  it('flags items with matching name+birthday', () => {
    const raw = parseJsonImport(buildJsonExport(family, friends));
    const annotated = annotateDuplicates(raw, family, friends);
    expect(annotated.family.every((m) => m.isDuplicate)).toBe(true);
    expect(annotated.friends.every((f) => f.isDuplicate)).toBe(true);
  });

  it('does not flag novel items', () => {
    const raw = parseJsonImport(
      JSON.stringify({
        family: [{ name: 'Newbie', birthday: '2024-01-01' }],
        friends: [{ name: 'Stranger', birthday: '2024-02-02', assigneeNames: [] }],
      })
    );
    const annotated = annotateDuplicates(raw, family, friends);
    expect(annotated.family[0].isDuplicate).toBe(false);
    expect(annotated.friends[0].isDuplicate).toBe(false);
  });

  it('matches case-insensitively on name', () => {
    const raw = parseJsonImport(
      JSON.stringify({ family: [{ name: 'max', birthday: '2018-08-23' }], friends: [] })
    );
    const annotated = annotateDuplicates(raw, family, friends);
    expect(annotated.family[0].isDuplicate).toBe(true);
  });
});
