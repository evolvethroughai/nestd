import React from 'react';
import { TabType } from '../types';
import { User } from '../firebase';

interface HeaderProps {
  currentTab: TabType;
  onOpenProfile: () => void;
  user: User | null;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onOpenProfile, user }) => {
  const firstName = user?.displayName?.split(' ')[0];
  const photoURL = user?.photoURL;

  return (
    <header className="sticky top-0 w-full z-40 bg-surface/85 backdrop-blur-xl border-b border-outline-variant/20 shadow-[0_1px_8px_rgba(0,0,0,0.03)] pt-safe">
      <div className="h-16 px-4 max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="font-display font-extrabold text-2xl tracking-tight text-on-surface">
            Nestd
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100/70 border border-emerald-200/50 text-emerald-800 text-xs font-semibold select-none shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>Get Sortd.</span>
          </div>
        </div>

        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 p-1 pl-2.5 rounded-full hover:bg-surface-container/60 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          title="Profile & Settings"
        >
          <div className="text-right hidden sm:block">
            {firstName && (
              <span className="block text-xs font-semibold text-on-surface leading-none">
                {firstName}
              </span>
            )}
            {user && (
              <span className="block text-[10px] text-emerald-600 font-medium leading-none mt-0.5">
                Synced ✓
              </span>
            )}
          </div>
          <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary/20 bg-primary/10 flex items-center justify-center shrink-0 shadow-xs">
            {photoURL ? (
              <img
                src={photoURL}
                alt={firstName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="material-symbols-outlined text-primary text-[18px]">
                {user ? 'person' : 'lock'}
              </span>
            )}
          </div>
        </button>
      </div>
    </header>
  );
};
