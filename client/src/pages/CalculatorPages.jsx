import React, { useState } from 'react';
import { healthAPI } from '../api';
import { getBMIColor, getBMICategory } from '../utils/helpers';
import toast from 'react-hot-toast';

export function BMICalculatorPage() {
  const [form, setForm] = useState({ height: '', weight: '', age: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await healthAPI.calculateBMI(form);
      setResult(data.data);
      toast.success('BMI calculated and saved!');
    } catch {
      // Fallback local calculation
      const h = parseFloat(form.height) / 100;
      const w = parseFloat(form.weight);
      const bmi = parseFloat((w / (h * h)).toFixed(1));
      let category = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal weight' : bmi < 30 ? 'Overweight' : 'Obese';
      setResult({ bmi, category });
    }
    setLoading(false);
  };

  const bmiRanges = [
    { label: 'Underweight', range: '< 18.5', color: '#3b82f6', desc: 'Increase caloric intake and focus on nutrient-dense foods' },
    { label: 'Normal weight', range: '18.5 - 24.9', color: '#10b981', desc: 'Maintain your current diet and exercise routine' },
    { label: 'Overweight', range: '25.0 - 29.9', color: '#f59e0b', desc: 'Reduce caloric intake and increase physical activity' },
    { label: 'Obese', range: '≥ 30.0', color: '#f43f5e', desc: 'Consult a healthcare provider for a structured weight loss plan' },
  ];

  const getBMIPosition = (bmi) => Math.min(95, Math.max(5, ((bmi - 10) / 30) * 100));

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div>
        <h1 className="section-title">BMI Calculator ⚖️</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Calculate your Body Mass Index</p>
      </div>

      <div className="card p-6">
        <form onSubmit={calculate} className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Height (cm)</label>
              <input type="number" value={form.height} onChange={e => setForm(f => ({ ...f, height: e.target.value, result: null }))} className="input-field" placeholder="e.g. 175" required min="100" max="250" />
            </div>
            <div>
              <label className="label">Weight (kg)</label>
              <input type="number" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value, result: null }))} className="input-field" placeholder="e.g. 70" required min="20" max="300" />
            </div>
            <div>
              <label className="label">Age</label>
              <input type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} className="input-field" placeholder="e.g. 25" min="10" max="100" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Calculating...' : 'Calculate BMI'}
          </button>
        </form>

        {result && (
          <div className="mt-6 animate-slide-up">
            <div className="text-center p-6 rounded-2xl border border-slate-100 dark:border-dark-border bg-slate-50 dark:bg-slate-800/50 mb-4">
              <p className="text-6xl font-bold font-display mb-2" style={{ color: result.bmi < 18.5 ? '#3b82f6' : result.bmi < 25 ? '#10b981' : result.bmi < 30 ? '#f59e0b' : '#f43f5e' }}>
                {result.bmi}
              </p>
              <p className="text-xl font-semibold text-slate-700 dark:text-slate-200">{result.category}</p>
            </div>

            {/* BMI scale */}
            <div className="mb-4">
              <div className="h-4 rounded-full overflow-hidden flex mb-2">
                <div className="flex-1 bg-blue-400" />
                <div className="flex-1 bg-emerald-400" />
                <div className="flex-1 bg-amber-400" />
                <div className="flex-1 bg-rose-500" />
              </div>
              <div className="relative h-4">
                <div className="absolute -top-5 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-slate-800 dark:border-b-white transition-all duration-500"
                  style={{ left: `${getBMIPosition(result.bmi)}%`, transform: 'translateX(-50%)' }} />
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>10</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
              </div>
            </div>

            {result.suggestions && (
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-white text-sm">Recommendations</h4>
                {result.suggestions.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <span className="text-emerald-500">✓</span> {s}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* BMI reference table */}
      <div className="card p-5">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">BMI Categories</h3>
        <div className="space-y-3">
          {bmiRanges.map(r => (
            <div key={r.label} className={`p-3.5 rounded-xl flex items-start gap-3 ${result?.category === r.label ? 'ring-2' : ''}`}
              style={{ backgroundColor: `${r.color}15`, borderColor: result?.category === r.label ? r.color : 'transparent' }}>
              <div className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ backgroundColor: r.color }} />
              <div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-sm text-slate-800 dark:text-white">{r.label}</p>
                  <span className="text-xs text-slate-400">BMI {r.range}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CalorieCalculatorPage() {
  const [form, setForm] = useState({ weight: '', height: '', age: '', gender: 'male', activity_level: 'moderate' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await healthAPI.calculateCalories(form);
      setResult(data.data);
    } catch {
      toast.error('Calculation failed');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div>
        <h1 className="section-title">Calorie Calculator 🔥</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Calculate your daily caloric needs</p>
      </div>

      <div className="card p-6">
        <form onSubmit={calculate} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Weight (kg)</label>
              <input type="number" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} className="input-field" required placeholder="70" />
            </div>
            <div>
              <label className="label">Height (cm)</label>
              <input type="number" value={form.height} onChange={e => setForm(f => ({ ...f, height: e.target.value }))} className="input-field" required placeholder="175" />
            </div>
            <div>
              <label className="label">Age</label>
              <input type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} className="input-field" required placeholder="25" />
            </div>
            <div>
              <label className="label">Gender</label>
              <div className="grid grid-cols-2 gap-2">
                {['male', 'female'].map(g => (
                  <button key={g} type="button" onClick={() => setForm(f => ({ ...f, gender: g }))}
                    className={`py-2.5 rounded-xl border text-sm font-medium capitalize transition-all ${form.gender === g ? 'bg-violet-600 text-white border-violet-600' : 'border-slate-200 dark:border-dark-border dark:bg-slate-800'}`}>
                    {g === 'male' ? '👨' : '👩'} {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="label">Activity Level</label>
            <select value={form.activity_level} onChange={e => setForm(f => ({ ...f, activity_level: e.target.value }))} className="input-field">
              {[['sedentary', 'Sedentary (desk job)'], ['light', 'Lightly Active (1-3 days/week)'], ['moderate', 'Moderately Active (3-5 days)'], ['active', 'Very Active (6-7 days)'], ['very_active', 'Extra Active (athlete)']].map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">Calculate Calories</button>
        </form>

        {result && (
          <div className="mt-6 animate-slide-up space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white">Your Daily Calorie Needs</h3>
            {[
              { label: 'BMR (Basal Metabolic Rate)', value: result.bmr, desc: 'Calories burned at rest', icon: '❤️', color: 'violet' },
              { label: 'Weight Loss', value: result.weight_loss, desc: '500 kcal deficit/day', icon: '⬇️', color: 'blue' },
              { label: 'Maintenance', value: result.maintenance, desc: 'TDEE — maintain current weight', icon: '⚖️', color: 'green' },
              { label: 'Weight Gain', value: result.weight_gain, desc: '300 kcal surplus/day', icon: '⬆️', color: 'orange' },
              { label: 'Bulk', value: result.bulk, desc: '500 kcal surplus — aggressive gain', icon: '💪', color: 'rose' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-dark-border">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-sm text-slate-800 dark:text-white">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{item.value} <span className="text-xs text-slate-400 font-normal">kcal</span></p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
