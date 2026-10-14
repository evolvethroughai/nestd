import React, { useState } from 'react';
import { GroceryItem, LifeOSEntry, QuickTaskCategory } from '../types';

interface ItemDetailsModalProps {
  type: 'grocery' | 'lifeos' | 'quicktask' | null;
  groceryCategory?: 'pantry' | 'vegetables';
  groceryItems: GroceryItem[];
  onToggleGroceryItem: (id: string) => void;
  onAddGroceryItem: (name: string, store: string, category: 'pantry' | 'vegetables') => void;
  lifeOSEntry?: LifeOSEntry | null;
  onPayBill?: (id: string) => void;
  quickTaskCategory?: QuickTaskCategory | null;
  onToggleQuickTask?: (categoryId: string, taskId: string) => void;
  onAddQuickTask?: (categoryId: string, title: string) => void;
  onClose: () => void;
}

export const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({
  type,
  groceryCategory,
  groceryItems,
  onToggleGroceryItem,
  onAddGroceryItem,
  lifeOSEntry,
  onPayBill,
  quickTaskCategory,
  onToggleQuickTask,
  onAddQuickTask,
  onClose,
}) => {
  const [storeFilter, setStoreFilter] = useState<string>('all');
  const [newItemName, setNewItemName] = useState<string>('');
  const [selectedStore, setSelectedStore] = useState<string>('Ratnadeep');
  const [newQuickTaskTitle, setNewQuickTaskTitle] = useState<string>('');

  if (!type) return null;

  // Grocery detail
  if (type === 'grocery' && groceryCategory) {
    const isPantry = groceryCategory === 'pantry';
    const items = groceryItems.filter((i) =>
      isPantry ? i.group !== 'Vegetables' : i.group === 'Vegetables'
    );
    const filteredItems = items.filter((i) => {
      if (storeFilter === 'all') return true;
      return i.store === storeFilter;
    });

    const handleCreateGroceryItem = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newItemName.trim()) return;
      onAddGroceryItem(
        newItemName.trim(),
        isPantry ? selectedStore : 'Local Mandi',
        groceryCategory
      );
      setNewItemName('');
    };

    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
        <div className="bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] flex flex-col border border-outline-variant/30 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-outline-variant/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-xs ${
                  isPantry ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                }`}
              >
                {isPantry ? '🛍️' : '🥦'}
              </div>
              <div>
                <h3 className="font-display font-extrabold text-lg text-on-surface">
                  {isPantry ? 'Pantry & Grocery List' : 'Fresh Garden Vegetables'}
                </h3>
                <p className="text-xs text-on-surface-variant font-medium">
                  {items.filter((i) => i.completed).length} of {items.length} collected
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Store Filter Tabs (for pantry) */}
          {isPantry && (
            <div className="flex items-center gap-2 px-5 pt-3 pb-1 border-b border-outline-variant/10">
              <button
                onClick={() => setStoreFilter('all')}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  storeFilter === 'all'
                    ? 'bg-amber-600 text-white'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                All Stores ({items.length})
              </button>
              <button
                onClick={() => setStoreFilter('Ratnadeep')}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  storeFilter === 'Ratnadeep'
                    ? 'bg-amber-600 text-white'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                Ratnadeep
              </button>
              <button
                onClick={() => setStoreFilter('DMart')}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  storeFilter === 'DMart'
                    ? 'bg-amber-600 text-white'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                DMart
              </button>
            </div>
          )}

          {/* Items Checklist Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onToggleGroceryItem(item.id)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] select-none ${
                  item.completed
                    ? 'bg-emerald-50/60 border-emerald-200/50 opacity-80'
                    : 'bg-white border-outline-variant/30 hover:border-amber-400/50 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      item.completed ? 'text-emerald-600' : 'text-slate-300'
                    }`}
                  >
                    {item.completed ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <div>
                    <span
                      className={`text-sm font-semibold block ${
                        item.completed ? 'line-through text-on-surface-variant' : 'text-on-surface'
                      }`}
                    >
                      {item.name}
                    </span>
                    <span className="text-[11px] text-on-surface-variant/70">
                      {item.quantity ? `${item.quantity} · ` : ''}
                      {item.store || 'Market'}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    item.completed
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {item.completed ? 'In Cart' : 'Needed'}
                </span>
              </div>
            ))}
          </div>

          {/* Add New Grocery Item Input */}
          <form
            onSubmit={handleCreateGroceryItem}
            className="p-3 bg-surface-container border-t border-outline-variant/20 flex items-center gap-2"
          >
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder={`Add ${isPantry ? 'grocery item...' : 'fresh veggie...'}`}
              className="flex-1 bg-surface-container-lowest text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {isPantry && (
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="bg-surface-container-lowest text-xs font-semibold px-2 py-2.5 rounded-xl border border-outline-variant/30"
              >
                <option value="Ratnadeep">Ratnadeep</option>
                <option value="DMart">DMart</option>
              </select>
            )}
            <button
              type="submit"
              disabled={!newItemName.trim()}
              className="px-4 py-2.5 bg-primary disabled:opacity-40 text-on-primary text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all"
            >
              Add
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Life OS Entry Detail
  if (type === 'lifeos' && lifeOSEntry) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
        <div className="bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 border border-outline-variant/30 shadow-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl shadow-xs">
              {lifeOSEntry.type === 'chit' ? '💰' : lifeOSEntry.type === 'emi' ? '🏡' : '⚡'}
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                Life OS Ledger
              </span>
              <h3 className="font-display font-extrabold text-xl text-on-surface">
                {lifeOSEntry.title}
              </h3>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-3 mb-5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface-variant">Account / Providers:</span>
              <span className="font-bold text-on-surface">{lifeOSEntry.subtitle}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface-variant">Cycle Info:</span>
              <span className="font-bold text-on-surface">{lifeOSEntry.dueInfo}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface-variant">Status:</span>
              <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                {lifeOSEntry.status}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface-variant">Scheduled Payout / Term:</span>
              <span className="font-bold text-on-surface">{lifeOSEntry.meta}</span>
            </div>
          </div>

          {lifeOSEntry.type === 'utility' && (
            <div className="space-y-2 mb-4">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                Pending Breakdown
              </span>
              <div className="text-xs divide-y divide-outline-variant/20 rounded-xl bg-white border p-3 space-y-2">
                <div className="flex justify-between items-center pt-1">
                  <span>BESCOM Electricity (Due in 2 days)</span>
                  <span className="font-bold">₹2,140</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span>Indane Piped Gas</span>
                  <span className="font-bold">₹680</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span>ACT Fibernet Broadband</span>
                  <span className="font-bold">₹785</span>
                </div>
              </div>
            </div>
          )}

          {lifeOSEntry.type === 'utility' ? (
            <button
              onClick={() => {
                if (onPayBill) onPayBill(lifeOSEntry.id);
                onClose();
              }}
              className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-display font-bold text-sm shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              <span>Pay Total ₹3,605 Now</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-primary text-on-primary font-display font-bold text-sm shadow-sm hover:bg-primary-container active:scale-95 transition-all"
            >
              Record Payment / Done
            </button>
          )}
        </div>
      </div>
    );
  }

  // Quick Task Category Detail
  if (type === 'quicktask' && quickTaskCategory) {
    const handleAdd = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newQuickTaskTitle.trim() || !onAddQuickTask) return;
      onAddQuickTask(quickTaskCategory.id, newQuickTaskTitle.trim());
      setNewQuickTaskTitle('');
    };

    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
        <div className="bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] flex flex-col border border-outline-variant/30 shadow-2xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-outline-variant/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-surface-container flex items-center justify-center text-2xl shadow-xs">
                {quickTaskCategory.icon}
              </div>
              <div>
                <h3 className="font-display font-extrabold text-lg text-on-surface">
                  {quickTaskCategory.name} Tasks
                </h3>
                <p className="text-xs text-on-surface-variant font-medium">
                  {quickTaskCategory.tasks.filter((t) => t.completed).length} of{' '}
                  {quickTaskCategory.tasks.length} done
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {quickTaskCategory.tasks.map((task) => (
              <div
                key={task.id}
                onClick={() =>
                  onToggleQuickTask && onToggleQuickTask(quickTaskCategory.id, task.id)
                }
                className="p-3 rounded-xl border border-outline-variant/30 bg-white flex items-center gap-3 cursor-pointer hover:border-primary/40 active:scale-[0.99] select-none"
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    task.completed ? 'text-emerald-600' : 'text-slate-300'
                  }`}
                >
                  {task.completed ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                <span
                  className={`text-xs sm:text-sm font-semibold flex-1 ${
                    task.completed ? 'line-through text-on-surface-variant' : 'text-on-surface'
                  }`}
                >
                  {task.title}
                </span>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleAdd}
            className="p-3 bg-surface-container border-t border-outline-variant/20 flex items-center gap-2"
          >
            <input
              type="text"
              value={newQuickTaskTitle}
              onChange={(e) => setNewQuickTaskTitle(e.target.value)}
              placeholder={`Add task to ${quickTaskCategory.name}...`}
              className="flex-1 bg-surface-container-lowest text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={!newQuickTaskTitle.trim()}
              className="px-4 py-2.5 bg-primary disabled:opacity-40 text-on-primary text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all"
            >
              Add
            </button>
          </form>
        </div>
      </div>
    );
  }

  return null;
};
