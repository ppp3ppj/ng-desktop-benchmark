import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  protected readonly alertVisible = signal(true);
  protected readonly counter = signal(0);

  protected increment(): void {
    this.counter.update(n => n + 1);
  }

  protected decrement(): void {
    this.counter.update(n => n - 1);
  }
}
