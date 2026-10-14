import React, { useState } from 'react';
import { QuickTaskCategory } from '../types';

interface NewEntryModalProps {
  isOpen: boolean;
  initialType?: 'grocery' | 'lifeos' | 'quicktask' | 'category';
  quickTaskCategories: QuickTaskCategory[];
  onAddGrocery: (name: string, store: string, category: 'pantry' | 'vegetables') => void;
  onAddLifeOSEntry: (title: string, subtitle: string, amount: string, dueInfo: string) => void;
  onAddQuickTask: (categoryId: string, title: string) => void;
  onAddCategory: (name: string, icon: string, color: 'blue' | 'emerald' | 'purple') => void;
  onClose: () => void;
}

export const NewEntryModal: React.FC<NewEntryModalProps> = ({
  isOpen,
  initialType = 'grocery',
  quickTaskCategories,
  onAddGrocery,
  onAddLifeOSEntry,
  onAddQuickTask,
  onAddCategory,
  onClose,
}) => {
  const [entryType, setEntryType] = useState<'grocery' | 'lifeos' | 'quicktask' | 'category'>(
    initialType
  );

  // Form states
  const [title, setTitle] = useState('');
  const [extra, setExtra] = useState('');
  const [categoryType, setCategoryType] = useState<'pantry' | 'vegetables'>('pantry');
  const [store, setStore] = useState('Ratnadeep');
  const [selectedQuickTaskCat, setSelectedQuickTaskCat] = useState(
    quickTaskCategories[0]?.id || ''
  );
  const [categoryIcon, setCategoryIcon] = useState('🎯');
  const [categoryColor, setCategoryColor] = useState<'blue' | 'emerald' | 'purple'>('blue');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (entryType === 'grocery') {
      onAddGrocery(title.trim(), store, categoryType);
    } else if (entryType === 'lifeos') {
      onAddLifeOSEntry(title.trim(), extra || 'Private ledger', extra ? `₹${extra}` : 'Active', extra ? `Due: ₹${extra}` : 'Monthly');
    } else if (entryType === 'quicktask') {
      onAddQuickTask(selectedQuickTaskCat || quickTaskCategories[0]?.id, title.trim());
    } else if (entryType === 'category') {
      onAddCategory(title.trim(), categoryIcon, categoryColor);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 border border-outline-variant/30 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        <div className="mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
            Quick Creation
          </span>
          <h3 className="font-display font-extrabold text-xl text-on-surface">
            {entryType === 'category' ? 'Create New Category' : 'Add New Entry'}
          </h3>
        </div>

        {/* Tab switchers if not strictly category creation */}
        {initialType !== 'category' && (
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface-container rounded-2xl mb-4">
            <button
              type="button"
              onClick={() => setEntryType('grocery')}
              className={`py-1.5 text-xs font-bold rounded-xl transition-all ${
                entryType === 'grocery'
                  ? 'bg-white text-primary shadow-2xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              🛒 Grocery
            </button>
            <button
              type="button"
              onClick={() => setEntryType('lifeos')}
              className={`py-1.5 text-xs font-bold rounded-xl transition-all ${
                entryType === 'lifeos'
                  ? 'bg-white text-primary shadow-2xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              🌱 Life OS
            </button>
            <button
              type="button"
              onClick={() => setEntryType('quicktask')}
              className={`py-1.5 text-xs font-bold rounded-xl transition-all ${
                entryType === 'quicktask'
                  ? 'bg-white text-primary shadow-2xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              ⚡ Quick Task
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              {entryType === 'grocery'
                ? 'Item Name'
                : entryType === 'lifeos'
                ? 'Commitment / Bill Name'
                : entryType === 'category'
                ? 'Category Name'
                : 'Task Title'}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                entryType === 'grocery'
                  ? 'e.g. Greek Yogurt or Avocados'
                  : entryType === 'lifeos'
                  ? 'e.g. Internet Broadband or Car EMI'
                  : entryType === 'category'
                  ? 'e.g. Health & Wellness'
                  : 'e.g. Follow up on design feedback'
              }
              className="w-full bg-surface-container-low px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
          </div>

          {entryType === 'grocery' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">List</label>
                <select
                  value={categoryType}
                  onChange={(e) => setCategoryType(e.target.value as any)}
                  className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-xs text-on-surface border border-outline-variant/30"
                >
                  <option value="pantry">Pantry & Grocery</option>
                  <option value="vegetables">Fresh Vegetables</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Store</label>
                <select
                  value={store}
                  onChange={(e) => setStore(e.target.value)}
                  className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-xs text-on-surface border border-outline-variant/30"
                >
                  <option value="Ratnadeep">Ratnadeep</option>
                  <option value="DMart">DMart</option>
                  <option value="Local Mandi">Local Mandi</option>
                  <option value="Organic Farm">Organic Farm</option>
                </select>
              </div>
            </div>
          )}

          {entryType === 'lifeos' && (
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Amount / Provider Note (Optional)
              </label>
              <input
                type="text"
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                placeholder="e.g. 1500 or Monthly SIP"
                className="w-full bg-surface-container-low px-3.5 py-2 rounded-xl text-xs text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          )}

          {entryType === 'quicktask' && (
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Assign Bucket
              </label>
              <select
                value={selectedQuickTaskCat}
                onChange={(e) => setSelectedQuickTaskCat(e.target.value)}
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-xs text-on-surface border border-outline-variant/30"
              >
                {quickTaskCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {entryType === 'category' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Icon Emoji</label>
                <div className="flex gap-2">
                  {['🎯', '🧘', '📚', '🚀', '💡'].map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setCategoryIcon(icon)}
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center text-lg ${
                        categoryIcon === icon
                          ? 'border-primary bg-primary/10'
                          : 'border-outline-variant/30'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Color Tint</label>
                <div className="flex gap-2">
                  {(['blue', 'emerald', 'purple'] as const).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setCategoryColor(color)}
                      className={`h-9 flex-1 rounded-xl capitalize text-xs font-bold border ${
                        categoryColor === color
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-outline-variant/30'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={!title.trim()}
              className="w-full py-3 rounded-2xl bg-primary disabled:opacity-40 text-on-primary font-display font-bold text-sm shadow-xs hover:bg-primary-container active:scale-95 transition-all"
            >
              Save Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
