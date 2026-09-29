import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Dumbbell, CalendarDays, Utensils, Upload,
  Droplets, Moon, Calculator, Flame, CheckSquare, TrendingUp,
  Bot, Users, Trophy, BookOpen, User, Shield, Heart,
  ShoppingCart, Pill, Calendar, Leaf, Star, X, Home,
  Activity
} from 'lucide-react';

const navGroups = [
  {
    label: 'Main',
    items: [
      { to: '/', icon: Home, label: 'Home', exact: true },
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ]
  },
  {
    label: 'Fitness',
    items: [
      { to: '/exercises', icon: Dumbbell, label: 'Exercises' },
      { to: '/workout-planner', icon: CalendarDays, label: 'Workout Planner' },
      { to: '/progress', icon: TrendingUp, label: 'Progress' },
    ]
  },
  {
    label: 'Nutrition',
    items: [
      { to: '/meal-planner', icon: Utensils, label: 'Meal Planner' },
      { to: '/upload-meal', icon: Upload, label: 'Upload Meal' },
      { to: '/nutrition-score', icon: Leaf, label: 'Nutrition Score' },
    ]
  },
  {
    label: 'Health Tracking',
    items: [
      { to: '/water-tracker', icon: Droplets, label: 'Water Tracker' },
      { to: '/sleep-tracker', icon: Moon, label: 'Sleep Tracker' },
      { to: '/habit-tracker', icon: CheckSquare, label: 'Habit Tracker' },
      { to: '/bmi-calculator', icon: Calculator, label: 'BMI Calculator' },
      { to: '/calorie-calculator', icon: Flame, label: 'Calorie Calculator' },
    ]
  },
  {
    label: 'Community',
    items: [
      { to: '/community', icon: Users, label: 'Community' },
      { to: '/challenges', icon: Trophy, label: 'Challenges' },
      { to: '/blog', icon: BookOpen, label: 'Health Blog' },
      { to: '/ai-assistant', icon: Bot, label: 'AI Assistant' },
    ]
  },
  {
    label: 'Health Records',
    items: [
      { to: '/health-records', icon: Activity, label: 'Medical Records' },
      { to: '/medicines', icon: Pill, label: 'Medicine Reminder' },
      { to: '/appointments', icon: Calendar, label: 'Appointments' },
    ]
  },
  {
    label: 'Smart Tools',
    items: [
      { to: '/pantry', icon: Leaf, label: 'Smart Pantry' },
      { to: '/shopping', icon: ShoppingCart, label: 'Grocery Planner' },
      { to: '/family', icon: Heart, label: 'Family Health' },
      { to: '/rewards', icon: Star, label: 'Rewards' },
    ]
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-50 
          bg-white dark:bg-dark-surface 
          border-r border-slate-200 dark:border-dark-border
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto lg:h-[calc(100vh-64px)] lg:sticky lg:top-16
        `}
      >
        {/* Mobile close */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-dark-border lg:hidden">
          <div className="flex items-center gap-2 font-display font-bold">
            <div className="w-7 h-7 rounded-lg gradient-purple flex items-center justify-center">
              <span className="text-xs">🏋️</span>
            </div>
            <span className="gradient-text">FitFusion</span>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto no-scrollbar py-4 px-3 space-y-5">
          {navGroups.map(group => (
            <div key={group.label}>
              <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.exact}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `sidebar-item ${isActive ? 'active' : ''}`
                    }
                  >
                    <item.icon size={17} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}

          {/* Admin link */}
          {user?.role === 'admin' && (
            <div>
              <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">Admin</p>
              <NavLink to="/admin" onClick={onClose} className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                <Shield size={17} /><span>Admin Panel</span>
              </NavLink>
            </div>
          )}
        </nav>

        {/* User card */}
        {user && (
          <div className="p-3 border-t border-slate-100 dark:border-dark-border">
            <NavLink to="/profile" onClick={onClose} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <div className="w-8 h-8 rounded-lg gradient-purple flex items-center justify-center text-white text-xs font-bold">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-400 capitalize">{user.role}</p>
              </div>
            </NavLink>
          </div>
        )}
      </aside>
    </>
  );
}
