import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import {
  Users,
  LogIn,
  Key,
  Mail,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
  ShieldCheck,
  CreditCard
} from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function ParentLogin() {
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
    const result = await login(data.email, data.password, 'PARENT');
    if (result.success) {
      navigate('/parent');
    }
  };

  const handleFillDemo = () => {
    setValue('email', 'parent@portal.edu');
    setValue('password', 'password123');
    setDemoNotice('Demo filled: Eleanor Mercer (Parent with 3 enrolled wards: Alex, Elena, and Lucas)');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-slate-50 to-amber-100/60 flex items-center justify-center p-4">
      <div className="max-w-md w-full my-8">
        {/* Navigation back to main website */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-amber-600 transition-colors bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-500" />
            <span>← Return to School Website</span>
          </Link>

          <Link
            to="/login/teacher"
            className="text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            Staff Login →
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 text-[11px] font-black uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5 text-amber-600" />
            Parent & Guardian Portal
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Parent Login</h1>
          <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
            Access end-of-term results with your unique student tokens, view all your children on one page, and manage school fee invoices.
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
            <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-amber-800 text-xs font-medium">
              <Sparkles className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>{demoNotice}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Registered Parent Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="parent@portal.edu"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all ${
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
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all ${
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
              className="w-full mt-2 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-extrabold rounded-xl shadow-md shadow-amber-500/20 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              {isLoading ? 'Authenticating Parent Portal...' : 'Login to Parent Portal'}
            </button>
          </form>

          {/* Quick Demo Fill */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleFillDemo}
              className="w-full py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Fill Demo Parent Account (3 Children)</span>
            </button>
          </div>

          {/* Feature Highlights for Parents */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-2 text-xs text-slate-600">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Multi-Child View:</strong> Access all your children's reports together on one page.</span>
            </div>
            <div className="flex items-start gap-2">
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span><strong>Result Token PIN:</strong> Unique token number for each child ensures private verified terminal results.</span>
            </div>
            <div className="flex items-start gap-2">
              <CreditCard className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
              <span><strong>Tuition & Receipts:</strong> Track billing balances and print bursary payment receipts.</span>
            </div>
          </div>

          {/* Alternative Portals Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
            <Link to="/login/teacher" className="hover:text-slate-900">
              Staff / Teacher Login
            </Link>
            <span>•</span>
            <Link to="/login/admin" className="hover:text-slate-900">
              Admin Gateway
            </Link>
            <span>•</span>
            <Link to="/apply" className="text-amber-600 hover:text-amber-700 font-bold">
              Admissions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

