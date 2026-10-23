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

Development has used **Amazon Q Developer** and **ChatGPT / Codex** inside VS Code for coding and debugging, with **Stitch** and **Google AI Studio (G Studio)** used for UI concept exploration and iteration. Screenshots and user feedback guided the final interface decisions; code changes were made and verified in the React/Vite project.

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

## 23 October 2026 - Repository move and mobile login diagnosis

- Read the full project history in these notes: v1 debugging and date/grocery work; React migration; Firebase auth and user-scoped state/profile sync; account isolation; custom Lists, header and scrolling work; groceries/master lists/stores; weekly fruit and vegetable schedules/history; and the 17 October chit calculators, tracking ledger, CSV and help redesign.
- Current local source is `nestd/docs/src`, relative to the workspace; older `GStudio/project_clean` paths above are historical. Git origin is `https://github.com/evolvethroughai/nestd.git`.
- Confirmed the live app at `https://evolvethroughai.github.io/nestd/` returns HTTP 200. The `github.com` URL is the source repository, not the running app.
- Confirmed the Firebase public project configuration still authorizes `learntogrow-in.github.io`, localhost and the project's Firebase domains, but NOT `evolvethroughai.github.io`. The new Pages hostname therefore cannot complete Google sign-in. This is a hosting hostname change, not just a repository path change.
- Required console fix: project `nestd---get-sortd` > Authentication > Settings > Authorized domains > Add domain > `evolvethroughai.github.io` (hostname only, no HTTPS or `/nestd/`). Retain the old hostname while old installations/links are still used. No Firebase admin connection is available in this session, so this console change has not been made.
- Relative Vite base and PWA start/scope paths already tolerate a repository path rename. Existing installed shortcuts can still reference the old URL; first test the new URL directly in Chrome/Safari.
- Kept popup auth for GitHub Pages. A blind mobile redirect fallback can fail with third-party storage restrictions; consult https://firebase.google.com/docs/auth/web/redirect-best-practices before changing hosting/auth flow.
- Added persistent inline login errors in the account modal, disabled duplicate sign-in attempts, and provided actionable Firebase error codes/messages. Added Firestore profile/state listener and write error reporting; a failed state read keeps the cloud-write gate closed.
- These local changes do not update the Firebase domain allowlist and do not prove mobile sign-in works. Retest on the phone after the console change. Firestore rules and authenticated data sync still require verification if errors remain.
- Validation: `npm.cmd run build:docs` passed (existing large-chunk warning remains). TypeScript check found existing ChitCalculator.tsx errors (mode narrowing and a mixed string/record input value); none reported in the changed auth files. Local changes and regenerated output have not been committed, pushed or deployed.

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

---

## Session - 16 Oct 2026

### Lists screen structure and motion
- Kept the Lists screen organized into parent categories with their own subcategory cards and custom categories.
- Added contextual light color treatments for subcategory cards and matching colored parent category headers.
- Added sticky category headers that compact beneath the Nestd header while scrolling. Removed the extra sticky My Lists bar after testing showed the stacked banners crowded the content.
- Improved scroll measurement by scheduling category updates once per animation frame.
- Refined accordion closing so subcategory cards fold upward and shrink in sequence into their parent category. Clipped the collapsing content to prevent it overlapping neighboring sections.
- Made the Lists category count dynamic: three built-in categories plus custom categories.

### Categories and actions
- Added custom category and category-item types in `src/types/index.ts`, with personalized categories, task checkboxes, optional notes, amounts, and due dates.
- Added custom category management and automatic emoji selection from category names, including pet and gardening keywords.
- Removed Add buttons from parent category headers because the parent cannot determine which subcategory should receive a new item.
- Kept add actions scoped to their destination: grocery actions open the grocery manager, Chits & Savings opens the chits manager, and task-card Add buttons target their own Quick Tasks bucket.
- Fixed new-entry modal routing so Grocery, Chit, and Quick Task actions open the matching form. The Chit form now requires a numeric monthly contribution and saves the entered amount correctly.
- Replaced the misleading Quick Tasks ellipsis action with an Add task action.

### App header and navigation
- Refined the Nestd header's expanded and compact appearances, with an opaque light compact background so scrolling content does not show through.
- Set Today as the initial screen and kept tab navigation returning the selected screen to its top.
- Updated the Lists tune control and associated category management flow.

