import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../api';
import { Spinner } from '../components/common';
import toast from 'react-hot-toast';
import { ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Personal Info', emoji: '👤', desc: 'Tell us about yourself' },
  { id: 2, title: 'Your Goals', emoji: '🎯', desc: 'What do you want to achieve?' },
  { id: 3, title: 'Activity & Diet', emoji: '🏃', desc: 'Your lifestyle preferences' },
  { id: 4, title: 'Workout Prefs', emoji: '💪', desc: 'When and how you train' },
  { id: 5, title: 'All Done!', emoji: '🎉', desc: 'Your plan is ready' },
];

const GOALS = [
  { value: 'lose_weight', label: 'Lose Weight', emoji: '⚖️', desc: 'Burn fat and slim down' },
  { value: 'gain_muscle', label: 'Build Muscle', emoji: '💪', desc: 'Increase strength and mass' },
  { value: 'maintain', label: 'Maintain Weight', emoji: '⚡', desc: 'Stay at current weight' },
  { value: 'improve_fitness', label: 'Improve Fitness', emoji: '🏃', desc: 'Better endurance & cardio' },
  { value: 'eat_healthy', label: 'Eat Healthier', emoji: '🥗', desc: 'Better nutrition habits' },
];

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise', emoji: '🛋️' },
  { value: 'light', label: 'Lightly Active', desc: '1-3 days/week', emoji: '🚶' },
  { value: 'moderate', label: 'Moderately Active', desc: '3-5 days/week', emoji: '🏃' },
  { value: 'active', label: 'Very Active', desc: '6-7 days/week', emoji: '🏋️' },
  { value: 'very_active', label: 'Extra Active', desc: 'Hard exercise daily', emoji: '⚡' },
];

const DIET_PREFS = ['none', 'vegetarian', 'vegan', 'keto', 'paleo', 'mediterranean'];
const WORKOUT_TIMES = ['morning', 'afternoon', 'evening', 'night'];
const EQUIPMENT = ['dumbbells', 'barbell', 'resistance bands', 'pull-up bar', 'bench', 'treadmill', 'none'];

