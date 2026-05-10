import { effect, inject, Injectable, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type Theme = 'light' | 'dark' | 'cyberpunk';

const THEMES: Theme[] = ['light', 'dark', 'cyberpunk'];
const STORAGE_KEY = 'app-theme';
const DEFAULT_THEME: Theme = 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);

  readonly theme = signal<Theme>(this.loadTheme());
  readonly themes = THEMES;

  constructor() {
    effect(() => {
      const t = this.theme();
      this.doc.documentElement.setAttribute('data-theme', t);
      localStorage.setItem(STORAGE_KEY, t);
    });
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);
  }

  private loadTheme(): Theme {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (THEMES as string[]).includes(stored ?? '') ? (stored as Theme) : DEFAULT_THEME;
  }
}
