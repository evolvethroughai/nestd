import { useEffect, useRef, useState } from 'react';

export interface ChitPlanInput {
  pot: string;
  monthly: string;
  months: string;
  liftAt: string;
  discount: string;
  fees: string;
  afterLift: string;
  credits: string;
  closingMonths?: string;
  finalPayment?: string;
  paymentSchedule?: string;
  accumulatedDividends?: string;
  paidThrough?: string;
  endedEarly?: 'yes' | '';
  averageDividend?: string;
  averageAuctionDiscount?: string;
  members?: string;
  firstMonthFull?: 'yes' | '';
  commissionRate?: string;
  noDividendAfterLift?: 'yes' | '';
  projectionMonths?: string;
  goal?: 'save' | 'borrow';
  ledgerMode?: 'estimate' | 'actual';
  biddingHigh?: string;
  overrides?: Record<number, string>;
}

export type ChitCalculatorMode = 'monthly-dividend' | 'final-adjustment';

export function normalizeBiddingRange(input: ChitPlanInput): ChitPlanInput {
  const parse = (value: string) => Number(value.replace(/,/g, '').trim());
  const fallback = parse(input.pot) * 0.15;
  const min = input.averageAuctionDiscount?.trim() ? parse(input.averageAuctionDiscount) : fallback;
  const max = input.biddingHigh?.trim() ? parse(input.biddingHigh) : min;
  return Number.isFinite(min) && Number.isFinite(max) && max < min
    ? { ...input, averageAuctionDiscount: String(max), biddingHigh: String(min) }
    : input;
}

