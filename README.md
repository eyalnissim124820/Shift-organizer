# Shift Organizer — Manager Portal

A production-ready React web app for managing weekly shift schedules for small teams.

---

## Quick Start

### Prerequisites
- Node.js 18+ and npm

### Install & Run

```bash
# 1. Navigate into the project
cd shift-organizer

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
# Output goes to /dist — deploy anywhere (Netlify, Vercel, nginx, etc.)
```

---

## Features

| Feature | Details |
|---|---|
| **Employees** | Add, edit, deactivate, delete team members |
| **Settings** | Configure shift types with names, hours, and position counts |
| **Schedule** | Weekly grid, click any cell to assign employees, week navigation |
| **Exports** | Download schedule as `.csv` or `.png` image |
| **Data Backup** | Export/import full app data as `.json` via sidebar |
| **Persistence** | All data auto-saves to `localStorage` on every change |

---

## Data Storage

Data lives in the browser's `localStorage` under the key `shift_organizer_v1`.

To move data between browsers or machines:
- **Backup JSON** (sidebar) — downloads a timestamped `.json` snapshot
- **Restore JSON** (sidebar) — imports a previously saved backup

---

## Project Structure

```
shift-organizer/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx              # Entry point
    ├── App.jsx               # Router + layout
    ├── styles/
    │   └── global.css        # Design tokens, reset, animations
    ├── hooks/
    │   ├── useStore.js       # Data layer (localStorage + all mutations)
    │   └── useToast.js       # Toast notifications
    ├── utils/
    │   └── helpers.js        # Date utils, CSV builder, PNG renderer
    ├── components/
    │   ├── UI.jsx            # Button, Input, Field, Modal, Card, Badge…
    │   ├── Sidebar.jsx       # Navigation sidebar
    │   ├── CellSelector.jsx  # Employee dropdown for schedule cells
    │   └── Toast.jsx         # Toast notification display
    └── pages/
        ├── SchedulePage.jsx  # Main weekly grid
        ├── EmployeesPage.jsx # Employee CRUD
        ├── SettingsPage.jsx  # Shift configuration
        └── ExportsPage.jsx   # CSV + PNG downloads
```

---

## PRD Coverage

All 40 acceptance criteria from the PRD are implemented:

- AC-01–07: Employee add / edit / deactivate / delete with confirmation dialogs
- AC-08–14: Shift settings CRUD with full validation
- AC-15–20: Weekly schedule generation, grid display, cell assignment
- AC-21–24: Save with confirmation, cancel flows
- AC-25–28: CSV and PNG export with error handling
- AC-29–35: Empty states, large dataset support, input validation
- AC-36–40: Inactive employee protection, week isolation, regen confirmation, historical integrity

---

## Tech Stack

- **React 18** with hooks
- **React Router v6** for client-side routing
- **Vite** for fast dev + build
- **No UI library** — all components hand-crafted
- **No backend** — localStorage + JSON file export/import

---

## Design

Aesthetic direction: **warm industrial** — off-white parchment tones, dark ink sidebar, burnt sienna accent.  
Typography: **Syne** (display) + **JetBrains Mono** (body/mono).
