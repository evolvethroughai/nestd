import React, { useRef, useState } from 'react';
import { PencilIcon } from './PencilIcon';
import { GroceryItem, GroceryPurchase, ProduceCategory, ProduceSchedule, ProduceSchedules, Weekday } from '../types';

const DEDICATED_PRODUCE_GROUPS = new Set(['fruit', 'fruits', 'vegetable', 'vegetables', 'veggie', 'veggies']);
const isDedicatedProduceCategory = (category: string) => DEDICATED_PRODUCE_GROUPS.has(category.trim().toLocaleLowerCase());

interface GroceryManagerProps {
  items: GroceryItem[];
  purchases: GroceryPurchase[];
  produceSchedules: ProduceSchedules;
  onUpdateProduceSchedule: (category: ProduceCategory, updates: Partial<ProduceSchedule>) => void;
  stores: string[];
  onAddStore: (store: string) => void;
  customCategories: string[];
  onAddCategory: (category: string) => void;
  onToggleCompleted: (id: string, price?: string) => void;
  onToggleNeeded: (id: string) => void;
  onAddItem: (
    name: string,
    group: GroceryItem['group'],
    store: string,
    needed: boolean,
    qty?: string,
    price?: string,
    isInMaster?: boolean
  ) => void;
  onUpdateItem: (id: string, updates: Partial<GroceryItem>) => void;
  onDeleteItem: (id: string) => void;
  initialCategory?: 'C' | 'V' | 'F'; // Shopping & Staples, Vegetables, Fruits
}

