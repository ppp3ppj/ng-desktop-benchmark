import { Component, inject, OnInit } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { invoke } from "@tauri-apps/api/core";
import { ThemeService } from "./theme.service";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent implements OnInit {
  protected readonly themeService = inject(ThemeService);
  greetingMessage = "";

  ngOnInit(): void {
    this.themeService.init();
  }

  greet(event: SubmitEvent, name: string): void {
    event.preventDefault();
    invoke<string>("greet", { name }).then((text) => {
      this.greetingMessage = text;
    });
  }

  onThemeChange(theme: string): void {
    this.themeService.set(theme as any);
  }
}
