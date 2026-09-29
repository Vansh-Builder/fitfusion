import React, { useState, useEffect } from 'react';
import { healthAPI } from '../api';
import { PageLoader } from '../components/common';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js';
import { useTheme } from '../context/ThemeContext';
import { formatDateShort } from '../utils/helpers';
import { Moon, Sun, Clock, Star } from 'lucide-react';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const QUALITY_OPTIONS = ['poor', 'fair', 'good', 'excellent'];
const QUALITY_COLORS = { poor: '#f43f5e', fair: '#f59e0b', good: '#3b82f6', excellent: '#10b981' };
const QUALITY_EMOJIS = { poor: '😫', fair: '😐', good: '😊', excellent: '🌟' };

export default function SleepTrackerPage() {
  const { isDark } = useTheme();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');
  const [form, setForm] = useState({ sleep_time: '', wake_time: '', quality: 'good', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [avgDuration, setAvgDuration] = useState(0);

  useEffect(() => { loadData(); }, [period]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data } = await healthAPI.getSleepLogs(period);
      setLogs(data.data || []);
      setAvgDuration(data.average_duration || 0);
    } catch {}
    setLoading(false);
  };

  const handleLog = async (e) => {
    e.preventDefault();
    if (!form.sleep_time || !form.wake_time) { toast.error('Please set sleep and wake times'); return; }
    setSubmitting(true);
    try {
      await healthAPI.logSleep(form);
      toast.success('Sleep logged! 😴');
      setForm({ sleep_time: '', wake_time: '', quality: 'good', notes: '' });
      loadData();
    } catch { toast.error('Failed to log sleep'); }
    setSubmitting(false);
  };

  const chartData = {
    labels: logs.map(l => formatDateShort(l.date)),
    datasets: [{
      label: 'Sleep (hours)',
      data: logs.map(l => l.duration),
      borderColor: '#7c3aed',
      backgroundColor: 'rgba(124,58,237,0.1)',
      fill: true, tension: 0.4, pointRadius: 5,
    }]
  };

  const avgQuality = logs.length ? logs.reduce((sum, l) => sum + (l.quality === 'excellent' ? 4 : l.quality === 'good' ? 3 : l.quality === 'fair' ? 2 : 1), 0) / logs.length : 0;

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">Sleep Tracker 😴</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Optimize your rest and recovery</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Log form */}
        <div className="lg:col-span-2 card p-5">
          <h3 className="font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
            <Moon size={18} className="text-violet-500" /> Log Sleep
          </h3>
          <form onSubmit={handleLog} className="space-y-4">
            <div>
              <label className="label flex items-center gap-2"><Moon size={14} /> Bedtime</label>
              <input type="datetime-local" value={form.sleep_time} onChange={e => setForm(f => ({ ...f, sleep_time: e.target.value }))} className="input-field" required />
            </div>
            <div>
              <label className="label flex items-center gap-2"><Sun size={14} /> Wake Time</label>
              <input type="datetime-local" value={form.wake_time} onChange={e => setForm(f => ({ ...f, wake_time: e.target.value }))} className="input-field" required />
            </div>
            <div>
              <label className="label">Sleep Quality</label>
              <div className="grid grid-cols-2 gap-2">
                {QUALITY_OPTIONS.map(q => (
                  <button key={q} type="button" onClick={() => setForm(f => ({ ...f, quality: q }))}
                    className={`py-2.5 rounded-xl border capitalize text-sm font-medium transition-all
                      ${form.quality === q ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300' : 'border-slate-200 dark:border-dark-border hover:border-violet-300 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400'}`}>
                    {QUALITY_EMOJIS[q]} {q}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Notes (optional)</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input-field resize-none h-20" placeholder="How did you sleep?" />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full">{submitting ? 'Logging...' : 'Log Sleep'}</button>
          </form>
        </div>

        {/* Stats + Chart */}
        <div className="lg:col-span-3 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{avgDuration}h</p>
              <p className="text-xs text-slate-400 mt-1">Avg Sleep</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-emerald-500">{logs.length}</p>
              <p className="text-xs text-slate-400 mt-1">Days Logged</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-amber-500">{avgQuality.toFixed(1)}/4</p>
              <p className="text-xs text-slate-400 mt-1">Avg Quality</p>
            </div>
          </div>

          {/* Period toggle */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white">Sleep Duration</h3>
              <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                {['week', 'month'].map(p => (
                  <button key={p} onClick={() => setPeriod(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${period === p ? 'bg-white dark:bg-dark-surface shadow-sm text-violet-600 dark:text-violet-400' : 'text-slate-500'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            {logs.length > 1 ? (
              <div className="h-44">
                <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 12, grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }, ticks: { color: isDark ? '#94a3b8' : '#64748b' } }, x: { grid: { display: false }, ticks: { color: isDark ? '#94a3b8' : '#64748b' } } } }} />
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8 text-sm">Log at least 2 nights to see your chart</p>
            )}
          </div>

          {/* Recent logs */}
          <div className="card p-5">
            <h3 className="font-bold text-slate-900 dark:text-white mb-3">Recent Logs</h3>
            <div className="space-y-2">
              {logs.slice(0, 5).map(log => (
                <div key={log.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-dark-border">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${QUALITY_COLORS[log.quality]}20` }}>
                    {QUALITY_EMOJIS[log.quality]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-800 dark:text-white">{formatDateShort(log.date)}</p>
                      <span className="badge text-xs capitalize" style={{ backgroundColor: `${QUALITY_COLORS[log.quality]}20`, color: QUALITY_COLORS[log.quality] }}>{log.quality}</span>
                    </div>
                    <p className="text-xs text-slate-400">{log.duration}h sleep</p>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: Math.round(log.duration / 2) }).map((_, i) => <Star key={i} size={10} className="fill-amber-400 text-amber-400" />)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
