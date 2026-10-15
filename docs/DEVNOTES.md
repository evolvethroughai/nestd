# Nestd — Dev Notes (Personal Reference)

## What This App Is
- Name: **Nestd — Get Sortd**
- **v1 (old):** Pure HTML / CSS / vanilla JS — no Node, no npm, no build tools → `docs/`
- **v2 (current):** React + TypeScript + Vite + Tailwind CSS → `GStudio/project_clean/docs/`
- Hosted on **GitHub Pages** via the `docs/` folder of each repo
- Firebase project: `nestd---get-sortd`
- localStorage key (old): `jt-v5` | localStorage keys (new): `nestd_*` per data type
- PWA — installable on Android/iOS via browser prompt

---

## Apps Used
- Firebase and Supabase for free hosting
- Claude, ChatGPT, Gemini, Grok for reference
- Canva for logo
- **Amazon Q Developer** (VS Code) — primary agent for building and debugging

---

## Folder Structure — v2 (React App)

```
GStudio/project_clean/docs/
├── index.html                  ← source HTML, has manifest + PWA meta tags
├── vite.config.ts              ← base: './', React + Tailwind plugins
├── package.json                ← firebase ^13, react ^19, tailwind ^4, vite ^8
├── tsconfig.json
├── public/
│   ├── manifest.webmanifest    ← PWA manifest (3 icon entries: any/any/maskable)
│   └── icons/
│       ├── nestd-192.png       ← real icon (52KB), copied from old app
│       └── nestd-512.png       ← real icon (307KB), copied from old app
├── src/
│   ├── main.tsx
│   ├── App.tsx                 ← all state, handlers, Firebase auth + Firestore sync
│   ├── firebase.ts             ← Firebase SDK init, fbSignIn, fbSignOut, sync helpers
│   ├── types/index.ts          ← all TypeScript interfaces matching jt-v5 schema
│   ├── data/mockData.ts        ← INITIAL_* seed data (real data, not mock)
│   └── components/
│       ├── Header.tsx          ← shows real user photo/name, "Synced ✓" when signed in
│       ├── BottomNav.tsx
│       ├── TodayScreen.tsx     ← dynamic greeting, real date, streak badge, user photo
│       ├── ListsScreen.tsx     ← dynamic bill/chit/EMI computed values (no hardcoding)
│       ├── GroceryManager.tsx  ← Buy now / Master list / Bought history / Vegetables
│       ├── ChitsManager.tsx    ← full chit calculator, lift/close modals
│       ├── EmisManager.tsx     ← amortization, part payments, months saved
│       ├── BillsManager.tsx    ← multi-meter connections, sub-bills
│       ├── InvestmentsManager.tsx
│       ├── HealthManager.tsx
│       ├── BusinessManager.tsx
│       ├── SortiScreen.tsx     ← AI auto-sort companion
│       ├── FocusModal.tsx
│       ├── ItemDetailsModal.tsx
│       ├── NewEntryModal.tsx
│       └── ProfileModal.tsx    ← Google sign-in / sign-out, streak display
└── docs/                       ← pre-built output (what GitHub Pages serves)
    ├── index.html              ← has manifest link + theme-color + apple-touch-icon
    ├── manifest.webmanifest    ← copied from public/ after build
    ├── icons/
    │   ├── nestd-192.png
    │   └── nestd-512.png
    └── assets/
        ├── index-*.js
        └── index-*.css
```

---

## Folder Structure — v1 (Old Vanilla JS App)

```
docs/
├── index.html          ← single HTML file, all UI structure lives here
├── manifest.json       ← PWA manifest
├── css/
│   └── styles.css      ← all styles, single file
└── js/
    ├── data.js         ← app data schema / defaults
    ├── store.js        ← localStorage read/write, save(), renderAll()
    ├── ui.js           ← shared UI helpers (toast, $(), esc(), nm())
    ├── render.js       ← main render functions (today, lists, etc.)
    ├── render2.js      ← updated render with two-line grocery rows, delete buttons
    ├── grocery.js      ← grocery list logic
    ├── life-utils.js   ← date helpers: lifeDueDays, lifeDueCls, lifeDueLbl, subDueDate
    ├── life-bills.js   ← BILL_PORTALS, getBillPortal, lcRow, lcSubRow, billWithSubs, renderBillsPage
    ├── life-chits.js   ← chitOpenState, renderChitsPage, chitCard, chit calculator HTML
    ├── life.js         ← thin router: renderLifePage(type)
    ├── life-modal.js   ← lmClose, lmOpenSub, lmOpen, lm-save.onclick, lm-del.onclick
    ├── life-events.js  ← openLifePage, closeLifePage, all click/input handlers
    ├── app2.js         ← app init, nav, today view, focus mode, profile, delete handlers
    └── firebase.js     ← Firebase auth + Firestore sync
```

