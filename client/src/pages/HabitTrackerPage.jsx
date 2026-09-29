import React, { useState, useEffect } from 'react';
import { healthAPI } from '../api';
import { CheckCircle, Circle, Flame, Zap } from 'lucide-react';
import { PageLoader } from '../components/common';
import toast from 'react-hot-toast';

const HABIT_META = {
  workout: { emoji: '🏋️', label: 'Workout', desc: 'Complete a workout session', color: 'violet' },
  water: { emoji: '💧', label: 'Drink Water', desc: 'Meet daily water goal', color: 'blue' },
  meditation: { emoji: '🧘', label: 'Meditation', desc: '10 minutes of mindfulness', color: 'teal' },
  reading: { emoji: '📚', label: 'Reading', desc: 'Read for 20+ minutes', color: 'orange' },
  sleep: { emoji: '😴', label: 'Sleep 8hrs', desc: 'Get adequate rest', color: 'indigo' },
  fruits: { emoji: '🍎', label: 'Eat Fruits', desc: 'Eat 2+ servings of fruit', color: 'green' },
  no_sugar: { emoji: '🚫', label: 'No Sugar', desc: 'Avoid added sugar', color: 'rose' },
  steps: { emoji: '👟', label: '10K Steps', desc: 'Walk 10,000 steps', color: 'amber' },
};

const COLOR_MAP = {
  violet: 'border-violet-400 bg-violet-50 dark:bg-violet-900/30',
  blue: 'border-blue-400 bg-blue-50 dark:bg-blue-900/30',
  teal: 'border-teal-400 bg-teal-50 dark:bg-teal-900/30',
  orange: 'border-orange-400 bg-orange-50 dark:bg-orange-900/30',
  indigo: 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30',
  green: 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30',
  rose: 'border-rose-400 bg-rose-50 dark:bg-rose-900/30',
  amber: 'border-amber-400 bg-amber-50 dark:bg-amber-900/30',
};

export default function HabitTrackerPage() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  useEffect(() => { loadHabits(); }, []);

  const loadHabits = async () => {
    setLoading(true);
    try {
      const { data } = await healthAPI.getTodayHabits();
      setHabits(data.data || []);
    } catch {}
    setLoading(false);
  };

  const toggleHabit = async (id, current) => {
    try {
      await healthAPI.toggleHabit(id);
      setHabits(prev => prev.map(h => h.id === id ? { ...h, completed: !h.completed } : h));
      if (!current) toast.success('Habit completed! 🎉 +10 XP');
    } catch { toast.error('Failed to update habit'); }
  };

  const completed = habits.filter(h => h.completed).length;
  const total = habits.length;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">Habit Tracker ✅</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{today}</p>
      </div>

      {/* Progress summary */}
      <div className="card p-6 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border-violet-100 dark:border-violet-800/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-3xl font-bold gradient-text">{completed}/{total}</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm">habits completed today</p>
          </div>
          <div className="text-5xl">{pct === 100 ? '🎉' : pct >= 75 ? '🔥' : pct >= 50 ? '💪' : '💡'}</div>
        </div>
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-slate-400 mt-2">{pct}% complete — {pct === 100 ? 'Amazing! All habits done!' : `${total - completed} more to go`}</p>
      </div>

      {/* Habits grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {habits.map(habit => {
          const meta = HABIT_META[habit.habit_name] || { emoji: '✅', label: habit.habit_name, desc: '', color: 'violet' };
          const colorClass = COLOR_MAP[meta.color] || COLOR_MAP.violet;
          return (
            <button
              key={habit.id}
              onClick={() => toggleHabit(habit.id, habit.completed)}
              className={`p-5 rounded-2xl border-2 text-left transition-all duration-300 group active:scale-95
                ${habit.completed ? colorClass : 'border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface hover:border-violet-300 dark:hover:border-violet-700'}
              `}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">{meta.emoji}</span>
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all
                  ${habit.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600 group-hover:border-violet-400'}`}>
                  {habit.completed && <CheckCircle size={16} className="text-white" />}
                </div>
              </div>
              <p className={`font-bold text-sm mb-0.5 ${habit.completed ? 'text-slate-800 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                {meta.label}
              </p>
              <p className="text-xs text-slate-400">{meta.desc}</p>
              {habit.completed && (
                <div className="mt-3 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <Zap size={11} /> +10 XP earned
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Motivational message */}
      {pct === 100 && (
        <div className="card p-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-center border-0">
          <p className="text-2xl mb-2">🎉 PERFECT DAY!</p>
          <p className="font-medium">You completed all your habits today! You've earned <strong>80 XP</strong>. Keep the streak going!</p>
        </div>
      )}
    </div>
  );
}
