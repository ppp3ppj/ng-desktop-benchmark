import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-6">
      <h1 class="text-4xl font-bold">ng-electron</h1>
      <p class="text-base-content/60">Angular · Electron · TailwindCSS · DaisyUI · SQLite</p>
      <div class="flex gap-3">
        <button class="btn btn-primary">Primary</button>
        <button class="btn btn-secondary">Secondary</button>
        <button class="btn btn-accent">Accent</button>
      </div>
    </main>
  `,
})
export class HomeComponent {}
