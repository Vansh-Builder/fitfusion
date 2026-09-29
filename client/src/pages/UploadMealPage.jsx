import React, { useState } from 'react';
import { mealAPI } from '../api';
import { Spinner } from '../components/common';
import { Upload, Image, Check, Scan } from 'lucide-react';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/helpers';

export default function UploadMealPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({ meal_name: '', estimated_calories: '', notes: '' });
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  };

  const uploadMeal = async (e) => {
    e.preventDefault();
    if (!file) { toast.error('Please select an image'); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('meal_name', form.meal_name);
      formData.append('estimated_calories', form.estimated_calories);
      formData.append('notes', form.notes);
      const { data } = await mealAPI.uploadMeal(formData);
      setResult(data.data);
      toast.success('Meal uploaded and analyzed! 🎉');
    } catch { toast.error('Failed to upload meal'); }
    setUploading(false);
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data } = await mealAPI.getUploadHistory({ limit: 10 });
      setHistory(data.data || []);
    } catch {}
    setLoadingHistory(false);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div>
        <h1 className="section-title">Upload Meal 📷</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Log your meals by uploading a photo</p>
      </div>

      <div className="card p-6">
        <form onSubmit={uploadMeal} className="space-y-5">
          {/* Drop zone */}
          <div className="relative">
            <label className={`block border-2 border-dashed rounded-2xl cursor-pointer transition-all
              ${preview ? 'border-violet-400' : 'border-slate-200 dark:border-dark-border hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/10'}`}>
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-2xl" />
                  <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-white font-medium">Click to change</p>
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center">
                  <div className="w-14 h-14 rounded-2xl gradient-purple flex items-center justify-center mx-auto mb-3 shadow-glow">
                    <Image size={24} className="text-white" />
                  </div>
                  <p className="font-medium text-slate-700 dark:text-slate-300">Click or drag to upload meal photo</p>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
                </div>
              )}
              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
            </label>
          </div>

          <div>
            <label className="label">Meal Name</label>
            <input value={form.meal_name} onChange={e => setForm(f => ({ ...f, meal_name: e.target.value }))} className="input-field" placeholder="e.g. Grilled Chicken Salad" required />
          </div>
          <div>
            <label className="label">Estimated Calories</label>
            <input type="number" value={form.estimated_calories} onChange={e => setForm(f => ({ ...f, estimated_calories: e.target.value }))} className="input-field" placeholder="e.g. 450" />
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input-field resize-none h-20" placeholder="Any details about ingredients, preparation, etc." />
          </div>

          <button type="submit" disabled={uploading || !file} className="btn-primary w-full">
            {uploading ? <><Spinner size="sm" /> Uploading...</> : <><Upload size={16} />Upload Meal</>}
          </button>
        </form>

        {result && (
          <div className="mt-5 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 animate-slide-up">
            <div className="flex items-center gap-2 mb-3">
              <Check className="text-emerald-500" size={20} />
              <p className="font-bold text-emerald-700 dark:text-emerald-300">Meal Uploaded Successfully!</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 rounded-xl bg-white dark:bg-dark-surface border border-emerald-100 dark:border-dark-border">
                <p className="text-xs text-slate-400">Meal</p>
                <p className="font-semibold text-slate-800 dark:text-white">{result.meal_name}</p>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-dark-surface border border-emerald-100 dark:border-dark-border">
                <p className="text-xs text-slate-400">Est. Calories</p>
                <p className="font-semibold text-slate-800 dark:text-white">{result.estimated_calories || 'N/A'} kcal</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload history */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 dark:text-white">Upload History</h3>
          <button onClick={loadHistory} disabled={loadingHistory} className="btn-secondary text-xs">
            {loadingHistory ? <Spinner size="sm" /> : 'Load History'}
          </button>
        </div>
        {history.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {history.map(item => (
              <div key={item.id} className="rounded-xl overflow-hidden border border-slate-100 dark:border-dark-border">
                {item.image_url && (
                  <img src={getImageUrl(item.image_url)} alt={item.meal_name} className="w-full h-24 object-cover" />
                )}
                <div className="p-2">
                  <p className="text-xs font-medium text-slate-800 dark:text-white truncate">{item.meal_name}</p>
                  <p className="text-[10px] text-slate-400">{item.estimated_calories} kcal</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-4">Click "Load History" to see your previous uploads</p>
        )}
      </div>
    </div>
  );
}
