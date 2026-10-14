import React, { useState } from 'react';
import { TodayTask } from '../types';
import { USER_AVATAR, MINDFULNESS_ANCHOR } from '../data/mockData';

interface TodayScreenProps {
  tasks: TodayTask[];
  onToggleTask: (id: string) => void;
  onAddTask: (title: string, category?: string, tagType?: TodayTask['tagType'], timeOfDay?: TodayTask['timeOfDay']) => void;
  onDeleteTask: (id: string) => void;
  onOpenFocusModal: () => void;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({
  tasks,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onOpenFocusModal,
}) => {
  const [filter, setFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  const [newTaskInput, setNewTaskInput] = useState('');
  const [dailyIntention, setDailyIntention] = useState('Protect 90 minutes for deep product thinking...');
  const [isEditingIntention, setIsEditingIntention] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Compute metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (filter === 'all') return true;
    return t.timeOfDay === filter;
  });

  const handleCreateTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTaskInput.trim()) return;

    let timeOfDay: TodayTask['timeOfDay'] = 'morning';
    const lower = newTaskInput.toLowerCase();
    if (lower.includes('pm') || lower.includes('afternoon') || lower.includes('pitch') || lower.includes('clinic')) {
      timeOfDay = 'afternoon';
    } else if (lower.includes('evening') || lower.includes('dinner') || lower.includes('6:') || lower.includes('7:') || lower.includes('night')) {
      timeOfDay = 'evening';
    }

    onAddTask(newTaskInput.trim(), 'My Focus', 'work', timeOfDay);
    setNewTaskInput('');
  };

  const toggleVoiceInput = () => {
    setIsListening(true);
    setTimeout(() => {
      setNewTaskInput('Schedule sync with product lead at 3:00 PM');
      setIsListening(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-4 pb-28 pt-3 space-y-4">
      {/* Page Title & Profile Avatar Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Morning Clarity
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
          <h1 className="font-display text-2xl md:text-[26px] font-extrabold text-on-surface tracking-tight leading-tight mt-0.5">
            Good morning, Jeevan
          </h1>
        </div>

        <div className="relative">
          <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-emerald-500/20 shadow-sm">
            <img
              src={USER_AVATAR}
              alt="Jeevan"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
        </div>
      </div>

      {/* Hero Smooth Morning Momentum Card */}
      <div
        className="relative rounded-3xl p-5 border border-amber-200/70 shadow-[0_8px_30px_-6px_rgba(245,158,11,0.15)] overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 45%, #fed7aa 100%)',
        }}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-amber-800 text-xs font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-amber-700">sunny</span>
                Wednesday, 15 Oct
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-400/30 text-amber-950 font-display text-[11px] font-bold flex items-center gap-1 shadow-2xs">
                🔥 5-day streak
              </span>
            </div>

            <div className="pt-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                Smooth Morning Momentum
              </span>
              <h2 className="font-display text-[26px] font-extrabold text-amber-950 tracking-tight leading-tight mt-0.5">
                {completedTasks} of {totalTasks} done
              </h2>
              <p className="text-xs font-medium text-amber-900/80 mt-0.5">
                {pendingTasks > 0
                  ? `${pendingTasks} tasks left before afternoon unwind ✨`
                  : 'All sorted! Mindful, peaceful completion ✨'}
              </p>
            </div>
          </div>

          {/* Circular Progress Ring */}
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="rgba(245, 158, 11, 0.2)"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="#006c49"
                strokeWidth="6"
                strokeDasharray={2 * Math.PI * 26}
                strokeDashoffset={2 * Math.PI * 26 * (1 - completionPercent / 100)}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display font-extrabold text-emerald-900 text-sm leading-none">
                {completionPercent}
              </span>
              <span className="text-[9px] font-bold uppercase text-emerald-800 tracking-tighter leading-none mt-0.5">
                % done
              </span>
            </div>
          </div>
        </div>

        {/* Segmented Progress Bar */}
        <div className="grid grid-cols-7 gap-1.5 mt-4 pt-1">
          {Array.from({ length: 7 }).map((_, idx) => {
            const isFilled = idx < completedTasks;
            return (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-colors duration-500 ${
                  isFilled ? 'bg-emerald-700 shadow-2xs' : 'bg-amber-900/15'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Daily Intention Card */}
      <div className="bg-surface-container-lowest rounded-2xl p-3.5 border border-outline-variant/30 shadow-xs flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-lg shrink-0">
          📝
        </div>
        <div className="min-w-0 flex-1">
          <span className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
            Daily Intention
          </span>
          {isEditingIntention ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={dailyIntention}
                onChange={(e) => setDailyIntention(e.target.value)}
                className="text-xs text-on-surface font-medium bg-surface-container-low px-2 py-1 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />
              <button
                onClick={() => setIsEditingIntention(false)}
                className="text-xs font-bold text-primary px-2 py-1 hover:bg-primary/10 rounded-md"
              >
                Save
              </button>
            </div>
          ) : (
            <p
              onClick={() => setIsEditingIntention(true)}
              className="text-xs text-on-surface font-medium truncate mt-0.5 cursor-pointer hover:text-primary transition-colors"
              title="Click to edit daily intention"
            >
              {dailyIntention}
            </p>
          )}
        </div>
        <button
          onClick={() => setIsEditingIntention(!isEditingIntention)}
          className="text-on-surface-variant hover:text-primary p-1.5 rounded-lg active:scale-90 transition-all"
          title="Edit intention"
        >
          <span className="material-symbols-outlined text-[16px]">edit</span>
        </button>
      </div>

      {/* Time Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
        <button
          onClick={() => setFilter('all')}
          className={`h-8 px-3.5 rounded-full font-display text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 ${
            filter === 'all'
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-lowest border border-outline-variant/30 text-on-surface hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">calendar_today</span>
          <span>All</span>
        </button>

        <button
          onClick={() => setFilter('morning')}
          className={`h-8 px-3.5 rounded-full font-display text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 ${
            filter === 'morning'
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-lowest border border-outline-variant/30 text-on-surface hover:bg-surface-container'
          }`}
        >
          <span>☀️</span>
          <span>Morning</span>
        </button>

        <button
          onClick={() => setFilter('afternoon')}
          className={`h-8 px-3.5 rounded-full font-display text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 ${
            filter === 'afternoon'
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-lowest border border-outline-variant/30 text-on-surface hover:bg-surface-container'
          }`}
        >
          <span>🌤️</span>
          <span>Afternoon</span>
        </button>

        <button
          onClick={() => setFilter('evening')}
          className={`h-8 px-3.5 rounded-full font-display text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 ${
            filter === 'evening'
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-lowest border border-outline-variant/30 text-on-surface hover:bg-surface-container'
          }`}
        >
          <span>🌆</span>
          <span>Evening</span>
        </button>
      </div>

      {/* Today's Focus List Section */}
      <section className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-bold text-on-surface tracking-tight">
              Today's focus
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-display text-[11px] font-bold">
              {pendingTasks} remaining
            </span>
          </div>

          <button
            onClick={onOpenFocusModal}
            className="h-8 px-3 rounded-full bg-primary/10 hover:bg-primary/20 text-primary font-display text-xs font-bold flex items-center gap-1 active:scale-95 transition-all shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">target</span>
            <span>Focus</span>
          </button>
        </div>

        {/* Task Cards */}
        <div className="space-y-2">
          {filteredTasks.map((task) => {
            const isCompleted = task.completed;
            return (
              <div
                key={task.id}
                onClick={() => onToggleTask(task.id)}
                className={`group relative rounded-2xl p-3.5 border transition-all duration-200 cursor-pointer flex items-center justify-between shadow-2xs active:scale-[0.99] select-none ${
                  isCompleted
                    ? 'bg-surface-container-lowest/80 border-outline-variant/30 opacity-75'
                    : 'bg-surface-container-lowest border-outline-variant/40 hover:border-primary/40 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Round Checkbox Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleTask(task.id);
                    }}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shrink-0 active:scale-90 ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'border-2 border-slate-300 hover:border-primary group-hover:scale-105'
                    }`}
                  >
                    {isCompleted && (
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`font-display text-sm font-semibold tracking-tight leading-snug line-clamp-1 ${
                        isCompleted ? 'line-through text-on-surface-variant/70' : 'text-on-surface'
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant/80 mt-0.5">
                      {isCompleted ? (
                        <span className="flex items-center gap-1 text-emerald-700 font-medium">
                          <span className="material-symbols-outlined text-[13px]">check_circle</span>
                          {task.completedAt ? `Completed at ${task.completedAt}` : 'Done'}
                        </span>
                      ) : (
                        <>
                          <span className="flex items-center gap-1 font-medium text-on-surface">
                            <span className="material-symbols-outlined text-[13px] text-on-surface-variant">schedule</span>
                            {task.time}
                          </span>
                          <span>•</span>
                          <span className="truncate">{task.category}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {/* Tag Pill */}
                  {task.tagType === 'urgent' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                      Urgent
                    </span>
                  )}
                  {task.tagType === 'work' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      Work
                    </span>
                  )}
                  {task.tagType === 'family' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                      Family
                    </span>
                  )}
                  {task.tagType === 'personal' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      Personal
                    </span>
                  )}
                  {task.tagType === 'done' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100/90 text-emerald-800 text-[11px] font-bold">
                      Done
                    </span>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTask(task.id);
                    }}
                    className="w-7 h-7 rounded-full text-on-surface-variant/40 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete task"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Serene Mindfulness Anchor Milestone Card */}
      <div
        className="relative rounded-2xl p-4 border border-emerald-200/60 shadow-xs overflow-hidden flex items-center justify-between"
        style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #d1fae5 100%)',
        }}
      >
        <div className="space-y-1 pr-3">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-md bg-emerald-700 text-white font-display text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">verified</span>
              All Sorted
            </span>
            <span className="text-[11px] font-extrabold tracking-wider uppercase text-emerald-900">
              Milestone
            </span>
          </div>
          <p className="font-display italic text-sm font-bold text-emerald-950 leading-snug">
            "Calm mind brings inner strength. Everything is sorted."
          </p>
          <span className="text-[11px] text-emerald-800 font-medium block">
            Daily mindfulness anchor
          </span>
        </div>

        <div className="relative w-14 h-14 shrink-0 rounded-2xl overflow-hidden ring-2 ring-emerald-300 shadow-sm">
          <img
            src={MINDFULNESS_ANCHOR}
            alt="Mindfulness leaf with morning dew"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <span className="absolute bottom-1 right-1 text-xs">✨</span>
        </div>
      </div>

      {/* Floating Bottom Quick Task Input Bar */}
      <form
        onSubmit={handleCreateTask}
        className="bg-surface-container-lowest rounded-full p-1.5 pl-3.5 border border-outline-variant/40 shadow-[0_4px_20px_-4px_rgba(70,72,212,0.12)] flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-primary text-[20px]">
          add_task
        </span>

        <input
          type="text"
          value={newTaskInput}
          onChange={(e) => setNewTaskInput(e.target.value)}
          placeholder={isListening ? 'Listening...' : 'Add a new task or thought...'}
          className="flex-1 bg-transparent text-xs sm:text-sm font-medium text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none"
        />

        <button
          type="button"
          onClick={toggleVoiceInput}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            isListening
              ? 'bg-rose-500 text-white animate-pulse'
              : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
          }`}
          title="Voice input"
        >
          <span className="material-symbols-outlined text-[18px]">mic</span>
        </button>

        <button
          type="submit"
          disabled={!newTaskInput.trim()}
          className="w-9 h-9 rounded-full bg-primary disabled:opacity-40 text-on-primary flex items-center justify-center shadow-xs hover:bg-primary-container active:scale-90 transition-all shrink-0"
          title="Add task"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
        </button>
      </form>
    </div>
  );
};
