import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import Badge from '../../components/Badge';
import {
  BookOpen,
  Calendar,
  Clock,
  Award,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  FileSpreadsheet,
  CreditCard,
  CalendarDays,
  CalendarCheck,
  User,
  GraduationCap
} from 'lucide-react';

export default function StudentDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: async () => {
      const res = await api.get('/dashboard/student');
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
        Failed to load pupil portal details. Please refresh the page.
      </div>
    );
  }

  const { stats, enrolledClasses, upcomingAssignments, recentGrades } = data;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'GRADED':
        return <Badge variant="success">Graded ✓</Badge>;
      case 'SUBMITTED':
        return <Badge variant="primary">Submitted</Badge>;
      case 'OVERDUE':
        return <Badge variant="danger">Overdue</Badge>;
      case 'PENDING':
      default:
        return <Badge variant="warning">Homework Due</Badge>;
    }
  };

  const quickActions = [
    {
      title: 'Terminal Report Card',
      subtitle: 'View Exam Marks & Position',
      desc: 'Check your 1st & 2nd Term evaluation, grades, and teacher remarks.',
      link: '/reports',
      icon: FileSpreadsheet,
      color: 'from-amber-500 to-amber-600',
      tag: 'Term Result'
    },
    {
      title: 'School Fees & Receipts',
      subtitle: 'Check Invoices & Pay',
      desc: 'View tuition balance, settlement receipts, and First Bank transfer details.',
      link: '/billing',
      icon: CreditCard,
      color: 'from-emerald-500 to-teal-600',
      tag: 'Bursary'
    },
    {
      title: 'Class Timetable',
      subtitle: 'Daily Subject Schedule',
      desc: 'Check lesson periods, break times, and subject teachers for today.',
      link: '/timetable',
      icon: CalendarDays,
      color: 'from-blue-500 to-indigo-600',
      tag: 'Schedule'
    },
    {
      title: 'Attendance Sheet',
      subtitle: '64/65 Days Present',
      desc: 'Track daily roll call, punctuality, and attendance records.',
      link: '/attendance',
      icon: CalendarCheck,
      color: 'from-purple-500 to-indigo-600',
      tag: '98.5% Rate'
    },
    {
      title: 'My Subjects',
      subtitle: 'Primary 4 Subjects',
      desc: 'Open Mathematics, English Phonics, Basic Science & class materials.',
      link: '/student/classes',
      icon: BookOpen,
      color: 'from-rose-500 to-pink-600',
      tag: '5 Subjects'
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Friendly Pupil Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-brand-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              Primary Pupil Portal • Golden International School, Ido-Ekiti
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, Alex! 👋
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              <strong>Primary 4 Gold (Basic 4)</strong> • Reg No: <span className="font-mono text-amber-400">GIPS/2024/0142</span>
              <br />
              <span className="text-amber-200/90 text-xs italic">"The Word: Psalm 119:105 - Thy word is a lamp unto my feet, and a light unto my path."</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/reports"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs sm:text-sm font-extrabold shadow-md transition-all active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Check Report Card
            </Link>
            <Link
              to="/billing"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-bold border border-white/20 transition-all"
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              Fees & Receipts
            </Link>
          </div>
        </div>

        {/* Decorative blur orb */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* QUICK ACTIONS: Big, Simple, Clickable Cards */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wider">
              Quick Shortcuts
            </h2>
            <p className="text-xs text-slate-500">Tap any card to open what you need right away</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {quickActions.map((qa, idx) => {
            const Icon = qa.icon;
            return (
              <Link
                key={idx}
                to={qa.link}
                className="group bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-amber-400 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${qa.color} text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {qa.tag}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors">
                    {qa.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {qa.desc}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600 group-hover:translate-x-0.5 transition-transform">
                  <span>Open {qa.title.split(' ')[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content Grid: Upcoming Homework Tasks + Recent CA Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Homework / Tasks (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Upcoming Homework & Class Tasks</h2>
              <p className="text-xs text-slate-500 mt-0.5">Your active homework assignments from class teachers.</p>
            </div>
            <Link
              to="/student/classes"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              All Subjects <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcomingAssignments.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No assignments due</p>
              <p className="text-xs text-slate-400 mt-1">You are all caught up on your course deliverables!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {upcomingAssignments.map((assign) => (
                <div
                  key={assign.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-brand-600">{assign.className}</span>
                      <span className="text-slate-300">•</span>
                      {getStatusBadge(assign.status)}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{assign.title}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Due: {new Date(assign.dueDate).toLocaleDateString()} at {new Date(assign.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      <span className="text-amber-700 font-bold">
                        ({assign.points <= 10 ? `${assign.points} ⭐ Stars` : `${assign.points} pts`})
                      </span>
                    </p>
                  </div>
                  <Link
                    to={`/student/assignments/${assign.id}`}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all shadow-xs shrink-0 flex items-center gap-1.5 ${
                      assign.status === 'GRADED'
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : assign.status === 'SUBMITTED'
                        ? 'bg-brand-600 hover:bg-brand-700 text-white'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm hover:shadow'
                    }`}
                  >
                    {assign.status === 'GRADED'
                      ? '⭐ View Stars & Grade'
                      : assign.status === 'SUBMITTED'
                      ? 'Edit My Work'
                      : 'Do Homework Now 🚀 ⭐'}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Grades & Feedback (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Recent Grades</h2>
              <Award className="w-4 h-4 text-emerald-600" />
            </div>

            {recentGrades.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                No graded assignments yet. Your grades will appear here once teachers review your work.
              </div>
            ) : (
              <div className="space-y-3">
                {recentGrades.map((grade) => (
                  <div
                    key={grade.id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500 truncate max-w-[150px]">
                        {grade.className}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {grade.grade}/{grade.maxPoints} ({grade.percentage}%)
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 line-clamp-1">{grade.assignmentTitle}</p>
                    {grade.feedback && (
                      <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded-lg border border-slate-100 line-clamp-2">
                        "{grade.feedback}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link
              to="/student/classes"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              View All Class Grade Summaries &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
