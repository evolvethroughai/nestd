import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  CustomCategory,
  CustomCategoryItem,
  ProduceSchedules,
} from '../types';

const AUTO_EMOJI_RULES: Array<[RegExp, string]> = [
  [/\b(gym|fitness|workout|exercise|training|yoga)\b/i, '🏋️'],
  [/\b(travel|trip|flight|vacation|holiday|tour|旅)\b/i, '✈️'],
  [/\b(finance|money|budget|bank|bill|saving|savings|expense|investment|tax)\b/i, '💰'],
  [/\b(tech|technology|code|coding|software|computer|device|programming)\b/i, '💻'],
  [/\b(food|meal|recipe|grocery|groceries|cook|cooking|restaurant)\b/i, '🍽️'],
  [/\b(health|doctor|medicine|medical|clinic|appointment)\b/i, '🏥'],
  [/\b(work|project|office|career|job|business)\b/i, '💼'],
  [/\b(book|reading|read|study|learn|course|school|education)\b/i, '📚'],
  [/\b(home|house|clean|repair|maintenance|rent)\b/i, '🏠'],
  [/\b(shop|shopping|buy|purchase|wishlist)\b/i, '🛍️'],
  [/\b(pets?|dogs?|cats?|vet(?:erinarian)?s?|animals?)\b/i, '🐾'],
  [/\b(car|vehicle|driving|fuel|transport)\b/i, '🚗'],
  [/\b(gard\w*|plants?|flowers?|yard|lawn)\b/i, '🌱'],
  [/\b(baby|kids|children|family)\b/i, '👨‍👩‍👧'],
  [/\b(gift|birthday|party|event|wedding)\b/i, '🎁'],
  [/\b(movie|music|game|hobby|entertainment)\b/i, '🎮'],
];

export function detectAutoEmoji(text: string): string {
  return AUTO_EMOJI_RULES.find(([pattern]) => pattern.test(text))?.[1] ?? '📋';
}

export function extractOrDetectEmoji(text: string): string {
  if (!text) return '📋';
  const match = text.match(/\p{Extended_Pictographic}/u);
  if (match) return match[0];
  return detectAutoEmoji(text);
}

const CUSTOM_COLORS: CustomCategory['colorScheme'][] = ['amber', 'emerald', 'purple', 'blue', 'rose', 'indigo', 'teal'];
const COLOR_STYLES: Record<CustomCategory['colorScheme'], { bg: string; header: string; border: string; text: string; badge: string; check: string; itemBg: string }> = {
  amber: { bg: 'bg-white', header: 'bg-gradient-to-r from-amber-800 to-amber-700', border: 'border-amber-200', text: 'text-amber-950', badge: 'bg-amber-100 text-amber-800', check: 'accent-amber-600', itemBg: 'bg-amber-50' },
  emerald: { bg: 'bg-white', header: 'bg-gradient-to-r from-emerald-800 to-emerald-700', border: 'border-emerald-200', text: 'text-emerald-950', badge: 'bg-emerald-100 text-emerald-800', check: 'accent-emerald-600', itemBg: 'bg-emerald-50' },
  purple: { bg: 'bg-white', header: 'bg-gradient-to-r from-purple-800 to-purple-700', border: 'border-purple-200', text: 'text-purple-950', badge: 'bg-purple-100 text-purple-800', check: 'accent-purple-600', itemBg: 'bg-purple-50' },
  blue: { bg: 'bg-white', header: 'bg-gradient-to-r from-blue-800 to-blue-700', border: 'border-blue-200', text: 'text-blue-950', badge: 'bg-blue-100 text-blue-800', check: 'accent-blue-600', itemBg: 'bg-blue-50' },
  rose: { bg: 'bg-white', header: 'bg-gradient-to-r from-rose-800 to-rose-700', border: 'border-rose-200', text: 'text-rose-950', badge: 'bg-rose-100 text-rose-800', check: 'accent-rose-600', itemBg: 'bg-rose-50' },
  indigo: { bg: 'bg-white', header: 'bg-gradient-to-r from-indigo-800 to-indigo-700', border: 'border-indigo-200', text: 'text-indigo-950', badge: 'bg-indigo-100 text-indigo-800', check: 'accent-indigo-600', itemBg: 'bg-indigo-50' },
  teal: { bg: 'bg-white', header: 'bg-gradient-to-r from-teal-800 to-teal-700', border: 'border-teal-200', text: 'text-teal-950', badge: 'bg-teal-100 text-teal-800', check: 'accent-teal-600', itemBg: 'bg-teal-50' },
};

