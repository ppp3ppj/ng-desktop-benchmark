import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TodoService, Todo } from './todo.service';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
})
export class TodoComponent {
  protected readonly svc = inject(TodoService);

  protected readonly showModal = signal(false);
  protected readonly editingTodo = signal<Todo | null>(null);
  protected readonly deleteConfirmId = signal<number | null>(null);

  protected formTitle = '';
  protected formDescription = '';

  protected openCreate(): void {
    this.editingTodo.set(null);
    this.formTitle = '';
    this.formDescription = '';
    this.showModal.set(true);
  }

  protected openEdit(todo: Todo): void {
    this.editingTodo.set(todo);
    this.formTitle = todo.title;
    this.formDescription = todo.description;
    this.showModal.set(true);
  }

  protected async save(): Promise<void> {
    const title = this.formTitle.trim();
    if (!title) return;
    const editing = this.editingTodo();
    if (editing) {
      await this.svc.update({ id: editing.id, title, description: this.formDescription });
    } else {
      await this.svc.create({ title, description: this.formDescription });
    }
    this.showModal.set(false);
  }

  protected toggle(id: number): void {
    void this.svc.toggle(id);
  }

  protected confirmDelete(id: number): void {
    this.deleteConfirmId.set(id);
  }

  protected async doDelete(): Promise<void> {
    const id = this.deleteConfirmId();
    if (id == null) return;
    await this.svc.delete(id);
    this.deleteConfirmId.set(null);
  }
}
