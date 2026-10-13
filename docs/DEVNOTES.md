# Nestd — Dev Notes (Personal Reference)

## What This App Is
- Name: **Nestd — Get Sortd**
- Pure HTML / CSS / vanilla JS — no Node, no npm, no build tools
- Hosted on **GitHub Pages** via the `docs/` folder
- Firebase project: `nestd---get-sortd`
- localStorage key: `jt-v5`
- PWA — installable on Android/iOS via browser prompt

---

## Apps Used
- Firebase and Supabase for free hosting
- Claude, ChatGPT, Gemini, Grok for reference
- Canva for logo
- **Amazon Q Developer** (VS Code) — primary agent for building and debugging

---

## Folder Structure

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
    ├── grocery.js      ← grocery list logic
    ├── life-utils.js   ← date helpers: lifeDueDays, lifeDueCls, lifeDueLbl, subDueDate
    ├── life-bills.js   ← BILL_PORTALS, getBillPortal, lcRow, lcSubRow, billWithSubs, renderBillsPage
    ├── life-chits.js   ← chitOpenState, renderChitsPage, chitCard (inner fn), chit calculator HTML
    ├── life.js         ← thin router: renderLifePage(type) → calls renderBillsPage / renderChitsPage / inline renders
    ├── life-modal.js   ← lmClose, lmOpenSub, lmOpen, lm-save.onclick, lm-del.onclick
    ├── life-events.js  ← openLifePage, closeLifePage, all click/input handlers for life page
    ├── app.js          ← app init, nav, today view, focus mode, profile
    └── firebase.js     ← Firebase auth + Firestore sync
```

---

## Script Load Order in index.html
Order matters — each file depends on the ones before it.

```
Firebase CDN (app-compat, auth-compat, firestore-compat)
→ data.js
→ store.js
→ ui.js
→ render.js
→ grocery.js
→ life-utils.js
→ life-bills.js
→ life-chits.js
→ life.js
→ life-modal.js
→ life-events.js
→ app.js
→ firebase.js
```

---

## Cache Busting
All script tags use `?v=N` version params. Bump the number whenever you deploy a fix so the browser reloads the file.

```html
<script src="js/life-chits.js?v=9"></script>
```

Rule: bump version → push to GitHub → GitHub Pages serves the new file.

---

## Key Globals
| Variable | Defined in | Purpose |
|---|---|---|
| `st` | store.js | The entire app state object (loaded from localStorage) |
| `currentLife` | life-events.js | Which Life OS section is open (e.g. `'chits'`) |
| `lmType` | life-modal.js | Current modal type (`'chits'`, `'chitlift'`, `'chitclose'`, `'bills'`, etc.) |
| `lmEditId` | life-modal.js | ID of item being edited, `null` for new |
| `chitOpenState` | life-chits.js | `{}` map of chit id → open/collapsed state |
| `billWithSubs.open` | life-bills.js | `{}` map of bill id → expanded state |
| `LIFE_TITLES` | life.js | Display names for each Life OS section |

---

## Data Shape — Chits (`st.chits[]`)
```js
{
  id: 'ch...',
  name: 'Shriram 15K',
  monthlyAmt: '15000',
  pot: '450000',
  totalMonths: '30',
  startDate: 'YYYY-MM-DD',     // stored as full date now
  dueDay: '5',                  // day of month payment is due
  status: 'paying' | 'done',
  note: '...',
  lifted: true | false,
  liftedDate: 'YYYY-MM-DD',    // set when lifted
  liftedMonth: '12',            // auto-derived from startDate + liftedDate
  commission: '5000',
  amtReceived: '445000',        // pot - commission
  closedDate: 'YYYY-MM-DD',    // set when marked closed
  closedMonth: '26',            // auto-derived from startDate + closedDate
}
```

---

## Bugs Fixed & How

### 1. App completely broken — syntax error in life.js
**Symptom:** Entire app white screen / JS error on load.
**Root cause:** Every `||':''` pattern in `lmOpen`/`lmOpenSub` was a JS syntax error. The `'` inside `':'` terminated the outer string literal early.
**Fix:** Replace all `||':''` with `||''`.
**Rule:** Never use `||':''` in single-quoted JS strings. Use `||''` for empty string fallbacks.

