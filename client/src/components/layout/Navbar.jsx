import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getInitials, getImageUrl } from '../../utils/helpers';
import {
  Sun, Moon, Bell, Search, Menu, X, LogOut, User, Settings,
  LayoutDashboard, ChevronDown
} from 'lucide-react';
import { communityAPI } from '../../api';
import toast from 'react-hot-toast';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const dropRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (user) loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    try {
      const { data } = await communityAPI.getNotifications();
      setNotifications(data.data || []);
      setUnread((data.data || []).filter(n => !n.is_read).length);
    } catch {}
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/exercises?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setSearchOpen(false);
    }
  };

  const markRead = async () => {
    try {
      await communityAPI.markNotificationsRead();
      setUnread(0);
    } catch {}
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-200/60 dark:border-dark-border/60">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-16 gap-3">
          {/* Menu button (mobile) */}
          <button onClick={onMenuClick} className="btn-icon lg:hidden" aria-label="Menu">
            <Menu size={20} />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 font-display font-bold text-xl select-none shrink-0">
            <div className="w-8 h-8 rounded-xl gradient-purple flex items-center justify-center shadow-glow-sm">
              <span className="text-sm">🏋️</span>
            </div>
            <span className="gradient-text hidden sm:block">FitFusion</span>
          </Link>

          {/* Search Bar (desktop) */}
          <div className="hidden md:flex flex-1 max-w-xs ml-4">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search exercises..."
                className="input-field pl-9 py-2 text-sm"
              />
            </form>
          </div>

          <div className="flex-1" />

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Mobile search */}
            <button className="btn-icon md:hidden" onClick={() => setSearchOpen(o => !o)}>
              <Search size={18} />
            </button>

            {/* Theme toggle */}
            <button onClick={toggleTheme} className="btn-icon" aria-label="Toggle theme">
              {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>

            {user && (
              <>
                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => { setNotifOpen(o => !o); markRead(); }}
                    className="btn-icon relative"
                    aria-label="Notifications"
                  >
                    <Bell size={18} />
                    {unread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <div className="dropdown-menu w-80 max-h-80 overflow-y-auto">
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-dark-border">
                        <p className="font-semibold text-sm text-slate-800 dark:text-white">Notifications</p>
                      </div>
                      {notifications.length === 0 ? (
                        <p className="px-4 py-6 text-center text-slate-400 text-sm">No notifications yet</p>
                      ) : notifications.slice(0, 8).map(n => (
                        <div key={n.id} className={`dropdown-item ${!n.is_read ? 'bg-violet-50 dark:bg-violet-900/10' : ''}`}>
                          <div>
                            <p className="text-xs font-medium">{n.message}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{new Date(n.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* User menu */}
                <div className="relative" ref={dropRef}>
                  <button
                    onClick={() => setDropdownOpen(o => !o)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                      {user?.photo_url ? (
                        <img src={getImageUrl(user.photo_url)} alt="" className="w-full h-full object-cover" />
                      ) : getInitials(user?.name)}
                    </div>
                    <span className="hidden sm:block text-sm font-medium max-w-20 truncate text-slate-700 dark:text-slate-200">{user?.name?.split(' ')[0]}</span>
                    <ChevronDown size={14} className="text-slate-400" />
                  </button>
                  {dropdownOpen && (
                    <div className="dropdown-menu">
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-dark-border">
                        <p className="font-semibold text-sm text-slate-800 dark:text-white">{user?.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                      </div>
                      <Link to="/dashboard" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <LayoutDashboard size={15} /><span>Dashboard</span>
                      </Link>
                      <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <User size={15} /><span>Profile</span>
                      </Link>
                      {user?.role === 'admin' && (
                        <Link to="/admin" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                          <Settings size={15} /><span>Admin Panel</span>
                        </Link>
                      )}
                      <div className="border-t border-slate-100 dark:border-dark-border my-1" />
                      <button onClick={handleLogout} className="dropdown-item w-full text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                        <LogOut size={15} /><span>Log out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {!user && (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-xs px-4 py-2">Login</Link>
                <Link to="/register" className="btn-primary text-xs px-4 py-2">Get Started</Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="pb-3 md:hidden">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search exercises..." className="input-field pl-9 py-2 text-sm" autoFocus />
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