const AccordionContent: React.FC<{ open: boolean; className: string; children: React.ReactNode }> = ({ open, className, children }) => (
  <div
    aria-hidden={!open}
    inert={!open}
    className={`grid overflow-hidden transition-[grid-template-rows] duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
  >
    <div className="min-h-0 overflow-hidden">
        <div data-accordion-open={open} className={`accordion-fold-content pt-4 ${className}`}>
        {children}
      </div>
    </div>
  </div>
);

function dueDaysFromDay(dueDay: number): number {
  const today = new Date();
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), dueDay);
  if (thisMonth < today) thisMonth.setMonth(thisMonth.getMonth() + 1);
  return Math.round((thisMonth.getTime() - today.setHours(0,0,0,0)) / 86400000);
}

interface ListsScreenProps {
  groceryItems: GroceryItem[];
  produceSchedules: ProduceSchedules;
  onToggleGroceryItem: (id: string) => void;
  onOpenGroceryDetail: (category: 'C' | 'V' | 'F') => void;
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
  onOpenNewEntry: (type?: 'grocery' | 'chit' | 'emi' | 'bill' | 'quicktask', quickTaskCategoryId?: string) => void;
}

export const ListsScreen: React.FC<ListsScreenProps> = ({
  groceryItems,
  produceSchedules,
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

  const [sectionLabels, setSectionLabels] = useState<Record<SectionKey, SectionLabel>>(() => {
    try {
      const saved = localStorage.getItem(SECTION_LABELS_KEY);
      return saved ? { ...defaultLabels, ...JSON.parse(saved) } : defaultLabels;
    } catch {
      return defaultLabels;
    }
  });

  const [extraSections, setExtraSections] = useState<CustomCategory[]>(() => {
    try {
      const saved = localStorage.getItem('nestd_extra_sections');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.map((category) => ({
        ...category,
        icon: category.icon || extractOrDetectEmoji(category.title || ''),
        colorScheme: COLOR_STYLES[category.colorScheme as CustomCategory['colorScheme']] ? category.colorScheme : 'blue',
        items: Array.isArray(category.items) ? category.items : [],
      })) : [];
    } catch {
      return [];
    }
  });
  const [pinnedListCategory, setPinnedListCategory] = useState<string | null>(null);

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

  useEffect(() => {
    const scroller = document.querySelector<HTMLElement>('.app-scroll');
    if (!scroller) return;

    let frame = 0;
    const updatePinnedCategory = () => {
      frame = 0;
      const appHeader = scroller.querySelector<HTMLElement>('header');
      const scrollerTop = scroller.getBoundingClientRect().top;
      const appHeaderBottom = appHeader?.getBoundingClientRect().bottom ?? scrollerTop + 50;
      const categoryOffset = Math.max(0, appHeaderBottom - scrollerTop);
      const stickyLine = appHeaderBottom;
      const headers = Array.from(document.querySelectorAll<HTMLElement>('[data-list-section-header]'));
      const currentHeader = headers.filter((header) => {
        const headerRect = header.getBoundingClientRect();
        const section = header.closest<HTMLElement>('[data-list-category]');
        const sectionBottom = section?.getBoundingClientRect().bottom ?? 0;
        return headerRect.top <= stickyLine + 1 && sectionBottom > stickyLine + 48;
      }).at(-1);
      const nextId = currentHeader?.dataset.listSectionHeader ?? null;
      scroller.style.setProperty('--list-sticky-top', `${categoryOffset}px`);
      setPinnedListCategory((previous) => previous === nextId ? previous : nextId);
    };

    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updatePinnedCategory);
    };
    scroller.addEventListener('scroll', scheduleUpdate, { passive: true });
    scheduleUpdate();
    return () => {
      scroller.removeEventListener('scroll', scheduleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [extraSections.length]);

  const [isManageOpen, setIsManageOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<SectionKey | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatSubtitle, setNewCatSubtitle] = useState('');
  const [newCatColor, setNewCatColor] = useState<CustomCategory['colorScheme']>('blue');
  const [newTaskTitles, setNewTaskTitles] = useState<Record<string, string>>({});
  const [newTaskDetails, setNewTaskDetails] = useState<Record<string, { subtitle: string; amt: string; dueDate: string }>>({});

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
    const newSec: CustomCategory = {
      id: `sec-${Date.now()}`,
      title: newCatName.trim(),
      subtitle: newCatSubtitle.trim() || 'Custom category',
      icon: extractOrDetectEmoji(newCatName),
      colorScheme: newCatColor,
      items: [],
    };
    setExtraSections((prev) => [...prev, newSec]);
    setNewCatName('');
    setNewCatSubtitle('');
    setNewCatColor('blue');
  };

  const deleteExtraSection = (id: string) => {
    setExtraSections((prev) => prev.filter((s) => s.id !== id));
  };

  const addCustomItem = (categoryId: string) => {
    const title = (newTaskTitles[categoryId] || '').trim();
    if (!title) return;
    const details = newTaskDetails[categoryId] || { subtitle: '', amt: '', dueDate: '' };
    const item: CustomCategoryItem = {
      id: `item-${Date.now()}`, title, completed: false,
      ...(details.subtitle.trim() ? { subtitle: details.subtitle.trim() } : {}),
      ...(details.amt.trim() ? { amt: details.amt.trim() } : {}),
      ...(details.dueDate ? { dueDate: new Date(`${details.dueDate}T00:00:00`).toLocaleDateString() } : {}),
    };
    setExtraSections((prev) => prev.map((category) => category.id === categoryId ? { ...category, items: [...category.items, item] } : category));
    setNewTaskTitles((prev) => ({ ...prev, [categoryId]: '' }));
    setNewTaskDetails((prev) => ({ ...prev, [categoryId]: { subtitle: '', amt: '', dueDate: '' } }));
  };

  const toggleCustomItem = (categoryId: string, itemId: string) => {
    setExtraSections((prev) => prev.map((category) => category.id === categoryId
      ? { ...category, items: category.items.map((item) => item.id === itemId ? { ...item, completed: !item.completed } : item) }
      : category));
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

  const nonVegItems = groceryItems.filter((g) => g.group !== 'Vegetables' && g.isInMaster !== false);
  const buyNowCount = nonVegItems.filter((g) => g.needed && !g.completed).length;
  const pendingVegCount = groceryItems.filter((g) => g.group === 'Vegetables' && !g.completed).length;
  const pendingFruitCount = groceryItems.filter((g) => g.group === 'Fruit' && !g.completed).length;
  const fruitItemCount = groceryItems.filter((g) => g.group === 'Fruit').length;
  const totalGroceryCount = groceryItems.filter((item) => item.group === 'Vegetables' || item.group === 'Fruit' || item.isInMaster !== false).length;
  const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
    <div className="flex flex-col w-full max-w-md mx-auto px-4 pb-28 pt-5 space-y-7">
      {/* Page Header (Title & Search/Filter) */}
      <div className="flex items-center justify-between gap-3 rounded-3xl border border-indigo-100 bg-gradient-to-br from-white via-white to-indigo-50 px-4 py-4 shadow-[0_8px_24px_rgba(67,56,202,0.07)]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-[27px] md:text-[29px] font-extrabold text-on-surface tracking-tight leading-tight">
              My Lists
            </h1>
            <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 font-display text-xs font-extrabold shadow-sm">
              {3 + extraSections.length} categories
            </span>
          </div>
          <p className="text-[12px] text-on-surface-variant font-medium mt-1">
            Personal collections & daily lifelines
          </p>
        </div>

        <button
          onClick={() => setIsManageOpen(true)}
          className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-colors active:scale-95"
          title="Customise & Add Categories"
        >
          <span className="material-symbols-outlined text-[20px]">tune</span>
        </button>
      </div>

      {/* SECTION 1: Groceries & Pantry (Collapsible Accordion) */}
      <section className="flex flex-col" id="section-groceries" data-list-category="groceries">
        <div
          data-list-section-header="groceries"
          onClick={() => toggleSection('groceries')}
          className={`list-section-sticky ${pinnedListCategory === 'groceries' ? 'is-pinned' : ''} group flex items-center justify-between gap-2 rounded-2xl cursor-pointer select-none active:scale-[0.99] transition-[padding,color,background-color,border-color,box-shadow] duration-160 ${pinnedListCategory === 'groceries' ? 'px-3 py-2 border border-amber-200 bg-amber-50 text-amber-950 shadow-md' : 'px-3.5 py-3.5 border border-amber-700 bg-gradient-to-r from-amber-800 via-amber-700 to-amber-600 text-white shadow-md shadow-amber-900/15 hover:shadow-lg'}`}
        >
          <div className="flex items-center gap-3">
            <div className={`rounded-xl flex items-center justify-center text-xl shadow-2xs shrink-0 group-hover:scale-105 transition-all duration-160 ${pinnedListCategory === 'groceries' ? 'w-8 h-8 bg-white border border-amber-200' : 'w-10 h-10 bg-white/15 border border-white/20'}`}>
              {sectionLabels.groceries.icon}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`font-extrabold uppercase tracking-tight transition-all duration-160 ${pinnedListCategory === 'groceries' ? 'text-[9px] text-amber-700' : 'text-[11px] text-white/80'}`}>
                  {sectionLabels.groceries.subtitle}
                </span>
                <span className={`w-1 h-1 rounded-full ${pinnedListCategory === 'groceries' ? 'bg-amber-400' : 'bg-white/60'}`} />
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${pinnedListCategory === 'groceries' ? 'bg-amber-100 text-amber-800' : 'bg-white/15 text-white'}`}>
                  {totalGroceryCount} items
                </span>
              </div>
              <h2 className={`font-bold font-display tracking-tight leading-none mt-0.5 transition-all duration-160 ${pinnedListCategory === 'groceries' ? 'text-base text-amber-950' : 'text-xl text-white'}`}>
                {sectionLabels.groceries.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-160 shrink-0 ${pinnedListCategory === 'groceries' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-white/15 text-white hover:bg-white/25'} ${
                collapsedSections.groceries ? '' : 'rotate-180'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">keyboard_arrow_down</span>
            </div>
          </div>
        </div>

        {/* Section Cards matching #groc-grid from nestd (Category C & V) */}
        <AccordionContent open={!collapsedSections.groceries} className="ml-2 border-l-2 border-amber-200 pl-3">
          <p className="mb-3 pl-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-amber-700/80">Subcategories</p>
          <div className="grid grid-cols-1 gap-3.5">
            {/* Card 1: 🛒 Shopping & Staples (Category C) */}
            <div
              onClick={() => onOpenGroceryDetail('C')}
              className="group relative rounded-2xl p-4 transition-all duration-200 cursor-pointer overflow-hidden border border-amber-200 bg-gradient-to-br from-amber-50 to-white hover:border-amber-300 shadow-2xs hover:shadow-md active:scale-[0.99]"
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
              className="group relative rounded-2xl p-4 transition-all duration-200 cursor-pointer overflow-hidden border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white hover:border-emerald-300 shadow-2xs hover:shadow-md active:scale-[0.99]"
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
                      Shop on {weekdayNames[produceSchedules.vegetables.marketDay]} · Weekly produce list
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
            {/* Card 3: Weekly fruits */}
            <div
              onClick={() => onOpenGroceryDetail('F')}
              className="group relative rounded-2xl p-4 transition-all duration-200 cursor-pointer overflow-hidden border border-rose-200 bg-gradient-to-br from-rose-50 to-white hover:border-rose-300 shadow-2xs hover:shadow-md active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-300/40 flex items-center justify-center text-2xl shadow-2xs group-hover:scale-105 transition-transform shrink-0">🍍</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display text-base font-bold text-slate-900">Fruits</h3>
                      {pendingFruitCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 text-[11px] font-extrabold">{pendingFruitCount} to pick up</span>
                      ) : fruitItemCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-rose-700 text-[11px] font-bold">All bought for week</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">Add fruit list</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">Shop on {weekdayNames[produceSchedules.fruits.marketDay]} · Weekly fruit list</p>
                  </div>
                </div>
                <span className="material-symbols-outlined ml-2 shrink-0 text-slate-400 group-hover:translate-x-0.5 group-hover:text-rose-600 transition-all text-[22px]">chevron_right</span>
              </div>
              <div className="mt-2.5 pt-2 border-t border-rose-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">Weekly fruit reminder & purchase history</span>
                <span className="text-rose-700 font-bold group-hover:underline">Open fruit list ›</span>
              </div>
            </div>          </div>
        </AccordionContent>
      </section>

      {/* SECTION 2: Life OS (Commitments & Wealth) */}
      <section className="flex flex-col pt-1" id="section-lifeos" data-list-category="lifeos">
        <div
          data-list-section-header="lifeos"
          onClick={() => toggleSection('lifeos')}
          className={`list-section-sticky ${pinnedListCategory === 'lifeos' ? 'is-pinned' : ''} group flex items-center justify-between gap-2 rounded-2xl cursor-pointer select-none active:scale-[0.99] transition-[padding,color,background-color,border-color,box-shadow] duration-160 ${pinnedListCategory === 'lifeos' ? 'px-3 py-2 border border-emerald-200 bg-emerald-50 text-emerald-950 shadow-md' : 'px-3.5 py-3.5 border border-emerald-700 bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-600 text-white shadow-md shadow-emerald-900/15 hover:shadow-lg'}`}
        >
          <div className="flex items-center gap-3">
            <div className={`rounded-xl flex items-center justify-center text-xl shadow-2xs shrink-0 group-hover:scale-105 transition-all duration-160 ${pinnedListCategory === 'lifeos' ? 'w-8 h-8 bg-white border border-emerald-200' : 'w-10 h-10 bg-white/15 border border-white/20'}`}>
              {sectionLabels.lifeos.icon}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`font-extrabold uppercase tracking-tight transition-all duration-160 ${pinnedListCategory === 'lifeos' ? 'text-[9px] text-emerald-700' : 'text-[11px] text-white/80'}`}>
                  {sectionLabels.lifeos.subtitle}
                </span>
                <span className={`w-1 h-1 rounded-full ${pinnedListCategory === 'lifeos' ? 'bg-emerald-400' : 'bg-white/60'}`} />
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${pinnedListCategory === 'lifeos' ? 'bg-emerald-100 text-emerald-800' : 'bg-white/15 text-white'}`}>
                  Peace of mind
                </span>
              </div>
              <h2 className={`font-bold font-display tracking-tight leading-none mt-0.5 transition-all duration-160 ${pinnedListCategory === 'lifeos' ? 'text-base text-emerald-950' : 'text-xl text-white'}`}>
                {sectionLabels.lifeos.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-160 shrink-0 ${pinnedListCategory === 'lifeos' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-white/15 text-white hover:bg-white/25'} ${
                collapsedSections.lifeos ? '' : 'rotate-180'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">keyboard_arrow_down</span>
            </div>
          </div>
        </div>

        {/* Section Cards */}
        <AccordionContent open={!collapsedSections.lifeos} className="ml-2 border-l-2 border-emerald-200 pl-3">
          <p className="mb-3 pl-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-emerald-700/80">Subcategories</p>
          <div className="grid grid-cols-1 gap-3.5">
            {/* Card 1: Rich Golden Saffron Chit Fund Theme */}
            <div
              onClick={onOpenChits}
              className="group relative rounded-2xl p-4 transition-all duration-200 cursor-pointer overflow-hidden border border-yellow-300/70 shadow-[0_4px_20px_-4px_rgba(234,179,8,0.14)] active:scale-[0.99] flex items-center justify-between"
              style={{
                background: 'linear-gradient(135deg, #fffbeb 0%, #fffdf7 55%, #ffffff 100%)',
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
                background: 'linear-gradient(135deg, #f0fdfa 0%, #f8fdfb 55%, #ffffff 100%)',
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
                background: 'linear-gradient(135deg, #fff1f2 0%, #fff8f8 55%, #ffffff 100%)',
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
                background: 'linear-gradient(135deg, #ecfdf5 0%, #f7fcf9 55%, #ffffff 100%)',
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
                background: 'linear-gradient(135deg, #faf5ff 0%, #fcfaff 55%, #ffffff 100%)',
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
                background: 'linear-gradient(135deg, #eef2ff 0%, #f8f9ff 55%, #ffffff 100%)',
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
        </AccordionContent>
      </section>

      {/* SECTION 3: Quick Tasks (Collapsible Accordion) */}
      <section className="flex flex-col pt-1" id="section-quicktasks" data-list-category="quicktasks">
        <div
          data-list-section-header="quicktasks"
          onClick={() => toggleSection('quicktasks')}
          className={`list-section-sticky ${pinnedListCategory === 'quicktasks' ? 'is-pinned' : ''} group flex items-center justify-between gap-2 rounded-2xl cursor-pointer select-none active:scale-[0.99] transition-[padding,color,background-color,border-color,box-shadow] duration-160 ${pinnedListCategory === 'quicktasks' ? 'px-3 py-2 border border-purple-200 bg-purple-50 text-purple-950 shadow-md' : 'px-3.5 py-3.5 border border-purple-700 bg-gradient-to-r from-purple-800 via-purple-700 to-purple-600 text-white shadow-md shadow-purple-900/15 hover:shadow-lg'}`}
        >
          <div className="flex items-center gap-3">
            <div className={`rounded-xl flex items-center justify-center text-xl shadow-2xs shrink-0 group-hover:scale-105 transition-all duration-160 ${pinnedListCategory === 'quicktasks' ? 'w-8 h-8 bg-white border border-purple-200' : 'w-10 h-10 bg-white/15 border border-white/20'}`}>
              {sectionLabels.quicktasks.icon}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`font-extrabold uppercase tracking-tight transition-all duration-160 ${pinnedListCategory === 'quicktasks' ? 'text-[9px] text-purple-700' : 'text-[11px] text-white/80'}`}>
                  {sectionLabels.quicktasks.subtitle}
                </span>
                <span className={`w-1 h-1 rounded-full ${pinnedListCategory === 'quicktasks' ? 'bg-purple-400' : 'bg-white/60'}`} />
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${pinnedListCategory === 'quicktasks' ? 'bg-purple-100 text-purple-800' : 'bg-white/15 text-white'}`}>
                  {quickTasks.reduce((acc, q) => acc + q.tasksCount, 0)} active
                </span>
              </div>
              <h2 className={`font-bold font-display tracking-tight leading-none mt-0.5 transition-all duration-160 ${pinnedListCategory === 'quicktasks' ? 'text-base text-purple-950' : 'text-xl text-white'}`}>
                {sectionLabels.quicktasks.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-160 shrink-0 ${pinnedListCategory === 'quicktasks' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' : 'bg-white/15 text-white hover:bg-white/25'} ${
                collapsedSections.quicktasks ? '' : 'rotate-180'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">keyboard_arrow_down</span>
            </div>
          </div>
        </div>

        {/* 3-Column Subcards */}
        <AccordionContent open={!collapsedSections.quicktasks} className="ml-2 border-l-2 border-purple-200 pl-3">
          <p className="mb-3 pl-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-purple-700/80">Subcategories</p>
          <div className="grid grid-cols-3 gap-3">
            {quickTasks.map((category) => {
              const bgGradient =
                category.colorScheme === 'blue'
                  ? 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)'
                  : category.colorScheme === 'emerald'
                  ? 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)'
                  : 'linear-gradient(135deg, #faf5ff 0%, #ffffff 100%)';

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
                      onOpenNewEntry('quicktask', category.id);
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
        </AccordionContent>
      </section>

      {/* Extra custom sections */}
      {extraSections.map((sec) => {
        const colors = COLOR_STYLES[sec.colorScheme] || COLOR_STYLES.blue;
        return (
          <section key={sec.id} data-list-category={sec.id} className={`flex flex-col space-y-1 rounded-3xl border p-3 shadow-sm ${colors.bg} ${colors.border}`}>
            <div
              data-list-section-header={sec.id}
              role="button"
              tabIndex={0}
              aria-expanded={!collapsedSections[sec.id]}
              onClick={() => toggleSection(sec.id)}
              onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggleSection(sec.id); } }}
              className={`list-section-sticky ${pinnedListCategory === sec.id ? 'is-pinned' : ''} flex items-center justify-between gap-3 rounded-2xl cursor-pointer select-none shadow-sm transition-[padding,color,background-color,border-color,box-shadow] duration-160 ${pinnedListCategory === sec.id ? `border ${colors.border} px-3 py-2 ${colors.itemBg} ${colors.text}` : `px-3 py-3 text-white ${colors.header}`}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`rounded-xl flex items-center justify-center text-xl shrink-0 transition-all duration-160 ${pinnedListCategory === sec.id ? 'w-8 h-8 bg-white border border-black/5' : 'w-10 h-10 bg-white/15 border border-white/20'}`}>{sec.icon}</div>
                <div className="min-w-0">
                  <span className={`font-extrabold uppercase tracking-tight transition-all duration-160 ${pinnedListCategory === sec.id ? 'text-[9px] opacity-70' : 'text-[11px] text-white/80'}`}>{sec.subtitle}</span>
                  <h2 className={`font-bold font-display tracking-tight leading-tight transition-all duration-160 ${pinnedListCategory === sec.id ? 'text-base' : 'text-xl text-white'}`}>{sec.title}</h2>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-2 py-1 rounded-full text-[11px] font-bold ${pinnedListCategory === sec.id ? 'bg-white text-current' : 'bg-white/15 text-white'}`}>{sec.items.filter((item) => !item.completed).length} open</span>
                <span className={`material-symbols-outlined transition-transform duration-160 ${collapsedSections[sec.id] ? '' : 'rotate-180'}`}>keyboard_arrow_down</span>
              </div>
            </div>
            <AccordionContent open={!collapsedSections[sec.id]} className={`ml-2 border-l-2 pl-3 ${colors.border}`}>
              <p className="mb-3 pl-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-500">Items</p>
              <div className="space-y-2">
              {sec.items.map((item) => (
                <label key={item.id} className={`flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer ${colors.itemBg}`}>
                  <input type="checkbox" checked={item.completed} onChange={() => toggleCustomItem(sec.id, item.id)} className={`mt-1 h-4 w-4 ${colors.check}`} />
                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm font-semibold ${item.completed ? 'line-through text-slate-400' : colors.text}`}>{item.title}</span>
                    {(item.subtitle || item.amt || item.dueDate) && <span className="block text-xs text-slate-500 mt-0.5">{[item.subtitle, item.amt, item.dueDate].filter(Boolean).join(' · ')}</span>}
                  </span>
                </label>
              ))}
              </div>
              <form onSubmit={(event) => { event.preventDefault(); addCustomItem(sec.id); }} className="mt-3 grid grid-cols-2 gap-2">
              <input value={newTaskTitles[sec.id] || ''} onChange={(event) => setNewTaskTitles((prev) => ({ ...prev, [sec.id]: event.target.value }))} placeholder="Item name" className="col-span-2 min-w-0 rounded-xl border border-white bg-white/85 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
              <input value={newTaskDetails[sec.id]?.subtitle || ''} onChange={(event) => setNewTaskDetails((prev) => ({ ...prev, [sec.id]: { subtitle: event.target.value, amt: prev[sec.id]?.amt || '', dueDate: prev[sec.id]?.dueDate || '' } }))} placeholder="Note (optional)" className="min-w-0 rounded-xl border border-white bg-white/85 px-3 py-2 text-xs outline-none" />
              <input value={newTaskDetails[sec.id]?.amt || ''} onChange={(event) => setNewTaskDetails((prev) => ({ ...prev, [sec.id]: { subtitle: prev[sec.id]?.subtitle || '', amt: event.target.value, dueDate: prev[sec.id]?.dueDate || '' } }))} placeholder="Amount (optional)" className="min-w-0 rounded-xl border border-white bg-white/85 px-3 py-2 text-xs outline-none" />
              <input type="date" value={newTaskDetails[sec.id]?.dueDate || ''} onChange={(event) => setNewTaskDetails((prev) => ({ ...prev, [sec.id]: { subtitle: prev[sec.id]?.subtitle || '', amt: prev[sec.id]?.amt || '', dueDate: event.target.value } }))} className="min-w-0 rounded-xl border border-white bg-white/85 px-3 py-2 text-xs outline-none" />
              <button type="submit" disabled={!(newTaskTitles[sec.id] || '').trim()} className="flex items-center justify-center gap-1 rounded-xl bg-white text-primary disabled:opacity-40" title="Add item"><span className="material-symbols-outlined text-[18px]">add</span><span className="text-xs font-bold">Add item</span></button>
              </form>
            </AccordionContent>
          </section>
        );
      })}

      {/* Manage Categories Bottom Sheet */}
      {isManageOpen && createPortal((
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
                <h3 className="font-display font-extrabold text-base text-slate-900">Customise Categories</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Rename sections or create personalised lists</p>
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

              {/* Add a personalised category. Its icon is detected from the name. */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[11px] font-extrabold uppercase tracking-tight text-slate-400 mb-2">Add New Category</p>
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
                <p className="text-xs font-semibold text-slate-600 mb-2">Color theme</p>
                <div className="flex gap-2 mb-3">
                  {CUSTOM_COLORS.map((color) => (
                    <button key={color} type="button" aria-label={`${color} theme`} title={`${color} theme`} onClick={() => setNewCatColor(color)} className={`h-8 w-8 rounded-full border-2 ${COLOR_STYLES[color].bg} ${COLOR_STYLES[color].border} ${newCatColor === color ? 'ring-2 ring-primary ring-offset-2' : ''}`} />
                  ))}
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 mb-3">
                  <span className="text-2xl" aria-hidden="true">{extractOrDetectEmoji(newCatName)}</span>
                  <span className="text-xs text-slate-600">{newCatName.trim() ? 'Suggested icon for this category' : 'Type a category name to suggest an icon. You can also include an emoji.'}</span>
                </div>
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
      ), document.body)}
    </div>
  );
};
