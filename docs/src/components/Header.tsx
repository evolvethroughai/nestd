import React from 'react';
import { TabType } from '../types';
import { USER_AVATAR } from '../data/mockData';

interface HeaderProps {
  currentTab: TabType;
  onOpenProfile: () => void;
  statusBadgeText?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenProfile,
  statusBadgeText,
}) => {
  const badgeLabel = statusBadgeText || (currentTab === 'today' ? 'All Sorted' : 'Get Sortd.');

  return (
    <header className="sticky top-0 w-full z-40 bg-surface/85 backdrop-blur-xl border-b border-outline-variant/20 shadow-[0_1px_8px_rgba(0,0,0,0.03)] pt-safe">
      <div className="h-16 px-4 max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="font-display font-extrabold text-2xl tracking-tight text-on-surface">
            Nestd
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100/70 border border-emerald-200/50 text-emerald-800 text-xs font-semibold select-none shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>{badgeLabel}</span>
          </div>
        </div>

        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 p-1 pl-2.5 rounded-full hover:bg-surface-container/60 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          title="Profile settings"
        >
          <div className="text-right hidden sm:block">
            <span className="block text-xs font-semibold text-on-surface leading-none">
              Jeevan
            </span>
          </div>
          <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary/20 bg-primary/10 flex items-center justify-center shrink-0 shadow-xs">
            <img
              src={USER_AVATAR}
              alt="Jeevan profile"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback to initial/icon if image fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span className="material-symbols-outlined text-primary text-[18px]">
              person
            </span>
          </div>
        </button>
      </div>
    </header>
  );
};
