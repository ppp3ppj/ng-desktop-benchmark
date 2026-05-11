export {};

declare global {
  interface Window {
    todoAPI: {
      getAll(): Promise<Todo[]>;
      create(input: CreateTodoInput): Promise<Todo>;
      update(input: UpdateTodoInput): Promise<Todo>;
      toggle(id: number): Promise<Todo>;
      delete(id: number): Promise<void>;
    };
  }
}

interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

interface CreateTodoInput {
  title: string;
  description?: string;
}

interface UpdateTodoInput {
  id: number;
  title: string;
  description: string;
}
