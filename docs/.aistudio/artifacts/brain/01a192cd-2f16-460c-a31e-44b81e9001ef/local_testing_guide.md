# Nestd Life OS - Local Setup & Artifacts Guide

This guide explains how to export, download, and test the **Nestd** application on your local machine.

---

## 1. Where to Get the Project Files / Artifacts in AI Studio

You can export or download the complete source code directly from the **Google AI Studio Build UI**:

1. **Download as ZIP**:
   - Look at the top navigation bar or the header area in the AI Studio Build interface.
   - Click the **Export / Download** button (or the **3-dots `...` menu** in the top right).
   - Select **"Download ZIP"** or **"Export to GitHub"**.
   - This downloads the complete project directory with all source code, components, styles, and configurations.

2. **File Explorer / Code View**:
   - Click the **Code** icon / tab in the left sidebar to browse and copy any individual file directly (`src/App.tsx`, `src/components/*`, `src/data/*`, `package.json`, etc.).

---

## 2. Running the Project Locally

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended, or Node.js v20+)
- **npm**, **yarn**, **pnpm**, or **bun**

### Step-by-Step Instructions

1. **Extract and Open the Project**:
   ```bash
   cd path/to/nestd-app
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```

4. **Open in Browser**:
   - The Vite development server will start on:
     ```
     http://localhost:3000
     ```
   - Open this URL in your web browser. You can also open Chrome DevTools (press `F12` or `Cmd+Option+I`) and toggle device emulation (e.g., iPhone 14 / Pixel 7) to inspect mobile behavior.

5. **Build for Production (Verification)**:
   ```bash
   npm run build
   ```
   To test the production build locally:
   ```bash
   npm run preview
   ```

---

## 3. Project Structure & Replicated Concepts

All concepts from `https://github.com/learntogrow-in/nestd/tree/dev/docs` have been cleanly integrated into React + TypeScript:

```
├── package.json               # Dependencies (React 19, Tailwind CSS v4, Lucide Icons, Vite)
├── index.html                 # HTML viewport & mobile shell entry
├── vite.config.ts             # Vite configuration with Tailwind CSS plugin
├── tsconfig.json              # TypeScript compilation configuration
└── src/
    ├── App.tsx                # Master state management, responsive viewport container, local persistence
    ├── index.css              # Global Tailwind CSS & custom scrollbar styles
    ├── types/
    │   └── index.ts           # Types for Chits, EMIs, Bills, Groceries, Investments, Health, Business
    ├── data/
    │   └── mockData.ts        # Seed data matching docs/js/data.js and DEVNOTES.md
    └── components/
        ├── ListsScreen.tsx        # "My Lists" cards hub (Groceries, Life OS cards, Quick Tasks)
        ├── ChitsManager.tsx       # Chit funds: 15-month cycle, dividend calculation, bid history ledger
        ├── EmisManager.tsx        # Loan amortizations: reducing balance, part-payment simulation
        ├── BillsManager.tsx       # Multi-connection utility bills (Bescom meters, RR numbers, URLs)
        ├── InvestmentsManager.tsx # SIPs, Mutual Funds, PPF, Gold with payment toggles
        ├── HealthManager.tsx      # Daily meds schedule, dosage, timing & health trackers
        ├── BusinessManager.tsx    # Project milestones, active ideas & incubation pipeline
        ├── GroceryManager.tsx     # Pantry staples, store tags, and restock checklists
        ├── TodayScreen.tsx        # Daily focus, time blocks, and quick priorities
        ├── SortiScreen.tsx        # Life assistant prompt & companion screen
        ├── Header.tsx             # Clean app header with live date & sync indicator
        └── BottomNav.tsx          # 3-tab navigation bar (Today, Lists, Sorti)
```

---

## 4. Key Logic & Math Included

- **Chit Fund Auction & Dividends**:
  - Pool = `installment * totalMembers` (e.g. ₹15,000 × 15 = ₹2,25,000)
  - Dividend distribution = `bidAmount / totalMembers`
  - Current payable installment = `baseInstallment - dividend`
- **Loan EMI Amortization**:
  - Standard reducing balance formula: `P * r * (1+r)^n / ((1+r)^n - 1)`
  - Dynamic interest vs. principal split calculation for each payment
  - Part-payment tracking showing direct principal reduction
- **Utility Bills Multi-Connection**:
  - Handles parent utility items with multiple meters / RR numbers (e.g. Bescom 1st Floor, 2nd Floor, Borewell)
- **State Persistence**:
  - Changes made in the app are automatically saved to `localStorage` so data remains between browser refreshes.
