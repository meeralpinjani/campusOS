import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export const Login = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!emailOrUsername.trim() || !password) {
      setFormError('Please enter both email/username and password');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(emailOrUsername, password);
      navigate(from, { replace: true });
    } catch (err) {
      setFormError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 bg-[#FFFFFF] dark:bg-[#111214] transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-[#1A1B1E] border border-[#E5E5E5] dark:border-[#2A2A2C] rounded-xl shadow-2xs p-6 sm:p-8 relative overflow-hidden">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#C43E3E]" />

        <div className="text-center mb-6">
          <img src="/kit_official_logo.png" alt="KIT Logo" className="h-12 mx-auto mb-2 object-contain" />
          <h1 className="text-2xl font-black text-[#111111] dark:text-[#F5F5F5] tracking-tight">Welcome Back</h1>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Sign in to your KITCommunity account</p>
        </div>

        {formError && (
          <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl flex items-center gap-2.5 text-[#C43E3E] text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#C43E3E]" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Email or Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="student@campus.edu or username"
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#111214] border border-[#E5E5E5] dark:border-[#2A2A2C] focus:border-[#C43E3E] focus:ring-2 focus:ring-red-500/10 rounded-xl text-sm text-[#111111] dark:text-[#F5F5F5] placeholder-[#B0B0B0] dark:placeholder-[#555558] outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#111214] border border-[#E5E5E5] dark:border-[#2A2A2C] focus:border-[#C43E3E] focus:ring-2 focus:ring-red-500/10 rounded-xl text-sm text-[#111111] dark:text-[#F5F5F5] placeholder-[#B0B0B0] dark:placeholder-[#555558] outline-none transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 bg-[#C43E3E] hover:bg-[#A63333] text-white text-sm font-bold rounded-xl shadow-2xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-[#E5E5E5] dark:border-[#2A2A2C] pt-4 font-medium">
          Don't have an account yet?{' '}
          <Link to="/signup" className="text-[#C43E3E] font-bold hover:underline">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
};
