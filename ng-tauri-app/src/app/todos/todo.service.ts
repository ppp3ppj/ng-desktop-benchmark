import { Injectable, inject, signal } from "@angular/core";
import { DatabaseService } from "../database.service";

export interface Todo {
  id: number;
  title: string;
  completed: number;
  created_at: string;
}

@Injectable({ providedIn: "root" })
export class TodoService {
  private readonly db = inject(DatabaseService);

  readonly todos = signal<Todo[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async loadAll(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const conn = await this.db.getDb();
      const rows = await conn.select<Todo[]>(
        "SELECT * FROM todos ORDER BY created_at DESC"
      );
      this.todos.set(rows);
    } catch (e) {
      this.error.set(String(e));
    } finally {
      this.loading.set(false);
    }
  }

  async add(title: string): Promise<void> {
    const conn = await this.db.getDb();
    await conn.execute("INSERT INTO todos (title) VALUES (?)", [title.trim()]);
    await this.loadAll();
  }

  async toggleComplete(id: number, completed: number): Promise<void> {
    const conn = await this.db.getDb();
    await conn.execute("UPDATE todos SET completed = ? WHERE id = ?", [
      completed ? 0 : 1,
      id,
    ]);
    await this.loadAll();
  }

  async remove(id: number): Promise<void> {
    const conn = await this.db.getDb();
    await conn.execute("DELETE FROM todos WHERE id = ?", [id]);
    await this.loadAll();
  }

  async clearCompleted(): Promise<void> {
    const conn = await this.db.getDb();
    await conn.execute("DELETE FROM todos WHERE completed = 1");
    await this.loadAll();
  }
}
