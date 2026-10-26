import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import Badge from '../../components/Badge';
import { ArrowLeft, Award, CheckCircle2, Clock, XCircle, Calendar } from 'lucide-react';

export default function StudentGrades() {
  const { classId } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ['student-class-grades', classId],
    queryFn: async () => {
      const res = await api.get(`/submissions/class/${classId}/my-grades`);
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
        Failed to load class grades or you are not enrolled.
      </div>
    );
  }

  const { class: cls, grades, totalPointsEarned, totalGradedPossible, overallPercentage } = data;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header & Back Link */}
      <div>
        <Link
          to="/student/classes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Courses
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">Course Report</span>
            <h1 className="text-2xl font-bold text-slate-900 mt-0.5">{cls.name}</h1>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-xs flex items-center gap-4">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Overall Course Grade
              </span>
              <span className="text-xl font-extrabold text-brand-600">
                {overallPercentage !== null ? `${overallPercentage}%` : 'N/A'}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-xs text-slate-500">
              <span className="font-semibold text-slate-800">{totalPointsEarned}</span> / {totalGradedPossible} graded pts
            </div>
          </div>
        </div>
      </div>

      {/* Grades List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Assignment Breakdown</h2>
          <span className="text-xs text-slate-500">{grades.length} Total Assignments</span>
        </div>

        {grades.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No assignments exist for this course yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {grades.map((item) => (
              <div key={item.assignmentId} className="p-5 hover:bg-slate-50/70 transition-colors space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Due: {new Date(item.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    {item.isGraded ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                        {item.grade} / {item.maxPoints} pts ({item.percentage}%)
                      </span>
                    ) : item.hasSubmitted ? (
                      <Badge variant="warning">
                        <Clock className="w-3.5 h-3.5 mr-1 inline" /> Submitted (Pending Grade)
                      </Badge>
                    ) : (
                      <Badge variant="danger">
                        <XCircle className="w-3.5 h-3.5 mr-1 inline" /> Unsubmitted
                      </Badge>
                    )}
                  </div>
                </div>

                {item.feedback && (
                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-emerald-800 space-y-0.5">
                    <span className="font-semibold text-[11px] uppercase tracking-wider text-emerald-700 block">
                      Instructor Feedback:
                    </span>
                    <p className="whitespace-pre-wrap">{item.feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