### Files updated
| File | Changes |
|---|---|
| `docs/src/App.tsx` | Today default, scroll/header coordination, entry routing, category and modal behavior |
| `docs/src/components/Header.tsx` | Compact header appearance and transitions |
| `docs/src/components/ListsScreen.tsx` | Category hierarchy, custom category management, dynamic count, sticky headers, accordion motion, contextual actions |
| `docs/src/components/NewEntryModal.tsx` | Entry type selection, quick-task bucket targeting, numeric chit contribution |
| `docs/src/components/TodayScreen.tsx` | Today screen updates |
| `docs/src/index.css` | Sticky header and accordion motion styles |
| `docs/src/types/index.ts` | Custom category and item interfaces |

### Verification and Git
- `npm.cmd run build` passed. Vite still reports the existing large JavaScript chunk warning (>500 kB).
- Changes were committed and pushed to `origin/studio` as `22a889a` (`feat: refine lists category actions and motion`).

### Account profile, scroll behavior, and header polish

**1. Account profile and settings**
- Expanded the account modal into **My profile** and **Settings** views, with a persistent Log out action for signed-in users.
- Added editable Name, Gender, and Date of birth fields. Profile name falls back to the signed-in account's display name or email name; removed the hardcoded Jeevan fallback and renamed the avatar asset to a generic filename.
- Added working Today settings for personalized greeting and daily streak visibility.
- Stored profile details and preferences in a separate Firestore document scoped under the signed-in user's UID.
- Updated Today greeting and compact header name to use the saved profile name.

**2. Lists sticky-header overlap**
- Changed category headers so only the active category can stick beneath the Nestd app header; inactive category headers remain in normal document flow.
- Raised the app header above the active category header and removed the sticky header backface-visibility hint that could trigger mobile compositing/layering glitches.

**3. Shared Nestd header motion and compact color**
- Reduced expanded/compact header transitions from 500 ms to 200 ms and limited animated CSS properties to reduce the sluggish feel across Today, Lists, and Sorti.
- Added separate scroll thresholds for collapsing and expanding so the shared header does not repeatedly toggle near one cutoff.
- Changed the compact header background from near-white `#f3f4ff` to a more visible pale indigo `#e7e9ff`.
- After feedback that expanding felt slower than collapsing, made the shared header asymmetric: compacting remains 200 ms while expanding to the full header is 120 ms.

### Files updated
| File | Changes |
|---|---|
| `docs/src/App.tsx` | Account profile state and sync, Today preferences, shared header scroll thresholds |
| `docs/src/components/ProfileModal.tsx` | Profile editor, settings toggles, sign-in and Log out actions |
| `docs/src/components/Header.tsx` | Profile name, faster transitions, compact tint, stacking order |
| `docs/src/components/ListsScreen.tsx` | Only active category header pins during scroll |
| `docs/src/components/TodayScreen.tsx` | Streak visibility preference |
| `docs/src/firebase.ts` | User-scoped Firestore profile read/write helpers |
| `docs/src/types/index.ts` | User profile and settings type |
| `docs/src/index.css` | Active-only sticky header styles |
| `docs/src/data/mockData.ts` | Removed obsolete personalized avatar reference |
| `docs/src/assets/images/profile-avatar.jpg` | Renamed old user-specific avatar asset |
| `docs/docs/` | Regenerated production app output for Pages |

### Verification and Git
- `npm.cmd run lint` passed (TypeScript check).
- `npm.cmd run build:docs` passed; Vite continues to report the existing large JavaScript chunk warning (>500 kB).
- Account and Lists updates were pushed to `origin/studio` in commit `6ab4e31` (`feat: improve profile and scroll behavior`).
- The compact header tint and 120 ms expand transition were subsequently included with the shared scroll and produce updates in commit `aaa27d9`.
- Firestore rules are not present in this repository; verify Firebase rules restrict reads/writes to the authenticated user's UID before storing real gender or date-of-birth details.

### QA pass - account data isolation
- Added a cloud-ready gate so Firestore writes wait until the signed-in user's first state snapshot is read (or confirmed absent), preventing default/local state from racing and overwriting saved account data.
- Track the UID that owns the local cached state. On account changes or sign-out, reset in-memory app data before another account is shown; retain guest data for first sign-in so it can be migrated to that account.
- Apply initial data defaults for fields missing from an existing remote document, so another account's cached fields are not retained.
- Track the last serialized sync to avoid repeatedly writing state received from the Firestore snapshot listener.
- `npm.cmd run lint` and `npm.cmd run build:docs` passed. The account data-isolation QA changes were included in commit `aaa27d9`.

