import { getDatabase } from '../index';
import type { Friend } from '../types';

type Row = {
  id: number;
  name: string;
  birthday: string;
  notes: string | null;
  created_at: string;
};

type AssignmentRow = { friend_id: number; family_member_id: number };

async function loadAssignments(friendIds: number[]): Promise<Map<number, number[]>> {
  const map = new Map<number, number[]>();
  if (friendIds.length === 0) return map;
  const db = await getDatabase();
  const placeholders = friendIds.map(() => '?').join(',');
  const rows = await db.getAllAsync<AssignmentRow>(
    `SELECT friend_id, family_member_id FROM friend_assignments WHERE friend_id IN (${placeholders})`,
    friendIds
  );
  for (const row of rows) {
    const existing = map.get(row.friend_id) ?? [];
    existing.push(row.family_member_id);
    map.set(row.friend_id, existing);
  }
  return map;
}

const fromRow = (row: Row, assigneeIds: number[]): Friend => ({
  id: row.id,
  name: row.name,
  birthday: row.birthday,
  notes: row.notes,
  assigneeIds,
  createdAt: row.created_at,
});

export const friendsRepo = {
  async list(): Promise<Friend[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<Row>(
      'SELECT id, name, birthday, notes, created_at FROM friends ORDER BY name COLLATE NOCASE ASC'
    );
    const assignments = await loadAssignments(rows.map((r) => r.id));
    return rows.map((r) => fromRow(r, assignments.get(r.id) ?? []));
  },

  async get(id: number): Promise<Friend | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<Row>(
      'SELECT id, name, birthday, notes, created_at FROM friends WHERE id = ?',
      [id]
    );
    if (!row) return null;
    const assignments = await loadAssignments([id]);
    return fromRow(row, assignments.get(id) ?? []);
  },

  async create(input: {
    name: string;
    birthday: string;
    notes?: string | null;
    assigneeIds: number[];
  }): Promise<Friend> {
    const db = await getDatabase();
    const createdAt = new Date().toISOString();
    const result = await db.runAsync(
      'INSERT INTO friends (name, birthday, notes, created_at) VALUES (?, ?, ?, ?)',
      [input.name, input.birthday, input.notes ?? null, createdAt]
    );
    const id = result.lastInsertRowId;
    await replaceAssignments(id, input.assigneeIds);
    return {
      id,
      name: input.name,
      birthday: input.birthday,
      notes: input.notes ?? null,
      assigneeIds: input.assigneeIds,
      createdAt,
    };
  },

  async update(
    id: number,
    input: { name: string; birthday: string; notes?: string | null; assigneeIds: number[] }
  ): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      'UPDATE friends SET name = ?, birthday = ?, notes = ? WHERE id = ?',
      [input.name, input.birthday, input.notes ?? null, id]
    );
    await replaceAssignments(id, input.assigneeIds);
  },

  async remove(id: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM friends WHERE id = ?', [id]);
  },
};

async function replaceAssignments(friendId: number, assigneeIds: number[]): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM friend_assignments WHERE friend_id = ?', [friendId]);
  for (const memberId of assigneeIds) {
    await db.runAsync(
      'INSERT OR IGNORE INTO friend_assignments (friend_id, family_member_id) VALUES (?, ?)',
      [friendId, memberId]
    );
  }
}
