import React, { useState, useEffect } from 'react';
import { exerciseAPI } from '../api';
import { PageLoader, EmptyState, Tag } from '../components/common';
import { categoryColors, difficultyColors, getImageUrl } from '../utils/helpers';
import { useDebounce } from '../hooks';
import { Search, Filter, Heart, HeartOff, Play, Clock, Flame, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['all', 'cardio', 'strength', 'flexibility', 'hiit', 'yoga', 'pilates', 'balance', 'sports'];
const DIFFICULTIES = ['all', 'beginner', 'intermediate', 'advanced'];
const CATEGORY_EMOJIS = { cardio: '🏃', strength: '💪', flexibility: '🤸', hiit: '⚡', yoga: '🧘', pilates: '🩰', balance: '⚖️', sports: '⚽', all: '🏋️' };

export default function ExercisesPage() {
  const [exercises, setExercises] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => { loadExercises(); }, [debouncedSearch, category, difficulty, page]);
  useEffect(() => { loadFavorites(); }, []);

  const loadExercises = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (category !== 'all') params.category = category;
      if (difficulty !== 'all') params.difficulty = difficulty;
      const { data } = await exerciseAPI.getAll(params);
      setExercises(data.data || []);
      setTotal(data.total || 0);
    } catch {}
    setLoading(false);
  };

  const loadFavorites = async () => {
    try {
      const { data } = await exerciseAPI.getFavorites();
      setFavorites(new Set((data.data || []).map(e => e.id)));
    } catch {}
  };

  const toggleFavorite = async (id, e) => {
    e.stopPropagation();
    try {
      await exerciseAPI.toggleFavorite(id);
      setFavorites(prev => {
        const next = new Set(prev);
        if (next.has(id)) { next.delete(id); toast.success('Removed from favorites'); }
        else { next.add(id); toast.success('Added to favorites! ❤️'); }
        return next;
      });
    } catch { toast.error('Failed to update favorites'); }
  };

  const difficultyStars = { beginner: 1, intermediate: 2, advanced: 3 };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Exercise Library 💪</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{total} exercises available</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search exercises..." className="input-field pl-9 py-2.5" />
          </div>
          <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} className="input-field py-2.5 pr-8 min-w-36">
            {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_EMOJIS[c]} {c === 'all' ? 'All Categories' : c}</option>)}
          </select>
          <select value={difficulty} onChange={e => { setDifficulty(e.target.value); setPage(1); }} className="input-field py-2.5 min-w-36">
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d === 'all' ? 'All Levels' : d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
          </select>
        </div>
        {/* Category pills */}
        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => { setCategory(c); setPage(1); }}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all capitalize
                ${category === c ? 'bg-violet-600 text-white border-violet-600' : 'border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300 hover:border-violet-400 dark:bg-slate-800'}`}>
              {CATEGORY_EMOJIS[c]} {c === 'all' ? 'All' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Exercises grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-0 overflow-hidden animate-pulse">
              <div className="h-40 bg-slate-200 dark:bg-slate-700" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : exercises.length === 0 ? (
        <EmptyState icon="🏋️" title="No exercises found" description="Try adjusting your search or filters" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {exercises.map(ex => (
            <div key={ex.id} className="card overflow-hidden group hover:-translate-y-1 hover:shadow-glow-sm transition-all duration-300 cursor-pointer" onClick={() => setSelected(ex)}>
              <div className={`h-40 flex items-center justify-center text-5xl relative ${ex.category === 'cardio' ? 'gradient-orange' : ex.category === 'strength' ? 'gradient-purple' : ex.category === 'yoga' ? 'gradient-green' : ex.category === 'hiit' ? 'gradient-pink' : 'gradient-blue'}`}>
                {CATEGORY_EMOJIS[ex.category] || '🏋️'}
                {ex.is_featured && (
                  <span className="absolute top-2 left-2 badge badge-warning text-xs">⭐ Featured</span>
                )}
                <button onClick={(e) => toggleFavorite(ex.id, e)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors">
                  {favorites.has(ex.id) ? <Heart size={15} className="text-rose-400 fill-rose-400" /> : <Heart size={15} className="text-white" />}
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`badge text-xs ${categoryColors[ex.category] || 'badge-primary'}`}>{ex.category}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: difficultyStars[ex.difficulty] || 1 }).map((_, i) => (
                      <span key={i} className="text-amber-400 text-xs">⭐</span>
                    ))}
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-2 line-clamp-1">{ex.name}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1"><Clock size={11} /> {ex.duration}min</span>
                  <span className="flex items-center gap-1"><Flame size={11} /> {ex.calories_burned} kcal</span>
                </div>
                {ex.muscle_group && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(Array.isArray(ex.muscle_group) ? ex.muscle_group : [ex.muscle_group]).slice(0, 2).map(m => (
                      <span key={m} className="px-1.5 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">{m}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 12 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">← Prev</button>
          <span className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">Page {page} of {Math.ceil(total / 12)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 12)} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">Next →</button>
        </div>
      )}

      {/* Exercise detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg card overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className={`h-52 flex items-center justify-center text-8xl ${selected.category === 'cardio' ? 'gradient-orange' : selected.category === 'strength' ? 'gradient-purple' : 'gradient-blue'} relative`}>
              {CATEGORY_EMOJIS[selected.category] || '🏋️'}
              <button onClick={() => setSelected(null)} className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/40 text-white font-bold">✕</button>
            </div>
            <div className="p-6 overflow-y-auto max-h-96">
              <div className="flex items-center gap-2 mb-2">
                <span className={`badge text-xs ${categoryColors[selected.category] || 'badge-primary'}`}>{selected.category}</span>
                <span className={`badge text-xs badge-warning`}>{selected.difficulty}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{selected.name}</h2>
              <div className="flex gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                <span>⏱️ {selected.duration} min</span>
                <span>🔥 {selected.calories_burned} kcal</span>
                {selected.sets && <span>Sets: {selected.sets} × {selected.reps} reps</span>}
              </div>
              {selected.description && <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">{selected.description}</p>}
              {selected.instructions && (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-2">📋 Instructions</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed">{selected.instructions}</p>
                </div>
              )}
              {selected.muscle_group && (
                <div className="mt-4">
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-2">💪 Muscle Groups</h4>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(selected.muscle_group) ? selected.muscle_group : [selected.muscle_group]).map(m => (
                      <Tag key={m} label={m} color="violet" />
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3 mt-5">
                <button onClick={() => toggleFavorite(selected.id, { stopPropagation: () => {} })}
                  className={favorites.has(selected.id) ? 'btn-danger flex-1' : 'btn-secondary flex-1'}>
                  {favorites.has(selected.id) ? '❤️ Favorited' : '🤍 Add Favorite'}
                </button>
                <button onClick={() => setSelected(null)} className="btn-primary flex-1">Start Exercise →</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
