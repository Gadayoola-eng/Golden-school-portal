import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';
import PublicFooter from '../../components/public/PublicFooter';
import {
  GraduationCap,
  FileText,
  Search,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Users,
  Phone,
  Mail,
  Upload,
  ArrowRight,
  ArrowLeft,
  Printer,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Building,
  School,
  ChevronRight,
  Eye,
  Download,
  Check,
  ExternalLink,
  BookOpen
} from 'lucide-react';

const GRADES = [
  'Crèche & Daycare (Ages 6m - 2 yrs)',
  'Playgroup & Early Learners (Ages 2 - 3 yrs)',
  'Nursery 1 (Ages 3 - 4 yrs)',
  'Nursery 2 (Ages 4 - 5 yrs)',
  'Kindergarten / Reception (Age 5 yrs)',
  'Primary 1 (Basic 1 - Age 6)',
  'Primary 2 (Basic 2 - Age 7)',
  'Primary 3 (Basic 3 - Age 8)',
  'Primary 4 (Basic 4 - Age 9)',
  'Primary 5 (Basic 5 - Age 10)',
  'Primary 6 (Basic 6 - Common Entrance Prep - Age 11)',
];

const TIME_SLOTS = [
  'Morning Session (10:00 AM - 11:30 AM)',
  'Afternoon Session (02:00 PM - 03:30 PM)',
];

