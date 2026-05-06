export const SCHEMA_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS family_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    birthday TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS friends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    birthday TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS friend_assignments (
    friend_id INTEGER NOT NULL,
    family_member_id INTEGER NOT NULL,
    PRIMARY KEY (friend_id, family_member_id),
    FOREIGN KEY (friend_id) REFERENCES friends(id) ON DELETE CASCADE,
    FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS acknowledgments (
    person_type TEXT NOT NULL,
    person_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    sent_at TEXT NOT NULL,
    PRIMARY KEY (person_type, person_id, year)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_friend_assignments_friend ON friend_assignments(friend_id)`,
  `CREATE INDEX IF NOT EXISTS idx_friend_assignments_member ON friend_assignments(family_member_id)`,
];
