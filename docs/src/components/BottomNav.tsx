import React from 'react';
import { TabType } from '../types';

interface BottomNavProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
  uncompletedTasksCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onChangeTab,
  uncompletedTasksCount,
}) => {
  return (
    <nav className="sticky bottom-0 inset-x-0 z-40 pb-safe bg-surface-container-lowest/95 backdrop-blur-xl border-t border-outline-variant/30 shadow-[0_-2px_16px_rgba(70,72,212,0.06)] w-full">
      <div className="flex justify-around items-center h-16 px-4 max-w-md mx-auto">
        {/* Today Tab */}
        <button
          onClick={() => onChangeTab('today')}
          aria-current={currentTab === 'today' ? 'page' : undefined}
          className={`flex-1 flex flex-col items-center justify-center gap-1 h-full min-w-[44px] min-h-[44px] group active:scale-95 transition-all duration-200 ${
            currentTab === 'today' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <div
            className={`w-12 h-7 rounded-full flex items-center justify-center transition-all relative ${
              currentTab === 'today'
                ? 'bg-primary/10 ring-1 ring-primary/20 shadow-xs'
                : 'group-hover:bg-surface-container'
            }`}
          >
            <svg
              className={`w-5 h-5 transition-colors ${
                currentTab === 'today' ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary'
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth={currentTab === 'today' ? '2.1' : '1.8'}
              viewBox="0 0 24 24"
            >
              <rect x="3" y="4" width="18" height="18" rx="4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="8" cy="15" r="1" fill="currentColor" />
              <circle cx="12" cy="15" r="1" fill="currentColor" />
              <circle cx="16" cy="15" r="1" fill="currentColor" />
            </svg>
            {uncompletedTasksCount > 0 && currentTab !== 'today' && (
              <span className="absolute -top-1 -right-0.5 w-2 h-2 rounded-full bg-primary" />
            )}
          </div>
          <span
            className={`font-display text-[11px] tracking-tight transition-colors ${
              currentTab === 'today' ? 'font-bold text-primary' : 'font-medium text-on-surface-variant group-hover:text-primary'
            }`}
          >
            Today
          </span>
        </button>

        {/* Lists Tab */}
        <button
          onClick={() => onChangeTab('lists')}
          aria-current={currentTab === 'lists' ? 'page' : undefined}
          className={`flex-1 flex flex-col items-center justify-center gap-1 h-full min-w-[44px] min-h-[44px] group active:scale-95 transition-all duration-200 ${
            currentTab === 'lists' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <div
            className={`w-12 h-7 rounded-full flex items-center justify-center transition-all ${
              currentTab === 'lists'
                ? 'bg-primary/10 ring-1 ring-primary/20 shadow-xs'
                : 'group-hover:bg-surface-container'
            }`}
          >
            <svg
              className={`w-5 h-5 transition-colors ${
                currentTab === 'lists' ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary'
              }`}
              fill={currentTab === 'lists' ? 'currentColor' : 'none'}
              stroke={currentTab === 'lists' ? 'none' : 'currentColor'}
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              {currentTab === 'lists' ? (
                <>
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M2.25 6A2.25 2.25 0 014.5 3.75h4.15a2.25 2.25 0 011.59.66l1.34 1.34h7.17A2.25 2.25 0 0121 8v10.5A2.25 2.25 0 0118.75 20.75H4.5A2.25 2.25 0 012.25 18.5V6zm2.25-.75a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h14.25a.75.75 0 00.75-.75V8a.75.75 0 00-.75-.75H11.5a.75.75 0 01-.53-.22L9.63 5.69a.75.75 0 00-.53-.22H4.5z"
                  />
                  <rect x="6" y="10.5" width="9" height="4.5" rx="1" opacity="0.75" />
                </>
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                />
              )}
            </svg>
          </div>
          <span
            className={`font-display text-[11px] tracking-tight transition-colors ${
              currentTab === 'lists' ? 'font-bold text-primary' : 'font-medium text-on-surface-variant group-hover:text-primary'
            }`}
          >
            Lists
          </span>
        </button>

        {/* Sorti / Companion Tab */}
        <button
          onClick={() => onChangeTab('ask')}
          aria-current={currentTab === 'ask' ? 'page' : undefined}
          className={`flex-1 flex flex-col items-center justify-center gap-1 h-full min-w-[44px] min-h-[44px] group active:scale-95 transition-all duration-200 ${
            currentTab === 'ask' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <div
            className={`w-12 h-7 rounded-full flex items-center justify-center transition-all ${
              currentTab === 'ask'
                ? 'bg-primary/10 ring-1 ring-primary/20 shadow-xs'
                : 'group-hover:bg-surface-container'
            }`}
          >
            <div className="relative flex items-center justify-center shrink-0 w-5 h-5 rounded-[6px] bg-gradient-to-tr from-primary to-primary-container p-[1px]">
              <div className="w-full h-full rounded-[5px] bg-surface-container-lowest flex items-center justify-center overflow-hidden">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2C12 7.5 7.5 12 2 12C7.5 12 12 16.5 12 22C12 16.5 16.5 12 22 12C16.5 12 12 7.5 12 2Z"
                    fill="#4648d4"
                  />
                  <circle cx="12" cy="12" r="2.2" fill="#ffffff" />
                </svg>
              </div>
            </div>
          </div>
          <span
            className={`font-display text-[11px] tracking-tight transition-colors ${
              currentTab === 'ask' ? 'font-bold text-primary' : 'font-medium text-on-surface-variant group-hover:text-primary'
            }`}
          >
            Sorti
          </span>
        </button>
      </div>
    </nav>
  );
};