export default function WizardPage() {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({
    age: '', gender: '', height: '', weight: '',
    goal: '', activity_level: '', diet_preference: 'none',
    workout_time: 'morning', equipment: [],
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const toggleEq = (eq) => setForm(f => ({
    ...f, equipment: f.equipment.includes(eq) ? f.equipment.filter(e => e !== eq) : [...f.equipment, eq]
  }));

  const canNext = () => {
    if (step === 1) return form.age && form.gender && form.height && form.weight;
    if (step === 2) return form.goal;
    if (step === 3) return form.activity_level;
    if (step === 4) return form.workout_time;
    return true;
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const { data } = await profileAPI.completeWizard(form);
      if (data.success) {
        setResult(data.data);
        updateUser({ wizard_completed: true });
        setStep(5);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save goals');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-indigo-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map(s => (
            <div key={s.id} className={`flex items-center gap-2 ${s.id < step ? 'opacity-100' : s.id === step ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${s.id < step ? 'bg-emerald-400 text-white' : s.id === step ? 'bg-white text-violet-700' : 'bg-white/20 text-white/60'}`}>
                {s.id < step ? <CheckCircle size={14} /> : s.id}
              </div>
              {s.id < 5 && <div className={`w-6 h-0.5 ${s.id < step ? 'bg-emerald-400' : 'bg-white/20'}`} />}
            </div>
          ))}
        </div>

        <div className="card p-8 glass">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-3 animate-float">{STEPS[step - 1].emoji}</div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{STEPS[step - 1].title}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{STEPS[step - 1].desc}</p>
          </div>

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Age</label>
                <input type="number" value={form.age} onChange={e => set('age', e.target.value)} className="input-field" placeholder="e.g. 25" min="10" max="100" />
              </div>
              <div>
                <label className="label">Gender</label>
                <div className="grid grid-cols-3 gap-2">
                  {['male', 'female', 'other'].map(g => (
                    <button key={g} type="button" onClick={() => set('gender', g)}
                      className={`py-2.5 rounded-xl text-sm font-medium border transition-all capitalize
                        ${form.gender === g ? 'bg-violet-600 text-white border-violet-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300 hover:border-violet-400'}`}>
                      {g === 'male' ? '👨' : g === 'female' ? '👩' : '🧑'} {g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Height (cm)</label>
                <input type="number" value={form.height} onChange={e => set('height', e.target.value)} className="input-field" placeholder="e.g. 175" />
              </div>
              <div>
                <label className="label">Weight (kg)</label>
                <input type="number" value={form.weight} onChange={e => set('weight', e.target.value)} className="input-field" placeholder="e.g. 70" />
              </div>
            </div>
          )}

          {/* Step 2: Goals */}
          {step === 2 && (
            <div className="grid sm:grid-cols-2 gap-3">
              {GOALS.map(g => (
                <button key={g.value} type="button" onClick={() => set('goal', g.value)}
                  className={`p-4 rounded-xl border text-left transition-all
                    ${form.goal === g.value ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30 shadow-glow-sm' : 'border-slate-200 dark:border-dark-border hover:border-violet-300 dark:bg-slate-800/50'}`}>
                  <div className="text-2xl mb-1">{g.emoji}</div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{g.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{g.desc}</p>
                </button>
              ))}
            </div>
          )}

          {/* Step 3: Activity & Diet */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="label mb-3">Activity Level</label>
                <div className="space-y-2">
                  {ACTIVITY_LEVELS.map(a => (
                    <button key={a.value} type="button" onClick={() => set('activity_level', a.value)}
                      className={`w-full p-3.5 rounded-xl border flex items-center gap-3 text-left transition-all
                        ${form.activity_level === a.value ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30' : 'border-slate-200 dark:border-dark-border hover:border-violet-300 dark:bg-slate-800/50'}`}>
                      <span className="text-xl">{a.emoji}</span>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white text-sm">{a.label}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{a.desc}</p>
                      </div>
                      {form.activity_level === a.value && <CheckCircle size={16} className="text-violet-500 ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Diet Preference</label>
                <div className="grid grid-cols-3 gap-2">
                  {DIET_PREFS.map(d => (
                    <button key={d} type="button" onClick={() => set('diet_preference', d)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border capitalize transition-all
                        ${form.diet_preference === d ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300 hover:border-emerald-400'}`}>
                      {d === 'none' ? 'No Preference' : d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Workout Preferences */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <label className="label mb-3">Preferred Workout Time</label>
                <div className="grid grid-cols-2 gap-2">
                  {WORKOUT_TIMES.map(t => (
                    <button key={t} type="button" onClick={() => set('workout_time', t)}
                      className={`py-3 rounded-xl border capitalize font-medium text-sm transition-all
                        ${form.workout_time === t ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300' : 'border-slate-200 dark:border-dark-border dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:border-violet-300'}`}>
                      {t === 'morning' ? '🌅' : t === 'afternoon' ? '☀️' : t === 'evening' ? '🌆' : '🌙'} {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label mb-3">Available Equipment</label>
                <div className="flex flex-wrap gap-2">
                  {EQUIPMENT.map(eq => (
                    <button key={eq} type="button" onClick={() => toggleEq(eq)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border capitalize transition-all
                        ${form.equipment.includes(eq) ? 'bg-violet-600 text-white border-violet-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300 hover:border-violet-400'}`}>
                      {eq}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Results */}
          {step === 5 && result && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/30 dark:to-indigo-900/30 border border-violet-100 dark:border-violet-800/30">
                  <p className="text-xs text-violet-600 dark:text-violet-400 font-bold uppercase mb-1">Daily Calories</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{result.daily_calories_goal} <span className="text-sm font-normal text-slate-500">kcal</span></p>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border border-blue-100 dark:border-blue-800/30">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase mb-1">Daily Water</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{result.daily_water_goal}ml</p>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border border-emerald-100 dark:border-emerald-800/30">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase mb-1">Your BMI</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{result.bmi} <span className="text-sm font-normal text-slate-500">{result.category}</span></p>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-100 dark:border-amber-800/30">
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase mb-1">Sleep Goal</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">8 <span className="text-sm font-normal text-slate-500">hours</span></p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 flex items-center gap-3">
                <CheckCircle className="text-emerald-500 shrink-0" size={22} />
                <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">Your personalized workout and meal plans have been generated!</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            {step > 1 && step < 5 ? (
              <button onClick={() => setStep(s => s - 1)} className="btn-secondary flex items-center gap-1.5">
                <ChevronLeft size={16} /> Back
              </button>
            ) : <div />}
            {step < 4 ? (
              <button onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="btn-primary flex items-center gap-1.5 disabled:opacity-40">
                Next <ChevronRight size={16} />
              </button>
            ) : step === 4 ? (
              <button onClick={handleFinish} disabled={loading || !canNext()} className="btn-primary flex items-center gap-1.5">
                {loading ? <Spinner size="sm" /> : <><span>Generate My Plan</span><ChevronRight size={16} /></>}
              </button>
            ) : (
              <button onClick={() => navigate('/dashboard')} className="btn-primary flex items-center gap-1.5">
                Go to Dashboard <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
