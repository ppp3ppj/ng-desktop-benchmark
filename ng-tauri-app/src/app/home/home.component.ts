import { Component, signal } from "@angular/core";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
})
export class HomeComponent {
  counter = signal(0);
  alertVisible = signal(true);

  increment(): void {
    this.counter.update((c) => c + 1);
  }

  decrement(): void {
    this.counter.update((c) => c - 1);
  }
}
