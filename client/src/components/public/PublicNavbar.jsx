import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  Menu,
  X,
  Phone,
  Calendar,
  FileText,
  Search,
  Download,
  Newspaper,
  User,
  Users,
  ExternalLink,
  ChevronRight,
  LogIn
} from 'lucide-react';

export default function PublicNavbar() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeAnnouncementIdx, setActiveAnnouncementIdx] = useState(0);

  // Fetch highlights & ticker announcements
  const { data: highlightsData } = useQuery({
    queryKey: ['highlightsTicker'],
    queryFn: async () => {
      const res = await api.get('/content/highlights');
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const announcements = highlightsData?.announcements || [
    { id: '1', text: '🚨 2026/2027 Admissions into Crèche, Nursery & Primary (Basic 1–6) are open. Apply online today!', link: '/apply' },
    { id: '2', text: '📅 Batch A Primary Diagnostic Assessment scheduled for Saturday, 18th April 2026.', link: '/apply#status' },
  ];

  // Rotate announcement ticker every 5 seconds
  useEffect(() => {
    if (announcements.length <= 1) return;
    const interval = setInterval(() => {
      setActiveAnnouncementIdx((prev) => (prev + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [announcements.length]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Admissions', path: '/apply' },
    { name: 'Parent Login Portal', path: '/login/parent', highlight: true },
    { name: 'News & Events', path: '/news' },
    { name: 'Download Centre', path: '/downloads' },
    { name: 'Careers', path: '/careers' },
  ];

  const currentAnnouncement = announcements[activeAnnouncementIdx] || announcements[0];

  return (
    <>
      {/* Top Announcement Ticker Bar */}
      {currentAnnouncement && (
        <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 border-b border-slate-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-hidden flex-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shrink-0">
                Notice
              </span>
              <p className="truncate text-slate-300 font-medium">
                {currentAnnouncement.text}
              </p>
              {currentAnnouncement.link && (
                <Link
                  to={currentAnnouncement.link}
                  className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 shrink-0"
                >
                  View Details <ChevronRight className="w-3 h-3" />
                </Link>
              )}
            </div>

            <div className="hidden lg:flex items-center gap-4 text-slate-400 shrink-0 text-[11px]">
              <a href="tel:08062392750" className="flex items-center gap-1 font-medium hover:text-amber-400 transition-colors">
                <Phone className="w-3 h-3 text-amber-400" />
                08062392750, 07069591713
              </a>
              <span className="text-slate-600">•</span>
              <span>Ido-Ekiti, Ekiti State</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Public Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & School Name */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <img
              src="/logo.png"
              alt="Golden International School"
              className="w-12 h-12 object-contain drop-shadow transition-transform group-hover:scale-105"
            />
            <div>
              <span className="font-black text-slate-900 text-base sm:text-lg tracking-tight block leading-tight">
                Golden International
              </span>
              <span className="text-[10px] font-bold text-amber-600 tracking-wider uppercase block">
                School • Ido-Ekiti
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              if (link.highlight) {
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="px-3 py-1.5 rounded-xl text-xs lg:text-sm font-black bg-amber-100 text-amber-950 hover:bg-amber-200 border border-amber-300 flex items-center gap-1.5 shadow-xs transition-all"
                  >
                    <Users className="w-3.5 h-3.5 text-amber-700" />
                    <span>{link.name}</span>
                  </Link>
                );
              }
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-2.5">
            <Link
              to="/login/teacher"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
              <span>Staff Login</span>
            </Link>

            {/* Admission Button */}
            <Link
              to="/apply"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-xs"
            >
              <span>Apply Online</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </Link>

            {isAuthenticated && (
              <Link
                to={user?.role === 'ADMIN' ? '/admin' : user?.role === 'TEACHER' ? '/teacher' : '/parent'}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                title="Go to authenticated dashboard"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Dashboard</span>
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-2 shadow-lg">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              {/* Admission Button */}
              <Link
                to="/apply"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 rounded-xl text-xs font-bold bg-slate-900 text-white shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>Apply for 2026/2027 Admission</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </Link>
              <Link
                to="/login/teacher"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center gap-2"
              >
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Staff / Teacher Portal</span>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
