import React from 'react';
import { USER_AVATAR } from '../data/mockData';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetData: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onResetData,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl w-full max-w-sm p-6 border border-outline-variant/30 shadow-2xl relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden ring-4 ring-primary/20 shadow-md mb-3">
          <img
            src={USER_AVATAR}
            alt="Jeevan"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <h3 className="font-display font-extrabold text-xl text-on-surface">
          Jeevan Rao
        </h3>
        <p className="text-xs text-on-surface-variant font-medium">
          Product Thinker · Bangalore, India
        </p>

        <div className="grid grid-cols-2 gap-2 my-5">
          <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20 text-center">
            <span className="font-display font-extrabold text-lg text-primary block">
              5 Days
            </span>
            <span className="text-[11px] font-medium text-on-surface-variant">
              Clarity Streak
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20 text-center">
            <span className="font-display font-extrabold text-lg text-emerald-700 block">
              100%
            </span>
            <span className="text-[11px] font-medium text-on-surface-variant">
              Sortd Accuracy
            </span>
          </div>
        </div>

        <div className="space-y-2 text-left text-xs mb-6">
          <div className="p-3 rounded-xl bg-white border border-outline-variant/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">
                notifications_active
              </span>
              <span className="font-semibold text-on-surface">Daily Mindful Reminders</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>

          <div className="p-3 rounded-xl bg-white border border-outline-variant/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">
                psychology
              </span>
              <span className="font-semibold text-on-surface">Sorti Mind Model</span>
            </div>
            <span className="text-[11px] font-bold text-primary">Active</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              onResetData();
              onClose();
            }}
            className="py-2.5 px-4 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors"
          >
            Reset All Sample Data
          </button>

          <button
            onClick={onClose}
            className="py-3 px-4 rounded-xl bg-primary text-on-primary font-display text-xs font-bold shadow-xs hover:bg-primary-container transition-all"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};
