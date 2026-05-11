import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { ThemeService, Theme } from './theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TitleCasePipe],
})
export class App {
  protected readonly themeService = inject(ThemeService);

  protected setTheme(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as Theme;
    this.themeService.setTheme(value);
  }
}
