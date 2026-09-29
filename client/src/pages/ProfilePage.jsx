import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileAPI, authAPI } from '../api';
import { PageLoader, Spinner } from '../components/common';
import { getImageUrl, getInitials } from '../utils/helpers';
import { Camera, Save, Lock, User, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [form, setForm] = useState({ name: '', bio: '', age: '', height: '', weight: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const { data } = await profileAPI.get();
      setProfile(data.data);
      const p = data.data;
      setForm({
        name: p.user?.name || '',
        bio: p.bio || '',
        age: p.age || '',
        height: p.height || '',
        weight: p.weight || '',
        phone: p.phone || '',
      });
    } catch {}
    setLoading(false);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await profileAPI.update(form);
      updateUser({ name: form.name });
      toast.success('Profile updated! ✅');
      loadProfile();
    } catch { toast.error('Failed to update profile'); }
    setSaving(false);
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (passwordForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSaving(true);
    try {
      const api = (await import('../api/axios')).default;
      await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    setSaving(false);
  };

  const uploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append('photo', file);
    try {
      const { data } = await profileAPI.uploadPhoto(form);
      updateUser({ photo_url: data.data.photo_url });
      toast.success('Photo updated! 📸');
      loadProfile();
    } catch { toast.error('Failed to upload photo'); }
  };

  if (loading) return <PageLoader />;

  const TABS = [
    { id: 'profile', label: 'Profile Info', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <h1 className="section-title">My Profile 👤</h1>

      {/* Profile header card */}
      <div className="card p-6 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border-violet-100 dark:border-violet-800/30">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl gradient-purple flex items-center justify-center text-white text-2xl font-bold overflow-hidden shadow-glow">
              {profile?.photo_url
                ? <img src={getImageUrl(profile.photo_url)} alt="" className="w-full h-full object-cover" />
                : getInitials(user?.name)}
            </div>
            <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border flex items-center justify-center cursor-pointer shadow-sm hover:shadow-md transition-shadow">
              <Camera size={13} className="text-violet-600" />
              <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} />
            </label>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{user?.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="badge badge-primary capitalize">{user?.role}</span>
              {profile?.goal && <span className="badge badge-success capitalize">{profile.goal?.replace('_', ' ')}</span>}
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-3 mt-5">
          {[
            { label: 'Age', value: profile?.age || '-', icon: '🎂' },
            { label: 'Height', value: profile?.height ? `${profile.height}cm` : '-', icon: '📏' },
            { label: 'Weight', value: profile?.weight ? `${profile.weight}kg` : '-', icon: '⚖️' },
            { label: 'Goal', value: profile?.goal?.replace('_', ' ') || '-', icon: '🎯' },
          ].map(s => (
            <div key={s.label} className="text-center p-2.5 rounded-xl bg-white dark:bg-dark-surface border border-slate-100 dark:border-dark-border">
              <p className="text-lg mb-0.5">{s.icon}</p>
              <p className="font-bold text-sm text-slate-900 dark:text-white capitalize">{s.value}</p>
              <p className="text-[10px] text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all
              ${activeTab === tab.id ? 'bg-white dark:bg-dark-surface shadow-sm text-violet-600 dark:text-violet-400' : 'text-slate-500 dark:text-slate-400'}`}>
            <tab.icon size={15} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="card p-6">
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="label">Phone</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-field" placeholder="+1 555 0000" />
              </div>
              <div>
                <label className="label">Age</label>
                <input type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} className="input-field" min="10" max="100" />
              </div>
              <div>
                <label className="label">Height (cm)</label>
                <input type="number" value={form.height} onChange={e => setForm(f => ({ ...f, height: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="label">Weight (kg)</label>
                <input type="number" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} className="input-field" step="0.1" />
              </div>
            </div>
            <div>
              <label className="label">Bio</label>
              <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} className="input-field resize-none h-24" placeholder="Tell us about your fitness journey..." />
            </div>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Spinner size="sm" /> : <><Save size={15} />Save Changes</>}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="card p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
            <Lock size={18} className="text-violet-500" /> Change Password
          </h3>
          <form onSubmit={changePassword} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))} className="input-field" required />
            </div>
            <div>
              <label className="label">New Password</label>
              <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))} className="input-field" required />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))} className="input-field" required />
            </div>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Spinner size="sm" /> : 'Update Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
