import { getDatabase } from '../index';
import type { Acknowledgment, PersonType } from '../types';

type Row = {
  person_type: PersonType;
  person_id: number;
  year: number;
  sent_at: string;
};

const fromRow = (row: Row): Acknowledgment => ({
  personType: row.person_type,
  personId: row.person_id,
  year: row.year,
  sentAt: row.sent_at,
});

export const acknowledgmentsRepo = {
  async list(): Promise<Acknowledgment[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<Row>(
      'SELECT person_type, person_id, year, sent_at FROM acknowledgments'
    );
    return rows.map(fromRow);
  },

  async isAcknowledged(type: PersonType, id: number, year: number): Promise<boolean> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM acknowledgments WHERE person_type = ? AND person_id = ? AND year = ?',
      [type, id, year]
    );
    return (row?.count ?? 0) > 0;
  },

  async markSent(type: PersonType, id: number, year: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      'INSERT OR REPLACE INTO acknowledgments (person_type, person_id, year, sent_at) VALUES (?, ?, ?, ?)',
      [type, id, year, new Date().toISOString()]
    );
  },

  async clear(type: PersonType, id: number, year: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      'DELETE FROM acknowledgments WHERE person_type = ? AND person_id = ? AND year = ?',
      [type, id, year]
    );
  },
};
