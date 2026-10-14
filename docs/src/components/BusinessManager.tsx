import React, { useState } from 'react';
import { BusinessState } from '../types';

interface BusinessManagerProps {
  business: BusinessState;
  onActivateIdea: (id: string) => void;
  onAddIdea: (name: string, note?: string) => void;
  onDeleteIdea: (id: string) => void;
  onToggleTask: (taskId: string) => void;
  onAddTask: (title: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export const BusinessManager: React.FC<BusinessManagerProps> = ({
  business,
  onActivateIdea,
  onAddIdea,
  onDeleteIdea,
  onToggleTask,
  onAddTask,
  onDeleteTask,
}) => {
  const [isAddIdeaModalOpen, setIsAddIdeaModalOpen] = useState(false);
  const [ideaName, setIdeaName] = useState('');
  const [ideaNote, setIdeaNote] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const activeIdea = business.ideas.find((i) => i.id === business.activeId);

  const handleCreateIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaName.trim()) return;
    onAddIdea(ideaName.trim(), ideaNote.trim() || undefined);
    setIdeaName('');
    setIdeaNote('');
    setIsAddIdeaModalOpen(false);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask(newTaskTitle.trim());
    setNewTaskTitle('');
  };

  return (
    <div className="flex flex-col w-full space-y-4 pb-6 animate-fadeIn">
      {/* Active Business Project Header */}
      {activeIdea ? (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900 to-purple-900 text-white shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 border border-emerald-400/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active Project
            </span>
            <span className="text-xs text-purple-200 font-semibold">
              {business.tasks.filter((t) => t.completed).length} / {business.tasks.length} tasks
            </span>
          </div>

          <h3 className="font-display font-black text-lg text-white">
            🚀 {activeIdea.name}
          </h3>
          {activeIdea.note && (
            <p className="text-xs text-purple-200 mt-1">{activeIdea.note}</p>
          )}

          {/* Action Tasks Checklist for Active Idea */}
          <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-200 block">
              Project Milestones
            </span>
            <div className="space-y-1.5">
              {business.tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onToggleTask(task.id)}
                  className={`p-2.5 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-all ${
                    task.completed
                      ? 'bg-white/10 text-purple-300 line-through'
                      : 'bg-white/20 text-white hover:bg-white/25'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="w-4 h-4 rounded-md border border-white/40 flex items-center justify-center text-[10px]">
                      {task.completed ? '✓' : ''}
                    </span>
                    <span className="truncate">{task.title}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTask(task.id);
                    }}
                    className="text-purple-300 hover:text-rose-400 p-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Inline Add Task */}
            <form onSubmit={handleCreateTask} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Add milestone / task..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-white/15 border border-white/20 text-xs text-white placeholder-purple-300 focus:outline-none focus:bg-white/25"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold text-xs text-white shadow-xs"
              >
                Add
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-center">
          <p className="text-xs text-on-surface-variant font-medium">
            No active project selected. Activate one from the ideas below!
          </p>
        </div>
      )}

      {/* Ideas Backlog */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
            <span>💡 Business Ideas Backlog</span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container text-[10px] font-bold">
              {business.ideas.length}
            </span>
          </h4>
          <button
            onClick={() => setIsAddIdeaModalOpen(true)}
            className="text-xs font-bold text-primary hover:underline"
          >
            + Add Idea
          </button>
        </div>

        {business.ideas.map((idea) => {
          const isActive = idea.id === business.activeId;
          return (
            <div
              key={idea.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                isActive
                  ? 'bg-primary/5 border-primary/40 shadow-2xs'
                  : 'bg-white border-outline-variant/30 shadow-2xs hover:border-outline-variant'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-xl">{isActive ? '🚀' : '💡'}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h5 className="font-display font-bold text-sm text-on-surface">
                      {idea.name}
                    </h5>
                    {isActive && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold">
                        Active
                      </span>
                    )}
                  </div>
                  {idea.note && (
                    <p className="text-xs text-on-surface-variant truncate mt-0.5">{idea.note}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-2">
                {!isActive ? (
                  <button
                    onClick={() => onActivateIdea(idea.id)}
                    className="px-3 py-1 rounded-xl border border-primary text-primary hover:bg-primary hover:text-white font-bold text-xs transition-all shadow-2xs"
                  >
                    Activate
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-700">Running</span>
                )}
                <button
                  onClick={() => onDeleteIdea(idea.id)}
                  className="w-7 h-7 rounded-full text-slate-400 hover:text-rose-600 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Idea Modal */}
      {isAddIdeaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-sm p-5 border border-outline-variant/30 shadow-2xl">
            <h3 className="font-display font-bold text-base text-on-surface mb-3">
              Add Business Track / Venture Idea
            </h3>
            <form onSubmit={handleCreateIdea} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
                  Idea / Venture Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI-Powered DevOps Newsletter"
                  value={ideaName}
                  onChange={(e) => setIdeaName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/50 text-xs text-on-surface focus:outline-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
                  Vision & Description
                </label>
                <input
                  type="text"
                  placeholder="Audience, pricing, distribution strategy"
                  value={ideaNote}
                  onChange={(e) => setIdeaNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/50 text-xs text-on-surface focus:outline-primary"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddIdeaModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-surface-container text-on-surface font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold text-xs"
                >
                  Add Idea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
