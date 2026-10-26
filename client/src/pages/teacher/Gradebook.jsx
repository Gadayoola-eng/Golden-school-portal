import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import Badge from '../../components/Badge';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, BookMarked, Award, Users, FileCheck2, BarChart2, Download } from 'lucide-react';

export default function Gradebook() {
  const { classId } = useParams();
  const toast = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['class-gradebook', classId],
    queryFn: async () => {
      const res = await api.get(`/submissions/class/${classId}/gradebook`);
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
        Failed to load gradebook for this class.
      </div>
    );
  }

  const { class: cls, assignments, matrix } = data;

  // Calculate overall class average
  const percentages = matrix.map(m => m.overallPercentage).filter(p => p !== null);
  const classAvg = percentages.length > 0
    ? Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length)
    : null;

  const getLetterGrade = (pct) => {
    if (pct === null || pct === undefined) return 'N/A';
    if (pct >= 93) return 'A';
    if (pct >= 90) return 'A-';
    if (pct >= 87) return 'B+';
    if (pct >= 83) return 'B';
    if (pct >= 80) return 'B-';
    if (pct >= 77) return 'C+';
    if (pct >= 70) return 'C';
    if (pct >= 60) return 'D';
    return 'F';
  };

  const exportToCSV = () => {
    if (!matrix || matrix.length === 0) {
      toast.warning('No student data to export.');
      return;
    }

    try {
      const escape = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;

      // Build Headers
      const headers = [
        'Student Name',
        'Student Email',
        ...assignments.map(a => `${a.title} (${a.points} pts)`),
        'Total Earned Pts',
        'Total Possible Pts',
        'Overall Percentage',
        'Letter Grade',
      ];

      // Build Rows
      const rows = matrix.map((row) => {
        const assignmentScores = row.assignments.map(cell => {
          if (cell.isGraded) return `${cell.grade}/${cell.maxPoints}`;
          if (cell.hasSubmitted) return 'Submitted (Ungraded)';
          return 'Missing';
        });

        return [
          escape(row.student.name),
          escape(row.student.email),
          ...assignmentScores.map(escape),
          escape(row.totalEarned),
          escape(row.totalPossible),
          escape(row.overallPercentage !== null ? `${row.overallPercentage}%` : 'N/A'),
          escape(getLetterGrade(row.overallPercentage)),
        ].join(',');
      });

      const csvContent = [headers.map(escape).join(','), ...rows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const sanitizedClassName = (cls.name || 'class').replace(/[^a-zA-Z0-9_-]/g, '_');
      link.setAttribute('href', url);
      link.setAttribute('download', `${sanitizedClassName}_gradebook_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Gradebook CSV exported successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export CSV file.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <Link
          to={`/teacher/classes/${classId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Back to {cls.name}
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">Class Gradebook</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-0.5">{cls.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-brand-600 hover:border-brand-300 font-semibold text-xs shadow-xs transition-all hover:shadow-sm"
              title="Download gradebook as CSV"
            >
              <Download className="w-4 h-4 text-brand-600" />
              Export CSV
            </button>
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-center shadow-xs">
              <span className="text-[10px] font-semibold uppercase text-slate-400 block">Class Average</span>
              <span className="text-base font-bold text-brand-600">
                {classAvg !== null ? `${classAvg}%` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gradebook Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Master Grade Matrix</h2>
          <span className="text-xs text-slate-500">
            {matrix.length} Students • {assignments.length} Assignments
          </span>
        </div>

        {matrix.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No students are currently enrolled in this course.
          </div>
        ) : assignments.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No assignments have been created yet for this course.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sticky left-0 bg-slate-50 z-10 border-r border-slate-200 min-w-[200px]">
                    Student Name
                  </th>
                  {assignments.map((a) => (
                    <th key={a.id} className="py-3.5 px-4 text-center min-w-[130px] border-r border-slate-100">
                      <div className="font-bold text-slate-800 truncate max-w-[120px] mx-auto" title={a.title}>
                        {a.title}
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({a.points} pts)
                      </span>
                    </th>
                  ))}
                  <th className="py-3.5 px-4 text-center font-bold text-brand-700 min-w-[120px]">
                    Overall Grade
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {matrix.map((row) => (
                  <tr key={row.student.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Student Info */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900 sticky left-0 bg-white hover:bg-slate-50/70 z-10 border-r border-slate-200">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                          {row.student.name?.[0]?.toUpperCase() || 'S'}
                        </div>
                        <div className="truncate">
                          <span className="block truncate">{row.student.name}</span>
                          <span className="text-[10px] text-slate-400 block truncate">{row.student.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Assignment Columns */}
                    {row.assignments.map((cell) => {
                      return (
                        <td
                          key={cell.assignmentId}
                          className="py-3.5 px-4 text-center border-r border-slate-100"
                        >
                          {cell.isGraded ? (
                            <span className="inline-block px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                              {cell.grade} / {cell.maxPoints}
                            </span>
                          ) : cell.hasSubmitted ? (
                            <span className="inline-block px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 font-medium border border-amber-200 text-[11px]">
                              Submitted
                            </span>
                          ) : (
                            <span className="text-slate-300 font-medium">—</span>
                          )}
                        </td>
                      );
                    })}

                    {/* Overall Summary */}
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {row.overallPercentage !== null ? (
                        <div>
                          <span className={`text-sm ${
                            row.overallPercentage >= 90
                              ? 'text-emerald-600'
                              : row.overallPercentage >= 75
                              ? 'text-brand-600'
                              : row.overallPercentage >= 60
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}>
                            {row.overallPercentage}%
                          </span>
                          <span className="text-[10px] text-slate-400 block font-normal">
                            ({row.totalEarned}/{row.totalPossible})
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-normal">No grades</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
