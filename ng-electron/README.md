# ng-electron

Angular 21 + Electron 42 desktop application with TailwindCSS v4 and DaisyUI v5.

## Prerequisites

- [Bun](https://bun.sh/) >= 1.3
- [Node.js](https://nodejs.org/) >= 20 (required by Electron)

## Install dependencies

```bash
bun install
```

---

## Angular web server

Start the Angular dev server (hot reload at `http://localhost:4200`):

```bash
bun run start
```

Build for production (output to `dist/ng-electron/browser/`):

```bash
bun run build
```

Build in watch mode (rebuilds on file changes):

```bash
bun run watch
```

---

## Electron desktop app

### Development

Build Angular + compile the Electron main process, then open the desktop window:

```bash
bun run electron:dev
```

### Build only (no launch)

Compiles Angular with the `electron` configuration (`baseHref: "./"`) and compiles
the TypeScript main process to `dist-electron/`:

```bash
bun run electron:build
```

### Launch after build

If you have already run `electron:build`, start Electron without rebuilding:

```bash
bun run electron:start
```

### Compile only the Electron main process

Re-compiles `electron/main.ts` and `electron/preload.ts` without touching the Angular build:

```bash
bun run electron:compile
```

---

## Package for distribution

Packaged installers are written to the `release/` folder.

| Command | Output |
|---|---|
| `bun run dist:win` | Windows — `.exe` installer (NSIS, x64) |
| `bun run dist:mac` | macOS — `.dmg` (x64 + arm64) |
| `bun run dist:linux` | Linux — `.AppImage` + `.deb` (x64) |

Each command runs `electron:build` first, then calls `electron-builder`.

> **Cross-compilation limits**
> - **macOS** packages can only be built on a Mac (Apple code-signing).
> - **Windows** packages can be built on Windows natively; cross-compiling from Linux/Mac requires Wine.
> - **Linux** packages can be built from any platform.

### App icons

Place icons in `public/icons/` before packaging:

| File | Platform |
|---|---|
| `public/icons/icon.ico` | Windows |
| `public/icons/icon.icns` | macOS |
| `public/icons/icon.png` | Linux (256×256 min) |

---

## Database

### Location

The SQLite database file (`app.db`) is stored in Electron's **userData** directory,
which is platform-specific:

| Platform | Path |
|---|---|
| **Windows** | `C:\Users\<you>\AppData\Roaming\NgElectron\app.db` |
| **macOS** | `~/Library/Application Support/NgElectron/app.db` |
| **Linux** | `~/.config/NgElectron/app.db` |

On Windows you can open the folder directly by pasting this in File Explorer's address bar:

```
%APPDATA%\NgElectron\
```

> The folder name (`NgElectron`) comes from `"productName"` in the `build` section
> of `package.json`. Change it there to rename the folder.

### Engine

Uses **`node:sqlite`** — SQLite built into Node.js 22 (bundled with Electron 42).
No native compilation or extra packages required.

---

## Database migrations

Migrations live in `electron/db/migrations/`. Each file is a self-contained schema
change that runs exactly once, tracked by a `migrations` table inside `app.db`.

### How it works

```
app starts
  └─▶ getDb()  opens / creates app.db
        └─▶ runMigrations()
              ├─ ensures migrations table exists
              ├─ reads applied IDs from DB
              └─ for each pending migration → runs up(db) → records ID
```

### Migration file structure

```
electron/db/
├── database.ts               ← opens DB, calls runMigrations()
└── migrations/
    ├── types.ts              ← Migration interface { id, up(db) }
    ├── runner.ts             ← orchestrates pending migrations
    ├── 001_create_todos.ts   ← initial schema
    └── 002_your_change.ts    ← next migration (example)
```

### Adding a new migration

**Step 1 — create the file** following the `NNN_description.ts` naming convention:

```ts
// electron/db/migrations/002_add_priority.ts
import type { Migration } from './types';

export const migration: Migration = {
  id: '002_add_priority',
  up(db) {
    db.exec(`
      ALTER TABLE todos ADD COLUMN priority INTEGER NOT NULL DEFAULT 0
    `);
  },
};
```

**Step 2 — register it** in `runner.ts`:

```ts
import { migration as m001 } from './001_create_todos';
import { migration as m002 } from './002_add_priority'; // ← add

const ALL_MIGRATIONS: Migration[] = [m001, m002]; // ← add
```

That's it. The next time the app launches, `runMigrations()` will detect that
`002_add_priority` has not been applied and run `up(db)` automatically.

> **Rules**
> - Never edit a migration that has already shipped — add a new one instead.
> - Always keep migrations in ascending numeric order in `ALL_MIGRATIONS`.
> - `id` must be unique and stable across all environments.

---

## Project structure

```
ng-electron/
├── electron/
│   ├── main.ts              # App lifecycle, registers IPC handlers
│   ├── preload.ts           # contextBridge — exposes todoAPI to the renderer
│   ├── types.ts             # Shared TypeScript interfaces (Todo, inputs)
│   ├── db/
│   │   ├── database.ts      # Opens SQLite DB, runs migrations
│   │   └── migrations/
│   │       ├── types.ts     # Migration interface
│   │       ├── runner.ts    # Migration runner (tracks applied migrations)
│   │       └── 001_create_todos.ts
│   └── ipc/
│       └── todo.ipc.ts      # IPC handlers for CRUD operations
├── src/                     # Angular application source
│   ├── app/
│   │   ├── home/            # Home page component
│   │   ├── todo/            # Todo CRUD page + service
│   │   ├── app.ts           # Root shell (navbar + router-outlet)
│   │   └── theme.service.ts # Theme persistence (localStorage)
│   ├── electron.d.ts        # window.todoAPI type declaration
│   ├── styles.css           # TailwindCSS v4 + DaisyUI v5 entry point
│   └── main.ts
├── dist/                    # Angular build output (git-ignored)
├── dist-electron/           # Compiled Electron main process (git-ignored)
├── release/                 # Packaged installers from electron-builder (git-ignored)
├── tsconfig.electron.json   # TypeScript config for the Electron process
├── postcss.config.json      # PostCSS config (required by Angular for Tailwind v4)
└── angular.json
```

---

## CSS stack

| Package | Version | Role |
|---|---|---|
| TailwindCSS | v4 | Utility classes |
| DaisyUI | v5 | Component library |
| `@tailwindcss/postcss` | v4 | PostCSS integration for Angular |

Styles are configured in `src/styles.css`:

```css
@import "tailwindcss";
@plugin "daisyui";
```

> **Note:** Angular only reads `postcss.config.json` (not `.mjs` or `.js`).
> The `postcss.config.json` file at the project root is required for TailwindCSS
> and DaisyUI to work inside the Angular build pipeline.

---

## Angular CLI

Generate a new component:

```bash
ng generate component component-name
```

Run unit tests:

```bash
bun run test
```
