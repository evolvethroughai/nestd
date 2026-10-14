import React, { useState } from 'react';
import { BillItem, SubBillItem } from '../types';

interface BillsManagerProps {
  bills: BillItem[];
  subBills: SubBillItem[];
  onToggleBill: (id: string) => void;
  onToggleSubBill: (id: string) => void;
  onAddSubBill: (parentId: string, name: string, consumerNo: string, dueDay: number) => void;
  onDeleteSubBill: (id: string) => void;
}

const BILL_PORTALS: Record<
  string,
  { name: string; url: string; param?: string; hint: string; payUrl: string }
> = {
  electricity: {
    name: 'TGSPDCL',
    url: 'https://tgsouthernpower.org/#consumer-service/online/bill-enquiry',
    hint: 'Service / USC number',
    payUrl: 'https://www.amazon.in/apay/detail/electricity',
  },
  water: {
    name: 'HMWS&SB',
    url: 'https://www.hyderabadwater.gov.in/billpayment',
    param: 'consumerNo',
    hint: 'Consumer number',
    payUrl: 'https://pay.amazon.in/water-bill',
  },
  mobile: {
    name: 'Mobile Recharge',
    url: 'https://www.airtel.in/recharge-online',
    param: 'mobile',
    hint: '10-digit mobile number',
    payUrl: 'https://pay.amazon.in/mobile-recharge',
  },
  gas: {
    name: 'LPG',
    url: 'https://www.mylpg.in',
    hint: 'LPG consumer number',
    payUrl: 'https://pay.amazon.in/lpg-cylinder',
  },
  fibernet: {
    name: 'Jio Fibernet',
    url: 'https://www.jio.com/selfcare/plans/broadband',
    hint: 'Account / RMN',
    payUrl: 'https://pay.amazon.in/broadband-bill',
  },
};

