import { getDatabase } from '../index';
import type { FamilyMember } from '../types';

type Row = {
  id: number;
  name: string;
  birthday: string;
  color: string;
  created_at: string;
};

const fromRow = (row: Row): FamilyMember => ({
  id: row.id,
  name: row.name,
  birthday: row.birthday,
  color: row.color,
  createdAt: row.created_at,
});

export const familyRepo = {
  async list(): Promise<FamilyMember[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<Row>(
      'SELECT id, name, birthday, color, created_at FROM family_members ORDER BY name COLLATE NOCASE ASC'
    );
    return rows.map(fromRow);
  },

  async get(id: number): Promise<FamilyMember | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<Row>(
      'SELECT id, name, birthday, color, created_at FROM family_members WHERE id = ?',
      [id]
    );
    return row ? fromRow(row) : null;
  },

  async create(input: { name: string; birthday: string; color: string }): Promise<FamilyMember> {
    const db = await getDatabase();
    const createdAt = new Date().toISOString();
    const result = await db.runAsync(
      'INSERT INTO family_members (name, birthday, color, created_at) VALUES (?, ?, ?, ?)',
      [input.name, input.birthday, input.color, createdAt]
    );
    return {
      id: result.lastInsertRowId,
      name: input.name,
      birthday: input.birthday,
      color: input.color,
      createdAt,
    };
  },

  async update(id: number, input: { name: string; birthday: string; color: string }): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      'UPDATE family_members SET name = ?, birthday = ?, color = ? WHERE id = ?',
      [input.name, input.birthday, input.color, id]
    );
  },

  async remove(id: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM family_members WHERE id = ?', [id]);
  },
};
