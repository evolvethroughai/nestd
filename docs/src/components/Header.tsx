import React from 'react';
import { TabType } from '../types';
import { User } from '../firebase';

interface HeaderProps {
  currentTab: TabType;
  onOpenProfile: () => void;
  user: User | null;
  compact: boolean;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onOpenProfile, user, compact }) => {
  const firstName = user?.displayName?.split(' ')[0];
  const photoURL = user?.photoURL;

  return (
    <header className={`sticky top-0 w-full z-40 overflow-hidden pt-safe text-white shadow-[0_8px_24px_rgba(55,48,163,0.16)] ${compact ? 'bg-[#f3f4ff]' : 'bg-gradient-to-r from-indigo-800 via-primary to-violet-700'}`}>
      <div className={`pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/10 blur-2xl transition-opacity duration-500 ${compact ? 'opacity-0' : 'opacity-100'}`} />
      <div className={`relative z-10 ${compact ? 'h-[50px]' : 'h-[72px]'} px-5 max-w-md mx-auto flex items-center justify-between transition-[height] duration-500 ease-in-out`}>
        <div className="flex items-center gap-2.5">
          <span className={`font-display font-extrabold tracking-tight transition-all duration-500 ease-in-out ${compact ? 'text-[19px] text-indigo-950' : 'text-[26px] text-white'}`}>
            Nestd
          </span>
          <div className={`flex items-center gap-1.5 rounded-full font-semibold select-none overflow-hidden transition-all duration-500 ease-in-out ${compact ? 'max-w-28 px-2 py-1 text-[9px] opacity-100 bg-indigo-100/80 border border-indigo-200/70 text-indigo-800 shadow-none' : 'max-w-40 px-3 py-1.5 text-xs opacity-100 bg-white/15 border border-white/20 text-white shadow-sm backdrop-blur-sm'}`}>
            <span className={`${compact ? 'w-1 h-1' : 'w-1.5 h-1.5'} rounded-full bg-emerald-400 animate-pulse transition-all duration-500`} />
            <span>Get Sortd.</span>
          </div>
        </div>

        <button
          onClick={onOpenProfile}
          className={`flex items-center gap-2 p-1 rounded-full active:scale-95 transition-all focus:outline-none focus-visible:ring-2 ${compact ? 'hover:bg-indigo-50 focus-visible:ring-primary' : 'pl-2.5 hover:bg-white/10 focus-visible:ring-white'}`}
          title="Profile & Settings"
        >
          <div className="text-right hidden sm:block">
            {firstName && (
              <span className={`block text-xs font-semibold leading-none ${compact ? 'text-indigo-950' : 'text-white'}`}>
                {firstName}
              </span>
            )}
            {user && (
              <span className={`block text-[10px] font-medium leading-none mt-0.5 ${compact ? 'text-emerald-700' : 'text-emerald-200'}`}>
                Synced ✓
              </span>
            )}
          </div>
          <div className={`relative ${compact ? 'w-8 h-8 ring-indigo-200 bg-white/70' : 'w-10 h-10 ring-white/40 bg-white/15'} rounded-full overflow-hidden ring-2 flex items-center justify-center shrink-0 shadow-sm transition-all duration-500 ease-in-out`}>
            {photoURL ? (
              <img
                src={photoURL}
                alt={firstName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className={`material-symbols-outlined transition-colors duration-500 ${compact ? 'text-indigo-700 text-[18px]' : 'text-white text-[20px]'}`}>
                {user ? 'person' : 'lock'}
              </span>
            )}
          </div>
        </button>
      </div>
    </header>
  );
};