### Grocery shopping flow - 16 Oct 2026
- Split adding groceries into **Quick add to Buy now** for one-time purchases and **Add to master list** for reusable items. One-time items are excluded from the master catalog and its counts.
- Removed the default quantity from new master items and the Master list display. Starting a master item in Buy now clears its previous trip quantity and price so each shop begins fresh.
- Added editable master fields for item name, category, and usual store, retaining delete actions.
- Replaced the fixed in-screen store list with user-addable store names. Store choices persist in local storage and sync with that signed-in user's Firestore data; accounts still without saved store preferences receive the built-in starter choices.
- Kept quick grocery capture as a one-time Buy now item. Existing grocery records without the new catalog flag continue to be treated as master items.
- `npm.cmd run lint` and `npm.cmd run build:docs` passed. Vite still reports the existing large JavaScript chunk warning (>500 kB). The grocery flow and production build were included in the later `aaa27d9` push.
- Grocery panel consolidation: **Buy now** now contains the one-off quick-add form and active shopping rows in one amber panel; the Master list contains its category rows, add-to-master form, and store control in one neutral panel. Buy-now actions share the amber color across both panels.

### Produce shopping, My Lists visibility, and scroll polish - 16 Oct 2026
- Added a dedicated **Fruits** shopping section alongside Vegetables, using the existing weekly produce workflow. Kept the pineapple icon and removed the apple icon treatment after feedback on the fruit tab.
- Made fruit restocking follow the same model as vegetables: purchased fruit is retained in purchase history and can be returned to Buy now on the configured weekly restock day. Produce history is kept by individual purchase date/week for the last two months rather than combined into monthly totals.
- Added per-section schedule preferences for the produce restock day and planned market day, so vegetable and fruit schedules can be configured independently. Updated the schedule and list summaries to use those preferences.
- Refined the vegetable and fruit weekly-list, schedule, and purchase-history cards with separate produce color treatments, collapsible sections, and the requested natural, more visible palette adjustments.
- Added Fruits to the Groceries & Food subcategory cards in My Lists, with its pending count and market-day summary. Selecting the card now opens the fruit shopping section directly.
- Tuned the shared Nestd header and category accordion motion to reduce the lag and banner overlap during scroll, including shorter transitions and less travel while categories close. Disabled scroll anchoring for the affected layout.
- Rebuilt the GitHub Pages app output in `docs/docs/` after the source changes.
- Verification: `npm.cmd run lint` and `npm.cmd run build:docs` passed. Vite continues to report the existing large JavaScript chunk warning (>500 kB).
- Committed and pushed the app and Pages changes to `origin/studio` as `aaa27d9` (`Improve produce lists and scrolling experience`).

### Tools and workflow used today
- **Stitch** and **Google AI Studio (G Studio):** used during UI concept and visual direction exploration for the shopping screens and produce sections. The final layout and behavior were refined against the screenshots and feedback in this session.
- **ChatGPT / Codex:** used to turn the product feedback into implementation steps, inspect and edit the React/TypeScript app and styles, connect the Fruits section to its weekly workflow, tune scrolling behavior, run the requested lint/build checks, and prepare this development summary.
- **Git and GitHub:** used to track the source and built Pages output. The app changes were committed as `aaa27d9` and pushed to `origin/studio`; this DEVNOTES update is being recorded in its own commit.
- Workflow: discuss the intended behavior, compare the UI with screenshots, implement a focused change in the app, verify the build, review the rendered result, and iterate from feedback.


## 17 October 2026 - Chits, calculator and help redesign

### UI and product flow
- Changed Chits & Savings from green to light champagne/gold, including the Life OS entry, summary and individual chit cards. Updated the Groceries category wording to "Eat well" and removed its aggregate item badge.
- Promoted the calculator into a highlighted feature card opening a viewport-sized dialog with two system choices: Dividend-Distributed (variable instalment) and Accumulated Dividend (fixed instalment).
- Simplified the variable calculator into basic value/duration inputs, Save/Borrow intent, estimate/pasted-ledger choice, and an Advanced Settings accordion. Mobile fields stack; ledger tables scroll horizontally.
- Moved educational content outside the calculator. Added two mutually exclusive help cards; the variable card contains four nested topics: core setup, auctions/dividends, month 1 and saver/borrower. Preserved the accumulated-dividend example and explanation.