export const BillsManager: React.FC<BillsManagerProps> = ({
  bills,
  subBills,
  onToggleBill,
  onToggleSubBill,
  onAddSubBill,
  onDeleteSubBill,
}) => {
  const [openParents, setOpenParents] = useState<Record<string, boolean>>({
    bill1: true,
  });

  const [copiedNo, setCopiedNo] = useState<string | null>(null);
  const [addSubModalParentId, setAddSubModalParentId] = useState<string | null>(null);
  const [newSubName, setNewSubName] = useState('');
  const [newSubConsumerNo, setNewSubConsumerNo] = useState('');
  const [newSubDueDay, setNewSubDueDay] = useState('15');

  const toggleParent = (id: string) => {
    setOpenParents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNo(text);
    setTimeout(() => setCopiedNo(null), 2000);
  };

  const getPortal = (billName: string) => {
    const lower = billName.toLowerCase();
    for (const key of Object.keys(BILL_PORTALS)) {
      if (lower.includes(key)) return BILL_PORTALS[key];
    }
    return null;
  };

  const handleAddSubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addSubModalParentId || !newSubName.trim()) return;

    onAddSubBill(
      addSubModalParentId,
      newSubName.trim(),
      newSubConsumerNo.trim(),
      parseInt(newSubDueDay) || 15
    );

    setAddSubModalParentId(null);
    setNewSubName('');
    setNewSubConsumerNo('');
  };

  return (
    <div className="flex flex-col w-full space-y-3 pb-6 animate-fadeIn">
      {bills.map((bill) => {
        const portal = getPortal(bill.name);
        const relatedSubs = subBills.filter((s) => s.parentId === bill.id);
        const isOpen = openParents[bill.id] ?? false;

        return (
          <div
            key={bill.id}
            className="rounded-2xl border border-rose-200/80 bg-gradient-to-br from-[#fff1f2] to-[#fecdd3] shadow-xs overflow-hidden"
          >
            {/* Parent Bill Header */}
            <div className="p-3.5 flex items-center justify-between">
              <div
                onClick={() => toggleParent(bill.id)}
                className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer select-none"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-300/40 flex items-center justify-center text-xl shrink-0">
                  {bill.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-display font-extrabold text-sm text-rose-950">
                      {bill.name}
                    </h4>
                    {relatedSubs.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-200/80 text-rose-900 text-[10px] font-bold">
                        {relatedSubs.length} connections
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-rose-800 font-medium mt-0.5">
                    {bill.amt && <span className="font-bold">Total: ₹{bill.amt}</span>}
                    {bill.due && <span>• {bill.due}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onToggleBill(bill.id)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    bill.paid
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white/80 border border-rose-300 text-rose-700 hover:bg-rose-600 hover:text-white'
                  }`}
                  title={bill.paid ? 'Paid' : 'Mark bill paid'}
                >
                  {bill.paid ? '✓' : ''}
                </button>

                <button
                  onClick={() => toggleParent(bill.id)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-rose-700"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                  </span>
                </button>
              </div>
            </div>

            {/* Sub-bills and Connections Feed */}
            {isOpen && (
              <div className="p-3.5 pt-0 space-y-2 border-t border-rose-200/50 bg-white/40">
                {relatedSubs.length === 0 ? (
                  <p className="text-xs text-rose-900/70 py-1 italic">
                    No connections added yet. Add a meter or account number below.
                  </p>
                ) : (
                  relatedSubs.map((sub) => {
                    const checkUrl =
                      sub.billUrl ||
                      (portal?.url && sub.consumerNo && portal.param
                        ? `${portal.url}?${portal.param}=${encodeURIComponent(sub.consumerNo)}`
                        : portal?.url);
                    const payUrl = sub.payUrl || portal?.payUrl;

                    return (
                      <div
                        key={sub.id}
                        className="p-3 rounded-xl bg-white/90 border border-rose-200 space-y-2 text-xs shadow-2xs"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-display font-bold text-rose-950 text-xs block">
                              ↳ {sub.name}
                            </span>
                            {sub.consumerNo && (
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="font-mono text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                                  {sub.consumerNo}
                                </span>
                                <button
                                  onClick={() => copyToClipboard(sub.consumerNo!)}
                                  className="px-2 py-0.5 rounded-md bg-rose-100 hover:bg-rose-200 text-rose-800 text-[10px] font-bold transition-colors"
                                >
                                  {copiedNo === sub.consumerNo ? 'Copied!' : 'Copy'}
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {sub.lastAmt && (
                              <span className="font-bold text-rose-900">₹{sub.lastAmt}</span>
                            )}
                            <button
                              onClick={() => onToggleSubBill(sub.id)}
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                                sub.paid
                                  ? 'bg-emerald-600 text-white'
                                  : 'border border-slate-300 text-slate-400'
                              }`}
                              title="Mark connection paid"
                            >
                              {sub.paid ? '✓' : ''}
                            </button>
                            <button
                              onClick={() => onDeleteSubBill(sub.id)}
                              className="text-slate-400 hover:text-rose-600 text-[13px]"
                              title="Delete connection"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {/* Action Portal Links */}
                        {(checkUrl || payUrl) && (
                          <div className="flex gap-2 pt-1 border-t border-rose-100">
                            {checkUrl && (
                              <a
                                href={checkUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-900 font-bold text-[11px] flex items-center gap-1 transition-colors"
                              >
                                <span>🔗</span> Check Bill
                              </a>
                            )}
                            {payUrl && (
                              <a
                                href={payUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
                              >
                                <span>💳</span> Pay Now
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}

                {/* Add Connection Button */}
                <button
                  onClick={() => setAddSubModalParentId(bill.id)}
                  className="w-full py-2 rounded-xl bg-white border border-rose-300 hover:bg-rose-50 text-rose-800 font-display text-[11px] font-bold transition-all flex items-center justify-center gap-1"
                >
                  <span>+ Add Connection / Meter</span>
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Add Connection Modal */}
      {addSubModalParentId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl w-full max-w-sm p-5 border border-outline-variant/30 shadow-2xl relative">
            <button
              onClick={() => setAddSubModalParentId(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center"
            >
              ✕
            </button>

            <h3 className="font-display font-extrabold text-base text-on-surface mb-1">
              Add Connection / Meter
            </h3>
            <p className="text-xs text-on-surface-variant mb-3">
              Track multiple meters, consumer numbers, or connections
            </p>

            <form onSubmit={handleAddSubSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-on-surface block mb-1">Connection Label</label>
                <input
                  type="text"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="e.g. Meter 3 (Ground Floor)"
                  className="w-full bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/30"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-on-surface block mb-1">Consumer / USC Number</label>
                <input
                  type="text"
                  value={newSubConsumerNo}
                  onChange={(e) => setNewSubConsumerNo(e.target.value)}
                  placeholder="e.g. 104829108"
                  className="w-full bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/30"
                />
              </div>

              <div>
                <label className="font-bold text-on-surface block mb-1">Due Day of Month</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={newSubDueDay}
                  onChange={(e) => setNewSubDueDay(e.target.value)}
                  placeholder="15"
                  className="w-full bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/30"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-rose-600 text-white font-display font-bold text-xs shadow-xs hover:bg-rose-700 transition-all"
              >
                Save Connection
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
