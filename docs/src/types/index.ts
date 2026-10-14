export type TabType = 'today' | 'lists' | 'ask';

export interface TodayTask {
  id: string;
  title: string;
  time: string;
  category: string;
  tag: string;
  tagType: 'urgent' | 'work' | 'family' | 'personal' | 'done';
  completed: boolean;
  completedAt?: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
}

export interface LifeOSEntry {
  id: string;
  title: string;
  type?: 'chit' | 'emi' | 'utility' | string;
  category?: string;
  amount?: string;
  subtitle?: string;
  dueInfo?: string;
  status: string;
  meta?: string;
  icon?: string;
  note?: string;
}

// --- CHITS (matching docs/js/life-chits.js & DEVNOTES.md) ---
export interface ChitItem {
  id: string;
  name: string;
  monthlyAmt: number;
  pot: number;
  totalMonths: number;
  startDate: string; // YYYY-MM-DD
  dueDay: number; // day of month payment is due
  status: 'paying' | 'done';
  note?: string;
  lifted: boolean;
  liftedDate?: string; // YYYY-MM-DD
  liftedMonth?: number; // auto-derived from startDate + liftedDate
  commission?: number;
  amtReceived?: number; // pot - commission
  closedDate?: string; // YYYY-MM-DD
  closedMonth?: number;
}

export interface ChitCalculation {
  pot: number;
  monthly: number;
  months: number;
  liftAt?: number;
  comm?: number;
  totalPaid: number;
  noLiftNet: number;
  paidTillLift?: number;
  remaining?: number;
  received?: number;
  netLift?: number;
  beMonth?: number;
}

// --- EMIS / LOANS (matching docs/js/life-emis.js & life-modal-emis.js) ---
export interface EmiPartPayment {
  id: string;
  amt: number;
  date?: string; // YYYY-MM-DD
}

export interface EmiLoanItem {
  id: string;
  name: string;
  loanAmt: number;
  interestRate: number; // % p.a.
  tenureMonths: number;
  emiAmt?: number;
  startDate?: string; // YYYY-MM-DD
  dueDay?: number;
  note?: string;
  status: 'active' | 'closed';
  partPayments: EmiPartPayment[];
}

// --- BILLS & SUB-BILLS (matching docs/js/life-bills.js & data.js) ---
export interface SubBillItem {
  id: string;
  parentId: string;
  name: string;
  consumerNo?: string;
  dueDay: number;
  paid: boolean;
  note?: string;
  billUrl?: string;
  payUrl?: string;
  lastAmt?: number;
  amtHistory?: Record<string, number>;
}

export interface BillItem {
  id: string;
  name: string;
  icon: string;
  amt?: string;
  due?: string;
  note?: string;
  paid: boolean;
  yearly?: boolean;
}

// --- GROCERY & STORES (matching docs/js/grocery.js & data.js) ---
export interface GroceryItem {
  id: string;
  name: string;
  group: 'Staples / food' | 'Household / personal' | 'Pooja' | 'Fruit' | 'Nuts, seeds and snacks' | 'Vegetables';
  store?: string;
  needed: boolean; // Buy now flag (matching x.n)
  completed: boolean; // Marked bought / done (matching x.d)
  quantity?: string; // e.g. "2 kg", "500 g"
  price?: string; // e.g. "140", "65"
  boughtDate?: string; // e.g. "2026-10-12"
  boughtTimestamp?: number;
  lastBought?: string; // e.g. "12 Oct 2026"
}

// --- QUICK TASKS ---
export interface QuickTaskCategory {
  id: string;
  name: string;
  icon: string;
  tasksCount: number;
  colorScheme: 'blue' | 'emerald' | 'purple' | 'amber' | 'rose';
  tasks: { id: string; title: string; completed: boolean }[];
}

// --- INVESTMENTS, HEALTH & BUSINESS (matching docs/js/data.js & life.js) ---
export interface InvestmentItem {
  id: string;
  name: string;
  amt?: string;
  due?: string;
  paid: boolean;
  note?: string;
  icon?: string;
}

export interface HealthItem {
  id: string;
  name: string;
  htype: 'med' | 'appt';
  amt?: string;
  due?: string;
  note?: string;
  icon?: string;
}

export interface BusinessIdea {
  id: string;
  name: string;
  note?: string;
}

export interface BusinessTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface BusinessState {
  ideas: BusinessIdea[];
  activeId: string | null;
  tasks: BusinessTask[];
}

export interface AutomationLog {
  id: string;
  item: string;
  destination: string;
  destinationCategory: string;
  timeAgo: string;
  timestamp: number;
}
