import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import Badge from '../../components/Badge';
import { useToast } from '../../context/ToastContext';
import {
  BookOpen,
  Search,
  User,
  FileCheck2,
  ArrowRight,
  ArrowLeft,
  Award,
  Plus,
  Check,
  Calendar,
  Clock,
  Sparkles,
  AlertCircle,
  FileText
} from 'lucide-react';

export default function StudentClasses({ defaultBrowse = false }) {
  const { classId } = useParams();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState(defaultBrowse ? 'browse' : 'enrolled');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'DUE' | 'SUBMITTED' | 'GRADED'

  // Enrolled classes query
  const { data: enrolledData, isLoading: isEnrolledLoading } = useQuery({
    queryKey: ['student-enrolled-classes'],
    queryFn: async () => {
      const res = await api.get('/classes');
      return res.data;
    },
  });

  // Available classes query
  const { data: availableData, isLoading: isAvailableLoading } = useQuery({
    queryKey: ['available-classes'],
    queryFn: async () => {
      const res = await api.get('/classes/available');
      return res.data;
    },
  });

  // Single Class Details (when classId is present in URL)
  const { data: classDetailData, isLoading: isClassDetailLoading } = useQuery({
    queryKey: ['student-class-detail', classId],
    queryFn: async () => {
      const res = await api.get(`/classes/${classId}`);
      return res.data;
    },
    enabled: !!classId,
  });

  // Assignments for the selected class
  const { data: classAssignmentsData, isLoading: isClassAssignmentsLoading } = useQuery({
    queryKey: ['student-class-assignments', classId],
    queryFn: async () => {
      const res = await api.get(`/assignments/class/${classId}`);
      return res.data;
    },
    enabled: !!classId,
  });

  // Dashboard query to get all upcoming and pending assignments
  const { data: dashboardData } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: async () => {
      const res = await api.get('/dashboard/student');
      return res.data;
    },
  });

  // Enroll mutation
  const enrollMutation = useMutation({
    mutationFn: async (targetClassId) => {
      const res = await api.post(`/classes/${targetClassId}/enroll`);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['student-enrolled-classes'] });
      queryClient.invalidateQueries({ queryKey: ['available-classes'] });
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
      toast.success(data?.message || 'Enrolled in class successfully!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to enroll in class.');
    },
  });

  const enrolledClasses = enrolledData?.classes || [];
  const availableClasses = availableData?.classes || [];

  const filteredAvailable = availableClasses.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.teacher?.name && c.teacher.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const upcomingHomework = dashboardData?.upcomingAssignments || [];

  // =========================================================================
  // SPECIFIC CLASS DETAIL & ASSIGNMENTS VIEW (When classId is in URL)
  // =========================================================================
  if (classId) {
    if (isClassDetailLoading || isClassAssignmentsLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
        </div>
      );
    }

    const cls = classDetailData?.class;
    const assignments = classAssignmentsData?.assignments || cls?.assignments || [];

    if (!cls) {
      return (
        <div className="p-6 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm space-y-3">
          <p className="font-bold">Subject or Course Not Found</p>
          <Link
            to="/student/classes"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Subjects
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
        {/* Navigation back */}
        <div>
          <Link
            to="/student/classes"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Back to All My Subjects
          </Link>

          {/* Subject Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-brand-900 to-indigo-950 rounded-3xl p-6 sm:p-7 text-white shadow-md border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Primary 4 Subject Course
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">{cls.name}</h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
                {cls.description || 'Comprehensive lessons, learning materials, and homework exercises.'}
              </p>
              <div className="flex items-center gap-4 text-xs text-amber-200/90 font-medium mt-3">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  Educator: <strong>{cls.teacher?.name || 'Class Teacher'}</strong>
                </span>
                <span>•</span>
                <span>{assignments.length} Homework Tasks</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                to={`/student/classes/${classId}/grades`}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm"
              >
                <Award className="w-4 h-4" />
                View Subject Grades
              </Link>
            </div>
          </div>
        </div>

        {/* Assignments List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Homework & Assignment Tasks ({assignments.length})
              </h2>
              <p className="text-xs text-slate-500">
                Attempt each assignment before the due date to earn your continuous assessment points.
              </p>
            </div>
          </div>

          {assignments.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center">
              <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No homework posted yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Your teacher has not published any assignments for {cls.name} yet. Check back after your next class lesson!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {assignments.map((assign) => {
                const sub = assign.submission;
                const isGraded = sub && sub.grade !== null && sub.grade !== undefined;
                const hasSubmitted = assign.hasSubmitted || !!sub;
                const isPastDue = new Date() > new Date(assign.dueDate);

                return (
                  <div
                    key={assign.id}
                    className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 ${
                      isGraded
                        ? 'border-emerald-200 hover:border-emerald-300 bg-gradient-to-r from-white via-white to-emerald-50/30'
                        : hasSubmitted
                        ? 'border-blue-200 hover:border-blue-300 bg-gradient-to-r from-white via-white to-blue-50/30'
                        : isPastDue
                        ? 'border-rose-200 bg-rose-50/20'
                        : 'border-slate-200 hover:border-amber-400'
                    }`}
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-lg border border-brand-100">
                          {cls.name}
                        </span>
                        <Badge variant="warning">
                          {assign.points <= 10 ? `${assign.points} ⭐ Stars` : `${assign.points} Marks`}
                        </Badge>
                        {isGraded ? (
                          <Badge variant="success">Graded ✓ ({sub.grade}/{assign.points})</Badge>
                        ) : hasSubmitted ? (
                          <Badge variant="primary">Submitted (Under Review)</Badge>
                        ) : isPastDue ? (
                          <Badge variant="danger">Past Due</Badge>
                        ) : (
                          <Badge variant="warning">Homework Due</Badge>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        {assign.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                        {assign.instructions}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Due: <strong>{new Date(assign.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</strong> at {new Date(assign.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isGraded && sub?.feedback && (
                          <span className="text-emerald-700 font-semibold italic truncate max-w-md">
                            Remarks: "{sub.feedback}"
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center justify-end">
                      <Link
                        to={`/student/assignments/${assign.id}`}
                        className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs ${
                          isGraded
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : hasSubmitted
                            ? 'bg-brand-600 hover:bg-brand-700 text-white'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md active:scale-95'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        {isGraded
                          ? 'View Feedback & Score'
                          : hasSubmitted
                          ? 'Review / Update Answer'
                          : 'Attempt Homework Now →'}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN SUBJECTS & ALL HOMEWORK TASKS DASHBOARD (Default view)
  // =========================================================================
  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Subjects & Homework</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Access curriculum subjects, weekly homework tasks, attempt assignments, and view teacher feedback.
          </p>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('enrolled')}
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'enrolled'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            My Subjects ({enrolledClasses.length})
          </button>
          <button
            onClick={() => setActiveTab('homework')}
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'homework'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            All Homework & Tasks ({upcomingHomework.length})
          </button>
          <button
            onClick={() => setActiveTab('browse')}
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'browse'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Search className="w-4 h-4" />
            Browse Other Courses ({availableClasses.length})
          </button>
        </nav>
      </div>

      {/* =========================================================================
          TAB 1: ENROLLED SUBJECTS
      ========================================================================= */}
      {activeTab === 'enrolled' && (
        <div>
          {isEnrolledLoading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            </div>
          ) : enrolledClasses.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">You are not enrolled in any classes yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Explore available school subjects and join with one click to receive lessons and homework.
              </p>
              <button
                onClick={() => setActiveTab('browse')}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-xs font-semibold rounded-xl hover:bg-brand-700 transition-colors"
              >
                <Search className="w-4 h-4" /> Browse Available Classes
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {enrolledClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="bg-white rounded-3xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all p-5 sm:p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-700 text-white flex items-center justify-center font-bold text-base shadow-xs">
                        {cls.name.substring(0, 2).toUpperCase()}
                      </span>
                      <Badge variant="primary">{cls.assignmentCount || 0} Assignments</Badge>
                    </div>
                    <h2 className="text-base font-bold text-slate-900">{cls.name}</h2>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {cls.description || 'Full academic course syllabus and homework.'}
                    </p>
                    <p className="text-xs text-slate-600 mt-3 flex items-center gap-1.5 font-medium">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Teacher: <strong>{cls.teacher?.name || 'Faculty Member'}</strong>
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                    <Link
                      to={`/student/classes/${cls.id}`}
                      className="px-3 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl text-center transition-colors flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      Homework ({cls.assignmentCount || 0})
                    </Link>
                    <Link
                      to={`/student/classes/${cls.id}/grades`}
                      className="px-3 py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-xs rounded-xl text-center transition-colors flex items-center justify-center gap-1 border border-brand-200/60"
                    >
                      <Award className="w-3.5 h-3.5" /> My Grades
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: ALL HOMEWORK & TASKS (Unified Student Homework Feed)
      ========================================================================= */}
      {activeTab === 'homework' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Weekly Homework Tasks Across All Subjects
              </h2>
              <p className="text-xs text-slate-500">
                Click "Attempt Homework" to read instructions, type answers, or upload photos of your notebook.
              </p>
            </div>
          </div>

          {upcomingHomework.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center">
              <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No pending homework</h3>
              <p className="text-xs text-slate-400 mt-1">
                You have completed all assignments from your subject teachers!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {upcomingHomework.map((assign) => (
                <div
                  key={assign.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-amber-400 shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                        {assign.className}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {assign.points} Marks
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{assign.title}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Due: {new Date(assign.dueDate).toLocaleDateString()} at {new Date(assign.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <Link
                    to={`/student/assignments/${assign.id}`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-sm shrink-0 active:scale-95"
                  >
                    <FileText className="w-4 h-4" />
                    Attempt Homework Now →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: BROWSE & ENROLL IN COURSES
      ========================================================================= */}
      {activeTab === 'browse' && (
        <div className="space-y-4">
          <div className="max-w-md">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by class name or instructor..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {isAvailableLoading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            </div>
          ) : filteredAvailable.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
              No matching courses found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAvailable.map((cls) => (
                <div
                  key={cls.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between"
                >
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{cls.name}</h2>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {cls.description || 'No course syllabus description provided.'}
                    </p>
                    <div className="mt-3 text-xs text-slate-600 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-medium">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {cls.teacher?.name || 'Faculty Member'}
                      </span>
                      <span className="text-slate-400">{cls.studentCount} enrolled</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    {cls.isEnrolled ? (
                      <div className="w-full py-2 px-3 bg-emerald-50 text-emerald-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-emerald-200">
                        <Check className="w-4 h-4" /> Already Enrolled
                      </div>
                    ) : (
                      <button
                        onClick={() => enrollMutation.mutate(cls.id)}
                        disabled={enrollMutation.isPending}
                        className="w-full py-2 px-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" /> Enroll in Course
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