---

## localStorage Keys

| Key | App | Contains |
|---|---|---|
| `jt-v5` | v1 (old) | Entire `st` object — items, groceries, bills, chits, emis, streak, etc. |
| `nestd_today_tasks` | v2 (new) | Today's focus tasks array |
| `nestd_chits` | v2 | Chits array |
| `nestd_emis` | v2 | EMI loans array |
| `nestd_bills` | v2 | Bills array |
| `nestd_sub_bills` | v2 | Sub-bills / connections array |
| `nestd_groceries_v2` | v2 | All grocery items (C + V categories) |
| `nestd_quick_tasks` | v2 | Quick task categories + tasks |
| `nestd_investments` | v2 | Investments array |
| `nestd_health` | v2 | Health items array |
| `nestd_business` | v2 | Business ideas + tasks |
| `nestd_streak` | v2 | `{ count, last }` streak object |
| `nestd_week_key` | v2 | Monday-anchored week key for veg reset |
| `nestd_day_key` | v2 | Today key for daily streak check |

---

## Firebase

- SDK version: v1 uses `9.23.0` compat mode | v2 uses `^13.0.0` modular
- Auth: Google sign-in (popup)
- Firestore path: `users/{uid}/data/state` → `{ json: "..." }`
- Sync: debounced 800ms push on any state change when signed in
- On sign-in: `listenFirestore` attaches and merges remote data into all React state
- Firebase config (both apps use same project):
  ```
  projectId: nestd---get-sortd
  authDomain: nestd---get-sortd.firebaseapp.com
  ```

---

## PWA / Icons

- Manifest: `manifest.webmanifest` (v2) / `manifest.json` (v1)
- Icons: `nestd-192.png` (52KB) and `nestd-512.png` (307KB) — real icons from Canva
- **Important:** `"any maskable"` combined purpose is wrong — must be two separate entries:
  ```json
  { "src": "./icons/nestd-512.png", "sizes": "512x512", "purpose": "any" },
  { "src": "./icons/nestd-512.png", "sizes": "512x512", "purpose": "maskable" }
  ```
- After every `vite build`, manually copy `public/icons/` and `public/manifest.webmanifest` into `docs/` output — Vite copies public/ automatically but the pre-built output in repo needs manual sync
- Built `docs/index.html` must have these tags (Vite strips them if not in source at build time):
  ```html
  <meta name="theme-color" content="#4648d4" />
  <link rel="manifest" href="./manifest.webmanifest" />
  <link rel="apple-touch-icon" href="./icons/nestd-192.png" />
  ```

---

## Key Logic Ported from v1 → v2

| v1 (store.js / data.js) | v2 (App.tsx) | Notes |
|---|---|---|
| `save()` | `useEffect` with `localStorage.setItem` | Runs on every state change |
| `roll()` — weekly veg reset | `useEffect` on mount, checks `nestd_week_key` | Resets all Vegetables to `completed: false` on new Monday-anchored week |
| `roll()` — daily streak | `useEffect` on mount, checks `nestd_day_key` | Increments streak if all tasks done previous day |
| `migrate()` | Seed data in `mockData.ts` already at v5 schema | No migration needed for fresh installs |
| `fill()` | Not yet ported | Old: picks top 5 tasks by priority queue into Today |
| `pr(x)` | Not yet ported | Old: computes effective priority (due date overrides section priority) |
| `queue(p)` | Not yet ported | Old: returns undone tasks at priority p, sorted by due date then section order |
| `dueDays(x)` | `dueDaysFromDay(dueDay)` in ListsScreen | Computes days until next occurrence of a day-of-month |
| `lbOf(t)` | Not yet ported | Old: last bought timestamp for a grocery item name |

