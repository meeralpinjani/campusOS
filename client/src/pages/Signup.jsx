import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, BookOpen, GraduationCap, ArrowRight, ArrowLeft, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

const DEPARTMENTS = [
  'Biotechnology',
  'Civil Engineering',
  'Civil & Environmental Engineering',
  'Computer Science & Engineering',
  'Computer Science & Business Systems',
  'Computer Science Engineering - Artificial Intelligence And Machine Learning',
  'Electrical Engineering',
  'Electronics & Telecomm Engineering',
  'Mechanical Engineering',
];

export const Signup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student', // 'student' or 'faculty'
    branch: DEPARTMENTS[3], // Default: Computer Science & Engineering
    year: '1st Year',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.username.trim() || !formData.email.trim() || !formData.password) {
      setFormError('Please fill out all fields in Step 1');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const payload = {
      ...formData,
      year: formData.role === 'faculty' ? 'N/A' : formData.year,
    };

    setIsSubmitting(true);
    try {
      await signup(payload);
      navigate('/');
    } catch (err) {
      setFormError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 bg-[#FFFFFF] dark:bg-[#111214] transition-colors">
      <div className="w-full max-w-lg bg-white dark:bg-[#1A1B1E] border border-[#E5E5E5] dark:border-[#2A2A2C] rounded-xl shadow-2xs p-6 sm:p-8 relative overflow-hidden">
        {/* Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#C43E3E]" />

        {/* Step Indicator Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E5E5E5] dark:border-[#2A2A2C]">
          <div className="flex items-center gap-3">
            <img src="/kit_official_logo.png" alt="KIT Logo" className="h-10 object-contain" />
            <div>
              <h1 className="text-xl font-black text-[#111111] dark:text-[#F5F5F5] tracking-tight">Join KITCommunity</h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Step {step} of 2 • {step === 1 ? 'Account Credentials' : 'Academic Profile'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${step >= 1 ? 'bg-[#C43E3E] text-white' : 'bg-[#FAFAFA] dark:bg-[#111214] text-slate-400 border border-[#E5E5E5]'}`}>
              1
            </div>
            <div className={`w-6 h-0.5 ${step === 2 ? 'bg-[#C43E3E]' : 'bg-[#E5E5E5] dark:bg-[#2A2A2C]'}`} />
            <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${step === 2 ? 'bg-[#C43E3E] text-white' : 'bg-[#FAFAFA] dark:bg-[#111214] text-slate-400 border border-[#E5E5E5]'}`}>
              2
            </div>
          </div>
        </div>

        {formError && (
          <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl flex items-center gap-2.5 text-[#C43E3E] text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#C43E3E]" />
            <span>{formError}</span>
          </div>
        )}

        {step === 1 ? (
          /* STEP 1 FORM */
          <form onSubmit={handleNextStep} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#111214] border border-[#E5E5E5] dark:border-[#2A2A2C] focus:border-[#C43E3E] focus:ring-2 focus:ring-red-500/10 rounded-xl text-sm text-[#111111] dark:text-[#F5F5F5] placeholder-[#B0B0B0] dark:placeholder-[#555558] outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Campus Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="student@campus.edu"
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#111214] border border-[#E5E5E5] dark:border-[#2A2A2C] focus:border-[#C43E3E] focus:ring-2 focus:ring-red-500/10 rounded-xl text-sm text-[#111111] dark:text-[#F5F5F5] placeholder-[#B0B0B0] dark:placeholder-[#555558] outline-none transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-3 py-3 px-4 bg-[#C43E3E] hover:bg-[#A63333] text-white text-sm font-bold rounded-xl shadow-2xs flex items-center justify-center gap-2 transition-all"
            >
              <span>Next: Academic Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* STEP 2 FORM */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                I am joining as
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'student' })}
                  className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                    formData.role === 'student'
                      ? 'border-[#111111] dark:border-white bg-[#FAFAFA] dark:bg-[#111214] text-[#111111] dark:text-[#F5F5F5] font-bold shadow-2xs'
                      : 'border-[#E5E5E5] dark:border-[#2A2A2C] bg-white dark:bg-[#1A1B1E] text-slate-600 dark:text-slate-400 hover:border-slate-400'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${formData.role === 'student' ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]' : 'bg-[#E5E5E5] dark:bg-[#2A2A2C] text-slate-600 dark:text-slate-300'}`}>
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-extrabold">Student</div>
                    <div className="text-[11px] opacity-75">Enrolled student</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'faculty' })}
                  className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                    formData.role === 'faculty'
                      ? 'border-[#111111] dark:border-white bg-[#FAFAFA] dark:bg-[#111214] text-[#111111] dark:text-[#F5F5F5] font-bold shadow-2xs'
                      : 'border-[#E5E5E5] dark:border-[#2A2A2C] bg-white dark:bg-[#1A1B1E] text-slate-600 dark:text-slate-400 hover:border-slate-400'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${formData.role === 'faculty' ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]' : 'bg-[#E5E5E5] dark:bg-[#2A2A2C] text-slate-600 dark:text-slate-300'}`}>
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-extrabold">Faculty</div>
                    <div className="text-[11px] opacity-75">Professor / Staff</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Department Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Department Program
              </label>
              <select
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-[#111214] border border-[#E5E5E5] dark:border-[#2A2A2C] focus:border-[#C43E3E] rounded-xl text-sm font-medium text-[#111111] dark:text-[#F5F5F5] outline-none transition-all"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Selection */}
            {formData.role === 'student' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Academic Year
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-[#111214] border border-[#E5E5E5] dark:border-[#2A2A2C] focus:border-[#C43E3E] rounded-xl text-sm font-medium text-[#111111] dark:text-[#F5F5F5] outline-none transition-all"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-4 border border-[#E5E5E5] dark:border-[#2A2A2C] text-slate-600 dark:text-slate-300 hover:bg-[#FAFAFA] dark:hover:bg-[#111214] font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 bg-[#C43E3E] hover:bg-[#A63333] text-white text-sm font-bold rounded-xl shadow-2xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Registration</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-[#E5E5E5] dark:border-[#2A2A2C] pt-4 font-medium">
          Already registered?{' '}
          <Link to="/login" className="text-[#C43E3E] font-bold hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