export default function ApplyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  // Active Tab: 'apply' | 'status' | 'visit'
  const [activeTab, setActiveTab] = useState(() => {
    if (location.hash === '#status' || location.pathname.includes('/track')) return 'status';
    if (location.hash === '#visit' || location.pathname.includes('/visit')) return 'visit';
    return 'apply';
  });

  useEffect(() => {
    if (location.hash === '#status') setActiveTab('status');
    if (location.hash === '#visit') setActiveTab('visit');
    if (location.hash === '#apply') setActiveTab('apply');
  }, [location.hash]);

  // ----------------------------------------------------------------
  // TAB 1: APPLICATION WIZARD STATE
  // ----------------------------------------------------------------
  const [currentStep, setCurrentStep] = useState(1);
  const [submittedApp, setSubmittedApp] = useState(null);

  const [formData, setFormData] = useState({
    studentName: '',
    dob: '',
    gender: 'Male',
    gradeApplied: GRADES[5], // Primary 1 (Basic 1) default
    previousSchool: '',
    medicalNotes: '',
    bloodGroup: 'O+',
    parentName: '',
    parentRelationship: 'Father',
    parentPhone: '',
    parentWhatsApp: '',
    parentEmail: '',
    parentAddress: '',
    parentOccupation: '',
    declarationAgreed: false,
  });

  // Mock document uploads state
  const [uploadedDocs, setUploadedDocs] = useState([
    { id: 'doc1', title: 'Birth Certificate', name: 'Birth_Certificate_Certified.pdf', size: '1.4 MB', uploaded: true },
    { id: 'doc2', title: 'Previous Term Report Card', name: 'Primary_6_Transcript.pdf', size: '2.1 MB', uploaded: true },
    { id: 'doc3', title: 'Student Passport Photo', name: 'Passport_Photo_Digital.jpg', size: '850 KB', uploaded: true },
  ]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const applyMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/admissions/apply', payload);
      return res.data;
    },
    onSuccess: (data) => {
      setSubmittedApp(data.application);
      toast.success('Admissions application submitted successfully!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to submit application. Please check your inputs.');
    },
  });

  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!formData.declarationAgreed) {
      toast.error('Please accept the declaration before submitting.');
      return;
    }
    applyMutation.mutate({
      ...formData,
      documents: uploadedDocs.map(d => ({ name: d.name, type: 'application/pdf', status: 'VERIFIED' })),
    });
  };

  // ----------------------------------------------------------------
  // TAB 2: APPLICATION TRACKER STATE
  // ----------------------------------------------------------------
  const [searchCode, setSearchCode] = useState('GIS-ADM-2026-7841');
  const [activeSearch, setActiveSearch] = useState('GIS-ADM-2026-7841');

  const { data: trackData, isLoading: isTracking, error: trackError } = useQuery({
    queryKey: ['trackApp', activeSearch],
    queryFn: async () => {
      if (!activeSearch) return null;
      const res = await api.get(`/admissions/track/${encodeURIComponent(activeSearch)}`);
      return res.data;
    },
    enabled: Boolean(activeSearch),
    retry: 1,
  });

  const trackedApp = trackData?.application;

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!searchCode.trim()) {
      toast.error('Please enter an application reference number.');
      return;
    }
    setActiveSearch(searchCode.trim());
  };

  // ----------------------------------------------------------------
  // TAB 3: CAMPUS VISIT STATE
  // ----------------------------------------------------------------
  const [visitSubmitted, setVisitSubmitted] = useState(null);
  const [visitForm, setVisitForm] = useState({
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    attendeeCount: 2,
    interestedGrade: GRADES[5],
    visitDate: '2026-04-20',
    timeSlot: TIME_SLOTS[0],
    interests: ['Early Years Activity Room', 'Phonics & Literacy Hub', 'Little Einsteins STEAM Lab'],
    specialRequests: '',
  });

  const visitMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/admissions/visit', payload);
      return res.data;
    },
    onSuccess: (data) => {
      setVisitSubmitted(data.visit);
      toast.success('Campus tour successfully booked!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to schedule campus tour.');
    },
  });

  const handleVisitSubmit = (e) => {
    e.preventDefault();
    visitMutation.mutate(visitForm);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Public Admissions Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Golden International School"
              className="w-10 h-10 object-contain drop-shadow shrink-0"
            />
            <div>
              <span className="font-extrabold text-slate-900 text-sm tracking-tight block">
                Golden International School
              </span>
              <span className="text-[10px] font-bold text-amber-600 tracking-wider uppercase block">
                Admissions • Ido-Ekiti, Ekiti State
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600">
              <Phone className="w-3.5 h-3.5 text-amber-600" />
              <a href="tel:08062392750" className="hover:text-amber-600 transition-colors">
                Admissions Desk: 08062392750, 07069591713
              </a>
            </div>
            <Link
              to="/login"
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
            >
              Sign In to Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner with Tab Switcher */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            2026/2027 Academic Session Admissions Now Open
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
            Begin Your Journey of <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">Excellence & Distinction</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            Apply online in minutes, check real-time admission screening status, or book a guided tour of our modern academic facilities.
          </p>

          {/* Tab Navigation Pill */}
          <div className="inline-flex p-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 max-w-full overflow-x-auto">
            <button
              onClick={() => setActiveTab('apply')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                activeTab === 'apply'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className="w-4 h-4" />
              Online Application Wizard
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                activeTab === 'status'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Search className="w-4 h-4" />
              Track Application Status
            </button>
            <button
              onClick={() => setActiveTab('visit')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                activeTab === 'visit'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Book Campus Tour
            </button>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">

        {/* ========================================================== */}
        {/* TAB 1: ONLINE APPLICATION FORM WIZARD */}
        {/* ========================================================== */}
        {activeTab === 'apply' && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-10">
            {submittedApp ? (
              /* APPLICATION SUBMISSION CONFIRMATION */
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                  Application Successfully Registered
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 mb-2">
                  Welcome to Golden International School
                </h2>
                <p className="text-sm text-slate-600 max-w-lg mx-auto mb-6">
                  Your online admission application for <strong className="text-slate-900">{submittedApp.studentName}</strong> has been received by our Admissions Board.
                </p>

                {/* Reference Code Card */}
                <div className="bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-6 max-w-md mx-auto mb-8 text-center">
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
                    Your Application Reference Code
                  </span>
                  <div className="text-3xl font-mono font-black text-slate-900 tracking-wider my-1">
                    {submittedApp.appNumber}
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    Please keep this code safe. You can use it anytime to track your screening and entrance examination schedule.
                  </p>
                </div>

                {/* Next Steps List */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 max-w-xl mx-auto text-left mb-8 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-600" />
                    Next Steps for Admission
                  </h4>
                  <div className="flex items-start gap-3 text-xs text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-800 font-bold flex items-center justify-center shrink-0">1</span>
                    <span><strong>Document Verification:</strong> Our admissions committee is reviewing your uploaded academic records and birth certificate.</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-800 font-bold flex items-center justify-center shrink-0">2</span>
                    <span><strong>Entrance Examination Invitation:</strong> You will receive an SMS and email with your test date, Hall ticket, and venue details.</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-800 font-bold flex items-center justify-center shrink-0">3</span>
                    <span><strong>Oral Interview:</strong> Candidate and parents will meet with our faculty panel prior to provisional admission offer.</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setSearchCode(submittedApp.appNumber);
                      setActiveSearch(submittedApp.appNumber);
                      setActiveTab('status');
                    }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-md shadow-amber-500/20"
                  >
                    <Search className="w-4 h-4" />
                    Track Application Status Now
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    Print Application Slip
                  </button>
                </div>
              </div>
            ) : (
              /* MULTI-STEP APPLICATION FORM */
              <form onSubmit={handleApplySubmit} className="space-y-8">
                {/* Step Progress Tracker */}
                <div className="border-b border-slate-200 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                        Step {currentStep} of 4
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                        {currentStep === 1 && 'Applicant Student Profile'}
                        {currentStep === 2 && 'Parent & Guardian Information'}
                        {currentStep === 3 && 'Academic Records & Document Uploads'}
                        {currentStep === 4 && 'Review, Declarations & Submission'}
                      </h2>
                    </div>
                    <span className="text-xs font-medium text-slate-500">
                      All fields with (*) are mandatory
                    </span>
                  </div>

                  {/* Visual Step Progress Bar */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { num: 1, label: 'Student' },
                      { num: 2, label: 'Guardian' },
                      { num: 3, label: 'Documents' },
                      { num: 4, label: 'Submit' },
                    ].map((s) => (
                      <div key={s.num} className="space-y-1">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            currentStep >= s.num ? 'bg-amber-500' : 'bg-slate-200'
                          }`}
                        />
                        <span
                          className={`text-[10px] font-bold block truncate ${
                            currentStep >= s.num ? 'text-slate-900' : 'text-slate-400'
                          }`}
                        >
                          {s.num}. {s.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* STEP 1: STUDENT PROFILE */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Student Full Name (Surname First) *
                        </label>
                        <input
                          type="text"
                          name="studentName"
                          required
                          value={formData.studentName}
                          onChange={handleInputChange}
                          placeholder="e.g. Adeleke Chukwuemeka David"
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Date of Birth *
                        </label>
                        <input
                          type="date"
                          name="dob"
                          required
                          value={formData.dob}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Gender *
                        </label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-sm bg-white"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Intended Grade / Class for Admission *
                        </label>
                        <select
                          name="gradeApplied"
                          value={formData.gradeApplied}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-sm bg-white font-semibold"
                        >
                          {GRADES.map((g) => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Current or Last School Attended
                        </label>
                        <input
                          type="text"
                          name="previousSchool"
                          value={formData.previousSchool}
                          onChange={handleInputChange}
                          placeholder="e.g. Corona Primary School, Victoria Island"
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Blood Group & Genotype
                        </label>
                        <select
                          name="bloodGroup"
                          value={formData.bloodGroup}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-sm bg-white"
                        >
                          <option value="O+ / AA">O+ (AA)</option>
                          <option value="A+ / AA">A+ (AA)</option>
                          <option value="B+ / AA">B+ (AA)</option>
                          <option value="O+ / AS">O+ (AS)</option>
                          <option value="A+ / AS">A+ (AS)</option>
                          <option value="Other">Other / Pending Test</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Medical Allergies or Special Needs
                        </label>
                        <input
                          type="text"
                          name="medicalNotes"
                          value={formData.medicalNotes}
                          onChange={handleInputChange}
                          placeholder="e.g. Mild peanut allergy, asthma inhaler, or None"
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          if (!formData.studentName) {
                            toast.error('Please enter the student full name.');
                            return;
                          }
                          setCurrentStep(2);
                        }}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                      >
                        Proceed to Parent Info
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: PARENT & GUARDIAN */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Parent / Guardian Full Name *
                        </label>
                        <input
                          type="text"
                          name="parentName"
                          required
                          value={formData.parentName}
                          onChange={handleInputChange}
                          placeholder="e.g. Dr. Babatunde Adeleke"
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Relationship to Student *
                        </label>
                        <select
                          name="parentRelationship"
                          value={formData.parentRelationship}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-sm bg-white"
                        >
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Legal Guardian">Legal Guardian</option>
                          <option value="Sponsor">Sponsor</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Primary Mobile Phone *
                        </label>
                        <input
                          type="tel"
                          name="parentPhone"
                          required
                          value={formData.parentPhone}
                          onChange={handleInputChange}
                          placeholder="+234 803 456 7890"
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="parentEmail"
                          required
                          value={formData.parentEmail}
                          onChange={handleInputChange}
                          placeholder="babatunde.adeleke@example.com"
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-sm"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Residential Address *
                        </label>
                        <input
                          type="text"
                          name="parentAddress"
                          required
                          value={formData.parentAddress}
                          onChange={handleInputChange}
                          placeholder="15 Admiralty Way, Lekki Phase 1, Lagos"
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-sm"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Occupation / Place of Work
                        </label>
                        <input
                          type="text"
                          name="parentOccupation"
                          value={formData.parentOccupation}
                          onChange={handleInputChange}
                          placeholder="e.g. Consultant Surgeon, Lagos University Teaching Hospital"
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!formData.parentName || !formData.parentPhone || !formData.parentEmail) {
                            toast.error('Please enter parent name, phone number, and email.');
                            return;
                          }
                          setCurrentStep(3);
                        }}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                      >
                        Proceed to Documents
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: ACADEMIC & DOCUMENT UPLOADS */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <p className="text-xs text-slate-600">
                      Please upload clear digital scans of the applicant's credentials (PDF, PNG, or JPG formats, max 5MB each).
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {uploadedDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-amber-400 transition-colors bg-slate-50/50 flex flex-col justify-between"
                        >
                          <div>
                            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
                              <Upload className="w-6 h-6" />
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 mb-1">{doc.title} *</h4>
                            <p className="text-[11px] text-slate-500 font-mono truncate">{doc.name}</p>
                            <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Ready for submission ({doc.size})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => toast.success(`${doc.title} file verified.`)}
                            className="mt-4 text-[11px] font-semibold text-brand-600 hover:text-brand-800 underline block"
                          >
                            Replace File
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block mb-0.5">Physical Credentials Verification</span>
                        Original documents will be physically presented on the day of the entrance assessment for sighting and official seal verification.
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(4)}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                      >
                        Review Application
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: REVIEW & DECLARATION */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    {/* Summary Review Card */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                        Application Overview Summary
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Applicant Name</span>
                          <span className="font-bold text-slate-900 text-sm">{formData.studentName}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Applying For</span>
                          <span className="font-bold text-brand-700 text-sm">{formData.gradeApplied}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Date of Birth & Gender</span>
                          <span className="font-bold text-slate-900">{formData.dob || '14 May 2013'} ({formData.gender})</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Parent / Guardian</span>
                          <span className="font-bold text-slate-900">{formData.parentName} ({formData.parentRelationship})</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Phone Number</span>
                          <span className="font-bold text-slate-900">{formData.parentPhone}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Email Address</span>
                          <span className="font-bold text-slate-900">{formData.parentEmail}</span>
                        </div>
                      </div>
                    </div>

                    {/* Declaration Checkbox */}
                    <div className="p-4 rounded-xl border border-slate-300 bg-white">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="declarationAgreed"
                          checked={formData.declarationAgreed}
                          onChange={handleInputChange}
                          className="mt-1 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                        />
                        <span className="text-xs text-slate-700 leading-relaxed">
                          I, <strong>{formData.parentName || 'the parent/guardian'}</strong>, solemnly declare that all statements and records submitted in this application are accurate and genuine. I understand that falsification will lead to immediate forfeiture of admission.
                        </span>
                      </label>
                    </div>

                    <div className="flex justify-between pt-4">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Documents
                      </button>

                      <button
                        type="submit"
                        disabled={applyMutation.isPending || !formData.declarationAgreed}
                        className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-extrabold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {applyMutation.isPending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                            Registering Application...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Submit Admission Application
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 2: APPLICATION STATUS TRACKER */}
        {/* ========================================================== */}
        {activeTab === 'status' && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-10 space-y-8">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block mb-1">
                Real-Time Admissions Intelligence
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Track Application & Entrance Exam Status
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Enter your reference code (e.g. <button onClick={() => { setSearchCode('GIS-ADM-2026-7841'); setActiveSearch('GIS-ADM-2026-7841'); }} className="text-brand-600 underline font-semibold">GIS-ADM-2026-7841</button> or <button onClick={() => { setSearchCode('GIS-ADM-2026-8920'); setActiveSearch('GIS-ADM-2026-8920'); }} className="text-brand-600 underline font-semibold">GIS-ADM-2026-8920</button>) to view live screening milestones.
              </p>
            </div>

            {/* Reference Search Bar */}
            <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  placeholder="Enter reference number (e.g. GIS-ADM-2026-7841)"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-300 font-mono text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
              <button
                type="submit"
                disabled={isTracking}
                className="px-7 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors shadow-md shadow-slate-900/10 shrink-0"
              >
                {isTracking ? 'Searching...' : 'Check Status'}
              </button>
            </form>

            {isTracking ? (
              <div className="py-16 text-center">
                <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-500 font-medium">Looking up application records...</p>
              </div>
            ) : trackError ? (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-800">
                <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                <h3 className="font-bold text-base">Application Not Found</h3>
                <p className="text-xs text-rose-600 mt-1 max-w-md mx-auto">
                  {trackError.response?.data?.error || 'We could not find an application with that reference number. Try demo code GIS-ADM-2026-7841.'}
                </p>
              </div>
            ) : trackedApp ? (
              /* LIVE APPLICATION STATUS CARD */
              <div className="space-y-8">
                {/* Applicant Status Header Card */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-md border border-amber-400/20">
                        {trackedApp.appNumber}
                      </span>
                      <span className="text-slate-400 text-xs">•</span>
                      <span className="text-xs text-slate-300">{trackedApp.gradeApplied}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      {trackedApp.studentName}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Parent / Guardian: {trackedApp.parentName} ({trackedApp.parentPhone})
                    </p>
                  </div>

                  <div className="shrink-0 text-left md:text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 uppercase tracking-wider shadow-sm">
                      <Clock className="w-3.5 h-3.5" />
                      {trackedApp.status.replace('_', ' ')}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      Updated: {new Date().toLocaleDateString('en-GB')}
                    </p>
                  </div>
                </div>

                {/* Status Notice Banner */}
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900">
                  <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5">Admissions Board Directive</span>
                    {trackedApp.statusMessage}
                  </div>
                </div>

                {/* Examination Hall Slip (If Exam is Scheduled) */}
                {trackedApp.examDate && (
                  <div className="border-2 border-brand-200 bg-brand-50/40 rounded-2xl p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-200/60 pb-4 mb-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-100 px-2 py-0.5 rounded-md">
                          Official Examination Hall Ticket
                        </span>
                        <h4 className="text-base font-black text-slate-900 mt-1">
                          Diagnostic Entrance Assessment & Hall Schedule
                        </h4>
                      </div>
                      <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shrink-0"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print Hall Slip
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-bold block">Exam Date</span>
                        <span className="font-bold text-slate-900">{trackedApp.examDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-bold block">Assigned Time</span>
                        <span className="font-bold text-slate-900">{trackedApp.examTime}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-bold block">Examination Venue</span>
                        <span className="font-bold text-slate-900">{trackedApp.examVenue}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-bold block">Designated Seat</span>
                        <span className="font-mono font-black text-brand-700">{trackedApp.examSeatNumber || 'SEAT-A-042'}</span>
                      </div>
                    </div>

                    {trackedApp.subjectsTested && (
                      <div className="mt-4 pt-3 border-t border-brand-200/60 flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-bold text-slate-700">Test Papers:</span>
                        {trackedApp.subjectsTested.map((sub, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg bg-white border border-brand-200 font-semibold text-slate-800 text-[11px]">
                            {sub}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Admission Offer Letter (If Offer is Issued) */}
                {trackedApp.status === 'OFFER_ISSUED' && (
                  <div className="border-2 border-emerald-300 bg-emerald-50/50 rounded-2xl p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                          Admission Granted
                        </span>
                        <h4 className="text-lg font-black text-slate-900 mt-1">
                          Provisional Admission Offer Letter Ready
                        </h4>
                        <p className="text-xs text-slate-600 mt-1">
                          Acceptance deadline: <strong>{trackedApp.offerDeadline}</strong>. Download your formal offer letter and fee schedule below.
                        </p>
                      </div>
                      <button
                        onClick={() => toast.success('Provisional Admission Offer Letter downloaded.')}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm shrink-0"
                      >
                        <Download className="w-4 h-4" />
                        Download Offer Letter (PDF)
                      </button>
                    </div>
                  </div>
                )}

                {/* Stage Progression Timeline */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    Admissions Progression Pipeline
                  </h4>

                  <div className="space-y-4">
                    {trackedApp.stages?.map((stage, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                          stage.completed
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : stage.current
                            ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-400/20'
                            : 'bg-slate-50 border-slate-200 opacity-60'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            stage.completed
                              ? 'bg-emerald-600 text-white'
                              : stage.current
                              ? 'bg-amber-500 text-slate-950 font-black animate-pulse'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {stage.completed ? <Check className="w-4 h-4" /> : idx + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                            <h5 className="font-bold text-slate-900 text-sm">
                              {stage.name}
                            </h5>
                            <span className="text-[11px] font-semibold text-slate-500">
                              {stage.date}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {stage.note}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 3: BOOK CAMPUS TOUR / VISIT */}
        {/* ========================================================== */}
        {activeTab === 'visit' && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-10 space-y-8">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block mb-1">
                Experience Our World-Class Campus
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Schedule a Personalized Campus Tour
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                We invite prospective families to tour our sensory Early Years nursery, bright primary classrooms, Little Einsteins STEAM robotics corner, children's splash pool, and fenced play arena.
              </p>
            </div>

            {visitSubmitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-2">
                  Campus Visit Confirmed!
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
                  Thank you, <strong>{visitSubmitted.parentName}</strong>. A dedicated student ambassador has been assigned to host your family.
                </p>

                {/* Tour Slip Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 max-w-lg mx-auto text-left mb-6 space-y-3 text-xs">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Tour Date & Slot:</span>
                    <span className="font-bold text-slate-900">{visitSubmitted.visitDate} • {visitSubmitted.timeSlot}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Tour Guide Host:</span>
                    <span className="font-bold text-brand-700">{visitSubmitted.tourGuide}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Reception Meeting Point:</span>
                    <span className="font-bold text-slate-900">{visitSubmitted.meetingPoint}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Number of Attendees:</span>
                    <span className="font-bold text-slate-900">{visitSubmitted.attendeeCount} Visitors</span>
                  </div>
                </div>

                <button
                  onClick={() => setVisitSubmitted(null)}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                >
                  Book Another Tour
                </button>
              </div>
            ) : (
              <form onSubmit={handleVisitSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Parent / Guardian Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={visitForm.parentName}
                      onChange={(e) => setVisitForm({ ...visitForm, parentName: e.target.value })}
                      placeholder="e.g. Mrs. Funke Balogun"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={visitForm.parentEmail}
                      onChange={(e) => setVisitForm({ ...visitForm, parentEmail: e.target.value })}
                      placeholder="funke.balogun@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={visitForm.parentPhone}
                      onChange={(e) => setVisitForm({ ...visitForm, parentPhone: e.target.value })}
                      placeholder="+234 802 123 4567"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Number of Attendees
                    </label>
                    <select
                      value={visitForm.attendeeCount}
                      onChange={(e) => setVisitForm({ ...visitForm, attendeeCount: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-sm bg-white"
                    >
                      <option value={1}>1 Person</option>
                      <option value={2}>2 People (Parent + Child)</option>
                      <option value={3}>3 People (Both Parents + Child)</option>
                      <option value={4}>4+ People (Family Group)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Preferred Tour Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={visitForm.visitDate}
                      onChange={(e) => setVisitForm({ ...visitForm, visitDate: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Preferred Session Slot *
                    </label>
                    <select
                      value={visitForm.timeSlot}
                      onChange={(e) => setVisitForm({ ...visitForm, timeSlot: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-sm bg-white font-semibold"
                    >
                      {TIME_SLOTS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Grade / Level of Primary Interest
                    </label>
                    <select
                      value={visitForm.interestedGrade}
                      onChange={(e) => setVisitForm({ ...visitForm, interestedGrade: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-sm bg-white"
                    >
                      {GRADES.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <button
                    type="submit"
                    disabled={visitMutation.isPending}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-md shadow-amber-500/20"
                  >
                    {visitMutation.isPending ? 'Confirming Tour...' : 'Book My Campus Tour'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}
