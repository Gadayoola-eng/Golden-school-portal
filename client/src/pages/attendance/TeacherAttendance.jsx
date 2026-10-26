import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
  Users,
  Save,
  CheckCheck,
  ChevronRight,
  BookOpen,
  AlertCircle
} from 'lucide-react';

export default function TeacherAttendance() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [rosterState, setRosterState] = useState([]);

  // Fetch teacher's classes
  const { data: classesData, isLoading: loadingClasses } = useQuery({
    queryKey: ['teacherClasses'],
    queryFn: async () => {
      const res = await api.get('/classes');
      return res.data;
    },
  });

  const classes = classesData?.classes || [];

  // Automatically select the first class once loaded
  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  // Fetch attendance for selected class and date
  const { data: attendanceData, isLoading: loadingAttendance, refetch } = useQuery({
    queryKey: ['classAttendance', selectedClassId, selectedDate],
    queryFn: async () => {
      if (!selectedClassId) return null;
      const res = await api.get(`/attendance/class/${selectedClassId}?date=${selectedDate}`);
      return res.data;
    },
    enabled: !!selectedClassId,
  });

  // Sync server roster with local editable state
  useEffect(() => {
    if (attendanceData?.roster) {
      setRosterState(
        attendanceData.roster.map(r => ({
          studentId: r.studentId,
          name: r.name,
          email: r.email,
          status: r.status === 'UNMARKED' ? 'PRESENT' : r.status,
          remarks: r.remarks || '',
        }))
      );
    }
  }, [attendanceData]);

  // Save attendance mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        date: selectedDate,
        records: rosterState.map(r => ({
          studentId: r.studentId,
          status: r.status,
          remarks: r.remarks,
        })),
      };
      const res = await api.post(`/attendance/class/${selectedClassId}`, payload);
      return res.data;
    },
    onSuccess: (data) => {
      addToast(data.message || 'Attendance saved successfully!', 'success');
      queryClient.invalidateQueries(['classAttendance', selectedClassId, selectedDate]);
      refetch();
    },
    onError: (err) => {
      addToast(err.response?.data?.error || 'Failed to save attendance records.', 'error');
    },
  });

  const handleStatusChange = (studentId, newStatus) => {
    setRosterState(prev =>
      prev.map(item =>
        item.studentId === studentId ? { ...item, status: newStatus } : item
      )
    );
  };

  const handleRemarksChange = (studentId, remarks) => {
    setRosterState(prev =>
      prev.map(item =>
        item.studentId === studentId ? { ...item, remarks } : item
      )
    );
  };

  const handleMarkAll = (status) => {
    setRosterState(prev =>
      prev.map(item => ({ ...item, status }))
    );
    addToast(`All students marked as ${status}.`, 'info');
  };

  // Stats computation
  const total = rosterState.length;
  const presentCount = rosterState.filter(r => r.status === 'PRESENT').length;
  const lateCount = rosterState.filter(r => r.status === 'LATE').length;
  const absentCount = rosterState.filter(r => r.status === 'ABSENT').length;
  const excusedCount = rosterState.filter(r => r.status === 'EXCUSED').length;
  const rate = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
            <CheckCheck className="w-4 h-4" />
            Daily Operational Management
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Class Roll Call & Attendance Register
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Mark daily presence, track arrival punctuality, and record student absence notes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || rosterState.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {saveMutation.isPending ? 'Saving Register...' : 'Save Roll Call'}
          </button>
        </div>
      </div>

      {/* Control Bar: Class Selector, Date Picker, Quick Bulk Toggles */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Class Selection */}
        <div className="md:col-span-5">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Select Class
          </label>
          <div className="relative">
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
            >
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls._count?.enrollments || 0} enrolled)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Selector */}
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Attendance Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
            />
          </div>
        </div>

        {/* Quick Batch Actions */}
        <div className="md:col-span-4 flex items-end justify-start md:justify-end gap-2 pt-2 md:pt-0">
          <div className="w-full">
            <span className="block text-xs font-semibold text-slate-500 mb-1.5">
              Quick Mark All
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleMarkAll('PRESENT')}
                className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                All Present
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll('LATE')}
                className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
              >
                All Late
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll('ABSENT')}
                className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
              >
                All Absent
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Users className="w-4 h-4 text-slate-400" />
            Total Enrolled
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{total}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Students in class</div>
        </div>

        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200/60 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Present
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-900">{presentCount}</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">In attendance</div>
        </div>

        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/60 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-medium text-amber-700">
            <Clock className="w-4 h-4 text-amber-600" />
            Late Arrivals
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-900">{lateCount}</div>
          <div className="text-[11px] text-amber-600 mt-0.5">Tardy arrival</div>
        </div>

        <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-200/60 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-medium text-rose-700">
            <XCircle className="w-4 h-4 text-rose-600" />
            Absent
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-900">{absentCount}</div>
          <div className="text-[11px] text-rose-600 mt-0.5">Unexcused absence</div>
        </div>

        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200/60 shadow-xs col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-700">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            Attendance Rate
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-900">{rate}%</div>
          <div className="text-[11px] text-blue-600 mt-0.5">{excusedCount} excused leaves</div>
        </div>
      </div>

      {/* Student Roster Register Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm">
              #
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-sm">Student Attendance Roster</h2>
              <p className="text-xs text-slate-400">Mark status for {selectedDate}</p>
            </div>
          </div>

          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            {rosterState.length} Students Listed
          </span>
        </div>

        {loadingAttendance ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Loading attendance register...
          </div>
        ) : rosterState.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-700">No students enrolled</h3>
            <p className="text-xs text-slate-400 mt-1">Enroll students into this class to take attendance.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {rosterState.map((student, idx) => (
              <div
                key={student.studentId}
                className="p-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                {/* Student Info */}
                <div className="flex items-center gap-3 min-w-[240px]">
                  <span className="text-xs font-semibold text-slate-400 w-5">
                    {idx + 1}.
                  </span>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-amber-500 text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {student.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">
                      {student.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{student.email}</p>
                  </div>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.studentId, 'PRESENT')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      student.status === 'PRESENT'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Present
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.studentId, 'LATE')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      student.status === 'LATE'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Late
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.studentId, 'ABSENT')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      student.status === 'ABSENT'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Absent
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.studentId, 'EXCUSED')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      student.status === 'EXCUSED'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    Excused
                  </button>
                </div>

                {/* Remarks Field */}
                <div className="w-full md:w-64">
                  <input
                    type="text"
                    placeholder="Add teacher note/remark..."
                    value={student.remarks}
                    onChange={(e) => handleRemarksChange(student.studentId, e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="bg-slate-50/80 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            Changes are saved permanently to the school academic record upon clicking Save.
          </p>

          <button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || rosterState.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {saveMutation.isPending ? 'Saving Register...' : 'Save Roll Call'}
          </button>
        </div>
      </div>
    </div>
  );
}
