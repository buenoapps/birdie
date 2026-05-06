import type { FamilyMember, Friend } from '@/db/types';

export type ExportPayload = {
  exportedAt: string;
  family: FamilyMember[];
  friends: Friend[];
};

export function buildJsonExport(family: FamilyMember[], friends: Friend[], now: Date = new Date()): string {
  const payload: ExportPayload = {
    exportedAt: now.toISOString(),
    family,
    friends,
  };
  return JSON.stringify(payload, null, 2);
}

const CSV_HEADERS = [
  'type',
  'id',
  'name',
  'birthday',
  'color',
  'notes',
  'assigneeIds',
  'assigneeNames',
  'createdAt',
];

export function buildCsvExport(family: FamilyMember[], friends: Friend[]): string {
  const memberById = new Map(family.map((m) => [m.id, m.name]));
  const rows: string[][] = [CSV_HEADERS];

  for (const m of family) {
    rows.push([
      'family',
      String(m.id),
      m.name,
      m.birthday,
      m.color,
      '',
      '',
      '',
      m.createdAt,
    ]);
  }

  for (const f of friends) {
    const assigneeNames = f.assigneeIds
      .map((id) => memberById.get(id))
      .filter((n): n is string => Boolean(n));
    rows.push([
      'friend',
      String(f.id),
      f.name,
      f.birthday,
      '',
      f.notes ?? '',
      f.assigneeIds.join(';'),
      assigneeNames.join(';'),
      f.createdAt,
    ]);
  }

  return rows.map((row) => row.map(escapeCsvCell).join(',')).join('\n');
}

function escapeCsvCell(value: string): string {
  if (value === '') return '';
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportFilename(format: 'json' | 'csv', now: Date = new Date()): string {
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `birdie-${yyyy}${mm}${dd}.${format}`;
}
