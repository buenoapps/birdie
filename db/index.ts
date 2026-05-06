import * as SQLite from 'expo-sqlite';
import { SCHEMA_STATEMENTS } from './schema';

const DB_NAME = 'birdie.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await db.execAsync('PRAGMA foreign_keys = ON;');
      for (const stmt of SCHEMA_STATEMENTS) {
        await db.execAsync(stmt);
      }
      return db;
    })();
  }
  return dbPromise;
}

// Test helper — not used in production code paths.
export function __resetDatabaseForTests() {
  dbPromise = null;
}
