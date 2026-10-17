import { useState } from 'react';

const GuideStep = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div><p className="font-semibold text-[#594321]">{title}</p><p className="mt-0.5 leading-relaxed text-slate-600">{children}</p></div>
);

function ChitProfitExample() {
  return <div className="space-y-2 rounded-xl bg-white/80 p-3 leading-relaxed">
    <p className="font-bold text-[#594321]">How much profit or loss?</p>
    <p>Example: after all monthly payments and final adjustments, you paid <b>₹4,20,000 in total</b>.</p>
    <div className="space-y-2">
      <p><b>Take it early:</b> if you receive ₹3,90,000 after auction cuts and fees, your <b className="text-rose-600">loss is ₹30,000</b>.</p>
      <p><b>Take it midway:</b> if you receive ₹4,05,000 after cuts and fees, your <b className="text-rose-600">loss is ₹15,000</b>.</p>
      <p><b>Take it at the end:</b> if you receive ₹4,50,000, your <b className="text-emerald-700">profit is ₹30,000</b>.</p>
    </div>
    <p className="border-t border-[#e6d5aa] pt-2 font-semibold text-[#715017]">Received more than you paid = profit.<br />Paid more than you received = loss.</p>
    <p className="text-[10px] text-slate-500">Examples only. The month alone does not decide profit. Your payout after cuts and fees, and every payment until closing, decide the result.</p>
  </div>;
}

