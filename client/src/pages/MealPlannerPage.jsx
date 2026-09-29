import React, { useState, useEffect } from 'react';
import { mealAPI } from '../api';
import { PageLoader, EmptyState } from '../components/common';
import { Plus, Trash2, Check, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_EMOJIS = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' };
const MEAL_FILTERS = ['all', 'vegetarian', 'vegan', 'high_protein', 'weight_loss', 'muscle_gain', 'keto'];

export default function MealPlannerPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [plan, setPlan] = useState({ breakfast: [], lunch: [], dinner: [], snack: [] });
  const [meals, setMeals] = useState([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [addTo, setAddTo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadPlan(); }, [date]);
  useEffect(() => { loadMeals(); }, [search, activeFilter]);

  const loadPlan = async () => {
    setLoading(true);
    try {
      const { data } = await mealAPI.getMealPlan(date);
      setPlan(data.data || { breakfast: [], lunch: [], dinner: [], snack: [] });
    } catch {}
    setLoading(false);
  };

  const loadMeals = async () => {
    try {
      const params = { limit: 20 };
      if (search) params.search = search;
      const { data } = await mealAPI.getAll(params);
      setMeals(data.data || []);
    } catch {}
  };

  const addMeal = async (mealId) => {
    if (!addTo) return;
    try {
      await mealAPI.addToMealPlan({ date, meal_type: addTo, meal_id: mealId });
      toast.success('Meal added to plan! 🥗');
      setAddTo(null);
      loadPlan();
    } catch { toast.error('Failed to add meal'); }
  };

  const removeMeal = async (planId) => {
    try {
      await mealAPI.removeFromPlan(planId);
      toast.success('Meal removed');
      loadPlan();
    } catch {}
  };

  const toggleComplete = async (planId) => {
    try {
      await mealAPI.completeMeal(planId);
      loadPlan();
    } catch {}
  };

  const getTotalNutrition = () => {
    const allMeals = [...plan.breakfast, ...plan.lunch, ...plan.dinner, ...plan.snack];
    return allMeals.reduce((acc, p) => ({
      calories: acc.calories + (p.meal?.calories || 0),
      protein: acc.protein + (p.meal?.protein || 0),
      fat: acc.fat + (p.meal?.fat || 0),
      carbs: acc.carbs + (p.meal?.carbs || 0),
    }), { calories: 0, protein: 0, fat: 0, carbs: 0 });
  };

  const totals = getTotalNutrition();

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title">Meal Planner 🥗</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Plan your nutrition for optimal performance</p>
        </div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field w-auto py-2" />
      </div>

      {/* Daily totals */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Calories', value: `${totals.calories} kcal`, color: 'text-orange-500', icon: '🔥' },
          { label: 'Protein', value: `${totals.protein.toFixed(0)}g`, color: 'text-violet-500', icon: '🥩' },
          { label: 'Carbs', value: `${totals.carbs.toFixed(0)}g`, color: 'text-blue-500', icon: '🍞' },
          { label: 'Fat', value: `${totals.fat.toFixed(0)}g`, color: 'text-amber-500', icon: '🥑' },
        ].map(n => (
          <div key={n.label} className="card p-3.5 text-center">
            <div className="text-xl mb-1">{n.icon}</div>
            <p className={`font-bold ${n.color} text-sm`}>{n.value}</p>
            <p className="text-xs text-slate-400">{n.label}</p>
          </div>
        ))}
      </div>

      {/* Diet filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {MEAL_FILTERS.map(f => (
          <button key={f} onClick={() => setActiveFilter(f)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border capitalize transition-all
              ${activeFilter === f ? 'bg-emerald-500 text-white border-emerald-500' : 'border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300 hover:border-emerald-400 dark:bg-slate-800'}`}>
            {f === 'all' ? '🍽️ All' : f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Meal sections */}
      <div className="grid lg:grid-cols-2 gap-5">
        {MEAL_TYPES.map(type => (
          <div key={type} className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="text-xl">{MEAL_EMOJIS[type]}</span>
                <span className="capitalize">{type}</span>
              </h3>
              <button onClick={() => setAddTo(addTo === type ? null : type)} className="btn-primary text-xs px-3 py-1.5">
                <Plus size={14} /> Add
              </button>
            </div>

            {/* Add meal dropdown */}
            {addTo === type && (
              <div className="mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-dark-border">
                <div className="relative mb-2">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search meals..." className="input-field pl-8 py-2 text-xs" />
                </div>
                <div className="space-y-1.5 max-h-52 overflow-y-auto">
                  {meals.map(meal => (
                    <button key={meal.id} onClick={() => addMeal(meal.id)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white dark:hover:bg-dark-surface border border-transparent hover:border-slate-200 dark:hover:border-dark-border transition-all text-left">
                      <div>
                        <p className="text-xs font-medium text-slate-800 dark:text-white">{meal.name}</p>
                        <p className="text-[10px] text-slate-400">{meal.calories} kcal · {meal.protein}g protein</p>
                      </div>
                      <Plus size={14} className="text-emerald-500 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Planned meals */}
            {plan[type]?.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4 border-2 border-dashed border-slate-200 dark:border-dark-border rounded-xl">
                No {type} planned yet
              </p>
            ) : (
              <div className="space-y-2">
                {plan[type].map(p => (
                  <div key={p.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${p.completed ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30' : 'border-slate-100 dark:border-dark-border'}`}>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${p.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-white'}`}>
                        {p.meal?.name}
                      </p>
                      <p className="text-xs text-slate-400">{p.meal?.calories} kcal · {p.meal?.protein}g P · {p.meal?.carbs}g C · {p.meal?.fat}g F</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button onClick={() => toggleComplete(p.id)} className={`p-1.5 rounded-lg transition-colors ${p.completed ? 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50'}`}>
                        <Check size={14} />
                      </button>
                      <button onClick={() => removeMeal(p.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
