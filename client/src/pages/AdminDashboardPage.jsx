import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api';
import { PageLoader } from '../components/common';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js';
import { useTheme } from '../context/ThemeContext';
import { Users, Shield, Activity, BarChart2, Eye, Trash2, UserX, UserCheck } from 'lucide-react';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Filler);

export default function AdminDashboardPage() {
  const { isDark } = useTheme();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [growth, setGrowth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [page, setPage] = useState(1);

  useEffect(() => { loadData(); }, []);
  useEffect(() => { if (activeTab === 'users') loadUsers(); }, [activeTab, page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, growthRes] = await Promise.all([adminAPI.getStats(), adminAPI.getGrowthChart()]);
      setStats(statsRes.data?.data);
      setGrowth(growthRes.data?.data || []);
    } catch {}
    setLoading(false);
  };

  const loadUsers = async () => {
    try {
      const { data } = await adminAPI.getUsers({ page, limit: 15 });
      setUsers(data.data || []);
    } catch {}
  };

  const toggleUser = async (id) => {
    try {
      const { data } = await adminAPI.toggleUserStatus(id);
      toast.success(data.data.is_active ? 'User activated' : 'User suspended');
      loadUsers();
    } catch {}
  };

  if (loading) return <PageLoader />;

  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const tickColor = isDark ? '#94a3b8' : '#64748b';

  const growthChartData = {
    labels: growth.map(g => g.month),
    datasets: [{
      label: 'New Users',
      data: growth.map(g => g.count),
      backgroundColor: 'rgba(124,58,237,0.7)',
      borderRadius: 8,
    }]
  };

  const TABS = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'users', label: 'Users', icon: Users },
  ];

  const statItems = stats ? [
    { label: 'Total Users', value: stats.total_users, icon: '👥', color: 'violet' },
    { label: 'Active Today', value: stats.active_today, icon: '⚡', color: 'green' },
    { label: 'Admins', value: stats.total_admins, icon: '🛡️', color: 'blue' },
    { label: 'Posts This Week', value: stats.posts_this_week, icon: '💬', color: 'orange' },
    { label: 'Workouts Logged', value: stats.total_workouts, icon: '🏋️', color: 'rose' },
    { label: 'Water Logs', value: stats.total_water_logs, icon: '💧', color: 'teal' },
    { label: 'Challenges Joined', value: stats.challenges_joined, icon: '🏆', color: 'amber' },
    { label: 'Total Meals Planned', value: stats.total_meals_planned, icon: '🥗', color: 'emerald' },
  ] : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl gradient-purple flex items-center justify-center shadow-glow">
          <Shield size={20} className="text-white" />
        </div>
        <div>
          <h1 className="section-title">Admin Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Platform management and analytics</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
              ${activeTab === tab.id ? 'bg-white dark:bg-dark-surface shadow-sm text-violet-600 dark:text-violet-400' : 'text-slate-500'}`}>
            <tab.icon size={15} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statItems.map(s => (
              <div key={s.label} className="card p-4 hover:shadow-glow-sm transition-all">
                <div className="text-2xl mb-2">{s.icon}</div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value?.toLocaleString() || 0}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Growth chart */}
          {growth.length > 0 && (
            <div className="card p-5">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">User Growth (Monthly)</h3>
              <div className="h-56">
                <Bar data={growthChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: tickColor } }, y: { grid: { color: gridColor }, ticks: { color: tickColor } } } }} />
              </div>
            </div>
          )}

          {/* Recent registrations */}
          {stats?.recent_users?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Recent Registrations</h3>
              <div className="space-y-3">
                {stats.recent_users.map(u => (
                  <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="w-9 h-9 rounded-xl gradient-purple flex items-center justify-center text-white text-sm font-bold">
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </div>
                    <div className="text-right">
                      <span className={`badge text-xs ${u.role === 'admin' ? 'badge-danger' : 'badge-primary'}`}>{u.role}</span>
                      <p className="text-xs text-slate-400 mt-1">{formatDate(u.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card p-5">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">All Users ({stats?.total_users})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400 uppercase border-b border-slate-100 dark:border-dark-border">
                  <th className="pb-3 pr-4">User</th>
                  <th className="pb-3 pr-4">Role</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Joined</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl gradient-purple flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`badge text-xs ${u.role === 'admin' ? 'badge-danger' : 'badge-primary'}`}>{u.role}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`badge text-xs ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                        {u.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-slate-400 text-xs">{formatDate(u.created_at)}</td>
                    <td className="py-3">
                      {u.role !== 'admin' && (
                        <button onClick={() => toggleUser(u.id)} className={`btn-icon ${u.is_active ? 'text-rose-400 hover:text-rose-600' : 'text-emerald-400 hover:text-emerald-600'}`}>
                          {u.is_active ? <UserX size={15} /> : <UserCheck size={15} />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center gap-2 mt-4">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm disabled:opacity-40">← Prev</button>
            <button onClick={() => setPage(p => p + 1)} disabled={users.length < 15} className="btn-secondary text-sm disabled:opacity-40">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}