### Calculation and ledger behavior
- Variable estimates use minimum/maximum group bidding amounts in rupees. Blank limits fall back to 15% of chit value; reversed limits are normalized. Generated group bids decrease linearly from the maximum in month 2 to the minimum in the final month. This is a projection, not a prediction of actual auctions.
- Month 1 uses the full base installment and no dividend. Later payments subtract the member dividend after foreman commission. The post-lift dividend option controls whether later payments return to the full base amount.
- Commission is editable with 0%, 2.5% and 5% presets; blank or zero means no commission. Presets are not labelled as legal limits. The small commission minimum hint is shown beside the focused personal bidding field, using the current percentage and calculated amount.
- Withdrawal accepts months 1 through N. Blank/final-month withdrawal uses the saver calculation with zero auction cut; early withdrawal uses the entered personal discount, falling back to the maximum group bid, minus any separate payout fees. Actual agreement deductions may differ from these modelling assumptions.
- Added a Post-Chit Tracking Ledger accepting newline/comma-separated payments. Missing months use the base installment and are identified as assumed in tracking summaries. Receipt overrides are supported for projected rows.
- Added cumulative cash paid, total reductions/dividends, payout and net profit/loss. Profit uses green, borrowing cost/loss uses red and tracking reductions use blue. Added CSV export named nestd-chit-ledger.csv.
- Latest visible table order: Month Number, Group Bid Cut, Member Dividend, Amount Paid, Cumulative Paid. CSV retains additional notes. Payout rows remain highlighted.
- Fixed-mode work includes optional actual early closing month/final payment, zero/default handling, payout-month row highlighting and full-term totals. Positive results have a short sparkle effect and losses use red/thumb-down feedback; effects begin when the result becomes visible.
- Calculation triggering changed during iteration: latest variable-mode behavior is live recalculation on input edits, per the later request. Fixed mode retains Calculate. The Calculate action remains available in the variable screen too.

### Verification, tools and follow-up
- Used ChatGPT/Codex, PowerShell, Node.js, React/TypeScript, Tailwind, Vite/npm and Git. Consulted official India Code material when reviewing commission and first-month claims. Stitch and Google AI Studio are part of the earlier design workflow; neither was invoked for these code edits.
- Rebuilt the Pages bundle in docs/docs/ with npm.cmd run build:docs; latest build completed successfully. Existing large JavaScript chunk warning remains.
- Calculator test cases were expanded during the earlier work, but the latest iterative changes were not retested. A production build does not establish financial correctness or visual verification on a physical phone. Review/update the test expectations before relying on this calculator for actual financial decisions.
- Local Vite server currently available at http://localhost:3006/ (LAN http://192.168.29.7:3006/). Earlier servers occupied ports 3000-3005.
- Follow-up: exercise saver/borrower endpoints, zero/fractional commission, reversed/blank ranges, receipt overrides, incomplete actual ledgers, rounding and CSV consistency. Refresh help text if calculator assumptions change.


## 23 October 2026 - Lists scrolling, navigation separator and produce isolation

- Work performed in the active C:/Users/evolvethroughai checkout. This copy started at 06255fc; the separate login diagnostics commit 0031ad6 has not been pulled into this checkout.
- Lists category headers now use the Nestd header timing: compact 200 ms, expand 120 ms. Removed staggered accordion delays and reduced the 320 ms fold to the same 200/120 ms timings.
- Sticky selection measures natural section positions instead of already-pinned header positions, with a 12 px release threshold. Layout reads are batched before writes, nodes are cached, React state updates only on category changes, and ResizeObserver refreshes positions when headers/accordions resize.
- Fixed Staples Buy now accidentally including Fruit: exclude all dedicated produce groups. Corrected the Lists Staples pending count to exclude Fruit too. Existing produce records stay in their own weekly lists.
- Changed the bottom navigation separator from a tinted border/indigo shadow to neutral slate after the user identified the blue line above Today/Lists/Sorti.
- Existing Quick Tasks categories: Errands & Outings for tailor visits/clothes pickup; Home Setup for plumber/house maintenance; Family & Personal for family coordination. Tasks currently have title/completion only; dates, assignees and reminders remain a proposed feature, not implemented behavior.
- Physical mobile smoothness and the visual separator require user review; build/type-check results are reported separately.
- Validation: production build passed with the existing large-bundle warning. TypeScript check remains blocked by existing ChitCalculator.tsx errors; no errors were reported in the changed files. Changes are local, uncommitted and not deployed.


### Repository synchronization follow-up - 23 October 2026
- Active checkout committed UI fixes as 8223d12 but push was rejected because origin/studio contained login commit 0031ad6. Merged both histories and rebuilt generated Pages files to resolve asset rename/index conflicts.
- Updated both save_git.sh copies to merge origin/studio after committing and before pushing, and to stop with an explanation if synchronization fails. No force push is used.
