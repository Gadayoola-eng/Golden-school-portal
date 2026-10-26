import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Award,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Column 1 & 2: School Brand & Overview */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Golden International School"
                className="w-12 h-12 object-contain drop-shadow shrink-0"
              />
              <div>
                <span className="font-black text-white text-base tracking-tight block">
                  Golden International School
                </span>
                <span className="text-[10px] font-bold text-amber-500 tracking-wider uppercase block">
                  The Word: Psalm 119:105 • Ido-Ekiti
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              A premier early childhood and primary education institution delivering high-quality foundational British and Nigerian curricula. Committed to nurturing confident young readers, creative problem solvers, and joyful scholars.
            </p>

            {/* Accreditations Row */}
            <div className="pt-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
                Certified & Accredited By
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300">
                  Cambridge Primary Programme
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300">
                  National Common Entrance Board
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300">
                  Jolly Phonics Accredited
                </span>
              </div>
            </div>
          </div>

          {/* Column 3: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="text-slate-400 hover:text-white transition-colors">
                  Home & Overview
                </Link>
              </li>
              <li>
                <Link to="/apply" className="text-slate-400 hover:text-white transition-colors">
                  Online Admissions (2026/27)
                </Link>
              </li>
              <li>
                <Link to="/apply#status" className="text-slate-400 hover:text-white transition-colors">
                  Application Status Tracker
                </Link>
              </li>
              <li>
                <Link to="/apply#visit" className="text-slate-400 hover:text-white transition-colors">
                  Book a Campus Tour
                </Link>
              </li>
              <li>
                <Link to="/news" className="text-slate-400 hover:text-white transition-colors">
                  School News & Events
                </Link>
              </li>
              <li>
                <Link to="/downloads" className="text-slate-400 hover:text-white transition-colors">
                  Resource Download Centre
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-slate-400 hover:text-white transition-colors">
                  Careers & Faculty Vacancies
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Academics & Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Portals & Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/login" className="text-slate-400 hover:text-white transition-colors">
                  Student Portal Access
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-400 hover:text-white transition-colors">
                  Parent Portal & Fees
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-400 hover:text-white transition-colors">
                  Faculty & Staff Intranet
                </Link>
              </li>
              <li>
                <Link to="/apply#status" className="text-slate-400 hover:text-white transition-colors">
                  Entrance Examination Results
                </Link>
              </li>
              <li>
                <Link to="/downloads" className="text-slate-400 hover:text-white transition-colors">
                  Academic Calendar 2025/2026
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Campus Address & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Contact Campus
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Odo - Iro Street, Ido-Ekiti, Ekiti State, Nigeria</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  <a href="tel:08062392750" className="hover:text-amber-400 font-semibold text-white transition-colors">08062392750</a>, 07069591713
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 flex items-center justify-center text-emerald-400 font-bold text-xs">💬</span>
                <a
                  href="https://wa.me/2349120771514"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 text-emerald-400 font-semibold transition-colors"
                >
                  WhatsApp: 09120771514
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <span>admissions@goldeninternationalschool.edu.ng</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Mon – Fri: 07:30 AM – 04:30 PM (Reception Open)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Golden International School. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Cookie Settings</span>
            <Link to="/login" className="text-amber-500 hover:text-amber-400 font-bold">
              Staff & Student Sign In
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
