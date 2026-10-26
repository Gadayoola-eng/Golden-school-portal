import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import AssignHomeworkModal from '../../components/homework/AssignHomeworkModal';
import {
  BookOpen,
  Users,
  FileCheck2,
  Plus,
  ArrowLeft,
  Calendar,
  Award,
  UserPlus,
  Trash2,
  AlertCircle,
  BookMarked,
} from 'lucide-react';

export default function ClassDetail() {
  const { id: classId } = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('assignments'); // 'assignments' | 'roster'

  // Create Assignment state
  const [isCreateAssignOpen, setIsCreateAssignOpen] = useState(false);
  const [assignTitle, setAssignTitle] = useState('');
  const [assignInstructions, setAssignInstructions] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('');
  const [assignPoints, setAssignPoints] = useState('100');
  const [assignError, setAssignError] = useState(null);

  // Enroll Student state
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');
  const [enrollError, setEnrollError] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['class-detail', classId],
    queryFn: async () => {
      const res = await api.get(`/classes/${classId}`);
      return res.data;
    },
  });

  const { data: assignmentsData } = useQuery({
    queryKey: ['class-assignments', classId],
    queryFn: async () => {
      const res = await api.get(`/assignments/class/${classId}`);
      return res.data;
    },
  });

  // Create Assignment Mutation
  const createAssignMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/assignments', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-assignments', classId] });
      queryClient.invalidateQueries({ queryKey: ['class-detail', classId] });
      queryClient.invalidateQueries({ queryKey: ['teacher-dashboard'] });
      setIsCreateAssignOpen(false);
      setAssignTitle('');
      setAssignInstructions('');
      setAssignDueDate('');
      setAssignPoints('100');
      setAssignError(null);
    },
    onError: (err) => {
      setAssignError(err.response?.data?.error || err.response?.data?.details?.[0]?.message || 'Failed to create assignment.');
    },
  });

  // Enroll Student Mutation
  const enrollMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post(`/classes/${classId}/enroll`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-detail', classId] });
      queryClient.invalidateQueries({ queryKey: ['teacher-dashboard'] });
      setIsEnrollOpen(false);
      setStudentEmail('');
      setEnrollError(null);
    },
    onError: (err) => {
      setEnrollError(err.response?.data?.error || 'Failed to enroll student.');
    },
  });

  // Unenroll Student Mutation
  const unenrollMutation = useMutation({
    mutationFn: async (studentId) => {
      await api.delete(`/classes/${classId}/enroll/${studentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-detail', classId] });
      queryClient.invalidateQueries({ queryKey: ['teacher-dashboard'] });
    },
  });

  const handleCreateAssign = (e) => {
    e.preventDefault();
    if (!assignTitle.trim() || !assignInstructions.trim() || !assignDueDate) {
      setAssignError('Please complete all required fields.');
      return;
    }
    createAssignMutation.mutate({
      classId,
      title: assignTitle,
      instructions: assignInstructions,
      dueDate: new Date(assignDueDate).toISOString(),
      points: Number(assignPoints) || 100,
    });
  };

  const handleEnrollStudent = (e) => {
    e.preventDefault();
    if (!studentEmail.trim()) {
      setEnrollError('Please enter a student email.');
      return;
    }
    enrollMutation.mutate({ studentEmail: studentEmail.trim() });
  };

  const handleRemoveStudent = (student) => {
    if (window.confirm(`Remove ${student.name} from this class roster?`)) {
      unenrollMutation.mutate(student.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (error || !data?.class) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
        Class not found or access denied.
      </div>
    );
  }

  const cls = data.class;
  const assignments = assignmentsData?.assignments || cls.assignments || [];
  const roster = cls.roster || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Button & Header */}
      <div>
        <Link
          to="/teacher/classes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Classes
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{cls.name}</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              {cls.description || 'No class description provided.'}
            </p>
          </div>
          <Link
            to={`/teacher/classes/${classId}/gradebook`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-50 text-brand-700 hover:bg-brand-100 font-semibold text-xs sm:text-sm rounded-xl transition-colors border border-brand-200 shrink-0"
          >
            <BookMarked className="w-4 h-4" />
            Class Gradebook
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'assignments'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            Assignments ({assignments.length})
          </button>
          <button
            onClick={() => setActiveTab('roster')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'roster'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            Roster & Students ({roster.length})
          </button>
        </nav>
      </div>

      {/* TAB CONTENT: ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">Assignments</h2>
            <button
              onClick={() => setIsCreateAssignOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" /> Create Assignment
            </button>
          </div>

          {assignments.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center">
              <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No assignments created yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Post assignments with instructions, points, and due dates for your students.
              </p>
              <button
                onClick={() => setIsCreateAssignOpen(true)}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 text-white text-xs font-semibold rounded-lg hover:bg-brand-700"
              >
                <Plus className="w-3.5 h-3.5" /> Post First Assignment
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {assignments.map((assign) => (
                <div
                  key={assign.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-brand-300 p-5 shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{assign.title}</h3>
                      <Badge variant="primary">{assign.points} pts</Badge>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{assign.instructions}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Due: {new Date(assign.dueDate).toLocaleDateString()} at {new Date(assign.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {assign.submissionCount !== undefined && (
                        <span>
                          {assign.submissionCount} submissions ({assign.gradedCount || 0} graded)
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    to={`/teacher/assignments/${assign.id}`}
                    className="px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-xs rounded-xl transition-colors border border-brand-200 shrink-0"
                  >
                    View Submissions &rarr;
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: ROSTER */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800">Enrolled Students</h2>
              <p className="text-xs text-slate-500 mt-0.5">Students who have access to submit work in this course.</p>
            </div>
            <button
              onClick={() => setIsEnrollOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
            >
              <UserPlus className="w-4 h-4" /> Enroll Student
            </button>
          </div>

          {roster.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No students enrolled yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Enroll students by their email or students can self-enroll from their portal.
              </p>
              <button
                onClick={() => setIsEnrollOpen(true)}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 text-white text-xs font-semibold rounded-lg hover:bg-brand-700"
              >
                <UserPlus className="w-3.5 h-3.5" /> Add Student
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Enrolled Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {roster.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs">
                          {student.name?.[0]?.toUpperCase() || 'S'}
                        </div>
                        {student.name}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{student.email}</td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(student.enrolledAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleRemoveStudent(student)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove from roster"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PRIMARY SCHOOL STANDARD CREATE ASSIGNMENT MODAL */}
      <AssignHomeworkModal
        isOpen={isCreateAssignOpen}
        onClose={() => setIsCreateAssignOpen(false)}
        classes={[{ id: classId, name: cls.name, studentCount: cls.enrollments?.length || 0 }]}
        selectedClassId={classId}
        setSelectedClassId={() => {}}
        onSubmit={(payload) => createAssignMutation.mutate(payload)}
        isPending={createAssignMutation.isPending}
        error={assignError}
      />

      {/* ENROLL STUDENT MODAL */}
      <Modal
        isOpen={isEnrollOpen}
        onClose={() => setIsEnrollOpen(false)}
        title="Enroll Student"
      >
        <form onSubmit={handleEnrollStudent} className="space-y-4">
          {enrollError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {enrollError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
              Student Email Address
            </label>
            <input
              type="email"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              placeholder="e.g. pupil@goldenschool.edu"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Enter the registered email of the student you want to add to this course.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEnrollOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={enrollMutation.isPending}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {enrollMutation.isPending ? 'Enrolling...' : 'Enroll in Class'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