export function ChitGuide() {
  const [activeChitTypeCard, setActiveChitTypeCard] = useState<'card1' | 'card2' | null>(null);
  const toggleCard = (card: 'card1' | 'card2') => setActiveChitTypeCard((current) => current === card ? null : card);
  return <section aria-label="How chits work" className="space-y-2.5">
    <div className="px-1"><h3 className="text-sm font-bold text-[#594321]">How chits work</h3><p className="mt-0.5 text-[11px] text-[#856a3c]">Choose a topic to understand your payments, payout and returns.</p></div>
    <article className="overflow-hidden rounded-2xl border border-[#e5d7b5] bg-[#fffdf7]">
      <button type="button" aria-expanded={activeChitTypeCard === 'card1'} aria-controls="dividend-chit-help" onClick={() => toggleCard('card1')} className="flex w-full items-center justify-between gap-3 p-3.5 text-left"><span><span className="block text-xs font-bold text-[#594321]">1. Dividend-Distributed Chit</span><span className="mt-1 block text-[11px] text-[#856a3c]">Variable instalment · pay a different amount each month</span></span><span aria-hidden="true" className="text-[#9a7b3f]">{activeChitTypeCard === 'card1' ? '▾' : '▸'}</span></button>
      <div id="dividend-chit-help" hidden={activeChitTypeCard !== 'card1'} className="border-t border-amber-100 p-3">
    <div className="space-y-2 text-xs leading-relaxed text-slate-600">
      <details className="rounded-xl border border-amber-200 bg-white p-3"><summary className="cursor-pointer font-semibold text-slate-900">1. The Core Setup</summary><div className="mt-3 space-y-2"><p><strong>Total Pot Value:</strong> The full value of your chit, such as ₹4,50,000.</p><p><strong>Duration:</strong> The agreed number of months, such as 30.</p><p className="rounded-lg bg-amber-50 p-2 text-amber-900">Base monthly payment = Total value / Months<br />₹4,50,000 / 30 = ₹15,000.</p></div></details>
      <details className="rounded-xl border border-amber-200 bg-white p-3"><summary className="cursor-pointer font-semibold text-slate-900">2. Monthly Auctions &amp; Dividends</summary><div className="mt-3 space-y-2"><p>Members bid to take the pot. Taking it is called lifting. The winner agrees to receive less than the full pot; this reduction is the auction discount.</p><p><strong>Foreman commission:</strong> The organiser's agreed service charge comes out of the auction discount. In this calculator, the percentage applies to the full chit value.</p><p><strong>Your dividend:</strong> The remaining discount is shared across member tickets. In a dividend-distributed chit, your share reduces your monthly payment.</p><p className="rounded-lg bg-amber-50 p-2 text-amber-900">₹60,000 discount - ₹22,500 commission = ₹37,500.<br />Across 30 tickets, your share is ₹1,250.<br />You pay ₹15,000 - ₹1,250 = ₹13,750.</p></div></details>
      <details className="rounded-xl border border-amber-200 bg-white p-3"><summary className="cursor-pointer font-semibold text-slate-900">3. Month 1 Rule</summary><p className="mt-3">This calculator assumes no dividend in month 1, so you pay the full base amount: ₹15,000 in this example. First-month arrangements depend on your agreement; this is a calculation assumption, not a universal legal rule.</p></details>
      <details className="rounded-xl border border-amber-200 bg-white p-3"><summary className="cursor-pointer font-semibold text-slate-900">4. Saver vs. Borrower</summary><div className="mt-3 space-y-3"><p><strong>Take it early - Borrower:</strong> You receive money earlier, after your bidding discount and fees. You must still make the remaining payments. If total payments exceed your payout, the difference is your borrowing cost.</p><p><strong>Wait until the end - Saver:</strong> Monthly dividends can reduce your payments. If your final payout exceeds everything you paid, the difference is profit. Profit is not guaranteed; your agreement may also include final-payout deductions.</p><p className="rounded-lg bg-slate-50 p-2 font-medium">Net return = Payout received - Total cash paid.</p></div></details>
      <p className="border-t border-amber-200 pt-3 text-[11px] text-slate-500">Estimates use your bidding ranges, duration and commission settings. Actual auctions and agreement terms may differ. Borrowing cost is a cash difference, not an annual interest rate.</p>
    </div>
      </div>
    </article>
    <article className="overflow-hidden rounded-2xl border border-[#d9c18a] bg-[#f9efd8]">
      <button type="button" aria-expanded={activeChitTypeCard === 'card2'} aria-controls="accumulated-chit-help" onClick={() => toggleCard('card2')} className="flex w-full items-center justify-between gap-3 p-3.5 text-left"><span><span className="block text-xs font-bold text-[#594321]">2. Accumulated Dividend Chit</span><span className="mt-1 block text-[11px] text-[#856a3c]">Fixed instalment · saved credit reduces final payments</span></span><span aria-hidden="true" className="text-[#9a7b3f]">{activeChitTypeCard === 'card2' ? '▾' : '▸'}</span></button>
      <div id="accumulated-chit-help" hidden={activeChitTypeCard !== 'card2'} className="px-3.5 pb-3.5">
<div className="mt-3 space-y-3 border-t border-[#e4d2ab] pt-3 text-[11px]">
        <GuideStep title="Keep paying the same amount">For the same ₹4,50,000, 30-month example, you normally pay ₹15,000 each month.</GuideStep>
        <GuideStep title="Your dividend share stays with the organiser">Instead of reducing each monthly payment, the organiser records your credit and applies it to final instalments, if your agreement uses this arrangement.</GuideStep>
        <GuideStep title="Credit can cover the last payments">With ₹30,000 saved credit, months 29 and 30 can be covered. You pay 28 × ₹15,000 = ₹4,20,000 in cash. The chit still runs for 30 months.</GuideStep>
        <GuideStep title="What if your last payment is ₹7,500?">For example, you paid ₹15,000 for 28 months, then ₹7,500. Your total paid is ₹4,27,500. If you receive ₹4,50,000, your profit is ₹22,500.</GuideStep>
        <ChitProfitExample />
        <p className="text-[10px] leading-relaxed text-slate-500">These credit amounts are examples, not promised returns. The calculator does not ask you to guess dividends. Enter known payments and the actual final amount when the chit is closed. Its result compares cash paid and received; it is not an annual interest rate.</p>
      </div>
      </div>
    </article>
  </section>;
}
