import { contextBridge, ipcRenderer } from 'electron';
import type { CreateTodoInput, Todo, UpdateTodoInput } from './types';

contextBridge.exposeInMainWorld('todoAPI', {
  getAll: (): Promise<Todo[]> =>
    ipcRenderer.invoke('todo:getAll'),

  create: (input: CreateTodoInput): Promise<Todo> =>
    ipcRenderer.invoke('todo:create', input),

  update: (input: UpdateTodoInput): Promise<Todo> =>
    ipcRenderer.invoke('todo:update', input),

  toggle: (id: number): Promise<Todo> =>
    ipcRenderer.invoke('todo:toggle', id),

  delete: (id: number): Promise<void> =>
    ipcRenderer.invoke('todo:delete', id),
});
