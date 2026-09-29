import React, { useState, useEffect } from 'react';
import { workoutAPI, exerciseAPI } from '../api';
import { PageLoader, EmptyState, ProgressBar } from '../components/common';
import { DAYS } from '../utils/helpers';
import { Plus, Check, X, RotateCcw, Zap, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WorkoutPlannerPage() {
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [logs, setLogs] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const todayName = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [plansRes, logsRes, exRes] = await Promise.all([
        workoutAPI.getPlans(),
        workoutAPI.getLogs({ date: today }),
        exerciseAPI.getAll({ limit: 50 }),
      ]);
      const allPlans = plansRes.data?.data || [];
      setPlans(allPlans);
      setActivePlan(allPlans.find(p => p.is_active) || allPlans[0] || null);
      setLogs(logsRes.data?.data || []);
      setExercises(exRes.data?.data || []);
    } catch {}
    setLoading(false);
  };

  const generatePlan = async () => {
    setGenerating(true);
    try {
      await workoutAPI.generatePlan({ goal: 'improve_fitness', activity_level: 'moderate', days_per_week: 5 });
      toast.success('Workout plan generated! 🎉');
      loadData();
    } catch { toast.error('Failed to generate plan'); }
    setGenerating(false);
  };

  const logWorkout = async (exerciseId, status = 'completed') => {
    try {
      const ex = exercises.find(e => e.id === exerciseId);
      await workoutAPI.logWorkout({
        exercise_id: exerciseId, date: today, status,
        duration: ex?.duration, calories_burned: ex?.calories_burned,
        sets: ex?.sets || 3, reps: ex?.reps || 12,
      });
      toast.success(status === 'completed' ? '✅ Workout logged!' : 'Workout skipped');
      loadData();
    } catch { toast.error('Failed to log workout'); }
  };

  if (loading) return <PageLoader />;

  const schedule = activePlan?.schedule || {};
  const todaySchedule = schedule[todayName] || { type: 'rest', exercises: [] };
  const completedToday = logs.filter(l => l.status === 'completed').length;
  const totalToday = todaySchedule.exercises?.length || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Workout Planner 🗓️</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Today is {todayName} • {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={generatePlan} disabled={generating} className="btn-primary">
            {generating ? '⏳ Generating...' : <><Zap size={16} />Generate Plan</>}
          </button>
        </div>
      </div>

      {/* Today's summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold gradient-text">{completedToday}/{totalToday}</p>
          <p className="text-xs text-slate-500 mt-1">Exercises Done</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-orange-500">{logs.reduce((s, l) => s + (l.calories_burned || 0), 0)}</p>
          <p className="text-xs text-slate-500 mt-1">Calories Burned</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-blue-500">{todaySchedule.type || 'rest'}</p>
          <p className="text-xs text-slate-500 mt-1">Today's Type</p>
        </div>
      </div>

      {activePlan ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Weekly schedule */}
          <div className="lg:col-span-2 card p-5">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <CalendarDays size={18} className="text-violet-500" /> Weekly Schedule — {activePlan.name}
            </h3>
            <div className="space-y-3">
              {DAYS.map(day => {
                const daySchedule = schedule[day] || { type: 'rest', exercises: [] };
                const isToday = day === todayName;
                return (
                  <div key={day} className={`p-4 rounded-2xl border transition-all ${isToday ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/20 shadow-glow-sm' : 'border-slate-100 dark:border-dark-border hover:border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{day}</span>
                        {isToday && <span className="badge badge-primary text-xs">Today</span>}
                      </div>
                      <span className={`badge text-xs capitalize ${daySchedule.type === 'rest' ? 'badge-warning' : daySchedule.type === 'strength' ? 'badge-primary' : 'badge-danger'}`}>
                        {daySchedule.type}
                      </span>
                    </div>
                    {daySchedule.exercises?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {daySchedule.exercises.map((ex, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs bg-white dark:bg-dark-surface px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-dark-border">
                            <span>💪</span>
                            <span className="text-slate-700 dark:text-slate-300">{ex.name}</span>
                            {isToday && (
                              <button onClick={() => logWorkout(ex.id)} className="text-emerald-500 hover:text-emerald-600 ml-1">
                                <Check size={12} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">🛋️ Rest & Recovery day</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's progress */}
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Today's Progress</h3>
              <ProgressBar value={completedToday} max={totalToday || 1} color="violet" label="Completion" />
              <div className="mt-4 space-y-2">
                {todaySchedule.exercises?.length > 0 ? todaySchedule.exercises.map((ex, i) => {
                  const loggedEx = logs.find(l => l.exercise_id === ex.id);
                  return (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-dark-border">
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-white">{ex.name}</p>
                        <p className="text-xs text-slate-400">{ex.sets} sets × {ex.reps} reps</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => logWorkout(ex.id, 'completed')}
                          className={`p-1.5 rounded-lg transition-colors ${loggedEx?.status === 'completed' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'hover:bg-emerald-50 text-slate-400 hover:text-emerald-500'}`}>
                          <Check size={14} />
                        </button>
                        <button onClick={() => logWorkout(ex.id, 'skipped')}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-sm text-slate-400 text-center py-4">🛋️ Rest day! Take it easy.</p>
                )}
              </div>
            </div>

            <div className="card p-5">
              <h3 className="font-bold text-slate-900 dark:text-white mb-3">Recent Logs</h3>
              {logs.slice(0, 5).map(log => (
                <div key={log.id} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-dark-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">{log.exercise?.name || 'Exercise'}</p>
                    <p className="text-xs text-slate-400">{log.sets} sets · {log.calories_burned || 0} kcal</p>
                  </div>
                  <span className={`badge text-xs ${log.status === 'completed' ? 'badge-success' : 'badge-danger'}`}>{log.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          icon="📅"
          title="No workout plan yet"
          description="Generate a personalized workout plan based on your fitness goals"
          action={<button onClick={generatePlan} className="btn-primary"><Zap size={16} />Generate My Plan</button>}
        />
      )}
    </div>
  );
}
