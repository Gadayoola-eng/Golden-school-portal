import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import PublicNavbar from '../../components/public/PublicNavbar';
import PublicFooter from '../../components/public/PublicFooter';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  Clock,
  MapPin,
  Tag,
  Users,
  Search,
  Sparkles,
  ArrowRight,
  ChevronRight,
  BookOpen,
  Award,
  Bell,
  CheckCircle2,
  Share2,
  FileText
} from 'lucide-react';

export default function NewsPage() {
  const toast = useToast();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Fetch news
  const { data: newsData, isLoading: isNewsLoading } = useQuery({
    queryKey: ['newsList', selectedCategory],
    queryFn: async () => {
      const res = await api.get(`/content/news?category=${encodeURIComponent(selectedCategory)}`);
      return res.data;
    },
  });

  // Fetch events
  const { data: eventsData, isLoading: isEventsLoading } = useQuery({
    queryKey: ['eventsList'],
    queryFn: async () => {
      const res = await api.get('/content/events');
      return res.data;
    },
  });

  const categories = newsData?.categories || ['All', 'Academics & STEM', 'Admissions', 'Sports & Athletics', 'Arts & Culture'];
  const allNews = newsData?.news || [];
  const events = eventsData?.events || [];

  const filteredNews = allNews.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.excerpt.toLowerCase().includes(q) ||
      n.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  const featured = filteredNews.find((n) => n.featured) || filteredNews[0];
  const regularNews = filteredNews.filter((n) => n.id !== featured?.id);

  const handleRemindEvent = (eventTitle) => {
    toast.success(`Reminder alert set for "${eventTitle}". You will receive a calendar notification.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <PublicNavbar />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Official Press & Institutional Bulletins
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
            School News & Event Calendar
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Stay updated with academic breakthroughs, campus competitions, admission dates, and termly celebrations.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-16">
        {/* News Filters & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news or topics..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* FEATURED STORY */}
        {featured && (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6 sm:p-10 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                    Featured Headline
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    {featured.category}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-medium text-slate-500">{featured.date}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-medium text-slate-500">{featured.readTime}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 tracking-tight">
                  {featured.title}
                </h2>

                <p className="text-sm text-slate-600 leading-relaxed max-w-4xl mb-6">
                  {featured.content || featured.excerpt}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-1.5 mb-6">
                  {featured.tags?.map((t) => (
                    <span key={t} className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-semibold">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Published by: {featured.author}</span>
                <button
                  onClick={() => toast.success('Article link copied to clipboard.')}
                  className="flex items-center gap-1.5 text-brand-600 hover:text-brand-800 font-bold"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share Article
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REGULAR NEWS GRID */}
        <div>
          <h3 className="text-base font-extrabold text-slate-900 mb-6">
            Recent Bulletins & Press Reports ({regularNews.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularNews.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                      {article.category}
                    </span>
                    <span>{article.date}</span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 mb-2 leading-snug line-clamp-2">
                    {article.title}
                  </h4>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                    {article.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">{article.readTime}</span>
                  <button
                    onClick={() => setSelectedArticle(article)}
                    className="font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                  >
                    Read Story <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================== */}
        {/* UPCOMING EVENTS CALENDAR SECTION */}
        {/* ========================================================== */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
              Academic & Co-Curricular Agenda
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Official School Events Calendar (2025/2026)
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Mark these milestone dates for entrance assessments, parent consultations, speech days, and sports festivals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-black flex flex-col items-center justify-center shrink-0 text-center">
                      <span className="text-sm leading-none">{evt.date.split(' ')[0]}</span>
                      <span className="text-[10px] uppercase tracking-wider leading-none">{evt.date.split(' ')[1]}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/10 text-amber-300">
                        {evt.category}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1 leading-snug">
                        {evt.title}
                      </h4>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {evt.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-1 text-slate-400 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{evt.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>{evt.venue}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemindEvent(evt.title)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold transition-colors shrink-0"
                  >
                    <Bell className="w-3 h-3" />
                    Set Reminder
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Article Detail Reading Modal */}
      {selectedArticle && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                {selectedArticle.category}
              </span>
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700"
              >
                Close ✕
              </button>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              {selectedArticle.title}
            </h3>

            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span>{selectedArticle.date}</span>
              <span>•</span>
              <span>{selectedArticle.readTime}</span>
              <span>•</span>
              <span>By {selectedArticle.author}</span>
            </div>

            <div className="text-sm text-slate-700 leading-relaxed space-y-3 pt-2 whitespace-pre-line">
              {selectedArticle.content || selectedArticle.excerpt}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800"
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}

      <PublicFooter />
    </div>
  );
}
