import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import PublicNavbar from '../../components/public/PublicNavbar';
import PublicFooter from '../../components/public/PublicFooter';
import { useToast } from '../../context/ToastContext';
import {
  Briefcase,
  Sparkles,
  MapPin,
  Clock,
  Banknote,
  GraduationCap,
  Award,
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
  Upload,
  ArrowRight,
  ChevronRight,
  FileText,
  User,
  Mail,
  Phone,
  Building,
  Check,
  X
} from 'lucide-react';

export default function CareersPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyModalJob, setApplyModalJob] = useState(null);
  const [applicationSuccess, setApplicationSuccess] = useState(null);

  // Application form state
  const [appForm, setAppForm] = useState({
    candidateName: '',
    candidateEmail: '',
    candidatePhone: '',
    yearsExperience: 4,
    qualification: 'B.Ed / B.Sc with TRCN Certification',
    linkedIn: '',
    cvFileName: 'Curriculum_Vitae_Updated.pdf',
    coverLetter: '',
  });

  // Fetch job listings
  const { data, isLoading } = useQuery({
    queryKey: ['careersJobs', selectedDepartment],
    queryFn: async () => {
      const res = await api.get(`/careers/jobs?department=${encodeURIComponent(selectedDepartment)}`);
      return res.data;
    },
  });

  const jobs = data?.jobs || [];
  const departments = data?.departments || [
    'All',
    'Science & Mathematics',
    'STEM & Digital Technology',
    'Early Childhood Education',
    'Medical & Pastoral Health',
    'Administration & Counseling',
  ];

  const applyMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/careers/apply', payload);
      return res.data;
    },
    onSuccess: (resData) => {
      setApplicationSuccess(resData.application);
      toast.success('Your job application has been submitted successfully!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to submit application.');
    },
  });

  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!applyModalJob) return;

    applyMutation.mutate({
      jobId: applyModalJob.id,
      ...appForm,
    });
  };

  const perks = [
    {
      icon: Banknote,
      title: 'Competitive Remuneration',
      desc: 'Industry-leading salary packages with annual cost-of-living adjustments and performance bonuses.',
    },
    {
      icon: GraduationCap,
      title: 'Full Children Tuition Waiver',
      desc: '100% full academic tuition scholarship for up to two biological children enrolled at GIS.',
    },
    {
      icon: Award,
      title: 'Cambridge PD Certifications',
      desc: 'Sponsored continuous professional development, Cambridge International exams training, and leadership seminars.',
    },
    {
      icon: ShieldCheck,
      title: 'Comprehensive HMO Healthcare',
      desc: 'Tier-1 private health insurance covering faculty, spouse, and dependents across leading Nigerian hospitals.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <PublicNavbar />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Faculty & Leadership Recruitment • 2026/2027
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
            Join Our Faculty of Distinguished Educators
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            At Golden International School, we empower passionate mentors who inspire future generations in science, humanities, arts, and leadership.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-16">
        {/* Perks & Benefits Section */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block mb-1">
              Why Teach & Lead at GIS?
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              An Enriching, Rewarding Workplace
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {perks.map((p, i) => {
              const Icon = p.icon;
              return (
                <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900">{p.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Vacancies Heading & Filters */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">
                Open Career Vacancies
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Explore Available Faculty & Staff Roles ({jobs.length})
              </h2>
            </div>

            {/* Department Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDepartment(dept)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    selectedDepartment === dept
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Job Listings Grid */}
          {isLoading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium">Loading open vacancies...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-base font-bold text-slate-800">No Openings in this Department</h4>
              <p className="text-xs text-slate-500 mt-1">
                We are always happy to review speculative CVs from master educators. Check back soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-amber-400 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                        {job.department}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {job.type}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 mb-2 leading-snug">
                      {job.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-emerald-700">
                        <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                        {job.salaryRange}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-6">
                      {job.summary}
                    </p>

                    {/* Requirements snippet */}
                    <div className="space-y-1.5 border-t border-slate-100 pt-3 mb-6">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Key Candidate Profile:
                      </span>
                      {job.requirements?.slice(0, 2).map((r, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="leading-snug">{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 underline"
                    >
                      View Full Job Specs
                    </button>

                    <button
                      onClick={() => {
                        setApplyModalJob(job);
                        setApplicationSuccess(null);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm"
                    >
                      <span>Apply Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* JOB DETAILS MODAL */}
      {selectedJob && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedJob(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                  {selectedJob.department}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {selectedJob.title}
                </h3>
                <p className="text-xs text-brand-700 font-bold mt-1">
                  {selectedJob.salaryRange} • {selectedJob.type}
                </p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2">Role Responsibilities</h4>
                <ul className="space-y-1.5 text-slate-600 list-disc pl-4">
                  {selectedJob.responsibilities?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2">Required Qualifications & Experience</h4>
                <ul className="space-y-1.5 text-slate-600 list-disc pl-4">
                  {selectedJob.requirements?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2">Package & Benefits</h4>
                <ul className="space-y-1.5 text-slate-600 list-disc pl-4">
                  {selectedJob.benefits?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Application Deadline: {selectedJob.deadline}</span>
              <button
                onClick={() => {
                  setApplyModalJob(selectedJob);
                  setSelectedJob(null);
                  setApplicationSuccess(null);
                }}
                className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm"
              >
                Apply for this Position
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JOB APPLICATION MODAL WITH CV UPLOAD */}
      {applyModalJob && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setApplyModalJob(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Employment Application
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  {applyModalJob.title}
                </h3>
              </div>
              <button
                onClick={() => setApplyModalJob(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {applicationSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Application Submitted!</h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Thank you, <strong>{applicationSuccess.candidateName}</strong>. Your CV and credentials have been routed to our Academic Recruitment Secretariat.
                </p>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-600 max-w-sm mx-auto">
                  Candidate ID: <strong className="font-mono text-slate-900">{applicationSuccess.id}</strong>
                </div>
                <button
                  onClick={() => setApplyModalJob(null)}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={appForm.candidateName}
                      onChange={(e) => setAppForm({ ...appForm, candidateName: e.target.value })}
                      placeholder="e.g. Dr. Chidi Okafor"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={appForm.candidateEmail}
                        onChange={(e) => setAppForm({ ...appForm, candidateEmail: e.target.value })}
                        placeholder="chidi@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={appForm.candidatePhone}
                        onChange={(e) => setAppForm({ ...appForm, candidatePhone: e.target.value })}
                        placeholder="+234 803 000 0000"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="40"
                        value={appForm.yearsExperience}
                        onChange={(e) => setAppForm({ ...appForm, yearsExperience: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Highest Qualification
                      </label>
                      <select
                        value={appForm.qualification}
                        onChange={(e) => setAppForm({ ...appForm, qualification: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      >
                        <option value="B.Ed / B.Sc with TRCN">B.Ed / B.Sc with TRCN</option>
                        <option value="Master of Science / M.Ed">Master of Science / M.Ed</option>
                        <option value="Doctor of Philosophy (Ph.D)">Doctor of Philosophy (Ph.D)</option>
                        <option value="Postgraduate Diploma in Education (PGDE)">PGDE</option>
                        <option value="British QTS / International License">British QTS / License</option>
                      </select>
                    </div>
                  </div>

                  {/* CV Upload Simulator */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Upload Curriculum Vitae / Resume (PDF, max 5MB) *
                    </label>
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-amber-400 bg-slate-50/50">
                      <Upload className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                      <p className="text-xs font-mono font-bold text-slate-800">{appForm.cvFileName}</p>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full inline-block mt-1">
                        ✓ Ready for submission (1.8 MB)
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Statement of Teaching Philosophy / Cover Letter
                    </label>
                    <textarea
                      rows="3"
                      value={appForm.coverLetter}
                      onChange={(e) => setAppForm({ ...appForm, coverLetter: e.target.value })}
                      placeholder="Briefly state your pedagogical background, distinction records, and why you wish to teach at Golden International..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setApplyModalJob(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={applyMutation.isPending}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-sm"
                  >
                    {applyMutation.isPending ? 'Submitting Application...' : 'Send Application & CV'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <PublicFooter />
    </div>
  );
}