export const GroceryManager: React.FC<GroceryManagerProps> = ({
  items,
  purchases,
  produceSchedules,
  onUpdateProduceSchedule,
  stores,
  onAddStore,
  customCategories,
  onAddCategory,
  onToggleCompleted,
  onToggleNeeded,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  initialCategory = 'C',
}) => {
  const [activeCategory, setActiveCategory] = useState<'C' | 'V' | 'F'>(initialCategory);
  const [isBuyNowOpen, setIsBuyNowOpen] = useState(false);
  const [isMasterListOpen, setIsMasterListOpen] = useState(false);
  const [isPurchaseHistoryOpen, setIsPurchaseHistoryOpen] = useState(false);
  const [isVegListOpen, setIsVegListOpen] = useState(false);
  const [isVegHistoryOpen, setIsVegHistoryOpen] = useState(false);
  const [isFruitListOpen, setIsFruitListOpen] = useState(false);
  const [isFruitHistoryOpen, setIsFruitHistoryOpen] = useState(false);
  const [confirmingPurchaseItems, setConfirmingPurchaseItems] = useState<Set<string>>(() => new Set());
  const [leavingPurchaseItems, setLeavingPurchaseItems] = useState<Set<string>>(() => new Set());
  const purchaseCompletionTimers = useRef<Map<string, number>>(new Map());
  const [isVegScheduleOpen, setIsVegScheduleOpen] = useState(false);
  const [isFruitScheduleOpen, setIsFruitScheduleOpen] = useState(false);
  const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weekdayChoices = weekdayNames.map((label, day) => ({ label, day: day as Weekday }));
  const vegetableSchedule = produceSchedules.vegetables;
  const fruitSchedule = produceSchedules.fruits;

  // Form states for adding new master grocery item
  const [newItemName, setNewItemName] = useState('');
  const [newItemGroup, setNewItemGroup] = useState<GroceryItem['group']>('Staples / food');
  const [newItemStore, setNewItemStore] = useState('DMart');
  const [addingMasterCategory, setAddingMasterCategory] = useState(false);
  const [masterCategoryDraft, setMasterCategoryDraft] = useState('');
  const [addingMasterStore, setAddingMasterStore] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickQty, setQuickQty] = useState('');
  const [quickAlsoMaster, setQuickAlsoMaster] = useState(false);
  const [quickMasterGroup, setQuickMasterGroup] = useState<GroceryItem['group']>('Staples / food');
  const [quickAddCategoryMode, setQuickAddCategoryMode] = useState(false);
  const [quickCategoryDraft, setQuickCategoryDraft] = useState('');
  const [quickStore, setQuickStore] = useState('DMart');
  const [quickAddStoreMode, setQuickAddStoreMode] = useState(false);
  const [quickStoreDraft, setQuickStoreDraft] = useState('');
  const [addingPurchaseStoreForItemId, setAddingPurchaseStoreForItemId] = useState<string | null>(null);
  const [purchaseStoreDraft, setPurchaseStoreDraft] = useState('');
  const [storeDraft, setStoreDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editStore, setEditStore] = useState('');
  const [editGroup, setEditGroup] = useState<GroceryItem['group']>('Staples / food');

  // Form state for adding vegetable
  const [newVegName, setNewVegName] = useState('');
  const [newFruitName, setNewFruitName] = useState('');

  // Accordion collapsed states for Master Grocery List
  const [openMasterAccordions, setOpenMasterAccordions] = useState<Record<string, boolean>>({
    'Staples / food': false,
    'Household / personal': false,
    'Pooja': false,
    'Nuts, seeds and snacks': false,
  });

  const toggleAccordion = (grp: string) => {
    setOpenMasterAccordions((prev) => ({
      ...prev,
      [grp]: !prev[grp],
    }));
  };

  const markItemPurchased = (id: string, price?: string) => {
    if (purchaseCompletionTimers.current.has(id)) return;
    setConfirmingPurchaseItems((previous) => new Set(previous).add(id));
    const confirmationTimer = window.setTimeout(() => {
      setLeavingPurchaseItems((previous) => new Set(previous).add(id));
      const leavingTimer = window.setTimeout(() => {
        onToggleCompleted(id, price);
        setConfirmingPurchaseItems((previous) => {
          const next = new Set(previous);
          next.delete(id);
          return next;
        });
        setLeavingPurchaseItems((previous) => {
          const next = new Set(previous);
          next.delete(id);
          return next;
        });
        purchaseCompletionTimers.current.delete(id);
      }, 160);
      purchaseCompletionTimers.current.set(id, leavingTimer);
    }, 340);
    purchaseCompletionTimers.current.set(id, confirmationTimer);
  };

  // --- Category C Items ---
  const nonVegItems = items.filter((i) => !isDedicatedProduceCategory(i.group));
  const masterItems = nonVegItems.filter((i) => i.isInMaster !== false && !isDedicatedProduceCategory(i.group));
  const buyNowList = nonVegItems.filter((i) => i.needed && !i.completed);
  const monthlyPurchases = purchases
    .reduce((months, purchase) => {
      const date = new Date(purchase.purchasedAt);
      const monthKey = Number.isNaN(date.getTime()) ? 'unknown' : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      (months[monthKey] ||= []).push(purchase);
      return months;
    }, {} as Record<string, GroceryPurchase[]>);
  const monthKeys = Object.keys(monthlyPurchases).sort((a, b) => b.localeCompare(a));

  // --- Category V Items ---
  const vegItems = items.filter((i) => i.group === 'Vegetables');
  const pendingVeg = vegItems.filter((i) => !i.completed);
  const twoMonthStart = new Date();
  twoMonthStart.setDate(1);
  twoMonthStart.setHours(0, 0, 0, 0);
  twoMonthStart.setMonth(twoMonthStart.getMonth() - 1);
  const vegPurchaseHistory = purchases.filter((purchase) => purchase.group === 'Vegetables' && purchase.purchasedAt >= twoMonthStart.getTime());
  const vegPurchasesByDate = vegPurchaseHistory.reduce((dates, purchase) => {
    const date = new Date(purchase.purchasedAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    (dates[key] ||= []).push(purchase);
    return dates;
  }, {} as Record<string, GroceryPurchase[]>);
  const vegHistoryDateKeys = Object.keys(vegPurchasesByDate).sort((a, b) => b.localeCompare(a));

  const fruitItems = items.filter((item) => item.group === 'Fruit');
  const pendingFruit = fruitItems.filter((item) => !item.completed);
  const fruitPurchaseHistory = purchases.filter((purchase) => purchase.group === 'Fruit' && purchase.purchasedAt >= twoMonthStart.getTime());
  const fruitPurchasesByDate = fruitPurchaseHistory.reduce((dates, purchase) => {
    const date = new Date(purchase.purchasedAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    (dates[key] ||= []).push(purchase);
    return dates;
  }, {} as Record<string, GroceryPurchase[]>);
  const fruitHistoryDateKeys = Object.keys(fruitPurchasesByDate).sort((a, b) => b.localeCompare(a));

  const coreMasterGroups: GroceryItem['group'][] = [
    'Staples / food',
    'Household / personal',
    'Pooja',
    'Nuts, seeds and snacks',
    ...customCategories.filter((category) => !isDedicatedProduceCategory(category) && !['Staples / food', 'Household / personal', 'Pooja', 'Nuts, seeds and snacks'].some((builtIn) => builtIn.toLowerCase() === category.toLowerCase())),
  ];

  const handleAddMasterItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || isDedicatedProduceCategory(newItemGroup)) return;
    onAddItem(newItemName.trim(), newItemGroup, newItemStore, false, '', '', true);
    setNewItemName('');
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim() || quickAddStoreMode || quickAddCategoryMode || (quickAlsoMaster && isDedicatedProduceCategory(quickMasterGroup))) return;
    const name = quickName.trim();
    const existingMaster = quickAlsoMaster
      ? masterItems.find((item) => item.name.trim().toLocaleLowerCase() === name.toLocaleLowerCase())
      : undefined;
    if (existingMaster) {
      onUpdateItem(existingMaster.id, {
        needed: true,
        completed: false,
        quantity: quickQty.trim(),
        price: '',
        buyNowStore: quickStore,
        boughtDate: undefined,
        boughtTimestamp: undefined,
      });
    } else {
      onAddItem(name, quickMasterGroup, quickStore, true, quickQty.trim(), '', quickAlsoMaster);
    }
    setQuickName('');
    setQuickQty('');
    setQuickAlsoMaster(false);
  };

  const handleQuickAddCategory = () => {
    const category = quickCategoryDraft.trim();
    if (!category || isDedicatedProduceCategory(category)) return;
    const existing = coreMasterGroups.find((group) => group.toLowerCase() === category.toLowerCase());
    const selectedCategory = existing || category;
    if (!existing) onAddCategory(category);
    setQuickMasterGroup(selectedCategory);
    setQuickCategoryDraft('');
    setQuickAddCategoryMode(false);
  };

  const handleQuickAddStore = () => {
    const store = quickStoreDraft.trim();
    if (!store) return;
    onAddStore(store);
    setQuickStore(store);
    setQuickStoreDraft('');
    setQuickAddStoreMode(false);
  };

  const handleAddPurchaseStore = (itemId: string) => {
    const store = purchaseStoreDraft.trim();
    if (!store) return;
    onAddStore(store);
    onUpdateItem(itemId, { buyNowStore: store });
    setPurchaseStoreDraft('');
    setAddingPurchaseStoreForItemId(null);
  };

  const handleSaveMasterStore = () => {
    const store = storeDraft.trim();
    if (!store) return;
    onAddStore(store);
    setNewItemStore(store);
    setQuickStore(store);
    setStoreDraft('');
    setAddingMasterStore(false);
  };

  const handleSaveMasterCategory = () => {
    const category = masterCategoryDraft.trim();
    if (!category || isDedicatedProduceCategory(category)) return;
    const existingCategory = coreMasterGroups.find((group) => group.toLowerCase() === category.toLowerCase());
    const selectedCategory = existingCategory || category;
    if (!existingCategory) onAddCategory(category);
    setNewItemGroup(selectedCategory);
    setQuickMasterGroup(selectedCategory);
    setMasterCategoryDraft('');
    setAddingMasterCategory(false);
  };

  const handleAddVegItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVegName.trim()) return;
    onAddItem(newVegName.trim(), 'Vegetables', 'Local Mandi', true, '500 g', '');
    setNewVegName('');
  };

  const handleAddFruitItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFruitName.trim()) return;
    onAddItem(newFruitName.trim(), 'Fruit', 'Local Mandi', true, '1 kg', '', false);
    setNewFruitName('');
  };

  return (
    <div className="flex flex-col w-full space-y-4 pb-8 animate-fadeIn text-slate-800">
      {/* Grocery tabs: shopping, weekly fruit, and weekly vegetables. */}
      <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveCategory('C')}
          className={`min-w-0 py-2 px-1 rounded-xl font-display font-extrabold text-[10px] sm:text-xs transition-all flex items-center justify-center gap-1 ${
            activeCategory === 'C'
              ? 'bg-white text-amber-900 shadow-xs border border-amber-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>🛒</span>
          <span className="leading-tight">Shop</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 font-bold">
            {buyNowList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveCategory('V')}
          className={`min-w-0 py-2 px-1 rounded-xl font-display font-extrabold text-[10px] sm:text-xs transition-all flex items-center justify-center gap-1 ${
            activeCategory === 'V'
              ? 'bg-white text-emerald-900 shadow-xs border border-emerald-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>🥬</span>
          <span>Vegetables</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-900 font-bold">
            {pendingVeg.length}
          </span>
        </button>
        <button
          onClick={() => setActiveCategory('F')}
          className={`min-w-0 py-2 px-1 rounded-xl font-display font-extrabold text-[10px] sm:text-xs transition-all flex items-center justify-center gap-1 ${
            activeCategory === 'F'
              ? 'bg-white text-rose-900 shadow-xs border border-rose-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="text-base leading-none" aria-hidden="true">🍍</span>
          <span className="leading-tight">Fruits</span>
          <span className="text-[9px] px-1 rounded-full bg-rose-100 text-rose-900 font-bold">
            {pendingFruit.length}
          </span>
        </button>
      </div>

      {/* =========================================================================
          CATEGORY C: GROCERY & SHOPPING (Staples, food, household, pooja, and custom master categories)
         ========================================================================= */}
      {activeCategory === 'C' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3.5 space-y-3">
            <button
              type="button"
              onClick={() => setIsBuyNowOpen((open) => !open)}
              aria-expanded={isBuyNowOpen}
              className="flex w-full items-center justify-between gap-3 text-left"
            >
              <span>
                <span className="block font-display font-extrabold text-xs text-amber-950 uppercase tracking-wide">Buy now · {buyNowList.length} items</span>
                <span className="mt-0.5 block text-[11px] text-amber-800">One-time needs and items you plan to shop for.</span>
              </span>
              <span className={`material-symbols-outlined flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-900 transition-transform duration-200 ${isBuyNowOpen ? 'rotate-180' : ''}`} aria-hidden="true">keyboard_arrow_down</span>
            </button>
            {isBuyNowOpen && <>
            <form onSubmit={handleQuickAdd} className="pb-3 border-b border-amber-200 space-y-2">
              <div className="grid grid-cols-[1fr_72px] gap-2">
                <input value={quickName} onChange={(e) => setQuickName(e.target.value)} placeholder="Add a one-time item" maxLength={80} className="min-w-0 bg-white px-3 py-2 rounded-xl text-xs border border-amber-200" required />
                <input value={quickQty} onChange={(e) => setQuickQty(e.target.value)} placeholder="Qty" maxLength={20} className="w-full bg-white px-2 py-2 rounded-xl text-xs border border-amber-200" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-amber-900/70">Default store for new items</span>
                <div className="flex gap-2">
                  <select aria-label="Default store for new items" value={quickAddStoreMode ? '__add_new_store__' : quickStore} onChange={(e) => {
                    if (e.target.value === '__add_new_store__') setQuickAddStoreMode(true);
                    else { setQuickStore(e.target.value); setQuickAddStoreMode(false); }
                  }} className="flex-1 bg-white px-2 py-2 rounded-xl border border-amber-200 text-xs">
                    {stores.map((store) => <option key={store} value={store}>{store}</option>)}
                    <option value="__add_new_store__">+ Add new store…</option>
                  </select>
                  <button disabled={quickAddStoreMode} className="px-4 py-2 rounded-xl bg-amber-700 text-white font-bold text-xs hover:bg-amber-800 disabled:opacity-50">Add to Buy now</button>
                </div>
              </div>
              <label className="flex items-start gap-2 text-[11px] text-amber-950 cursor-pointer">
                <input type="checkbox" checked={quickAlsoMaster} onChange={(e) => { setQuickAlsoMaster(e.target.checked); if (!e.target.checked) { setQuickAddCategoryMode(false); setQuickCategoryDraft(''); } }} className="mt-0.5 accent-amber-700" />
                <span><b>Also save to Master list</b><span className="block text-[10px] text-amber-800">Keep it for future shopping trips.</span></span>
              </label>
              {quickAlsoMaster && <>
                <select value={quickAddCategoryMode ? '__add_new_category__' : quickMasterGroup} onChange={(e) => {
                  if (e.target.value === '__add_new_category__') setQuickAddCategoryMode(true);
                  else { setQuickMasterGroup(e.target.value); setQuickAddCategoryMode(false); }
                }} aria-label="Master list category" className="w-full bg-white px-2 py-2 rounded-xl border border-amber-200 text-xs">
                  {coreMasterGroups.map((group) => <option key={group} value={group}>{group}</option>)}
                  <option value="__add_new_category__">+ Add new category…</option>
                </select>
                {quickAddCategoryMode && <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <input autoFocus value={quickCategoryDraft} onChange={(e) => setQuickCategoryDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleQuickAddCategory(); } }} placeholder="New category name" maxLength={40} className="flex-1 min-w-0 bg-white px-3 py-2 rounded-xl text-xs border border-amber-200" />
                    <button type="button" onClick={handleQuickAddCategory} disabled={!quickCategoryDraft.trim() || isDedicatedProduceCategory(quickCategoryDraft)} className="px-3 py-2 rounded-xl bg-amber-700 text-white text-xs font-bold disabled:opacity-50">Save category</button>
                    <button type="button" onClick={() => { setQuickAddCategoryMode(false); setQuickCategoryDraft(''); }} className="px-2 py-2 rounded-xl text-amber-900 text-xs">Cancel</button>
                  </div>
                  <p className="text-[10px] text-amber-800">Fruits and vegetables have their own weekly lists.</p>
                </div>}
              </>}
              {quickAddStoreMode && <div className="flex gap-2">
                <input autoFocus value={quickStoreDraft} onChange={(e) => setQuickStoreDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleQuickAddStore(); } }} placeholder="New store name" maxLength={40} className="flex-1 min-w-0 bg-white px-3 py-2 rounded-xl text-xs border border-amber-200" />
                <button type="button" onClick={handleQuickAddStore} disabled={!quickStoreDraft.trim()} className="px-3 py-2 rounded-xl bg-amber-700 text-white text-xs font-bold disabled:opacity-50">Save store</button>
                <button type="button" onClick={() => { setQuickAddStoreMode(false); setQuickStoreDraft(''); }} className="px-2 py-2 rounded-xl text-amber-900 text-xs">Cancel</button>
              </div>}
              <p className="text-[10px] text-amber-800">{quickAlsoMaster ? 'This item will be kept in your Master list for future trips.' : 'Optional: keep this item in your Master list for next time.'}</p>
            </form>
            {buyNowList.length ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1 px-2 py-1 text-[10px] font-extrabold text-amber-900/60 uppercase tracking-wider">
                  <span>Items to buy</span>
                </div>
                {buyNowList.map((item) => (
                  <div key={item.id} className={`grid grid-cols-[24px_minmax(0,1fr)_22px] gap-x-2 gap-y-1 p-2.5 rounded-xl border transition-all duration-150 ${leavingPurchaseItems.has(item.id) ? 'opacity-0 -translate-y-2 scale-[0.98]' : ''} ${confirmingPurchaseItems.has(item.id) ? 'bg-emerald-50 border-emerald-300 shadow-sm shadow-emerald-100' : 'bg-white border-amber-200'}`}>
                    <button onClick={() => markItemPurchased(item.id, item.price)} disabled={confirmingPurchaseItems.has(item.id)} aria-label={confirmingPurchaseItems.has(item.id) ? `${item.name} marked done` : `Mark ${item.name} bought`} className={`row-span-2 self-center w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-150 sm:row-span-1 ${confirmingPurchaseItems.has(item.id) ? 'border-emerald-600 bg-emerald-500 text-white scale-105 shadow-sm shadow-emerald-300' : 'border-amber-300 bg-white text-emerald-700 hover:border-emerald-500 hover:bg-emerald-50'}`} title={confirmingPurchaseItems.has(item.id) ? 'Done — saving to purchase history' : 'Mark as bought'}>
                      <span className="material-symbols-outlined text-[15px]">check</span>
                    </button>
                    <div className="col-start-2 row-start-1 min-w-0 ">
                      <div className="flex min-w-0 items-start gap-1 font-semibold text-[14px] text-slate-900 whitespace-normal break-words leading-snug"><span className="min-w-0">{item.name}</span>{confirmingPurchaseItems.has(item.id) && <span className="shrink-0 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold leading-none text-emerald-800">Done!</span>}</div>
                      <div className="relative mt-0.5 inline-flex max-w-full items-center gap-1 rounded-md bg-teal-50/80 px-1.5 py-0.5 text-teal-700">
                        <span className="material-symbols-outlined text-[13px] leading-none" aria-hidden="true">storefront</span>
                        
                        <select value={addingPurchaseStoreForItemId === item.id ? '__add_new_store__' : item.buyNowStore || item.store || ''} onChange={(e) => {
                          if (e.target.value === '__add_new_store__') setAddingPurchaseStoreForItemId(item.id);
                          else onUpdateItem(item.id, { buyNowStore: e.target.value });
                        }} aria-label={`Bought at store for ${item.name}`} className="min-w-0 max-w-[140px] appearance-none bg-transparent pr-3 text-[11px] font-medium focus:outline-none">
                          {!item.buyNowStore && !item.store && <option value="">Choose store</option>}
                          {item.store && !stores.includes(item.store) && <option value={item.store}>{item.store}</option>}
                          {stores.map((store) => <option key={store} value={store}>{store}</option>)}
                          <option value="__add_new_store__">+ Add new store…</option>
                        </select>
                        <span className="pointer-events-none absolute right-1 text-[12px] material-symbols-outlined" aria-hidden="true">expand_more</span>
                      </div>
                      {addingPurchaseStoreForItemId === item.id && <div className="mt-1 flex gap-1">
                        <input autoFocus value={purchaseStoreDraft} onChange={(e) => setPurchaseStoreDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddPurchaseStore(item.id); } }} placeholder="New store name" maxLength={40} className="min-w-0 flex-1 bg-white px-2 py-1 rounded-lg text-[10px] border border-amber-200" />
                        <button type="button" onClick={() => handleAddPurchaseStore(item.id)} disabled={!purchaseStoreDraft.trim()} className="px-2 py-1 rounded-lg bg-amber-700 text-white text-[10px] font-bold disabled:opacity-50">Save</button>
                        <button type="button" onClick={() => { setAddingPurchaseStoreForItemId(null); setPurchaseStoreDraft(''); }} className="px-1 py-1 text-[10px] text-slate-500">×</button>
                      </div>}
                    </div>
                    <div className="col-span-2 col-start-2 row-start-2 mt-0.5 grid grid-cols-2 gap-2"><label className="min-w-0"><span className="mb-1 block text-[10px] font-medium text-slate-500">Quantity</span>
                      <input value={item.quantity || ''} onChange={(e) => onUpdateItem(item.id, { quantity: e.target.value })} placeholder="qty" maxLength={20} className="h-9 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-[14px] font-semibold text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100" aria-label={`Quantity for ${item.name}`} /></label><label className="min-w-0"><span className="mb-1 block text-[10px] font-medium text-slate-500">Price (₹)</span>
                      <input value={item.price || ''} onChange={(e) => onUpdateItem(item.id, { price: e.target.value })} placeholder="₹" maxLength={8} className="h-9 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-[14px] font-semibold text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100" aria-label={`Price for ${item.name}`} /></label>
                    </div>
                    <button onClick={() => item.isInMaster === false ? onDeleteItem(item.id) : onToggleNeeded(item.id)} className="col-start-3 row-start-1 w-[22px] h-7 rounded-lg text-amber-700 hover:bg-rose-50 hover:text-rose-600 " title={item.isInMaster === false ? 'Remove one-time item' : 'Remove from Buy now'}>×</button>
                  </div>
                ))}
              </div>
            ) : <p className="p-3 rounded-xl bg-white/70 text-center text-xs text-amber-900">Your Buy now list is empty. Add a one-time item above or choose one from Master list.</p>}
            </>}
          </div>

          <div className="rounded-2xl border border-violet-200 bg-violet-50/70 p-3.5 space-y-3">
            <button
              type="button"
              onClick={() => setIsMasterListOpen((open) => !open)}
              aria-expanded={isMasterListOpen}
              className="flex w-full items-center justify-between gap-3 pb-1 text-left"
            >
              <span>
                <span className="block font-display font-extrabold text-xs text-violet-950 uppercase tracking-wide">Master list · {masterItems.length} items</span>
                <span className="mt-0.5 block text-[10px] text-violet-800">Reusable items with a usual store.</span>
              </span>
              <span className={`material-symbols-outlined flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-900 transition-transform duration-200 ${isMasterListOpen ? 'rotate-180' : ''}`} aria-hidden="true">keyboard_arrow_down</span>
            </button>
            {isMasterListOpen && <>
            <div className="space-y-2">
              {coreMasterGroups.map((grp) => {
                const grpItems = masterItems.filter((item) => item.group === grp);
                const inBuyNowCount = grpItems.filter((item) => item.needed && !item.completed).length;
                const isOpen = !!openMasterAccordions[grp];
                return (
                  <div key={grp} className="rounded-xl border border-violet-200 overflow-hidden bg-white/75">
                    <button type="button" onClick={() => toggleAccordion(grp)} className="w-full p-2.5 flex items-center justify-between text-left hover:bg-violet-100/70">
                      <span className="flex items-center gap-2 font-bold text-xs text-slate-800">{grp}<span className="px-1.5 rounded-full bg-slate-200 text-slate-700 text-[10px]">{grpItems.length}</span>{inBuyNowCount > 0 && <span className="px-1.5 rounded-full bg-amber-100 text-amber-900 text-[10px]">{inBuyNowCount} in Buy now</span>}</span>
                      <span className={`material-symbols-outlined text-[18px] text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true">keyboard_arrow_down</span>
                    </button>
                    {isOpen && <div className="p-2 divide-y divide-slate-100 bg-white">
                      {grpItems.map((item) => <React.Fragment key={item.id}>
                        <div className="my-1 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl border border-slate-100 bg-white px-2.5 py-3 transition-colors hover:bg-slate-50">
                          <div className="min-w-0">
                            <span className="block break-words text-[14px] font-semibold leading-snug text-slate-800">{item.name}</span>
                            <span className="mt-1 flex items-center gap-1 text-[11px] font-medium text-teal-700">
                              <span className="material-symbols-outlined text-[14px] leading-none text-teal-500" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20" }} aria-hidden="true">storefront</span>
                              {item.store || 'Usual store not set'}
                            </span>
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            <button type="button" onClick={() => { setEditingId(item.id); setEditName(item.name); setEditStore(item.store || ''); setEditGroup(item.group); }} aria-label={`Edit ${item.name}`} title="Edit item" className="flex h-8 w-7 items-center justify-center rounded-lg bg-amber-50/60 transition hover:bg-amber-100 active:scale-95">
                              <PencilIcon />
                            </button>
                            <button type="button" onClick={() => onToggleNeeded(item.id)} aria-label={item.needed && !item.completed ? `Remove ${item.name} from Buy now` : `Add ${item.name} to Buy now`} title={item.needed && !item.completed ? 'Remove from Buy now' : 'Add to Buy now'} className={`flex h-8 items-center justify-center gap-1 rounded-lg px-2 text-[11px] font-semibold transition active:scale-95 ${item.needed && !item.completed ? 'bg-amber-100 text-amber-900 hover:bg-amber-200' : 'bg-amber-100/80 text-amber-900 hover:bg-amber-200'}`}>
                              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 450, 'GRAD' 0, 'opsz' 20" }} aria-hidden="true">{item.needed && !item.completed ? 'check' : 'add'}</span>
                              <span>{item.needed && !item.completed ? 'Added' : 'Add'}</span>
                            </button>
                            <button type="button" onClick={() => onDeleteItem(item.id)} aria-label={`Delete ${item.name}`} title="Delete from Master list" className="flex h-8 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-400 transition hover:bg-rose-100 hover:text-rose-600 active:scale-95">
                              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20" }} aria-hidden="true">delete</span>
                            </button>
                          </div>
                        </div>
                        {editingId === item.id && <form onSubmit={(e) => { e.preventDefault(); onUpdateItem(item.id, { name: editName.trim(), store: editStore, group: editGroup }); setEditingId(null); }} className="mb-2 p-2 rounded-xl bg-slate-50 flex flex-wrap gap-2">
                          <input value={editName} onChange={(e) => setEditName(e.target.value)} aria-label="Item name" className="min-w-0 flex-1 px-2 py-1 rounded-lg text-xs border border-slate-200" required />
                          <select value={editGroup} onChange={(e) => setEditGroup(e.target.value as GroceryItem['group'])} aria-label="Category" className="max-w-32 px-1 py-1 rounded-lg text-xs border border-slate-200">{coreMasterGroups.map((group) => <option key={group} value={group}>{group}</option>)}</select>
                          <select value={editStore} onChange={(e) => setEditStore(e.target.value)} aria-label="Usual store" className="max-w-32 px-1 py-1 rounded-lg text-xs border border-slate-200"><option value="">No store</option>{stores.map((store) => <option key={store} value={store}>{store}</option>)}</select>
                          <button className="text-xs font-bold text-indigo-700">Save</button><button type="button" onClick={() => setEditingId(null)} className="text-xs text-slate-500">Cancel</button>
                        </form>}
                      </React.Fragment>)}
                    </div>}
                  </div>
                );
              })}
            </div>
            <form onSubmit={handleAddMasterItem} className="pt-3 border-t border-violet-200 space-y-2.5">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-violet-900">+ Add to master list</div>
              <input value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Item name (e.g. Minapappu, Ghee, Floor cleaner)…" maxLength={80} className="w-full bg-white px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 border border-violet-200" required />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={addingMasterCategory ? '__add_new_category__' : newItemGroup}
                  onChange={(e) => {
                    if (e.target.value === '__add_new_category__') setAddingMasterCategory(true);
                    else { setNewItemGroup(e.target.value as GroceryItem['group']); setAddingMasterCategory(false); }
                  }}
                  aria-label="Master list category"
                  className="bg-white px-2 py-2 rounded-xl border border-violet-200 text-xs font-semibold text-slate-700"
                >
                  {coreMasterGroups.map((group) => <option key={group} value={group}>{group}</option>)}
                  <option value="__add_new_category__">+ Add new category…</option>
                </select>
                <select
                  value={addingMasterStore ? '__add_new_store__' : newItemStore}
                  onChange={(e) => {
                    if (e.target.value === '__add_new_store__') setAddingMasterStore(true);
                    else { setNewItemStore(e.target.value); setAddingMasterStore(false); }
                  }}
                  aria-label="Usual store"
                  className="bg-white px-2 py-2 rounded-xl border border-violet-200 text-xs font-semibold text-slate-700"
                >
                  {stores.map((store) => <option key={store} value={store}>📍 {store}</option>)}
                  <option value="__add_new_store__">+ Add new store…</option>
                </select>
              </div>
              {addingMasterCategory && <div className="space-y-1.5">
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={masterCategoryDraft}
                    onChange={(e) => setMasterCategoryDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSaveMasterCategory(); } }}
                    placeholder="New category name"
                    maxLength={40}
                    className="min-w-0 flex-1 rounded-xl border border-violet-200 bg-white px-3 py-2 text-xs"
                  />
                  <button type="button" onClick={handleSaveMasterCategory} disabled={!masterCategoryDraft.trim() || isDedicatedProduceCategory(masterCategoryDraft)} className="rounded-xl bg-violet-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Save</button>
                  <button type="button" onClick={() => { setAddingMasterCategory(false); setMasterCategoryDraft(''); }} className="rounded-xl px-2 py-2 text-xs text-slate-500">Cancel</button>
                </div>
                <p className="text-[10px] text-violet-700">Fruits and vegetables have their own weekly lists.</p>
              </div>}
              {addingMasterStore && <div className="flex gap-2">
                <input
                  autoFocus
                  value={storeDraft}
                  onChange={(e) => setStoreDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSaveMasterStore(); } }}
                  placeholder="New store name"
                  maxLength={40}
                  className="min-w-0 flex-1 rounded-xl border border-violet-200 bg-white px-3 py-2 text-xs"
                />
                <button type="button" onClick={handleSaveMasterStore} disabled={!storeDraft.trim()} className="rounded-xl bg-violet-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Save</button>
                <button type="button" onClick={() => { setAddingMasterStore(false); setStoreDraft(''); }} className="rounded-xl px-2 py-2 text-xs text-slate-500">Cancel</button>
              </div>}
              <div className="flex items-center justify-between pt-1"><span className="text-[10px] text-violet-900/70">Name, category and usual store only</span><button className="px-4 py-1.5 rounded-xl bg-violet-700 text-white font-extrabold text-xs hover:bg-violet-800">+ Add</button></div>
            </form>
            </>}
          </div>
          {/* Purchase history: each checkout remains recorded across repeat buys. */}
          <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-3.5 space-y-3">
            <button
              type="button"
              onClick={() => setIsPurchaseHistoryOpen((open) => !open)}
              aria-expanded={isPurchaseHistoryOpen}
              className="flex w-full items-center justify-between gap-3 pb-1 text-left"
            >
              <span>
                <span className="block font-display font-extrabold text-xs text-sky-950 uppercase tracking-wide">Purchase history · {purchases.length}</span>
                <span className="mt-0.5 block text-[10px] text-sky-800">Past purchases and monthly spending.</span>
              </span>
              <span className={`material-symbols-outlined flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-900 transition-transform duration-200 ${isPurchaseHistoryOpen ? 'rotate-180' : ''}`} aria-hidden="true">keyboard_arrow_down</span>
            </button>

            {isPurchaseHistoryOpen && <>
            {monthKeys.length > 0 ? (
              <div className="space-y-3">
                {monthKeys.map((monthKey) => {
                  const monthItems = monthlyPurchases[monthKey].sort((a, b) => b.purchasedAt - a.purchasedAt);
                  const total = monthItems.reduce((sum, purchase) => sum + (purchase.amount || 0), 0);
                  const monthLabel = monthKey === 'unknown' ? 'Earlier purchases' : new Date(`${monthKey}-01T12:00:00`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

                  return (
                    <div key={monthKey} className="space-y-1.5">
                      <div className="text-[11px] font-extrabold text-sky-800 uppercase tracking-wider flex items-center justify-between px-1">
                        <span>{monthLabel} · {monthItems.length} {monthItems.length === 1 ? 'purchase' : 'purchases'}</span>
                        <span className="text-sky-900 font-bold">₹{total.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="space-y-1">
                        {monthItems.map((purchase) => {
                          const currentItem = items.find((item) => item.id === purchase.itemId);
                          const alreadyQueued = currentItem?.needed && !currentItem.completed;
                          return (
                          <div
                            key={purchase.id}
                            className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 rounded-xl border border-sky-100 bg-white px-3 py-2.5"
                          >
                            <div className="flex-1 min-w-0">
                              <span className="font-semibold text-xs text-slate-700 block break-words">
                                {purchase.name}
                              </span>
                              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] leading-relaxed text-slate-500">
                                {purchase.quantity && <span className="whitespace-nowrap font-medium">{purchase.quantity}</span>}
                                <span className="whitespace-nowrap">{new Date(purchase.purchasedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                              </div>
                              {purchase.store && <span className="mt-1 block break-words text-[11px] text-slate-500">{purchase.store}</span>}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                            <span className="whitespace-nowrap text-sm font-bold text-slate-900">{purchase.price ? `₹${purchase.price}` : '—'}</span>
                            {currentItem && <button
                              onClick={() => !alreadyQueued && onToggleNeeded(currentItem.id)}
                              disabled={alreadyQueued}
                              className="rounded-lg bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-800 hover:bg-sky-100 disabled:bg-slate-50 disabled:text-slate-400"
                            >
                              {alreadyQueued ? 'In Buy now' : '+ Again'}
                            </button>}
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 text-center text-xs text-sky-800">
                No purchases recorded yet. Completed Buy now items will appear here by month.
              </div>
            )}
            </>}
          </div>
        </div>
      )}

      {/* =========================================================================
          CATEGORY F: WEEKLY FRUITS (Wednesday shopping list)
         ========================================================================= */}
      {activeCategory === 'F' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#f4c7aa] bg-[#fff1e7] p-3.5 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg leading-none" aria-hidden="true">🍍</span>
              <span className="font-extrabold text-xs text-[#6f3d24] uppercase tracking-wide">{weekdayNames[fruitSchedule.marketDay]} fruit reminder</span>
            </div>
            <p className="text-xs text-[#8c5738] font-medium">
              <b>Fruit shopping day: {weekdayNames[fruitSchedule.marketDay]}</b> · {pendingFruit.length} to pick up this week
            </p>
          </div>

          <div className="rounded-2xl border border-[#f0d28c] bg-[#fff3d8] p-3.5 space-y-3">
            <button type="button" onClick={() => setIsFruitListOpen((open) => !open)} aria-expanded={isFruitListOpen} className="flex w-full items-center justify-between gap-3 text-left">
              <span>
                <span className="block font-display text-xs font-extrabold uppercase tracking-wide text-[#684618]">This week’s fruits · {pendingFruit.length}</span>
                <span className="mt-0.5 block text-[10px] font-medium text-[#8c6425]">Check off as you buy · refreshes every {weekdayNames[fruitSchedule.restockDay]}</span>
              </span>
              <span className={"material-symbols-outlined flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fbe7b2] text-[#6e4b18] transition-transform duration-200 " + (isFruitListOpen ? 'rotate-180' : '')} aria-hidden="true">keyboard_arrow_down</span>
            </button>
            {isFruitListOpen && <>
              {pendingFruit.length > 0 ? <div className="space-y-1.5">
                <div className="flex items-center px-2 py-1 text-[10px] font-extrabold text-[#8c6425]/80 uppercase tracking-wider"><span className="w-6" /><span className="flex-1">Fruit</span><span className="w-16 text-center">Qty</span><span className="w-14 text-center">₹ Price</span><span className="w-7" /></div>
                {pendingFruit.map((fruit) => <div key={fruit.id} className={`flex items-center gap-2 rounded-xl border p-2.5 transition-all duration-150 ${leavingPurchaseItems.has(fruit.id) ? 'opacity-0 -translate-y-2 scale-[0.98]' : ''} ${confirmingPurchaseItems.has(fruit.id) ? 'bg-emerald-50 border-emerald-300 shadow-sm shadow-emerald-100' : 'border-[#f2dfb5] bg-white/85 hover:bg-white'}`}>
                  <button type="button" onClick={() => markItemPurchased(fruit.id, fruit.price)} disabled={confirmingPurchaseItems.has(fruit.id)} aria-label={confirmingPurchaseItems.has(fruit.id) ? `${fruit.name} marked done` : `Mark ${fruit.name} bought`} className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150 ${confirmingPurchaseItems.has(fruit.id) ? 'border-emerald-600 bg-emerald-500 text-white scale-105 shadow-sm shadow-emerald-300' : 'border-[#d6a94d] text-[#9a6a1f] hover:bg-[#d19332] hover:text-white'}`}><span className="material-symbols-outlined text-[15px]">check</span></button>
                  <div className="min-w-0 flex-1"><div className="break-words text-xs font-semibold text-slate-800">{fruit.name}{confirmingPurchaseItems.has(fruit.id) && <span className="ml-1 inline-block rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold leading-none text-emerald-800">Done!</span>}</div>{fruit.lastBought && <div className="text-[10px] text-slate-400">Last bought {fruit.lastBought}</div>}</div>
                  <input type="text" value={fruit.quantity || ''} onChange={(e) => onUpdateItem(fruit.id, { quantity: e.target.value })} placeholder="qty" maxLength={10} aria-label={`Quantity for ${fruit.name}`} className="w-16 shrink-0 rounded-lg border border-[#f0d28c] bg-white px-1 py-1 text-center text-xs font-bold text-slate-700 focus:outline-none focus:border-[#c28d35]" />
                  <input type="text" value={fruit.price || ''} onChange={(e) => onUpdateItem(fruit.id, { price: e.target.value })} placeholder="₹" maxLength={8} aria-label={`Price for ${fruit.name}`} className="w-14 shrink-0 rounded-lg border border-[#f0d28c] bg-white px-1 py-1 text-center text-xs font-bold text-[#8c6425] focus:outline-none focus:border-[#c28d35]" />
                  <button type="button" onClick={() => onDeleteItem(fruit.id)} aria-label={`Remove ${fruit.name}`} title="Remove fruit" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-300 transition hover:bg-rose-50 hover:text-rose-600"><span className="material-symbols-outlined text-[17px]">delete</span></button>
                </div>)}
              </div> : <div className="rounded-xl bg-white/80 p-5 text-center text-xs font-semibold text-[#6e4b18]">All fruits bought for this week.</div>}
              <form onSubmit={handleAddFruitItem} className="flex items-center gap-2 border-t border-[#f0d28c] pt-3">
                <input type="text" value={newFruitName} onChange={(e) => setNewFruitName(e.target.value)} placeholder="Add a fruit (e.g. Apples, Bananas)" maxLength={60} className="min-w-0 flex-1 rounded-xl border border-[#f0d28c] bg-white px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#c28d35]" />
                <button type="submit" className="rounded-xl bg-[#c76a22] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#a94f18] active:scale-95">+ Add</button>
              </form>
            </>}
            <div className="border-t border-[#f0d28c] pt-2">
              <button type="button" onClick={() => setIsFruitScheduleOpen((open) => !open)} aria-expanded={isFruitScheduleOpen} className="flex w-full items-center justify-between gap-2 py-1 text-left">
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#684618]"><span className="material-symbols-outlined text-[16px]">tune</span>Weekly schedule</span>
                <span className="flex items-center gap-1 text-[10px] font-medium text-[#8c6425]">Restock {weekdayNames[fruitSchedule.restockDay]} · Shop {weekdayNames[fruitSchedule.marketDay]}<span className="material-symbols-outlined text-[17px]">{isFruitScheduleOpen ? 'expand_less' : 'expand_more'}</span></span>
              </button>
              {isFruitScheduleOpen && <div className="grid grid-cols-2 gap-2 pt-2">
                <label className="space-y-1 text-[10px] font-semibold text-slate-600">Restock to Buy Now
                  <select value={fruitSchedule.restockDay} onChange={(e) => onUpdateProduceSchedule('fruits', { restockDay: Number(e.target.value) as Weekday })} className="w-full rounded-lg border border-[#f0d28c] bg-white px-2 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-[#c28d35]">
                    {weekdayChoices.map(({ day, label }) => <option key={day} value={day}>{label}</option>)}
                  </select>
                </label>
                <label className="space-y-1 text-[10px] font-semibold text-slate-600">Market day
                  <select value={fruitSchedule.marketDay} onChange={(e) => onUpdateProduceSchedule('fruits', { marketDay: Number(e.target.value) as Weekday })} className="w-full rounded-lg border border-[#f0d28c] bg-white px-2 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-[#c28d35]">
                    {weekdayChoices.map(({ day, label }) => <option key={day} value={day}>{label}</option>)}
                  </select>
                </label>
                <label className="col-span-2 flex items-start gap-2 rounded-lg bg-white/75 p-2 text-[10px] font-semibold text-slate-700">
                  <input type="checkbox" checked={fruitSchedule.autoRestock} onChange={(e) => onUpdateProduceSchedule('fruits', { autoRestock: e.target.checked })} className="mt-0.5 accent-[#c76a22]" />
                  <span>Automatically add previously purchased fruits to Buy Now<span className="mt-0.5 block font-normal text-slate-500">Your purchase history stays saved.</span></span>
                </label>
              </div>}
            </div>
          </div>

          <div className="rounded-2xl border border-[#e5d4dc] bg-[#f7f1f4] p-3.5 space-y-3">
            <button type="button" onClick={() => setIsFruitHistoryOpen((open) => !open)} aria-expanded={isFruitHistoryOpen} className="flex w-full items-center justify-between gap-3 text-left">
              <span><span className="block font-display text-xs font-extrabold uppercase tracking-wide text-[#4c3542]">Fruit purchase history · {fruitPurchaseHistory.length}</span><span className="mt-0.5 block text-[10px] font-medium text-[#795b6d]">Last 2 months, grouped by purchase date</span></span>
              <span className={"material-symbols-outlined flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eee3e9] text-[#67495d] transition-transform duration-200 " + (isFruitHistoryOpen ? 'rotate-180' : '')} aria-hidden="true">keyboard_arrow_down</span>
            </button>
            {isFruitHistoryOpen && <>
              {fruitHistoryDateKeys.length ? fruitHistoryDateKeys.map((dateKey) => {
                const dateItems = fruitPurchasesByDate[dateKey].sort((a, b) => b.purchasedAt - a.purchasedAt);
                const dateTotal = dateItems.reduce((sum, purchase) => sum + (purchase.amount || 0), 0);
                const [year, month, day] = dateKey.split('-').map(Number);
                const label = new Date(year, month - 1, day).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                return <div key={dateKey} className="space-y-1.5">
                  <div className="flex items-center justify-between px-1 text-[11px] font-extrabold uppercase tracking-wider text-[#795b6d]"><span>{label} · {dateItems.length} {dateItems.length === 1 ? 'purchase' : 'purchases'}</span><span className="text-[#4c3542]">₹{dateTotal.toLocaleString('en-IN')}</span></div>
                  {dateItems.map((purchase) => <div key={purchase.id} className="flex items-center justify-between gap-2 rounded-xl border border-[#eadde4] bg-white/85 p-2.5">
                    <div className="min-w-0 flex-1"><span className="block break-words text-xs font-semibold text-slate-800">{purchase.name}</span><span className="text-[10px] text-slate-500">{[purchase.quantity, purchase.store].filter(Boolean).join(' · ')}</span></div>
                    <span className="shrink-0 text-xs font-bold text-[#795b6d]">{purchase.price ? '₹' + purchase.price : '—'}</span>
                  </div>)}
                </div>;
              }) : <p className="rounded-xl bg-white/80 p-4 text-center text-xs text-[#795b6d]">No fruit purchases in the last two months.</p>}
            </>}
          </div>
        </div>
      )}
      {/* =========================================================================
          CATEGORY V: WEEKLY VEGETABLES (Friday / Saturday Mandi list)
         ========================================================================= */}
      {activeCategory === 'V' && (
        <div className="space-y-4">
          {/* Header Banner matching docs/js/grocery.js */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">🥦</span>
              <span className="font-extrabold text-xs text-emerald-950 uppercase tracking-wide">
                Weekly Mandi Schedule
              </span>
            </div>
            <p className="text-xs text-emerald-800 font-medium">
              <b>Shop on {weekdayNames[vegetableSchedule.marketDay]}</b> ·{' '}
              <span className="font-bold underline">{pendingVeg.length} remaining this week</span>
            </p>
          </div>

          {/* Weekly vegetables checklist */}
          <div className="rounded-2xl border border-[#c9ddb0] bg-[#f3f8e8] p-3.5 space-y-3">
            <button type="button" onClick={() => setIsVegListOpen((open) => !open)} aria-expanded={isVegListOpen} className="flex w-full items-center justify-between gap-3 text-left">
              <span>
                <span className="block font-display text-xs font-extrabold uppercase tracking-wide text-[#365b34]">This week’s vegetables · {pendingVeg.length}</span>
                <span className="mt-0.5 block text-[10px] font-medium text-[#587344]">Check off as you buy · refreshes every {weekdayNames[vegetableSchedule.restockDay]}</span>
              </span>
              <span className={"material-symbols-outlined flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e2f0cf] text-[#45663d] transition-transform duration-200 " + (isVegListOpen ? 'rotate-180' : '')} aria-hidden="true">keyboard_arrow_down</span>
            </button>
            {isVegListOpen && <>
              {pendingVeg.length > 0 ? <div className="space-y-1.5">
                <div className="flex items-center px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#587344]/70"><span className="w-6" /><span className="flex-1">Vegetable</span><span className="w-16 text-center">Qty</span><span className="w-14 text-center">₹ Price</span><span className="w-7" /></div>
                {pendingVeg.map((veg) => <div key={veg.id} className={`flex items-center gap-2 rounded-xl border p-2.5 transition-all duration-150 ${leavingPurchaseItems.has(veg.id) ? 'opacity-0 -translate-y-2 scale-[0.98]' : ''} ${confirmingPurchaseItems.has(veg.id) ? 'bg-emerald-50 border-emerald-300 shadow-sm shadow-emerald-100' : 'border-[#dce8d2] bg-white/80 hover:bg-white'}`}>
                  <button type="button" onClick={() => markItemPurchased(veg.id, veg.price)} disabled={confirmingPurchaseItems.has(veg.id)} aria-label={confirmingPurchaseItems.has(veg.id) ? `${veg.name} marked done` : `Mark ${veg.name} bought`} className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150 ${confirmingPurchaseItems.has(veg.id) ? 'border-emerald-600 bg-emerald-500 text-white scale-105 shadow-sm shadow-emerald-300' : 'border-[#9bb77b] text-[#587344] hover:bg-[#658347] hover:text-white'}`}><span className="material-symbols-outlined text-[15px]">check</span></button>
                  <div className="min-w-0 flex-1"><div className="break-words text-xs font-semibold text-slate-800">{veg.name}{confirmingPurchaseItems.has(veg.id) && <span className="ml-1 inline-block rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold leading-none text-emerald-800">Done!</span>}</div>{veg.lastBought && <div className="text-[10px] text-slate-400">Last bought {veg.lastBought}</div>}</div>
                  <input type="text" value={veg.quantity || ''} onChange={(e) => onUpdateItem(veg.id, { quantity: e.target.value })} placeholder="qty" maxLength={10} aria-label={'Quantity for ' + veg.name} className="w-16 shrink-0 rounded-lg border border-[#c9ddb0] bg-white px-1 py-1 text-center text-xs font-bold text-slate-700 focus:outline-none focus:border-[#8ba66b]" />
                  <input type="text" value={veg.price || ''} onChange={(e) => onUpdateItem(veg.id, { price: e.target.value })} placeholder="₹" maxLength={8} aria-label={'Price for ' + veg.name} className="w-14 shrink-0 rounded-lg border border-[#c9ddb0] bg-white px-1 py-1 text-center text-xs font-bold text-[#4c6c38] focus:outline-none focus:border-[#8ba66b]" />
                  <button type="button" onClick={() => onDeleteItem(veg.id)} aria-label={'Delete ' + veg.name} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-300 transition hover:bg-rose-50 hover:text-rose-600"><span className="material-symbols-outlined text-[17px]">delete</span></button>
                </div>)}
              </div> : <div className="rounded-xl bg-white/80 p-5 text-center text-xs font-bold text-[#587344]">All vegetables bought for this week.</div>}
              <form onSubmit={handleAddVegItem} className="flex items-center gap-2 border-t border-[#c9ddb0] pt-3">
                <input type="text" value={newVegName} onChange={(e) => setNewVegName(e.target.value)} placeholder="Add vegetable (e.g. Ridge gourd, Capsicum)" maxLength={60} className="min-w-0 flex-1 rounded-xl border border-[#c9ddb0] bg-white px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#8ba66b]" />
                <button type="submit" className="rounded-xl bg-[#587344] px-3.5 py-2 text-xs font-extrabold text-white transition hover:bg-[#476037] active:scale-95">+ Add</button>
              </form>
            </>}
            <div className="border-t border-[#c9ddb0] pt-2">
              <button type="button" onClick={() => setIsVegScheduleOpen((open) => !open)} aria-expanded={isVegScheduleOpen} className="flex w-full items-center justify-between gap-2 py-1 text-left">
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#365b34]"><span className="material-symbols-outlined text-[16px]">tune</span>Weekly schedule</span>
                <span className="flex items-center gap-1 text-[10px] font-medium text-[#587344]">Restock {weekdayNames[vegetableSchedule.restockDay]} · Shop {weekdayNames[vegetableSchedule.marketDay]}<span className="material-symbols-outlined text-[17px]">{isVegScheduleOpen ? 'expand_less' : 'expand_more'}</span></span>
              </button>
              {isVegScheduleOpen && <div className="grid grid-cols-2 gap-2 pt-2">
                <label className="space-y-1 text-[10px] font-semibold text-slate-600">Restock to Buy Now
                  <select value={vegetableSchedule.restockDay} onChange={(e) => onUpdateProduceSchedule('vegetables', { restockDay: Number(e.target.value) as Weekday })} className="w-full rounded-lg border border-[#c9ddb0] bg-white px-2 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-[#8ba66b]">
                    {weekdayChoices.map(({ day, label }) => <option key={day} value={day}>{label}</option>)}
                  </select>
                </label>
                <label className="space-y-1 text-[10px] font-semibold text-slate-600">Market day
                  <select value={vegetableSchedule.marketDay} onChange={(e) => onUpdateProduceSchedule('vegetables', { marketDay: Number(e.target.value) as Weekday })} className="w-full rounded-lg border border-[#c9ddb0] bg-white px-2 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-[#8ba66b]">
                    {weekdayChoices.map(({ day, label }) => <option key={day} value={day}>{label}</option>)}
                  </select>
                </label>
                <label className="col-span-2 flex items-start gap-2 rounded-lg bg-white/70 p-2 text-[10px] font-semibold text-slate-700">
                  <input type="checkbox" checked={vegetableSchedule.autoRestock} onChange={(e) => onUpdateProduceSchedule('vegetables', { autoRestock: e.target.checked })} className="mt-0.5 accent-[#587344]" />
                  <span>Automatically add previously purchased vegetables to Buy Now<span className="mt-0.5 block font-normal text-slate-500">Your purchase history stays saved.</span></span>
                </label>
              </div>}
            </div>
          </div>
          <div className="rounded-2xl border border-[#b9d1bc] bg-[#e7f1e8] p-3.5 space-y-3">
            <button type="button" onClick={() => setIsVegHistoryOpen((open) => !open)} aria-expanded={isVegHistoryOpen} className="flex w-full items-center justify-between gap-3 text-left">
              <span><span className="block font-display text-xs font-extrabold uppercase tracking-wide text-[#304f3c]">Vegetable purchase history · {vegPurchaseHistory.length}</span><span className="mt-0.5 block text-[10px] font-medium text-[#4f7159]">Last 2 months, grouped by purchase date</span></span>
              <span className={"material-symbols-outlined flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d7e8d9] text-[#42644b] transition-transform duration-200 " + (isVegHistoryOpen ? 'rotate-180' : '')} aria-hidden="true">keyboard_arrow_down</span>
            </button>
            {isVegHistoryOpen && <>
              {vegHistoryDateKeys.length ? vegHistoryDateKeys.map((dateKey) => {
                const dateItems = vegPurchasesByDate[dateKey].sort((a, b) => b.purchasedAt - a.purchasedAt);
                const dateTotal = dateItems.reduce((sum, purchase) => sum + (purchase.amount || 0), 0);
                const label = (() => { const [year, month, day] = dateKey.split('-').map(Number); return new Date(year, month - 1, day).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }); })();
                return <div key={dateKey} className="space-y-1.5">
                  <div className="flex items-center justify-between px-1 text-[11px] font-extrabold uppercase tracking-wider text-[#4f7159]"><span>{label} · {dateItems.length} {dateItems.length === 1 ? 'purchase' : 'purchases'}</span><span className="text-[#304f3c]">₹{dateTotal.toLocaleString('en-IN')}</span></div>
                  {dateItems.map((purchase) => <div key={purchase.id} className="flex items-center justify-between gap-2 rounded-xl border border-[#d3e1d2] bg-white/80 p-2.5">
                    <div className="min-w-0 flex-1"><span className="block break-words text-xs font-semibold text-slate-800">{purchase.name}</span><span className="text-[10px] text-slate-500">{[purchase.quantity, purchase.store].filter(Boolean).join(' · ')}</span></div>
                    <span className="shrink-0 text-xs font-bold text-[#4f7159]">{purchase.price ? '₹' + purchase.price : '—'}</span>
                  </div>)}
                </div>;
              }) : <p className="rounded-xl bg-white/80 p-4 text-center text-xs text-[#4f7159]">No vegetable purchases in the last two months.</p>}
            </>}
          </div>        </div>
      )}
    </div>
  );
};
