import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  User,
  Search,
  CheckSquare,
  Award,
  LogOut,
  CreditCard,
  HeartHandshake,
  CalendarCheck,
  CalendarDays,
  FileSpreadsheet,
  UserPlus,
  ShieldCheck,
  Globe,
  ArrowUpRight,
  FileCheck2,
  Newspaper,
  FileDown,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const isTeacher = user?.role === 'TEACHER';
  const isParent = user?.role === 'PARENT';

  const adminNav = [
    { name: 'Admin Console', path: '/admin', icon: ShieldCheck },
    { name: 'All Classes & Homework', path: '/teacher/classes', icon: BookOpen },
    { name: 'Roll Call Register', path: '/teacher/attendance', icon: CalendarCheck },
    { name: 'Timetable Schedule', path: '/timetable', icon: CalendarDays },
    { name: 'Terminal Reports', path: '/reports', icon: FileSpreadsheet },
    { name: 'Tuition & Invoicing', path: '/billing', icon: CreditCard },
    { name: 'Online Admissions', path: '/apply#status', icon: UserPlus },
    { name: 'Careers & ATS', path: '/careers', icon: HeartHandshake },
    { name: 'News & Highlights', path: '/news', icon: Newspaper },
    { name: 'School Downloads', path: '/downloads', icon: FileDown },
    { name: 'Profile & System', path: '/profile', icon: User },
  ];

  const teacherNav = [
    { name: 'Faculty Dashboard', path: '/teacher', icon: LayoutDashboard },
    { name: 'Roll Call Register', path: '/teacher/attendance', icon: CalendarCheck },
    { name: 'Classes & Homework', path: '/teacher/classes', icon: BookOpen },
    { name: 'Timetable Schedule', path: '/timetable', icon: CalendarDays },
    { name: 'Terminal Reports', path: '/reports', icon: FileSpreadsheet },
    { name: 'Admissions Desk', path: '/apply#status', icon: UserPlus },
    { name: 'Admin Console', path: '/admin', icon: ShieldCheck },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const studentNav = [
    { name: 'My Dashboard', path: '/student', icon: LayoutDashboard },
    { name: 'Homework & Subjects', path: '/student/classes', icon: BookOpen },
    { name: 'Terminal Report Card', path: '/reports', icon: FileSpreadsheet },
    { name: 'Fees & Receipts', path: '/billing', icon: CreditCard },
    { name: 'Class Timetable', path: '/timetable', icon: CalendarDays },
    { name: 'Attendance Record', path: '/attendance', icon: CalendarCheck },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  const parentNav = [
    { name: 'Parent Dashboard', path: '/parent', icon: LayoutDashboard },
    { name: 'Terminal Report Card', path: '/reports', icon: FileSpreadsheet },
    { name: 'Fees & Invoices', path: '/billing', icon: CreditCard },
    { name: 'Class Timetable', path: '/timetable', icon: CalendarDays },
    { name: 'Child Attendance', path: '/attendance', icon: CalendarCheck },
    { name: 'Online Admissions', path: '/apply', icon: UserPlus },
    { name: 'Profile & Settings', path: '/profile', icon: User },
  ];

  const navItems = isAdmin ? adminNav : isTeacher ? teacherNav : isParent ? parentNav : studentNav;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header: links directly to Main Website */}
        <Link
          to="/"
          title="Return to School Homepage"
          className="h-16 flex items-center px-4 border-b border-slate-100 gap-3 hover:bg-slate-50 transition-colors group"
        >
          <img
            src="/logo.png"
            alt="Golden International School"
            className="w-10 h-10 object-contain drop-shadow-sm shrink-0 group-hover:scale-105 transition-transform"
          />
          <div className="overflow-hidden min-w-0">
            <h1 className="font-bold text-slate-900 leading-tight text-sm truncate" title="Golden International School, Ido-Ekiti">
              Golden International
            </h1>
            <span className="text-[10px] font-semibold tracking-wide uppercase text-amber-600 block truncate">
              {isAdmin ? 'Admin Console' : isTeacher ? 'Teachers Portal' : isParent ? 'Parent Portal' : 'Pupil Portal'}
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <div className="flex-1 py-4 px-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Portal Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin' || item.path === '/teacher' || item.path === '/student'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            );
          })}

          {/* Quick link back to Main Public Website */}
          <div className="pt-3 mt-3 border-t border-slate-100">
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              External Website
            </div>
            <Link
              to="/"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-800 bg-amber-50 hover:bg-amber-100/90 border border-amber-200/80 transition-all text-amber-950 group shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-amber-600 group-hover:rotate-12 transition-transform" />
                <span>Visit School Website</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-3 mb-2 flex items-center gap-3 border border-slate-100">
            <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
