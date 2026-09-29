import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { exerciseAPI, mealAPI } from '../api';
import { getRandomQuote, categoryColors, formatNumber } from '../utils/helpers';
import { Dumbbell, Utensils, Droplets, TrendingUp, ArrowRight, Star, ChevronRight, Flame, CheckCircle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const HEALTH_TIPS = [
  { emoji: '🥗', tip: 'Eat a rainbow of vegetables daily for diverse nutrients.' },
  { emoji: '💧', tip: 'Drink water first thing in the morning to kickstart your metabolism.' },
  { emoji: '🚶', tip: '10,000 steps a day can significantly improve cardiovascular health.' },
  { emoji: '😴', tip: 'Quality sleep of 7-9 hours helps muscle recovery and weight management.' },
  { emoji: '🧘', tip: '5 minutes of meditation daily reduces cortisol and stress levels.' },
];

const TESTIMONIALS = [
  { name: 'Sarah K.', goal: 'Lost 12kg', avatar: '👩', text: 'FitFusion completely transformed my approach to fitness. The meal planner and workout tracker kept me consistent!', rating: 5 },
  { name: 'Marcus T.', goal: 'Gained 8kg muscle', avatar: '🧑', text: 'The AI assistant answers all my nutrition questions perfectly. Best fitness app I\'ve ever used!', rating: 5 },
  { name: 'Priya S.', goal: 'Improved BMI by 4 points', avatar: '👩‍🦱', text: 'The water tracker and sleep tracker helped me understand how lifestyle affects my weight loss.', rating: 5 },
];

const STATS = [
  { label: 'Active Users', value: '50K+', icon: '👥' },
  { label: 'Workouts Logged', value: '2M+', icon: '💪' },
  { label: 'Meals Tracked', value: '5M+', icon: '🥗' },
  { label: 'Goals Achieved', value: '95%', icon: '🏆' },
];

const FEATURES = [
  { icon: '🏋️', title: 'Smart Workout Plans', desc: 'AI-generated personalized workout plans based on your goals and fitness level', color: 'gradient-purple' },
  { icon: '🥗', title: 'Meal Planning', desc: 'Comprehensive meal planner with macro tracking, dietary filters, and recipe suggestions', color: 'gradient-green' },
  { icon: '📊', title: 'Health Analytics', desc: 'Detailed charts and progress tracking for weight, sleep, water, and fitness metrics', color: 'gradient-blue' },
  { icon: '🤖', title: 'AI Assistant', desc: 'Rule-based fitness chatbot with OpenAI integration ready for personalized advice', color: 'gradient-orange' },
  { icon: '🏆', title: 'Challenges & Rewards', desc: 'Stay motivated with 30-day challenges, XP points, badges, and leaderboards', color: 'gradient-pink' },
  { icon: '👨‍👩‍👧', title: 'Family Health', desc: 'Manage health metrics for your entire family under one account', color: 'gradient-teal' },
];

export default function HomePage() {
  const { user } = useAuth();
  const [tipIdx, setTipIdx] = useState(0);
  const [quote] = useState(getRandomQuote());
  const [exercises, setExercises] = useState([]);
  const [meals, setMeals] = useState([]);
  const [email, setEmail] = useState('');
  const [bmi, setBmi] = useState({ height: '', weight: '', result: null });

  useEffect(() => {
    exerciseAPI.getAll({ limit: 4, page: 1 }).then(r => setExercises(r.data?.data || [])).catch(() => {});
    mealAPI.getAll({ limit: 4 }).then(r => setMeals(r.data?.data || [])).catch(() => {});
    const t = setInterval(() => setTipIdx(i => (i + 1) % HEALTH_TIPS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const calcBMI = () => {
    const h = parseFloat(bmi.height) / 100;
    const w = parseFloat(bmi.weight);
    if (!h || !w) return;
    const val = (w / (h * h)).toFixed(1);
    let cat = val < 18.5 ? 'Underweight' : val < 25 ? 'Normal weight' : val < 30 ? 'Overweight' : 'Obese';
    let color = val < 18.5 ? '#3b82f6' : val < 25 ? '#10b981' : val < 30 ? '#f59e0b' : '#f43f5e';
    setBmi(b => ({ ...b, result: { val, cat, color } }));
  };

  const handleNewsletter = (e) => {
    e.preventDefault();
    alert(`✅ Thanks! ${email} subscribed to FitFusion newsletter.`);
    setEmail('');
  };

  return (
    <div className="min-h-screen">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-900 via-indigo-900 to-slate-900 text-white">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm text-violet-200 mb-6 backdrop-blur-sm">
                <Zap size={14} className="text-amber-400" />
                Your Personal Health Revolution Starts Here
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold font-display leading-tight mb-6">
                Transform Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-indigo-300">
                  Health Journey
                </span>
              </h1>
              <p className="text-xl text-slate-300 leading-relaxed mb-8 max-w-lg">
                FitFusion is your all-in-one platform for fitness tracking, meal planning, health analytics, and community motivation.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {['Workout Plans', 'Meal Tracking', 'Sleep Analytics', 'AI Coach'].map(f => (
                  <span key={f} className="flex items-center gap-1.5 text-sm text-violet-200">
                    <CheckCircle size={14} className="text-emerald-400" /> {f}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-4">
                {user ? (
                  <Link to="/dashboard" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-violet-700 font-bold text-lg hover:bg-violet-50 transition-colors shadow-xl">
                    Go to Dashboard <ArrowRight size={20} />
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-violet-700 font-bold text-lg hover:bg-violet-50 transition-colors shadow-xl">
                      Start Free <ArrowRight size={20} />
                    </Link>
                    <Link to="/login" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/10 border border-white/30 text-white font-bold text-lg hover:bg-white/20 transition-colors backdrop-blur-sm">
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Hero visual */}
            <div className="hidden lg:flex justify-center items-center">
              <div className="relative">
                <div className="w-72 h-72 rounded-3xl gradient-purple flex items-center justify-center text-9xl shadow-glow-lg animate-float">
                  🏋️
                </div>
                {/* Floating cards */}
                <div className="absolute -top-6 -right-8 card px-4 py-3 bg-white/10 backdrop-blur-md border-white/20 animate-slide-in-right shadow-xl">
                  <div className="flex items-center gap-2 text-white">
                    <span className="text-2xl">🔥</span>
                    <div>
                      <p className="text-xs opacity-70">Calories Burned</p>
                      <p className="font-bold text-lg">452 kcal</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -left-8 card px-4 py-3 bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
                  <div className="flex items-center gap-2 text-white">
                    <span className="text-2xl">💧</span>
                    <div>
                      <p className="text-xs opacity-70">Water Today</p>
                      <p className="font-bold text-lg">1.8L / 2.5L</p>
                    </div>
                  </div>
                </div>
                <div className="absolute top-1/2 -left-16 card px-4 py-3 bg-white/10 backdrop-blur-md border-white/20 shadow-xl -translate-y-1/2">
                  <div className="flex items-center gap-2 text-white">
                    <span className="text-2xl">🏆</span>
                    <div>
                      <p className="text-xs opacity-70">Streak</p>
                      <p className="font-bold text-lg">21 Days</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map(stat => (
              <div key={stat.label} className="text-center p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-white font-display">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DAILY HEALTH TIP */}
      <section className="py-10 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-y border-emerald-100 dark:border-emerald-900/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-3">
            <span className="text-3xl transition-all duration-500">{HEALTH_TIPS[tipIdx].emoji}</span>
            <div className="text-left">
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-0.5">Daily Health Tip</p>
              <p className="text-slate-700 dark:text-slate-200 font-medium">{HEALTH_TIPS[tipIdx].tip}</p>
            </div>
          </div>
        </div>
      </section>

      {/* MOTIVATION QUOTE */}
      <section className="py-14 bg-white dark:bg-dark-surface">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="text-4xl mb-4">✨</div>
          <blockquote className="text-2xl font-medium text-slate-700 dark:text-slate-200 italic leading-relaxed">
            "{quote}"
          </blockquote>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 bg-slate-50 dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold font-display text-slate-900 dark:text-white mb-4">
              Everything You Need to <span className="gradient-text">Thrive</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
              A complete health ecosystem designed to support every aspect of your wellness journey.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="card p-6 group hover:shadow-glow-sm hover:-translate-y-1 transition-all duration-300">
                <div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center text-2xl mb-4 shadow-md group-hover:shadow-lg transition-shadow`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED EXERCISES */}
      {exercises.length > 0 && (
        <section className="py-20 bg-white dark:bg-dark-surface">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white">
                  Featured <span className="gradient-text">Exercises</span>
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Handpicked workouts for every fitness level</p>
              </div>
              <Link to="/exercises" className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400 font-semibold text-sm hover:underline">
                View all <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {exercises.map(ex => (
                <div key={ex.id} className="card overflow-hidden group hover:-translate-y-1 hover:shadow-glow-sm transition-all duration-300">
                  <div className="h-36 gradient-purple flex items-center justify-center text-4xl">
                    {ex.category === 'cardio' ? '🏃' : ex.category === 'strength' ? '💪' : ex.category === 'yoga' ? '🧘' : ex.category === 'hiit' ? '⚡' : '🏋️'}
                  </div>
                  <div className="p-4">
                    <span className={`badge text-xs mb-2 ${categoryColors[ex.category] || 'badge-primary'}`}>{ex.category}</span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{ex.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span>⏱️ {ex.duration}min</span>
                      <span>🔥 {ex.calories_burned} kcal</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FEATURED MEALS */}
      {meals.length > 0 && (
        <section className="py-20 bg-slate-50 dark:bg-dark-bg">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white">
                  Healthy <span className="gradient-text-green">Recipes</span>
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Nutritious meals for your fitness goals</p>
              </div>
              <Link to="/meal-planner" className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-sm hover:underline">
                View all <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {meals.map(meal => (
                <div key={meal.id} className="card overflow-hidden group hover:-translate-y-1 hover:shadow-glow-sm transition-all duration-300">
                  <div className="h-36 gradient-green flex items-center justify-center text-4xl">
                    {meal.category === 'breakfast' ? '🌅' : meal.category === 'lunch' ? '🥗' : meal.category === 'dinner' ? '🍽️' : '🍎'}
                  </div>
                  <div className="p-4">
                    <span className="badge badge-success text-xs mb-2">{meal.category}</span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-2">{meal.name}</h3>
                    <div className="grid grid-cols-2 gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <span>🔥 {meal.calories} kcal</span>
                      <span>🥩 {meal.protein}g protein</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BMI PREVIEW CALCULATOR */}
      <section className="py-20 bg-white dark:bg-dark-surface">
        <div className="max-w-4xl mx-auto px-6">
          <div className="card p-8 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border-violet-100 dark:border-violet-800/30">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-2">
                Quick <span className="gradient-text">BMI Check</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400">Calculate your Body Mass Index in seconds</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="label">Height (cm)</label>
                <input type="number" placeholder="e.g. 175" value={bmi.height} onChange={e => setBmi(b => ({ ...b, height: e.target.value, result: null }))} className="input-field" />
              </div>
              <div>
                <label className="label">Weight (kg)</label>
                <input type="number" placeholder="e.g. 70" value={bmi.weight} onChange={e => setBmi(b => ({ ...b, weight: e.target.value, result: null }))} className="input-field" />
              </div>
              <div className="flex items-end">
                <button onClick={calcBMI} className="btn-primary w-full">Calculate BMI</button>
              </div>
            </div>
            {bmi.result && (
              <div className="text-center p-6 rounded-2xl bg-white dark:bg-dark-surface border border-violet-100 dark:border-dark-border animate-slide-up">
                <p className="text-5xl font-bold font-display mb-2" style={{ color: bmi.result.color }}>
                  {bmi.result.val}
                </p>
                <p className="text-lg font-semibold" style={{ color: bmi.result.color }}>{bmi.result.cat}</p>
                <Link to="/bmi-calculator" className="mt-4 inline-block text-sm text-violet-600 dark:text-violet-400 hover:underline">
                  Get detailed analysis →
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 bg-slate-50 dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-3">
              Real <span className="gradient-text">Results</span> from Real People
            </h2>
            <p className="text-slate-500 dark:text-slate-400">Join thousands who transformed their lives with FitFusion</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="card p-6 hover:-translate-y-1 hover:shadow-glow-sm transition-all duration-300">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{t.avatar}</div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{t.name}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{t.goal}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="py-16 bg-gradient-to-r from-violet-600 to-indigo-600">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold font-display text-white mb-3">Stay Motivated</h2>
          <p className="text-violet-200 mb-8">Get weekly workout tips, healthy recipes, and fitness news delivered to your inbox.</p>
          <form onSubmit={handleNewsletter} className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="flex-1 px-5 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-violet-200 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
            />
            <button type="submit" className="px-6 py-3 rounded-xl bg-white text-violet-700 font-bold hover:bg-violet-50 transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid sm:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 text-white font-bold font-display mb-3">
                <div className="w-7 h-7 rounded-lg gradient-purple flex items-center justify-center text-xs">🏋️</div>
                FitFusion
              </div>
              <p className="text-sm leading-relaxed">Your complete personal health & fitness platform to transform your lifestyle.</p>
            </div>
            {[
              { title: 'Product', links: ['Dashboard', 'Exercises', 'Meal Planner', 'AI Assistant'] },
              { title: 'Health Tools', links: ['BMI Calculator', 'Calorie Calculator', 'Sleep Tracker', 'Water Tracker'] },
              { title: 'Community', links: ['Challenges', 'Health Blog', 'Community Posts', 'Leaderboard'] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="text-white font-semibold mb-3 text-sm">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map(l => (
                    <li key={l}><Link to="/dashboard" className="text-sm hover:text-white transition-colors">{l}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm">© 2024 FitFusion. All rights reserved.</p>
            <p className="text-sm">Built with ❤️ for your health journey</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