---

## Data Shape — Chits (`ChitItem`)
```ts
{
  id: string;
  name: string;
  monthlyAmt: number;
  pot: number;
  totalMonths: number;
  startDate: string;       // YYYY-MM-DD
  dueDay: number;          // day of month payment is due
  status: 'paying' | 'done';
  note?: string;
  lifted: boolean;
  liftedDate?: string;     // YYYY-MM-DD
  liftedMonth?: number;    // auto-derived from startDate + liftedDate
  commission?: number;
  amtReceived?: number;    // pot - commission
  closedDate?: string;     // YYYY-MM-DD
  closedMonth?: number;
}
```

---

## Data Shape — Grocery (`GroceryItem`)
```ts
{
  id: string;
  name: string;
  group: 'Staples / food' | 'Household / personal' | 'Pooja' | 'Fruit' | 'Nuts, seeds and snacks' | 'Vegetables';
  store?: string;
  needed: boolean;         // Buy now flag (x.n in v1)
  completed: boolean;      // Marked bought (x.d in v1)
  quantity?: string;
  price?: string;
  boughtDate?: string;     // YYYY-MM-DD
  boughtTimestamp?: number;
  lastBought?: string;     // "12 Oct 2026"
}
```

Grocery categories map:
- `C` tab = all groups except Vegetables (Shopping & Staples)
- `V` tab = Vegetables only (Weekly Mandi)
- Weekly reset: every Monday, all Vegetables items get `completed: false`

---

## Bugs Fixed & How

### 1. App completely broken — syntax error in life.js (v1)
**Symptom:** Entire app white screen / JS error on load.
**Root cause:** Every `||':''` pattern was a JS syntax error — `'` inside `':'` terminated the outer string literal early.
**Fix:** Replace all `||':''` with `||''`.
**Rule:** Never use `||':''` in single-quoted JS strings.

### 2. PowerShell corrupts JS files
**Symptom:** After using PowerShell regex replace on a JS file, encoding corruption (BOM, CRLF, broken characters).
**Fix:** Always use `fsReplace` with exact strings, or `fsWrite` full rewrites. Never use PowerShell `-replace` on JS files.

### 3. Emoji encoding corruption in render2.js (v1)
**Symptom:** Emojis written directly into JS files via fsReplace show as `dY`, `バ` etc. on disk.
**Fix:** Use HTML entities (`&#9998;`, `&#128465;`) instead of emoji characters in JS strings.

### 4. Built index.html missing PWA tags (v2)
**Symptom:** App icon missing on Android, no install prompt.
**Root cause:** Pre-built `docs/index.html` was generated before manifest/icon tags were in source `index.html`. Vite strips tags it doesn't know about during build.
**Fix:** Manually add `<link rel="manifest">`, `<meta name="theme-color">`, `<link rel="apple-touch-icon">` to the built `docs/index.html` after each build.

### 5. App icons were placeholder files (v2)
**Symptom:** Icon showed as tiny/blank on home screen.
**Root cause:** `nestd-192.png` and `nestd-512.png` in `public/icons/` were 2KB/7KB placeholder files.
**Fix:** Replaced with real icons from old app (`icon-192.png` = 52KB, `icon-512.png` = 307KB).

### 6. Hardcoded date/streak/bill values in UI (v2)
**Symptom:** "Wednesday, 15 Oct", "5-day streak", "BESCOM due in 2d", "₹3,605" were all static strings.
**Fix:**
- `getDynamicGreeting()` + `getDynamicDateLabel()` using `new Date()` with `toLocaleDateString`
- `streak` state persisted to `nestd_streak`, passed as prop to TodayScreen
- `dueDaysFromDay(dueDay)` computes days until next bill due date
- `billsTotal` sums unpaid bills' `amt` fields
- `chitDueLabel`, `emiDueLabel` derived from actual chit/EMI data

---

