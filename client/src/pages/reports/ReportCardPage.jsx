import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';
import {
  Award,
  GraduationCap,
  Printer,
  Calendar,
  CheckCircle2,
  TrendingUp,
  UserCheck,
  ShieldCheck,
  Star,
  FileSpreadsheet,
  AlertCircle,
  Building2,
  ChevronDown,
  KeyRound,
  Users,
  Search,
  Sparkles,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

// Reusable Grade Badge helper
function getGradeBadge(grade) {
  if (grade === 'A+' || grade === 'A') {
    return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  }
  if (grade === 'B+' || grade === 'B') {
    return 'bg-blue-100 text-blue-800 border-blue-300';
  }
  if (grade === 'C') {
    return 'bg-amber-100 text-amber-800 border-amber-300';
  }
  return 'bg-rose-100 text-rose-800 border-rose-300';
}

// Reusable Official Report Card Sheet Component
function OfficialReportSheet({ report, tokenNumber, admissionNumber, studentName, childIndex, totalChildren }) {
  if (!report) return null;

  return (
    <div
      id={`report-sheet-${report.studentId || childIndex}`}
      className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm p-6 sm:p-10 print:border-none print:shadow-none print:p-0 print:break-after-page mb-10 last:mb-0 relative"
    >
      {/* Multi-child sequence tag (screen only) */}
      {totalChildren && totalChildren > 1 && (
        <div className="print:hidden mb-4 flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-amber-50/70 border border-amber-200">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
              {childIndex}
            </span>
            <span className="text-xs font-bold text-slate-800">
              Child {childIndex} of {totalChildren}: <span className="text-amber-800 font-extrabold">{studentName || report.studentName}</span>
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500">
              Student ID: <strong className="font-mono text-slate-900">{admissionNumber || report.admissionNumber}</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md font-mono font-bold">
              Token PIN: {tokenNumber || report.tokenNumber}
            </span>
          </div>
        </div>
      )}

      {/* Institution Header */}
      <div className="border-b-2 border-slate-800 pb-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <img
              src="/logo.png"
              alt="Golden International School Crest"
              className="w-16 h-16 object-contain drop-shadow-sm shrink-0"
            />
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight uppercase">
                Golden International School
              </h2>
              <p className="text-xs font-semibold text-amber-700 tracking-widest uppercase">
                The Word: Psalm 119:105 • Excellence & Discipline
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Odo - Iro Street, Ido-Ekiti, Ekiti State • Tel: 08062392750, 07069591713
              </p>
            </div>
          </div>
          <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-6 shrink-0">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-900 text-white mb-1">
              Terminal Evaluation
            </span>
            <p className="text-xs font-bold text-slate-700">{report.termTitle}</p>
            <p className="text-[11px] text-slate-500">Issued: {report.issuedDate}</p>
          </div>
        </div>
      </div>

      {/* Student Profile Information Grid */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">
              Student Full Name
            </span>
            <span className="font-bold text-slate-900 text-sm">
              {studentName || report.studentName}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">
              Unique Student / ID No.
            </span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {admissionNumber || report.admissionNumber}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">
              Unique Result Token PIN
            </span>
            <span className="font-mono font-extrabold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded text-sm inline-block">
              {tokenNumber || report.tokenNumber}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">
              Current Grade / Class
            </span>
            <span className="font-bold text-slate-900 text-sm">{report.classGrade}</span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">
              Class Position
            </span>
            <span className="font-extrabold text-amber-600 text-sm">
              {report.positionInClass}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">
              Attendance Record
            </span>
            <span className="font-bold text-slate-800">
              {report.daysPresent} of {report.schoolOpenedDays} Days ({((report.daysPresent / report.schoolOpenedDays) * 100).toFixed(1)}%)
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">
              Total Score & Aggregate
            </span>
            <span className="font-bold text-slate-800">
              {report.overallTotal} / {report.overallMax} ({report.overallPercentage}%)
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">
              Promotional Decision
            </span>
            <span className="font-bold text-emerald-700 uppercase tracking-wide">
              {report.decision}
            </span>
          </div>
        </div>
      </div>

      {/* Academic Subject Performance Table */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-amber-600" />
          Cognitive Domain & Subject Evaluation Matrix
        </h3>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-2 text-center">CA1 (20)</th>
                <th className="py-2.5 px-2 text-center">CA2 (20)</th>
                <th className="py-2.5 px-2 text-center">Exam (60)</th>
                <th className="py-2.5 px-2 text-center">Total (100)</th>
                <th className="py-2.5 px-2 text-center">Grade</th>
                <th className="py-2.5 px-2 text-center hidden md:table-cell">Class Avg</th>
                <th className="py-2.5 px-2 text-center hidden md:table-cell">Rank</th>
                <th className="py-2.5 px-3">Subject Teacher's Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report.subjects.map((sub, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    {sub.subjectName}
                  </td>
                  <td className="py-2.5 px-2 text-center text-slate-700 font-medium">{sub.ca1}</td>
                  <td className="py-2.5 px-2 text-center text-slate-700 font-medium">{sub.ca2}</td>
                  <td className="py-2.5 px-2 text-center text-slate-700 font-medium">{sub.exam}</td>
                  <td className="py-2.5 px-2 text-center font-bold text-slate-900">{sub.total}</td>
                  <td className="py-2.5 px-2 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getGradeBadge(
                        sub.grade
                      )}`}
                    >
                      {sub.grade}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-center text-slate-500 hidden md:table-cell">
                    {sub.classAverage || 75}%
                  </td>
                  <td className="py-2.5 px-2 text-center font-bold text-slate-700 hidden md:table-cell">
                    {sub.position}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 text-[11px] italic">
                    {sub.teacherRemark}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100/90 font-bold text-slate-900 border-t-2 border-slate-300">
                <td className="py-3 px-3 uppercase">Cumulative Aggregate</td>
                <td colSpan="3" className="py-3 px-2 text-center text-slate-600">
                  Overall: {report.overallTotal} / {report.overallMax}
                </td>
                <td className="py-3 px-2 text-center text-amber-700 text-sm">
                  {report.overallPercentage}%
                </td>
                <td className="py-3 px-2 text-center">
                  <span className="px-2 py-0.5 rounded text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
                    {report.overallGrade}
                  </span>
                </td>
                <td colSpan="3" className="py-3 px-3 text-right text-emerald-700 font-extrabold uppercase">
                  Grade Point: {report.gpa}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Affective & Psychomotor Traits Rubric */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Affective Traits */}
        <div className="border border-slate-200 rounded-xl p-4 bg-white">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-500" />
            Affective Behavior & Social Conduct (Scale 1–5)
          </h4>
          <div className="space-y-2 text-xs">
            {report.affectiveTraits.map((t, i) => (
              <div key={i} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-none">
                <span className="text-slate-600">{t.trait}</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                        star <= t.score
                          ? 'bg-amber-400 text-amber-950 font-extrabold'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {star}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Psychomotor Traits */}
        <div className="border border-slate-200 rounded-xl p-4 bg-white">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            Psychomotor Skills & Extracurricular Agility (Scale 1–5)
          </h4>
          <div className="space-y-2 text-xs">
            {report.psychomotorTraits.map((t, i) => (
              <div key={i} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-none">
                <span className="text-slate-600">{t.trait}</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                        star <= t.score
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {star}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Teacher & Principal Endorsement Stamp */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t-2 border-slate-200">
        {/* Form Teacher Remark */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Class Teacher's Assessment
          </span>
          <p className="text-xs text-slate-700 italic leading-relaxed mb-4">
            "{report.formTeacherRemark}"
          </p>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
            <span className="font-bold text-slate-900">{report.formTeacherName}</span>
            <span className="text-slate-400 text-[11px]">Class Teacher Signature Verified</span>
          </div>
        </div>

        {/* Principal Remark & Stamp */}
        <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200/60 relative overflow-hidden">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block mb-1">
            Founder & Administrative Head Endorsement
          </span>
          <p className="text-xs text-slate-700 italic leading-relaxed mb-4">
            "{report.principalRemark}"
          </p>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-amber-200/60">
            <div>
              <span className="font-bold text-slate-900 block">{report.principalName}</span>
              <span className="text-slate-500 text-[10px]">{report.principalTitle}</span>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white">
                SEAL CERTIFIED ✓
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Notice & Resumption */}
      <div className="mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
        <div>
          <span className="font-bold text-slate-700">Next Academic Term Resumption: </span>
          <span className="text-amber-800 font-semibold">{report.nextTermBegins}</span>
        </div>
        <div>
          <span>Unique Student ID: </span>
          <span className="font-mono font-bold text-slate-700">{admissionNumber || report.admissionNumber}</span>
          <span className="mx-2">•</span>
          <span>Result Token: </span>
          <span className="font-mono font-bold text-amber-700">{tokenNumber || report.tokenNumber}</span>
        </div>
      </div>
    </div>
  );
}

export default function ReportCardPage() {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active view: 'all' (all children on one page), 'single' (individual child), 'token' (scratch card checker)
  const initialView = searchParams.get('view') || (user?.role === 'PARENT' ? 'all' : 'single');
  const [activeView, setActiveView] = useState(initialView);
  const [selectedTerm, setSelectedTerm] = useState('Term 1');
  const [selectedChildId, setSelectedChildId] = useState('student-uuid-201');

  // Token checker form states
  const [inputAdmissionNumber, setInputAdmissionNumber] = useState('');
  const [inputTokenNumber, setInputTokenNumber] = useState('');
  const [tokenResultReport, setTokenResultReport] = useState(null);
  const [tokenError, setTokenError] = useState('');

  // Fetch available terms
  const { data: termsData } = useQuery({
    queryKey: ['reportTerms'],
    queryFn: async () => {
      const res = await api.get('/reports/terms');
      return res.data;
    },
  });

  // Query: All Wards Reports (for multi-child view)
  const { data: allWardsData, isLoading: isLoadingAll } = useQuery({
    queryKey: ['allWardsReports', selectedTerm],
    queryFn: async () => {
      const res = await api.get(`/reports/parent/all-reports?term=${selectedTerm}`);
      return res.data;
    },
    enabled: user?.role === 'PARENT' || user?.role === 'ADMIN',
  });

  // Query: Single Student Report
  const { data: singleReportData, isLoading: isLoadingSingle } = useQuery({
    queryKey: ['singleReportCard', selectedTerm, selectedChildId],
    queryFn: async () => {
      const res = await api.get(`/reports/student/my?term=${selectedTerm}&childId=${selectedChildId}`);
      return res.data;
    },
  });

  // Mutation: Token Verification Checker
  const verifyTokenMutation = useMutation({
    mutationFn: async ({ admissionNumber, tokenNumber, term }) => {
      const res = await api.post('/reports/verify-token', { admissionNumber, tokenNumber, term });
      return res.data;
    },
    onSuccess: (data) => {
      setTokenResultReport(data.report);
      setTokenError('');
    },
    onError: (err) => {
      setTokenError(err.response?.data?.error || 'Failed to verify token. Please check numbers.');
      setTokenResultReport(null);
    },
  });

  const handleVerifyTokenSubmit = (e) => {
    e.preventDefault();
    if (!inputAdmissionNumber || !inputTokenNumber) {
      setTokenError('Please enter both the Unique Student Number and Result Token PIN.');
      return;
    }
    verifyTokenMutation.mutate({
      admissionNumber: inputAdmissionNumber,
      tokenNumber: inputTokenNumber,
      term: selectedTerm,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const terms = termsData?.terms || [
    { id: 'Term 1', title: 'First Term (2025/2026 Academic Session)', isCurrent: true },
    { id: 'Term 2', title: 'Second Term (2025/2026 Academic Session)', isCurrent: false },
    { id: 'Term 3', title: 'Third Term (2024/2025 Academic Session)', isCurrent: false },
  ];

  const wardsList = allWardsData?.wards || [
    {
      studentId: 'student-uuid-201',
      studentName: 'Alex Mercer',
      admissionNumber: 'GIS/2024/0142',
      tokenNumber: 'TK-7841-92',
      grade: 'Primary 4 Gold (Basic 4)',
      report: singleReportData?.report,
    },
    {
      studentId: 'student-uuid-202',
      studentName: 'Elena Mercer',
      admissionNumber: 'GIS/2025/0289',
      tokenNumber: 'TK-5129-34',
      grade: 'Primary 2 Diamond (Basic 2)',
    },
    {
      studentId: 'student-uuid-203',
      studentName: 'Lucas Mercer',
      admissionNumber: 'GIS/2026/0405',
      tokenNumber: 'TK-9382-77',
      grade: 'Nursery 2 Sunshine (Early Years)',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 print:p-0 print:m-0 print:max-w-none">
      {/* Top Controls (Hidden on Print) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 inline-flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              Terminal Academic Assessment
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-500">
              Golden International School • Ido-Ekiti
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Terminal Report Cards & Scratch-Card Token Checker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            View certified continuous assessments, examination marks, and affective/psychomotor evaluation.
          </p>
        </div>

        {/* Term Dropdown & Print Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold py-2.5 pl-3.5 pr-8 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              {terms.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id}: {t.title.split('(')[0]}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print All / Save PDF</span>
          </button>
        </div>
      </div>

      {/* VIEW SELECTOR NAVIGATION BAR (Hidden on Print) */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-2 print:hidden">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* TAB 1: ALL CHILDREN ON ONE PAGE */}
          <button
            onClick={() => {
              setActiveView('all');
              setSearchParams({ view: 'all' });
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeView === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>All Children Reports (One-Page View)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeView === 'all' ? 'bg-slate-950 text-amber-300' : 'bg-slate-200 text-slate-700'
            }`}>
              {wardsList.length} Children
            </span>
          </button>

          {/* TAB 2: INDIVIDUAL CHILD REPORT */}
          <button
            onClick={() => {
              setActiveView('single');
              setSearchParams({ view: 'single' });
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeView === 'single'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Single Child View</span>
          </button>

          {/* TAB 3: TOKEN RESULT CHECKER */}
          <button
            onClick={() => {
              setActiveView('token');
              setSearchParams({ view: 'token' });
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeView === 'token'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Token PIN Scratch-Card Checker</span>
          </button>
        </div>

        {/* Quick jump to child in 'all' view */}
        {activeView === 'all' && (
          <div className="flex items-center gap-1.5 px-2 py-1 text-xs">
            <span className="text-[11px] font-bold text-slate-400">Quick Jump:</span>
            {wardsList.map((w, idx) => (
              <a
                key={w.studentId}
                href={`#report-sheet-${w.studentId}`}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 font-bold text-[11px] transition-colors"
              >
                {w.studentName.split(' ')[0]} ({w.admissionNumber.split('/')[2]})
              </a>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================== */}
      {/* VIEW 1: ALL 3 CHILDREN TERMINAL REPORTS ALL AT ONCE ON ONE PAGE */}
      {/* ========================================================== */}
      {activeView === 'all' && (
        <div className="space-y-8">
          {/* Header Summary Banner */}
          <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 text-white rounded-2xl p-6 shadow-md print:hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-amber-200 inline-block mb-1">
                  Multi-Child Family Terminal Overview
                </span>
                <h2 className="text-xl sm:text-2xl font-black">
                  All {wardsList.length} Wards Terminal Result Sheets
                </h2>
                <p className="text-xs text-amber-100 mt-1 max-w-xl">
                  Each child below is authenticated with their <strong>Unique Student ID Number</strong> and individual <strong>Result Token PIN</strong>. Scroll down or print all 3 reports together.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-black hover:bg-amber-50 shadow-md flex items-center gap-2"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-600" />
                  Print All {wardsList.length} Reports
                </button>
              </div>
            </div>

            {/* Quick Cards Row for the 3 children */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/20">
              {wardsList.map((w, idx) => (
                <div key={w.studentId} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/15">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                      Child #{idx + 1}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-amber-200">
                      PIN: {w.tokenNumber}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white mt-1.5">{w.studentName}</h4>
                  <p className="text-[11px] text-amber-100 font-mono">{w.admissionNumber}</p>
                  <p className="text-[10px] text-amber-200/80 mt-0.5">{w.grade}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sequential rendering of all report cards */}
          {isLoadingAll ? (
            <div className="p-16 text-center bg-white rounded-2xl border border-slate-200">
              <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-500 font-medium">Loading certified terminal reports for all children...</p>
            </div>
          ) : (
            wardsList.map((ward, idx) => (
              <OfficialReportSheet
                key={ward.studentId}
                report={ward.report || singleReportData?.report}
                tokenNumber={ward.tokenNumber}
                admissionNumber={ward.admissionNumber}
                studentName={ward.studentName}
                childIndex={idx + 1}
                totalChildren={wardsList.length}
              />
            ))
          )}
        </div>
      )}

      {/* ========================================================== */}
      {/* VIEW 2: INDIVIDUAL CHILD VIEW (WITH CHILD SELECTOR TABS) */}
      {/* ========================================================== */}
      {activeView === 'single' && (
        <div className="space-y-6">
          {/* Child Selector Tabs (Hidden on Print) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs print:hidden">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Select Child to View:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {wardsList.map((w) => {
                const isSelected = selectedChildId === w.studentId;
                return (
                  <button
                    key={w.studentId}
                    onClick={() => setSelectedChildId(w.studentId)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/30'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-slate-900">{w.studentName}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 font-bold">
                        {w.tokenNumber}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-500">{w.admissionNumber}</p>
                    <p className="text-[10px] font-medium text-amber-700 mt-0.5">{w.grade}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {isLoadingSingle ? (
            <div className="p-16 text-center bg-white rounded-2xl border border-slate-200">
              <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-500 font-medium">Generating official terminal report sheet...</p>
            </div>
          ) : (
            <OfficialReportSheet
              report={singleReportData?.report}
              tokenNumber={
                wardsList.find((w) => w.studentId === selectedChildId)?.tokenNumber ||
                singleReportData?.report?.tokenNumber
              }
              admissionNumber={
                wardsList.find((w) => w.studentId === selectedChildId)?.admissionNumber ||
                singleReportData?.report?.admissionNumber
              }
              studentName={
                wardsList.find((w) => w.studentId === selectedChildId)?.studentName ||
                singleReportData?.report?.studentName
              }
            />
          )}
        </div>
      )}

      {/* ========================================================== */}
      {/* VIEW 3: SCRATCH CARD / TOKEN PIN RESULT CHECKER */}
      {/* ========================================================== */}
      {activeView === 'token' && (
        <div className="space-y-6">
          {/* Token Form Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-amber-400 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800">
                  Golden Portal Authentication
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Terminal Result Token Scratch-Card Verification
                </h2>
                <p className="text-xs text-slate-500">
                  Enter the unique Student ID Number and the 9-character Result Token PIN provided on your term scratch slip.
                </p>
              </div>
            </div>

            {/* Quick Demo Test Buttons */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
              <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider block mb-2">
                ⚡ 1-Click Demo Fill for Eleanor Mercer's 3 Children:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setInputAdmissionNumber('GIS/2024/0142');
                    setInputTokenNumber('TK-7841-92');
                  }}
                  className="p-2.5 rounded-lg bg-white hover:bg-amber-50 border border-slate-200 text-left text-xs transition-colors hover:border-amber-400"
                >
                  <strong className="block text-slate-900">Alex Mercer (Primary 4)</strong>
                  <span className="font-mono text-[11px] text-slate-500">GIS/2024/0142 • TK-7841-92</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputAdmissionNumber('GIS/2025/0289');
                    setInputTokenNumber('TK-5129-34');
                  }}
                  className="p-2.5 rounded-lg bg-white hover:bg-amber-50 border border-slate-200 text-left text-xs transition-colors hover:border-amber-400"
                >
                  <strong className="block text-slate-900">Elena Mercer (Primary 2)</strong>
                  <span className="font-mono text-[11px] text-slate-500">GIS/2025/0289 • TK-5129-34</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputAdmissionNumber('GIS/2026/0405');
                    setInputTokenNumber('TK-9382-77');
                  }}
                  className="p-2.5 rounded-lg bg-white hover:bg-amber-50 border border-slate-200 text-left text-xs transition-colors hover:border-amber-400"
                >
                  <strong className="block text-slate-900">Lucas Mercer (Nursery 2)</strong>
                  <span className="font-mono text-[11px] text-slate-500">GIS/2026/0405 • TK-9382-77</span>
                </button>
              </div>
            </div>

            {/* Verification Form */}
            <form onSubmit={handleVerifyTokenSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Unique Student ID / Admission Number *
                  </label>
                  <input
                    type="text"
                    value={inputAdmissionNumber}
                    onChange={(e) => setInputAdmissionNumber(e.target.value)}
                    placeholder="e.g. GIS/2024/0142"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 font-mono text-sm uppercase focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Result Token PIN Number *
                  </label>
                  <input
                    type="text"
                    value={inputTokenNumber}
                    onChange={(e) => setInputTokenNumber(e.target.value)}
                    placeholder="e.g. TK-7841-92"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 font-mono text-sm uppercase focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              {tokenError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{tokenError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={verifyTokenMutation.isPending}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs sm:text-sm font-black bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md flex items-center justify-center gap-2"
              >
                {verifyTokenMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Token PIN...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-slate-950" />
                    <span>Verify Token & Unlock Terminal Result</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Verified Token Report Result */}
          {tokenResultReport && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs sm:text-sm font-black">
                    Token Validated: {tokenResultReport.studentName} ({tokenResultReport.admissionNumber})
                  </span>
                </div>
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Result Sheet
                </button>
              </div>

              <OfficialReportSheet
                report={tokenResultReport}
                tokenNumber={tokenResultReport.tokenNumber || inputTokenNumber}
                admissionNumber={tokenResultReport.admissionNumber || inputAdmissionNumber}
                studentName={tokenResultReport.studentName}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
