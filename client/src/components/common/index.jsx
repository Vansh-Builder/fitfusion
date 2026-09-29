import React from 'react';
import { Loader2 } from 'lucide-react';

// Loading spinner
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return <Loader2 className={`animate-spin text-violet-500 ${sizes[size]} ${className}`} />;
};

// Full page loader
export const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-64 gap-3">
    <div className="w-12 h-12 rounded-2xl gradient-purple flex items-center justify-center animate-float shadow-glow">
      <span className="text-xl">🏋️</span>
    </div>
    <Spinner size="md" />
    <p className="text-slate-400 text-sm">Loading...</p>
  </div>
);

// Skeleton loading
export const Skeleton = ({ className = '', lines = 1 }) => (
  <div className={`animate-pulse ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className={`h-4 bg-slate-200 dark:bg-slate-700 rounded-lg mb-2 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} />
    ))}
  </div>
);

// Card skeleton
export const CardSkeleton = ({ count = 3 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="card p-5 animate-pulse">
        <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded-xl mb-4" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg mb-2" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-2/3" />
      </div>
    ))}
  </div>
);

// Empty state
export const EmptyState = ({ icon = '📭', title = 'Nothing here yet', description = '', action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="text-5xl mb-4 animate-float">{icon}</div>
    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{title}</h3>
    {description && <p className="text-slate-400 text-sm max-w-sm">{description}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

// Error state
export const ErrorState = ({ message = 'Something went wrong', onRetry }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="text-4xl mb-3">⚠️</div>
    <p className="text-slate-600 dark:text-slate-400 mb-4">{message}</p>
    {onRetry && <button onClick={onRetry} className="btn-primary">Try Again</button>}
  </div>
);

// Stat card
export const StatCard = ({ icon, label, value, unit, color = 'violet', trend, subtitle }) => {
  const colors = {
    violet: 'from-violet-500 to-indigo-600',
    green: 'from-emerald-500 to-teal-600',
    blue: 'from-blue-500 to-indigo-600',
    orange: 'from-orange-500 to-amber-600',
    rose: 'from-rose-500 to-pink-600',
    teal: 'from-teal-500 to-cyan-600',
  };
  return (
    <div className="stat-card flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${colors[color] || colors.violet} flex items-center justify-center text-xl shadow-md`}>
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`badge text-xs ${trend >= 0 ? 'badge-success' : 'badge-danger'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white font-display">
        {value}{unit && <span className="text-sm font-medium text-slate-400 ml-1">{unit}</span>}
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
  );
};

// Progress bar
export const ProgressBar = ({ value, max, color = 'violet', label, showPercent = true }) => {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const colors = {
    violet: 'bg-gradient-to-r from-violet-500 to-indigo-600',
    green: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    blue: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    orange: 'bg-gradient-to-r from-orange-500 to-amber-500',
    rose: 'bg-gradient-to-r from-rose-500 to-pink-500',
  };
  return (
    <div className="space-y-1.5">
      {(label || showPercent) && (
        <div className="flex justify-between text-xs">
          {label && <span className="text-slate-600 dark:text-slate-400">{label}</span>}
          {showPercent && <span className="font-semibold text-slate-700 dark:text-slate-300">{pct}%</span>}
        </div>
      )}
      <div className="progress-bar">
        <div
          className={`progress-fill ${colors[color] || colors.violet}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// Modal
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className={`relative w-full ${sizes[size]} card animate-slide-up max-h-[90vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-dark-border">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="btn-icon"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

// Pill / Tag
export const Tag = ({ label, color = 'violet', onClick }) => {
  const colors = {
    violet: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]} ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
      onClick={onClick}
    >
      {label}
    </span>
  );
};

// Avatar
export const Avatar = ({ name, src, size = 'md', className = '' }) => {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-xl' };
  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '?';
  return (
    <div className={`rounded-xl gradient-purple flex items-center justify-center text-white font-bold overflow-hidden ${sizes[size]} ${className}`}>
      {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : initials}
    </div>
  );
};

// X button for close (imported but not exported above)
const X = ({ size = 18 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// Confirmation dialog
export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, danger = false }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">{message}</p>
    <div className="flex gap-3 justify-end">
      <button onClick={onClose} className="btn-secondary">Cancel</button>
      <button onClick={() => { onConfirm(); onClose(); }} className={danger ? 'btn-danger' : 'btn-primary'}>
        Confirm
      </button>
    </div>
  </Modal>
);

// Tooltip
export const Tooltip = ({ children, content }) => (
  <div className="relative group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
      {content}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800 dark:border-t-slate-700" />
    </div>
  </div>
);

export { X };
