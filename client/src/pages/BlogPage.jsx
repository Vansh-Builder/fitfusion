import React, { useState, useEffect } from 'react';
import { blogAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { PageLoader, EmptyState } from '../components/common';
import { BookOpen, Clock, Search, Plus, ArrowLeft } from 'lucide-react';
import { truncate, formatDate, getImageUrl } from '../utils/helpers';
import { Link } from 'react-router-dom';

const CATEGORIES = ['all', 'nutrition', 'fitness', 'mental_health', 'recipes', 'weight_loss', 'muscle_gain', 'supplements', 'lifestyle'];

export default function BlogPage() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => { loadBlogs(); }, [search, category, page]);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 9 };
      if (search) params.search = search;
      if (category !== 'all') params.category = category;
      const { data } = await blogAPI.getAll(params);
      setBlogs(data.data || []);
      setTotal(data.total || 0);
    } catch {}
    setLoading(false);
  };

  const loadBlog = async (id) => {
    try {
      const { data } = await blogAPI.getOne(id);
      setSelectedBlog(data.data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}
  };

  if (selectedBlog) {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in">
        <button onClick={() => setSelectedBlog(null)} className="flex items-center gap-2 text-violet-600 dark:text-violet-400 mb-6 hover:underline">
          <ArrowLeft size={16} /> Back to Blog
        </button>
        <article className="card overflow-hidden">
          {selectedBlog.image_url && (
            <img src={getImageUrl(selectedBlog.image_url)} alt={selectedBlog.title} className="w-full h-64 object-cover" />
          )}
          <div className="p-7">
            <div className="flex items-center gap-3 mb-4">
              <span className="badge badge-primary text-xs capitalize">{selectedBlog.category}</span>
              <span className="text-xs text-slate-400">{selectedBlog.read_time || 5} min read</span>
            </div>
            <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-3">{selectedBlog.title}</h1>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6 pb-6 border-b border-slate-100 dark:border-dark-border">
              <span>By {selectedBlog.author?.name}</span>
              <span>·</span>
              <span>{formatDate(selectedBlog.created_at)}</span>
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {selectedBlog.content}
            </div>
            {selectedBlog.tags?.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {selectedBlog.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Health Blog 📖</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Expert insights for your wellness journey</p>
        </div>
        {user?.role === 'admin' && (
          <button className="btn-primary"><Plus size={16} /> New Post</button>
        )}
      </div>

      {/* Search & Categories */}
      <div className="card p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search articles..." className="input-field pl-9" />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => { setCategory(c); setPage(1); }}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border capitalize transition-all
                ${category === c ? 'bg-violet-600 text-white border-violet-600' : 'border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300 dark:bg-slate-800 hover:border-violet-400'}`}>
              {c === 'all' ? '📚 All' : c.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded-t-2xl" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <EmptyState icon="📝" title="No articles found" description="Try different search terms or categories" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {blogs.map(blog => (
            <div key={blog.id} className="card overflow-hidden group hover:-translate-y-1 hover:shadow-glow-sm transition-all duration-300 cursor-pointer" onClick={() => loadBlog(blog.id)}>
              <div className={`h-40 flex items-center justify-center text-5xl ${blog.category === 'nutrition' ? 'gradient-green' : blog.category === 'fitness' ? 'gradient-purple' : blog.category === 'mental_health' ? 'gradient-teal' : 'gradient-blue'}`}>
                {blog.category === 'nutrition' ? '🥗' : blog.category === 'fitness' ? '🏋️' : blog.category === 'recipes' ? '🍽️' : blog.category === 'mental_health' ? '🧘' : blog.category === 'weight_loss' ? '⚖️' : '📚'}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge badge-primary text-xs capitalize">{blog.category?.replace('_', ' ')}</span>
                  <span className="text-xs text-slate-400 flex items-center gap-1"><Clock size={10} /> {blog.read_time || 5} min</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 text-sm leading-relaxed">{blog.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-3 leading-relaxed">{blog.excerpt || truncate(blog.content, 100)}</p>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>By {blog.author?.name}</span>
                  <span>{formatDate(blog.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {total > 9 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm disabled:opacity-40">← Prev</button>
          <span className="px-4 py-2 text-sm text-slate-500">Page {page} of {Math.ceil(total / 9)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 9)} className="btn-secondary text-sm disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
}
