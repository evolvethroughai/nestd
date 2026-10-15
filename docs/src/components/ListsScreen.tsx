import React, { useState, useEffect } from 'react';
import {
  ChitItem,
  EmiLoanItem,
  BillItem,
  SubBillItem,
  GroceryItem,
  QuickTaskCategory,
  InvestmentItem,
  HealthItem,
  BusinessState,
} from '../types';

function dueDaysFromDay(dueDay: number): number {
  const today = new Date();
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), dueDay);
  if (thisMonth < today) thisMonth.setMonth(thisMonth.getMonth() + 1);
  return Math.round((thisMonth.getTime() - today.setHours(0,0,0,0)) / 86400000);
}

interface ListsScreenProps {
  groceryItems: GroceryItem[];
  onToggleGroceryItem: (id: string) => void;
  onOpenGroceryDetail: (category: 'C' | 'V') => void;
  chits: ChitItem[];
  onOpenChits: () => void;
  emis: EmiLoanItem[];
  onOpenEmis: () => void;
  bills: BillItem[];
  subBills: SubBillItem[];
  onOpenBills: () => void;
  onQuickPayBills: () => void;
  investments?: InvestmentItem[];
  onOpenInvestments?: () => void;
  healthItems?: HealthItem[];
  onOpenHealth?: () => void;
  business?: BusinessState;
  onOpenBusiness?: () => void;
  quickTasks: QuickTaskCategory[];
  onOpenQuickTaskDetail: (category: QuickTaskCategory) => void;
  onOpenCreateCategory: () => void;
  onOpenNewEntry: (type?: 'grocery' | 'chit' | 'emi' | 'bill' | 'quicktask') => void;
}

