import React, { useEffect, useState } from 'react';
import { User } from '../firebase';
import { UserProfile } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetData: () => void;
  user: User | null;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => Promise<void>;
  streak: number;
  onSignIn: () => void;
  onSignOut: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onResetData,
  user,
  profile,
  onSaveProfile,
  streak,
  onSignIn,
  onSignOut,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
  const [draft, setDraft] = useState(profile);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDraft(profile);
      setSaveError('');
      setActiveTab('profile');
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const displayName = profile.name || user?.displayName || user?.email?.split('@')[0] || 'Your account';
  const photoURL = user?.photoURL;
  const email = user?.email || '';

  const saveProfile = async () => {
    setIsSaving(true);
    setSaveError('');
    try {
      await onSaveProfile({ ...draft, name: draft.name.trim() });
    } catch {
      setSaveError('Could not save your profile. Check your connection and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: keyof UserProfile['settings'], value: boolean) => {
    setDraft((current) => ({ ...current, settings: { ...current.settings, [key]: value } }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl w-full max-w-sm max-h-[90dvh] flex flex-col border border-outline-variant/30 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 shrink-0 rounded-full overflow-hidden bg-primary/10 ring-2 ring-primary/15 flex items-center justify-center">
              {photoURL ? (
                <img src={photoURL} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="material-symbols-outlined text-primary">{user ? 'person' : 'lock'}</span>
              )}
            </div>
            <div className="min-w-0 text-left">
              <h2 className="font-display font-extrabold text-base text-on-surface truncate">{user ? displayName : 'Account'}</h2>
              <p className="text-[11px] text-on-surface-variant truncate">{user ? email : 'Sign in to sync your Nestd data'}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close account" className="w-9 h-9 shrink-0 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {user ? (
          <>
            <div className="grid grid-cols-2 px-5 gap-2 border-b border-outline-variant/20">
              {(['profile', 'settings'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 text-sm font-bold capitalize border-b-2 transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
                >
                  {tab === 'profile' ? 'My profile' : 'Settings'}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto overscroll-contain px-5 py-4 text-left">
              {activeTab === 'profile' ? (
                <div className="space-y-4">
                  <label className="block">
                    <span className="block text-xs font-bold text-on-surface-variant mb-1.5">Name</span>
                    <input
                      value={draft.name}
                      onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                      autoComplete="name"
                      maxLength={80}
                      className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-3.5 py-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                      placeholder="Your name"
                    />
                  </label>

                  <label className="block">
                    <span className="block text-xs font-bold text-on-surface-variant mb-1.5">Gender</span>
                    <select
                      value={draft.gender}
                      onChange={(event) => setDraft((current) => ({ ...current, gender: event.target.value as UserProfile['gender'] }))}
                      className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-3.5 py-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                    >
                      <option value="">Choose an option</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="block text-xs font-bold text-on-surface-variant mb-1.5">Date of birth</span>
                    <input
                      type="date"
                      value={draft.dateOfBirth}
                      max={new Date().toISOString().slice(0, 10)}
                      onChange={(event) => setDraft((current) => ({ ...current, dateOfBirth: event.target.value }))}
                      className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-3.5 py-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </label>

                  <p className="text-[11px] leading-relaxed text-on-surface-variant">Your profile details are saved to your signed-in Nestd account.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-on-surface-variant mb-1">Today screen</p>
                  <SettingToggle
                    title="Personalized greeting"
                    description="Use your profile name in the greeting"
                    checked={draft.settings.personalizedGreeting}
                    onChange={(checked) => updateSetting('personalizedGreeting', checked)}
                  />
                  <SettingToggle
                    title="Daily streak"
                    description="Show your completion streak on Today"
                    checked={draft.settings.showStreak}
                    onChange={(checked) => updateSetting('showStreak', checked)}
                  />

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="rounded-xl bg-surface-container-low border border-outline-variant/20 p-3">
                      <span className="block font-display font-extrabold text-lg text-primary">{streak} days</span>
                      <span className="text-[10px] font-medium text-on-surface-variant">Current streak</span>
                    </div>
                    <div className="rounded-xl bg-surface-container-low border border-outline-variant/20 p-3">
                      <span className="block font-display font-extrabold text-sm text-emerald-700">Connected</span>
                      <span className="text-[10px] font-medium text-on-surface-variant">Account sync</span>
                    </div>
                  </div>

                  <button
                    onClick={() => { onResetData(); onClose(); }}
                    className="w-full mt-2 py-2.5 px-4 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors"
                  >
                    Reset app data
                  </button>
                </div>
              )}
              {saveError && <p role="alert" className="mt-3 text-xs font-semibold text-rose-700">{saveError}</p>}
            </div>

            <div className="px-5 py-4 border-t border-outline-variant/20 flex gap-2">
              <button
                onClick={() => { onSignOut(); onClose(); }}
                className="px-4 py-3 rounded-xl border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container text-xs font-bold transition-colors"
              >
                <span className="material-symbols-outlined align-middle text-[16px] mr-1">logout</span>
                Log out
              </button>
              <button
                onClick={saveProfile}
                disabled={isSaving}
                className="flex-1 py-3 px-4 rounded-xl bg-primary text-on-primary font-display text-xs font-bold shadow-xs hover:bg-primary-container transition-all disabled:opacity-60"
              >
                {isSaving ? 'Saving…' : activeTab === 'profile' ? 'Save profile' : 'Save settings'}
              </button>
            </div>
          </>
        ) : (
          <div className="p-5 pt-2">
            <button
              onClick={() => { onSignIn(); onClose(); }}
              className="w-full py-3 px-4 rounded-xl bg-primary text-on-primary shadow-xs flex items-center justify-center gap-2 text-sm font-bold hover:bg-primary-container active:scale-[0.99] transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              Continue with Google
            </button>
            <button onClick={onClose} className="w-full mt-2 py-2.5 text-on-surface-variant text-xs font-semibold hover:bg-surface-container rounded-xl">Continue without signing in</button>
          </div>
        )}
      </div>
    </div>
  );
};

interface SettingToggleProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const SettingToggle: React.FC<SettingToggleProps> = ({ title, description, checked, onChange }) => (
  <label className="flex items-center justify-between gap-3 rounded-2xl border border-outline-variant/25 bg-surface-container-low p-3.5 cursor-pointer">
    <span>
      <span className="block text-sm font-bold text-on-surface">{title}</span>
      <span className="block text-[11px] text-on-surface-variant mt-0.5">{description}</span>
    </span>
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      className="h-5 w-5 accent-indigo-600 shrink-0"
    />
  </label>
);
