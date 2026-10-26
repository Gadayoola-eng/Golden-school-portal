import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Globe, LogIn } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function NotFound() {
  const { user, isAuthenticated } = useAuthStore();
  const portalPath = user?.role === 'ADMIN' ? '/admin' : user?.role === 'TEACHER' ? '/teacher' : user?.role === 'PARENT' ? '/parent' : user?.role === 'STUDENT' ? '/student' : '/login';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <Link to="/" className="inline-block hover:scale-105 transition-transform">
          <img
            src="/logo.png"
            alt="Golden International School Logo"
            className="w-16 h-16 object-contain mx-auto mb-3 drop-shadow-md"
          />
        </Link>
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Golden International School</h2>
        <p className="text-[11px] text-amber-600 font-bold mb-4">Odo - Iro Street, Ido-Ekiti, Ekiti State</p>

        <h1 className="text-5xl font-black text-slate-900 tracking-tight">404</h1>
        <p className="text-base font-bold text-slate-700 mt-2">Page Not Found</p>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-6">
          The page you are looking for doesn't exist or has been relocated.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-sm"
          >
            <Globe className="w-4 h-4" /> Return to School Website
          </Link>

          <Link
            to={portalPath}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
          >
            <LogIn className="w-4 h-4 text-amber-400" /> {isAuthenticated ? 'Go to My Portal' : 'Portal Login'}
          </Link>
        </div>
      </div>
    </div>
  );
}
