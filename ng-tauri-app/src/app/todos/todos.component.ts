import { Component, OnInit, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TodoService, Todo } from "./todo.service";

@Component({
  selector: "app-todos",
  imports: [FormsModule],
  templateUrl: "./todos.component.html",
})
export class TodosComponent implements OnInit {
  readonly svc = inject(TodoService);

  readonly showModal = signal(false);
  readonly editingTodo = signal<Todo | null>(null);
  readonly deleteConfirmId = signal<number | null>(null);

  formTitle = "";
  formDescription = "";

  async ngOnInit(): Promise<void> {
    await this.svc.loadAll();
  }

  openCreate(): void {
    this.editingTodo.set(null);
    this.formTitle = "";
    this.formDescription = "";
    this.showModal.set(true);
  }

  openEdit(todo: Todo): void {
    this.editingTodo.set(todo);
    this.formTitle = todo.title;
    this.formDescription = todo.description ?? "";
    this.showModal.set(true);
  }

  async toggle(id: number): Promise<void> {
    await this.svc.toggleComplete(id);
  }

  async save(): Promise<void> {
    const editing = this.editingTodo();
    if (editing) {
      await this.svc.update(editing.id, this.formTitle, this.formDescription);
    } else {
      await this.svc.add(this.formTitle, this.formDescription);
    }
    this.showModal.set(false);
  }

  confirmDelete(id: number): void {
    this.deleteConfirmId.set(id);
  }

  async doDelete(): Promise<void> {
    const id = this.deleteConfirmId();
    if (id !== null) {
      await this.svc.remove(id);
      this.deleteConfirmId.set(null);
    }
  }
}
