import React, { useState } from 'react';
import { EmiLoanItem } from '../types';

interface EmisManagerProps {
  emis: EmiLoanItem[];
  onAddEmi: (loan: Omit<EmiLoanItem, 'id' | 'partPayments'>) => void;
  onUpdateEmi: (id: string, updates: Partial<EmiLoanItem>) => void;
  onDeleteEmi: (id: string) => void;
  onAddPartPayment: (loanId: string, amt: number, date: string) => void;
  onDeletePartPayment: (loanId: string, partId: string) => void;
  onCloseModal?: () => void;
}

export const EmisManager: React.FC<EmisManagerProps> = ({
  emis,
  onAddEmi,
  onUpdateEmi,
  onDeleteEmi,
  onAddPartPayment,
  onDeletePartPayment,
}) => {
  const [openCards, setOpenCards] = useState<Record<string, boolean>>({
    'em-1': true,
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmi, setEditingEmi] = useState<EmiLoanItem | null>(null);
  const [partPaymentEmi, setPartPaymentEmi] = useState<EmiLoanItem | null>(null);

  const now = new Date();
  const currentYear = now.getFullYear();

  // Add / Edit form states
  const [formName, setFormName] = useState('');
  const [formLoanAmt, setFormLoanAmt] = useState('');
  const [formInterestRate, setFormInterestRate] = useState('');
  const [formTenure, setFormTenure] = useState('');
  const [formEmiAmt, setFormEmiAmt] = useState('');
  const [formDueDay, setFormDueDay] = useState('10');
  const [formNote, setFormNote] = useState('');
  const [formDay, setFormDay] = useState('10');
  const [formMonth, setFormMonth] = useState('03');
  const [formYear, setFormYear] = useState('2022');

  // Part payment form states
  const [partAmt, setPartAmt] = useState('');
  const [partDay, setPartDay] = useState(String(now.getDate()).padStart(2, '0'));
  const [partMonth, setPartMonth] = useState(String(now.getMonth() + 1).padStart(2, '0'));
  const [partYear, setPartYear] = useState(String(currentYear));

  const toggleCard = (id: string) => {
    setOpenCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // EMI calculation matching docs/js/life-emis.js
  const calcEmi = (principal: number, annualRate: number, months: number) => {
    if (!principal || !annualRate || !months) return 0;
    const r = annualRate / (12 * 100);
    return Math.round((principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1));
  };

  const getLoanSummary = (item: EmiLoanItem) => {
    const principal = item.loanAmt || 0;
    const rate = item.interestRate || 0;
    const tenure = item.tenureMonths || 0;
    const emiAmt = item.emiAmt || calcEmi(principal, rate, tenure);
    const totalPayable = emiAmt * tenure;
    const totalInterest = totalPayable - principal;
    return { principal, rate, tenure, emiAmt, totalPayable, totalInterest };
  };

  const activeLoans = emis.filter((x) => x.status !== 'closed');
  const totalMonthlyEmi = activeLoans.reduce((s, x) => s + getLoanSummary(x).emiAmt, 0);

  const formatDateStr = (dateStr?: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formLoanAmt || !formInterestRate || !formTenure) return;

    const principal = parseFloat(formLoanAmt);
    const rate = parseFloat(formInterestRate);
    const tenure = parseInt(formTenure);
    const emi = formEmiAmt ? parseFloat(formEmiAmt) : calcEmi(principal, rate, tenure);
    const startDate = `${formYear}-${formMonth.padStart(2, '0')}-${formDay.padStart(2, '0')}`;

    onAddEmi({
      name: formName.trim(),
      loanAmt: principal,
      interestRate: rate,
      tenureMonths: tenure,
      emiAmt: emi,
      startDate,
      dueDay: parseInt(formDueDay) || 10,
      note: formNote.trim(),
      status: 'active',
    });

    setIsAddModalOpen(false);
    resetForm();
  };

  const handlePartPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partPaymentEmi || !partAmt) return;

    const date = `${partYear}-${partMonth.padStart(2, '0')}-${partDay.padStart(2, '0')}`;
    onAddPartPayment(partPaymentEmi.id, parseFloat(partAmt), date);
    setPartPaymentEmi(null);
    setPartAmt('');
  };

  const resetForm = () => {
    setFormName('');
    setFormLoanAmt('');
    setFormInterestRate('');
    setFormTenure('');
    setFormEmiAmt('');
    setFormDueDay('10');
    setFormNote('');
  };

  return (
    <div className="flex flex-col w-full space-y-4 pb-6 animate-fadeIn">
      {/* Summary Header */}
      <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-300/40 grid grid-cols-3 gap-2 text-center shadow-xs">
        <div>
          <span className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider block">
            Monthly EMI
          </span>
          <span className="font-display font-extrabold text-base sm:text-lg text-teal-950">
            ₹{totalMonthlyEmi.toLocaleString('en-IN')}
          </span>
        </div>
        <div>
          <span className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider block">
            Active Loans
          </span>
          <span className="font-display font-extrabold text-base sm:text-lg text-teal-950">
            {activeLoans.length}
          </span>
        </div>
        <div>
          <span className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider block">
            Total Loans
          </span>
          <span className="font-display font-extrabold text-base sm:text-lg text-teal-950">
            {emis.length}
          </span>
        </div>
      </div>

      {/* Loans List */}
      <div className="space-y-3">
        {emis.map((item) => {
          const s = getLoanSummary(item);
          const startDate = item.startDate ? new Date(item.startDate + 'T12:00:00') : null;

          // Derivation of months done
          let monthsDone = 0;
          if (startDate) {
            let diff = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
            if (now.getDate() < startDate.getDate()) diff--;
            monthsDone = Math.max(0, Math.min(diff + 1, s.tenure));
          }

          // Part payments effect
          const partPayments = item.partPayments || [];
          const totalPartPaid = partPayments.reduce((a, p) => a + (p.amt || 0), 0);

          // Standard amortization calculation
          const r = s.rate / (12 * 100);
          let remainingPrincipal = s.principal;
          if (r > 0 && s.emiAmt > 0) {
            for (let m = 0; m < monthsDone; m++) {
              const interestForMonth = remainingPrincipal * r;
              const principalForMonth = s.emiAmt - interestForMonth;
              remainingPrincipal = Math.max(0, remainingPrincipal - principalForMonth);
            }
          }
          remainingPrincipal = Math.round(remainingPrincipal);

          const remainingAfterPart = Math.max(0, remainingPrincipal - totalPartPaid);

          // Revised tenure after part payments
          let revisedMonthsLeft = 0;
          if (s.emiAmt > 0 && remainingAfterPart > 0) {
            if (r > 0) {
              revisedMonthsLeft = Math.ceil(
                Math.log(s.emiAmt / (s.emiAmt - remainingAfterPart * r)) / Math.log(1 + r)
              );
            } else {
              revisedMonthsLeft = Math.ceil(remainingAfterPart / s.emiAmt);
            }
          }

          const monthsSaved = Math.max(0, s.tenure - monthsDone - revisedMonthsLeft);

          let closureDate = null;
          if (startDate && s.tenure) {
            closureDate = new Date(startDate);
            closureDate.setMonth(closureDate.getMonth() + s.tenure - 1);
          }

          let revisedClosureDate = null;
          if (startDate && revisedMonthsLeft) {
            revisedClosureDate = new Date(now);
            revisedClosureDate.setMonth(revisedClosureDate.getMonth() + revisedMonthsLeft);
          }

          const principalPaid = Math.min(s.principal, s.principal - remainingPrincipal);
          const interestPaid = Math.max(0, monthsDone * s.emiAmt - principalPaid);
          const progressPct = s.tenure ? Math.round((monthsDone / s.tenure) * 100) : 0;

          // Due badge
          const dueDay = item.dueDay || 0;
          let dueBadge = '';
          if (dueDay && item.status !== 'closed') {
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

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-teal-300/60 bg-gradient-to-br from-[#f0fdfa] to-[#ccfbf1] shadow-xs overflow-hidden"
            >
              {/* Card Header (Collapsible trigger) */}
              <div
                onClick={() => toggleCard(item.id)}
                className="p-3.5 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">🏡</span>
                    <h4 className="font-display font-extrabold text-sm text-teal-950 truncate">
                      {item.name}
                    </h4>
                  </div>
                  {dueBadge && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-white/90 border border-teal-200 text-[10px] font-bold text-teal-900">
                      📅 {dueBadge}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === 'closed'
                        ? 'bg-slate-200 text-slate-800'
                        : 'bg-teal-200 text-teal-900'
                    }`}
                  >
                    {item.status === 'closed' ? '✓ Closed' : '💰 Active'}
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-teal-700">
                    {isOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              {isOpen && (
                <div className="p-3.5 pt-0 space-y-3 text-xs border-t border-teal-200/50">
                  {/* 3 Metric Pills */}
                  <div className="grid grid-cols-3 gap-2 text-center pt-2">
                    <div className="p-2 rounded-xl bg-white/80 border border-teal-200">
                      <span className="font-display font-bold text-xs text-teal-950 block">
                        ₹{s.emiAmt.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-teal-800">EMI / month</span>
                    </div>

                    <div className="p-2 rounded-xl bg-white/80 border border-teal-200">
                      <span className="font-display font-bold text-xs text-teal-950 block">
                        {monthsDone}/{s.tenure}
                      </span>
                      <span className="text-[10px] text-teal-800">Months done</span>
                    </div>

                    <div className="p-2 rounded-xl bg-white/80 border border-teal-200">
                      <span className="font-display font-bold text-xs text-teal-950 block">
                        {Math.max(0, s.tenure - monthsDone)}
                      </span>
                      <span className="text-[10px] text-teal-800">Months left</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full h-2 rounded-full bg-teal-200 overflow-hidden">
                      <div
                        className="h-full bg-teal-600 transition-all duration-500 rounded-full"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-teal-900 font-semibold">
                      <span>{progressPct}% paid</span>
                      <span>{closureDate ? `Closes ${formatDateStr(closureDate.toISOString().slice(0, 10))}` : ''}</span>
                    </div>
                    <div className="text-[10px] text-teal-800/80 space-y-0.5 pt-0.5">
                      {startDate && <div>🗓️ Start: {formatDateStr(item.startDate)}</div>}
                      {closureDate && <div>⏳ End: &nbsp;{formatDateStr(closureDate.toISOString().slice(0, 10))}</div>}
                    </div>
                  </div>

                  {/* Loan Breakdown Box */}
                  <div className="p-3 rounded-xl bg-white/90 border border-teal-200 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-teal-900">Loan amount:</span>
                      <span className="font-bold">₹{s.principal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-teal-900">Interest rate:</span>
                      <span className="font-bold">{s.rate}% p.a.</span>
                    </div>
                    <div className="flex justify-between text-emerald-700">
                      <span>Principal paid so far:</span>
                      <span className="font-bold">₹{principalPaid.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-rose-600">
                      <span>Interest paid so far:</span>
                      <span className="font-bold">₹{Math.round(interestPaid).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between border-t border-teal-100 pt-1 font-bold">
                      <span>Remaining principal:</span>
                      <span>₹{remainingPrincipal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Extra Interest Box */}
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 space-y-1">
                    <div className="flex justify-between">
                      <span>Total payable ({s.tenure} months):</span>
                      <span className="font-bold">₹{s.totalPayable.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between font-bold text-rose-600 border-t border-rose-100 pt-1">
                      <span>Extra interest over loan life:</span>
                      <span>₹{Math.round(s.totalInterest).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Part Payments Box */}
                  {partPayments.length > 0 && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 block">
                        Part Payments History
                      </span>
                      {partPayments.map((p) => (
                        <div key={p.id} className="flex justify-between items-center text-xs">
                          <span>{formatDateStr(p.date)}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-emerald-700">₹{p.amt.toLocaleString('en-IN')}</span>
                            <button
                              onClick={() => onDeletePartPayment(item.id, p.id)}
                              className="text-rose-600 hover:text-rose-800 text-[14px]"
                              title="Delete part payment"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between font-bold border-t border-emerald-200 pt-1">
                        <span>Total part paid:</span>
                        <span>₹{totalPartPaid.toLocaleString('en-IN')}</span>
                      </div>
                      {monthsSaved > 0 && (
                        <div className="flex justify-between font-bold text-emerald-700">
                          <span>✅ Months saved:</span>
                          <span>{monthsSaved} months</span>
                        </div>
                      )}
                      {revisedClosureDate && (
                        <div className="flex justify-between text-emerald-800">
                          <span>Revised closure:</span>
                          <span className="font-bold">{formatDateStr(revisedClosureDate.toISOString().slice(0, 10))}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Note */}
                  {item.note && (
                    <div className="text-[11px] text-teal-900/80 italic">{item.note}</div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-1">
                    {item.status !== 'closed' && (
                      <button
                        onClick={() => setPartPaymentEmi(item)}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-2xs hover:bg-teal-700 active:scale-95 transition-all"
                      >
                        + Part payment
                      </button>
                    )}
                    {item.status !== 'closed' && (
                      <button
                        onClick={() => onUpdateEmi(item.id, { status: 'closed' })}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-slate-700 text-white font-bold text-xs shadow-2xs hover:bg-slate-800 active:scale-95 transition-all"
                      >
                        🔒 Close loan
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingEmi(item);
                        setFormName(item.name);
                        setFormLoanAmt(String(item.loanAmt));
                        setFormInterestRate(String(item.interestRate));
                        setFormTenure(String(item.tenureMonths));
                        setFormEmiAmt(String(item.emiAmt || ''));
                        setFormDueDay(String(item.dueDay || '10'));
                        setFormNote(item.note || '');
                        if (item.startDate) {
                          const parts = item.startDate.split('-');
                          setFormYear(parts[0]);
                          setFormMonth(parts[1]);
                          setFormDay(parts[2]);
                        }
                      }}
                      className="w-8 h-8 rounded-xl bg-white border border-teal-300 text-teal-900 hover:bg-teal-50 flex items-center justify-center transition-all"
                      title="Edit loan"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => onDeleteEmi(item.id)}
                      className="w-8 h-8 rounded-xl bg-white border border-rose-300 text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all"
                      title="Delete loan"
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

      {/* Add New Loan Button */}
      <button
        onClick={() => {
          resetForm();
          setIsAddModalOpen(true);
        }}
        className="w-full py-3 rounded-2xl bg-teal-600 text-white font-display text-xs font-bold shadow-xs hover:bg-teal-700 active:scale-95 transition-all flex items-center justify-center gap-1.5"
      >
        <span className="material-symbols-outlined text-[18px]">add</span>
        <span>+ Add Loan / EMI</span>
      </button>

      {/* ADD / EDIT LOAN MODAL */}
      {(isAddModalOpen || editingEmi) && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 border border-outline-variant/30 shadow-2xl relative">
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingEmi(null);
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center"
            >
              ✕
            </button>

            <h3 className="font-display font-extrabold text-lg text-on-surface mb-3">
              {editingEmi ? 'Edit Loan / EMI' : 'Add Loan / EMI'}
            </h3>

            <form
              onSubmit={(e) => {
                if (editingEmi) {
                  e.preventDefault();
                  const principal = parseFloat(formLoanAmt);
                  const rate = parseFloat(formInterestRate);
                  const tenure = parseInt(formTenure);
                  const emi = formEmiAmt ? parseFloat(formEmiAmt) : calcEmi(principal, rate, tenure);
                  const startDate = `${formYear}-${formMonth.padStart(2, '0')}-${formDay.padStart(2, '0')}`;
                  onUpdateEmi(editingEmi.id, {
                    name: formName.trim(),
                    loanAmt: principal,
                    interestRate: rate,
                    tenureMonths: tenure,
                    emiAmt: emi,
                    startDate,
                    dueDay: parseInt(formDueDay) || 10,
                    note: formNote.trim(),
                  });
                  setEditingEmi(null);
                } else {
                  handleAddSubmit(e);
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-on-surface block mb-1">Loan Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. SBI Maxgain Home Loan"
                  className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/30"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-on-surface block mb-1">Loan Amount (₹)</label>
                  <input
                    type="number"
                    value={formLoanAmt}
                    onChange={(e) => setFormLoanAmt(e.target.value)}
                    placeholder="2500000"
                    className="w-full bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/30"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-on-surface block mb-1">Interest Rate (% p.a.)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={formInterestRate}
                    onChange={(e) => setFormInterestRate(e.target.value)}
                    placeholder="8.5"
                    className="w-full bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/30"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-on-surface block mb-1">Tenure (months)</label>
                  <input
                    type="number"
                    value={formTenure}
                    onChange={(e) => setFormTenure(e.target.value)}
                    placeholder="240"
                    className="w-full bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/30"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-on-surface block mb-1">
                    EMI (₹) <span className="font-normal text-on-surface-variant">(auto)</span>
                  </label>
                  <input
                    type="number"
                    value={formEmiAmt}
                    onChange={(e) => setFormEmiAmt(e.target.value)}
                    placeholder="Leave blank for auto"
                    className="w-full bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/30"
                  />
                </div>
              </div>

              {/* Start Date 3-Select Dropdown */}
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
                    {Array.from({ length: 15 }, (_, i) => currentYear - 10 + i).map((y) => (
                      <option key={y} value={String(y)}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-on-surface block mb-1">Monthly Due Day</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formDueDay}
                    onChange={(e) => setFormDueDay(e.target.value)}
                    placeholder="10"
                    className="w-full bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/30"
                  />
                </div>
                <div>
                  <label className="font-bold text-on-surface block mb-1">Note (Optional)</label>
                  <input
                    type="text"
                    value={formNote}
                    onChange={(e) => setFormNote(e.target.value)}
                    placeholder="e.g. SBI Maxgain OD"
                    className="w-full bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/30"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-teal-600 text-white font-display font-bold text-xs shadow-xs hover:bg-teal-700 transition-all"
              >
                {editingEmi ? 'Update Loan' : 'Save Loan'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PART PAYMENT MODAL */}
      {partPaymentEmi && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl w-full max-w-sm p-5 border border-outline-variant/30 shadow-2xl relative">
            <button
              onClick={() => setPartPaymentEmi(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center"
            >
              ✕
            </button>

            <h3 className="font-display font-extrabold text-base text-on-surface mb-1">
              Part Payment: {partPaymentEmi.name}
            </h3>
            <p className="text-xs text-on-surface-variant mb-3">
              Add lump sum reduction to save interest & reduce tenure
            </p>

            <form onSubmit={handlePartPaymentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-on-surface block mb-1">Amount Paid (₹)</label>
                <input
                  type="number"
                  value={partAmt}
                  onChange={(e) => setPartAmt(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/30"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="font-bold text-on-surface block mb-1">Date of Payment</label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={partDay}
                    onChange={(e) => setPartDay(e.target.value)}
                    className="bg-surface-container-low px-2 py-2 rounded-xl border border-outline-variant/30"
                  >
                    {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <select
                    value={partMonth}
                    onChange={(e) => setPartMonth(e.target.value)}
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
                    value={partYear}
                    onChange={(e) => setPartYear(e.target.value)}
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
                className="w-full py-3 rounded-2xl bg-teal-600 text-white font-display font-bold text-xs shadow-xs hover:bg-teal-700 transition-all"
              >
                Save Part Payment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
