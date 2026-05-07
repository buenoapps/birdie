import { Brand } from '@/constants/theme';
import type { FamilyMember, Friend } from '@/db/types';

import { parseBirthday } from './dates';

export type ImportFormat = 'json' | 'csv';

export type RawFamily = {
  name: string;
  birthday: string;
  color: string;
  notes: string | null;
};

export type RawFriend = {
  name: string;
  birthday: string;
  notes: string | null;
  assigneeNames: string[];
};

export type RawParsed = {
  family: RawFamily[];
  friends: RawFriend[];
  ignored: number;
};

export type ParsedFamily = RawFamily & { isDuplicate: boolean };
export type ParsedFriend = RawFriend & { isDuplicate: boolean };

export type ParsedImport = {
  family: ParsedFamily[];
  friends: ParsedFriend[];
  ignored: number;
};

export function detectFormat(raw: string): ImportFormat | null {
  const trimmed = raw.trimStart();
  if (!trimmed) return null;
  const first = trimmed[0];
  if (first === '{' || first === '[') return 'json';
  return 'csv';
}

export function parse(raw: string): RawParsed {
  const format = detectFormat(raw);
  if (format === null) throw new Error('Empty input');
  if (format === 'json') return parseJsonImport(raw);
  return parseCsvImport(raw);
}

export function parseJsonImport(raw: string): RawParsed {
  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    throw new Error('Invalid JSON');
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Expected an object with family and friends arrays');
  }

  const family: RawFamily[] = [];
  const friends: RawFriend[] = [];
  let ignored = 0;

  const obj = payload as { family?: unknown; friends?: unknown };
  for (const item of toArray(obj.family)) {
    const row = coerceFamily(item);
    if (row) family.push(row);
    else ignored++;
  }
  for (const item of toArray(obj.friends)) {
    const row = coerceFriend(item);
    if (row) friends.push(row);
    else ignored++;
  }

  return { family, friends, ignored };
}

export function parseCsvImport(raw: string): RawParsed {
  const rows = parseCsvRows(raw);
  if (rows.length === 0) throw new Error('Empty CSV');
  const header = rows[0].map((h) => h.trim());
  const idx = (col: string) => header.indexOf(col);
  const typeI = idx('type');
  const nameI = idx('name');
  const birthdayI = idx('birthday');
  const colorI = idx('color');
  const notesI = idx('notes');
  const assigneeNamesI = idx('assigneeNames');

  if (typeI < 0 || nameI < 0 || birthdayI < 0) {
    throw new Error('CSV is missing required columns: type, name, birthday');
  }

  const family: RawFamily[] = [];
  const friends: RawFriend[] = [];
  let ignored = 0;

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.length === 1 && row[0] === '') continue;
    const type = row[typeI];
    const name = (row[nameI] ?? '').trim();
    const birthday = (row[birthdayI] ?? '').trim();
    if (!name || !isValidBirthday(birthday)) {
      ignored++;
      continue;
    }
    if (type === 'family') {
      family.push({
        name,
        birthday,
        color: row[colorI] || Brand.partyPink,
        notes: cellOrNull(row[notesI]),
      });
    } else if (type === 'friend') {
      const assigneeNames = (row[assigneeNamesI] ?? '')
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean);
      friends.push({
        name,
        birthday,
        notes: cellOrNull(row[notesI]),
        assigneeNames,
      });
    } else {
      ignored++;
    }
  }

  return { family, friends, ignored };
}

export function annotateDuplicates(
  raw: RawParsed,
  existingFamily: FamilyMember[],
  existingFriends: Friend[]
): ParsedImport {
  const familyKeys = new Set(existingFamily.map((m) => key(m.name, m.birthday)));
  const friendKeys = new Set(existingFriends.map((f) => key(f.name, f.birthday)));
  return {
    ignored: raw.ignored,
    family: raw.family.map((m) => ({ ...m, isDuplicate: familyKeys.has(key(m.name, m.birthday)) })),
    friends: raw.friends.map((f) => ({ ...f, isDuplicate: friendKeys.has(key(f.name, f.birthday)) })),
  };
}

let staged: ParsedImport | null = null;

export function setStagedImport(payload: ParsedImport | null): void {
  staged = payload;
}

export function getStagedImport(): ParsedImport | null {
  return staged;
}

function key(name: string, birthday: string): string {
  return `${name.trim().toLowerCase()}|${birthday}`;
}

function isValidBirthday(value: string): boolean {
  try {
    parseBirthday(value);
    return true;
  } catch {
    return false;
  }
}

function toArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function coerceFamily(item: unknown): RawFamily | null {
  if (!item || typeof item !== 'object') return null;
  const o = item as Record<string, unknown>;
  const name = typeof o.name === 'string' ? o.name.trim() : '';
  const birthday = typeof o.birthday === 'string' ? o.birthday : '';
  if (!name || !isValidBirthday(birthday)) return null;
  return {
    name,
    birthday,
    color: typeof o.color === 'string' && o.color ? o.color : Brand.partyPink,
    notes: typeof o.notes === 'string' ? o.notes : null,
  };
}

function coerceFriend(item: unknown): RawFriend | null {
  if (!item || typeof item !== 'object') return null;
  const o = item as Record<string, unknown>;
  const name = typeof o.name === 'string' ? o.name.trim() : '';
  const birthday = typeof o.birthday === 'string' ? o.birthday : '';
  if (!name || !isValidBirthday(birthday)) return null;
  const assigneeNames: string[] = [];
  if (Array.isArray(o.assigneeNames)) {
    for (const n of o.assigneeNames) if (typeof n === 'string' && n.trim()) assigneeNames.push(n.trim());
  }
  return {
    name,
    birthday,
    notes: typeof o.notes === 'string' ? o.notes : null,
    assigneeNames,
  };
}

function cellOrNull(value: string | undefined): string | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : value;
}

/**
 * RFC-4180-ish CSV parser. Handles quoted cells, embedded commas, escaped
 * doubled quotes, and \r\n / \n line endings.
 */
export function parseCsvRows(raw: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;
  let i = 0;

  while (i < raw.length) {
    const ch = raw[i];
    if (inQuotes) {
      if (ch === '"') {
        if (raw[i + 1] === '"') {
          cell += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      cell += ch;
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === ',') {
      row.push(cell);
      cell = '';
      i++;
      continue;
    }
    if (ch === '\n' || ch === '\r') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
      if (ch === '\r' && raw[i + 1] === '\n') i += 2;
      else i++;
      continue;
    }
    cell += ch;
    i++;
  }
  if (cell !== '' || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}
