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

## Project structure

```
ng-electron/
├── electron/
│   ├── main.ts          # Electron main process (BrowserWindow, app lifecycle)
│   └── preload.ts       # Context bridge — exposes safe APIs to the renderer
├── src/                 # Angular application source
│   ├── app/
│   ├── styles.css       # TailwindCSS v4 + DaisyUI v5 entry point
│   └── main.ts
├── dist/                # Angular build output (git-ignored)
│   └── ng-electron/
│       └── browser/
├── dist-electron/       # Compiled Electron main process (git-ignored)
│   ├── main.js
│   └── preload.js
├── release/             # Packaged installers from electron-builder (git-ignored)
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
