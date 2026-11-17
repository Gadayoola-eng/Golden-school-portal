import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import {
  GraduationCap,
  LogIn,
  Key,
  Mail,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  BookOpen,
  CalendarCheck,
  FileCheck2
} from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function TeacherLogin() {
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
    const result = await login(data.email, data.password, 'TEACHER');
    if (result.success) {
      navigate('/teacher');
    }
  };

  const handleFillDemo = () => {
    setValue('email', 'teacher@portal.edu');
    setValue('password', 'password123');
    setDemoNotice('Demo filled: Prof. Sarah Connor (Primary 4 Gold Class Teacher)');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/70 via-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full my-8">
        {/* Navigation back to main website */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-indigo-500" />
            <span>← Return to School Website</span>
          </Link>

          <Link
            to="/login/parent"
            className="text-xs font-bold text-slate-600 hover:text-amber-600 transition-colors"
          >
            Parent Portal →
          </Link>
        </div>

        {/* Card Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-block hover:scale-105 transition-transform">
            <img
              src="/logo.png"
              alt="Golden International School Logo"
              className="w-20 h-20 object-contain mx-auto mb-2 drop-shadow-md"
            />
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-800 text-[11px] font-black uppercase tracking-wider mb-2">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
            Staff & Faculty Portal
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Staff / Teacher Login</h1>
          <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
            Mark daily class roll call, enter continuous assessments & exam marks, and formulate official term remarks.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/70 border border-slate-200/80 p-6 sm:p-8">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {demoNotice && (
            <div className="mb-5 p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-start gap-2.5 text-indigo-900 text-xs font-medium">
              <Sparkles className="w-4 h-4 shrink-0 text-indigo-600 mt-0.5" />
              <span>{demoNotice}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Staff Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="teacher@portal.edu"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all ${
                    errors.email ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 hover:border-slate-300'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  {...register('password')}
                  placeholder="••••••••••••"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all ${
                    errors.password ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 hover:border-slate-300'
                  }`}
                />
              </div>
              {errors.password && (
                <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-extrabold rounded-xl shadow-md shadow-indigo-600/20 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              {isLoading ? 'Authenticating Faculty Member...' : 'Sign In as Faculty Member'}
            </button>
          </form>

          {/* Quick Demo Fill */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleFillDemo}
              className="w-full py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Fill Demo Teacher Account (Prof. Sarah Connor)</span>
            </button>
          </div>

          {/* Feature Highlights for Teachers */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-2 text-xs text-slate-600">
            <div className="flex items-start gap-2">
              <CalendarCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
              <span><strong>Roll Call:</strong> Daily morning and afternoon attendance registers.</span>
            </div>
            <div className="flex items-start gap-2">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Gradebook:</strong> Input CA 1, CA 2, and Terminal Examination scores.</span>
            </div>
            <div className="flex items-start gap-2">
              <FileCheck2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span><strong>Report Cards:</strong> Provide form teacher remarks and psychomotor traits.</span>
            </div>
          </div>

          {/* Alternative Portals Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
            <Link to="/login/parent" className="hover:text-slate-900">
              Parent Portal Login
            </Link>
            <span>•</span>
            <Link to="/login/admin" className="hover:text-slate-900">
              Admin Gateway
            </Link>
            <span>•</span>
            <Link to="/downloads" className="hover:text-slate-900">
              Downloads
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

