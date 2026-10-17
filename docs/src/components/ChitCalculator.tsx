import { useState } from 'react';

export interface ChitPlanInput {
  pot: string;
  monthly: string;
  months: string;
  liftAt: string;
  discount: string;
  fees: string;
  afterLift: string;
  credits: string;
}

export function calculateChitPlan(input: ChitPlanInput) {
  const number = (value: string) => Number(value.replace(/,/g, '').trim());
  const pot = number(input.pot);
  const monthly = number(input.monthly);
  const months = number(input.months);
  const liftAt = input.liftAt.trim() ? number(input.liftAt) : months;
  const discount = number(input.discount);
  const fees = number(input.fees);
  const afterLift = input.afterLift.trim() ? number(input.afterLift) : monthly;
  const credits = number(input.credits);
  if (!input.pot.trim() || !input.monthly.trim() || !input.months.trim()) throw new Error('Enter the pot amount, monthly payment and total months.');
  if (![pot, monthly, months, liftAt, discount, fees, afterLift, credits].every(Number.isFinite)) throw new Error('Enter valid numbers. Commas are allowed in amounts.');
  if (pot <= 0 || monthly <= 0 || afterLift < 0 || discount < 0 || fees < 0 || credits < 0) throw new Error('Amounts must be positive; optional deductions and credits can be zero.');
  if (!Number.isInteger(months) || months < 1 || !Number.isInteger(liftAt) || liftAt < 1 || liftAt > months) throw new Error('Use whole months, with the lift month between 1 and the total months.');
  if (discount + fees > pot) throw new Error('Auction deduction and extra charges cannot exceed the pot amount.');
  const paidTillLift = monthly * liftAt;
  const remaining = afterLift * (months - liftAt);
  const grossPayments = paidTillLift + remaining;
  if (credits > grossPayments) throw new Error('Separate credits cannot exceed the total instalments.');
  const totalPaid = grossPayments - credits;
  const received = pot - discount - fees;
  return { pot, months, liftAt, discount, fees, credits, paidTillLift, remaining, totalPaid, received, net: received - totalPaid };
}

const EMPTY_INPUT: ChitPlanInput = { pot: '', monthly: '', months: '', liftAt: '', discount: '', fees: '', afterLift: '', credits: '' };
const money = (amount: number) => `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export function ChitCalculator() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState<ChitPlanInput>(EMPTY_INPUT);
  const [result, setResult] = useState<ReturnType<typeof calculateChitPlan> | null>(null);
  const [error, setError] = useState('');
  const fields: { key: keyof ChitPlanInput; label: string; example: string; hint?: string }[] = [
    { key: 'pot', label: 'Full chit amount (₹)', example: '500000' },
    { key: 'months', label: 'Total months', example: '50' },
    { key: 'monthly', label: 'Monthly payment (₹)', example: '10000', hint: 'Your actual payment after any monthly dividend adjustment.' },
    { key: 'liftAt', label: 'Lift in month · optional', example: '15', hint: 'Leave empty to calculate receiving the pot in the final month.' },
    { key: 'discount', label: 'Auction deduction (₹) · optional', example: '50000', hint: 'Amount you agree to give up from the full pot.' },
    { key: 'fees', label: 'Extra payout charges (₹) · optional', example: '5000', hint: 'Commission or fees charged separately. Do not repeat charges already included in the auction deduction.' },
    { key: 'afterLift', label: 'Monthly after lifting (₹) · optional', example: '10000', hint: 'Leave empty if your monthly payment stays the same.' },
    { key: 'credits', label: 'Separate dividend credits (₹) · optional', example: '20000', hint: 'Total received separately over the full chit. Leave empty if already reflected in monthly payments.' },
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50/40">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center justify-between gap-3 p-3.5 text-left">
        <span><span className="block text-sm font-bold text-emerald-950">Chit calculator</span><span className="mt-0.5 block text-[11px] text-emerald-700">Plan your payout and remaining payments</span></span>
        <span className={`material-symbols-outlined rounded-full bg-emerald-100 p-1 text-emerald-800 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true">keyboard_arrow_down</span>
      </button>
      {open && <form className="space-y-3 border-t border-emerald-100 p-3.5" onSubmit={(event) => {
        event.preventDefault();
        try { setResult(calculateChitPlan(input)); setError(''); }
        catch (reason) { setResult(null); setError(reason instanceof Error ? reason.message : 'Check your inputs.'); }
      }}>
        <div className="grid grid-cols-2 gap-x-3 gap-y-3.5">
          {fields.map((field) => <label key={field.key} className="min-w-0 text-[11px] font-semibold text-slate-700">
            {field.label}
            <input value={input[field.key]} inputMode={field.key === 'months' || field.key === 'liftAt' ? 'numeric' : 'decimal'} placeholder={`e.g. ${field.example}`} aria-invalid={Boolean(error)} onChange={(event) => {
              setInput({ ...input, [field.key]: event.target.value }); setResult(null); setError('');
            }} className="mt-1 block h-10 w-full min-w-0 rounded-xl border border-emerald-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
            {field.hint && <span className="mt-1 block text-[10px] font-normal leading-relaxed text-slate-500">{field.hint}</span>}
          </label>)}
        </div>
        {error && <p role="alert" className="rounded-lg bg-rose-50 p-2 text-xs text-rose-700">{error}</p>}
        <button type="submit" className="w-full rounded-xl bg-emerald-700 py-3 text-xs font-bold text-white hover:bg-emerald-800 active:scale-[0.99]">Calculate my chit</button>
        {result && <div aria-live="polite" className="space-y-3 rounded-xl border border-emerald-200 bg-white p-3">
          <div><p className="text-[11px] font-semibold text-emerald-700">Estimated payout · month {result.liftAt}</p><p className="mt-1 text-xl font-extrabold text-emerald-950">{money(result.received)}</p></div>
          <dl className="space-y-2 text-xs">
            {[
              ['Full chit amount', result.pot], ['Auction deduction', -result.discount], ['Extra payout charges', -result.fees],
              [`Instalments through month ${result.liftAt}`, result.paidTillLift],
              [`Still to pay · ${result.months - result.liftAt} months`, result.remaining],
              ['Separate dividend credits', -result.credits], ['Net paid over the full chit', result.totalPaid],
            ].map(([label, amount]) => <div key={label} className="flex justify-between gap-3"><dt className="text-slate-500">{label}</dt><dd className="shrink-0 font-semibold text-slate-800">{money(Number(amount))}</dd></div>)}
          </dl>
          <div className="flex justify-between gap-3 border-t border-emerald-100 pt-3 text-sm font-bold"><span>{result.net >= 0 ? 'Estimated surplus' : 'Estimated shortfall'}</span><span className={result.net >= 0 ? 'text-emerald-700' : 'text-rose-600'}>{money(Math.abs(result.net))}</span></div>
          <p className="text-[10px] leading-relaxed text-slate-500">The lift-month instalment is included before payout. This estimate uses the payments and deductions you entered; auction outcomes and dividends may vary. It does not calculate interest or the time value of receiving money early.</p>
        </div>}
      </form>}
    </section>
  );
}
