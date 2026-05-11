import { DatabaseSync } from 'node:sqlite';
import { app } from 'electron';
import path from 'path';
import { runMigrations } from './migrations/runner';

let _db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!_db) {
    const dbPath = path.join(app.getPath('userData'), 'app.db');
    _db = new DatabaseSync(dbPath);
    runMigrations(_db);
  }
  return _db;
}