## Mobile UI Rules (learned the hard way)
- Minimum touch target: 44×44px for buttons
- Never put two full dates side by side on one line at 11px — stack them vertically
- `flex` children need `min-width:0` or they overflow their container
- `flex-wrap:wrap` on rows that contain long text + amounts
- Status badges: keep text short (max 2 words) when inside a flex header row
- Global CSS rules (`input[type=text]`) always win unless you use a specific enough selector
- `file://` URLs don't bust cache with `?v=N` — only renaming files works

---

## Useful Patterns (v2 / React)

### Dynamic greeting
```ts
function getDynamicGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
```

### Days until next occurrence of a day-of-month
```ts
function dueDaysFromDay(dueDay: number): number {
  const today = new Date();
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), dueDay);
  if (thisMonth < today) thisMonth.setMonth(thisMonth.getMonth() + 1);
  return Math.round((thisMonth.getTime() - today.setHours(0,0,0,0)) / 86400000);
}
```

### Monday-anchored week key (for veg reset)
```ts
function getWeekKey(): string {
  const d = new Date();
  const t = new Date(d);
  t.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday
  return `${t.getFullYear()}-${t.getMonth() + 1}-${t.getDate()}`;
}
```

### Debounced Firestore sync
```ts
const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
useEffect(() => {
  if (!fbUser) return;
  if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
  syncTimerRef.current = setTimeout(() => {
    syncToFirestore(fbUser.uid, { ...allState }).catch(() => {});
  }, 800);
}, [allState, fbUser]);
```

---

## Agent Tool Notes (Amazon Q Developer)

| Tool | Used for |
|---|---|
| `fsRead` | Reading files before editing, verifying changes |
| `fsWrite` | Full file rewrites when changes are too large for fsReplace |
| `fsReplace` | Targeted edits to specific lines |
| `executeBash` | `findstr` to find exact line content, `copy` for file operations, `dir` to check file sizes |
| `listDirectory` | Checking folder structure |
| `codeReview` | Security and quality scans |

**fsReplace rules:**
- Must match EXACTLY including whitespace and line breaks
- Fails if the same string appears multiple times — include more surrounding context
- Cannot match corrupted emoji content — use fsWrite for full rewrite instead

---

## Backup Location
`Task_manager/docs/` mirrors `docs/` (v1) and is the known-good backup.
After every working change, sync the backup manually.

---

## Summary of My AI Agent (Amazon Q Developer)

This app was built and debugged entirely using **Amazon Q Developer** inside VS Code — running in the IDE as an agentic coding assistant.

### What the agent did across this project

| Area | What was done |
|---|---|
| **v1 Debugging** | Found the `||':''` syntax error that crashed the entire app |
| **v1 File split** | Broke 700+ line monolithic `life.js` into 6 focused files |
| **v1 Chit date system** | DD/MM/YYYY 3-select dropdowns, stored as `YYYY-MM-DD` |
| **v1 Chit calculator** | Standalone planning calculator — profit/loss with/without lifting, break-even month |
| **v1 Grocery two-line layout** | Rewrote `gmRow`/`gnRow` with name on top, controls on second line |
| **v1 Delete buttons** | Added rename/delete directly on custom section cards |
| **v2 Migration** | Migrated all logic from vanilla JS into React+TypeScript+Vite |
| **v2 Dynamic values** | Replaced all hardcoded date/streak/bill strings with computed values |
| **v2 Firebase auth** | Wired Google sign-in, Firestore sync, auth state in Header + ProfileModal |
| **v2 PWA icons** | Fixed placeholder icons, manifest split, built output missing files |
| **v2 Weekly veg reset** | Ported `roll()` — Monday-anchored week key, resets Vegetables on new week |
| **v2 Streak** | Ported streak logic — persisted, increments on daily task completion |

---

# Daily Session Logs

---

## 📅 Session — 13 Oct 2026

### What we worked on today

**1. Complete date system for chits**
- Start date changed from `type="month"` to DD/MM/YYYY 3-select dropdowns
- Stored as `YYYY-MM-DD` internally, displayed as `DD MMM YYYY`
- `monthsDone` accounts for actual day of month

**2. Lifted date and Closed date**
- Both use DD/MM/YYYY selects defaulting to today
- `liftedMonth` / `closedMonth` auto-derived from startDate

