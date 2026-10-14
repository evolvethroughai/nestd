import { useState, useEffect } from 'react';
import {
  TabType,
  TodayTask,
  ChitItem,
  EmiLoanItem,
  BillItem,
  SubBillItem,
  GroceryItem,
  QuickTaskCategory,
  AutomationLog,
  InvestmentItem,
  HealthItem,
  BusinessState,
} from './types';
import {
  INITIAL_TODAY_TASKS,
  INITIAL_CHITS,
  INITIAL_EMIS,
  INITIAL_BILLS,
  INITIAL_SUB_BILLS,
  INITIAL_GROCERIES,
  INITIAL_QUICK_TASKS,
  INITIAL_AUTOMATIONS,
  INITIAL_INVESTMENTS,
  INITIAL_HEALTH,
  INITIAL_BUSINESS,
} from './data/mockData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { TodayScreen } from './components/TodayScreen';
import { ListsScreen } from './components/ListsScreen';
import { SortiScreen } from './components/SortiScreen';
import { FocusModal } from './components/FocusModal';
import { ItemDetailsModal } from './components/ItemDetailsModal';
import { NewEntryModal } from './components/NewEntryModal';
import { ProfileModal } from './components/ProfileModal';
import { ChitsManager } from './components/ChitsManager';
import { EmisManager } from './components/EmisManager';
import { BillsManager } from './components/BillsManager';
import { GroceryManager } from './components/GroceryManager';
import { InvestmentsManager } from './components/InvestmentsManager';
import { HealthManager } from './components/HealthManager';
import { BusinessManager } from './components/BusinessManager';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('lists');
  const [viewMode, setViewMode] = useState<'phone' | 'phone-max' | 'fluid'>('phone-max');

  // Core Data States with localStorage persistence (jt-v5 matching devnotes)
  const [todayTasks, setTodayTasks] = useState<TodayTask[]>(() => {
    try {
      const saved = localStorage.getItem('nestd_today_tasks');
      return saved ? JSON.parse(saved) : INITIAL_TODAY_TASKS;
    } catch {
      return INITIAL_TODAY_TASKS;
    }
  });

  const [chits, setChits] = useState<ChitItem[]>(() => {
    try {
      const saved = localStorage.getItem('nestd_chits');
      return saved ? JSON.parse(saved) : INITIAL_CHITS;
    } catch {
      return INITIAL_CHITS;
    }
  });

  const [emis, setEmis] = useState<EmiLoanItem[]>(() => {
    try {
      const saved = localStorage.getItem('nestd_emis');
      return saved ? JSON.parse(saved) : INITIAL_EMIS;
    } catch {
      return INITIAL_EMIS;
    }
  });

  const [bills, setBills] = useState<BillItem[]>(() => {
    try {
      const saved = localStorage.getItem('nestd_bills');
      return saved ? JSON.parse(saved) : INITIAL_BILLS;
    } catch {
      return INITIAL_BILLS;
    }
  });

  const [subBills, setSubBills] = useState<SubBillItem[]>(() => {
    try {
      const saved = localStorage.getItem('nestd_sub_bills');
      return saved ? JSON.parse(saved) : INITIAL_SUB_BILLS;
    } catch {
      return INITIAL_SUB_BILLS;
    }
  });

  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>(() => {
    try {
      const saved = localStorage.getItem('nestd_groceries_v2');
      return saved ? JSON.parse(saved) : INITIAL_GROCERIES;
    } catch {
      return INITIAL_GROCERIES;
    }
  });

  const [quickTasks, setQuickTasks] = useState<QuickTaskCategory[]>(() => {
    try {
      const saved = localStorage.getItem('nestd_quick_tasks');
      return saved ? JSON.parse(saved) : INITIAL_QUICK_TASKS;
    } catch {
      return INITIAL_QUICK_TASKS;
    }
  });

  const [automations, setAutomations] = useState<AutomationLog[]>(() => {
    try {
      const saved = localStorage.getItem('nestd_automations');
      return saved ? JSON.parse(saved) : INITIAL_AUTOMATIONS;
    } catch {
      return INITIAL_AUTOMATIONS;
    }
  });

  const [investments, setInvestments] = useState<InvestmentItem[]>(() => {
    try {
      const saved = localStorage.getItem('nestd_investments');
      return saved ? JSON.parse(saved) : INITIAL_INVESTMENTS;
    } catch {
      return INITIAL_INVESTMENTS;
    }
  });

  const [healthItems, setHealthItems] = useState<HealthItem[]>(() => {
    try {
      const saved = localStorage.getItem('nestd_health');
      return saved ? JSON.parse(saved) : INITIAL_HEALTH;
    } catch {
      return INITIAL_HEALTH;
    }
  });

  const [business, setBusiness] = useState<BusinessState>(() => {
    try {
      const saved = localStorage.getItem('nestd_business');
      return saved ? JSON.parse(saved) : INITIAL_BUSINESS;
    } catch {
      return INITIAL_BUSINESS;
    }
  });

  // Modal / Drawer States
  const [activeDrawer, setActiveDrawer] = useState<
    'chits' | 'emis' | 'bills' | 'grocery-shopping' | 'grocery-veg' | 'investments' | 'health' | 'business' | null
  >(null);

  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [newEntryModalConfig, setNewEntryModalConfig] = useState<{
    isOpen: boolean;
    initialType?: 'grocery' | 'lifeos' | 'quicktask' | 'category';
  }>({ isOpen: false });

  const [quickTaskModalCat, setQuickTaskModalCat] = useState<QuickTaskCategory | null>(null);

  // Toast feedback banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 3000);
  };

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nestd_today_tasks', JSON.stringify(todayTasks));
      localStorage.setItem('nestd_chits', JSON.stringify(chits));
      localStorage.setItem('nestd_emis', JSON.stringify(emis));
      localStorage.setItem('nestd_bills', JSON.stringify(bills));
      localStorage.setItem('nestd_sub_bills', JSON.stringify(subBills));
      localStorage.setItem('nestd_groceries_v2', JSON.stringify(groceryItems));
      localStorage.setItem('nestd_quick_tasks', JSON.stringify(quickTasks));
      localStorage.setItem('nestd_automations', JSON.stringify(automations));
      localStorage.setItem('nestd_investments', JSON.stringify(investments));
      localStorage.setItem('nestd_health', JSON.stringify(healthItems));
      localStorage.setItem('nestd_business', JSON.stringify(business));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [todayTasks, chits, emis, bills, subBills, groceryItems, quickTasks, automations, investments, healthItems, business]);

  // Today Tasks Handlers
  const handleToggleTask = (id: string) => {
    setTodayTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const nextCompleted = !task.completed;
          return {
            ...task,
            completed: nextCompleted,
            tagType: nextCompleted ? 'done' : 'work',
            completedAt: nextCompleted ? 'Just now' : undefined,
          };
        }
        return task;
      })
    );
  };

  const handleAddTodayTask = (
    title: string,
    category: string = 'Personal',
    tagType: TodayTask['tagType'] = 'work',
    timeOfDay: TodayTask['timeOfDay'] = 'morning'
  ) => {
    const newTask: TodayTask = {
      id: `task-${Date.now()}`,
      title,
      time: '11:00 AM',
      category,
      tag: `• ${tagType.charAt(0).toUpperCase() + tagType.slice(1)}`,
      tagType,
      completed: false,
      timeOfDay,
    };
    setTodayTasks((prev) => [newTask, ...prev]);
    showToast(`Task added to Today's focus: "${title}"`);
  };

  const handleDeleteTodayTask = (id: string) => {
    setTodayTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // --- CHITS HANDLERS ---
  const handleAddChit = (chit: Omit<ChitItem, 'id'>) => {
    const newChit: ChitItem = {
      ...chit,
      id: `ch-${Date.now()}`,
    };
    setChits((prev) => [newChit, ...prev]);
    showToast(`Chit fund added: "${chit.name}"`);
  };

  const handleUpdateChit = (id: string, updates: Partial<ChitItem>) => {
    setChits((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    showToast('Chit fund updated');
  };

  const handleDeleteChit = (id: string) => {
    setChits((prev) => prev.filter((c) => c.id !== id));
    showToast('Chit fund removed');
  };

  // --- EMIS HANDLERS ---
  const handleAddEmi = (loan: Omit<EmiLoanItem, 'id' | 'partPayments'>) => {
    const newLoan: EmiLoanItem = {
      ...loan,
      id: `em-${Date.now()}`,
      partPayments: [],
    };
    setEmis((prev) => [newLoan, ...prev]);
    showToast(`Loan added: "${loan.name}"`);
  };

  const handleUpdateEmi = (id: string, updates: Partial<EmiLoanItem>) => {
    setEmis((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
    showToast('Loan details updated');
  };

  const handleDeleteEmi = (id: string) => {
    setEmis((prev) => prev.filter((e) => e.id !== id));
    showToast('Loan removed');
  };

  const handleAddPartPayment = (loanId: string, amt: number, date: string) => {
    setEmis((prev) =>
      prev.map((e) => {
        if (e.id === loanId) {
          const newPart = { id: `pp-${Date.now()}`, amt, date };
          return {
            ...e,
            partPayments: [newPart, ...e.partPayments],
          };
        }
        return e;
      })
    );
    showToast(`Part payment of ₹${amt.toLocaleString('en-IN')} recorded!`);
  };

  const handleDeletePartPayment = (loanId: string, partId: string) => {
    setEmis((prev) =>
      prev.map((e) => {
        if (e.id === loanId) {
          return {
            ...e,
            partPayments: e.partPayments.filter((p) => p.id !== partId),
          };
        }
        return e;
      })
    );
  };

  // --- BILLS HANDLERS ---
  const handleToggleBill = (id: string) => {
    setBills((prev) =>
      prev.map((b) => (b.id === id ? { ...b, paid: !b.paid } : b))
    );
  };

  const handleToggleSubBill = (id: string) => {
    setSubBills((prev) =>
      prev.map((s) => (s.id === id ? { ...s, paid: !s.paid } : s))
    );
  };

  const handleAddSubBill = (parentId: string, name: string, consumerNo: string, dueDay: number) => {
    const newSub: SubBillItem = {
      id: `sb-${Date.now()}`,
      parentId,
      name,
      consumerNo,
      dueDay,
      paid: false,
    };
    setSubBills((prev) => [...prev, newSub]);
    showToast(`Connection added to bills`);
  };

  const handleDeleteSubBill = (id: string) => {
    setSubBills((prev) => prev.filter((s) => s.id !== id));
  };

  const handleQuickPayAllBills = () => {
    setBills((prev) => prev.map((b) => ({ ...b, paid: true })));
    setSubBills((prev) => prev.map((s) => ({ ...s, paid: true })));
    showToast('All utility bills cleared! Status synced.');
  };

  // --- GROCERIES HANDLERS (matching docs/js/grocery.js) ---
  const handleToggleGroceryCompleted = (id: string, price?: string) => {
    setGroceryItems((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const nowCompleted = !i.completed;
          const today = new Date().toISOString().split('T')[0];
          const formatted = new Date().toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });
          return {
            ...i,
            completed: nowCompleted,
            price: price !== undefined && price !== '' ? price : i.price,
            boughtDate: nowCompleted ? today : i.boughtDate,
            boughtTimestamp: nowCompleted ? Date.now() : i.boughtTimestamp,
            lastBought: nowCompleted ? formatted : i.lastBought,
          };
        }
        return i;
      })
    );
  };

  const handleToggleGroceryNeeded = (id: string) => {
    setGroceryItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, needed: !i.needed } : i))
    );
  };

  const handleUpdateGroceryItem = (id: string, updates: Partial<GroceryItem>) => {
    setGroceryItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...updates } : i))
    );
  };

  const handleAddGroceryItem = (
    name: string,
    group: GroceryItem['group'],
    store: string,
    needed: boolean,
    qty?: string,
    price?: string
  ) => {
    const newItem: GroceryItem = {
      id: `g-${Date.now()}`,
      name,
      group,
      store,
      needed,
      completed: false,
      quantity: qty || '1 pack',
      price: price || '',
    };
    setGroceryItems((prev) => [newItem, ...prev]);
    showToast(`Added "${name}" to ${group}`);
  };

  const handleDeleteGroceryItem = (id: string) => {
    setGroceryItems((prev) => prev.filter((i) => i.id !== id));
  };

  // --- QUICK TASKS HANDLERS ---
  const handleToggleQuickTask = (categoryId: string, taskId: string) => {
    setQuickTasks((prev) =>
      prev.map((cat) => {
        if (cat.id === categoryId) {
          const updatedTasks = cat.tasks.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
          );
          return {
            ...cat,
            tasks: updatedTasks,
            tasksCount: updatedTasks.filter((t) => !t.completed).length,
          };
        }
        return cat;
      })
    );
  };

  const handleAddQuickTask = (categoryId: string, title: string) => {
    setQuickTasks((prev) =>
      prev.map((cat) => {
        if (cat.id === categoryId) {
          const newTask = { id: `qt-${Date.now()}`, title, completed: false };
          return {
            ...cat,
            tasks: [newTask, ...cat.tasks],
            tasksCount: cat.tasksCount + 1,
          };
        }
        return cat;
      })
    );
    showToast('Task added');
  };

  const handleAddCategory = (
    name: string,
    icon: string,
    colorScheme: 'blue' | 'emerald' | 'purple' | 'amber' | 'rose'
  ) => {
    const newCat: QuickTaskCategory = {
      id: `qt-${Date.now()}`,
      name,
      icon,
      tasksCount: 0,
      colorScheme,
      tasks: [],
    };
    setQuickTasks((prev) => [...prev, newCat]);
    showToast(`Category created: "${name}"`);
  };

  // --- INVESTMENTS HANDLERS ---
  const handleToggleInvestment = (id: string) => {
    setInvestments((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, paid: !inv.paid } : inv))
    );
    showToast('Investment status updated');
  };

  const handleAddInvestment = (item: Omit<InvestmentItem, 'id'>) => {
    const newInv: InvestmentItem = { ...item, id: `inv-${Date.now()}` };
    setInvestments((prev) => [newInv, ...prev]);
    showToast(`Investment added: "${item.name}"`);
  };

  const handleDeleteInvestment = (id: string) => {
    setInvestments((prev) => prev.filter((i) => i.id !== id));
    showToast('Investment removed');
  };

  // --- HEALTH HANDLERS ---
  const handleAddHealthItem = (item: Omit<HealthItem, 'id'>) => {
    const newHealth: HealthItem = { ...item, id: `hl-${Date.now()}` };
    setHealthItems((prev) => [newHealth, ...prev]);
    showToast(`Added to health: "${item.name}"`);
  };

  const handleDeleteHealthItem = (id: string) => {
    setHealthItems((prev) => prev.filter((h) => h.id !== id));
    showToast('Health item removed');
  };

  // --- BUSINESS HANDLERS ---
  const handleActivateIdea = (id: string) => {
    setBusiness((prev) => ({ ...prev, activeId: id }));
    const idea = business.ideas.find((i) => i.id === id);
    showToast(`Activated project: "${idea?.name || 'Venture'}"`);
  };

  const handleAddIdea = (name: string, note?: string) => {
    const newIdea = { id: `biz-id-${Date.now()}`, name, note };
    setBusiness((prev) => ({
      ...prev,
      ideas: [newIdea, ...prev.ideas],
      activeId: prev.activeId || newIdea.id,
    }));
    showToast(`Idea added: "${name}"`);
  };

  const handleDeleteIdea = (id: string) => {
    setBusiness((prev) => ({
      ...prev,
      ideas: prev.ideas.filter((i) => i.id !== id),
      activeId: prev.activeId === id ? (prev.ideas[1]?.id || null) : prev.activeId,
    }));
    showToast('Idea removed');
  };

  const handleToggleBizTask = (taskId: string) => {
    setBusiness((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
    }));
  };

  const handleAddBizTask = (title: string) => {
    const newTask = { id: `bt-${Date.now()}`, title, completed: false };
    setBusiness((prev) => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }));
    showToast('Milestone added');
  };

  const handleDeleteBizTask = (taskId: string) => {
    setBusiness((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }));
  };

  // --- SORTI COMPANION AUTO-SORTING ---
  const handleAutoSort = (text: string) => {
    const lower = text.toLowerCase();
    let destination = 'Pantry';
    let destinationCategory = 'Grocery';
    const cleanText = text.replace(/^[🛒⚡📅🥦💰🏡🎒]\s*/, '').trim();

    if (
      lower.includes('vegetable') ||
      lower.includes('mandi') ||
      lower.includes('coriander') ||
      lower.includes('spinach') ||
      lower.includes('tomato') ||
      lower.includes('onion') ||
      lower.includes('aloo') ||
      lower.includes('bhindi')
    ) {
      destination = 'Fresh Vegetables';
      destinationCategory = 'Grocery';
      handleAddGroceryItem(cleanText, 'Vegetables', 'Local Mandi', true);
    } else if (
      lower.includes('grocery') ||
      lower.includes('pantry') ||
      lower.includes('milk') ||
      lower.includes('egg') ||
      lower.includes('honey') ||
      lower.includes('bread') ||
      lower.includes('oil') ||
      lower.includes('rice') ||
      lower.includes('ghee') ||
      lower.includes('pappu')
    ) {
      destination = 'Pantry & Grocery';
      destinationCategory = 'Grocery';
      handleAddGroceryItem(cleanText, 'Staples / food', 'Ratnadeep', true);
    } else if (lower.includes('chit') || lower.includes('shriram') || lower.includes('kapil')) {
      destination = 'Life OS · Chits';
      destinationCategory = 'Life OS';
      handleAddChit({
        name: cleanText,
        monthlyAmt: 10000,
        pot: 250000,
        totalMonths: 25,
        startDate: new Date().toISOString().slice(0, 10),
        dueDay: 5,
        status: 'paying',
        lifted: false,
      });
    } else if (lower.includes('emi') || lower.includes('loan')) {
      destination = 'Life OS · EMIs';
      destinationCategory = 'Life OS';
      handleAddEmi({
        name: cleanText,
        loanAmt: 500000,
        interestRate: 8.5,
        tenureMonths: 60,
        emiAmt: 10258,
        startDate: new Date().toISOString().slice(0, 10),
        dueDay: 10,
        status: 'active',
      });
    } else if (lower.includes('bill') || lower.includes('bescom') || lower.includes('paid')) {
      destination = 'Life OS · Bills';
      destinationCategory = 'Life OS';
      handleQuickPayAllBills();
    } else {
      destination = "Today's Focus";
      destinationCategory = 'Today';
      handleAddTodayTask(cleanText, 'Sorti Action', 'work', 'afternoon');
    }

    const newAutomation: AutomationLog = {
      id: `auto-${Date.now()}`,
      item: cleanText,
      destination,
      destinationCategory,
      timeAgo: 'Just now',
      timestamp: Date.now(),
    };

    setAutomations((prev) => [newAutomation, ...prev]);
    return { item: cleanText, destination, category: destinationCategory };
  };

  const handleResetData = () => {
    setTodayTasks(INITIAL_TODAY_TASKS);
    setChits(INITIAL_CHITS);
    setEmis(INITIAL_EMIS);
    setBills(INITIAL_BILLS);
    setSubBills(INITIAL_SUB_BILLS);
    setGroceryItems(INITIAL_GROCERIES);
    setQuickTasks(INITIAL_QUICK_TASKS);
    setAutomations(INITIAL_AUTOMATIONS);
    setInvestments(INITIAL_INVESTMENTS);
    setHealthItems(INITIAL_HEALTH);
    setBusiness(INITIAL_BUSINESS);
    localStorage.clear();
    showToast('Reset all data to default repository seed.');
  };

  const uncompletedTasksCount = todayTasks.filter((t) => !t.completed).length;

  return (
    <div className="w-full h-[100dvh] max-h-[100dvh] bg-slate-100 sm:bg-slate-200/60 flex flex-col items-center justify-center overflow-hidden">
      {/* Device Format Switcher Bar (visible on desktop/tablet to test phone sizes) */}
      <div className="hidden sm:flex items-center gap-2 py-1 px-3 mb-2 bg-white/90 backdrop-blur-md rounded-full border border-slate-200 text-xs font-semibold shadow-xs z-30 select-none">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
          <span className="material-symbols-outlined text-[15px]">smartphone</span>
          Device Preview:
        </span>
        <button
          onClick={() => setViewMode('phone')}
          className={`px-3 py-0.5 rounded-full text-xs font-bold transition-all ${
            viewMode === 'phone'
              ? 'bg-primary text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          title="390px (Standard iPhone, Pixel)"
        >
          Mobile (390px)
        </button>
        <button
          onClick={() => setViewMode('phone-max')}
          className={`px-3 py-0.5 rounded-full text-xs font-bold transition-all ${
            viewMode === 'phone-max'
              ? 'bg-primary text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          title="430px (iPhone Pro Max, Galaxy S Ultra)"
        >
          Pro Max (430px)
        </button>
        <button
          onClick={() => setViewMode('fluid')}
          className={`px-3 py-0.5 rounded-full text-xs font-bold transition-all ${
            viewMode === 'fluid'
              ? 'bg-primary text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Responsive width"
        >
          Fluid Width
        </button>
      </div>

      {/* Main Mobile App Frame */}
      <div
        className={`w-full ${
          viewMode === 'phone'
            ? 'sm:max-w-[390px]'
            : viewMode === 'phone-max'
            ? 'sm:max-w-[430px]'
            : 'max-w-md'
        } h-full max-h-[100dvh] sm:h-[min(94dvh,880px)] sm:max-h-[96dvh] bg-surface flex flex-col relative sm:rounded-[36px] sm:border sm:border-slate-300/80 sm:shadow-2xl overflow-hidden transition-all duration-200`}
      >
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onOpenProfile={() => setIsProfileModalOpen(true)}
        />

        {/* Scrollable Content Viewport */}
        <div className="flex-1 overflow-y-auto overscroll-contain w-full min-h-0 flex flex-col">
          {currentTab === 'today' && (
            <TodayScreen
              tasks={todayTasks}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddTodayTask}
              onDeleteTask={handleDeleteTodayTask}
              onOpenFocusModal={() => setIsFocusModalOpen(true)}
            />
          )}

          {currentTab === 'lists' && (
            <ListsScreen
              groceryItems={groceryItems}
              onToggleGroceryItem={handleToggleGroceryCompleted}
              onOpenGroceryDetail={(category) =>
                setActiveDrawer(category === 'V' ? 'grocery-veg' : 'grocery-shopping')
              }
              chits={chits}
              onOpenChits={() => setActiveDrawer('chits')}
              emis={emis}
              onOpenEmis={() => setActiveDrawer('emis')}
              bills={bills}
              subBills={subBills}
              onOpenBills={() => setActiveDrawer('bills')}
              onQuickPayBills={handleQuickPayAllBills}
              investments={investments}
              onOpenInvestments={() => setActiveDrawer('investments')}
              healthItems={healthItems}
              onOpenHealth={() => setActiveDrawer('health')}
              business={business}
              onOpenBusiness={() => setActiveDrawer('business')}
              quickTasks={quickTasks}
              onOpenQuickTaskDetail={(category) => setQuickTaskModalCat(category)}
              onOpenCreateCategory={() =>
                setNewEntryModalConfig({ isOpen: true, initialType: 'category' })
              }
              onOpenNewEntry={(type) =>
                setNewEntryModalConfig({ isOpen: true, initialType: 'lifeos' })
              }
            />
          )}

          {currentTab === 'ask' && (
            <SortiScreen
              automations={automations}
              onAutoSort={handleAutoSort}
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />
          )}
        </div>

        {/* Persistent Toast Feedback Banner */}
        {toastMessage && (
          <div className="absolute bottom-20 inset-x-4 max-w-xs mx-auto z-50 pointer-events-none animate-bounce">
            <div className="p-3 bg-on-surface text-white rounded-2xl shadow-xl flex items-center justify-between text-xs font-semibold backdrop-blur-md bg-opacity-95">
              <span className="flex items-center gap-2 truncate">
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">
                  check_circle
                </span>
                <span>{toastMessage}</span>
              </span>
            </div>
          </div>
        )}

        {/* Fixed/Sticky Bottom Navigation */}
        <BottomNav
          currentTab={currentTab}
          onChangeTab={(tab) => setCurrentTab(tab)}
          uncompletedTasksCount={uncompletedTasksCount}
        />
      </div>

      {/* --- REPOSITORY LOGIC MODALS & DRAWERS --- */}

      {/* CHITS MANAGER DRAWER (Matches docs/js/life-chits.js & DEVNOTES.md) */}
      {activeDrawer === 'chits' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col border border-outline-variant/30 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-lg">
                  💰
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base text-on-surface">
                    Chits & Savings Manager
                  </h3>
                  <p className="text-[11px] text-on-surface-variant font-medium">
                    Auction cycles, lifting profit & universal calculator
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveDrawer(null)}
                className="w-8 h-8 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <ChitsManager
                chits={chits}
                onAddChit={handleAddChit}
                onUpdateChit={handleUpdateChit}
                onDeleteChit={handleDeleteChit}
              />
            </div>
          </div>
        </div>
      )}

      {/* EMIS MANAGER DRAWER (Matches docs/js/life-emis.js & life-modal-emis.js) */}
      {activeDrawer === 'emis' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col border border-outline-variant/30 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 flex items-center justify-center text-lg">
                  🏡
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base text-on-surface">
                    Loans & EMIs Tracker
                  </h3>
                  <p className="text-[11px] text-on-surface-variant font-medium">
                    Amortization, part-payments, and months saved
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveDrawer(null)}
                className="w-8 h-8 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <EmisManager
                emis={emis}
                onAddEmi={handleAddEmi}
                onUpdateEmi={handleUpdateEmi}
                onDeleteEmi={handleDeleteEmi}
                onAddPartPayment={handleAddPartPayment}
                onDeletePartPayment={handleDeletePartPayment}
              />
            </div>
          </div>
        </div>
      )}

      {/* BILLS & CONNECTIONS DRAWER (Matches docs/js/life-bills.js) */}
      {activeDrawer === 'bills' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col border border-outline-variant/30 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center text-lg">
                  ⚡
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base text-on-surface">
                    Utility Bills & Multi-Meter Connections
                  </h3>
                  <p className="text-[11px] text-on-surface-variant font-medium">
                    TGSPDCL, HMWS&SB, LPG, copy USC and portal links
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveDrawer(null)}
                className="w-8 h-8 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <BillsManager
                bills={bills}
                subBills={subBills}
                onToggleBill={handleToggleBill}
                onToggleSubBill={handleToggleSubBill}
                onAddSubBill={handleAddSubBill}
                onDeleteSubBill={handleDeleteSubBill}
              />
            </div>
          </div>
        </div>
      )}

      {/* GROCERIES MANAGER DRAWER (Matches docs/js/grocery.js Category C & V) */}
      {(activeDrawer === 'grocery-shopping' || activeDrawer === 'grocery-veg') && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[92vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-300/40 flex items-center justify-center text-lg">
                  {activeDrawer === 'grocery-veg' ? '🥬' : '🛒'}
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base text-slate-900">
                    {activeDrawer === 'grocery-veg' ? 'Weekly Vegetables' : 'Shopping & Staples'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {activeDrawer === 'grocery-veg'
                      ? 'Friday/Saturday mandi checklist & spend tracker'
                      : 'Active Buy now list, master catalog & purchase history'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveDrawer(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <GroceryManager
                items={groceryItems}
                onToggleCompleted={handleToggleGroceryCompleted}
                onToggleNeeded={handleToggleGroceryNeeded}
                onAddItem={handleAddGroceryItem}
                onUpdateItem={handleUpdateGroceryItem}
                onDeleteItem={handleDeleteGroceryItem}
                initialCategory={activeDrawer === 'grocery-veg' ? 'V' : 'C'}
              />
            </div>
          </div>
        </div>
      )}

      {/* INVESTMENTS MANAGER DRAWER (Matches docs/js/life.js & data.js) */}
      {activeDrawer === 'investments' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col border border-outline-variant/30 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-lg">
                  📈
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base text-on-surface">
                    Investments & Wealth
                  </h3>
                  <p className="text-[11px] text-on-surface-variant font-medium">
                    Mutual fund SIPs, PPF, gold and compounding
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveDrawer(null)}
                className="w-8 h-8 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <InvestmentsManager
                investments={investments}
                onTogglePaid={handleToggleInvestment}
                onAddInvestment={handleAddInvestment}
                onDeleteInvestment={handleDeleteInvestment}
              />
            </div>
          </div>
        </div>
      )}

      {/* HEALTH & MEDICAL DRAWER (Matches docs/js/life.js health section) */}
      {activeDrawer === 'health' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col border border-outline-variant/30 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-lg">
                  💊
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base text-on-surface">
                    Health & Appointments
                  </h3>
                  <p className="text-[11px] text-on-surface-variant font-medium">
                    Medicine restock reminders and doctor consults
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveDrawer(null)}
                className="w-8 h-8 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <HealthManager
                healthItems={healthItems}
                onAddHealthItem={handleAddHealthItem}
                onDeleteHealthItem={handleDeleteHealthItem}
              />
            </div>
          </div>
        </div>
      )}

      {/* BUSINESS & VENTURES DRAWER (Matches st.biz2 from docs/js/data.js) */}
      {activeDrawer === 'business' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col border border-outline-variant/30 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center text-lg">
                  🚀
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base text-on-surface">
                    Business Tracks & Projects
                  </h3>
                  <p className="text-[11px] text-on-surface-variant font-medium">
                    Active venture execution and idea incubation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveDrawer(null)}
                className="w-8 h-8 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <BusinessManager
                business={business}
                onActivateIdea={handleActivateIdea}
                onAddIdea={handleAddIdea}
                onDeleteIdea={handleDeleteIdea}
                onToggleTask={handleToggleBizTask}
                onAddTask={handleAddBizTask}
                onDeleteTask={handleDeleteBizTask}
              />
            </div>
          </div>
        </div>
      )}

      {/* Focus Timer Modal */}
      <FocusModal
        isOpen={isFocusModalOpen}
        onClose={() => setIsFocusModalOpen(false)}
      />

      {/* Quick Task Category Detail Modal */}
      {quickTaskModalCat && (
        <ItemDetailsModal
          type="quicktask"
          quickTaskCategory={quickTaskModalCat}
          groceryItems={[]}
          onToggleGroceryItem={() => {}}
          onAddGroceryItem={() => {}}
          onToggleQuickTask={handleToggleQuickTask}
          onAddQuickTask={handleAddQuickTask}
          onClose={() => setQuickTaskModalCat(null)}
        />
      )}

      {/* New Entry Modal */}
      <NewEntryModal
        isOpen={newEntryModalConfig.isOpen}
        initialType={newEntryModalConfig.initialType}
        quickTaskCategories={quickTasks}
        onAddGrocery={(name, store, cat) =>
          handleAddGroceryItem(name, cat === 'pantry' ? 'Staples / food' : 'Vegetables', store, true)
        }
        onAddLifeOSEntry={(title, _sub, amount) => {
          handleAddChit({
            name: title,
            monthlyAmt: parseFloat(amount) || 10000,
            pot: (parseFloat(amount) || 10000) * 25,
            totalMonths: 25,
            startDate: new Date().toISOString().slice(0, 10),
            dueDay: 5,
            status: 'paying',
            lifted: false,
          });
        }}
        onAddQuickTask={handleAddQuickTask}
        onAddCategory={handleAddCategory}
        onClose={() => setNewEntryModalConfig({ isOpen: false })}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onResetData={handleResetData}
      />
    </div>
  );
}