export function calculateChitPlan(input: ChitPlanInput, mode: ChitCalculatorMode = 'monthly-dividend') {
  if (mode === 'monthly-dividend') input = { ...normalizeBiddingRange(input),

    ...(input.ledgerMode === 'estimate' ? { paymentSchedule: '' } : {}),
    commissionRate: input.commissionRate?.trim() ? input.commissionRate : '0',
    firstMonthFull: input.firstMonthFull === undefined ? 'yes' : input.firstMonthFull,

  };
  const hasSchedule = mode === 'monthly-dividend' && Boolean(input.paymentSchedule?.trim());
  const number = (value: string) => Number(value.replace(/,/g, '').trim());
  const pot = number(input.pot);
  const variable = mode === 'monthly-dividend';
  const basePayment = pot / number(input.months);
  const members = number(input.months);
  const auctionEstimate = variable && input.averageAuctionDiscount !== undefined;
  const rate = variable ? number(input.commissionRate?.trim() ? input.commissionRate : '0') : 0;
  const biddingLow = input.averageAuctionDiscount?.trim() ? number(input.averageAuctionDiscount) : pot * 0.15;
  const biddingHigh = input.biddingHigh?.trim() ? number(input.biddingHigh) : input.averageAuctionDiscount?.trim() ? biddingLow : pot * 0.15;
  if (variable && !hasSchedule && (!Number.isFinite(biddingHigh) || biddingHigh < biddingLow || biddingHigh > pot)) throw new Error('The upper bidding amount must be at least the lower amount and no more than the chit value.');
  const averageCut = (biddingLow + biddingHigh) / 2;
  if (variable && (!Number.isInteger(members) || members < 1 || members > 1200)) throw new Error('Enter a whole member/ticket count between 1 and 1200.');
  if (auctionEstimate && !hasSchedule && (!Number.isFinite(averageCut) || biddingLow < 0 || averageCut > pot)) throw new Error('Enter an average auction discount between the commission amount and the full chit value.');
  const dividend = hasSchedule ? 0 : auctionEstimate ? Math.max(0, averageCut - pot * rate / 100) / members : number(input.averageDividend || '');
  const monthly = hasSchedule ? 0 : variable && (auctionEstimate || input.averageDividend?.trim()) ? basePayment - dividend : number(input.monthly);
  const plannedMonths = number(input.months);
  const months = !variable && input.closingMonths?.trim() && number(input.closingMonths) !== 0 ? number(input.closingMonths) : plannedMonths;
  const paidThrough = input.paidThrough?.trim() ? number(input.paidThrough) : !variable && input.endedEarly === 'yes' ? months : null;

  const liftAt = input.liftAt.trim() && number(input.liftAt) !== 0 ? number(input.liftAt) : months;

  const commissionRate = rate;
  const commission = pot * commissionRate / 100;
  const discount = variable && liftAt === months ? 0 : input.discount.trim() ? number(input.discount) : variable ? biddingHigh : commission;
  if (!Number.isFinite(commissionRate) || commissionRate < 0 || commissionRate > 100) throw new Error('Enter the commission percentage from your agreement.');
  if (variable && liftAt < months && discount < commission) throw new Error('Auction cut must include the entered commission. If charged separately, leave the rate blank and use Other fees.');
  if (variable && (!Number.isFinite(dividend) || dividend < 0 || dividend > basePayment)) throw new Error('Your dividend must be between zero and the base monthly payment.');
  if (variable && !auctionEstimate && input.averageDividend?.trim() && input.monthly.trim() && !hasSchedule) throw new Error('Enter either your average payment or your dividend, not both.');
  const fees = number(input.fees);
  const afterLift = variable && input.noDividendAfterLift === 'yes' ? basePayment : monthly;
  const credits = hasSchedule ? 0 : number(input.credits);
  const hasFinalPayment = !variable && Boolean(input.finalPayment?.trim());
  const finalPayment = hasFinalPayment ? number(input.finalPayment!) : monthly;
  const useDividendLedger = mode === 'final-adjustment' && !input.finalPayment?.trim();
  const ledgerCredits = useDividendLedger ? number(input.accumulatedDividends || '') : 0;
  if (!input.pot.trim() || (!input.monthly.trim() && !hasSchedule && !(variable && (auctionEstimate || input.averageDividend?.trim()))) || !input.months.trim()) throw new Error('Enter the chit value, total months, and your average payment or dividend.');
  if (!variable && input.endedEarly === 'yes' && (!input.closingMonths?.trim() || number(input.closingMonths) === 0 || !hasFinalPayment)) throw new Error('Enter the actual closing month and last payment. To use the original term instead, untick early closure.');
  if (!variable && input.endedEarly === 'yes' && months >= plannedMonths) throw new Error('For early closure, choose a closing month before the original end month.');
  if (![pot, monthly, months, liftAt, discount, fees, afterLift, credits].every(Number.isFinite)) throw new Error('Enter valid numbers. Commas are allowed in amounts.');
  if (pot <= 0 || (!hasSchedule && monthly <= 0 && !(variable && (auctionEstimate || input.averageDividend?.trim()) && monthly === 0)) || monthly < 0 || afterLift < 0 || discount < 0 || fees < 0 || credits < 0) throw new Error('Amounts must be positive; optional deductions and credits can be zero.');
  if (!Number.isInteger(plannedMonths) || plannedMonths < 1 || plannedMonths > 1200 || !Number.isInteger(months) || months < 1 || months > plannedMonths || !Number.isInteger(liftAt) || liftAt < 1 || liftAt > months) throw new Error('Use whole months between 1 and 1200. Lift month must be within the chit term.');
  if (paidThrough !== null && (!Number.isInteger(paidThrough) || paidThrough < 0 || paidThrough > months)) throw new Error('Payments made through month must be a whole number between 0 and the chit end month.');
  if (!Number.isFinite(finalPayment) || finalPayment < 0) throw new Error('Enter a valid final payment, zero or greater.');
  if (!Number.isFinite(ledgerCredits) || ledgerCredits < 0 || ledgerCredits > monthly * months) throw new Error('Accumulated dividends must be between zero and the full term’s instalments.');
  if (useDividendLedger && credits !== 0) throw new Error('Enter fixed-payment dividends in the ledger balance only, so they are not counted twice.');
  if (discount + fees > pot) throw new Error('Auction deduction and extra charges cannot exceed the pot amount.');
  const entries = hasSchedule ? input.paymentSchedule!.trim().split(/\r?\n|,/).map((value) => {
    const cleaned = value.trim();
    if (!cleaned) return null;
    if (!/^(?:\d+(?:\.\d{1,2})?|\.\d{1,2})$/.test(cleaned)) throw new Error('Use plain amounts with up to two decimals. Separate months with commas or new lines; do not use thousands commas.');
    return Number(cleaned);
  }) : [];
  if (entries.length > months) throw new Error('There are more payment entries than months in the chit.');
  const assumedMonths = hasSchedule ? Array.from({ length: months }, (_, index) => entries[index] == null).filter(Boolean).length : 0;
  const biddingAt = (index: number) => index === 0 ? 0 : months <= 2 ? biddingHigh : biddingHigh + (biddingLow - biddingHigh) * (index - 1) / (months - 2);
  const estimatedPayment = (index: number) => index === 0 || (input.noDividendAfterLift === 'yes' && index + 1 > liftAt) ? basePayment : basePayment - Math.max(0, biddingAt(index) - commission) / members;
  const schedule = mode === 'monthly-dividend' && input.paymentSchedule?.trim()
    ? Array.from({ length: months }, (_, index) => entries[index] ?? basePayment)
    : Array.from({ length: months }, (_, index) => mode === 'final-adjustment' ? (index === months - 1 ? finalPayment : monthly) : estimatedPayment(index));
  if (hasFinalPayment && mode === 'monthly-dividend') {
    if (hasSchedule && schedule[schedule.length - 1] !== finalPayment) throw new Error('The last payment in your monthly list must match the actual last payment entered above.');
    if (!hasSchedule) schedule[schedule.length - 1] = finalPayment;
  }
  if (schedule.length !== months || schedule.some((amount) => !Number.isFinite(amount) || amount < 0)) throw new Error('Enter one valid payment per line for every month in the chit.');
  const overrideMonths = new Set<number>();
  if (variable && !hasSchedule) for (const [monthText, amountText] of Object.entries(input.overrides || {})) {
    if (!amountText.trim()) continue;
    const month = Number(monthText), amount = number(amountText);
    if (!Number.isInteger(month) || month < 1 || month > months || !Number.isFinite(amount) || amount < 0) throw new Error('Receipt overrides need a valid month and a non-negative payment.');
    schedule[month - 1] = amount;
    overrideMonths.add(month);
  }
  const cashSchedule = schedule.map((amount) => Math.round(amount * 100));
  // Apply the supplied end-of-term credit to the last instalments first.
  // The payment obligations remain scheduled through the agreed end month.
  let unusedCredit = Math.round(ledgerCredits * 100);
  for (let index = cashSchedule.length - 1; index >= 0 && unusedCredit > 0; index--) {
    const appliedCredit = Math.min(cashSchedule[index], unusedCredit);
    cashSchedule[index] -= appliedCredit;
    unusedCredit -= appliedCredit;
  }
  const paidTillLift = cashSchedule.slice(0, liftAt).reduce((sum, amount) => sum + amount, 0) / 100;
  const remaining = cashSchedule.slice(liftAt).reduce((sum, amount) => sum + amount, 0) / 100;
  const grossPayments = paidTillLift + remaining;
  if (credits > grossPayments) throw new Error('Separate credits cannot exceed the total instalments.');
  const totalPaid = Math.round((grossPayments - credits) * 100) / 100;
  const received = Math.round((pot - discount - fees) * 100) / 100;
  const lastCashMonth = cashSchedule.reduce((last, amount, index) => amount > 0 ? index + 1 : last, 0);
  const lastCashPayment = lastCashMonth ? cashSchedule[lastCashMonth - 1] / 100 : 0;
  const coveredMonths = cashSchedule.filter((amount) => amount === 0).length;
  let cumulativePaise = 0;
  const paymentPlan = cashSchedule.map((cash, index) => ({ biddingDiscount: hasSchedule ? null : Math.round(biddingAt(index) * 100) / 100, overridden: overrideMonths.has(index + 1), cumulativePaid: (cumulativePaise += cash) / 100, assumed: hasSchedule && entries[index] == null, month: index + 1, cash: cash / 100, dividend: variable ? Math.round((basePayment * 100) - cash) / 100 : Math.round((schedule[index] * 100) - cash) / 100 }));
  const projectionMonths = variable && input.projectionMonths?.trim() && number(input.projectionMonths) !== 0 ? number(input.projectionMonths) : months;
  if (!Number.isInteger(projectionMonths) || projectionMonths < 1 || projectionMonths > months) throw new Error('Projection month must be within the original term.');
  const projectedPaid = cashSchedule.slice(0, projectionMonths).reduce((sum, cash) => sum + cash, 0) / 100;
  const paidSoFar = paidThrough === null ? null : cashSchedule.slice(0, paidThrough).reduce((sum, amount) => sum + amount, 0) / 100;
  const futurePayments = paidThrough === null ? null : cashSchedule.slice(paidThrough).reduce((sum, amount) => sum + amount, 0) / 100;
  const totalAtBid = (cut: number) => cashSchedule.reduce((sum, cash, index) => {
    if (hasSchedule || overrideMonths.has(index + 1) || (index === 0 && input.firstMonthFull === 'yes') || (input.noDividendAfterLift === 'yes' && index + 1 > liftAt)) return sum + cash;
    return sum + Math.round((basePayment - (cut - commission) / members) * 100);
  }, 0) / 100;
  const lowDividend = (biddingLow - commission) / members;
  const highDividend = (biddingHigh - commission) / members;
  const netAtLowBid = Math.round((received - totalAtBid(biddingLow)) * 100) / 100;
  const netAtHighBid = Math.round((received - totalAtBid(biddingHigh)) * 100) / 100;
  return { biddingLow, biddingHigh, lowDividend, highDividend, netAtLowBid, netAtHighBid, assumedMonths, hasSchedule, totalReductions: Math.round((basePayment * months - totalPaid) * 100) / 100, averageCut, dividend, commission, members, auctionEstimate, basePayment, projectionMonths, projectedPaid, pot, months, plannedMonths, finalPayment, mode, useDividendLedger, ledgerCredits, lastCashMonth, lastCashPayment, coveredMonths, liftAt, discount, fees, credits, paidTillLift, remaining, totalPaid, received, paymentPlan, paidThrough, paidSoFar, futurePayments, net: Math.round((received - totalPaid) * 100) / 100 };
}

