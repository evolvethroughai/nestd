import React, { useState } from 'react';
import { AutomationLog, TabType } from '../types';

interface SortiScreenProps {
  automations: AutomationLog[];
  onAutoSort: (text: string) => { item: string; destination: string; category: string };
  onNavigateTab: (tab: TabType) => void;
}

export const SortiScreen: React.FC<SortiScreenProps> = ({
  automations,
  onAutoSort,
  onNavigateTab,
}) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSortedResult, setLastSortedResult] = useState<{
    item: string;
    destination: string;
    category: string;
  } | null>(null);
  const [isListening, setIsListening] = useState(false);

  const handleSort = () => {
    if (!inputText.trim() || isProcessing) return;

    setIsProcessing(true);
    setLastSortedResult(null);

    setTimeout(() => {
      const result = onAutoSort(inputText.trim());
      setLastSortedResult(result);
      setInputText('');
      setIsProcessing(false);
    }, 600);
  };

  const handleSuggestionClick = (prompt: string) => {
    setInputText(prompt);
  };

  const toggleMic = () => {
    setIsListening(true);
    setTimeout(() => {
      setInputText('Add organic honey and walnuts to pantry');
      setIsListening(false);
    }, 1400);
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-4 pb-28 pt-2 space-y-5">
      {/* Hero Header */}
      <div className="flex items-center gap-4 pt-1">
        <div className="relative flex items-center justify-center shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary via-primary-container to-tertiary p-[1.5px] shadow-[0_4px_20px_rgba(70,72,212,0.22)]">
          <div className="w-full h-full rounded-[14px] bg-surface-container-lowest flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-tertiary/5 to-transparent" />
            <svg className="w-8 h-8 relative z-10" fill="none" viewBox="0 0 32 32">
              <defs>
                <linearGradient id="sortiAura" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4648d4" />
                  <stop offset="50%" stopColor="#6063ee" />
                  <stop offset="100%" stopColor="#e06d53" />
                </linearGradient>
                <linearGradient id="sortiCenter" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4648d4" />
                  <stop offset="100%" stopColor="#2f2ebe" />
                </linearGradient>
              </defs>
              <circle cx="16" cy="16" r="4" fill="url(#sortiCenter)" />
              <path
                d="M16 3C16 10 10 16 3 16C10 16 16 22 16 29C16 22 22 16 29 16C22 16 16 10 16 3Z"
                fill="url(#sortiAura)"
                fillOpacity="0.9"
              />
              <circle
                cx="16"
                cy="16"
                r="9.5"
                stroke="url(#sortiAura)"
                strokeDasharray="1.5 3"
                strokeLinecap="round"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>

        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-extrabold text-on-surface tracking-tight">
              Sorti
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-display text-[11px] font-bold tracking-wide uppercase">
              Companion
            </span>
          </div>
          <p className="text-xs text-on-surface-variant font-medium leading-tight">
            Your Nestd Mind · Speak or type to auto-sort anything
          </p>
        </div>
      </div>

      {/* Main AI Sorting Input Card */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-outline-variant/30 flex flex-col gap-3 relative">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            isListening
              ? 'Listening to your voice prompt...'
              : "Ask Sorti anything... 'Remind me to call plumber at 4pm' or 'Add organic honey to pantry'"
          }
          rows={3}
          className="w-full bg-surface-container-low/60 rounded-xl p-3.5 text-on-surface text-xs md:text-sm placeholder:text-on-surface-variant/60 focus:outline-none focus:bg-surface-container-low transition-colors resize-none leading-relaxed"
        />

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={toggleMic}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse'
                : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low active:scale-95'
            }`}
            title="Voice input"
          >
            <span className="material-symbols-outlined text-[20px]">mic</span>
          </button>

          <button
            type="button"
            onClick={handleSort}
            disabled={!inputText.trim() || isProcessing}
            className="py-2.5 px-5 rounded-full bg-primary hover:bg-primary-container disabled:opacity-40 text-on-primary font-display text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
          >
            {isProcessing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Sorting...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                <span>Sort It</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Real-time Sorting Feedback Toast / Banner */}
      {lastSortedResult && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 shadow-2xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-emerald-600 text-[20px]">
              check_circle
            </span>
            <div>
              <p className="text-xs font-bold text-emerald-950">
                Routed to <span className="underline">{lastSortedResult.destination}</span>!
              </p>
              <p className="text-[11px] text-emerald-800">
                "{lastSortedResult.item}" is now organized.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab(lastSortedResult.category === 'Today' ? 'today' : 'lists')}
            className="text-[11px] font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg transition-colors"
          >
            View ›
          </button>
        </div>
      )}

      {/* Quick Suggestions */}
      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-semibold text-on-surface-variant/80">
          Quick suggestions
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleSuggestionClick('🛒 Milk & eggs to grocery')}
            className="px-3 py-1.5 rounded-full bg-surface-container-lowest border border-outline-variant/30 hover:bg-surface-container-low text-on-surface text-xs font-medium flex items-center gap-1.5 transition-all shadow-2xs active:scale-95"
          >
            <span>🛒</span>
            <span>Milk & eggs to grocery</span>
          </button>

          <button
            type="button"
            onClick={() => handleSuggestionClick('⚡ BESCOM bill ₹3,605 paid')}
            className="px-3 py-1.5 rounded-full bg-surface-container-lowest border border-outline-variant/30 hover:bg-surface-container-low text-on-surface text-xs font-medium flex items-center gap-1.5 transition-all shadow-2xs active:scale-95"
          >
            <span>⚡</span>
            <span>BESCOM bill ₹3,605 paid</span>
          </button>

          <button
            type="button"
            onClick={() => handleSuggestionClick('📅 Focus tomorrow at 10am')}
            className="px-3 py-1.5 rounded-full bg-surface-container-lowest border border-outline-variant/30 hover:bg-surface-container-low text-on-surface text-xs font-medium flex items-center gap-1.5 transition-all shadow-2xs active:scale-95"
          >
            <span>📅</span>
            <span>Focus tomorrow at 10am</span>
          </button>

          <button
            type="button"
            onClick={() => handleSuggestionClick('🥦 Baby spinach to vegetables list')}
            className="px-3 py-1.5 rounded-full bg-surface-container-lowest border border-outline-variant/30 hover:bg-surface-container-low text-on-surface text-xs font-medium flex items-center gap-1.5 transition-all shadow-2xs active:scale-95"
          >
            <span>🥦</span>
            <span>Baby spinach to veggies</span>
          </button>
        </div>
      </div>

      {/* Recent Automations List */}
      <div className="flex flex-col gap-2 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
            Recent automations
          </span>
          <span className="text-[11px] text-on-surface-variant font-medium">
            {automations.length} total
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {automations.map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigateTab(item.destinationCategory === 'Today' ? 'today' : 'lists')}
              className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs hover:border-primary/40 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-xs md:text-sm font-semibold text-on-surface">
                  {item.item}
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  Sorted by <span className="text-primary font-bold">Sorti</span> into{' '}
                  <span className="text-primary font-semibold">{item.destination}</span>
                </span>
              </div>
              <span className="text-[11px] text-on-surface-variant/70 shrink-0 ml-2">
                {item.timeAgo}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
