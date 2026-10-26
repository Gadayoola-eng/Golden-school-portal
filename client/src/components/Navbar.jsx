import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Menu,
  Bell,
  CheckCheck,
  ChevronDown,
  User,
  BookOpen,
  LayoutDashboard,
  LogOut,
  Clock,
  Award,
  FileCheck2,
  Sparkles,
  ExternalLink,
  CreditCard,
  Globe,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useToast } from '../context/ToastContext';
import api from '../api/client';
import Badge from './Badge';

export default function Navbar({ onOpenSidebar }) {
  const { user, logout } = useAuthStore();
  const toast = useToast();
  const navigate = useNavigate();
  const isTeacher = user?.role === 'TEACHER';
  const isParent = user?.role === 'PARENT';

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState(() => {
    try {
      const stored = localStorage.getItem(`read_notifs_${user?.id}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close menus on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsNotifOpen(false);
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Fetch real notification data based on role
  const { data: dashboardData } = useQuery({
    queryKey: [isTeacher ? 'teacher-dashboard' : 'student-dashboard'],
    queryFn: async () => {
      const endpoint = isTeacher ? '/dashboard/teacher' : '/dashboard/student';
      const res = await api.get(endpoint);
      return res.data;
    },
    enabled: !!user,
  });

  // Build notifications list
  const notifications = React.useMemo(() => {
    if (!dashboardData) return [];

    if (isTeacher) {
      const pending = dashboardData.pendingSubmissions || [];
      return pending.map((sub) => ({
        id: `teacher-sub-${sub.id}`,
        title: 'New Submission to Grade',
        description: `${sub.studentName} submitted "${sub.assignmentTitle}" in ${sub.className}`,
        timestamp: sub.submittedAt,
        link: `/teacher/assignments/${sub.assignmentId}`,
        type: 'submission',
      }));
    } else {
      const notifs = [];
      const upcoming = dashboardData.upcomingAssignments || [];
      const recentGrades = dashboardData.recentGrades || [];

      // Graded items
      recentGrades.forEach((g) => {
        notifs.push({
          id: `grade-${g.id}`,
          title: `Grade Posted: ${g.percentage}%`,
          description: `Your submission for "${g.assignmentTitle}" in ${g.className} has been graded.`,
          timestamp: g.gradedAt,
          link: `/student/assignments/${g.assignmentId}`,
          type: 'grade',
        });
      });

      // Upcoming due dates
      upcoming
        .filter((a) => a.status === 'PENDING')
        .slice(0, 5)
        .forEach((a) => {
          const isUrgent = new Date(a.dueDate) - new Date() < 48 * 60 * 60 * 1000;
          notifs.push({
            id: `due-${a.id}`,
            title: isUrgent ? 'Assignment Due Soon!' : 'Upcoming Assignment',
            description: `"${a.title}" is due ${new Date(a.dueDate).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
            })}`,
            timestamp: a.dueDate,
            link: `/student/assignments/${a.id}`,
            type: 'due',
            urgent: isUrgent,
          });
        });

      return notifs;
    }
  }, [dashboardData, isTeacher]);

  const unreadCount = notifications.filter((n) => !readNotifIds.includes(n.id)).length;

  const markAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadNotifIds(allIds);
    try {
      localStorage.setItem(`read_notifs_${user?.id}`, JSON.stringify(allIds));
    } catch (e) {
      console.error(e);
    }
    toast.info('All notifications marked as read.');
  };

  const handleNotificationClick = (notif) => {
    if (!readNotifIds.includes(notif.id)) {
      const nextRead = [...readNotifIds, notif.id];
      setReadNotifIds(nextRead);
      try {
        localStorage.setItem(`read_notifs_${user?.id}`, JSON.stringify(nextRead));
      } catch (e) {
        console.error(e);
      }
    }
    setIsNotifOpen(false);
    navigate(notif.link);
  };

  const handleLogout = () => {
    logout();
    toast.info('Signed out successfully.');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger & Greeting */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <span className="text-xs text-slate-400 font-medium">Welcome back,</span>
          <h2 className="text-sm sm:text-base font-bold text-slate-800 leading-tight">
            {user?.name || 'User'}
          </h2>
        </div>
      </div>

      {/* Right: School Website Button, Role Badge, Notifications & Profile Trigger */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Quick Link back to Public Website */}
        <Link
          to="/"
          title="Return to Golden International School Website"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-xs font-bold transition-all shadow-2xs group"
        >
          <Globe className="w-3.5 h-3.5 text-amber-600 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">Main Website</span>
        </Link>

        {/* Role Badge */}
        <div className="hidden sm:block">
          <Badge variant={isTeacher ? 'teacher' : isParent ? 'parent' : 'student'}>
            {isTeacher ? 'Teacher / Faculty' : isParent ? 'Guardian / Parent' : 'Enrolled Student'}
          </Badge>
        </div>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setIsNotifOpen((prev) => !prev);
              setIsProfileOpen(false);
            }}
            aria-label="Notifications"
            className={`relative p-2 rounded-xl transition-colors ${
              isNotifOpen
                ? 'bg-brand-50 text-brand-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Flyout */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification Items List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="py-8 px-4 text-center">
                    <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                      <Bell className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-600">All caught up!</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      No new updates or alerts right now.
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const isRead = readNotifIds.includes(notif.id);
                    return (
                      <button
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors hover:bg-slate-50 ${
                          !isRead ? 'bg-brand-50/40' : ''
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            notif.type === 'grade'
                              ? 'bg-emerald-100 text-emerald-700'
                              : notif.type === 'due'
                              ? notif.urgent
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-amber-100 text-amber-700'
                              : 'bg-brand-100 text-brand-700'
                          }`}
                        >
                          {notif.type === 'grade' ? (
                            <Award className="w-4 h-4" />
                          ) : notif.type === 'due' ? (
                            <Clock className="w-4 h-4" />
                          ) : (
                            <FileCheck2 className="w-4 h-4" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-bold text-slate-800 truncate">
                              {notif.title}
                            </h4>
                            {!isRead && (
                              <span className="w-2 h-2 rounded-full bg-brand-600 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                            {notif.description}
                          </p>
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                            <span>
                              {notif.timestamp
                                ? new Date(notif.timestamp).toLocaleDateString([], {
                                    month: 'short',
                                    day: 'numeric',
                                  })
                                : 'Recent'}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu Trigger */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setIsProfileOpen((prev) => !prev);
              setIsNotifOpen(false);
            }}
            aria-label="User profile menu"
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-500 transition-transform duration-200 hidden sm:block ${
                isProfileOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* User Brief */}
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{user?.email}</p>
                <div className="mt-2">
                  <Badge variant={isTeacher ? 'teacher' : isParent ? 'parent' : 'student'}>
                    {isTeacher ? 'Faculty' : isParent ? 'Guardian / Parent' : 'Student'}
                  </Badge>
                </div>
              </div>

              {/* Links */}
              <div className="py-1">
                <Link
                  to="/"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-amber-900 bg-amber-50/60 hover:bg-amber-100/80 transition-colors"
                >
                  <Globe className="w-4 h-4 text-amber-600" />
                  Visit School Website
                </Link>
                <Link
                  to={isTeacher ? '/teacher' : isParent ? '/parent' : '/student'}
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-400" />
                  {isParent ? 'Parent Portal' : 'Dashboard'}
                </Link>
                {isTeacher && (
                  <Link
                    to="/teacher/classes"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    My Classes
                  </Link>
                )}
                {!isTeacher && (
                  <>
                    {!isParent && (
                      <Link
                        to="/student/classes"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <BookOpen className="w-4 h-4 text-slate-400" />
                        My Courses
                      </Link>
                    )}
                    <Link
                      to="/billing"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <CreditCard className="w-4 h-4 text-slate-400" />
                      Fees & Payments
                    </Link>
                  </>
                )}
                <Link
                  to="/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  My Profile & Settings
                </Link>
              </div>

              {/* Divider & Sign Out */}
              <div className="border-t border-slate-100 pt-1 mt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
