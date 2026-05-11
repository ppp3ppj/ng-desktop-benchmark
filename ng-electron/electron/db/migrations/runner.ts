import { DatabaseSync } from 'node:sqlite';
import type { Migration } from './types';

// Import migrations in order — add new ones here as the app grows
import { migration as m001 } from './001_create_todos';

const ALL_MIGRATIONS: Migration[] = [m001];

export function runMigrations(db: DatabaseSync): void {
  // Track which migrations have already been applied
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id         TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    )
  `);

  const applied = new Set(
    (
      db.prepare('SELECT id FROM migrations').all() as { id: string }[]
    ).map(r => r.id),
  );

  for (const migration of ALL_MIGRATIONS) {
    if (applied.has(migration.id)) continue;

    console.log(`[migration] applying ${migration.id}`);
    migration.up(db);
    db.prepare('INSERT INTO migrations (id) VALUES (?)').run(migration.id);
    console.log(`[migration] applied  ${migration.id}`);
  }
}