### 2. PowerShell corrupts JS files
**Symptom:** After using PowerShell regex replace on a JS file, the file gets encoding corruption (BOM, CRLF issues, broken characters).
**Fix:** Always use `fsReplace` with exact strings, or `fsWrite` full rewrites. Never use PowerShell `-replace` on JS files.

### 3. `type="month"` input for start date showed YYYY-MM format
**Symptom:** Start date picker showed year-month only, no day, and format was not DD/MM/YYYY.
**Fix:** Replaced `type="month"` with 3 separate `<select>` dropdowns (DD / MM / YYYY). Assembled as `YYYY-MM-DD` on save. All date calculations still work since internal format is unchanged.

### 4. Global CSS input rule overriding calculator inputs
**Symptom:** Calculator inputs were too large (16px font, 11px padding) — same as modal inputs.
**Root cause:** Global rule `input[type=text]{font-size:16px;padding:11px 12px}` overrode `.chit-calc-row input`.
**Fix:** `.chit-calc-row input` uses `font:600 14px Nunito` and `padding:9px 11px` — explicit enough to win specificity.

### 5. Date selects overflowing modal on narrow screens
**Symptom:** DD/MM/YYYY selects in a flex row overflowed the modal on 375px screens.
**Fix:** Added `min-width:0` to both the flex container div and each `<select>` element.

### 6. Chit card header overflow on mobile
**Symptom:** Status badge showing full text like `✅ Lifted on 15 Jun 2025` + chit name + chevron all on one line — overflowed on 375px.
**Fix:** Status badge shortened to `Paying` / `Lifted` / `Done`. Due badge moved below the name. Name gets `flex:1;min-width:0`.

---

## Architecture Decision — Why life.js Was Split

Original `life.js` was 700+ lines. One syntax error broke the entire app.

Split into 6 files so one bug only breaks one feature:

| File | Owns |
|---|---|
| `life-utils.js` | Date helper functions only |
| `life-bills.js` | Bills render + portal data |
| `life-chits.js` | Chits render + calculator HTML |
| `life.js` | Router only — calls the render functions |
| `life-modal.js` | All modal open/save/delete logic |
| `life-events.js` | All click/input event handlers |

---

## Backup Location
`Task_manager/docs/` mirrors `docs/` and is the known-good backup.
After every working change, sync the backup manually.

To verify only changed files:
```
fc /b "Task_manager\docs\js\life.js" "docs\js\life.js"
```

---

## Chit Calculator Logic
Located in: `life-events.js` → `chitcalcrun` handler

Inputs: pot, monthly, total months, lift at month (optional), commission (optional)

Calculations:
- **Without lifting:** `net = pot - (monthly × months)`
- **If lifted at month X:** `received = pot - commission`, `net = received - (monthly × months)`
- **Break-even month:** loops from month 1 upward, finds first month where `pot - commission - totalPaid >= 0`

---

## Chit Date System
- **Start date** → DD/MM/YYYY selects in modal → stored as `YYYY-MM-DD`
- **Lifted date** → DD/MM/YYYY selects in lift modal → stored as `liftedDate: YYYY-MM-DD`
- **liftedMonth** → auto-derived: `(liftedYear - startYear) * 12 + (liftedMonth - startMonth) + 1`
- **Closed date** → DD/MM/YYYY selects in close modal → stored as `closedDate: YYYY-MM-DD`
- **closedMonth** → same derivation as liftedMonth
- **End date** → never stored, always calculated: `startDate + totalMonths - 1`
- **monthsDone** → accounts for actual day: if today's day < start day, subtract 1 month

---

## Mobile UI Rules (learned the hard way)
- Minimum touch target: 44×44px for buttons
- Never put two full dates side by side on one line at 11px — stack them vertically
- `flex` children need `min-width:0` or they overflow their container
- `flex-wrap:wrap` on rows that contain long text + amounts
- Status badges: keep text short (max 2 words) when inside a flex header row
- Global CSS rules (`input[type=text]`) always win unless you use a specific enough selector

