import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, GraduationCap, BookOpen, Sun, Moon, Shield, ShoppingBag, Calendar, Search, MessageCircle } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';

export const Navbar = ({ onSearchQueryChange, onOpenChat, onOpenProfile }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (onSearchQueryChange) onSearchQueryChange(val);
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold px-1.5 py-px rounded-full bg-red-50 dark:bg-red-950/30 text-[#C43E3E] border border-red-500/30">
            <Shield className="w-2.5 h-2.5 text-[#C43E3E]" /> Admin
          </span>
        );
      case 'moderator':
        return (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold px-1.5 py-px rounded-full bg-transparent text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <Shield className="w-2.5 h-2.5" /> Moderator
          </span>
        );
      case 'faculty':
        return (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold px-1.5 py-px rounded-full bg-transparent text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <GraduationCap className="w-2.5 h-2.5" /> Faculty
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold px-1.5 py-px rounded-full bg-transparent text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
            <BookOpen className="w-2.5 h-2.5" /> Student
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[#111214] border-b border-[#E5E5E5] dark:border-[#2A2A2C] px-5 lg:px-10 py-4 shadow-2xs transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Brand Logo - Taller & Larger with Original Orange Mark Preserved */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <img src="/kit_official_logo.png" alt="KIT Official Logo" className="h-11 sm:h-12 object-contain" />
          <div className="flex flex-col leading-none">
            <span className="text-lg font-black tracking-tight text-[#111111] dark:text-[#F5F5F5] transition-colors">
              KIT<span className="text-[#111111] dark:text-[#F5F5F5]">Community</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mt-0.5">
              Campus Hub
            </span>
          </div>
        </Link>

        {/* Navigation Modules (Feed, Marketplace, Academic Calendar) */}
        {user && (
          <div className="flex items-center gap-1 bg-[#FAFAFA] dark:bg-[#1A1B1E] p-1 rounded-xl border border-[#E5E5E5] dark:border-[#2A2A2C]">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                location.pathname === '/'
                  ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111] shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Feed
            </Link>
            <Link
              to="/marketplace"
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                location.pathname === '/marketplace'
                  ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111] shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Marketplace</span>
            </Link>
            <Link
              to="/academic-calendar"
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                location.pathname === '/academic-calendar'
                  ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111] shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Academic Calendar</span>
            </Link>
          </div>
        )}

        {/* Center: Universal Search Input Bar */}
        {user && (
          <div className="flex-1 max-w-xs hidden md:block relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search posts, topics, subreddits..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#FAFAFA] dark:bg-[#1A1B1E] border border-[#E5E5E5] dark:border-[#2A2A2C] rounded-xl text-xs text-[#111111] dark:text-[#F5F5F5] placeholder-[#B0B0B0] dark:placeholder-[#555558] focus:outline-none focus:bg-white dark:focus:bg-[#111214] focus:border-[#C43E3E] transition-all"
            />
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-2.5 shrink-0">
          {user && (
            <>
              {/* Direct Messages Chat Button */}
              <button
                onClick={onOpenChat}
                className="p-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-[#FAFAFA] dark:hover:bg-[#1A1B1E] border border-[#E5E5E5] dark:border-[#2A2A2C] transition-all"
                title="Campus Direct Messages"
              >
                <MessageCircle className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              </button>

              {/* Activity Notifications Bell Dropdown */}
              <NotificationDropdown />
            </>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-[#FAFAFA] dark:hover:bg-[#1A1B1E] border border-[#E5E5E5] dark:border-[#2A2A2C] transition-all"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-slate-200" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {user ? (
            <>
              {/* User Pill -> Opens User Profile */}
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2.5 bg-[#FAFAFA] dark:bg-[#1A1B1E] hover:bg-[#E5E5E5]/50 dark:hover:bg-[#2A2A2C] border border-[#E5E5E5] dark:border-[#2A2A2C] rounded-full pl-2 pr-4 py-1.5 text-left transition-all"
                title="View Profile & Bookmarks"
              >
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-7 h-7 rounded-full border border-slate-300 dark:border-slate-600 object-cover"
                />
                <div className="flex flex-col leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#111111] dark:text-[#F5F5F5]">
                      {user.username}
                    </span>
                    {getRoleBadge(user.role)}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
                    {user.branch}
                  </span>
                </div>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-[#C43E3E] hover:bg-red-50 dark:hover:bg-red-950/30 border border-[#E5E5E5] dark:border-[#2A2A2C] rounded-xl transition-all"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-bold px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-[#FAFAFA] dark:hover:bg-[#1A1B1E] rounded-xl transition-colors border border-transparent hover:border-[#E5E5E5] dark:hover:border-[#2A2A2C]"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="text-xs font-bold px-4 py-2.5 bg-[#C43E3E] hover:bg-[#A63333] text-white rounded-xl shadow-2xs transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
