import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileAPI, workoutAPI, healthAPI } from '../api';
import { StatCard, ProgressBar, PageLoader, EmptyState } from '../components/common';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';
import { useTheme } from '../context/ThemeContext';
import { Droplets, Moon, Flame, Dumbbell, Trophy, TrendingUp, Plus, ArrowRight, CheckCircle, Target, Zap } from 'lucide-react';
import { formatDate, pct, getRandomQuote } from '../utils/helpers';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

export default function DashboardPage() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [dashData, setDashData] = useState(null);
  const [habits, setHabits] = useState([]);
  const [weightData, setWeightData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quote] = useState(getRandomQuote());

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [dash, habitsRes, weightRes] = await Promise.all([
        profileAPI.getDashboard(),
        healthAPI.getTodayHabits(),
        healthAPI.getWeightLogs(30),
      ]);
      setDashData(dash.data?.data);
      setHabits(habitsRes.data?.data || []);
      setWeightData(weightRes.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const handleToggleHabit = async (habitId) => {
    try {
      await healthAPI.toggleHabit(habitId);
      setHabits(prev => prev.map(h => h.id === habitId ? { ...h, completed: !h.completed } : h));
    } catch {}
  };

  if (loading) return <PageLoader />;
  if (!dashData) return <EmptyState icon="📊" title="No data yet" description="Start logging your health data to see your dashboard." action={<Link to="/profile" className="btn-primary">Set up profile</Link>} />;

  const { today, profile, reward } = dashData;
  const chartColor = isDark ? 'rgba(124, 58, 237, 0.8)' : 'rgba(124, 58, 237, 0.9)';
  const chartFill = isDark ? 'rgba(124, 58, 237, 0.1)' : 'rgba(124, 58, 237, 0.05)';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  const weightChartData = {
    labels: weightData.map(w => formatDate(w.date)),
    datasets: [{
      label: 'Weight (kg)',
      data: weightData.map(w => w.weight),
      borderColor: chartColor, backgroundColor: chartFill,
      fill: true, tension: 0.4,
      pointBackgroundColor: chartColor, pointRadius: 4,
    }]
  };

  const habitsCompleted = habits.filter(h => h.completed).length;
  const habitsPct = pct(habitsCompleted, habits.length);

  const donutData = {
    labels: ['Completed', 'Remaining'],
    datasets: [{ data: [habitsCompleted, Math.max(0, habits.length - habitsCompleted)], backgroundColor: ['#7c3aed', isDark ? '#334155' : '#e2e8f0'], borderWidth: 0, hoverOffset: 4 }]
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: gridColor }, ticks: { color: isDark ? '#94a3b8' : '#64748b', font: { size: 11 } } },
      y: { grid: { color: gridColor }, ticks: { color: isDark ? '#94a3b8' : '#64748b', font: { size: 11 } } }
    }
  };

  const HABIT_ICONS = { workout: '🏋️', water: '💧', meditation: '🧘', reading: '📚', sleep: '😴', fruits: '🍎', no_sugar: '🚫', steps: '👟' };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-50 dark:bg-violet-900/30 border border-violet-100 dark:border-violet-800/30">
          <Zap size={16} className="text-amber-400" />
          <span className="text-sm font-bold text-violet-700 dark:text-violet-300">{reward?.xp || 0} XP</span>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-sm text-slate-500 dark:text-slate-400">Level {reward?.level || 1}</span>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="💧" label="Water Today" color="blue"
          value={today.water_ml >= 1000 ? `${(today.water_ml / 1000).toFixed(1)}L` : `${today.water_ml}ml`}
          subtitle={`Goal: ${(profile.daily_water_goal / 1000).toFixed(1)}L`}
          trend={today.water_percentage >= 80 ? 5 : -3}
        />
        <StatCard
          icon="😴" label="Sleep Last Night" color="violet"
          value={today.sleep_hours || 0} unit="hrs"
          subtitle={today.sleep_quality ? `Quality: ${today.sleep_quality}` : 'Not logged'}
        />
        <StatCard
          icon="🔥" label="Calories Burned" color="orange"
          value={today.calories_burned || 0} unit="kcal"
          subtitle={`${today.workouts_completed} workouts done`}
        />
        <StatCard
          icon="🏆" label="Habit Streak" color="green"
          value={reward?.streak || 0} unit="days"
          subtitle={`${habitsCompleted}/${habits.length} habits done`}
        />
      </div>

      {/* Progress overview */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Water progress */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Droplets size={18} className="text-blue-500" /> Water Intake
            </h3>
            <Link to="/water-tracker" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
              Log <ArrowRight size={12} />
            </Link>
          </div>
          <div className="text-center mb-4">
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {(today.water_ml / 1000).toFixed(1)}<span className="text-sm font-normal text-slate-400 ml-1">L</span>
            </p>
            <p className="text-xs text-slate-400">of {(profile.daily_water_goal / 1000).toFixed(1)}L goal</p>
          </div>
          <ProgressBar value={today.water_ml} max={profile.daily_water_goal} color="blue" showPercent />
          <div className="flex gap-2 mt-4">
            {[250, 500, 1000].map(ml => (
              <button key={ml} onClick={async () => {
                try {
                  await healthAPI.logWater({ amount_ml: ml, date: new Date().toISOString().split('T')[0] });
                  loadDashboard();
                } catch {}
              }} className="flex-1 py-1.5 text-xs rounded-xl border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 font-medium transition-colors">
                +{ml}ml
              </button>
            ))}
          </div>
        </div>

        {/* Habit tracker mini */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <CheckCircle size={18} className="text-emerald-500" /> Today's Habits
            </h3>
            <Link to="/habit-tracker" className="text-xs text-emerald-500 hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="flex items-center justify-center mb-3">
            <div className="relative w-24 h-24">
              <Doughnut data={donutData} options={{ cutout: '75%', plugins: { legend: { display: false } }, responsive: true }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-lg font-bold text-slate-900 dark:text-white">{habitsPct}%</p>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            {habits.slice(0, 4).map(h => (
              <button key={h.id} onClick={() => handleToggleHabit(h.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all
                  ${h.completed ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400'}`}>
                <span>{HABIT_ICONS[h.habit_name] || '✅'}</span>
                <span className="capitalize flex-1 text-left">{h.habit_name.replace('_', ' ')}</span>
                {h.completed && <CheckCircle size={14} className="text-emerald-500" />}
              </button>
            ))}
          </div>
        </div>

        {/* BMI card */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Target size={18} className="text-violet-500" /> Health Status
            </h3>
            <Link to="/bmi-calculator" className="text-xs text-violet-500 hover:underline flex items-center gap-1">
              Calculate <ArrowRight size={12} />
            </Link>
          </div>
          {dashData.bmi ? (
            <div className="text-center">
              <div className="text-4xl font-bold font-display mb-1" style={{ color: dashData.bmi.bmi < 18.5 ? '#3b82f6' : dashData.bmi.bmi < 25 ? '#10b981' : dashData.bmi.bmi < 30 ? '#f59e0b' : '#f43f5e' }}>
                {dashData.bmi.bmi}
              </div>
              <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">{dashData.bmi.category}</p>
              <p className="text-xs text-slate-400 mb-4">Last checked: {formatDate(dashData.bmi.date)}</p>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400 text-left">
                <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5">BMI Scale:</p>
                <div className="space-y-0.5">
                  <p>🔵 &lt;18.5: Underweight</p>
                  <p>🟢 18.5–24.9: Normal</p>
                  <p>🟡 25–29.9: Overweight</p>
                  <p>🔴 ≥30: Obese</p>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState icon="⚖️" title="No BMI recorded" description="Calculate your BMI to track health status" action={<Link to="/bmi-calculator" className="btn-primary text-sm">Calculate Now</Link>} />
          )}
        </div>
      </div>

      {/* Weight trend chart */}
      {weightData.length > 1 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-violet-500" /> Weight Progress (30 Days)
            </h3>
            <Link to="/progress" className="text-xs text-violet-500 hover:underline flex items-center gap-1">
              Full report <ArrowRight size={12} />
            </Link>
          </div>
          <div className="h-52">
            <Line data={weightChartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="card p-5">
        <h3 className="font-bold text-slate-800 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { to: '/workout-planner', icon: '🏋️', label: 'Log Workout', color: 'gradient-purple' },
            { to: '/water-tracker', icon: '💧', label: 'Log Water', color: 'gradient-blue' },
            { to: '/sleep-tracker', icon: '😴', label: 'Log Sleep', color: 'gradient-teal' },
            { to: '/meal-planner', icon: '🥗', label: 'Meal Plan', color: 'gradient-green' },
            { to: '/upload-meal', icon: '📷', label: 'Upload Meal', color: 'gradient-orange' },
            { to: '/bmi-calculator', icon: '⚖️', label: 'Check BMI', color: 'gradient-pink' },
          ].map(a => (
            <Link key={a.to} to={a.to}
              className="flex flex-col items-center p-4 rounded-2xl border border-slate-100 dark:border-dark-border hover:border-violet-200 dark:hover:border-violet-700 hover:shadow-glow-sm transition-all duration-300 group">
              <div className={`w-10 h-10 rounded-xl ${a.color} flex items-center justify-center text-xl mb-2 shadow-sm group-hover:shadow-md transition-shadow`}>{a.icon}</div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 text-center leading-tight">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Motivation quote */}
      <div className="card p-5 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border-violet-100 dark:border-violet-800/30">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✨</span>
          <blockquote className="text-sm font-medium text-slate-700 dark:text-slate-200 italic">"{quote}"</blockquote>
        </div>
      </div>
    </div>
  );
}
