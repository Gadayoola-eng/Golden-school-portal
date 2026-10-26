import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import Badge from '../../components/Badge';
import {
  GraduationCap,
  BookOpen,
  CreditCard,
  Calendar,
  CheckCircle2,
  Clock,
  Award,
  Bell,
  Sparkles,
  ArrowRight,
  User,
  ShieldCheck,
  TrendingUp,
  FileText,
  FileSpreadsheet,
  CalendarDays,
  CalendarCheck
} from 'lucide-react';

export default function ParentDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['parent-overview'],
    queryFn: async () => {
      const res = await api.get('/parent/overview');
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
        Failed to load parent portal details. Please refresh the page.
      </div>
    );
  }

  const { student, courses, recentGrades, finances, announcements } = data;

  const quickActions = [
    {
      title: 'Terminal Report Card',
      subtitle: 'View Exam Marks & Position',
      desc: `Check ${student.name}'s official terminal evaluation, position in class (2nd), and teacher remarks.`,
      link: '/reports',
      icon: FileSpreadsheet,
      color: 'from-amber-500 to-amber-600',
      tag: 'Term Result'
    },
    {
      title: 'Pay School Fees',
      subtitle: 'Invoices & Receipts',
      desc: 'Check fee balance, settle via First Bank transfer, and print official bursary receipts.',
      link: '/billing',
      icon: CreditCard,
      color: 'from-emerald-500 to-teal-600',
      tag: 'Bursary'
    },
    {
      title: 'Class Timetable',
      subtitle: 'Daily Lesson Schedule',
      desc: 'See daily periods, subjects, break times, and teacher schedule for Primary 4.',
      link: '/timetable',
      icon: CalendarDays,
      color: 'from-blue-500 to-indigo-600',
      tag: 'Timetable'
    },
    {
      title: 'Child Attendance',
      subtitle: `${student.attendanceRate}% Present`,
      desc: 'Review daily school attendance, roll call register, and punctuality records.',
      link: '/attendance',
      icon: CalendarCheck,
      color: 'from-purple-500 to-indigo-600',
      tag: 'Attendance'
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-amber-950/10 border border-amber-600/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-amber-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Golden International Parent & Guardian Hub • Ido-Ekiti
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Child Overview: {student.name}
            </h1>
            <p className="text-amber-100 text-xs sm:text-sm max-w-xl leading-relaxed">
              <strong>{student.grade}</strong> • Student Code: <span className="font-mono text-white">{student.studentCode}</span>
              <br />
              <span className="text-amber-200/90 italic">"The Word: Psalm 119:105 • Nurturing young minds with godliness and distinction."</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/reports"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 hover:bg-amber-50 rounded-xl text-xs sm:text-sm font-extrabold shadow-lg shadow-black/10 transition-transform active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-600" />
              View Report Card
            </Link>
            <Link
              to="/billing"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs sm:text-sm font-extrabold shadow-md transition-all active:scale-95"
            >
              <CreditCard className="w-4 h-4" />
              Pay School Fees
            </Link>
          </div>
        </div>

        {/* Background glow circle */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* QUICK SHORTCUTS FOR PARENTS */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wider">
              Parent Quick Shortcuts
            </h2>
            <p className="text-xs text-slate-500">Tap any card to manage your child's schooling immediately</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((qa, idx) => {
            const Icon = qa.icon;
            return (
              <Link
                key={idx}
                to={qa.link}
                className="group bg-white p-5 rounded-2xl border border-slate-200/90 hover:border-amber-400 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
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

      {/* Pupil Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Class & Pupil Code
          </span>
          <p className="text-base font-bold text-slate-900 mt-1">{student.studentCode}</p>
          <span className="text-[11px] text-amber-600 font-bold mt-0.5 block">{student.grade}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Terminal Performance
          </span>
          <p className="text-xl font-black text-emerald-600 mt-1">93.3% (A+)</p>
          <span className="text-[11px] text-emerald-700/90 font-bold mt-0.5 block">
            2nd out of 28 pupils ✓
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Attendance Rate
          </span>
          <p className="text-xl font-bold text-slate-900 mt-1">{student.attendanceRate}%</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">64 of 65 days present</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Tuition Fee Balance
          </span>
          <p
            className={`text-xl font-black mt-1 ${
              finances.totalOutstanding > 0 ? 'text-amber-600' : 'text-emerald-600'
            }`}
          >
            ₦{finances.totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <Link
            to="/billing"
            className="text-[11px] font-semibold text-brand-600 hover:text-brand-800 mt-0.5 inline-block"
          >
            {finances.unpaidBillsCount > 0 ? `${finances.unpaidBillsCount} pending invoice(s) →` : 'All cleared ✓'}
          </Link>
        </div>
      </div>

      {/* Main Grid: Enrolled Subjects & Grades */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Coursework Progress */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Enrolled Primary Subjects</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Second Term subjects, class teachers, and continuous assessment
                </p>
              </div>
              <Badge variant="primary">{courses.length} Active Subjects</Badge>
            </div>

            <div className="divide-y divide-slate-100">
              {courses.map((course) => (
                <div key={course.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">{course.name}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        Teacher: <span className="font-medium text-slate-700">{course.teacherName}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold uppercase text-slate-400 block">
                        Term Score
                      </span>
                      <span
                        className={`text-base font-bold ${
                          course.currentGradePercentage !== null
                            ? course.currentGradePercentage >= 85
                              ? 'text-emerald-600'
                              : 'text-brand-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {course.currentGradePercentage !== null
                          ? `${course.currentGradePercentage}%`
                          : 'Awaiting Grading'}
                      </span>
                    </div>
                  </div>

                  {/* Submission ratio indicator */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>
                      Classwork & Homework: {course.submittedCount} / {course.totalAssignments} completed
                    </span>
                    <span className="text-[11px] font-medium text-emerald-600">Excellent Standing ✓</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Evaluations & Faculty Feedback */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">Teacher Remarks & Continuous Assessment</h2>
            {recentGrades.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                No graded assignments recorded yet this term.
              </p>
            ) : (
              <div className="space-y-3">
                {recentGrades.map((g) => (
                  <div
                    key={g.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <span className="text-[11px] font-semibold text-brand-600 uppercase tracking-wider block">
                        {g.className}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                        {g.assignmentTitle}
                      </h4>
                      {g.feedback && (
                        <p className="text-xs text-slate-600 italic mt-1 bg-white p-2.5 rounded-lg border border-slate-100">
                          "{g.feedback}"
                        </p>
                      )}
                    </div>
                    <div className="text-right sm:shrink-0">
                      <span className="text-lg font-black text-emerald-600">{g.percentage}%</span>
                      <span className="text-[11px] text-slate-400 block">
                        ({g.grade} / {g.maxPoints} pts)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Fee Quick Status & School Circulars */}
        <div className="space-y-6">
          {/* Quick Fee Card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Tuition & Fee Status</h3>
                <span className="text-xs text-slate-500">Term 2 Academic Session</span>
              </div>
            </div>

            <div className="p-3.5 bg-white/80 backdrop-blur-xs rounded-xl border border-amber-200/60 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Total Settled:</span>
                <span className="font-bold text-emerald-600">
                  ₦{finances.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Outstanding Balance:</span>
                <span className="font-bold text-amber-700">
                  ₦{finances.totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <Link
              to="/billing"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              Pay School Fees Online <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* School Announcements */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-brand-600" />
              <h3 className="text-sm font-bold text-slate-900">School Notices & Circulars</h3>
            </div>

            <div className="space-y-3">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-100/60 px-2 py-0.5 rounded-md">
                      {ann.category}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(ann.date).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 leading-snug">{ann.title}</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
