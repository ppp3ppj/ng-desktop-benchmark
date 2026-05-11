# ng-tauri-app

> **This is a Proof-of-Concept (POC) application.**
> Some behaviours are intentionally simplified or hardcoded for demonstration purposes.
> See [POC Limitations](#-poc-limitations) before using this as a production reference.

Desktop app built with Angular 21 + Tauri 2. Uses a file-based SQLite migration system powered by a custom Rust `build.rs` code generator.

---

## Tech Stack

| Layer | Library | Version | Purpose |
|-------|---------|---------|---------|
| Frontend | Angular | 21.2 | UI framework (standalone components, signals) |
| Desktop shell | Tauri | 2 | Native window, OS integration |
| Language (Rust) | Rust edition 2021 | — | Tauri backend, build scripts |
| Language (TS) | TypeScript | 5.9 | Angular code |
| Styling | TailwindCSS | 4.3 | Utility CSS (CSS-first config) |
| Component library | DaisyUI | 5.5 | UI components + theming |
| Icons | Remixicon | 4.9 | Icon font (`ri-*` classes) |
| Font | Inter Variable | 5.2 | Self-hosted via Fontsource |
| Database | SQLite | — | Local persistence via tauri-plugin-sql |
| Package manager | bun | 1.x | JS dependency management |

---

## Project Structure

```
ng-tauri-app/
├── migrations/                          # SQL migration files (source of truth)
│   ├── 20260511000000_init.up.sql
│   ├── 20260511000000_init.down.sql
│   ├── 20260511000001_add_description.up.sql
│   └── 20260511000001_add_description.down.sql
│
├── src/                                 # Angular application
│   ├── styles.css                       # TailwindCSS + DaisyUI + font imports
│   └── app/
│       ├── app.config.ts                # Bootstrap: DB init via provideAppInitializer
│       ├── app.routes.ts                # Lazy routes
│       ├── app.component.*              # Root layout: navbar + theme switcher
│       ├── database.service.ts          # SQLite connection singleton
│       ├── theme.service.ts             # Theme state + localStorage persistence
│       ├── home/                        # DaisyUI component showcase page
│       └── todos/
│           ├── todo.service.ts          # CRUD + signals
│           └── todos.component.*        # Todos page (create / edit / delete modals)
│
├── src-tauri/
│   ├── build.rs                         # Auto-generates migrations() from SQL files
│   ├── Cargo.toml
│   ├── capabilities/default.json        # Tauri permission grants (sql:allow-*)
│   └── src/
│       ├── lib.rs                       # Tauri Builder: registers plugins + migrations
│       └── main.rs
│
├── postcss.config.json                  # Required by Angular build pipeline for TailwindCSS
├── angular.json
└── package.json
```

---

## Getting Started

### Prerequisites

| Tool | Install |
|------|---------|
| Node.js 20+ | https://nodejs.org |
| bun | `npm i -g bun` |
| Rust + cargo | https://rustup.rs |
| Tauri prerequisites | https://tauri.app/start/prerequisites/ |

### Install dependencies

```bash
bun install
```

### Run in development

```bash
bun run tauri dev
```

Starts the Angular dev server on `http://localhost:1420` and opens a native Tauri window. Hot-reload works for Angular; Rust changes require a Tauri restart.

---

## Build & Distribution

> Each command must run **on the target OS** — Tauri does not cross-compile by default.

```bash
bun run dist           # Current OS, all bundles
bun run dist:win       # Windows  → .msi + NSIS .exe   (run on Windows)
bun run dist:mac       # macOS   → .dmg + .app          (run on macOS)
bun run dist:linux     # Linux   → .deb + .rpm + .AppImage (run on Linux)
```

Output: `src-tauri/target/release/bundle/`

For CI cross-platform releases, use GitHub Actions with one job per OS each calling `bun run dist`.

---

## Database Migrations

### How it works

Migrations live as plain SQL files in `migrations/`. A custom Rust `build.rs` script scans the folder at **compile time**, reads each file, and generates a `migrations()` function compiled into the binary. No runtime file I/O — the SQL is embedded in the executable.

`tauri-plugin-sql` runs all pending migrations automatically when the database is first opened, which is triggered by `provideAppInitializer` on app launch.

```
migrations/*.sql
    ↓  build.rs  (compile time — scans, reads, generates)
$OUT_DIR/migrations.rs  ←  include!() in lib.rs
    ↓  tauri-plugin-sql  (runtime, app launch)
sqlite:app.db  (app data directory)
```

### Naming convention

```
<timestamp>_<description>.up.sql
<timestamp>_<description>.down.sql
```

| Part | Format | Example |
|------|--------|---------|
| `timestamp` | 14-digit sortable `YYYYMMDDHHmmss` | `20260601120000` |
| `description` | snake_case, no spaces | `add_priority` |

Both `.up.sql` and `.down.sql` must exist for every version.

### Adding a new migration — step by step

**Step 1 — Create the two SQL files**

```bash
# Example: add a priority column to todos
touch migrations/20260601120000_add_priority.up.sql
touch migrations/20260601120000_add_priority.down.sql
```

`20260601120000_add_priority.up.sql`:
```sql
ALTER TABLE todos ADD COLUMN priority INTEGER NOT NULL DEFAULT 0;
```

`20260601120000_add_priority.down.sql`:
```sql
ALTER TABLE todos DROP COLUMN priority;
```

**Step 2 — Run the app**

```bash
bun run tauri dev
```

`build.rs` detects the new files via `cargo:rerun-if-changed` and regenerates `migrations()` automatically. **No Rust code changes needed.**

### Migration rules

| Rule | Reason |
|------|--------|
| Never edit a released migration | Already applied on user machines — changes are silently ignored |
| Always provide a `.down.sql` | Required even if it is a no-op (`SELECT 1;`) |
| Timestamp must be unique | Duplicate versions cause a compile-time panic |
| Use `IF NOT EXISTS` / `IF EXISTS` guards | Makes migrations safe to re-run during development |
| One logical change per migration | Easier to debug and roll back |

### Debug trace output

In debug builds (`bun run tauri dev`), `build.rs` prints a migration summary to the terminal:

```
warning: ╔══ migrations codegen ══ 4 migration(s) found
warning: ║  [Up  ] v20260511000000 — init
warning: ║  [Down] v20260511000000 — init
warning: ║  [Up  ] v20260511000001 — add_description
warning: ║  [Down] v20260511000001 — add_description
warning: ╚══ generated → $OUT_DIR/migrations.rs
warning: ║  debug copy → src/migrations_generated.rs
```

It also writes `src-tauri/src/migrations_generated.rs` — a readable copy of the generated Rust code for IDE inspection. This file is listed in `.gitignore` and is never committed.

In release builds (`bun run dist:*`) this output is completely suppressed.

---

## Theming

Three themes are available: `light` (default), `dark`, `cyberpunk`.

Selected theme is persisted in `localStorage` under the key `app-theme` and applied to `<html data-theme="...">` which DaisyUI reads. `ThemeService.init()` restores it before the first render.

**To add a theme:**

1. Add it to `src/styles.css`:
```css
@plugin "daisyui" {
  themes: light --default, dark --prefersdark, cyberpunk, <new-theme>;
}
```

2. Add it to the `Theme` union type and `themes` array in `theme.service.ts`.

---

## Angular Patterns Used

| Pattern | Where | Notes |
|---------|-------|-------|
| Standalone components | All components | No `NgModule` anywhere |
| Signals | Services, components | `signal()`, `computed()` throughout |
| `provideAppInitializer` | `app.config.ts` | Modern replacement for deprecated `APP_INITIALIZER` token |
| Lazy routes | `app.routes.ts` | `loadComponent()` per route |
| `inject()` in initializer | `app.config.ts` | Works inside `provideAppInitializer` callback |
| Promise singleton | `DatabaseService` | `Database.load()` fires once; Promise shared by all callers |

---

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) with:
- [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
- [Angular Language Service](https://marketplace.visualstudio.com/items?itemName=Angular.ng-template)

---

## POC Limitations

This application proves architectural concepts. The following are known simplifications that must be addressed before any production use.

### build.rs migration generator

> **POC behaviour:** `build.rs` re-runs whenever a migration file changes (Cargo `rerun-if-changed`). In debug mode it also writes `migrations_generated.rs` on every compile for inspection. SQL content is embedded into the binary at compile time — there is no runtime file dependency.
>
> This is intentional for the POC — it proves that zero-config file-based migrations are achievable without a runtime filesystem dependency.
>
> **For production:** evaluate whether `sqlx::migrate!()` or a dedicated migration runner (Flyway-style) better fits your deployment and rollback model.

### Other known hardcoding

| Area | Current behaviour | Production recommendation |
|------|------------------|--------------------------|
| DB path | Hardcoded `sqlite:app.db` in `database.service.ts` | Derive from app name or make configurable |
| Themes | Three themes hardcoded in CSS and `ThemeService` | Drive from a config file or server |
| Error handling | SQL errors exposed as raw strings in `error` signal | Add structured error types and user-friendly messages |
| No rollback UI | Migrations run forward only; no way to roll back from UI | Implement explicit rollback or schema recovery flow |
| No auth | App opens directly with no login | Add authentication if stored data is sensitive |

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `migrations/*.sql` | SQL migration source — **only place to add schema changes** |
| `src-tauri/build.rs` | Compile-time migration scanner and code generator |
| `src-tauri/src/lib.rs` | Tauri entry: registers plugins, loads generated migrations |
| `src-tauri/capabilities/default.json` | Grants `sql:allow-*` permissions to the frontend |
| `src/app/database.service.ts` | SQLite singleton — one `Database.load()` Promise shared app-wide |
| `src/app/app.config.ts` | `provideAppInitializer` ensures DB is open before any route renders |
| `postcss.config.json` | **Must be `.json`** — Angular ignores `.js` / `.mjs` PostCSS configs |
| `src/styles.css` | Global CSS: TailwindCSS import, DaisyUI plugin, font imports |