**3. Collapsible chit cards**
- Collapsed by default — `chitOpenState{}` remembers state across re-renders

**4. Edit lifted date**
- "Lifted on" row has ✎ icon, opens lift modal pre-filled for correction

**5. Chit calculator**
- Universal calculator at top of chits page
- Shows profit/loss with and without lifting, break-even month

**6. Mobile UI fixes**
- Status badge shortened, due badge moved below name, flex overflow fixes

**7. DEVNOTES.md created**

### Files changed
| File | Changes |
|---|---|
| `life-chits.js` | Date parsing, collapsible cards, calculator HTML, mobile layout — v9 |
| `life-modal.js` | Start date 3-selects, chitlift/chitclose save with date derivation — v6 |
| `life-events.js` | chitlift/chitclose modals, chitliftededit handler, chitcalcrun — v8 |
| `styles.css` | chit-calc-* classes, flex-wrap fixes |
| `DEVNOTES.md` | Created |

---

## 📅 Session — 14–15 Oct 2026

### What we worked on today

**1. Grocery two-line layout (v1)**
- `gmRow` and `gnRow` rewritten — item name on top line, controls (qty/price/buttons) on second line
- Added `.gi-controls`, `.gqty-inp`, `.gprc-inp` CSS classes
- Removed all inline width styles

**2. Delete + Rename buttons on custom sections (v1)**
- `gExtra`, `lifeExtra`, `catExtra`, `secExtra` cards now have ✏️ rename and 🗑️ delete buttons
- Used HTML entities `&#9998;` and `&#128465;` to avoid emoji encoding corruption
- Handlers added in `app2.js`: `renameGExtra`, `delGExtraCard`, etc.
- Built-in sections (Groceries, Bills, EMIs etc.) intentionally left without delete

**3. PWA manifest fix (v1)**
- Fixed `manifest.json` to use separate `icon-192.png` and `icon-512.png`
- Split `"any maskable"` into two separate entries

**4. GStudio React app migration (v2)**
- Evaluated pre-built React+TypeScript+Vite+Tailwind app in `GStudio/project_clean`
- Decision: migrate all old app logic into new UI (not rebuild UI)
- Phase 1: Dynamic greeting, date, streak — replaced all hardcoded strings
- Phase 2: Weekly veg reset + streak logic ported from `roll()`
- Phase 3: ListsScreen dynamic bill/chit/EMI computed values
- Phase 4: Firebase Google auth wired up — sign-in popup, Firestore sync, Header shows "Synced ✓"
- Phase 5: PWA icons fixed — replaced placeholder icons with real ones, fixed built output

### Files changed
| File | Changes |
|---|---|
| `docs/js/render2.js` (v1) | Two-line grocery rows, delete/rename buttons on custom sections |
| `docs/js/app2.js` (v1) | Delete/rename handlers for all 4 custom section types |
| `docs/css/styles.css` (v1) | `.gi-controls`, `.gqty-inp`, `.gprc-inp` classes |
| `docs/manifest.json` (v1) | Split `"any maskable"` into two entries |
| `GStudio/.../App.tsx` (v2) | Firebase auth, streak state, roll() logic, Firestore sync |
| `GStudio/.../firebase.ts` (v2) | New file — Firebase SDK init, auth helpers, Firestore helpers |
| `GStudio/.../TodayScreen.tsx` (v2) | Dynamic greeting/date, streak prop, real user photo |
| `GStudio/.../ListsScreen.tsx` (v2) | Dynamic bill/chit/EMI computed values, dueDaysFromDay() |
| `GStudio/.../Header.tsx` (v2) | Real user photo/name, "Synced ✓" badge |
| `GStudio/.../ProfileModal.tsx` (v2) | Google sign-in button, sign-out, real streak display |
| `GStudio/.../public/manifest.webmanifest` (v2) | Split icon entries, fixed purpose |
| `GStudio/.../public/icons/*.png` (v2) | Replaced placeholder icons with real 52KB/307KB icons |
| `GStudio/.../docs/index.html` (v2 built) | Added manifest link, theme-color, apple-touch-icon |
| `DEVNOTES.md` | Moved to v2 folder, updated with full v2 architecture |
