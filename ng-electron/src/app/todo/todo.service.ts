import { Injectable, signal } from '@angular/core';

export interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
}

export interface UpdateTodoInput {
  id: number;
  title: string;
  description: string;
}

@Injectable({ providedIn: 'root' })
export class TodoService {
  readonly todos = signal<Todo[]>([]);
  readonly loading = signal(false);

  constructor() {
    void this.loadAll();
  }

  async loadAll(): Promise<void> {
    if (!('todoAPI' in window)) return;
    this.loading.set(true);
    try {
      this.todos.set(await window.todoAPI.getAll());
    } finally {
      this.loading.set(false);
    }
  }

  async create(input: CreateTodoInput): Promise<void> {
    const todo = await window.todoAPI.create(input);
    this.todos.update(list => [todo, ...list]);
  }

  async update(input: UpdateTodoInput): Promise<void> {
    const updated = await window.todoAPI.update(input);
    this.todos.update(list => list.map(t => (t.id === updated.id ? updated : t)));
  }

  async toggle(id: number): Promise<void> {
    const updated = await window.todoAPI.toggle(id);
    this.todos.update(list =>
      list
        .map(t => (t.id === updated.id ? updated : t))
        .sort((a, b) => Number(a.completed) - Number(b.completed)),
    );
  }

  async delete(id: number): Promise<void> {
    await window.todoAPI.delete(id);
    this.todos.update(list => list.filter(t => t.id !== id));
  }
}
