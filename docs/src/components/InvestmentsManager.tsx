import React, { useState } from 'react';
import { InvestmentItem } from '../types';

interface InvestmentsManagerProps {
  investments: InvestmentItem[];
  onTogglePaid: (id: string) => void;
  onAddInvestment: (item: Omit<InvestmentItem, 'id'>) => void;
  onDeleteInvestment: (id: string) => void;
}

export const InvestmentsManager: React.FC<InvestmentsManagerProps> = ({
  investments,
  onTogglePaid,
  onAddInvestment,
  onDeleteInvestment,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [amt, setAmt] = useState('');
  const [due, setDue] = useState('10th');
  const [note, setNote] = useState('');

  const pending = investments.filter((x) => !x.paid);
  const done = investments.filter((x) => x.paid);
  const totalMonthly = pending.reduce((sum, x) => sum + (parseFloat(x.amt || '0') || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddInvestment({
      name: name.trim(),
      amt: amt.trim() || undefined,
      due: due.trim() || undefined,
      note: note.trim() || undefined,
      paid: false,
      icon: '📈',
    });
    setName('');
    setAmt('');
    setNote('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="flex flex-col w-full space-y-4 pb-6 animate-fadeIn">
      {/* Summary Header */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
            Pending This Month
          </span>
          <span className="text-xs text-emerald-700 font-medium">
            {pending.length} pending · {done.length} completed
          </span>
        </div>
        <div className="text-right">
          <span className="text-xl font-display font-black text-emerald-900">
            ₹{totalMonthly.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Pending Section */}
      <div className="space-y-2">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-on-surface-variant flex items-center justify-between">
          <span>This Month</span>
          <span className="px-2 py-0.5 rounded-full bg-surface-container text-xs font-bold">
            {pending.length}
          </span>
        </h4>

        {pending.length === 0 ? (
          <div className="p-6 text-center rounded-2xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface-variant font-medium">
            🎉 All investments completed for this cycle!
          </div>
        ) : (
          pending.map((inv) => (
            <div
              key={inv.id}
              className="p-3.5 rounded-2xl bg-white border border-outline-variant/30 shadow-2xs hover:border-emerald-300 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-800 flex items-center justify-center text-lg shrink-0">
                  {inv.icon || '📈'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h5 className="font-display font-bold text-sm text-on-surface">
                      {inv.name}
                    </h5>
                    {inv.due && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-900 text-[10px] font-bold">
                        Due {inv.due}
                      </span>
                    )}
                  </div>
                  {inv.note && (
                    <p className="text-xs text-on-surface-variant truncate mt-0.5">{inv.note}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-2">
                {inv.amt && (
                  <span className="font-display font-bold text-sm text-emerald-800">
                    ₹{parseFloat(inv.amt).toLocaleString('en-IN')}
                  </span>
                )}
                <button
                  onClick={() => onTogglePaid(inv.id)}
                  className="w-8 h-8 rounded-full border border-emerald-300 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-all"
                  title="Mark as invested"
                >
                  ✓
                </button>
                <button
                  onClick={() => onDeleteInvestment(inv.id)}
                  className="w-8 h-8 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all"
                  title="Delete"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Done Section */}
      {done.length > 0 && (
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 flex items-center justify-between">
            <span>✓ Completed</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-xs font-bold text-emerald-900">
              {done.length}
            </span>
          </h4>

          {done.map((inv) => (
            <div
              key={inv.id}
              className="p-3 rounded-2xl bg-surface-container-low/60 border border-outline-variant/20 flex items-center justify-between opacity-80"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="text-emerald-700 text-sm">✓</span>
                <span className="font-medium text-xs text-on-surface-variant truncate line-through">
                  {inv.name}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {inv.amt && (
                  <span className="text-xs font-semibold text-on-surface-variant">
                    ₹{parseFloat(inv.amt).toLocaleString('en-IN')}
                  </span>
                )}
                <button
                  onClick={() => onTogglePaid(inv.id)}
                  className="text-xs font-bold text-primary hover:underline px-2"
                >
                  Undo
                </button>
                <button
                  onClick={() => onDeleteInvestment(inv.id)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                >
                  <span className="material-symbols-outlined text-[15px]">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Button */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="w-full py-3 rounded-2xl bg-primary text-white font-display font-bold text-xs hover:bg-primary/95 transition-all shadow-xs flex items-center justify-center gap-1.5"
      >
        <span className="material-symbols-outlined text-[16px]">add</span>
        <span>+ Add Investment</span>
      </button>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-sm p-5 border border-outline-variant/30 shadow-2xl">
            <h3 className="font-display font-bold text-base text-on-surface mb-3">
              Add Investment / SIP
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
                  Investment Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Parag Parikh Flexi Cap SIP"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/50 text-xs text-on-surface focus:outline-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="10000"
                    value={amt}
                    onChange={(e) => setAmt(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/50 text-xs text-on-surface focus:outline-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
                    Due Day / Cycle
                  </label>
                  <input
                    type="text"
                    placeholder="15th"
                    value={due}
                    onChange={(e) => setDue(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/50 text-xs text-on-surface focus:outline-primary"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
                  Note (optional)
                </label>
                <input
                  type="text"
                  placeholder="Folio number, platform, direct growth"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/50 text-xs text-on-surface focus:outline-primary"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-surface-container text-on-surface font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold text-xs"
                >
                  Save Investment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