---

## Firebase
- SDK version: `9.23.0` (compat mode)
- Auth: Google sign-in
- Firestore: syncs `st` object per user
- Service worker: intentionally unregistered on load (no offline caching issues)

---

## Useful Patterns

### Safe element read in save handlers
```js
var val = ($('some-id') || {value: ''}).value.trim();
```

### Assemble date from 3 selects
```js
var d = $('lm-sd-d').value, m = $('lm-sd-m').value, y = $('lm-sd-y').value;
var date = (y && m && d) ? y + '-' + m + '-' + d : undefined;
```

### Format date for display
```js
new Date('2024-06-15T12:00:00').toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'})
// → "15 Jun 2024"
```
Note: Always append `T12:00:00` when constructing dates from `YYYY-MM-DD` strings to avoid timezone-off-by-one-day bugs.

### Re-render after save
```js
save();
lmClose();
if (currentLife) $('life-page-body').innerHTML = renderLifePage(currentLife);
toast('Saved');
```

---

## Summary of My AI Agent (Amazon Q Developer)

This app was built and debugged entirely using **Amazon Q Developer** inside VS Code — running in the IDE as an agentic coding assistant. No external developer, no Stack Overflow, no manual googling for fixes.

### What the agent did across this project

| Area | What was done |
|---|---|
| **Debugging** | Found the `||':''` syntax error that crashed the entire app — traced it to JS string termination inside single-quoted strings |
| **Backup restore** | Compared `Task_manager/docs/` backup vs `docs/` using `fc /b`, identified only `life.js` differed, restored clean version |
| **File split** | Broke 700+ line monolithic `life.js` into 6 focused files — each file owns one concern so one bug can't crash everything |
| **Chit date system** | Replaced `type="month"` with DD/MM/YYYY 3-select dropdowns for start date, lifted date, closed date — all stored as `YYYY-MM-DD` internally |
| **Chit calculator** | Built a standalone planning calculator at the top of the chits page — calculates profit/loss with and without lifting, break-even month |
| **Collapsible cards** | Made chit cards collapse/expand on tap using `chitOpenState{}` — only header visible by default |
| **Edit lifted date** | Added tappable "Lifted on" row with ✎ icon that reopens the lift modal pre-filled for correction |
| **Mobile UI fixes** | Fixed flex overflow, status badge overflow, date row cramping, button wrapping, CSS specificity conflicts — all for 375px screens |
| **CSS fixes** | Fixed global `input[type=text]` rule overriding calculator inputs by using more specific selectors |
| **Dev notes** | Wrote this entire DEVNOTES.md file as a personal reference |

### How to work with the agent effectively

- **Give context** — paste the conversation summary at the start of a new session so it knows the full history
- **Say the file name** — "fix this in life-chits.js" is better than "fix the chit card"
- **One feature at a time** — the agent works best when the task is scoped to one file or one behaviour
- **Always bump cache version** after any JS/CSS change — the agent does this automatically but double-check
- **Never use PowerShell regex on JS files** — tell the agent to use `fsReplace` or `fsWrite` only
- **Keep the backup in sync** — after every working session, copy `docs/` to `Task_manager/docs/`

### Agent limitations observed

- `fsReplace` fails if the exact string has invisible differences (CRLF vs LF, extra spaces) — workaround is to read the file first and copy the exact string
- Multiple identical strings in a file cause `fsReplace` to fail — need to include more surrounding context to make it unique
- PowerShell `-replace` on JS files causes encoding corruption — never use it directly on source files
- Code review tool requires authorization — agent falls back to manual file reads and analysis

### Tools the agent used most

| Tool | Used for |
|---|---|
| `fsRead` | Reading files before editing, verifying changes |
| `fsWrite` | Full file rewrites when changes were too large for fsReplace |
| `fsReplace` | Targeted edits to specific lines |
| `executeBash` | Running `findstr` to find exact line content before replacing, `fc /b` for file comparison |
| `listDirectory` | Checking folder structure |

---
---

# Daily Session Logs

---

## 📅 Session — 13 Oct 2026

