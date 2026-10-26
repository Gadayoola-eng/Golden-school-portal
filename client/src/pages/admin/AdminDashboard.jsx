import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import {
  ShieldCheck,
  Users,
  GraduationCap,
  CreditCard,
  UserCheck,
  Calendar,
  Briefcase,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  DollarSign,
  TrendingUp,
  Download,
  Filter,
  Eye,
  Check,
  X,
  Mail,
  Phone,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  Printer,
  BookOpen,
  FileCheck2,
  Globe,
  CalendarCheck,
  FileSpreadsheet,
  UserPlus,
  Plus,
  Award,
  Newspaper,
  FileDown,
  Layers,
  ExternalLink
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('classes'); // 'classes' | 'admissions' | 'finance' | 'careers' | 'users' | 'visits' | 'website'
  const [admissionsFilter, setAdmissionsFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [statusActionModal, setStatusActionModal] = useState(null); // application to change status
  const [actionForm, setActionForm] = useState({
    status: 'EXAM_SCHEDULED',
    examDate: 'Saturday, April 18, 2026',
    examVenue: 'Campus Hall A (Gate 2)',
    examTime: '09:00 AM - 12:30 PM',
    examSeatNumber: 'SEAT-A-099',
    offerDeadline: 'Thursday, April 30, 2026',
    statusMessage: '',
  });

  // Admin Publish Assignment State
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishClassId, setPublishClassId] = useState('');
  const [publishTitle, setPublishTitle] = useState('');
  const [publishInstructions, setPublishInstructions] = useState('');
  const [publishDueDate, setPublishDueDate] = useState('');
  const [publishPoints, setPublishPoints] = useState('100');
  const [publishError, setPublishError] = useState(null);

  // 1. Fetch Executive Overview
  const { data: overviewData, isLoading: isOverviewLoading, refetch: refetchOverview } = useQuery({
    queryKey: ['adminOverview'],
    queryFn: async () => {
      const res = await api.get('/admin/overview');
      return res.data;
    },
  });

  // 2. Fetch Admissions Applications
  const { data: appsData, isLoading: isAppsLoading } = useQuery({
    queryKey: ['adminApplications', admissionsFilter],
    queryFn: async () => {
      const res = await api.get(`/admin/applications?status=${encodeURIComponent(admissionsFilter)}`);
      return res.data;
    },
  });

  // 3. Fetch Billing Invoices
  const { data: billingData } = useQuery({
    queryKey: ['adminBilling'],
    queryFn: async () => {
      const res = await api.get('/admin/billing');
      return res.data;
    },
  });

  // 4. Fetch Users Directory
  const { data: usersData } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const res = await api.get('/admin/users');
      return res.data;
    },
  });

  // 5. Fetch Career Candidates
  const { data: careersData } = useQuery({
    queryKey: ['adminCareers'],
    queryFn: async () => {
      const res = await api.get('/admin/careers');
      return res.data;
    },
  });

  // 6. Fetch Campus Visits
  const { data: visitsData } = useQuery({
    queryKey: ['adminVisits'],
    queryFn: async () => {
      const res = await api.get('/admissions/visits');
      return res.data;
    },
  });

  // 7. Fetch All Classes in School (Admin overall view)
  const { data: classesData } = useQuery({
    queryKey: ['adminClasses'],
    queryFn: async () => {
      const res = await api.get('/classes');
      return res.data;
    },
  });

  const adminPublishMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/assignments', payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || 'Assignment published successfully!');
      setIsPublishModalOpen(false);
      setPublishTitle('');
      setPublishInstructions('');
      setPublishDueDate('');
      setPublishPoints('100');
      setPublishError(null);
      queryClient.invalidateQueries(['adminClasses']);
      queryClient.invalidateQueries(['adminOverview']);
    },
    onError: (err) => {
      setPublishError(err.response?.data?.error || err.response?.data?.details?.[0]?.message || 'Failed to publish assignment.');
    },
  });

  const handleOpenPublishModal = (defaultClassId = '') => {
    const defaultClasses = classesData?.classes || [];
    const clsId = defaultClassId || (defaultClasses.length > 0 ? defaultClasses[0].id : '');
    setPublishClassId(clsId);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(17, 0, 0, 0);
    setPublishDueDate(nextWeek.toISOString().slice(0, 16));
    setPublishPoints('100');
    setPublishError(null);
    setIsPublishModalOpen(true);
  };

  const handlePublishSubmit = (e) => {
    e.preventDefault();
    if (!publishClassId) {
      setPublishError('Please select a class for this assignment.');
      return;
    }
    if (!publishTitle.trim() || !publishInstructions.trim() || !publishDueDate) {
      setPublishError('Please fill in all required fields.');
      return;
    }
    adminPublishMutation.mutate({
      classId: publishClassId,
      title: publishTitle.trim(),
      instructions: publishInstructions.trim(),
      dueDate: new Date(publishDueDate).toISOString(),
      points: Number(publishPoints) || 100,
    });
  };

  // Mutations
  const updateAppMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await api.patch(`/admin/applications/${id}`, payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Application updated successfully.');
      setStatusActionModal(null);
      queryClient.invalidateQueries(['adminApplications']);
      queryClient.invalidateQueries(['adminOverview']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to update application.');
    },
  });

  const markBillPaidMutation = useMutation({
    mutationFn: async (billId) => {
      const res = await api.patch(`/admin/billing/${billId}/status`, { status: 'PAID' });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Invoice marked as PAID.');
      queryClient.invalidateQueries(['adminBilling']);
      queryClient.invalidateQueries(['adminOverview']);
    },
  });

  const kpis = overviewData?.kpis || {
    totalStudents: 2,
    totalTeachers: 1,
    totalParents: 1,
    totalClasses: 2,
    totalRevenue: 850000,
    outstandingRevenue: 350000,
    attendanceRate: '98.5%',
    activeApplications: 3,
    confirmedVisits: 2,
    jobApplicants: 2,
  };

  const classes = classesData?.classes || [];
  const applications = appsData?.applications || [];
  const bills = billingData?.bills || [];
  const users = usersData?.users || [];
  const candidateApps = careersData?.applications || [];
  const campusVisits = visitsData?.visits || [];

  const filteredApps = applications.filter((app) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      app.studentName.toLowerCase().includes(q) ||
      app.appNumber.toLowerCase().includes(q) ||
      app.gradeApplied.toLowerCase().includes(q) ||
      app.parentName.toLowerCase().includes(q)
    );
  });

  const handleStatusSubmit = (e) => {
    e.preventDefault();
    if (!statusActionModal) return;

    let statusMsg = actionForm.statusMessage;
    if (!statusMsg) {
      if (actionForm.status === 'EXAM_SCHEDULED') {
        statusMsg = `Entrance Examination scheduled for ${actionForm.examDate} at ${actionForm.examVenue}. Seat: ${actionForm.examSeatNumber}.`;
      } else if (actionForm.status === 'OFFER_ISSUED') {
        statusMsg = `Provisional Admission Offer Letter issued. Deadline: ${actionForm.offerDeadline}.`;
      } else {
        statusMsg = `Application status updated to ${actionForm.status}.`;
      }
    }

    updateAppMutation.mutate({
      id: statusActionModal.id,
      payload: {
        ...actionForm,
        statusMessage: statusMsg,
      },
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Executive Header Card */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500 text-slate-950 flex items-center gap-1.5 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              Executive Command Console
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-amber-400 font-bold">2025/2026 Academic Session</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Administrative & Central Registrar Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Live oversight across student admissions, fee payments, daily attendance rates, faculty recruitment, and school operations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => handleOpenPublishModal()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm shrink-0"
          >
            <FileCheck2 className="w-4 h-4" />
            Set & Publish Homework
          </button>
          <Link
            to="/teacher/classes"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors shrink-0"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            All Classes
          </Link>
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors shrink-0"
          >
            <Globe className="w-4 h-4 text-emerald-400" />
            School Website
          </Link>
          <button
            onClick={() => {
              refetchOverview();
              queryClient.invalidateQueries();
              toast.success('Admin console data refreshed.');
            }}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors"
            title="Refresh All Real-Time Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Master Overall Shortcuts */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Administrator Master Quick Access
            </h2>
            <p className="text-xs text-slate-500">Universal portal management & direct website links</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <button
            onClick={() => handleOpenPublishModal()}
            className="group text-left bg-gradient-to-br from-amber-50 to-amber-100/60 p-4 rounded-2xl border-2 border-amber-300 hover:border-amber-500 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold mb-2 shadow-xs group-hover:scale-105 transition-transform">
              <FileCheck2 className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-950 group-hover:text-amber-800">Publish Homework</h3>
              <p className="text-[10px] text-slate-600 mt-0.5">Post task to any class</p>
            </div>
          </button>

          <Link
            to="/teacher/classes"
            className="group bg-white p-4 rounded-2xl border border-slate-200 hover:border-amber-400 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-2 shadow-xs group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-amber-600">Classes & Homework</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Edit classes & grades</p>
            </div>
          </Link>

          <Link
            to="/teacher/attendance"
            className="group bg-white p-4 rounded-2xl border border-slate-200 hover:border-amber-400 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-2 shadow-xs group-hover:scale-105 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-amber-600">Roll Call Register</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">School-wide attendance</p>
            </div>
          </Link>

          <Link
            to="/reports"
            className="group bg-white p-4 rounded-2xl border border-slate-200 hover:border-amber-400 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-2 shadow-xs group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-amber-600">Terminal Reports</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">CA scores & report cards</p>
            </div>
          </Link>

          <Link
            to="/billing"
            className="group bg-white p-4 rounded-2xl border border-slate-200 hover:border-amber-400 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-2 shadow-xs group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-amber-600">Tuition & Bursary</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Invoices & receipts</p>
            </div>
          </Link>

          <Link
            to="/"
            target="_blank"
            className="group bg-amber-500/10 p-4 rounded-2xl border border-amber-300 hover:border-amber-500 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-bold mb-2 shadow-xs group-hover:scale-105 transition-transform">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-950 group-hover:text-amber-700 flex items-center gap-1">
                Main Website <ExternalLink className="w-3 h-3" />
              </h3>
              <p className="text-[10px] text-slate-600 mt-0.5">Public school portal</p>
            </div>
          </Link>
        </div>
      </div>

      {/* KPI METRICS OVERVIEW (6 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Card 1: Students */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Students</span>
            <GraduationCap className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{kpis.totalStudents}</div>
          <span className="text-[10px] text-slate-500 block truncate">{kpis.totalClasses} Active Classes</span>
        </div>

        {/* Card 2: Faculty */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Faculty</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{kpis.totalTeachers}</div>
          <span className="text-[10px] text-slate-500 block truncate">1:12 Student Ratio</span>
        </div>

        {/* Card 3: Revenue Collected */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Fees Paid</span>
            <CreditCard className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            ₦{(kpis.totalRevenue / 1000).toLocaleString()}k
          </div>
          <span className="text-[10px] text-slate-500 block truncate">Collected Fees</span>
        </div>

        {/* Card 4: Attendance Rate */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Attendance</span>
            <UserCheck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{kpis.attendanceRate}</div>
          <span className="text-[10px] text-emerald-600 font-bold block truncate">Good Standing</span>
        </div>

        {/* Card 5: Admissions Applications */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Admissions</span>
            <FileText className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{kpis.activeApplications}</div>
          <span className="text-[10px] text-slate-500 block truncate">2026/2027 Pipeline</span>
        </div>

        {/* Card 6: Job Applicants */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Recruitment</span>
            <Briefcase className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-indigo-600">{kpis.jobApplicants}</div>
          <span className="text-[10px] text-slate-500 block truncate">CVs Under Review</span>
        </div>
      </div>

      {/* NAVIGATION TABS BAR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {[
          { id: 'classes', label: 'All Classes & Homework', icon: BookOpen, count: classes.length },
          { id: 'admissions', label: 'Admissions & Applications', icon: FileText, count: applications.length },
          { id: 'finance', label: 'Tuition & Invoicing', icon: CreditCard, count: bills.length },
          { id: 'careers', label: 'Faculty Recruitment (ATS)', icon: Briefcase, count: candidateApps.length },
          { id: 'visits', label: 'Campus Tour Bookings', icon: Calendar, count: campusVisits.length },
          { id: 'website', label: 'Website CMS & Portal', icon: Globe, count: 5 },
          { id: 'users', label: 'Users & Roles Directory', icon: Users, count: users.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4 text-amber-400" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================== */}
      {/* TAB 0: ALL CLASSES & HOMEWORK MANAGEMENT (Admin Overall View) */}
      {/* ========================================================== */}
      {activeTab === 'classes' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  School Classes, Subjects & Homework Registry
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Publish assignments, inspect student submission progress, and review gradebooks for all academic courses.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenPublishModal()}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Plus className="w-4 h-4" /> Publish Homework
                </button>
                <Link
                  to="/teacher/classes"
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors"
                >
                  Full Classes Console &rarr;
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold bg-slate-50/50">
                    <th className="py-3 px-4">Class / Subject</th>
                    <th className="py-3 px-4">Assigned Teacher</th>
                    <th className="py-3 px-3">Enrolled Pupils</th>
                    <th className="py-3 px-3">Published Tasks</th>
                    <th className="py-3 px-3">Created</th>
                    <th className="py-3 px-4 text-right">Master Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classes.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-10 text-center text-slate-400">
                        No classes found in registry.
                      </td>
                    </tr>
                  ) : (
                    classes.map((cls) => (
                      <tr key={cls.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block text-sm">{cls.name}</span>
                          <span className="text-[11px] text-slate-400 truncate max-w-xs block">
                            {cls.description || 'No course syllabus'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-brand-700">
                          {cls.teacher?.name || 'Class Teacher'}
                          <span className="text-[10px] text-slate-400 block font-normal">{cls.teacher?.email}</span>
                        </td>
                        <td className="py-3.5 px-3 font-bold text-slate-800">
                          {cls.studentCount} Pupils
                        </td>
                        <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px]">
                            {cls.assignmentCount} Homeworks
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-400 text-[11px]">
                          {cls.createdAt?.split('T')[0] || 'Active'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenPublishModal(cls.id)}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-[11px] shadow-2xs"
                              title="Set new homework for this class"
                            >
                              + Set Homework
                            </button>
                            <Link
                              to={`/teacher/classes/${cls.id}`}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px]"
                            >
                              Inspect Class
                            </Link>
                            <Link
                              to={`/teacher/classes/${cls.id}/gradebook`}
                              className="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-lg text-[11px] border border-brand-200/60"
                            >
                              Gradebook
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 1: ADMISSIONS MANAGEMENT & CANDIDATE PIPELINE */}
      {/* ========================================================== */}
      {activeTab === 'admissions' && (
        <div className="space-y-6">
          {/* Sub-Filters and Search */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['All', 'SUBMITTED', 'EXAM_SCHEDULED', 'OFFER_ISSUED', 'ADMITTED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setAdmissionsFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                    admissionsFilter === status
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {status === 'ALL' ? 'All Applications' : status.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidate name, ID, grade..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Ref Code</th>
                    <th className="py-3.5 px-4">Applicant Student</th>
                    <th className="py-3.5 px-3">Grade Applied</th>
                    <th className="py-3.5 px-3">Parent Contact</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-3">Submitted</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400">
                        No admissions applications match your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredApps.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-brand-700">
                          {app.appNumber}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {app.studentName}
                          <span className="block text-[10px] text-slate-400 font-normal">
                            DOB: {app.dob} • {app.gender}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-slate-700">
                          {app.gradeApplied}
                        </td>
                        <td className="py-3.5 px-3 text-slate-600">
                          <span className="font-medium text-slate-900 block">{app.parentName}</span>
                          <span className="text-[11px] text-slate-400">{app.parentPhone}</span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              app.status === 'OFFER_ISSUED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : app.status === 'EXAM_SCHEDULED'
                                ? 'bg-blue-100 text-blue-800'
                                : app.status === 'ADMITTED'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
                            {app.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-500 text-[11px]">
                          {app.submittedAt?.split('T')[0] || '15 Mar 2026'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedApp(app)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
                            >
                              View Slip
                            </button>
                            <button
                              onClick={() => {
                                setStatusActionModal(app);
                                setActionForm({
                                  status: app.status === 'SUBMITTED' ? 'EXAM_SCHEDULED' : 'OFFER_ISSUED',
                                  examDate: 'Saturday, April 18, 2026',
                                  examVenue: 'Campus Hall A (Gate 2)',
                                  examTime: '09:00 AM - 12:30 PM',
                                  examSeatNumber: 'SEAT-A-042',
                                  offerDeadline: 'Thursday, April 30, 2026',
                                  statusMessage: '',
                                });
                              }}
                              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px]"
                            >
                              Manage Status
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 2: TUITION INVOICING & FINANCIAL MANAGEMENT */}
      {/* ========================================================== */}
      {activeTab === 'finance' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Student Tuition & Billing Ledger
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Termly tuition invoices, laboratory fees, and payment receipt verifications.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                  Total Paid: ₦{(kpis.totalRevenue).toLocaleString()}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800">
                  Pending: ₦{(kpis.outstandingRevenue).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                    <th className="py-3 px-4">Invoice No</th>
                    <th className="py-3 px-4">Student & Class</th>
                    <th className="py-3 px-4">Fee Description</th>
                    <th className="py-3 px-3">Amount (₦)</th>
                    <th className="py-3 px-3">Due Date</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {bill.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {bill.studentName || 'Alex Mercer'}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {bill.grade || 'Primary 4 Gold (Basic 4)'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {bill.title}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        ₦{(bill.amount || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {bill.dueDate?.split('T')[0] || '2026-04-30'}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            bill.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {bill.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {bill.status !== 'PAID' ? (
                          <button
                            onClick={() => markBillPaidMutation.mutate(bill.id)}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                          >
                            Mark as Paid
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-bold">
                            ✓ Verified & Receipted
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 3: FACULTY RECRUITMENT ATS (CAREERS) */}
      {/* ========================================================== */}
      {activeTab === 'careers' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                Job Applicant Tracking & Faculty CV Review
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review submitted candidate CVs, teaching qualifications, and years of experience.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                    <th className="py-3 px-4">Candidate Name</th>
                    <th className="py-3 px-4">Position Applied</th>
                    <th className="py-3 px-3">Experience</th>
                    <th className="py-3 px-3">Qualification</th>
                    <th className="py-3 px-3">CV File</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {candidateApps.map((cand) => (
                    <tr key={cand.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {cand.candidateName}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {cand.candidateEmail} • {cand.candidatePhone}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-brand-700">
                        {cand.jobTitle}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700">
                        {cand.yearsExperience} Years
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {cand.qualification}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-brand-600">
                        {cand.cvFileName}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                          {cand.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => toast.success(`Candidate ${cand.candidateName} shortlisted for oral interview.`)}
                          className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                        >
                          Shortlist Candidate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 4: CAMPUS TOUR BOOKINGS */}
      {/* ========================================================== */}
      {activeTab === 'visits' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                Booked Parent Walkthroughs & Campus Tours
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Assigned admissions ambassadors and prospective parent hospitality schedules.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                    <th className="py-3 px-4">Parent Name</th>
                    <th className="py-3 px-3">Tour Date & Slot</th>
                    <th className="py-3 px-3">Visitors</th>
                    <th className="py-3 px-3">Interested Grade</th>
                    <th className="py-3 px-4">Assigned Ambassador</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {campusVisits.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {v.parentName}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {v.parentEmail} • {v.parentPhone}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {v.visitDate}
                        <span className="block text-[10px] text-slate-500 font-normal">{v.timeSlot}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {v.attendeeCount} Attendees
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">
                        {v.interestedGrade}
                      </td>
                      <td className="py-3 px-4 text-brand-700 font-semibold">
                        {v.tourGuide}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 5: USERS & ROLES DIRECTORY */}
      {/* ========================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                Institutional User Accounts & Roles Directory
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Central credentials registry for Administrators, Teachers, Students, and Parents.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                    <th className="py-3 px-4">User Name</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Account ID</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {u.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {u.email}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'ADMIN'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'TEACHER'
                              ? 'bg-amber-100 text-amber-800'
                              : u.role === 'PARENT'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[10px] text-slate-400">
                        {u.id}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => toast.success(`Password reset link dispatched for ${u.email}.`)}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-800 underline"
                        >
                          Reset Credentials
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 6: WEBSITE CMS & PORTAL HUB */}
      {/* ========================================================== */}
      {activeTab === 'website' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Main School Website & Public CMS Hub
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct master access to public portal pages, announcements, curriculum downloads, and prospective acquisition links.
                </p>
              </div>
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs shrink-0"
              >
                <Globe className="w-4 h-4" /> Launch School Homepage <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                to="/"
                target="_blank"
                className="p-5 rounded-2xl border border-slate-200 hover:border-amber-400 shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Globe className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                    Official School Homepage
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Hero sections, Head of School & Proprietress greetings, value pillars, and WhatsApp contact gateway.
                  </p>
                </div>
                <span className="mt-4 text-xs font-bold text-amber-600 flex items-center gap-1">
                  Open Website <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </Link>

              <Link
                to="/news"
                target="_blank"
                className="p-5 rounded-2xl border border-slate-200 hover:border-amber-400 shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Newspaper className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                    News & School Highlights
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Termly announcements, awards, cultural festivals, academic victories, and press releases.
                  </p>
                </div>
                <span className="mt-4 text-xs font-bold text-amber-600 flex items-center gap-1">
                  View News Page <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </Link>

              <Link
                to="/downloads"
                target="_blank"
                className="p-5 rounded-2xl border border-slate-200 hover:border-amber-400 shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <FileDown className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                    Downloads & Academic Syllabi
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Student handbook, school calendar, textbook lists, admission forms, and fee breakdown brochures.
                  </p>
                </div>
                <span className="mt-4 text-xs font-bold text-amber-600 flex items-center gap-1">
                  View Downloads <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </Link>

              <Link
                to="/apply"
                target="_blank"
                className="p-5 rounded-2xl border border-slate-200 hover:border-amber-400 shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                    Public Admissions Application
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    5-step online enrollment form for Crèche, Nursery, and Primary 1-6 pupils.
                  </p>
                </div>
                <span className="mt-4 text-xs font-bold text-amber-600 flex items-center gap-1">
                  Open Apply Page <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </Link>

              <Link
                to="/careers"
                target="_blank"
                className="p-5 rounded-2xl border border-slate-200 hover:border-amber-400 shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                    Faculty Careers & Vacancies
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Job postings for educators, assistants, and administrative staff with online CV submission.
                  </p>
                </div>
                <span className="mt-4 text-xs font-bold text-amber-600 flex items-center gap-1">
                  View Careers Page <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* STATUS ACTION MODAL: Schedule Exam or Issue Offer */}
      {statusActionModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setStatusActionModal(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                  Candidate Pipeline Action
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Update {statusActionModal.studentName}
                </h3>
              </div>
              <button
                onClick={() => setStatusActionModal(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStatusSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Change Milestone Status To:
                </label>
                <select
                  value={actionForm.status}
                  onChange={(e) => setActionForm({ ...actionForm, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                >
                  <option value="EXAM_SCHEDULED">Schedule Diagnostic Entrance Exam</option>
                  <option value="OFFER_ISSUED">Issue Provisional Admission Offer</option>
                  <option value="ADMITTED">Enrolled / Admitted Scholar</option>
                  <option value="SUBMITTED">Reset to Screening (Under Review)</option>
                </select>
              </div>

              {actionForm.status === 'EXAM_SCHEDULED' && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Exam Date:</label>
                    <input
                      type="text"
                      value={actionForm.examDate}
                      onChange={(e) => setActionForm({ ...actionForm, examDate: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Venue:</label>
                      <input
                        type="text"
                        value={actionForm.examVenue}
                        onChange={(e) => setActionForm({ ...actionForm, examVenue: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Seat Code:</label>
                      <input
                        type="text"
                        value={actionForm.examSeatNumber}
                        onChange={(e) => setActionForm({ ...actionForm, examSeatNumber: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {actionForm.status === 'OFFER_ISSUED' && (
                <div className="space-y-3 bg-emerald-50/60 p-4 rounded-xl border border-emerald-200">
                  <div>
                    <label className="block font-bold text-emerald-900 mb-1">Acceptance Deadline:</label>
                    <input
                      type="text"
                      value={actionForm.offerDeadline}
                      onChange={(e) => setActionForm({ ...actionForm, offerDeadline: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-emerald-300"
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStatusActionModal(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateAppMutation.isPending}
                  className="px-6 py-2.5 rounded-xl font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-sm"
                >
                  {updateAppMutation.isPending ? 'Updating...' : 'Save & Notify Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPLICATION SLIP VIEW MODAL */}
      {selectedApp && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedApp(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="font-mono font-bold text-amber-700">{selectedApp.appNumber}</span>
              <button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-100 py-1">
                <span className="text-slate-400">Pupil / Candidate:</span>
                <span className="font-bold text-slate-900">{selectedApp.studentName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-1">
                <span className="text-slate-400">Grade Applied:</span>
                <span className="font-bold text-brand-700">{selectedApp.gradeApplied}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-1">
                <span className="text-slate-400">Parent / Phone:</span>
                <span className="font-bold text-slate-900">{selectedApp.parentName} ({selectedApp.parentPhone})</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-1">
                <span className="text-slate-400">Current Status:</span>
                <span className="font-bold uppercase text-amber-600">{selectedApp.status}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-1">
                <span className="text-slate-400">Previous School:</span>
                <span className="font-bold text-slate-700">{selectedApp.previousSchool}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Medical Notes:</span>
                <span className="font-bold text-slate-700">{selectedApp.medicalNotes}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white"
              >
                Close Slip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN SET & PUBLISH HOMEWORK MODAL */}
      <Modal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        title="Admin: Set & Publish Homework / Class Task"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handlePublishSubmit} className="space-y-4">
          {publishError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {publishError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
              Target Class / Subject
            </label>
            <select
              value={publishClassId}
              onChange={(e) => setPublishClassId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — Teacher: {c.teacher?.name || 'Assigned Staff'} ({c.studentCount} pupils)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
              Assignment Title
            </label>
            <input
              type="text"
              value={publishTitle}
              onChange={(e) => setPublishTitle(e.target.value)}
              placeholder="e.g. Mathematics: Long Division and Fractions Exercises"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
              Questions & Instructions
            </label>
            <textarea
              rows={4}
              value={publishInstructions}
              onChange={(e) => setPublishInstructions(e.target.value)}
              placeholder="Provide clear homework instructions for the pupils..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Submission Deadline
              </label>
              <input
                type="datetime-local"
                value={publishDueDate}
                onChange={(e) => setPublishDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Max Marks / Points
              </label>
              <input
                type="number"
                min="1"
                value={publishPoints}
                onChange={(e) => setPublishPoints(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsPublishModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={adminPublishMutation.isPending}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-sm transition-colors disabled:opacity-50"
            >
              {adminPublishMutation.isPending ? 'Publishing...' : 'Publish to Class Now'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
