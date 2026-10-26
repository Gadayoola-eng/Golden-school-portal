import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import AssignHomeworkModal from '../../components/homework/AssignHomeworkModal';
import { useToast } from '../../context/ToastContext';
import {
  BookOpen,
  Users,
  FileCheck2,
  Clock,
  Plus,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Award,
  CalendarCheck,
  CalendarDays,
  FileSpreadsheet,
  UserPlus
} from 'lucide-react';

export default function TeacherDashboard() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeInput, setGradeInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [gradeError, setGradeError] = useState(null);

  // Set & Publish Assignment State
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [assignTitle, setAssignTitle] = useState('');
  const [assignInstructions, setAssignInstructions] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('');
  const [assignPoints, setAssignPoints] = useState('100');
  const [publishError, setPublishError] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: async () => {
      const res = await api.get('/dashboard/teacher');
      return res.data;
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/assignments', payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['teacher-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['class-assignments'] });
      setIsPublishModalOpen(false);
      setAssignTitle('');
      setAssignInstructions('');
      setAssignDueDate('');
      setAssignPoints('100');
      setPublishError(null);
      toast.success(data?.message || 'Assignment published successfully to class!');
    },
    onError: (err) => {
      setPublishError(err.response?.data?.error || err.response?.data?.details?.[0]?.message || 'Failed to publish assignment.');
    },
  });

  const handleOpenPublishModal = (defaultClassId = '') => {
    const defaultClasses = data?.classes || [];
    const clsId = defaultClassId || (defaultClasses.length > 0 ? defaultClasses[0].id : '');
    setSelectedClassId(clsId);

    // Default due date: 7 days from now at 17:00
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(17, 0, 0, 0);
    const dateStr = nextWeek.toISOString().slice(0, 16);

    setAssignDueDate(dateStr);
    setAssignPoints('100');
    setPublishError(null);
    setIsPublishModalOpen(true);
  };

  const handlePublishAssignmentSubmit = (e) => {
    e.preventDefault();
    if (!selectedClassId) {
      setPublishError('Please select a class for this assignment.');
      return;
    }
    if (!assignTitle.trim() || !assignInstructions.trim() || !assignDueDate) {
      setPublishError('Please complete all required fields.');
      return;
    }

    publishMutation.mutate({
      classId: selectedClassId,
      title: assignTitle.trim(),
      instructions: assignInstructions.trim(),
      dueDate: new Date(assignDueDate).toISOString(),
      points: Number(assignPoints) || 100,
    });
  };

  const gradeMutation = useMutation({
    mutationFn: async ({ id, grade, feedback }) => {
      const res = await api.post(`/submissions/${id}/grade`, {
        grade: Number(grade),
        feedback,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-dashboard'] });
      setGradingSubmission(null);
      setGradeInput('');
      setFeedbackInput('');
      setGradeError(null);
    },
    onError: (err) => {
      setGradeError(err.response?.data?.error || 'Failed to submit grade.');
    },
  });

  const handleOpenGradeModal = (sub) => {
    setGradingSubmission(sub);
    setGradeInput(sub.grade !== null && sub.grade !== undefined ? String(sub.grade) : '');
    setFeedbackInput(sub.feedback || '');
    setGradeError(null);
  };

  const handleSubmitGrade = (e) => {
    e.preventDefault();
    if (!gradeInput || isNaN(gradeInput)) {
      setGradeError('Please enter a valid numeric score.');
      return;
    }
    gradeMutation.mutate({
      id: gradingSubmission.id,
      grade: gradeInput,
      feedback: feedbackInput,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
        Failed to load teacher dashboard. Please try refreshing.
      </div>
    );
  }

  const { stats, classes, pendingSubmissions } = data;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-brand-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-brand-500/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold text-brand-50 backdrop-blur-xs mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Teacher Portal
          </div>
          <h1 className="text-2xl font-bold">Faculty Dashboard</h1>
          <p className="text-brand-100 text-xs sm:text-sm mt-1">
            Monitor active classes, review student submissions, and update gradebooks.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleOpenPublishModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-sm shrink-0"
          >
            <FileCheck2 className="w-4 h-4" />
            Set & Publish Homework
          </button>
          <Link
            to="/teacher/attendance"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors backdrop-blur-xs shrink-0"
          >
            <CalendarCheck className="w-4 h-4" />
            Take Roll Call
          </Link>
          <Link
            to="/teacher/classes"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-brand-700 hover:bg-brand-50 font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            Manage Classes
          </Link>
        </div>
      </div>

      {/* Quick Shortcuts for Teachers */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Teacher Quick Shortcuts
            </h2>
            <p className="text-xs text-slate-500">Fast access to daily classroom tasks</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
          <button
            onClick={() => handleOpenPublishModal()}
            className="group text-left bg-gradient-to-br from-amber-50 to-amber-100/60 p-4 sm:p-5 rounded-2xl border-2 border-amber-300 hover:border-amber-500 shadow-xs hover:shadow-md transition-all flex items-center gap-3.5"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <FileCheck2 className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-950 group-hover:text-amber-700 transition-colors">
                Publish Homework
              </h3>
              <p className="text-[11px] text-slate-600 mt-0.5">Set task for any class</p>
            </div>
          </button>
          <Link
            to="/teacher/attendance"
            className="group bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-amber-400 shadow-xs hover:shadow-md transition-all flex items-center gap-3.5"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                Roll Call Register
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Mark daily morning attendance</p>
            </div>
          </Link>

          <Link
            to="/reports"
            className="group bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-amber-400 shadow-xs hover:shadow-md transition-all flex items-center gap-3.5"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                Terminal Reports
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">CA scores, exam grades & remarks</p>
            </div>
          </Link>

          <Link
            to="/teacher/classes"
            className="group bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-amber-400 shadow-xs hover:shadow-md transition-all flex items-center gap-3.5"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                My Class Subjects
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Lessons, homework & submissions</p>
            </div>
          </Link>

          <Link
            to="/timetable"
            className="group bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-amber-400 shadow-xs hover:shadow-md transition-all flex items-center gap-3.5"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                Timetable Schedule
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Weekly lesson periods</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Classes</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.totalClasses}</p>
          <span className="text-xs text-slate-500 mt-1 block">Active courses</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Students</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.totalStudents}</p>
          <span className="text-xs text-slate-500 mt-1 block">Total enrolled</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Assignments</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.totalAssignments}</p>
          <span className="text-xs text-slate-500 mt-1 block">Created tasks</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Needs Grading</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.pendingGradesCount}</p>
          <span className="text-xs text-amber-600 font-medium mt-1 block">Submissions pending</span>
        </div>
      </div>

      {/* Pending Submissions to Grade */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Submissions Awaiting Grading</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and grade recent submissions from your students.
            </p>
          </div>
          <Badge variant={pendingSubmissions.length > 0 ? 'warning' : 'success'}>
            {pendingSubmissions.length} Pending
          </Badge>
        </div>

        {pendingSubmissions.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">All caught up!</h3>
            <p className="text-xs text-slate-500 mt-1">There are no pending submissions waiting for grading.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900">{sub.studentName}</span>
                    <span className="text-[11px] text-slate-400">({sub.studentEmail})</span>
                  </div>
                  <p className="text-sm font-medium text-brand-700">{sub.assignmentTitle}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <span>{sub.className}</span>
                    <span>•</span>
                    <span>Submitted {new Date(sub.submittedAt).toLocaleDateString()} at {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {sub.hasFile && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600">
                        Attachment Included
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => handleOpenGradeModal(sub)}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs shrink-0"
                >
                  Grade Submission
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Classes Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Your Classes</h2>
            <p className="text-xs text-slate-500 mt-0.5">Quick access to manage assignments and roster.</p>
          </div>
          <Link
            to="/teacher/classes"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {classes.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">No classes created yet</p>
            <Link
              to="/teacher/classes"
              className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-brand-600 text-white text-xs font-semibold rounded-lg"
            >
              <Plus className="w-3.5 h-3.5" /> Create Your First Class
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-brand-300 hover:shadow-xs transition-all bg-white flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{cls.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {cls.description || 'No class description provided.'}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" /> {cls.studentCount} Students
                    </span>
                    <span className="flex items-center gap-1">
                      <FileCheck2 className="w-3.5 h-3.5 text-slate-400" /> {cls.assignmentCount} Assignments
                    </span>
                  </div>
                  <Link
                    to={`/teacher/classes/${cls.id}`}
                    className="text-brand-600 hover:text-brand-700 font-semibold"
                  >
                    Manage &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grade Submission Modal */}
      <Modal
        isOpen={!!gradingSubmission}
        onClose={() => setGradingSubmission(null)}
        title="Grade Submission"
      >
        {gradingSubmission && (
          <form onSubmit={handleSubmitGrade} className="space-y-4">
            {gradeError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {gradeError}
              </div>
            )}

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
              <p className="font-semibold text-slate-800">{gradingSubmission.assignmentTitle}</p>
              <p className="text-slate-500">Student: {gradingSubmission.studentName} ({gradingSubmission.studentEmail})</p>
              <p className="text-slate-500">Class: {gradingSubmission.className}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                Score (Points)
              </label>
              <input
                type="number"
                step="any"
                value={gradeInput}
                onChange={(e) => setGradeInput(e.target.value)}
                placeholder="e.g. 95"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                Teacher Feedback & Notes
              </label>
              <textarea
                rows={3}
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                placeholder="Provide constructive feedback for the student..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setGradingSubmission(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={gradeMutation.isPending}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {gradeMutation.isPending ? 'Saving...' : 'Save Grade'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Primary School Standard Homework Assignment Modal */}
      <AssignHomeworkModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        classes={classes}
        selectedClassId={selectedClassId}
        setSelectedClassId={setSelectedClassId}
        onSubmit={(payload) => publishMutation.mutate(payload)}
        isPending={publishMutation.isPending}
        error={publishError}
      />
    </div>
  );
}