### What we worked on today

**1. Complete date system for chits**
- Start date changed from `type="month"` (YYYY-MM) to full `type="date"` then to DD/MM/YYYY 3-select dropdowns
- Removed end date from the add modal — it's always auto-calculated from start + total months, user doesn't know it upfront
- Start date stored as `YYYY-MM-DD` internally, displayed as `DD MMM YYYY`
- `monthsDone` calculation now accounts for actual day of month (subtracts 1 if today's day is before start day)

**2. Lifted date — enter date not month number**
- Lift chit modal replaced month number input with DD/MM/YYYY selects defaulting to today
- Saves `liftedDate: YYYY-MM-DD`, auto-derives `liftedMonth` number from startDate for profit calculations
- Card status badge shows `✅ Lifted on 15 Jun 2025` (full date)
- Lifted box row shows `Lifted on: 15 Jun 2025`

**3. Closed date — same as lifted**
- Mark closed modal replaced month number input with DD/MM/YYYY selects
- Saves `closedDate: YYYY-MM-DD`, auto-derives `closedMonth` number
- Completed chit card shows `Closed on: 15 Jun 2025` in the profit box

**4. Collapsible chit cards**
- Each card now collapsed by default — only name + status badge + due badge + ▼ arrow visible
- Tap header to expand/collapse — `chitOpenState{}` remembers state across re-renders
- Arrow flips ▼/▲

**5. Edit lifted date**
- "Lifted on" row in the lifted box now has ✎ pencil icon and is tappable
- Opens lift modal pre-filled with existing date and commission for correction
- Saves back and recalculates everything

**6. Chit calculator**
- Universal calculator at top of chits page (not per card)
- Fields: Pot, Monthly, Total months, Lift at month (optional), Commission (optional)
- Shows: without lifting profit/loss, if lifted at month X profit/loss, break-even month
- 2-column grid layout for compact mobile display

**7. Mobile UI review and fixes**
- Status badge text shortened to `Paying` / `Lifted` / `Done` — was overflowing on 375px
- Due badge moved below chit name instead of inline with status
- Start/End dates stacked vertically instead of side-by-side with arrow
- Footer buttons use `flex:1` so Lift + Close share the row equally
- `chit-lifted-row` gets `flex-wrap:wrap` + `align-items:flex-start` for long label wrapping
- All DD/MM/YYYY select containers get `min-width:0` to prevent flex overflow
- Calculator grid gets `min-width:0`
- CSS specificity fix: `.chit-calc-row input` overrides global `input[type=text]` rule

**8. DEVNOTES.md created**
- Full personal reference file covering architecture, data shapes, bugs, patterns, mobile rules
- Daily session log format established — "update notes" = add new dated entry at bottom

### Files changed today
| File | Changes |
|---|---|
| `life-chits.js` | Date parsing, collapsible cards, calculator HTML, mobile layout fixes — v9 |
| `life-modal.js` | Start date 3-selects, removed end date field, chitlift/chitclose save with date derivation — v6 |
| `life-events.js` | chitlift/chitclose modals with date selects, chitliftededit handler, chittog, chitcalctog, chitcalcrun — v8 |
| `styles.css` | chit-calc-* classes, chit-lifted-row flex-wrap, min-width:0 fixes |
| `index.html` | Cache busters bumped |
| `DEVNOTES.md` | Created |

### AI Agent Summary — Today
The agent handled the entire session from start to finish. Key things it did today:
- Understood "complete date system" meant full DD/MM/YYYY not just month/year — asked for clarification before building
- Recognised that asking for end date in the add modal was wrong (user won't know it) — removed it proactively after user pointed it out
- Built the 3-select DD/MM/YYYY pattern once and reused it consistently across start date, lift date, close date, and edit lift date
- Identified 6 separate mobile UI issues from reading the code — fixed all in one pass across 3 files
- Caught the CSS specificity conflict between global input rule and calculator inputs
- Used `findstr` via `executeBash` to find exact line content before replacing when `fsReplace` had ambiguity issues
- Wrote and structured this entire DEVNOTES.md including the daily log format

---
