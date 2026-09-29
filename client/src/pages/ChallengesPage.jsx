import React, { useState, useEffect } from 'react';
import { challengeAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { PageLoader, EmptyState, ProgressBar } from '../components/common';
import { Trophy, Users, Zap, CheckCircle, Plus } from 'lucide-react';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const CHALLENGE_ICONS = { pushup: '💪', steps: '👟', water: '💧', no_sugar: '🚫', sleep: '😴', meditation: '🧘', workout: '🏋️' };
const CHALLENGE_COLORS = { pushup: 'gradient-purple', steps: 'gradient-orange', water: 'gradient-blue', no_sugar: 'gradient-pink', sleep: 'gradient-teal', meditation: 'gradient-green', workout: 'gradient-purple' };

export default function ChallengesPage() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ch, lb] = await Promise.all([
        challengeAPI.getAll(),
        challengeAPI.getLeaderboard(),
      ]);
      setChallenges(ch.data?.data || []);
      setLeaderboard(lb.data?.data || []);
    } catch {}
    setLoading(false);
  };

  const joinChallenge = async (id) => {
    try {
      await challengeAPI.join(id);
      toast.success('Challenge joined! Let\'s go! 🔥');
      loadData();
    } catch (err) {
      if (err.response?.status === 409) toast.error('Already joined this challenge');
      else toast.error('Failed to join');
    }
  };

  const updateProgress = async (progressId, amount) => {
    try {
      const { data } = await challengeAPI.updateProgress(progressId, amount);
      if (data.data.completed) toast.success('🎉 Challenge completed! XP awarded!');
      else toast.success(`Progress updated! +${amount}`);
      loadData();
    } catch { toast.error('Failed to update progress'); }
  };

  if (loading) return <PageLoader />;

  const joinedChallenges = challenges.filter(c => c.user_progress);
  const availableChallenges = challenges.filter(c => !c.user_progress);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">Challenges & Goals 🏆</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Push your limits, earn badges, climb the leaderboard</p>
      </div>

      {/* Active challenges */}
      {joinedChallenges.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Zap size={18} className="text-amber-400" /> My Active Challenges
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {joinedChallenges.map(c => {
              const p = c.user_progress;
              const pctComplete = Math.min(100, Math.round((p.current / c.target) * 100));
              return (
                <div key={c.id} className="card p-5 border-l-4 border-violet-500">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl ${CHALLENGE_COLORS[c.type] || 'gradient-purple'} flex items-center justify-center text-xl shadow-md`}>
                      {CHALLENGE_ICONS[c.type] || '🏆'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{c.title}</h3>
                      <p className="text-xs text-slate-400">{c.duration_days} days • {c.xp_reward} XP</p>
                    </div>
                    {p.completed && <CheckCircle className="text-emerald-500" size={20} />}
                  </div>
                  <ProgressBar value={p.current} max={c.target} color="violet" showPercent label={`${p.current}/${c.target}`} />
                  {!p.completed && (
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => updateProgress(p.id, 1)} className="btn-primary flex-1 text-xs py-2">
                        <Plus size={13} /> Log Progress
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available challenges */}
      <div className="space-y-4">
        <h2 className="font-bold text-slate-800 dark:text-white">Available Challenges</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {availableChallenges.map(c => (
            <div key={c.id} className="card overflow-hidden hover:-translate-y-1 hover:shadow-glow-sm transition-all duration-300">
              <div className={`h-28 ${CHALLENGE_COLORS[c.type] || 'gradient-purple'} flex items-center justify-center text-5xl`}>
                {CHALLENGE_ICONS[c.type] || '🏆'}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">{c.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">{c.description}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                  <span>📅 {c.duration_days} days</span>
                  <span>🎯 Target: {c.target}</span>
                  <span>⚡ {c.xp_reward} XP</span>
                </div>
                <button onClick={() => joinChallenge(c.id)} className="btn-primary w-full text-sm">
                  Join Challenge
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="card p-5">
          <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-amber-400" /> Leaderboard
          </h2>
          <div className="space-y-3">
            {leaderboard.slice(0, 10).map((entry, idx) => (
              <div key={entry.id} className={`flex items-center gap-4 p-3 rounded-xl ${idx < 3 ? 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-100 dark:border-amber-900/30' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm
                  ${idx === 0 ? 'bg-amber-400 text-white' : idx === 1 ? 'bg-slate-300 text-white' : idx === 2 ? 'bg-orange-400 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">{entry.user?.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-violet-600 dark:text-violet-400 text-sm">{entry.current}</p>
                  <p className="text-xs text-slate-400">{entry.challenge?.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
