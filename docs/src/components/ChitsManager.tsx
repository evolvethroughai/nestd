import React, { useState } from 'react';
import { ChitItem, ChitCalculation } from '../types';

interface ChitsManagerProps {
  chits: ChitItem[];
  onAddChit: (chit: Omit<ChitItem, 'id'>) => void;
  onUpdateChit: (id: string, updates: Partial<ChitItem>) => void;
  onDeleteChit: (id: string) => void;
  onCloseModal?: () => void;
}

export const ChitsManager: React.FC<ChitsManagerProps> = ({
  chits,
  onAddChit,
  onUpdateChit,
  onDeleteChit,
  onCloseModal,
}) => {
  // Collapsible cards state (matches chitOpenState from life-chits.js)
  const [openCards, setOpenCards] = useState<Record<string, boolean>>({
    'ch-1': true,
  });

  // Chit Calculator toggle & state
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [calcInputs, setCalcInputs] = useState({
    pot: '500000',
    monthly: '10000',
    months: '50',
    liftAt: '15',
    comm: '5000',
  });
  const [calcResult, setCalcResult] = useState<ChitCalculation | null>(null);

  // Modal states for Add, Lift, Close, Edit
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingChit, setEditingChit] = useState<ChitItem | null>(null);
  const [liftModalChit, setLiftModalChit] = useState<ChitItem | null>(null);
  const [closeModalChit, setCloseModalChit] = useState<ChitItem | null>(null);

  // Form states for Date Dropdowns (DD / MM / YYYY)
  const now = new Date();
  const currentYear = now.getFullYear();
  const [formName, setFormName] = useState('');
  const [formMonthly, setFormMonthly] = useState('');
  const [formPot, setFormPot] = useState('');
  const [formMonths, setFormMonths] = useState('');
  const [formDueDay, setFormDueDay] = useState('5');
  const [formNote, setFormNote] = useState('');
  const [formDay, setFormDay] = useState('05');
  const [formMonth, setFormMonth] = useState('05');
  const [formYear, setFormYear] = useState(String(currentYear));

  // Lift Form
  const [liftDay, setLiftDay] = useState(String(now.getDate()).padStart(2, '0'));
  const [liftMonth, setLiftMonth] = useState(String(now.getMonth() + 1).padStart(2, '0'));
  const [liftYear, setLiftYear] = useState(String(currentYear));
  const [liftComm, setLiftComm] = useState('5000');

  // Close Form
  const [closeDay, setCloseDay] = useState(String(now.getDate()).padStart(2, '0'));
  const [closeMonth, setCloseMonth] = useState(String(now.getMonth() + 1).padStart(2, '0'));
  const [closeYear, setCloseYear] = useState(String(currentYear));

  const toggleCard = (id: string) => {
    setOpenCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Run Chit Calculator (matches chitcalcrun from life-events.js)
  const handleRunCalc = () => {
    const pot = parseFloat(calcInputs.pot) || 0;
    const monthly = parseFloat(calcInputs.monthly) || 0;
    const months = parseInt(calcInputs.months) || 0;
    const liftAt = parseInt(calcInputs.liftAt) || 0;
    const comm = parseFloat(calcInputs.comm) || 0;

    if (!pot || !monthly || !months) return;

    const totalPaid = monthly * months;
    const noLiftNet = pot - totalPaid;

    let paidTillLift = 0;
    let remaining = 0;
    let received = 0;
    let netLift = 0;

    if (liftAt && liftAt <= months) {
      paidTillLift = monthly * liftAt;
      remaining = monthly * (months - liftAt);
      received = pot - comm;
      netLift = received - totalPaid;
    }

    let beMonth = 0;
    for (let bm = 1; bm <= months; bm++) {
      const r2 = pot - comm;
      const net2 = r2 - monthly * months;
      if (net2 >= 0) {
        beMonth = bm;
        break;
      }
    }

    setCalcResult({
      pot,
      monthly,
      months,
      liftAt: liftAt || undefined,
      comm: comm || undefined,
      totalPaid,
      noLiftNet,
      paidTillLift: liftAt ? paidTillLift : undefined,
      remaining: liftAt ? remaining : undefined,
      received: liftAt ? received : undefined,
      netLift: liftAt ? netLift : undefined,
      beMonth: beMonth || undefined,
    });
  };

  // Summary Metrics
  const activeChits = chits.filter((x) => x.status !== 'done');
  const completedChits = chits.filter((x) => x.status === 'done');
  const totalMonthlyOutflow = activeChits.reduce((acc, c) => acc + (c.monthlyAmt || 0), 0);
  const liftedCount = chits.filter((c) => c.lifted).length;

  const formatDateStr = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Add Chit Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formMonthly || !formPot || !formMonths) return;

    const startDate = `${formYear}-${formMonth.padStart(2, '0')}-${formDay.padStart(2, '0')}`;
    onAddChit({
      name: formName.trim(),
      monthlyAmt: parseFloat(formMonthly),
      pot: parseFloat(formPot),
      totalMonths: parseInt(formMonths),
      startDate,
      dueDay: parseInt(formDueDay) || 5,
      status: 'paying',
      note: formNote.trim(),
      lifted: false,
    });

    setIsAddModalOpen(false);
    resetForm();
  };

  // Lift Chit Submit
  const handleLiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liftModalChit) return;

    const liftedDate = `${liftYear}-${liftMonth.padStart(2, '0')}-${liftDay.padStart(2, '0')}`;
    const comm = parseFloat(liftComm) || 0;
    const amtReceived = liftModalChit.pot - comm;

    // auto-derive liftedMonth from startDate
    let liftedMonth = 1;
    if (liftModalChit.startDate) {
      const s = new Date(liftModalChit.startDate + 'T12:00:00');
      const l = new Date(liftedDate + 'T12:00:00');
      const diff = (l.getFullYear() - s.getFullYear()) * 12 + (l.getMonth() - s.getMonth());
      liftedMonth = Math.max(1, diff + 1);
    }

    onUpdateChit(liftModalChit.id, {
      lifted: true,
      liftedDate,
      liftedMonth,
      commission: comm,
      amtReceived,
    });

    setLiftModalChit(null);
  };

  // Close Chit Submit
  const handleCloseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!closeModalChit) return;

    const closedDate = `${closeYear}-${closeMonth.padStart(2, '0')}-${closeDay.padStart(2, '0')}`;
    let closedMonth = closeModalChit.totalMonths;
    if (closeModalChit.startDate) {
      const s = new Date(closeModalChit.startDate + 'T12:00:00');
      const c = new Date(closedDate + 'T12:00:00');
      const diff = (c.getFullYear() - s.getFullYear()) * 12 + (c.getMonth() - s.getMonth());
      closedMonth = Math.max(1, diff + 1);
    }

    onUpdateChit(closeModalChit.id, {
      status: 'done',
      closedDate,
      closedMonth,
    });

    setCloseModalChit(null);
  };

  const resetForm = () => {
    setFormName('');
    setFormMonthly('');
    setFormPot('');
    setFormMonths('');
    setFormDueDay('5');
    setFormNote('');
  };

  return (
    <div className="flex flex-col w-full space-y-4 pb-6 animate-fadeIn">
      {/* Summary Header */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300/40 grid grid-cols-3 gap-2 text-center shadow-xs">
        <div>
          <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
            Monthly Outflow
          </span>
          <span className="font-display font-extrabold text-base sm:text-lg text-amber-950">
            ₹{totalMonthlyOutflow.toLocaleString('en-IN')}
          </span>
        </div>
        <div>
          <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
            Active Chits
          </span>
          <span className="font-display font-extrabold text-base sm:text-lg text-amber-950">
            {activeChits.length}
          </span>
        </div>
        <div>
          <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
            Lifted
          </span>
          <span className="font-display font-extrabold text-base sm:text-lg text-amber-950">
            {liftedCount}
          </span>
        </div>
      </div>

      {/* Chit Calculator Box (matches chit-calc-box) */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden shadow-xs">
        <div
          onClick={() => setIsCalcOpen(!isCalcOpen)}
          className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-surface-container-low transition-colors select-none"
        >
          <div className="flex items-center gap-2">
            <span className="text-base">🧮</span>
            <span className="font-display text-sm font-bold text-on-surface">
              Chit Calculator (Planning & Profit)
            </span>
          </div>
          <span
            className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 text-[20px] ${
              isCalcOpen ? 'rotate-180' : ''
            }`}
          >
            keyboard_arrow_down
          </span>
        </div>

        {isCalcOpen && (
          <div className="p-4 pt-1 border-t border-outline-variant/20 space-y-3 bg-surface-container-low/40">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">
                  Pot amount (₹)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={calcInputs.pot}
                  onChange={(e) => setCalcInputs({ ...calcInputs, pot: e.target.value })}
                  placeholder="e.g. 500000"
                  className="w-full bg-surface-container-lowest px-3 py-2 rounded-xl text-xs font-semibold border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">
                  Monthly (₹)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={calcInputs.monthly}
                  onChange={(e) => setCalcInputs({ ...calcInputs, monthly: e.target.value })}
                  placeholder="e.g. 10000"
                  className="w-full bg-surface-container-lowest px-3 py-2 rounded-xl text-xs font-semibold border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">
                  Total months
                </label>
                <input
                  type="number"
                  value={calcInputs.months}
                  onChange={(e) => setCalcInputs({ ...calcInputs, months: e.target.value })}
                  placeholder="e.g. 50"
                  className="w-full bg-surface-container-lowest px-3 py-2 rounded-xl text-xs font-semibold border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">
                  Lift at month (optional)
                </label>
                <input
                  type="number"
                  value={calcInputs.liftAt}
                  onChange={(e) => setCalcInputs({ ...calcInputs, liftAt: e.target.value })}
                  placeholder="e.g. 15"
                  className="w-full bg-surface-container-lowest px-3 py-2 rounded-xl text-xs font-semibold border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-on-surface-variant block mb-1">
                Commission (₹) — optional
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={calcInputs.comm}
                onChange={(e) => setCalcInputs({ ...calcInputs, comm: e.target.value })}
                placeholder="e.g. 5000"
                className="w-full bg-surface-container-lowest px-3 py-2 rounded-xl text-xs font-semibold border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <button
              onClick={handleRunCalc}
              className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-display text-xs font-bold shadow-xs hover:bg-primary-container active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <span>📈</span>
              <span>Calculate Profit & Loss</span>
            </button>

            {/* Calculator Results (matches .chit-calc-res) */}
            {calcResult && (
              <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-2 animate-fadeIn text-xs">
                <div className="font-display font-bold text-on-surface text-[12px] flex items-center gap-1">
                  <span>📈</span> Without lifting:
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Total paid ({calcResult.months} months):</span>
                  <span className="font-bold text-on-surface">₹{calcResult.totalPaid.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Pot received:</span>
                  <span className="font-bold text-on-surface">₹{calcResult.pot.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-outline-variant/20 pt-1.5">
                  <span>Net {calcResult.noLiftNet >= 0 ? 'Profit' : 'Loss'}:</span>
                  <span className={calcResult.noLiftNet >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                    {calcResult.noLiftNet >= 0 ? '+' : '-'}₹{Math.abs(calcResult.noLiftNet).toLocaleString('en-IN')}
                  </span>
                </div>

                {calcResult.liftAt && (
                  <div className="pt-2 border-t border-outline-variant/20 space-y-1.5">
                    <div className="font-display font-bold text-emerald-800 text-[12px]">
                      ✅ If lifted at month {calcResult.liftAt}:
                    </div>
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Paid till lift:</span>
                      <span className="font-bold">₹{(calcResult.paidTillLift || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Still to pay:</span>
                      <span className="font-bold">₹{(calcResult.remaining || 0).toLocaleString('en-IN')}</span>
                    </div>
                    {calcResult.comm && (
                      <div className="flex justify-between text-rose-600">
                        <span>Commission:</span>
                        <span>-₹{calcResult.comm.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold border-t border-outline-variant/20 pt-1">
                      <span>Net {calcResult.netLift && calcResult.netLift >= 0 ? 'Profit' : 'Loss'}:</span>
                      <span className={calcResult.netLift && calcResult.netLift >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                        {calcResult.netLift && calcResult.netLift >= 0 ? '+' : '-'}₹
                        {Math.abs(calcResult.netLift || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                )}

                {calcResult.beMonth && (
                  <div className="pt-2 text-[11px] font-bold text-primary flex items-center gap-1 border-t border-outline-variant/20">
                    <span>💡</span> Break-even if lifted at Month {calcResult.beMonth} or later
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chit Cards List */}
      <div className="space-y-3">
        {chits.map((item) => {
          const startDate = item.startDate ? new Date(item.startDate + 'T12:00:00') : null;
          const totalMonths = item.totalMonths || 0;
          const monthlyAmt = item.monthlyAmt || 0;
          const pot = item.pot || 0;

          // Derivation of months done
          let monthsDone = 0;
          if (startDate && totalMonths) {
            let diff = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
            if (now.getDate() < startDate.getDate()) diff--;
            monthsDone = Math.max(0, Math.min(diff + 1, totalMonths));
          }

          const paidSoFar = monthsDone * monthlyAmt;
          const progressPct = totalMonths ? Math.round((monthsDone / totalMonths) * 100) : 0;

          let endDate = null;
          if (startDate && totalMonths) {
            endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + totalMonths - 1);
          }

          // Due day check
          const dueDay = item.dueDay || 0;
          let dueBadge = '';
          if (dueDay && item.status !== 'done') {
            let dueThisMonth = new Date(now.getFullYear(), now.getMonth(), dueDay);
            let daysLeft = Math.round((dueThisMonth.getTime() - now.getTime()) / 864e5);
            if (daysLeft < 0) {
              dueThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, dueDay);
              daysLeft = Math.round((dueThisMonth.getTime() - now.getTime()) / 864e5);
            }
            dueBadge =
              daysLeft === 0
                ? 'Due today'
                : daysLeft === 1
                ? 'Due tomorrow'
                : `Due ${dueThisMonth.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
          }

          const isOpen = openCards[item.id] ?? false;
          const effectiveMonths = item.closedMonth || totalMonths;
          const remainingTillClose = Math.max(0, effectiveMonths - monthsDone);
          const totalCost = effectiveMonths * monthlyAmt;

          // Profit calculation for lifted
          const amtRec = item.amtReceived || 0;
          const netLifted = amtRec - totalCost;
          const isLiftedProfit = netLifted >= 0;

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-yellow-300/60 bg-gradient-to-br from-[#fffdf0] to-[#fef9c3] shadow-xs overflow-hidden"
            >
              {/* Card Header (Collapsible trigger) */}
              <div
                onClick={() => toggleCard(item.id)}
                className="p-3.5 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">🤝</span>
                    <h4 className="font-display font-extrabold text-sm text-yellow-950 truncate">
                      {item.name}
                    </h4>
                  </div>
                  {dueBadge && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-white/90 border border-yellow-300 text-[10px] font-bold text-yellow-900">
                      📅 {dueBadge}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === 'done'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.lifted
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-yellow-200 text-yellow-900'
                    }`}
                  >
                    {item.status === 'done'
                      ? '✓ Done'
                      : item.lifted
                      ? '✅ Lifted'
                      : '💰 Paying'}
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-yellow-700">
                    {isOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              {isOpen && (
                <div className="p-3.5 pt-0 space-y-3 text-xs border-t border-yellow-200/50">
                  {/* 3 Metric Pills */}
                  <div className="grid grid-cols-3 gap-2 text-center pt-2">
                    <div className="p-2 rounded-xl bg-white/80 border border-yellow-200">
                      <span className="font-display font-bold text-xs text-yellow-950 block">
                        ₹{monthlyAmt.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-yellow-800">Monthly</span>
                    </div>

                    <div className="p-2 rounded-xl bg-white/80 border border-yellow-200">
                      <span className="font-display font-bold text-xs text-yellow-950 block">
                        ₹{pot.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-yellow-800">Total Pot</span>
                    </div>

                    <div className="p-2 rounded-xl bg-white/80 border border-yellow-200">
                      <span className="font-display font-bold text-xs text-yellow-950 block">
                        {monthsDone}/{totalMonths}
                      </span>
                      <span className="text-[10px] text-yellow-800">Months</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full h-2 rounded-full bg-yellow-200 overflow-hidden">
                      <div
                        className="h-full bg-amber-600 transition-all duration-500 rounded-full"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-yellow-900 font-semibold">
                      <span>₹{paidSoFar.toLocaleString('en-IN')} paid</span>
                      <span>{endDate ? `Ends ${formatDateStr(endDate.toISOString().slice(0, 10))}` : ''}</span>
                    </div>
                    <div className="text-[10px] text-yellow-800/80 space-y-0.5 pt-0.5">
                      {startDate && <div>🗓️ Start: {formatDateStr(item.startDate)}</div>}
                      {endDate && <div>⏳ End: &nbsp;{formatDateStr(endDate.toISOString().slice(0, 10))}</div>}
                    </div>
                  </div>

                  {/* Lifted Details Box */}
                  {item.lifted && (
                    <div className="p-3 rounded-xl bg-white/90 border border-yellow-300 space-y-1.5">
                      <div
                        onClick={() => {
                          setLiftModalChit(item);
                          setLiftComm(String(item.commission || 5000));
                        }}
                        className="flex justify-between items-center cursor-pointer hover:text-amber-800 font-semibold"
                        title="Click to edit lifted date or commission"
                      >
                        <span>Lifted on:</span>
                        <span className="text-amber-900 font-bold underline flex items-center gap-1">
                          {formatDateStr(item.liftedDate)} ✎
                        </span>
                      </div>
                      <div className="flex justify-between text-rose-600">
                        <span>Commission cut:</span>
                        <span className="font-bold">-₹{(item.commission || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-emerald-800 font-bold">
                        <span>Amount received:</span>
                        <span>₹{(item.amtReceived || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  )}

                  {/* Net Profit / Loss Outcome Box */}
                  {item.lifted ? (
                    <div
                      className={`p-3 rounded-xl border space-y-1 ${
                        isLiftedProfit
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                          : 'bg-rose-50 border-rose-200 text-rose-950'
                      }`}
                    >
                      <div className="flex justify-between">
                        <span>Total to pay ({effectiveMonths} mo):</span>
                        <span className="font-bold">
                          ₹{totalCost.toLocaleString('en-IN')}{' '}
                          <span className="text-[10px] font-normal">
                            ({remainingTillClose > 0 ? `${remainingTillClose} mo left` : 'Fully paid'})
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between font-bold border-t border-black/5 pt-1">
                        <span>{isLiftedProfit ? '✅ Net Profit' : '🔴 Net Loss'}:</span>
                        <span className={isLiftedProfit ? 'text-emerald-700' : 'text-rose-600'}>
                          {isLiftedProfit ? '+' : '-'}₹{Math.abs(netLifted).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ) : item.status === 'done' ? (
                    <div className="p-3 rounded-xl bg-white/90 border border-emerald-200 text-emerald-900 space-y-1">
                      <div className="flex justify-between">
                        <span>Closed on:</span>
                        <span className="font-bold">{formatDateStr(item.closedDate)}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Net Profit:</span>
                        <span>+₹{(pot - totalCost).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-white/80 border border-yellow-200 flex justify-between text-yellow-900">
                      <span>Projected if not lifted:</span>
                      <span className="font-bold text-emerald-800">
                        {pot - totalCost >= 0 ? '+' : '-'}₹{Math.abs(pot - totalCost).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}

                  {/* Note */}
                  {item.note && (
                    <div className="text-[11px] text-yellow-900/80 italic">{item.note}</div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-1">
                    {!item.lifted && item.status !== 'done' && (
                      <button
                        onClick={() => {
                          setLiftModalChit(item);
                          setLiftComm('5000');
                        }}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-amber-600 text-white font-bold text-xs shadow-2xs hover:bg-amber-700 active:scale-95 transition-all"
                      >
                        ✅ Lift
                      </button>
                    )}
                    {item.status !== 'done' && (
                      <button
                        onClick={() => setCloseModalChit(item)}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-slate-700 text-white font-bold text-xs shadow-2xs hover:bg-slate-800 active:scale-95 transition-all"
                      >
                        🔒 Close
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingChit(item);
                        setFormName(item.name);
                        setFormMonthly(String(item.monthlyAmt));
                        setFormPot(String(item.pot));
                        setFormMonths(String(item.totalMonths));
                        setFormDueDay(String(item.dueDay));
                        setFormNote(item.note || '');
                        if (item.startDate) {
                          const parts = item.startDate.split('-');
                          setFormYear(parts[0]);
                          setFormMonth(parts[1]);
                          setFormDay(parts[2]);
                        }
                      }}
                      className="w-8 h-8 rounded-xl bg-white border border-yellow-300 text-yellow-900 hover:bg-yellow-50 flex items-center justify-center transition-all"
                      title="Edit chit"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => onDeleteChit(item.id)}
                      className="w-8 h-8 rounded-xl bg-white border border-rose-300 text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all"
                      title="Delete chit"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add New Chit Button */}
      <button
        onClick={() => {
          resetForm();
          setIsAddModalOpen(true);
        }}
        className="w-full py-3 rounded-2xl bg-primary text-on-primary font-display text-xs font-bold shadow-xs hover:bg-primary-container active:scale-95 transition-all flex items-center justify-center gap-1.5"
      >
        <span className="material-symbols-outlined text-[18px]">add</span>
        <span>+ Add Chit Fund</span>
      </button>

      {/* ADD / EDIT CHIT MODAL (With DD/MM/YYYY selects) */}
      {(isAddModalOpen || editingChit) && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 border border-outline-variant/30 shadow-2xl relative">
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingChit(null);
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center"
            >
              ✕
            </button>

            <h3 className="font-display font-extrabold text-lg text-on-surface mb-3">
              {editingChit ? 'Edit Chit Fund' : 'Add New Chit Fund'}
            </h3>

            <form
              onSubmit={(e) => {
                if (editingChit) {
                  e.preventDefault();
                  const startDate = `${formYear}-${formMonth.padStart(2, '0')}-${formDay.padStart(2, '0')}`;
                  onUpdateChit(editingChit.id, {
                    name: formName.trim(),
                    monthlyAmt: parseFloat(formMonthly),
                    pot: parseFloat(formPot),
                    totalMonths: parseInt(formMonths),
                    startDate,
                    dueDay: parseInt(formDueDay) || 5,
                    note: formNote.trim(),
                  });
                  setEditingChit(null);
                } else {
                  handleAddSubmit(e);
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-on-surface block mb-1">Chit Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Shriram 15K"
                  className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/30"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-on-surface block mb-1">Monthly (₹)</label>
                  <input
                    type="number"
                    value={formMonthly}
                    onChange={(e) => setFormMonthly(e.target.value)}
                    placeholder="15000"
                    className="w-full bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/30"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-on-surface block mb-1">Total Pot (₹)</label>
                  <input
                    type="number"
                    value={formPot}
                    onChange={(e) => setFormPot(e.target.value)}
                    placeholder="450000"
                    className="w-full bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/30"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-on-surface block mb-1">Total Months</label>
                  <input
                    type="number"
                    value={formMonths}
                    onChange={(e) => setFormMonths(e.target.value)}
                    placeholder="30"
                    className="w-full bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/30"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-on-surface block mb-1">Due Day of Month</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formDueDay}
                    onChange={(e) => setFormDueDay(e.target.value)}
                    placeholder="5"
                    className="w-full bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/30"
                  />
                </div>
              </div>

              {/* Start Date 3-Select Dropdown (DD / MM / YYYY) */}
              <div>
                <label className="font-bold text-on-surface block mb-1">Start Date</label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={formDay}
                    onChange={(e) => setFormDay(e.target.value)}
                    className="bg-surface-container-low px-2 py-2 rounded-xl border border-outline-variant/30 font-semibold"
                  >
                    {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>

                  <select
                    value={formMonth}
                    onChange={(e) => setFormMonth(e.target.value)}
                    className="bg-surface-container-low px-2 py-2 rounded-xl border border-outline-variant/30 font-semibold"
                  >
                    {[
                      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
                    ].map((m, idx) => (
                      <option key={m} value={String(idx + 1).padStart(2, '0')}>
                        {m}
                      </option>
                    ))}
                  </select>

                  <select
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    className="bg-surface-container-low px-2 py-2 rounded-xl border border-outline-variant/30 font-semibold"
                  >
                    {[currentYear - 3, currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((y) => (
                      <option key={y} value={String(y)}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-on-surface block mb-1">Note (Optional)</label>
                <input
                  type="text"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="e.g. Shriram Chits Jubilee Hills"
                  className="w-full bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/30"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-primary text-on-primary font-display font-bold text-xs shadow-xs hover:bg-primary-container transition-all"
              >
                {editingChit ? 'Update Chit' : 'Save Chit'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* LIFT CHIT MODAL */}
      {liftModalChit && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl w-full max-w-sm p-5 border border-outline-variant/30 shadow-2xl relative">
            <button
              onClick={() => setLiftModalChit(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center"
            >
              ✕
            </button>

            <h3 className="font-display font-extrabold text-base text-on-surface mb-1">
              Lift Chit: {liftModalChit.name}
            </h3>
            <p className="text-xs text-on-surface-variant mb-3">
              Record lifted date and commission deduction
            </p>

            <form onSubmit={handleLiftSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-on-surface block mb-1">Lifted Date (DD / MM / YYYY)</label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={liftDay}
                    onChange={(e) => setLiftDay(e.target.value)}
                    className="bg-surface-container-low px-2 py-2 rounded-xl border border-outline-variant/30"
                  >
                    {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <select
                    value={liftMonth}
                    onChange={(e) => setLiftMonth(e.target.value)}
                    className="bg-surface-container-low px-2 py-2 rounded-xl border border-outline-variant/30"
                  >
                    {[
                      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
                    ].map((m, idx) => (
                      <option key={m} value={String(idx + 1).padStart(2, '0')}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <select
                    value={liftYear}
                    onChange={(e) => setLiftYear(e.target.value)}
                    className="bg-surface-container-low px-2 py-2 rounded-xl border border-outline-variant/30"
                  >
                    {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((y) => (
                      <option key={y} value={String(y)}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-on-surface block mb-1">Commission Cut (₹)</label>
                <input
                  type="number"
                  value={liftComm}
                  onChange={(e) => setLiftComm(e.target.value)}
                  placeholder="5000"
                  className="w-full bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/30"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                <div className="flex justify-between font-bold">
                  <span>Net Amount Received:</span>
                  <span>₹{(liftModalChit.pot - (parseFloat(liftComm) || 0)).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-amber-600 text-white font-display font-bold text-xs shadow-xs hover:bg-amber-700 transition-all"
              >
                Confirm Lifted
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CLOSE CHIT MODAL */}
      {closeModalChit && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl w-full max-w-sm p-5 border border-outline-variant/30 shadow-2xl relative">
            <button
              onClick={() => setCloseModalChit(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center"
            >
              ✕
            </button>

            <h3 className="font-display font-extrabold text-base text-on-surface mb-1">
              Mark Chit Completed: {closeModalChit.name}
            </h3>
            <p className="text-xs text-on-surface-variant mb-3">
              Set closing date and archive this chit fund
            </p>

            <form onSubmit={handleCloseSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-on-surface block mb-1">Closed Date (DD / MM / YYYY)</label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={closeDay}
                    onChange={(e) => setCloseDay(e.target.value)}
                    className="bg-surface-container-low px-2 py-2 rounded-xl border border-outline-variant/30"
                  >
                    {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <select
                    value={closeMonth}
                    onChange={(e) => setCloseMonth(e.target.value)}
                    className="bg-surface-container-low px-2 py-2 rounded-xl border border-outline-variant/30"
                  >
                    {[
                      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
                    ].map((m, idx) => (
                      <option key={m} value={String(idx + 1).padStart(2, '0')}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <select
                    value={closeYear}
                    onChange={(e) => setCloseYear(e.target.value)}
                    className="bg-surface-container-low px-2 py-2 rounded-xl border border-outline-variant/30"
                  >
                    {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((y) => (
                      <option key={y} value={String(y)}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-slate-800 text-white font-display font-bold text-xs shadow-xs hover:bg-slate-900 transition-all"
              >
                Mark Closed & Archive
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
