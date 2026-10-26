import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import PublicNavbar from '../../components/public/PublicNavbar';
import PublicFooter from '../../components/public/PublicFooter';
import { useToast } from '../../context/ToastContext';
import {
  Download,
  FileText,
  Search,
  Sparkles,
  Calendar,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  ArrowRight,
  HardDrive,
  Clock,
  Eye
} from 'lucide-react';

export default function DownloadsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['downloadsList', selectedCategory, searchQuery],
    queryFn: async () => {
      const res = await api.get(
        `/content/downloads?category=${encodeURIComponent(selectedCategory)}&search=${encodeURIComponent(searchQuery)}`
      );
      return res.data;
    },
  });

  const categories = data?.categories || ['All', 'Admissions', 'Calendars', 'Handbooks', 'Curriculum', 'Newsletters'];
  const downloads = data?.downloads || [];

  const trackMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.post(`/content/downloads/${id}/track`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['downloadsList']);
    },
  });

  const handleDownload = (item) => {
    trackMutation.mutate(item.id);
    
    // Simulate real file download trigger
    const element = document.createElement('a');
    const file = new Blob([
      `=== GOLDEN INTERNATIONAL SCHOOL ===\nCAMPUS: Odo - Iro Street, Ido-Ekiti, Ekiti State, Nigeria\nTEL: 08062392750, 07069591713\nMOTTO: The Word (Psalm 119:105)\nDOCUMENT: ${item.title}\nCATEGORY: ${item.category}\nFORMAT: ${item.format}\nISSUED: ${item.updatedAt}\n\nThis is an official certified institutional document of Golden International School, Ido-Ekiti, Ekiti State, Nigeria.`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${item.title.replace(/[^a-zA-Z0-9]/g, '_')}.${item.format.toLowerCase() === 'pdf' ? 'pdf' : 'txt'}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast.success(`Downloading "${item.title}" (${item.size})`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <PublicNavbar />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Official Certified Documentation & Resource Vault
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
            Download Centre
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Access authorized application forms, Cambridge curriculum syllabi, boarding charters, and annual academic calendars.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-10">
        {/* Filters & Search Toolbar */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, handbook, or topic..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Resources Grid */}
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-medium">Loading document archives...</p>
          </div>
        ) : downloads.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">No Documents Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              No downloadable resources matched your filter criteria. Try clearing your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {downloads.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-amber-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                      {doc.category}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                      {doc.format}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                    {doc.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    {doc.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3.5 h-3.5" />
                      {doc.size}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="w-3.5 h-3.5" />
                      {doc.downloads?.toLocaleString()} Downloads
                    </span>
                  </div>

                  <button
                    onClick={() => handleDownload(doc)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-extrabold bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>Download Resource ({doc.format})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Support Help Card */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h4 className="text-base font-bold text-slate-900 mb-1">
              Need a Custom Transcript or Certified Academic Attestation?
            </h4>
            <p className="text-xs text-slate-600 max-w-xl">
              Official embossed transcripts and certificates for visa processing or university transfer are issued via our Records Secretariat.
            </p>
          </div>
          <a
            href="mailto:transcripts@goldeninternational.edu"
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shrink-0 text-center"
          >
            Request Official Transcript
          </a>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
