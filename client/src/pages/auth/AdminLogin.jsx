import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import {
  ShieldCheck,
  LogIn,
  Key,
  Mail,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Users,
  Settings,
  CreditCard
} from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function AdminLogin() {
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
    const result = await login(data.email, data.password, 'ADMIN');
    if (result.success) {
      navigate('/admin');
    }
  };

  const handleFillDemo = () => {
    setValue('email', 'admin@portal.edu');
    setValue('password', 'password123');
    setDemoNotice('Demo filled: Dr. Arthur Pendelton (Administrative Registrar)');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full my-8">
        {/* Navigation back to main website */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
            <span>← Return to School Website</span>
          </Link>

          <Link
            to="/login/parent"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-black uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Executive Office & Registry
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Administrative Login</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Authorized administrative console for admissions screening, bursary finance, student directories, and school CMS.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-slate-900/90 rounded-3xl shadow-2xl border border-slate-800 p-6 sm:p-8 backdrop-blur-md">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3 text-rose-300 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {demoNotice && (
            <div className="mb-5 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-2.5 text-amber-300 text-xs font-medium">
              <Sparkles className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <span>{demoNotice}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Administrator Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="admin@portal.edu"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-950/60 border rounded-xl text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all ${
                    errors.email ? 'border-rose-400 bg-rose-950/30' : 'border-slate-800 hover:border-slate-700'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-rose-400 mt-1 font-semibold">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Admin Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  {...register('password')}
                  placeholder="••••••••••••"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-950/60 border rounded-xl text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all ${
                    errors.password ? 'border-rose-400 bg-rose-950/30' : 'border-slate-800 hover:border-slate-700'
                  }`}
                />
              </div>
              {errors.password && (
                <p className="text-[11px] text-rose-400 mt-1 font-semibold">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-extrabold rounded-xl shadow-lg shadow-amber-500/20 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              {isLoading ? 'Verifying Executive Credentials...' : 'Access Admin Console'}
            </button>
          </form>

          {/* Quick Demo Fill */}
          <div className="mt-5 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleFillDemo}
              className="w-full py-2.5 px-3 bg-white/5 hover:bg-white/10 text-amber-300 border border-white/10 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Fill Demo Administrator (Dr. Arthur Pendelton)</span>
            </button>
          </div>

          {/* Alternative Portals Footer */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
            <Link to="/login/parent" className="hover:text-amber-400 transition-colors">
              Parent Portal
            </Link>
            <span>•</span>
            <Link to="/login/teacher" className="hover:text-amber-400 transition-colors">
              Staff Portal
            </Link>
            <span>•</span>
            <Link to="/" className="hover:text-white transition-colors">
              School Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

