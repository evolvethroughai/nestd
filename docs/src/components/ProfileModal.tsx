import React from 'react';
import { User } from '../firebase';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetData: () => void;
  user: User | null;
  streak: number;
  onSignIn: () => void;
  onSignOut: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onResetData,
  user,
  streak,
  onSignIn,
  onSignOut,
}) => {
  if (!isOpen) return null;

  const displayName = user?.displayName || 'Jeevan';
  const firstName = displayName.split(' ')[0];
  const photoURL = user?.photoURL;
  const email = user?.email || '';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl w-full max-w-sm p-6 border border-outline-variant/30 shadow-2xl relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Avatar */}
        <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden ring-4 ring-primary/20 shadow-md mb-3 bg-surface-container flex items-center justify-center">
          {photoURL ? (
            <img src={photoURL} alt={firstName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <span className="text-3xl">{user ? displayName.charAt(0).toUpperCase() : '🔐'}</span>
          )}
        </div>

        {user ? (
          <>
            <h3 className="font-display font-extrabold text-xl text-on-surface">{displayName}</h3>
            <p className="text-xs text-on-surface-variant font-medium">{email}</p>

            <div className="grid grid-cols-2 gap-2 my-5">
              <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20 text-center">
                <span className="font-display font-extrabold text-lg text-primary block">
                  {streak > 0 ? `${streak} Days` : '—'}
                </span>
                <span className="text-[11px] font-medium text-on-surface-variant">Clarity Streak</span>
              </div>
              <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20 text-center">
                <span className="font-display font-extrabold text-lg text-emerald-700 block">Synced</span>
                <span className="text-[11px] font-medium text-on-surface-variant">Cloud Backup</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => { onResetData(); onClose(); }}
                className="py-2.5 px-4 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors"
              >
                Reset All Sample Data
              </button>
              <button
                onClick={() => { onSignOut(); onClose(); }}
                className="py-2.5 px-4 rounded-xl border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container text-xs font-bold transition-colors"
              >
                Sign Out
              </button>
              <button
                onClick={onClose}
                className="py-3 px-4 rounded-xl bg-primary text-on-primary font-display text-xs font-bold shadow-xs hover:bg-primary-container transition-all"
              >
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="font-display font-extrabold text-xl text-on-surface mt-1">Sign in to Nestd</h3>
            <p className="text-xs text-on-surface-variant font-medium mt-1 mb-6">
              Sync your data across devices with Google
            </p>

            <button
              onClick={() => { onSignIn(); onClose(); }}
              className="w-full py-3 px-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center gap-3 text-sm font-bold text-slate-800 hover:bg-slate-50 active:scale-95 transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              Continue with Google
            </button>

            <button
              onClick={onClose}
              className="w-full mt-2 py-2.5 px-4 rounded-xl text-on-surface-variant text-xs font-semibold hover:bg-surface-container transition-colors"
            >
              Continue without signing in
            </button>
          </>
        )}
      </div>
    </div>
  );
};
