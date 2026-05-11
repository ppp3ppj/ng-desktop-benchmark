import { ipcMain } from 'electron';
import { getDb } from '../db/database';
import type { CreateTodoInput, Todo, UpdateTodoInput } from '../types';

// node:sqlite returns column values as-is; completed is stored as 0/1
function rowToTodo(row: Record<string, unknown>): Todo {
  return {
    id: row['id'] as number,
    title: row['title'] as string,
    description: row['description'] as string,
    completed: row['completed'] === 1,
    created_at: row['created_at'] as string,
    updated_at: row['updated_at'] as string,
  };
}

export function registerTodoIpc(): void {
  ipcMain.handle('todo:getAll', (): Todo[] => {
    const db = getDb();
    const rows = db
      .prepare('SELECT * FROM todos ORDER BY completed ASC, created_at DESC')
      .all() as Record<string, unknown>[];
    return rows.map(rowToTodo);
  });

  ipcMain.handle('todo:create', (_e, input: CreateTodoInput): Todo => {
    const db = getDb();
    const { lastInsertRowid } = db
      .prepare('INSERT INTO todos (title, description) VALUES (?, ?)')
      .run(input.title, input.description ?? '');
    const row = db
      .prepare('SELECT * FROM todos WHERE id = ?')
      .get(lastInsertRowid) as Record<string, unknown>;
    return rowToTodo(row);
  });

  ipcMain.handle('todo:update', (_e, input: UpdateTodoInput): Todo => {
    const db = getDb();
    db.prepare(
      `UPDATE todos
          SET title = ?, description = ?, updated_at = datetime('now', 'localtime')
        WHERE id = ?`,
    ).run(input.title, input.description, input.id);
    const row = db
      .prepare('SELECT * FROM todos WHERE id = ?')
      .get(input.id) as Record<string, unknown>;
    return rowToTodo(row);
  });

  ipcMain.handle('todo:toggle', (_e, id: number): Todo => {
    const db = getDb();
    db.prepare(
      `UPDATE todos
          SET completed  = CASE WHEN completed = 0 THEN 1 ELSE 0 END,
              updated_at = datetime('now', 'localtime')
        WHERE id = ?`,
    ).run(id);
    const row = db
      .prepare('SELECT * FROM todos WHERE id = ?')
      .get(id) as Record<string, unknown>;
    return rowToTodo(row);
  });

  ipcMain.handle('todo:delete', (_e, id: number): void => {
    getDb().prepare('DELETE FROM todos WHERE id = ?').run(id);
  });
}
