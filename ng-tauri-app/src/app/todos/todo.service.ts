import { Injectable, inject, signal } from "@angular/core";
import { DatabaseService } from "../database.service";

export interface Todo {
  id: number;
  title: string;
  description: string | null;
  completed: number;
  created_at: string;
}

@Injectable({ providedIn: "root" })
export class TodoService {
  private readonly db$ = inject(DatabaseService).getDb();

  readonly todos = signal<Todo[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async loadAll(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const db = await this.db$;
      const rows = await db.select<Todo[]>(
        "SELECT * FROM todos ORDER BY created_at DESC"
      );
      this.todos.set(rows);
    } catch (e) {
      this.error.set(String(e));
    } finally {
      this.loading.set(false);
    }
  }

  async add(title: string, description: string): Promise<void> {
    const db = await this.db$;
    await db.execute(
      "INSERT INTO todos (title, description) VALUES (?, ?)",
      [title.trim(), description.trim() || null]
    );
    await this.loadAll();
  }

  async update(id: number, title: string, description: string): Promise<void> {
    const db = await this.db$;
    await db.execute(
      "UPDATE todos SET title = ?, description = ? WHERE id = ?",
      [title.trim(), description.trim() || null, id]
    );
    await this.loadAll();
  }

  async toggleComplete(id: number): Promise<void> {
    const db = await this.db$;
    await db.execute(
      "UPDATE todos SET completed = NOT completed WHERE id = ?",
      [id]
    );
    await this.loadAll();
  }

  async remove(id: number): Promise<void> {
    const db = await this.db$;
    await db.execute("DELETE FROM todos WHERE id = ?", [id]);
    await this.loadAll();
  }
}
