// Placeholder pages for extras features
import React from 'react';
import { extrasAPI } from '../api';
import { PageLoader, EmptyState } from '../components/common';
import { Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

// ============================================================
// HEALTH RECORDS PAGE
// ============================================================
export function HealthRecordsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', record_type: 'lab_test', record_date: '', notes: '' });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => { setLoading(true); try { const { data } = await extrasAPI.getMedicalRecords(); setRecords(data.data || []); } catch {} setLoading(false); };

  const add = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(k => formData.append(k, form[k]));
      if (file) formData.append('file', file);
      await extrasAPI.addMedicalRecord(formData);
      toast.success('Record added!'); setForm({ title: '', record_type: 'lab_test', record_date: '', notes: '' }); setFile(null); load();
    } catch { toast.error('Failed to add record'); }
    setSubmitting(false);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <h1 className="section-title">Medical Records 🏥</h1>
      <div className="card p-5">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Add Record</h3>
        <form onSubmit={add} className="grid sm:grid-cols-2 gap-4">
          <div><label className="label">Title</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-field" required /></div>
          <div><label className="label">Type</label><select value={form.record_type} onChange={e => setForm(f => ({ ...f, record_type: e.target.value }))} className="input-field"><option value="lab_test">Lab Test</option><option value="prescription">Prescription</option><option value="xray">X-Ray</option><option value="scan">Scan</option><option value="other">Other</option></select></div>
          <div><label className="label">Date</label><input type="date" value={form.record_date} onChange={e => setForm(f => ({ ...f, record_date: e.target.value }))} className="input-field" required /></div>
          <div><label className="label">File (optional)</label><input type="file" onChange={e => setFile(e.target.files[0])} className="input-field py-2 text-sm" /></div>
          <div className="sm:col-span-2"><label className="label">Notes</label><textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input-field resize-none h-20" /></div>
          <div className="sm:col-span-2"><button type="submit" disabled={submitting} className="btn-primary"><Plus size={15} />{submitting ? 'Adding...' : 'Add Record'}</button></div>
        </form>
      </div>
      <div className="card p-5">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Records</h3>
        {records.length === 0 ? <EmptyState icon="📋" title="No medical records" description="Add your health records to keep track" /> : (
          <div className="space-y-3">
            {records.map(r => (
              <div key={r.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-dark-border">
                <div><p className="font-semibold text-sm text-slate-900 dark:text-white">{r.title}</p><p className="text-xs text-slate-400">{r.record_type} · {formatDate(r.record_date)}</p>{r.notes && <p className="text-xs text-slate-500 mt-1">{r.notes}</p>}</div>
                <button onClick={async () => { await extrasAPI.deleteMedicalRecord(r.id); load(); }} className="btn-icon"><Trash2 size={15} className="text-rose-400" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// MEDICINES PAGE
// ============================================================
export function MedicinesPage() {
  const [meds, setMeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', dosage: '', frequency: 'daily', time: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, []);
  const load = async () => { setLoading(true); try { const { data } = await extrasAPI.getMedicines(); setMeds(data.data || []); } catch {} setLoading(false); };
  const add = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try { await extrasAPI.addMedicine(form); toast.success('Medicine added! 💊'); setForm({ name: '', dosage: '', frequency: 'daily', time: '', notes: '' }); load(); }
    catch { toast.error('Failed to add'); }
    setSubmitting(false);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <h1 className="section-title">Medicine Reminders 💊</h1>
      <div className="card p-5">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Add Medicine</h3>
        <form onSubmit={add} className="grid sm:grid-cols-2 gap-4">
          <div><label className="label">Medicine Name</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" placeholder="e.g. Vitamin D3" required /></div>
          <div><label className="label">Dosage</label><input value={form.dosage} onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))} className="input-field" placeholder="e.g. 500mg" /></div>
          <div><label className="label">Frequency</label><select value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))} className="input-field"><option value="daily">Daily</option><option value="twice_daily">Twice Daily</option><option value="weekly">Weekly</option><option value="as_needed">As Needed</option></select></div>
          <div><label className="label">Time</label><input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} className="input-field" /></div>
          <div className="sm:col-span-2"><button type="submit" disabled={submitting} className="btn-primary w-full"><Plus size={15} />{submitting ? 'Adding...' : 'Add Medicine'}</button></div>
        </form>
      </div>
      <div className="card p-5">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Active Medicines</h3>
        {meds.length === 0 ? <EmptyState icon="💊" title="No medicines added" description="Track your medicines and get reminders" /> : (
          <div className="space-y-2">
            {meds.map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-center gap-3"><span className="text-xl">💊</span><div><p className="font-semibold text-sm text-slate-900 dark:text-white">{m.name}</p><p className="text-xs text-slate-400">{m.dosage} · {m.frequency?.replace('_', ' ')} {m.time && `· ${m.time}`}</p></div></div>
                <button onClick={async () => { await extrasAPI.deleteMedicine(m.id); load(); }} className="btn-icon"><Trash2 size={14} className="text-rose-400" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// APPOINTMENTS PAGE
// ============================================================
export function AppointmentsPage() {
  const [apts, setApts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', doctor: '', date: '', time: '', location: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, []);
  const load = async () => { setLoading(true); try { const { data } = await extrasAPI.getAppointments(); setApts(data.data || []); } catch {} setLoading(false); };
  const add = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try { await extrasAPI.addAppointment(form); toast.success('Appointment added! 📅'); setForm({ title: '', doctor: '', date: '', time: '', location: '', notes: '' }); load(); }
    catch { toast.error('Failed to add'); }
    setSubmitting(false);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <h1 className="section-title">Appointments 📅</h1>
      <div className="card p-5">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Schedule Appointment</h3>
        <form onSubmit={add} className="grid sm:grid-cols-2 gap-4">
          <div><label className="label">Title</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-field" placeholder="e.g. Annual Checkup" required /></div>
          <div><label className="label">Doctor</label><input value={form.doctor} onChange={e => setForm(f => ({ ...f, doctor: e.target.value }))} className="input-field" placeholder="Dr. Smith" /></div>
          <div><label className="label">Date</label><input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input-field" required /></div>
          <div><label className="label">Time</label><input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} className="input-field" /></div>
          <div className="sm:col-span-2"><label className="label">Location</label><input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="input-field" placeholder="Clinic address" /></div>
          <div className="sm:col-span-2"><button type="submit" disabled={submitting} className="btn-primary w-full"><Plus size={15} />{submitting ? 'Adding...' : 'Add Appointment'}</button></div>
        </form>
      </div>
      <div className="card p-5">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Upcoming Appointments</h3>
        {apts.length === 0 ? <EmptyState icon="📅" title="No appointments" description="Schedule your medical appointments here" /> : (
          <div className="space-y-3">
            {apts.map(a => (
              <div key={a.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3"><span className="text-2xl">🏥</span><div><p className="font-semibold text-sm text-slate-900 dark:text-white">{a.title}</p><p className="text-xs text-slate-400">{a.doctor && `Dr. ${a.doctor} · `}{formatDate(a.date)} {a.time}</p>{a.location && <p className="text-xs text-slate-400">📍 {a.location}</p>}</div></div>
                <button onClick={async () => { await extrasAPI.deleteAppointment(a.id); load(); }} className="btn-icon"><Trash2 size={14} className="text-rose-400" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// PANTRY PAGE
// ============================================================
export function PantryPage() {
  const [items, setItems] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', quantity: '', unit: 'pcs', expiry_date: '', category: 'other' });

  useEffect(() => { load(); }, []);
  const load = async () => { setLoading(true); try { const { data } = await extrasAPI.getPantry(); setItems(data.data || []); setAlerts(data.expiry_alerts || []); } catch {} setLoading(false); };
  const add = async (e) => {
    e.preventDefault(); try { await extrasAPI.addPantryItem(form); toast.success('Added to pantry! 🥫'); setForm({ name: '', quantity: '', unit: 'pcs', expiry_date: '', category: 'other' }); load(); }
    catch { toast.error('Failed to add'); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <h1 className="section-title">Smart Pantry 🥫</h1>
      {alerts.length > 0 && <div className="card p-4 border-amber-200 dark:border-amber-800/30 bg-amber-50 dark:bg-amber-900/20"><p className="font-bold text-amber-700 dark:text-amber-300 text-sm mb-2">⚠️ Expiring Soon ({alerts.length} items)</p>{alerts.map(a => <p key={a.id} className="text-xs text-amber-600 dark:text-amber-400">• {a.name} expires {formatDate(a.expiry_date)}</p>)}</div>}
      <div className="card p-5"><h3 className="font-bold text-slate-900 dark:text-white mb-4">Add Item</h3>
        <form onSubmit={add} className="grid sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2"><label className="label">Item Name</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" placeholder="e.g. Oats" required /></div>
          <div><label className="label">Quantity</label><input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} className="input-field" placeholder="500" /></div>
          <div><label className="label">Unit</label><select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className="input-field"><option value="pcs">pcs</option><option value="g">g</option><option value="kg">kg</option><option value="ml">ml</option><option value="L">L</option></select></div>
          <div><label className="label">Category</label><select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field"><option value="grains">Grains</option><option value="proteins">Proteins</option><option value="dairy">Dairy</option><option value="vegetables">Vegetables</option><option value="fruits">Fruits</option><option value="spices">Spices</option><option value="other">Other</option></select></div>
          <div><label className="label">Expiry Date</label><input type="date" value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} className="input-field" /></div>
          <div className="sm:col-span-3"><button type="submit" className="btn-primary"><Plus size={15} />Add to Pantry</button></div>
        </form>
      </div>
      <div className="card p-5"><h3 className="font-bold text-slate-900 dark:text-white mb-4">Pantry Items ({items.length})</h3>
        {items.length === 0 ? <EmptyState icon="🥫" title="Pantry is empty" description="Add your pantry items to track expiry and stock" /> : (
          <div className="grid sm:grid-cols-2 gap-2">
            {items.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <div><p className="font-medium text-sm text-slate-900 dark:text-white">{item.name}</p><p className="text-xs text-slate-400">{item.quantity} {item.unit} · {item.category}{item.expiry_date ? ` · exp: ${formatDate(item.expiry_date)}` : ''}</p></div>
                <button onClick={async () => { await extrasAPI.deletePantryItem(item.id); load(); }} className="btn-icon"><Trash2 size={13} className="text-rose-400" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// SHOPPING LIST PAGE
// ============================================================
export function ShoppingListPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', quantity: 1, unit: 'pcs', category: 'produce' });

  useEffect(() => { load(); }, []);
  const load = async () => { setLoading(true); try { const { data } = await extrasAPI.getShoppingList(); setItems(data.data || []); } catch {} setLoading(false); };
  const add = async (e) => { e.preventDefault(); try { await extrasAPI.addShoppingItem(form); toast.success('Added! 🛒'); setForm({ name: '', quantity: 1, unit: 'pcs', category: 'produce' }); load(); } catch {} };
  const toggle = async (id) => { try { await extrasAPI.toggleShoppingItem(id); load(); } catch {} };

  if (loading) return <PageLoader />;

  const grouped = items.reduce((acc, item) => { const cat = item.category || 'other'; if (!acc[cat]) acc[cat] = []; acc[cat].push(item); return acc; }, {});

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <h1 className="section-title">Grocery Planner 🛒</h1>
      <div className="card p-5"><h3 className="font-bold text-slate-900 dark:text-white mb-4">Add Item</h3>
        <form onSubmit={add} className="flex gap-2 flex-wrap">
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field flex-1 min-w-32" placeholder="Item name" required />
          <input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} className="input-field w-20" min="1" />
          <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className="input-field w-24"><option value="pcs">pcs</option><option value="g">g</option><option value="kg">kg</option><option value="ml">ml</option><option value="L">L</option></select>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field w-32"><option value="produce">🥦 Produce</option><option value="proteins">🥩 Proteins</option><option value="dairy">🥛 Dairy</option><option value="grains">🌾 Grains</option><option value="other">📦 Other</option></select>
          <button type="submit" className="btn-primary"><Plus size={15} />Add</button>
        </form>
      </div>
      <div className="card p-5">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Shopping List ({items.length} items · {items.filter(i => i.purchased).length} done)</h3>
        {items.length === 0 ? <EmptyState icon="🛒" title="Empty list" description="Add grocery items to get started" /> : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([cat, catItems]) => (
              <div key={cat}>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 capitalize">{cat}</p>
                <div className="space-y-1.5">
                  {catItems.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <button onClick={() => toggle(item.id)} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${item.purchased ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600'}`}>
                        {item.purchased && <span className="text-white text-xs">✓</span>}
                      </button>
                      <span className={`flex-1 text-sm ${item.purchased ? 'line-through text-slate-400' : 'text-slate-800 dark:text-white'}`}>{item.name}</span>
                      <span className="text-xs text-slate-400">{item.quantity} {item.unit}</span>
                      <button onClick={async () => { await extrasAPI.deleteShoppingItem(item.id); load(); }} className="btn-icon p-1"><Trash2 size={13} className="text-rose-400" /></button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// FAMILY HEALTH PAGE
// ============================================================
export function FamilyHealthPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', relation: '', age: '', weight: '', height: '' });

  useEffect(() => { load(); }, []);
  const load = async () => { setLoading(true); try { const { data } = await extrasAPI.getFamilyMembers(); setMembers(data.data || []); } catch {} setLoading(false); };
  const add = async (e) => { e.preventDefault(); try { await extrasAPI.addFamilyMember(form); toast.success('Member added! 👨‍👩‍👧'); setForm({ name: '', relation: '', age: '', weight: '', height: '' }); load(); } catch {} };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <h1 className="section-title">Family Health ❤️</h1>
      <div className="card p-5"><h3 className="font-bold text-slate-900 dark:text-white mb-4">Add Family Member</h3>
        <form onSubmit={add} className="grid sm:grid-cols-2 gap-4">
          <div><label className="label">Name</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" required /></div>
          <div><label className="label">Relation</label><select value={form.relation} onChange={e => setForm(f => ({ ...f, relation: e.target.value }))} className="input-field"><option value="spouse">Spouse</option><option value="child">Child</option><option value="parent">Parent</option><option value="sibling">Sibling</option><option value="other">Other</option></select></div>
          <div><label className="label">Age</label><input type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} className="input-field" /></div>
          <div><label className="label">Weight (kg)</label><input type="number" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} className="input-field" step="0.1" /></div>
          <div><label className="label">Height (cm)</label><input type="number" value={form.height} onChange={e => setForm(f => ({ ...f, height: e.target.value }))} className="input-field" /></div>
          <div className="flex items-end"><button type="submit" className="btn-primary w-full"><Plus size={15} />Add Member</button></div>
        </form>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {members.length === 0 ? <div className="sm:col-span-2"><EmptyState icon="👨‍👩‍👧" title="No family members" description="Add family members to track their health" /></div> : members.map(m => (
          <div key={m.id} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-pink flex items-center justify-center text-white font-bold">{m.name?.[0]?.toUpperCase()}</div>
                <div><p className="font-bold text-slate-900 dark:text-white">{m.name}</p><p className="text-xs text-slate-400 capitalize">{m.relation}</p></div>
              </div>
              <button onClick={async () => { await extrasAPI.deleteFamilyMember(m.id); load(); }} className="btn-icon"><Trash2 size={14} className="text-rose-400" /></button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[['Age', m.age + ' yrs', '🎂'], ['Weight', m.weight + ' kg', '⚖️'], ['BMI', m.bmi || '-', '📊']].map(([l, v, ic]) => (
                <div key={l} className="text-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800"><p className="text-lg">{ic}</p><p className="font-bold text-xs text-slate-900 dark:text-white">{v}</p><p className="text-[10px] text-slate-400">{l}</p></div>
              ))}
            </div>
            {m.bmi_category && <p className={`text-center mt-2 text-xs font-semibold ${m.bmi < 18.5 ? 'text-blue-500' : m.bmi < 25 ? 'text-emerald-500' : m.bmi < 30 ? 'text-amber-500' : 'text-rose-500'}`}>{m.bmi_category}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// REWARDS PAGE
// ============================================================
export function RewardsPage() {
  const [reward, setReward] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { extrasAPI.getRewards().then(r => setReward(r.data?.data)).catch(() => {}).finally(() => setLoading(false)); }, []);

  if (loading) return <PageLoader />;

  const BADGES = [
    { id: 'first_workout', label: 'First Workout', emoji: '🏋️', unlocked: (reward?.xp || 0) >= 10 },
    { id: 'hydration_hero', label: 'Hydration Hero', emoji: '💧', unlocked: (reward?.xp || 0) >= 50 },
    { id: 'week_streak', label: '7-Day Streak', emoji: '🔥', unlocked: (reward?.streak || 0) >= 7 },
    { id: 'habit_master', label: 'Habit Master', emoji: '✅', unlocked: (reward?.xp || 0) >= 200 },
    { id: 'sleep_champion', label: 'Sleep Champion', emoji: '😴', unlocked: (reward?.xp || 0) >= 150 },
    { id: 'challenge_winner', label: 'Challenge Winner', emoji: '🏆', unlocked: (reward?.xp || 0) >= 500 },
    { id: 'community_star', label: 'Community Star', emoji: '⭐', unlocked: false },
    { id: 'transformation', label: 'Transformation', emoji: '💪', unlocked: false },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <h1 className="section-title">Rewards & XP ⭐</h1>
      <div className="card p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-100 dark:border-amber-800/30">
        <div className="text-center">
          <div className="text-5xl mb-4">🏆</div>
          <p className="text-5xl font-bold font-display gradient-text mb-1">{reward?.xp || 0}</p>
          <p className="text-slate-500 dark:text-slate-400">Total XP Earned</p>
          <div className="flex items-center justify-center gap-6 mt-5">
            <div className="text-center"><p className="text-2xl font-bold text-slate-900 dark:text-white">Level {reward?.level || 1}</p><p className="text-xs text-slate-400">Current Level</p></div>
            <div className="text-center"><p className="text-2xl font-bold text-orange-500">{reward?.streak || 0}</p><p className="text-xs text-slate-400">Day Streak 🔥</p></div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-slate-400 mb-2">Progress to Level {(reward?.level || 1) + 1}</p>
            <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-700" style={{ width: `${reward?.level_progress || 0}%` }} />
            </div>
            <p className="text-xs text-slate-400 mt-1">{reward?.xp || 0} / {reward?.next_level_xp || 100} XP</p>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Badges & Achievements</h3>
        <div className="grid grid-cols-4 gap-3">
          {BADGES.map(badge => (
            <div key={badge.id} className={`p-3 rounded-2xl text-center border transition-all ${badge.unlocked ? 'border-amber-200 dark:border-amber-800/30 bg-amber-50 dark:bg-amber-900/20' : 'border-slate-100 dark:border-dark-border opacity-40 grayscale'}`}>
              <div className="text-3xl mb-1">{badge.emoji}</div>
              <p className="text-[10px] font-medium text-slate-700 dark:text-slate-300 leading-tight">{badge.label}</p>
              {badge.unlocked && <p className="text-[10px] text-amber-500 mt-0.5">✓ Unlocked</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-bold text-slate-900 dark:text-white mb-3">How to Earn XP</h3>
        <div className="space-y-2">
          {[['Complete a workout', '+15 XP'], ['Log water intake', '+5 XP'], ['Complete a habit', '+10 XP'], ['Log sleep', '+10 XP'], ['Join a challenge', '+20 XP'], ['Post in community', '+5 XP'], ['Log a meal', '+5 XP'], ['Calculate BMI', '+10 XP']].map(([a, xp]) => (
            <div key={a} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-dark-border last:border-0">
              <span className="text-sm text-slate-600 dark:text-slate-400">{a}</span>
              <span className="font-bold text-amber-500 text-sm">{xp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Nutrition Score placeholder
export function NutritionScorePage() {
  return (
    <div className="max-w-2xl mx-auto"><EmptyState icon="🌿" title="Nutrition Score" description="Coming soon — track your daily nutrition score based on meal logs and balance." /></div>
  );
}
