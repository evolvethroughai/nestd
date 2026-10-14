import React, { useState } from 'react';
import { GroceryItem } from '../types';

interface GroceryManagerProps {
  items: GroceryItem[];
  onToggleCompleted: (id: string, price?: string) => void;
  onToggleNeeded: (id: string) => void;
  onAddItem: (
    name: string,
    group: GroceryItem['group'],
    store: string,
    needed: boolean,
    qty?: string,
    price?: string
  ) => void;
  onUpdateItem: (id: string, updates: Partial<GroceryItem>) => void;
  onDeleteItem: (id: string) => void;
  initialCategory?: 'C' | 'V'; // 'C' = Shopping & Staples, 'V' = Vegetables
}

export const GroceryManager: React.FC<GroceryManagerProps> = ({
  items,
  onToggleCompleted,
  onToggleNeeded,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  initialCategory = 'C',
}) => {
  const [activeCategory, setActiveCategory] = useState<'C' | 'V'>(initialCategory);

  // Form states for adding new master grocery item
  const [newItemName, setNewItemName] = useState('');
  const [newItemGroup, setNewItemGroup] = useState<GroceryItem['group']>('Staples / food');
  const [newItemStore, setNewItemStore] = useState('DMart');
  const [alsoBuyNow, setAlsoBuyNow] = useState(true);

  // Form state for adding vegetable
  const [newVegName, setNewVegName] = useState('');

  // Accordion collapsed states for Master Grocery List
  const [openMasterAccordions, setOpenMasterAccordions] = useState<Record<string, boolean>>({
    'Staples / food': true,
    'Household / personal': false,
    'Pooja': false,
    'Fruit': false,
    'Nuts, seeds and snacks': false,
  });

  const toggleAccordion = (grp: string) => {
    setOpenMasterAccordions((prev) => ({
      ...prev,
      [grp]: !prev[grp],
    }));
  };

  // --- Category C Items ---
  const nonVegItems = items.filter((i) => i.group !== 'Vegetables');
  const buyNowList = nonVegItems.filter((i) => i.needed && !i.completed);
  const boughtHistory = nonVegItems.filter((i) => i.completed);

  // Group bought items by date
  const boughtByDate = boughtHistory.reduce((acc, item) => {
    const d = item.boughtDate || 'Earlier';
    if (!acc[d]) acc[d] = [];
    acc[d].push(item);
    return acc;
  }, {} as Record<string, GroceryItem[]>);

  // --- Category V Items ---
  const vegItems = items.filter((i) => i.group === 'Vegetables');
  const pendingVeg = vegItems.filter((i) => !i.completed);
  const boughtVeg = vegItems.filter((i) => i.completed);

  const boughtVegByDate = boughtVeg.reduce((acc, item) => {
    const d = item.boughtDate || 'Earlier';
    if (!acc[d]) acc[d] = [];
    acc[d].push(item);
    return acc;
  }, {} as Record<string, GroceryItem[]>);

  const coreMasterGroups: GroceryItem['group'][] = [
    'Staples / food',
    'Household / personal',
    'Pooja',
    'Fruit',
    'Nuts, seeds and snacks',
  ];

  const stores = ['DMart', 'Ratnadeep', 'General Store', 'Organic Farm', 'Blinkit', 'Zepto'];

  const handleAddMasterItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    onAddItem(newItemName.trim(), newItemGroup, newItemStore, alsoBuyNow, '1 pack', '');
    setNewItemName('');
  };

  const handleAddVegItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVegName.trim()) return;
    onAddItem(newVegName.trim(), 'Vegetables', 'Local Mandi', true, '500 g', '');
    setNewVegName('');
  };

  return (
    <div className="flex flex-col w-full space-y-4 pb-8 animate-fadeIn text-slate-800">
      {/* Category Tabs: C (Shopping & Staples) vs V (Vegetables) matching repo */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveCategory('C')}
          className={`py-2 px-3 rounded-xl font-display font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 ${
            activeCategory === 'C'
              ? 'bg-white text-amber-900 shadow-xs border border-amber-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>🛒</span>
          <span>Shopping & Staples</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 font-bold">
            {buyNowList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveCategory('V')}
          className={`py-2 px-3 rounded-xl font-display font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 ${
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
      </div>

      {/* =========================================================================
          CATEGORY C: GROCERY & SHOPPING (Staples, food, household, pooja, fruit)
         ========================================================================= */}
      {activeCategory === 'C' && (
        <div className="space-y-4">
          {/* Section: + Add Item to Master List (matches docs/js/grocery.js) */}
          <form
            onSubmit={handleAddMasterItem}
            className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5"
          >
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <span>+</span>
              <span>Add item to master list</span>
            </div>

            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Item name (e.g. Minapappu, Ghee, Floor cleaner)…"
              maxLength={80}
              className="w-full bg-slate-50 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 border border-slate-200 focus:outline-none focus:border-amber-500"
              required
            />

            <div className="grid grid-cols-2 gap-2">
              <select
                value={newItemGroup}
                onChange={(e) => setNewItemGroup(e.target.value as any)}
                className="bg-slate-50 px-2 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
              >
                {coreMasterGroups.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>

              <select
                value={newItemStore}
                onChange={(e) => setNewItemStore(e.target.value)}
                className="bg-slate-50 px-2 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
              >
                {stores.map((s) => (
                  <option key={s} value={s}>
                    📍 {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600">
                <input
                  type="checkbox"
                  checked={alsoBuyNow}
                  onChange={(e) => setAlsoBuyNow(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Also add to Buy now</span>
              </label>

              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-amber-600 text-white font-extrabold text-xs shadow-2xs hover:bg-amber-700 active:scale-95 transition-all"
              >
                + Add
              </button>
            </div>
          </form>

          {/* Section 1: 🛒 Buy now — X items (The Active Shopping List) */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🛒</span>
                <h4 className="font-display font-extrabold text-xs text-amber-950 uppercase tracking-wide">
                  Buy Now — {buyNowList.length} items
                </h4>
              </div>
              <span className="text-[11px] font-bold text-amber-800">
                Tap checkbox when bought
              </span>
            </div>

            {buyNowList.length > 0 ? (
              <div className="space-y-1.5">
                {/* Column Headers */}
                <div className="flex items-center px-2 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <span className="w-6"></span>
                  <span className="flex-1">Item</span>
                  <span className="w-16 text-center">Qty</span>
                  <span className="w-14 text-center">₹ Price</span>
                  <span className="w-12 text-right">Action</span>
                </div>

                {buyNowList.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-white border border-amber-100/80 shadow-2xs flex items-center gap-2 transition-all hover:border-amber-300"
                  >
                    {/* Mark as Bought Checkbox */}
                    <button
                      onClick={() => onToggleCompleted(item.id, item.price)}
                      className="w-6 h-6 rounded-lg border-2 border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 flex items-center justify-center text-white transition-colors shrink-0"
                      title="Mark as bought"
                    >
                      <span className="material-symbols-outlined text-[16px] text-transparent hover:text-emerald-600">
                        check
                      </span>
                    </button>

                    {/* Item Name & Store */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs text-slate-800 truncate">
                        {item.name}
                      </div>
                      {item.store && (
                        <div className="text-[10px] font-bold text-amber-800/80 flex items-center gap-1 mt-0.5">
                          <span>📍</span>
                          <span>{item.store}</span>
                        </div>
                      )}
                    </div>

                    {/* Qty Input */}
                    <input
                      type="text"
                      value={item.quantity || ''}
                      onChange={(e) => onUpdateItem(item.id, { quantity: e.target.value })}
                      placeholder="qty"
                      maxLength={10}
                      className="w-16 text-center text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg py-1 px-1 shrink-0 focus:outline-none focus:border-amber-400"
                    />

                    {/* Price Input */}
                    <input
                      type="text"
                      value={item.price || ''}
                      onChange={(e) => onUpdateItem(item.id, { price: e.target.value })}
                      placeholder="₹"
                      maxLength={8}
                      className="w-14 text-center text-xs font-bold text-amber-700 bg-slate-50 border border-slate-200 rounded-lg py-1 px-1 shrink-0 focus:outline-none focus:border-amber-400"
                    />

                    {/* Remove from Buy Now button */}
                    <button
                      onClick={() => onToggleNeeded(item.id)}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center shrink-0 text-xs transition-colors"
                      title="Remove from Buy now"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-white/70 border border-dashed border-amber-200 text-center text-xs text-slate-500">
                Nothing in Buy now. Tap <b className="text-amber-800">+ Buy now</b> on any item in the Master list below!
              </div>
            )}
          </div>

          {/* Section 2: 📒 Master Grocery List (Categorized catalog) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-base">📒</span>
                <h4 className="font-display font-extrabold text-xs text-slate-900 uppercase tracking-wide">
                  Master Grocery List ({nonVegItems.length})
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">
                Tap "+ Buy now" to add to active cart
              </span>
            </div>

            <div className="space-y-2">
              {coreMasterGroups.map((grp) => {
                const grpItems = nonVegItems.filter((i) => i.group === grp);
                const inBuyNowCount = grpItems.filter((i) => i.needed && !i.completed).length;
                const isOpen = !!openMasterAccordions[grp];

                return (
                  <div
                    key={grp}
                    className="rounded-xl border border-slate-200/90 overflow-hidden bg-slate-50/50"
                  >
                    {/* Category Accordion Header */}
                    <div
                      onClick={() => toggleAccordion(grp)}
                      className="p-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800">
                          {grp === 'Staples / food' && '🍚 '}
                          {grp === 'Household / personal' && '🧴 '}
                          {grp === 'Pooja' && '🪔 '}
                          {grp === 'Fruit' && '🍎 '}
                          {grp === 'Nuts, seeds and snacks' && '🥜 '}
                          {grp}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-bold">
                          {grpItems.length}
                        </span>
                        {inBuyNowCount > 0 && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 font-extrabold">
                            {inBuyNowCount} in Buy now
                          </span>
                        )}
                      </div>
                      <span className="text-slate-400 text-xs">{isOpen ? '▲' : '▼'}</span>
                    </div>

                    {/* Items inside Category */}
                    {isOpen && (
                      <div className="p-2 divide-y divide-slate-100 bg-white">
                        {grpItems.map((item) => (
                          <div
                            key={item.id}
                            className="py-2 px-1 flex items-center justify-between gap-2 hover:bg-slate-50 rounded-lg transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <span className="font-semibold text-xs text-slate-800 block truncate">
                                {item.name}
                              </span>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                                <span>{item.quantity || '1 pack'}</span>
                                {item.store && <span>• 📍 {item.store}</span>}
                                {item.lastBought && (
                                  <span>• Last: {item.lastBought}</span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* + Buy now / ✓ In list button matching docs/js/render.js */}
                              <button
                                onClick={() => onToggleNeeded(item.id)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shadow-2xs ${
                                  item.needed && !item.completed
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-amber-100 hover:text-amber-900 border border-slate-200'
                                }`}
                              >
                                {item.needed && !item.completed ? '✓ In list' : '+ Buy now'}
                              </button>

                              <button
                                onClick={() => onDeleteItem(item.id)}
                                className="w-6 h-6 rounded-md text-slate-300 hover:text-rose-600 flex items-center justify-center text-xs"
                                title="Delete"
                              >
                                🗑
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: ✅ Already Bought — Last 3 Months (History Ledger) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-base">✅</span>
                <h4 className="font-display font-extrabold text-xs text-slate-900 uppercase tracking-wide">
                  Already Bought — Last 3 Months ({boughtHistory.length})
                </h4>
              </div>
            </div>

            {Object.keys(boughtByDate).length > 0 ? (
              <div className="space-y-3">
                {Object.keys(boughtByDate).map((dateKey) => {
                  const bItems = boughtByDate[dateKey];
                  const total = bItems.reduce(
                    (s, x) => s + (parseFloat(x.price || '0') || 0),
                    0
                  );

                  return (
                    <div key={dateKey} className="space-y-1.5">
                      <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center justify-between px-1">
                        <span>🛒 Bought {dateKey}</span>
                        {total > 0 && (
                          <span className="text-amber-700 font-bold">
                            ₹{total.toLocaleString('en-IN')} overall
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        {bItems.map((item) => (
                          <div
                            key={item.id}
                            className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2"
                          >
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-xs text-slate-400 line-through block truncate">
                                {item.name}
                              </span>
                              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                {item.quantity && <span>{item.quantity}</span>}
                                {item.price && <span>• ₹{item.price}</span>}
                                {item.store && <span>• 📍 {item.store}</span>}
                              </div>
                            </div>

                            {/* Buy Again button (returns to Buy now list) */}
                            <button
                              onClick={() => {
                                onToggleCompleted(item.id);
                                onToggleNeeded(item.id);
                              }}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-amber-700 font-extrabold text-[11px] hover:bg-amber-50 shadow-2xs shrink-0"
                            >
                              + Again
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 text-center text-xs text-slate-400">
                No past purchases recorded yet.
              </div>
            )}
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
              <b>Buy on Friday or Saturday</b> · Budget: ₹600–₹800 ·{' '}
              <span className="font-bold underline">{pendingVeg.length} remaining this week</span>
            </p>
          </div>

          {/* Pending Vegetables List */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="font-display font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                This Week's Vegetables ({pendingVeg.length})
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                Check off as you buy
              </span>
            </div>

            {pendingVeg.length > 0 ? (
              <div className="space-y-1.5">
                {/* Headers */}
                <div className="flex items-center px-2 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <span className="w-6"></span>
                  <span className="flex-1">Vegetable</span>
                  <span className="w-16 text-center">Qty</span>
                  <span className="w-14 text-center">₹ Price</span>
                  <span className="w-7 text-right"></span>
                </div>

                {pendingVeg.map((veg) => (
                  <div
                    key={veg.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2 hover:bg-emerald-50/40 transition-colors"
                  >
                    {/* Circle Checkmark to mark bought */}
                    <button
                      onClick={() => onToggleCompleted(veg.id, veg.price)}
                      className="w-6 h-6 rounded-full border-2 border-emerald-400 hover:bg-emerald-500 hover:text-white flex items-center justify-center text-emerald-600 transition-colors shrink-0"
                      title="Mark vegetable bought"
                    >
                      <span className="material-symbols-outlined text-[15px]">check</span>
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs text-slate-800 truncate">
                        {veg.name}
                      </div>
                      {veg.lastBought && (
                        <div className="text-[10px] text-slate-400">
                          Last: {veg.lastBought}
                        </div>
                      )}
                    </div>

                    {/* Qty Input */}
                    <input
                      type="text"
                      value={veg.quantity || ''}
                      onChange={(e) => onUpdateItem(veg.id, { quantity: e.target.value })}
                      placeholder="qty"
                      maxLength={10}
                      className="w-16 text-center text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg py-1 px-1 shrink-0 focus:outline-none focus:border-emerald-500"
                    />

                    {/* Price Input */}
                    <input
                      type="text"
                      value={veg.price || ''}
                      onChange={(e) => onUpdateItem(veg.id, { price: e.target.value })}
                      placeholder="₹"
                      maxLength={8}
                      className="w-14 text-center text-xs font-bold text-emerald-700 bg-white border border-slate-200 rounded-lg py-1 px-1 shrink-0 focus:outline-none focus:border-emerald-500"
                    />

                    {/* Delete button */}
                    <button
                      onClick={() => onDeleteItem(veg.id)}
                      className="w-6 h-6 rounded-md text-slate-300 hover:text-rose-600 flex items-center justify-center text-xs shrink-0"
                      title="Delete"
                    >
                      🗑
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-emerald-800 font-bold bg-emerald-50/60 rounded-xl">
                🥦 All vegetables bought for this week!
              </div>
            )}

            {/* Inline Quick Add Vegetable */}
            <form onSubmit={handleAddVegItem} className="pt-2 flex items-center gap-2">
              <input
                type="text"
                value={newVegName}
                onChange={(e) => setNewVegName(e.target.value)}
                placeholder="Add vegetable (e.g. Ridge gourd, Capsicum)…"
                maxLength={60}
                className="flex-1 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-2xs hover:bg-emerald-700 active:scale-95"
              >
                + Add
              </button>
            </form>
          </div>

          {/* Already Bought Vegetables History */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="font-display font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                Bought History ({boughtVeg.length})
              </span>
            </div>

            {Object.keys(boughtVegByDate).length > 0 ? (
              <div className="space-y-3">
                {Object.keys(boughtVegByDate).map((dateKey) => {
                  const items = boughtVegByDate[dateKey];
                  const total = items.reduce(
                    (s, x) => s + (parseFloat(x.price || '0') || 0),
                    0
                  );

                  return (
                    <div key={dateKey} className="space-y-1.5">
                      <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center justify-between px-1">
                        <span>🛒 Bought {dateKey}</span>
                        {total > 0 && (
                          <span className="text-emerald-700 font-bold">
                            ₹{total.toLocaleString('en-IN')} overall
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        {items.map((veg) => (
                          <div
                            key={veg.id}
                            className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2"
                          >
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-xs text-slate-400 line-through block truncate">
                                {veg.name}
                              </span>
                              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                {veg.quantity && <span>{veg.quantity}</span>}
                                {veg.price && <span>• ₹{veg.price}</span>}
                              </div>
                            </div>

                            <button
                              onClick={() => onToggleCompleted(veg.id)}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-emerald-700 font-extrabold text-[11px] hover:bg-emerald-50 shadow-2xs shrink-0"
                            >
                              + Buy Again
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 text-center text-xs text-slate-400">
                No past vegetable purchases.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
