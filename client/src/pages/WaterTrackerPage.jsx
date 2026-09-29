import React, { useState, useEffect } from 'react';
import { healthAPI } from '../api';
import { PageLoader, ProgressBar, StatCard } from '../components/common';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTheme } from '../context/ThemeContext';
import { Plus, Trash2, Droplets } from 'lucide-react';
import { formatDateShort } from '../utils/helpers';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function WaterTrackerPage() {
  const { isDark } = useTheme();
  const [logs, setLogs] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [total, setTotal] = useState(0);
  const [goal, setGoal] = useState(2500);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [daily, weekly] = await Promise.all([
        healthAPI.getDailyWater(today),
        healthAPI.getWeeklyWater(),
      ]);
      setLogs(daily.data?.data?.logs || []);
      setTotal(daily.data?.data?.total || 0);
      setWeeklyData(weekly.data?.data || []);
    } catch {}
    setLoading(false);
  };

  const addWater = async (amount) => {
    try {
      await healthAPI.logWater({ amount_ml: amount, date: today });
      toast.success(`+${amount}ml logged! 💧`);
      loadData();
    } catch { toast.error('Failed to log water'); }
  };

  const removeLog = async (id) => {
    try {
      await healthAPI.deleteWaterLog(id);
      toast.success('Log removed');
      loadData();
    } catch {}
  };

  const percentage = Math.min(100, Math.round((total / goal) * 100));
  const remaining = Math.max(0, goal - total);

  const chartData = {
    labels: weeklyData.map(d => formatDateShort(d.date)),
    datasets: [{
      label: 'Water (ml)',
      data: weeklyData.map(d => parseInt(d.total) || 0),
      backgroundColor: weeklyData.map(d => parseInt(d.total) >= goal ? 'rgba(16,185,129,0.8)' : 'rgba(59,130,246,0.8)'),
      borderRadius: 8,
    }]
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">Water Tracker 💧</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Stay hydrated for optimal performance</p>
      </div>

      {/* Main progress card */}
      <div className="card p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-100 dark:border-blue-900/30">
        <div className="text-center mb-6">
          <div className="relative inline-flex items-center justify-center w-36 h-36 mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke={isDark ? '#1e3a5f' : '#e0f2fe'} strokeWidth="8" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="#3b82f6" strokeWidth="8"
                strokeDasharray={`${percentage * 2.83} 283`} strokeLinecap="round" className="transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{percentage}%</span>
              <span className="text-xs text-slate-400">of goal</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {total >= 1000 ? `${(total / 1000).toFixed(1)}L` : `${total}ml`}
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {remaining > 0 ? `${remaining >= 1000 ? `${(remaining/1000).toFixed(1)}L` : `${remaining}ml`} remaining` : '🎉 Goal reached!'}
          </p>
        </div>

        {/* Quick add buttons */}
        <div className="grid grid-cols-4 gap-3">
          {[250, 500, 750, 1000].map(ml => (
            <button key={ml} onClick={() => addWater(ml)}
              className="py-3 rounded-2xl bg-white dark:bg-dark-surface border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold text-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-400 transition-all hover:shadow-glow-blue active:scale-95">
              +{ml >= 1000 ? `${ml/1000}L` : `${ml}ml`}
            </button>
          ))}
        </div>

        {/* Goal setting */}
        <div className="mt-4 flex items-center gap-3">
          <label className="text-sm text-slate-600 dark:text-slate-400 shrink-0">Daily goal (ml):</label>
          <input type="number" value={goal} onChange={e => setGoal(parseInt(e.target.value) || 2000)}
            className="input-field py-2 flex-1" min="500" max="10000" step="250" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon="💧" label="Today Total" value={`${(total/1000).toFixed(1)}L`} color="blue" />
        <StatCard icon="🏆" label="Goal" value={`${(goal/1000).toFixed(1)}L`} color="teal" />
        <StatCard icon="📊" label="Completion" value={`${percentage}%`} color="green" />
      </div>

      {/* Weekly chart */}
      {weeklyData.length > 0 && (
        <div className="card p-5">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Weekly Intake</h3>
          <div className="h-48">
            <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }, ticks: { color: isDark ? '#94a3b8' : '#64748b' } }, x: { grid: { display: false }, ticks: { color: isDark ? '#94a3b8' : '#64748b' } } } }} />
          </div>
        </div>
      )}

      {/* Today's log */}
      <div className="card p-5">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Today's Log</h3>
        {logs.length === 0 ? (
          <p className="text-slate-400 text-center py-6">No water logged yet today. Start hydrating!</p>
        ) : (
          <div className="space-y-2">
            {logs.map(log => (
              <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-center gap-3">
                  <Droplets size={16} className="text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">+{log.amount_ml}ml</p>
                    <p className="text-xs text-slate-400">{log.time ? new Date(`2000-01-01T${log.time}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Today'}</p>
                  </div>
                </div>
                <button onClick={() => removeLog(log.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
