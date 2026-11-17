import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
  Lock
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();

  const portals = [
    {
      id: 'parent',
      title: 'Parent & Guardian Portal',
      subtitle: 'Terminal Result Checker & Wards Hub',
      desc: "Check your children's terminal report cards using unique token numbers, view all enrolled children on one page, and track tuition invoices.",
      link: '/login/parent',
      icon: Users,
      badge: 'Most Popular',
      color: 'from-amber-500 to-amber-600',
      border: 'hover:border-amber-400',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      btnText: 'Enter Parent Portal',
      btnClass: 'bg-amber-500 hover:bg-amber-400 text-slate-950',
    },
    {
      id: 'teacher',
      title: 'Teacher & Faculty Portal',
      subtitle: 'Classroom Gradebook & Attendance',
      desc: 'Mark daily roll call registers, record continuous assessment & exam scores, and input end-of-term student remarks.',
      link: '/login/teacher',
      icon: GraduationCap,
      badge: 'Academic Staff',
      color: 'from-indigo-600 to-blue-700',
      border: 'hover:border-indigo-400',
      badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
      btnText: 'Enter Staff Portal',
      btnClass: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    },
    {
      id: 'admin',
      title: 'Administrative Office',
      subtitle: 'Registry & Executive Management',
      desc: 'Screen new online admissions, manage fee billing ledgers, oversee student and teacher records, and manage school announcements.',
      link: '/login/admin',
      icon: ShieldCheck,
      badge: 'Executive Access',
      color: 'from-slate-800 to-slate-950',
      border: 'hover:border-slate-500',
      badgeColor: 'bg-slate-200 text-slate-900 border-slate-300',
      btnText: 'Enter Admin Console',
      btnClass: 'bg-slate-900 hover:bg-slate-800 text-white',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/20 to-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full my-8">
        {/* Navigation back to main website */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-amber-600 transition-colors bg-white/90 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-500" />
            <span>← Return to School Website</span>
          </Link>

          <Link
            to="/apply"
            className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
          >
            2026/2027 Admissions Open →
          </Link>
        </div>

        {/* Portal Gateway Header */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-block hover:scale-105 transition-transform">
            <img
              src="/logo.png"
              alt="Golden International School Logo"
              className="w-24 h-24 object-contain mx-auto mb-3 drop-shadow-md"
            />
          </Link>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Golden International School Portal Gateway
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Select Your Dedicated Portal
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-xl mx-auto">
            Please choose your portal destination below. Each portal has its own dedicated authentication system tailored for Parents, Teachers, and Administration.
          </p>
        </div>

        {/* Portals Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {portals.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                className={`bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xl shadow-slate-200/50 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 ${p.border}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${p.color} text-white flex items-center justify-center shadow-md`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${p.badgeColor}`}>
                      {p.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-xs font-bold text-amber-600 mt-0.5 mb-2">
                    {p.subtitle}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {p.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Link
                    to={p.link}
                    className={`w-full py-3 px-4 text-xs font-extrabold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 ${p.btnClass}`}
                  >
                    <span>{p.btnText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Notice on Child Access */}
        <div className="mt-8 bg-amber-50 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3 text-xs text-amber-900">
          <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Notice regarding pupil access:</span> Pupils do not have individual portal logins. All continuous assessments, terminal examination results, unique result token PINs, and fee invoices are managed directly and securely by Parents and Guardians through the <strong>Parent & Guardian Portal</strong>.
          </div>
        </div>
      </div>
    </div>
  );
}