const EMPTY_INPUT: ChitPlanInput = { pot: '', monthly: '', months: '', liftAt: '', discount: '', fees: '', afterLift: '', credits: '' };
const money = (amount: number) => `${amount < 0 ? '-' : ''}₹${Math.abs(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

function CalculatorIllustration() {
  return <svg width="32" height="38" viewBox="0 0 32 38" fill="none" aria-hidden="true"><rect x="2" y="1" width="28" height="36" rx="7" fill="#8B672A" /><rect x="5" y="4" width="22" height="10" rx="3" fill="#FFF3CF" /><path d="M17 9h6" stroke="#8B672A" strokeWidth="2" strokeLinecap="round" />{[18, 25].map((y) => [6, 14].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="5" height="5" rx="1.5" fill="#F3D68F" />))}<rect x="22" y="18" width="5" height="12" rx="2" fill="#D9AD50" /><path d="M23.5 24h2M24.5 23v2" stroke="#FFF8E6" strokeWidth="1.2" strokeLinecap="round" /></svg>;
}

export function ChitCalculator() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ChitCalculatorMode | null>(null);
  const [input, setInput] = useState<ChitPlanInput>(EMPTY_INPUT);
  const [receiptDrafts, setReceiptDrafts] = useState<Record<number, string>>({});
  const [receiptsPending, setReceiptsPending] = useState(false);
  const [discountFocused, setDiscountFocused] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const savedInputs = useRef<Partial<Record<ChitCalculatorMode, ChitPlanInput>>>({});
  const [result, setResult] = useState<ReturnType<typeof calculateChitPlan> | null>(null);
  const [error, setError] = useState('');
  const [calculationCount, setCalculationCount] = useState(0);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const feedbackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setFeedbackVisible(false);
    if (!result || !feedbackRef.current) return;
    if (typeof IntersectionObserver === 'undefined') { setFeedbackVisible(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setFeedbackVisible(true); observer.disconnect(); }
    }, { threshold: 0.25 });
    observer.observe(feedbackRef.current);
    return () => observer.disconnect();
  }, [result, calculationCount]);
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    dialog?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);
  const resolvedInput: ChitPlanInput = mode === 'monthly-dividend' ? { ...input, averageAuctionDiscount: input.averageAuctionDiscount || '', commissionRate: input.commissionRate?.trim() ? input.commissionRate : '0',  } : input;
  const systemName = mode === 'monthly-dividend' ? 'Dividend-Distributed Chit' : 'Accumulated Dividend Chit';
  useEffect(() => {
    if (!open || mode !== 'monthly-dividend') return;
    if (!input.pot.trim() || !input.months.trim()) { setResult(null); setError(''); return; }
    try { setResult(calculateChitPlan({ ...input, overrides: receiptDrafts, credits: '', accumulatedDividends: '' }, mode)); setError(''); setReceiptsPending(false); }
    catch (reason) { setResult(null); setError(reason instanceof Error ? reason.message : 'Check your inputs.'); }
  }, [input, receiptDrafts, mode, open]);
  const fields: { key: keyof ChitPlanInput; label: string; example: string; hint?: string }[] = [
    { key: 'pot', label: 'Full chit value (₹)', example: '450000', hint: 'The pot before cuts. A ₹4.5 lakh chit = 450000.' },
    { key: 'months', label: 'Chit duration (months)', example: '30', hint: 'Total months agreed when the chit started.' },
    ...(mode === 'final-adjustment' ? [{ key: 'monthly' as const, label: 'Fixed payment each month (₹)', example: '15000', hint: 'The amount you normally pay each month.' }] : [{ key: 'averageAuctionDiscount' as const, label: 'Approx Min Bidding Discount (INR)', example: '70000', hint: 'Final-month projected group discount, including commission. Blank defaults to 15% of chit value.' }, { key: 'biddingHigh' as const, label: 'Approx Max Bidding Discount (INR)', example: '90000', hint: 'Month-2 projected discount. Bids gradually fall to the minimum. Blank uses the minimum, or 15% when both are blank.' }]),
    ...(mode === 'monthly-dividend' ? [{ key: 'commissionRate' as const, label: 'Foreman commission (%)', example: '5', hint: 'Starts at 5%. Change to your agreement rate. Already included in auction cuts, never deducted twice.' }, { key: 'members' as const, label: 'Number of member tickets - optional', example: '30', hint: 'Blank = original month count. Dividend pool is shared across these tickets; base payment uses the agreed month count.' }] : []),
    { key: 'liftAt', label: 'In which month do you want to withdraw? · optional', example: '15', hint: 'Enter 15 if you took the pot in month 15. Leave blank or 0 if waiting until the final month.' },
    { key: mode === 'monthly-dividend' ? 'projectionMonths' : 'closingMonths', label: mode === 'monthly-dividend' ? 'Project payments up to month · optional' : 'Expected closing month · optional', example: '26', hint: mode === 'monthly-dividend' ? 'Shows payments to this month. Profit still includes the full term.' : 'Blank or 0 = original chit length.' },
    { key: 'discount', label: mode === 'monthly-dividend' ? 'Your bidding discount (₹)' : 'Amount given up at auction (₹)', example: mode === 'monthly-dividend' ? '90000' : '45000', hint: mode === 'monthly-dividend' ? 'Your own auction cut, including commission. Full chit value minus your discount equals your payout before other fees.' : '₹4.5 lakh pot, received ₹4.05 lakh? Enter 45000. Blank = no auction cut.' },
    { key: 'fees', label: 'Other fees taken from payout (₹)', example: '5000', hint: 'Only fees on top of the auction cut. Already included in that cut? Leave blank.' },

  ];

  const exportLedgerCsv = () => {
    if (!result) return;
    const quote = (value: string | number) => '"' + String(value).replace(/"/g, '""') + '"';
    const rows: (string | number)[][] = [['Month', 'Amount Paid', 'Dividend Earned', 'Group Bid Discount', 'Cumulative Total', 'Notes']];
    for (const payment of result.paymentPlan) {
      const notes = [payment.assumed ? 'Base assumed' : 'Recorded'];
      if (payment.month === result.liftAt) notes.push('Pot Lifted', 'Net cash: ' + result.received.toFixed(2));
      rows.push([payment.month, payment.cash.toFixed(2), payment.dividend.toFixed(2), payment.biddingDiscount === null ? '' : payment.biddingDiscount.toFixed(2), payment.cumulativePaid.toFixed(2), notes.join('; ')]);
    }
    const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.map((row) => row.map(quote).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'nestd-chit-ledger.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const foremanCommissionPct = Number(input.commissionRate || 0);
  const minCommission = Number(input.pot.replace(/,/g, '')) * (foremanCommissionPct / 100);
  const renderField = (field: typeof fields[number]) => <div key={field.key} className="min-w-0"><label className="text-[11px] font-semibold text-slate-700">
            {field.label}
            <input id={field.key === 'discount' ? 'chit-bidding-discount' : undefined} aria-describedby={field.key === 'discount' ? 'chit-bidding-discount-hint' : undefined} onFocus={() => { if (field.key === 'discount') setDiscountFocused(true); }} value={mode === 'monthly-dividend' && field.key === 'commissionRate' ? input.commissionRate ?? '' : mode === 'monthly-dividend' && field.key === 'members' ? input.members || input.months : input[field.key] || ''} type={field.key === 'commissionRate' ? 'number' : 'text'} step={field.key === 'commissionRate' ? 'any' : undefined} inputMode={field.key === 'months' || field.key === 'liftAt' || field.key === 'closingMonths' || field.key === 'projectionMonths' || field.key === 'paidThrough' ? 'numeric' : 'decimal'} placeholder={field.key === 'discount' && mode === 'monthly-dividend' && input.goal === 'borrow' ? `Default: ${normalizeBiddingRange(input).biddingHigh || normalizeBiddingRange(input).averageAuctionDiscount || Number(input.pot.replace(/,/g, '')) * 0.15}` : `e.g. ${field.example}`} aria-invalid={Boolean(error)} onChange={(event) => {
              setInput({ ...input, [field.key]: event.target.value }); setResult(null); setError('');
            }} onBlur={() => {
              if (field.key === 'averageAuctionDiscount' || field.key === 'biddingHigh') setInput((previous) => normalizeBiddingRange(previous));
              if (field.key === 'discount') setDiscountFocused(false);
              if ((field.key === 'liftAt' || field.key === 'closingMonths' || field.key === 'projectionMonths' || field.key === 'afterLift') && input[field.key]?.trim() && Number(input[field.key]) === 0) {
                setInput((previous) => ({ ...previous, [field.key]: '' })); setResult(null); setError('');
              }
            }} className="mt-1 block h-10 w-full min-w-0 rounded-xl border border-amber-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100" />
            {field.hint && field.key !== 'discount' && <span className="mt-1 block text-[10px] font-normal leading-relaxed text-slate-500">{field.hint}</span>}
            {field.key === 'discount' && discountFocused && Number(input.commissionRate || 0) > 0 && input.discount.trim() && Number(input.discount.replace(/,/g, '')) < minCommission && <span id="chit-bidding-discount-hint" role="note" className="mt-1 block text-[10px] font-normal leading-relaxed text-orange-600">Minimum discount includes {Number(input.commissionRate || 0)}% foreman commission (₹{minCommission.toLocaleString('en-IN')})</span>}
          </label>
          {field.key === 'commissionRate' && <div className="mt-2 flex flex-wrap gap-2">{[['0', '0% Private'], ['2.5', '2.5%'], ['5', '5%']].map(([value, label]) => <button key={value} type="button" aria-pressed={Number(input.commissionRate || 0) === Number(value)} onClick={() => { setInput({ ...input, commissionRate: value }); setError(''); }} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900">{label}</button>)}<p className="w-full text-[10px] text-slate-500">Use your agreement rate. Presets do not establish legal limits.</p></div>}
          {field.key === 'closingMonths' && <>
            <label className="mt-2 flex cursor-pointer items-start gap-1.5 text-[10px] font-medium leading-relaxed text-[#856a3c]"><input type="checkbox" checked={input.endedEarly === 'yes'} onChange={(event) => { setInput({ ...input, endedEarly: event.target.checked ? 'yes' : '', finalPayment: '' }); setResult(null); setError(''); }} className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-amber-700" /><span>This chit ended early in this month</span></label>
            {input.endedEarly === 'yes' && <label className="mt-2 block text-[11px] font-semibold text-slate-700">Actual last payment (₹)<input value={input.finalPayment || ''} onChange={(event) => { setInput({ ...input, finalPayment: event.target.value }); setResult(null); setError(''); }} inputMode="decimal" placeholder="e.g. 7500" className="mt-1 h-10 w-full min-w-0 rounded-xl border border-amber-200 bg-white px-3 text-sm outline-none focus:border-amber-600" /><span className="mt-1 block text-[10px] font-normal text-slate-500">What you paid in the closing month.</span></label>}
          </>}
          </div>;

  return (
    <><section className="overflow-hidden rounded-2xl border border-[#d5b974] bg-[#fffcf4] shadow-[0_6px_24px_-8px_rgba(139,104,35,0.25)] ring-4 ring-amber-50/80">
      <div className="h-1 bg-gradient-to-r from-[#b68c36] via-[#f4dea1] to-[#b68c36]" />
      <button type="button" onClick={() => { if (mode) savedInputs.current[mode] = input; setMode(null); setResult(null); setError(''); setOpen(true); }} aria-haspopup="dialog" className="flex w-full items-center justify-between gap-3 bg-gradient-to-br from-[#fffaf0] to-[#f0d99f] p-4 text-left">
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#dcc48e] bg-white/85 shadow-sm"><CalculatorIllustration /></span>
          <span className="min-w-0"><span className="mb-1 inline-block rounded-full bg-white/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#8a6524]">Explore both systems</span><span className="block text-[16px] font-bold leading-snug text-[#493718]">Chit planning calculator</span><span className="mt-1 block text-[11px] leading-relaxed text-[#856a3c]">Your payout, dividends & final cash payment</span><span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#715017]">Open calculator <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_forward</span></span></span>
        </span>
      </button>
    </section>
      {open && <dialog ref={dialogRef} aria-labelledby="chit-calculator-title" onClose={() => setOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) setOpen(false); }} className="m-auto w-[calc(100%-1rem)] max-w-lg max-h-[calc(100dvh-1rem)] overflow-hidden rounded-3xl border border-[#d5b974] bg-[#fffcf4] p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/60 backdrop:backdrop-blur-sm">
      <div className="flex max-h-[calc(100dvh-1rem)] flex-col">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#eadbb8] bg-[#f5e8c5] px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5"><CalculatorIllustration /><div className="min-w-0"><h2 id="chit-calculator-title" className="text-sm font-bold text-[#493718]">{mode ? systemName : 'Choose your chit system'}</h2><p className="mt-0.5 text-[11px] text-[#856a3c]">{mode ? (mode === 'monthly-dividend' ? 'Variable Installment Chit' : 'Fixed Installment Chit') : 'Two calculators. Pick how your dividends work.'}</p></div></div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close calculator" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/75 text-[#715017]"><span className="material-symbols-outlined" aria-hidden="true">close</span></button>
        </div>
      <div className="min-h-0 overflow-y-auto overscroll-contain p-4 space-y-4">
        {mode && <button type="button" onClick={() => { savedInputs.current[mode] = input; setMode(null); setResult(null); setError(''); }} className="inline-flex items-center gap-1 text-xs font-semibold text-[#856a3c]"><span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_back</span>Change system</button>}
        {!mode && <><p className="text-xs font-semibold text-amber-950">How does your chit apply dividends?</p>
        <div className="grid grid-cols-1 gap-2">
          {([
            ['monthly-dividend', 'System 1 · Dividend-Distributed Chit', 'Variable Installment Chit: dividends are distributed monthly to reduce your cash instalments.'],
            ['final-adjustment', 'System 2 · Accumulated Dividend Chit', 'Fixed Installment Chit: dividends build up in a ledger and cover all or part of the final payments.'],
          ] as const).map(([value, title, description]) => <button key={value} type="button" aria-pressed={mode === value} onClick={() => {
            setReceiptDrafts({}); setReceiptsPending(false); setAdvanced(false); setMode(value); setInput(savedInputs.current[value] || (value === 'monthly-dividend' ? { ...EMPTY_INPUT, averageAuctionDiscount: '', commissionRate: '5', firstMonthFull: 'yes', goal: 'save' } : { ...EMPTY_INPUT })); setResult(null); setError('');
          }} className={`rounded-xl border p-3 text-left ${mode === value ? 'border-amber-600 bg-amber-100/70' : 'border-amber-200 bg-white'}`}><span className="flex items-center justify-between gap-2 text-xs font-bold text-amber-950">{title}{mode === value && <span className="material-symbols-outlined text-[18px]" aria-hidden="true">check_circle</span>}</span><span className="mt-1 block text-[11px] leading-relaxed text-slate-600">{description}</span></button>)}
        </div></>}
      {mode && <form className="space-y-3" onSubmit={(event) => {
        event.preventDefault();
        try { setResult(calculateChitPlan({ ...resolvedInput, overrides: receiptDrafts, accumulatedDividends: '', credits: '' }, mode)); setReceiptsPending(false); setCalculationCount((count) => count + 1); setError(''); }
        catch (reason) { setResult(null); setError(reason instanceof Error ? reason.message : 'Check your inputs.'); if (reason instanceof Error && reason.message.startsWith('Auction cut must include')) document.getElementById('chit-bidding-discount')?.focus(); }
      }}>
        {mode === 'monthly-dividend' ? <>
          <section aria-label="Basic inputs" className="space-y-3">
            <h3 className="text-xs font-bold text-amber-950">1. Your chit</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{fields.filter((field) => ['pot', 'months'].includes(field.key)).map(renderField)}</div>
            <p className="text-xs font-semibold text-amber-950">What would you like to do?</p>
            <div className="grid grid-cols-2 gap-2">{(['save', 'borrow'] as const).map((goal) => <button key={goal} type="button" aria-pressed={(input.goal || 'save') === goal} onClick={() => { setInput({ ...input, goal, liftAt: '', discount: '' }); setResult(null); setError(''); }} className={`rounded-xl border p-4 text-left text-sm font-semibold ${(input.goal || 'save') === goal ? 'border-amber-500 bg-amber-50 text-amber-950' : 'border-slate-200 bg-white text-slate-600'}`}>{goal === 'save' ? '💰 I want to Save' : '🏦 I want to Borrow Early'}</button>)}</div>
            {input.goal === 'borrow' && <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/40 p-3">{fields.filter((field) => ['liftAt', 'discount'].includes(field.key)).map(renderField)}</div>}
          </section>
          <div role="group" aria-label="Ledger source" className="grid grid-cols-1 gap-2 sm:grid-cols-2">{(['estimate', 'actual'] as const).map((value) => <button key={value} type="button" aria-pressed={(input.ledgerMode || 'estimate') === value} onClick={() => { setInput({ ...input, ledgerMode: value }); setResult(null); setError(''); }} className={`rounded-xl border p-3 text-xs font-semibold ${(input.ledgerMode || 'estimate') === value ? 'border-amber-500 bg-amber-50 text-amber-950' : 'border-slate-200 text-slate-600'}`}>{value === 'estimate' ? 'Estimate using Bidding Amount' : 'Paste Actual Monthly Ledger'}</button>)}</div>
          {(input.ledgerMode || 'estimate') === 'estimate' && <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/40 p-3">{fields.filter((field) => ['averageAuctionDiscount', 'biddingHigh'].includes(field.key)).map(renderField)}</div>}
          <details onToggle={(event) => setAdvanced(event.currentTarget.open)} className="rounded-xl border border-amber-200 bg-amber-50/40 p-3">
            <summary className="cursor-pointer text-xs font-bold text-amber-950">Advanced Settings</summary>
            <div className="mt-3 space-y-3"><div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{fields.filter((field) => ['commissionRate', 'fees'].includes(field.key)).map(renderField)}</div>
              <label className="flex items-start gap-2 text-xs"><input type="checkbox" checked={input.noDividendAfterLift !== 'yes'} onChange={(event) => { setInput({ ...input, noDividendAfterLift: event.target.checked ? '' : 'yes' }); setResult(null); setError(''); }} />Keep receiving dividends after lifting the pot</label>
              <p className="text-[10px] text-slate-500">Match these rules to your agreement. Exact monthly entries override estimates.</p>
            </div>
          </details>
          <p className="text-[10px] leading-relaxed text-slate-500">Enter the approximate group bidding amount in rupees. This projection uses your selected foreman fee and no first-month dividend. Projected bids decrease evenly from the maximum in month 2 to the minimum in the final month. Actual auctions may differ. Results update as you type.</p>
        </> : <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{fields.map(renderField)}</div>}
        {mode === 'monthly-dividend' && input.ledgerMode === 'actual' && <details open className="rounded-xl border border-amber-100 bg-amber-50/40 p-3"><summary className="cursor-pointer text-xs font-semibold text-[#856a3c]">Past Monthly Payments · optional</summary><label className="mt-2 block text-[11px] font-semibold text-slate-700">One entry per line or comma-separated
          <textarea value={input.paymentSchedule || ''} onChange={(event) => { setInput({ ...input, paymentSchedule: event.target.value }); setResult(null); setError(''); }} placeholder={'15000, 14500, 14000\nOr enter one amount per line'} rows={4} className="mt-1 block w-full rounded-xl border border-amber-200 bg-white p-3 text-sm outline-none focus:border-amber-600" />
          <span className="mt-1 block font-normal text-slate-500">Enter payments in month order, without thousands commas. Leave an empty entry for a missing month; missing and remaining months use the base installment. Zero means nothing paid. Leave the whole box blank for planning.</span>
        </label></details>}
        {error && !error.startsWith('Auction cut must include') && <p role="alert" className="rounded-lg bg-rose-50 p-2 text-xs text-rose-700">{error}</p>}
        <div className="flex items-center gap-2"><button type="submit" className="flex-1 rounded-xl bg-amber-700 py-3 text-xs font-bold text-white hover:bg-amber-800 active:scale-[0.99]">Calculate my chit</button><button type="button" onClick={() => { setReceiptDrafts({}); setReceiptsPending(false); setInput(mode === 'monthly-dividend' ? { ...EMPTY_INPUT, averageAuctionDiscount: '', commissionRate: '5', firstMonthFull: 'yes' } : { ...EMPTY_INPUT }); setResult(null); setError(''); }} className="rounded-xl border border-amber-200 bg-white px-3 py-3 text-xs font-semibold text-amber-800">Clear</button></div>
        {result && <div aria-live="polite" className="chit-results-reveal space-y-3 rounded-xl border border-amber-200 bg-white p-3">
          {mode === 'monthly-dividend' && <p className="rounded-lg bg-amber-50 p-2 text-[11px] text-[#856a3c]">{result.hasSchedule ? result.assumedMonths ? `Tracking mode: ${result.assumedMonths} missing months use the base installment. Totals include these assumptions.` : 'Tracking mode: totals use your actual monthly payments.' : 'Planning mode: estimates use your average group discount. No monthly table is needed.'}</p>}
          {mode === 'final-adjustment' && input.endedEarly !== 'yes' && <p className="rounded-lg bg-amber-50 p-2 text-[11px] text-[#856a3c]">Regular payments are counted through month {result.months}. A reduced last payment is used only when you enter it.</p>}
          {mode === 'final-adjustment' && <div><p className="text-[11px] font-semibold text-amber-700">Estimated payout · month {result.liftAt}</p><p className="mt-1 text-xl font-extrabold text-amber-950">{money(result.received)}</p></div>}
          {mode === 'monthly-dividend' && <p className="text-[11px] text-slate-600">Base monthly payment: {money(result.basePayment)}. Payments through month {result.projectionMonths}: <b>{money(result.projectedPaid)}</b>. Full chit: {result.months} months.</p>}
          {mode === 'monthly-dividend' && <><p className="text-xs font-semibold text-blue-700">Total Dividends Earned: {money(result.totalReductions)}</p><div className="grid grid-cols-1 gap-2 sm:grid-cols-3">{[['Net Cash Received (Payout)', result.received], [result.hasSchedule ? result.assumedMonths ? 'Total Cash Paid (includes assumed months)' : 'Total Actual Cash Paid' : 'Total Cash Paid Over Full Term', result.totalPaid], [result.net < 0 ? (result.liftAt < result.months ? 'Cost of Early Borrowing (Interest)' : 'Net financial loss') : result.net > 0 ? 'Net Earnings (Profit)' : 'No profit or loss', result.net]].map(([label, amount], index) => <div key={label} className={`rounded-xl border p-3 ${index === 2 ? result.net < 0 ? 'border-rose-200 bg-rose-50 text-[#d32f2f]' : result.net > 0 ? 'border-emerald-200 bg-emerald-50 text-[#2e7d32]' : 'border-slate-200 bg-slate-50 text-slate-700' : 'border-amber-200 bg-amber-50 text-amber-950'}`}><p className="text-[10px] font-semibold">{label}</p><p className="mt-1 break-words text-base font-bold">{index === 2 && result.net > 0 ? '+' : ''}{money(index === 2 ? Math.abs(Number(amount)) : Number(amount))}</p></div>)}</div>{!input.paymentSchedule?.trim() && <p className="text-[11px] text-slate-600">Commission per auction: {money(result.commission)}. Estimated dividend per ticket: {money(result.dividend)}. Base payment minus your dividend gives each reduced payment.</p>}</>}
          {(mode !== 'monthly-dividend' || advanced) && <dl className="space-y-2 text-xs">
            {[
              ['Full chit value', result.pot], ['Auction cut', -result.discount], ['Other payout fees', -result.fees],
              ...(result.ledgerCredits > 0 ? [['Saved dividends used for payments', -result.ledgerCredits]] : []),
              [`Cash payments through payout month ${result.liftAt}`, result.paidTillLift],
              [`Cash payments after payout · ${result.months - result.liftAt} months`, result.remaining],
              ...(result.credits ? [['Separate cash dividends received', -result.credits]] : []), ['Total you pay over the whole chit', result.totalPaid],
            ].map(([label, amount]) => <div key={label} className="flex justify-between gap-3"><dt className="text-slate-500">{label}</dt><dd className={`shrink-0 rounded-md px-1.5 font-semibold ${Number(amount) < 0 ? 'bg-rose-50 text-rose-600' : 'text-slate-800'}`}>{money(Number(amount))}</dd></div>)}
          </dl>}
          {result.ledgerCredits > 0 && <div className="space-y-1 rounded-lg bg-amber-50 p-2.5 text-[11px] text-amber-900">
            <p>{result.months < result.plannedMonths ? 'Actual chit length' : 'Chit length'}: <b>{result.months} months</b></p>
            <p>{result.lastCashMonth ? <>Last cash payment: <b>{money(result.lastCashPayment)} in month {result.lastCashMonth}</b></> : 'All instalments covered by the entered dividend balance.'}</p>
            <p>Final months fully covered by dividends: <b>{result.coveredMonths}</b></p>
            <p className="text-slate-600">This settlement assumes the organiser permits applying the full entered ledger balance to the final instalments. Estimated dividends are not guaranteed.</p>
          </div>}
          {result.months < result.plannedMonths && <p className="rounded-lg bg-amber-50 p-2 text-[11px] text-amber-800">{input.endedEarly === 'yes' ? 'Actual' : 'Expected'} closing month: {result.months}. Original term: {result.plannedMonths} months.</p>}
          {mode === 'monthly-dividend' && !result.hasSchedule && <section aria-label="Step-by-step deduction breakdown" className="space-y-2 rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-950">
            <h3 className="font-bold">Step-by-Step Deduction Breakdown</h3>
            {result.biddingHigh > result.biddingLow && <div className="space-y-1 rounded-lg bg-white p-3"><p>Group bidding range: <b>{money(result.biddingLow)} to {money(result.biddingHigh)}</b>. Ledger projects a steady decrease from the maximum to the minimum.</p><p>Your dividend per eligible month: <b>{money(result.lowDividend)} to {money(result.highDividend)}</b>.</p><p>Your payment per eligible month: <b>{money(result.basePayment - result.highDividend)} to {money(result.basePayment - result.lowDividend)}</b>.</p><p>Estimated net return range: <b>{money(result.netAtLowBid)} to {money(result.netAtHighBid)}</b>, keeping your own payout cut and receipt overrides unchanged.</p></div>}
            <p>Higher bids by other members leave a larger dividend pool after commission, so you pay less. Your own bidding cut affects your payout separately.</p>
            <ol className="list-decimal space-y-2 pl-4"><li>Base monthly payment: {money(result.pot)} / {result.months} months = <b>{money(result.basePayment)}</b>.</li><li>Group discount after foreman fee: {money(result.averageCut)} - {money(result.commission)} = <b>{money(result.averageCut - result.commission)}</b>.</li><li>Average Estimated Dividend Deduction: {money(result.averageCut - result.commission)} / {result.members} tickets = <b>{money(result.dividend)}</b>.</li><li>Average reduced payment across the bidding range: {money(result.basePayment)} - {money(result.dividend)} = <b>{money(result.basePayment - result.dividend)}</b>.</li></ol>
            <div className="space-y-1 border-t border-amber-200 pt-2"><p>Month 1: you pay <b>{money(input.firstMonthFull !== '' ? result.basePayment : result.basePayment - result.dividend)}</b>{input.firstMonthFull !== '' ? ' (full base, no dividend).' : ' (after estimated dividend).'}</p><p>Months 2 onwards: roughly <b>{money(result.basePayment - result.dividend)}</b> per month{input.noDividendAfterLift === 'yes' && result.liftAt < result.months ? `; after month ${result.liftAt}, pay the full ${money(result.basePayment)} because dividends stop.` : '.'}</p></div>
          </section>}
          {mode === 'monthly-dividend' && result.hasSchedule && <section aria-label="Actual payment totals" className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
            <div className="flex items-center justify-between gap-3"><h3 className="font-bold text-slate-900">Post-Chit Tracking Ledger</h3><button type="button" onClick={exportLedgerCsv} className="shrink-0 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100">CSV Export</button></div><div className="grid grid-cols-1 gap-2 sm:grid-cols-3">{[{ label: 'Total Reductions Enjoyed', amount: result.totalReductions, color: 'border-blue-200 bg-blue-50 text-blue-700' }, { label: 'Net Cash Received', amount: result.received, color: 'border-emerald-200 bg-emerald-50 text-emerald-700' }, { label: result.net < 0 ? 'Borrowing Cost / Net Loss' : 'Net Clean Profit', amount: Math.abs(result.net), color: result.net < 0 ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700' }].map((card) => <div key={card.label} className={`rounded-xl border p-3 ${card.color}`}><p className="text-[10px] font-semibold">{card.label}</p><p className="mt-1 text-sm font-bold">{money(card.amount)}</p></div>)}</div>{result.assumedMonths > 0 && <p className="text-amber-800">Missing payments are assumed at the base amount. Complete these months before treating this as a final actual profit/loss.</p>}
            <p>Total Cash Paid: <b>{money(result.totalPaid)}</b> - sum of {result.months} rows ({result.assumedMonths} assumed).</p>
            <p>Total Reductions Enjoyed: <b className={result.totalReductions >= 0 ? 'text-emerald-700' : 'text-rose-600'}>{money(result.totalReductions)}</b> - full base total minus your payments.</p>
            <p>{result.net >= 0 ? 'Net Clean Profit' : 'Net Clean Loss'}: <b className={result.net >= 0 ? 'text-emerald-700' : 'text-rose-600'}>{money(Math.abs(result.net))}</b> - payout minus total cash paid.</p>
            <p className="border-t border-slate-200 pt-2 text-slate-600">{result.totalReductions > 0 ? `Your records show ${money(result.totalReductions)} less paid than the full base total. Keeping every payment helps you see your actual savings clearly.` : result.totalReductions < 0 ? `Your records show ${money(Math.abs(result.totalReductions))} paid above the full base total. Tracking every payment makes the difference clear.` : 'Your payments match the full base total. Your records make the final comparison clear.'} Payment reductions and net profit are different: your payout also matters.</p>
          </section>}
          {<details open={mode === 'monthly-dividend'} className="rounded-lg border border-amber-100 bg-amber-50/40 p-2.5">
            <summary className="cursor-pointer text-xs font-semibold text-amber-900">Month-by-month cash payments</summary>{!result.hasSchedule && mode === 'monthly-dividend' && <p className="my-2 text-[10px] text-slate-500">Each field shows its projected monthly payment. Bids decrease from maximum to minimum; actual receipts override those payment estimates. Enter receipt amounts to override individual months, then press Calculate my chit. Clear an override to restore its estimate.</p>}{receiptsPending && <p role="status" className="my-2 rounded-lg bg-amber-100 p-2 text-xs text-amber-900">Receipt changes pending. Totals below reflect the last calculation. Press Calculate my chit to refresh.</p>}
            {mode === 'monthly-dividend' ? <div role="region" aria-label="Monthly chit ledger" tabIndex={0} className="mt-2 max-h-[60dvh] overflow-auto rounded-xl border border-amber-200"><table className="w-full min-w-[640px] text-right text-xs tabular-nums"><thead className="sticky top-0 z-10 bg-amber-50 text-amber-950"><tr>{['Month Number', 'Group Bid Cut (\u20b9)', 'Member Dividend (\u20b9)', 'Amount Paid (\u20b9)', 'Cumulative Paid (\u20b9)'].map((heading) => <th key={heading} scope="col" className="whitespace-nowrap px-3 py-3">{heading}</th>)}</tr></thead><tbody>{result.paymentPlan.map((payment) => <tr key={payment.month} className={`border-t border-amber-100 ${payment.month === result.liftAt ? 'bg-amber-100' : 'bg-white'}`}><th scope="row" className="px-3 py-2 font-medium">{payment.month}</th><td className="px-3 py-2">{payment.biddingDiscount === null ? 'Not recorded' : money(payment.biddingDiscount)}</td><td className="px-3 py-2 text-emerald-700">{money(payment.dividend)}</td><td className="px-3 py-2 font-bold">{money(payment.cash)}</td><td className="px-3 py-2 font-semibold">{money(payment.cumulativePaid)}</td></tr>)}</tbody><tfoot className="border-t-2 border-amber-300 bg-amber-50 font-bold"><tr><th scope="row" className="px-3 py-3">Total</th><td className="px-3 py-3">-</td><td className="px-3 py-3">{money(result.totalReductions)}</td><td className="px-3 py-3">{money(result.totalPaid)}</td><td className="px-3 py-3">{money(result.totalPaid)}</td></tr></tfoot></table></div> : <>
            <div className="mt-2 max-h-56 overflow-y-auto"><table className="w-full text-right text-[11px]"><thead className="sticky top-0 bg-[#fffcf4]"><tr><th scope="col" className="py-2 text-left font-semibold">Month</th><th scope="col" className="py-2 font-semibold">Cash payment</th>{(mode === 'monthly-dividend' || result.ledgerCredits > 0) && <th scope="col" className="py-2 font-semibold">{mode === 'monthly-dividend' ? 'Reduction vs base' : 'Ledger used'}</th>}</tr></thead><tbody>{result.paymentPlan.map((payment) => <tr key={payment.month} className={`border-t border-amber-100 ${payment.month === result.liftAt ? 'bg-amber-100 text-amber-950 ring-1 ring-inset ring-amber-300' : ''}`}><th scope="row" className="py-2 text-left font-normal">{payment.month}{mode === 'monthly-dividend' && payment.month === result.liftAt ? ' · Pot Lifted' : ''}</th><td className="py-2 font-semibold">{money(payment.cash)}</td>{(mode === 'monthly-dividend' || result.ledgerCredits > 0) && <td className="py-2 text-slate-500">{money(payment.dividend)}</td>}</tr>)}</tbody><tfoot className="border-t-2 border-[#d5b974] bg-[#fff8e7]"><tr><th scope="row" className="py-3 text-left font-bold">{input.endedEarly === 'yes' ? 'Total paid' : 'Total payments'} · {result.months} months</th><td className="py-3 font-bold text-slate-900">{money(result.totalPaid)}</td>{(mode === 'monthly-dividend' || result.ledgerCredits > 0) && <td className="py-3 font-semibold">{money(mode === 'monthly-dividend' ? Math.round((result.basePayment * result.months - result.totalPaid) * 100) / 100 : result.ledgerCredits)}</td>}</tr></tfoot></table></div>
            </>}
          </details>}
          <div ref={feedbackRef} key={calculationCount} className={`relative flex items-center justify-between gap-3 overflow-hidden rounded-xl p-3 text-sm font-bold ${feedbackVisible ? 'chit-result-visible' : ''} ${result.net > 0 ? 'border border-emerald-200 bg-emerald-50' : result.net < 0 ? 'border border-rose-200 bg-rose-50 text-rose-700' : 'border border-amber-100'}`}>
            {result.net > 0 && <span className="chit-profit-sparkles pointer-events-none absolute inset-0" aria-hidden="true">{[12, 30, 52, 74, 90].map((left, index) => <span key={left} style={{ left: `${left}%`, top: index % 2 ? '65%' : '25%', animationDelay: `${index * 70}ms` }}>✦</span>)}</span>}
            <span className="relative flex items-center gap-2">{result.net < 0 && <span className="chit-loss-feedback material-symbols-outlined text-[22px]" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>thumb_down</span>}{result.net > 0 ? 'Net earnings (profit)' : result.net < 0 ? (result.liftAt < result.months ? 'Borrowing cost (extra paid)' : 'Net loss (extra paid)') : 'No profit or loss'}</span><span className={`relative rounded-md px-2 py-0.5 ${result.net >= 0 ? 'text-emerald-700' : 'bg-rose-50 text-rose-600'}`}>{money(Math.abs(result.net))}</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-600">{result.net < 0 ? result.liftAt < result.months ? `Taking the pot in month ${result.liftAt} costs ${money(Math.abs(result.net))} more than you receive over the whole chit. This is the estimated cost of early access to the money, not an annual interest rate.` : `Your total payments exceed your payout by ${money(Math.abs(result.net))}. This is your net loss.` : result.net > 0 ? `After all payments, auction cuts and fees, you receive ${money(result.net)} more than you pay. This is your estimated net profit.` : 'Your payout and total payments are equal. There is no net profit or loss.'} {input.paymentSchedule?.trim() ? 'Based on your entered payments.' : 'Future payments are estimates, not guaranteed returns.'}</p>
          <p className="text-[10px] leading-relaxed text-slate-500">The lift-month instalment is included before payout. This estimate uses the payments and deductions you entered; auction outcomes and dividends may vary. It does not calculate interest or the time value of receiving money early.</p>
        </div>}
      </form>}
      </div></div></dialog>}
    </>
  );
}
