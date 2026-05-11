import { Injectable, signal } from "@angular/core";

export type Theme = "light" | "dark" | "cyberpunk";

const STORAGE_KEY = "app-theme";
const DEFAULT_THEME: Theme = "light";

@Injectable({ providedIn: "root" })
export class ThemeService {
  private readonly themes: Theme[] = ["light", "dark", "cyberpunk"];
  readonly current = signal<Theme>(this.load());

  get availableThemes(): Theme[] {
    return this.themes;
  }

  set(theme: Theme): void {
    this.current.set(theme);
    localStorage.setItem(STORAGE_KEY, theme);
    document.documentElement.setAttribute("data-theme", theme);
  }

  init(): void {
    document.documentElement.setAttribute("data-theme", this.current());
  }

  private load(): Theme {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    return saved && this.isValid(saved) ? saved : DEFAULT_THEME;
  }

  private isValid(value: string): value is Theme {
    return (["light", "dark", "cyberpunk"] as string[]).includes(value);
  }
}
