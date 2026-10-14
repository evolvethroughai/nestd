import React, { useState } from 'react';
import { HealthItem } from '../types';

interface HealthManagerProps {
  healthItems: HealthItem[];
  onAddHealthItem: (item: Omit<HealthItem, 'id'>) => void;
  onDeleteHealthItem: (id: string) => void;
}

export const HealthManager: React.FC<HealthManagerProps> = ({
  healthItems,
  onAddHealthItem,
  onDeleteHealthItem,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addType, setAddType] = useState<'med' | 'appt'>('med');
  const [name, setName] = useState('');
  const [amt, setAmt] = useState('');
  const [due, setDue] = useState('');
  const [note, setNote] = useState('');

  const medicines = healthItems.filter((x) => x.htype === 'med');
  const appointments = healthItems.filter((x) => x.htype === 'appt');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddHealthItem({
      name: name.trim(),
      htype: addType,
      amt: amt.trim() || undefined,
      due: due.trim() || undefined,
      note: note.trim() || undefined,
      icon: addType === 'med' ? '💊' : '🏥',
    });
    setName('');
    setAmt('');
    setDue('');
    setNote('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="flex flex-col w-full space-y-4 pb-6 animate-fadeIn">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">
            Medicines to Restock
          </span>
          <span className="font-display font-extrabold text-lg text-rose-950">
            {medicines.length} items
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
            Appointments
          </span>
          <span className="font-display font-extrabold text-lg text-blue-950">
            {appointments.length} scheduled
          </span>
        </div>
      </div>

      {/* Medicines Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
            <span>💊 Medicines to Restock</span>
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-[10px] font-bold text-rose-900">
              {medicines.length}
            </span>
          </h4>
          <button
            onClick={() => {
              setAddType('med');
              setIsAddModalOpen(true);
            }}
            className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-0.5"
          >
            + Add Medicine
          </button>
        </div>

        {medicines.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-2xl bg-white border border-rose-200/70 shadow-2xs flex items-center justify-between"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="text-xl">💊</span>
              <div className="min-w-0 flex-1">
                <h5 className="font-display font-bold text-sm text-on-surface">
                  {item.name}
                </h5>
                <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-0.5 flex-wrap">
                  {item.due && (
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-semibold text-[10px]">
                      Restock: {item.due}
                    </span>
                  )}
                  {item.note && <span className="truncate">{item.note}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {item.amt && (
                <span className="text-xs font-bold text-rose-800">₹{item.amt}</span>
              )}
              <button
                onClick={() => onDeleteHealthItem(item.id)}
                className="w-7 h-7 rounded-full text-slate-400 hover:text-rose-600 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[15px]">delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Appointments Section */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
            <span>🏥 Doctor Appointments</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[10px] font-bold text-blue-900">
              {appointments.length}
            </span>
          </h4>
          <button
            onClick={() => {
              setAddType('appt');
              setIsAddModalOpen(true);
            }}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-0.5"
          >
            + Add Appointment
          </button>
        </div>

        {appointments.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-2xl bg-white border border-blue-200/70 shadow-2xs flex items-center justify-between"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="text-xl">🏥</span>
              <div className="min-w-0 flex-1">
                <h5 className="font-display font-bold text-sm text-on-surface">
                  {item.name}
                </h5>
                <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-0.5 flex-wrap">
                  {item.due && (
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold text-[10px]">
                      {item.due}
                    </span>
                  )}
                  {item.note && <span className="truncate">{item.note}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {item.amt && (
                <span className="text-xs font-bold text-blue-800">₹{item.amt}</span>
              )}
              <button
                onClick={() => onDeleteHealthItem(item.id)}
                className="w-7 h-7 rounded-full text-slate-400 hover:text-rose-600 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[15px]">delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-sm p-5 border border-outline-variant/30 shadow-2xl">
            <h3 className="font-display font-bold text-base text-on-surface mb-3">
              {addType === 'med' ? 'Add Medicine to Restock' : 'Schedule Appointment'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
                  {addType === 'med' ? 'Medicine Name & Dosage' : 'Appointment / Doctor'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    addType === 'med'
                      ? 'e.g. Calcium + Vit D3 (Mom)'
                      : 'e.g. Dr. Warren Dental Checkup'
                  }
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/50 text-xs text-on-surface focus:outline-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
                    Approx Cost (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="850"
                    value={amt}
                    onChange={(e) => setAmt(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/50 text-xs text-on-surface focus:outline-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
                    {addType === 'med' ? 'Restock Due' : 'Scheduled Date'}
                  </label>
                  <input
                    type="text"
                    placeholder={addType === 'med' ? 'In 3 days' : 'Tomorrow 10 AM'}
                    value={due}
                    onChange={(e) => setDue(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/50 text-xs text-on-surface focus:outline-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
                  Notes / Clinic / Pharmacy
                </label>
                <input
                  type="text"
                  placeholder="Apollo / Ratnadeep pharmacy, instructions"
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
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
