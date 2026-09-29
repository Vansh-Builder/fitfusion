import React, { useState, useEffect } from 'react';
import { healthAPI } from '../api';
import { PageLoader, EmptyState } from '../components/common';
import { Line, Radar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, RadialLinearScale, Filler, Tooltip, Legend } from 'chart.js';
import { useTheme } from '../context/ThemeContext';
import { formatDateShort } from '../utils/helpers';
import { TrendingUp, Plus, Image } from 'lucide-react';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, RadialLinearScale, Filler, Tooltip, Legend);

export default function ProgressPage() {
  const { isDark } = useTheme();
  const [progress, setProgress] = useState(null);
  const [weightLogs, setWeightLogs] = useState([]);
  const [days, setDays] = useState(30);
  const [weightInput, setWeightInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState([]);

  useEffect(() => { loadData(); }, [days]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prog, weights] = await Promise.all([
        healthAPI.getProgress(days),
        healthAPI.getWeightLogs(days),
      ]);
      setProgress(prog.data?.data);
      setWeightLogs(weights.data?.data || []);
      setPhotos(prog.data?.data?.progress_photos || []);
    } catch {}
    setLoading(false);
  };

  const logWeight = async (e) => {
    e.preventDefault();
    if (!weightInput) return;
    try {
      await healthAPI.logWeight({ weight: parseFloat(weightInput), date: new Date().toISOString().split('T')[0] });
      toast.success('Weight logged! 📊');
      setWeightInput('');
      loadData();
    } catch { toast.error('Failed to log weight'); }
  };

  const uploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append('photo', file);
    try {
      await healthAPI.uploadProgressPhoto(form);
      toast.success('Progress photo uploaded! 📸');
      loadData();
    } catch {}
  };

  const weightChartData = {
    labels: weightLogs.map(w => formatDateShort(w.date)),
    datasets: [{
      label: 'Weight (kg)',
      data: weightLogs.map(w => w.weight),
      borderColor: '#7c3aed',
      backgroundColor: 'rgba(124,58,237,0.1)',
      fill: true, tension: 0.4, pointRadius: 4,
      pointBackgroundColor: '#7c3aed',
    }]
  };

  const radarData = progress ? {
    labels: ['Hydration', 'Sleep', 'Exercise', 'Nutrition', 'Habits', 'Consistency'],
    datasets: [{
      label: 'Score',
      data: [
        progress.water_score || 0,
        progress.sleep_score || 0,
        progress.exercise_score || 0,
        progress.nutrition_score || 0,
        progress.habits_score || 0,
        progress.consistency_score || 0,
      ],
      backgroundColor: 'rgba(124,58,237,0.2)',
      borderColor: '#7c3aed',
      pointBackgroundColor: '#7c3aed',
    }]
  } : null;

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Progress Tracker 📈</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track your transformation over time</p>
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
          {[7, 30, 90].map(d => (
            <button key={d} onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${days === d ? 'bg-white dark:bg-dark-surface shadow-sm text-violet-600 dark:text-violet-400' : 'text-slate-500'}`}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      {progress && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Workouts Completed', value: progress.total_workouts, icon: '🏋️', color: 'violet' },
            { label: 'Avg Water/Day', value: `${((progress.avg_water || 0)/1000).toFixed(1)}L`, icon: '💧', color: 'blue' },
            { label: 'Avg Sleep', value: `${progress.avg_sleep || 0}h`, icon: '😴', color: 'indigo' },
            { label: 'Total Calories Burned', value: `${progress.total_calories}`, icon: '🔥', color: 'orange' },
          ].map(s => (
            <div key={s.label} className="card p-4">
              <div className="text-2xl mb-2">{s.icon}</div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Weight chart */}
        <div className="lg:col-span-3 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-violet-500" /> Weight Progress
            </h3>
            <form onSubmit={logWeight} className="flex gap-2">
              <input type="number" value={weightInput} onChange={e => setWeightInput(e.target.value)} placeholder="kg" className="input-field py-1.5 w-20 text-sm" step="0.1" />
              <button type="submit" className="btn-primary py-1.5 text-xs"><Plus size={14} />Log</button>
            </form>
          </div>
          {weightLogs.length > 1 ? (
            <div className="h-48">
              <Line data={weightChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }, ticks: { color: isDark ? '#94a3b8' : '#64748b' } }, x: { grid: { display: false }, ticks: { color: isDark ? '#94a3b8' : '#64748b', maxTicksLimit: 7 } } } }} />
            </div>
          ) : (
            <EmptyState icon="⚖️" title="Start logging your weight" description="Log at least 2 days to see your trend chart" />
          )}
        </div>

        {/* Health radar */}
        <div className="lg:col-span-2 card p-5">
          <h3 className="font-bold text-slate-900 dark:text-white mb-3">Wellness Score</h3>
          {radarData ? (
            <div className="h-52">
              <Radar data={radarData} options={{ responsive: true, maintainAspectRatio: false, scales: { r: { min: 0, max: 100, ticks: { stepSize: 25, color: isDark ? '#94a3b8' : '#64748b' }, grid: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }, pointLabels: { color: isDark ? '#94a3b8' : '#64748b', font: { size: 10 } } } }, plugins: { legend: { display: false } } }} />
            </div>
          ) : <EmptyState icon="📊" title="No data" description="Log your health activities to see your wellness score" />}
        </div>
      </div>

      {/* Progress photos */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 dark:text-white">Progress Photos 📸</h3>
          <label className="btn-secondary text-xs cursor-pointer">
            <Image size={14} /> Upload Photo
            <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} />
          </label>
        </div>
        {photos.length === 0 ? (
          <EmptyState icon="📷" title="No progress photos" description="Upload photos to track your physical transformation" />
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {photos.map(p => (
              <div key={p.id} className="aspect-square rounded-xl overflow-hidden">
                <img src={`http://localhost:5000${p.photo_url}`} alt="Progress" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
