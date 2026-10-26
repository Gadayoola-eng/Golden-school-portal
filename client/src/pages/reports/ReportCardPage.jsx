import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';
import {
  Award,
  GraduationCap,
  Printer,
  Download,
  Calendar,
  CheckCircle2,
  TrendingUp,
  UserCheck,
  ShieldCheck,
  Star,
  FileSpreadsheet,
  AlertCircle,
  Building2,
  ChevronDown
} from 'lucide-react';

export default function ReportCardPage() {
  const { user } = useAuthStore();
  const [selectedTerm, setSelectedTerm] = useState('Term 1');

  // Fetch available terms
  const { data: termsData } = useQuery({
    queryKey: ['reportTerms'],
    queryFn: async () => {
      const res = await api.get('/reports/terms');
      return res.data;
    },
  });

  // Fetch student report card
  const { data: reportData, isLoading, error } = useQuery({
    queryKey: ['studentReportCard', selectedTerm],
    queryFn: async () => {
      const res = await api.get(`/reports/student/my?term=${selectedTerm}`);
      return res.data;
    },
  });

  const terms = termsData?.terms || [
    { id: 'Term 1', title: 'First Term (2025/2026 Academic Session)', isCurrent: true },
    { id: 'Term 2', title: 'Second Term (2025/2026 Academic Session)', isCurrent: false },
    { id: 'Term 3', title: 'Third Term (2024/2025 Academic Session)', isCurrent: false },
  ];

  const report = reportData?.report;

  const handlePrint = () => {
    window.print();
  };

  const getGradeBadge = (grade) => {
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
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 print:p-0 print:m-0 print:max-w-none">
      {/* Top Controls (Hidden on Print) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 inline-flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              Official Academic Records
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-500">Terminal Report Sheets</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Terminal Report Card & Result Checker
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            View certified terminal continuous assessments, examination aggregates, and affective development.
          </p>
        </div>

        {/* Term Dropdown & Print Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold py-2.5 pl-3.5 pr-8 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand-500 cursor-pointer"
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-sm shadow-brand-500/20"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200">
          <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">Generating official terminal report sheet...</p>
        </div>
      ) : !report ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <p className="text-base font-bold text-slate-800">Report Card Not Found</p>
          <p className="text-xs text-slate-500 mt-1">
            No terminal report card has been certified for {selectedTerm} yet.
          </p>
        </div>
      ) : (
        /* OFFICIAL REPORT CARD SHEET (PRINTS CLEANLY) */
        <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm p-6 sm:p-10 print:border-none print:shadow-none print:p-0">
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
                <span className="font-bold text-slate-900 text-sm">{report.studentName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">
                  Admission / ID No
                </span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {report.admissionNumber}
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
                <span className="font-extrabold text-brand-700 text-sm">
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
                  Punctuality Rate
                </span>
                <span className="font-bold text-slate-800">{report.daysPunctual} Days on time</span>
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
              <FileSpreadsheet className="w-4 h-4 text-brand-600" />
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
                        {sub.classAverage}%
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
                    <td className="py-3 px-2 text-center text-brand-700 text-sm">
                      {report.overallPercentage}%
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="px-2 py-0.5 rounded text-xs font-black bg-brand-100 text-brand-800 border border-brand-300">
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
                Principal & Head of School Endorsement
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
                    SEAL CERTIFIED
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Notice & Resumption */}
          <div className="mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
            <div>
              <span className="font-bold text-slate-700">Next Academic Term Resumption: </span>
              <span className="text-brand-700 font-semibold">{report.nextTermBegins}</span>
            </div>
            <div>
              <span>Official Document ID: </span>
              <span className="font-mono text-slate-400">GIS-REP-2026-9042</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
