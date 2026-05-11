import type { DatabaseSync } from 'node:sqlite';

export interface Migration {
  /** Unique identifier — use the filename without extension, e.g. "001_create_todos" */
  id: string;
  up: (db: DatabaseSync) => void;
}
