import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { GraduationCap, LogIn, Key, Mail, AlertCircle, Sparkles, ArrowLeft } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function Login() {
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const [demoNotice, setDemoNotice] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    clearError();
    const result = await login(data.email, data.password);
    if (result.success) {
      if (result.user.role === 'ADMIN') {
        navigate('/admin');
      } else if (result.user.role === 'TEACHER') {
        navigate('/teacher');
      } else if (result.user.role === 'PARENT') {
        navigate('/parent');
      } else {
        navigate('/student');
      }
    }
  };

  const handleQuickDemo = (role) => {
    if (role === 'ADMIN') {
      setValue('email', 'admin@portal.edu');
      setValue('password', 'password123');
      setDemoNotice('Filled demo Administrator credentials (Dr. Arthur Pendelton).');
    } else if (role === 'TEACHER') {
      setValue('email', 'teacher@portal.edu');
      setValue('password', 'password123');
      setDemoNotice('Filled demo Faculty credentials.');
    } else if (role === 'PARENT') {
      setValue('email', 'parent@portal.edu');
      setValue('password', 'password123');
      setDemoNotice('Filled demo Parent credentials.');
    } else {
      setValue('email', 'student@portal.edu');
      setValue('password', 'password123');
      setDemoNotice('Filled demo Pupil credentials (Alex Mercer - Primary 4 Gold).');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-brand-50/30 to-indigo-50/40 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Navigation back to main website */}
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-amber-600 transition-colors bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-500" />
            <span>← Return to School Website</span>
          </Link>
        </div>
        {/* Card Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block hover:scale-105 transition-transform">
            <img
              src="/logo.png"
              alt="Golden International School Logo"
              className="w-20 h-20 object-contain mx-auto mb-3 drop-shadow-md"
            />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Golden International School</h1>
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mt-0.5">Ido-Ekiti, Ekiti State</p>
          <p className="text-sm text-slate-500 mt-1">Pupils, Parents & Teachers Portal</p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-6 sm:p-8">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {demoNotice && (
            <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700 text-xs font-medium">
              <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{demoNotice}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="name@portal.edu"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all ${
                    errors.email ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 hover:border-slate-300'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  {...register('password')}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all ${
                    errors.password ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 hover:border-slate-300'
                  }`}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-brand-600/20 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
              Quick Demo Accounts
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemo('ADMIN')}
                className="py-2 px-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-[10px] font-bold transition-colors text-center truncate"
              >
                🛡️ Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('TEACHER')}
                className="py-2 px-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-[10px] font-bold transition-colors text-center truncate"
              >
                👤 Faculty
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('STUDENT')}
                className="py-2 px-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-[10px] font-bold transition-colors text-center truncate"
              >
                🎒 Pupil
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('PARENT')}
                className="py-2 px-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-[10px] font-bold transition-colors text-center truncate"
              >
                👨‍👩‍👦 Parent
              </button>
            </div>
          </div>

          {/* Admissions Hub Links */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="bg-amber-50/80 rounded-2xl p-4 border border-amber-200/70 text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block mb-1">
                Prospective Parents & Pupils
              </span>
              <p className="text-xs font-bold text-slate-900 mb-2.5">
                2026/2027 Admissions Open
              </p>
              <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
                <Link
                  to="/apply"
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[11px] transition-colors shadow-xs"
                >
                  Apply Online
                </Link>
                <Link
                  to="/apply#status"
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-[11px] transition-colors"
                >
                  Track Status
                </Link>
                <Link
                  to="/apply#visit"
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-[11px] transition-colors"
                >
                  Book Tour
                </Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-600 font-semibold hover:text-brand-700">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
