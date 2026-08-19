# Preview Run Doc — Haras Gestão

## Prerequisites

- Node.js installed
- Dependencies already installed (`node_modules` present in main checkout)

## Reproduce Uncommitted Artifacts

No `.env` files or other uncommitted artifacts needed — the project runs with defaults.

## Start the Dev Server

From the main checkout directory:

```bash
npm run dev
```

Vite will pick a free port starting from 5173. Check the terminal output for the actual URL.

### Background start (detached, for preview)

Use `nohup` on Git Bash:

```bash
nohup npm run dev > .freebuff/preview.log 2> .freebuff/preview.log.err &
```

The PID is printed after `echo $!`. Check the log for the actual port.

### Windows (PowerShell)

```powershell
Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev' -RedirectStandardOutput '.freebuff\preview.log' -RedirectStandardError '.freebuff\preview.log.err' -WindowStyle Hidden -PassThru
```

## Current Instance

- **Port**: 5176 (5173–5175 were occupied)
- **URL**: http://localhost:5176/
- **PID**: 1632
