import { Component, OnInit, inject, signal, computed } from "@angular/core";
import { SlicePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TodoService } from "./todo.service";

type Filter = "all" | "active" | "completed";

@Component({
  selector: "app-todos",
  imports: [FormsModule, SlicePipe],
  templateUrl: "./todos.component.html",
})
export class TodosComponent implements OnInit {
  readonly todoService = inject(TodoService);

  newTitle = "";
  filter = signal<Filter>("all");

  readonly filtered = computed(() => {
    const todos = this.todoService.todos();
    const f = this.filter();
    if (f === "active") return todos.filter((t) => !t.completed);
    if (f === "completed") return todos.filter((t) => t.completed);
    return todos;
  });

  readonly remaining = computed(
    () => this.todoService.todos().filter((t) => !t.completed).length
  );

  async ngOnInit(): Promise<void> {
    await this.todoService.loadAll();
  }

  async onAdd(): Promise<void> {
    if (!this.newTitle.trim()) return;
    await this.todoService.add(this.newTitle);
    this.newTitle = "";
  }

  async onToggle(id: number, completed: number): Promise<void> {
    await this.todoService.toggleComplete(id, completed);
  }

  async onDelete(id: number): Promise<void> {
    await this.todoService.remove(id);
  }

  async onClearCompleted(): Promise<void> {
    await this.todoService.clearCompleted();
  }

  setFilter(f: Filter): void {
    this.filter.set(f);
  }
}
