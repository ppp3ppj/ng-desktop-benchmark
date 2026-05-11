import type { Migration } from './types';

export const migration: Migration = {
  id: '001_create_todos',
  up(db) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS todos (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        title       TEXT    NOT NULL,
        description TEXT    NOT NULL DEFAULT '',
        completed   INTEGER NOT NULL DEFAULT 0,
        created_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
        updated_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
      )
    `);
  },
};