export const ListsScreen: React.FC<ListsScreenProps> = ({
  groceryItems,
  onToggleGroceryItem,
  onOpenGroceryDetail,
  chits,
  onOpenChits,
  emis,
  onOpenEmis,
  bills,
  subBills,
  onOpenBills,
  onQuickPayBills,
  investments = [],
  onOpenInvestments,
  healthItems = [],
  onOpenHealth,
  business,
  onOpenBusiness,
  quickTasks,
  onOpenQuickTaskDetail,
  onOpenCreateCategory,
  onOpenNewEntry,
}) => {
  const SECTION_LABELS_KEY = 'nestd_section_labels';

  const defaultLabels = {
    groceries: { title: 'Groceries & Food', subtitle: 'Daily Essentials', icon: '🛒' },
    lifeos: { title: 'Life OS', subtitle: 'Commitments & Wealth', icon: '🌱' },
    quicktasks: { title: 'Quick Tasks', subtitle: 'Action Lists', icon: '⚡' },
  };

  type SectionKey = 'groceries' | 'lifeos' | 'quicktasks';
  type SectionLabel = { title: string; subtitle: string; icon: string };
  type ExtraSection = SectionLabel & { id: string };

  const [sectionLabels, setSectionLabels] = useState<Record<SectionKey, SectionLabel>>(() => {
    try {
      const saved = localStorage.getItem(SECTION_LABELS_KEY);
      return saved ? { ...defaultLabels, ...JSON.parse(saved) } : defaultLabels;
    } catch {
      return defaultLabels;
    }
  });

  const [extraSections, setExtraSections] = useState<ExtraSection[]>(() => {
    try {
      const saved = localStorage.getItem('nestd_extra_sections');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SECTION_LABELS_KEY, JSON.stringify(sectionLabels));
    } catch {}
  }, [sectionLabels]);

  useEffect(() => {
    try {
      localStorage.setItem('nestd_extra_sections', JSON.stringify(extraSections));
    } catch {}
  }, [extraSections]);

  const [isManageOpen, setIsManageOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<SectionKey | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('📋');
  const [newCatSubtitle, setNewCatSubtitle] = useState('');

  const ICON_OPTIONS = ['📋', '🎯', '💡', '🔖', '📦', '🗂️', '🧩', '🌟', '🔧', '📝', '🏷️', '🎒'];

  const startEdit = (key: SectionKey) => {
    setEditingSection(key);
    setEditValue(sectionLabels[key].title);
  };

  const saveEdit = () => {
    if (!editingSection || !editValue.trim()) return;
    setSectionLabels((prev) => ({
      ...prev,
      [editingSection]: { ...prev[editingSection], title: editValue.trim() },
    }));
    setEditingSection(null);
    setEditValue('');
  };

  const addExtraSection = () => {
    if (!newCatName.trim()) return;
    const newSec: ExtraSection = {
      id: `sec-${Date.now()}`,
      title: newCatName.trim(),
      subtitle: newCatSubtitle.trim() || 'Custom category',
      icon: newCatIcon,
    };
    setExtraSections((prev) => [...prev, newSec]);
    setNewCatName('');
    setNewCatSubtitle('');
    setNewCatIcon('📋');
  };

  const deleteExtraSection = (id: string) => {
    setExtraSections((prev) => prev.filter((s) => s.id !== id));
  };

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    groceries: false,
    lifeos: false,
    quicktasks: false,
  });

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const nonVegItems = groceryItems.filter((g) => g.group !== 'Vegetables');
  const buyNowCount = nonVegItems.filter((g) => g.needed && !g.completed).length;
  const pendingVegCount = groceryItems.filter((g) => g.group === 'Vegetables' && !g.completed).length;

  const activeChits = chits.filter((c) => c.status !== 'done');
  const activeEmis = emis.filter((e) => e.status !== 'closed');
  const pendingBills = bills.filter((b) => !b.paid);

  // Dynamic bill summary
  const billsTotal = pendingBills.reduce((s, b) => s + (parseFloat(b.amt || '0') || 0), 0);
  const urgentBill = pendingBills.find((b) => !b.yearly);
  const billDueLabel = urgentBill ? `${urgentBill.name} due soon` : `${pendingBills.length} pending`;

  // Dynamic chit summary
  const nextChit = activeChits.find((c) => !c.lifted);
  const chitDueLabel = nextChit ? `Due ${nextChit.dueDay}th: ₹${nextChit.monthlyAmt.toLocaleString('en-IN')}` : activeChits.length > 0 ? 'All lifted' : 'No active chits';
  const chitNames = activeChits.map((c) => c.name.split(' ').slice(0, 1).join('')).join(' & ');

  // Dynamic EMI summary
  const nextEmi = activeEmis[0];
  const emiDueLabel = nextEmi ? `${nextEmi.dueDay}th: ₹${(nextEmi.emiAmt || 0).toLocaleString('en-IN')}` : 'No active loans';
  const emiDaysLeft = nextEmi?.dueDay ? dueDaysFromDay(nextEmi.dueDay) : null;

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-4 pb-28 pt-2 space-y-5">
      {/* Page Header (Title & Search/Filter) */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl md:text-[26px] font-extrabold text-on-surface tracking-tight leading-tight">
              My Lists
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-display text-xs font-bold">
              8 lists
            </span>
          </div>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
            Personal collections & daily lifelines
          </p>
        </div>

        <button
          onClick={() => setIsManageOpen(true)}
          className="w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center text-primary shadow-2xs hover:bg-surface-container-high transition-colors active:scale-95"
          title="Manage Categories"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>
      </div>

      {/* SECTION 1: Groceries & Pantry (Collapsible Accordion) */}
      <section className="flex flex-col space-y-3" id="section-groceries">
        <div
          onClick={() => toggleSection('groceries')}
          className="group flex items-center justify-between px-2 py-2 rounded-2xl hover:bg-amber-500/5 cursor-pointer select-none transition-colors duration-150 active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-300/40 flex items-center justify-center text-xl shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
              {sectionLabels.groceries.icon}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-extrabold uppercase tracking-tight text-amber-700">
                  {sectionLabels.groceries.subtitle}
                </span>
                <span className="w-1 h-1 rounded-full bg-amber-500" />
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-900 font-bold">
                  {groceryItems.length} items
                </span>
              </div>
              <h2 className="text-xl font-bold font-display text-on-surface tracking-tight leading-none mt-0.5">
                {sectionLabels.groceries.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenNewEntry('grocery');
              }}
              className="h-8 px-3 rounded-full bg-primary text-on-primary hover:bg-primary/90 flex items-center gap-1 text-xs font-bold transition-all shadow-2xs active:scale-95"
              title="Add Grocery Item"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Add</span>
            </button>
            <div
              className={`w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-transform duration-300 shrink-0 ${
                collapsedSections.groceries ? '' : 'rotate-180'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">keyboard_arrow_down</span>
            </div>
          </div>
        </div>

        {/* Section Cards matching #groc-grid from nestd (Category C & V) */}
        {!collapsedSections.groceries && (
          <div className="grid grid-cols-1 gap-3 animate-fadeIn">
            {/* Card 1: 🛒 Shopping & Staples (Category C) */}
            <div
              onClick={() => onOpenGroceryDetail('C')}
              className="group relative rounded-2xl p-4 transition-all duration-200 cursor-pointer overflow-hidden border border-amber-200 bg-white hover:border-amber-300 shadow-2xs hover:shadow-xs active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-300/40 flex items-center justify-center text-2xl shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                    🛒
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display text-base font-bold text-slate-900">
                        Shopping & Staples
                      </h3>
                      {buyNowCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-extrabold">
                          {buyNowCount} in Buy now
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                          All stocked
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                      Rice, dals, oils, household, pooja & dry fruits
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-0.5 group-hover:text-amber-600 transition-all text-[22px]">
                    chevron_right
                  </span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">
                  {nonVegItems.length} items in master catalog
                </span>
                <span className="text-amber-700 font-bold group-hover:underline">
                  Open shopping list ›
                </span>
              </div>
            </div>

            {/* Card 2: 🥬 Vegetables (Category V) */}
            <div
              onClick={() => onOpenGroceryDetail('V')}
              className="group relative rounded-2xl p-4 transition-all duration-200 cursor-pointer overflow-hidden border border-emerald-200 bg-white hover:border-emerald-300 shadow-2xs hover:shadow-xs active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-300/40 flex items-center justify-center text-2xl shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                    🥬
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display text-base font-bold text-slate-900">
                        Vegetables
                      </h3>
                      {pendingVegCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-extrabold">
                          {pendingVegCount} remaining
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-emerald-700 text-[11px] font-bold">
                          ✓ Bought for week
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                      Buy on Friday or Saturday · Budget: ₹600–₹800
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-0.5 group-hover:text-emerald-600 transition-all text-[22px]">
                    chevron_right
                  </span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">
                  Weekly mandi schedule & price tracker
                </span>
                <span className="text-emerald-700 font-bold group-hover:underline">
                  Open mandi list ›
                </span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* SECTION 2: Life OS (Commitments & Wealth) */}
      <section className="flex flex-col space-y-3 pt-1" id="section-lifeos">
        <div
          onClick={() => toggleSection('lifeos')}
          className="group flex items-center justify-between px-2 py-2 rounded-2xl hover:bg-emerald-500/5 cursor-pointer select-none transition-colors duration-150 active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-300/50 flex items-center justify-center text-xl shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
              {sectionLabels.lifeos.icon}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-extrabold uppercase tracking-tight text-emerald-700">
                  {sectionLabels.lifeos.subtitle}
                </span>
                <span className="w-1 h-1 rounded-full bg-emerald-500" />
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                  Peace of mind
                </span>
              </div>
              <h2 className="text-xl font-bold font-display text-on-surface tracking-tight leading-none mt-0.5">
                {sectionLabels.lifeos.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenNewEntry('chit');
              }}
              className="h-8 px-3 rounded-full bg-surface-container-high hover:bg-surface-container flex items-center gap-1 text-primary text-xs font-bold transition-colors shadow-2xs active:scale-95"
              title="New Ledger Entry"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>New entry</span>
            </button>
            <div
              className={`w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-transform duration-300 shrink-0 ${
                collapsedSections.lifeos ? '' : 'rotate-180'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">keyboard_arrow_down</span>
            </div>
          </div>
        </div>

        {/* Section Cards */}
        {!collapsedSections.lifeos && (
          <div className="grid grid-cols-1 gap-3 animate-fadeIn">
            {/* Card 1: Rich Golden Saffron Chit Fund Theme */}
            <div
              onClick={onOpenChits}
              className="group relative rounded-2xl p-4 transition-all duration-200 cursor-pointer overflow-hidden border border-yellow-300/70 shadow-[0_4px_20px_-4px_rgba(234,179,8,0.14)] active:scale-[0.99] flex items-center justify-between"
              style={{
                background: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 50%, #fef08a 100%)',
              }}
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 border border-yellow-400/50 flex items-center justify-center text-2xl shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
                  💰
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display text-base font-bold text-yellow-950">
                      Chits & Savings
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-yellow-200/80 text-yellow-900 text-[11px] font-bold">
                      {activeChits.length} active
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/80 border border-yellow-200 text-yellow-900 text-[11px] font-medium">
                      {chitNames || 'No active chits'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-yellow-900 text-xs font-bold bg-white/90 border border-yellow-300/60 px-2.5 py-0.5 rounded-lg shadow-2xs">
                      <span className="material-symbols-outlined text-[13px] text-yellow-700">event</span>
                      {chitDueLabel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenChits();
                  }}
                  className="w-9 h-9 rounded-full bg-yellow-500 hover:bg-yellow-600 text-yellow-950 font-bold shadow-sm flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                  title="Open Chits Manager & Calculator"
                >
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                </button>
                <span className="material-symbols-outlined text-yellow-600 text-[22px] group-hover:text-yellow-900 transition-colors">
                  chevron_right
                </span>
              </div>
            </div>

            {/* Card 2: Calming Teal / Seafoam Sanctuary EMI Theme */}
            <div
              onClick={onOpenEmis}
              className="group relative rounded-2xl p-4 transition-all duration-200 cursor-pointer overflow-hidden border border-teal-200/70 shadow-[0_4px_20px_-4px_rgba(20,184,166,0.12)] active:scale-[0.99] flex items-center justify-between"
              style={{
                background: 'linear-gradient(135deg, #f0fdfa 0%, #e6fffa 50%, #ccfbf1 100%)',
              }}
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-300/50 flex items-center justify-center text-2xl shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
                  🏡
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display text-base font-bold text-teal-950">
                      Home Loan EMIs
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-teal-200/80 text-teal-900 text-[11px] font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px] text-teal-700">check_circle</span>
                      Auto-debited
                    </span>
                    <span className="text-xs text-teal-800 font-medium">
                      {nextEmi?.name.split(' ').slice(0, 2).join(' ') || 'No active loans'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-teal-900 text-xs font-bold bg-white/90 border border-teal-200 px-2.5 py-0.5 rounded-lg shadow-2xs">
                      <span className="material-symbols-outlined text-[13px] text-teal-700">sync</span>
                      {emiDueLabel}
                    </span>
                    {emiDaysLeft !== null && (
                      <span className="text-xs text-teal-800 font-medium">
                        Next deduction in {emiDaysLeft}d
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenEmis();
                  }}
                  className="w-9 h-9 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-sm flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                  title="View EMI Schedule & Amortization"
                >
                  <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                </button>
                <span className="material-symbols-outlined text-teal-400 text-[22px] group-hover:text-teal-700 transition-colors">
                  chevron_right
                </span>
              </div>
            </div>

            {/* Card 3: Crisp Sunset Coral / Rose Utility Bills Theme */}
            <div
              onClick={onOpenBills}
              className="group relative rounded-2xl p-4 transition-all duration-200 cursor-pointer overflow-hidden border border-rose-200/70 shadow-[0_4px_20px_-4px_rgba(244,63,94,0.12)] active:scale-[0.99] flex items-center justify-between"
              style={{
                background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 50%, #fecdd3 100%)',
              }}
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-300/50 flex items-center justify-center text-2xl shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
                  ⚡
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display text-base font-bold text-rose-950">
                      Utility Bills
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-rose-200/80 text-rose-900 text-[11px] font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px] text-rose-700">priority_high</span>
                      {billDueLabel}
                    </span>
                    <span className="text-xs text-rose-800 font-medium">
                      {pendingBills.length} pending
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-rose-900 text-xs font-bold bg-white/90 border border-rose-200 px-2.5 py-0.5 rounded-lg shadow-2xs">
                      <span className="material-symbols-outlined text-[13px] text-rose-600">bolt</span>
                      {billsTotal > 0 ? `Total: ₹${billsTotal.toLocaleString('en-IN')}` : 'All paid'}
                    </span>
                    <span className="text-xs text-rose-800 font-medium">
                      TGSPDCL, Gas, ACT
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickPayBills();
                  }}
                  className="px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
                  title="Quick Pay Due Bills"
                >
                  <span className="material-symbols-outlined text-[14px]">bolt</span>
                  <span>Pay</span>
                </button>
                <span className="material-symbols-outlined text-rose-400 text-[22px] group-hover:text-rose-700 transition-colors">
                  chevron_right
                </span>
              </div>
            </div>

            {/* Card 4: Investments & Wealth (SIPs, PPF, SGB) */}
            <div
              onClick={onOpenInvestments}
              className="group relative rounded-2xl p-4 transition-all duration-200 cursor-pointer overflow-hidden border border-emerald-200/70 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.12)] active:scale-[0.99] flex items-center justify-between"
              style={{
                background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)',
              }}
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-300/50 flex items-center justify-center text-2xl shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
                  📈
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display text-base font-bold text-emerald-950">
                      Investments & SIPs
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 text-[11px] font-bold">
                      {investments.filter((x) => !x.paid).length} pending
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-emerald-900 text-xs font-bold bg-white/90 border border-emerald-200 px-2.5 py-0.5 rounded-lg shadow-2xs">
                      <span>Compounding</span>
                      <span>• Parag Parikh & PPF</span>
                    </span>
                    <span className="text-xs text-emerald-800 font-medium">
                      Wealth building
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="material-symbols-outlined text-emerald-600 text-[22px] group-hover:translate-x-0.5 transition-transform">
                  chevron_right
                </span>
              </div>
            </div>

            {/* Card 5: Health & Wellness (Medicines & Appointments) */}
            <div
              onClick={onOpenHealth}
              className="group relative rounded-2xl p-4 transition-all duration-200 cursor-pointer overflow-hidden border border-purple-200/70 shadow-[0_4px_20px_-4px_rgba(168,85,247,0.12)] active:scale-[0.99] flex items-center justify-between"
              style={{
                background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #e9d5ff 100%)',
              }}
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-300/50 flex items-center justify-center text-2xl shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
                  💊
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display text-base font-bold text-purple-950">
                      Health & Medical
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-purple-200/80 text-purple-900 text-[11px] font-bold">
                      {healthItems.length} active
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-purple-900 text-xs font-bold bg-white/90 border border-purple-200 px-2.5 py-0.5 rounded-lg shadow-2xs">
                      <span>Restock & Doctor Visits</span>
                    </span>
                    <span className="text-xs text-purple-800 font-medium">
                      Mom's meds & Dental
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="material-symbols-outlined text-purple-600 text-[22px] group-hover:translate-x-0.5 transition-transform">
                  chevron_right
                </span>
              </div>
            </div>

            {/* Card 6: Business & Ventures */}
            <div
              onClick={onOpenBusiness}
              className="group relative rounded-2xl p-4 transition-all duration-200 cursor-pointer overflow-hidden border border-indigo-200/70 shadow-[0_4px_20px_-4px_rgba(99,102,241,0.12)] active:scale-[0.99] flex items-center justify-between"
              style={{
                background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 50%, #c7d2fe 100%)',
              }}
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-300/50 flex items-center justify-center text-2xl shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
                  🚀
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display text-base font-bold text-indigo-950">
                      Business & Projects
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-200/80 text-indigo-900 text-[11px] font-bold">
                      {business?.ideas.length || 3} tracks
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-indigo-900 text-xs font-bold bg-white/90 border border-indigo-200 px-2.5 py-0.5 rounded-lg shadow-2xs">
                      <span>Active: DevOps / AI</span>
                    </span>
                    <span className="text-xs text-indigo-800 font-medium">
                      {business?.tasks.filter((t) => !t.completed).length || 3} milestones left
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="material-symbols-outlined text-indigo-600 text-[22px] group-hover:translate-x-0.5 transition-transform">
                  chevron_right
                </span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* SECTION 3: Quick Tasks (Collapsible Accordion) */}
      <section className="flex flex-col space-y-3 pt-1" id="section-quicktasks">
        <div
          onClick={() => toggleSection('quicktasks')}
          className="group flex items-center justify-between px-2 py-2 rounded-2xl hover:bg-purple-500/5 cursor-pointer select-none transition-colors duration-150 active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200/80 flex items-center justify-center text-xl shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
              {sectionLabels.quicktasks.icon}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-extrabold uppercase tracking-tight text-purple-700">
                  {sectionLabels.quicktasks.subtitle}
                </span>
                <span className="w-1 h-1 rounded-full bg-purple-600" />
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-600/10 text-purple-800 font-bold">
                  {quickTasks.reduce((acc, q) => acc + q.tasksCount, 0)} active
                </span>
              </div>
              <h2 className="text-xl font-bold font-display text-on-surface tracking-tight leading-none mt-0.5">
                {sectionLabels.quicktasks.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenNewEntry('quicktask');
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container bg-surface-container-high/60 transition-colors shadow-2xs active:scale-95"
              title="More options"
            >
              <span className="material-symbols-outlined text-[20px]">more_horiz</span>
            </button>
            <div
              className={`w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-transform duration-300 shrink-0 ${
                collapsedSections.quicktasks ? '' : 'rotate-180'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">keyboard_arrow_down</span>
            </div>
          </div>
        </div>

        {/* 3-Column Subcards */}
        {!collapsedSections.quicktasks && (
          <div className="grid grid-cols-3 gap-3 animate-fadeIn">
            {quickTasks.map((category) => {
              const bgGradient =
                category.colorScheme === 'blue'
                  ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)'
                  : category.colorScheme === 'emerald'
                  ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)'
                  : 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)';

              const borderColor =
                category.colorScheme === 'blue'
                  ? 'border-blue-200/70'
                  : category.colorScheme === 'emerald'
                  ? 'border-emerald-200/70'
                  : 'border-purple-200/70';

              const textColor =
                category.colorScheme === 'blue'
                  ? 'text-blue-950'
                  : category.colorScheme === 'emerald'
                  ? 'text-emerald-950'
                  : 'text-purple-950';

              const badgeColor =
                category.colorScheme === 'blue'
                  ? 'bg-blue-600/10 text-blue-800'
                  : category.colorScheme === 'emerald'
                  ? 'bg-emerald-600/10 text-emerald-800'
                  : 'bg-purple-600/10 text-purple-800';

              return (
                <div
                  key={category.id}
                  onClick={() => onOpenQuickTaskDetail(category)}
                  className={`group relative rounded-2xl p-3.5 shadow-2xs border ${borderColor} active:scale-95 transition-all duration-200 cursor-pointer flex flex-col items-center text-center overflow-hidden hover:shadow-xs`}
                  style={{ background: bgGradient }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenNewEntry('quicktask');
                    }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/80 text-on-surface-variant shadow-2xs flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                    title={`Add Task to ${category.name}`}
                  >
                    <span className="material-symbols-outlined text-[13px]">add</span>
                  </button>

                  <div className="w-11 h-11 rounded-2xl bg-white border border-black/5 flex items-center justify-center text-2xl mb-1.5 shadow-2xs group-hover:scale-110 transition-transform">
                    {category.icon}
                  </div>

                  <h3 className={`font-display text-xs font-bold ${textColor} line-clamp-1`}>
                    {category.name}
                  </h3>

                  <span className={`mt-1 px-2 py-0.5 rounded-full ${badgeColor} text-[10px] font-bold`}>
                    {category.tasksCount} tasks
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Extra custom sections */}
      {extraSections.map((sec) => (
        <section key={sec.id} className="flex flex-col space-y-3 pt-1">
          <div className="flex items-center justify-between px-2 py-2 rounded-2xl bg-surface-container/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xl shadow-2xs shrink-0">
                {sec.icon}
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-tight text-slate-500">
                  {sec.subtitle}
                </span>
                <h2 className="text-xl font-bold font-display text-on-surface tracking-tight leading-none mt-0.5">
                  {sec.title}
                </h2>
              </div>
            </div>
            <span className="text-xs text-slate-400 font-medium px-2">Coming soon</span>
          </div>
        </section>
      ))}

      {/* Bottom Action: + Create New List or Category */}
      <button
        onClick={() => setIsManageOpen(true)}
        className="w-full py-3.5 rounded-2xl bg-surface-container-high/60 hover:bg-surface-container border border-outline-variant/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-primary font-display text-sm font-semibold shadow-2xs group"
      >
        <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
          <span className="material-symbols-outlined text-[18px]">add</span>
        </div>
        <span>+ Manage Categories</span>
      </button>

      {/* Manage Categories Bottom Sheet */}
      {isManageOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm animate-fadeIn"
          onClick={() => { setIsManageOpen(false); setEditingSection(null); }}
        >
          <div
            className="bg-white w-full max-w-md rounded-t-3xl shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-display font-extrabold text-base text-slate-900">Manage Categories</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Rename or add main sections</p>
              </div>
              <button
                onClick={() => { setIsManageOpen(false); setEditingSection(null); }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {/* Built-in sections */}
              {(['groceries', 'lifeos', 'quicktasks'] as SectionKey[]).map((key) => (
                <div key={key} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-2xl">{sectionLabels[key].icon}</span>
                  {editingSection === key ? (
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingSection(null); }}
                      className="flex-1 text-sm font-bold text-slate-900 bg-white border border-primary rounded-xl px-3 py-1.5 outline-none"
                    />
                  ) : (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{sectionLabels[key].title}</p>
                      <p className="text-[11px] text-slate-400">{sectionLabels[key].subtitle}</p>
                    </div>
                  )}
                  {editingSection === key ? (
                    <button
                      onClick={saveEdit}
                      className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-2xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => startEdit(key)}
                      className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                  )}
                </div>
              ))}

              {/* Extra sections */}
              {extraSections.map((sec) => (
                <div key={sec.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-2xl">{sec.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{sec.title}</p>
                    <p className="text-[11px] text-slate-400">{sec.subtitle}</p>
                  </div>
                  <button
                    onClick={() => deleteExtraSection(sec.id)}
                    className="w-8 h-8 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              ))}

              {/* Add new section */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[11px] font-extrabold uppercase tracking-tight text-slate-400 mb-2">Add New Category</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {ICON_OPTIONS.map((ic) => (
                    <button
                      key={ic}
                      onClick={() => setNewCatIcon(ic)}
                      className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all ${
                        newCatIcon === ic
                          ? 'bg-primary/15 border-2 border-primary scale-110'
                          : 'bg-slate-100 border border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
                <input
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Category name (e.g. Travel Plans)"
                  className="w-full text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary mb-2"
                />
                <input
                  value={newCatSubtitle}
                  onChange={(e) => setNewCatSubtitle(e.target.value)}
                  placeholder="Subtitle (optional)"
                  className="w-full text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary mb-3"
                />
                <button
                  onClick={addExtraSection}
                  disabled={!newCatName.trim()}
                  className="w-full py-3 rounded-2xl bg-primary text-white font-display font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99] transition-all"
                >
                  + Add Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
