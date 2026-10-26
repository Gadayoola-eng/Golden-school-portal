import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';
import {
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
  Flame,
  Award,
  Filter,
  TrendingUp,
  ShieldCheck,
  CalendarDays
} from 'lucide-react';

export default function StudentAttendance() {
  const { user } = useAuthStore();
  const isParent = user?.role === 'PARENT';
  const [filterStatus, setFilterStatus] = useState('ALL');

  const { data, isLoading, error } = useQuery({
    queryKey: ['studentAttendance'],
    queryFn: async () => {
      const res = await api.get('/attendance/student/my');
      return res.data;
    },
  });

  const stats = data?.stats || {
    totalDays: 0,
    presentDays: 0,
    lateDays: 0,
    absentDays: 0,
    excusedDays: 0,
    attendanceRate: 100,
    attendanceStreak: 0,
    statusLabel: 'Good Standing',
  };

  const student = data?.student || {
    name: user?.name,
    admissionCode: 'CPS/2024/0142',
  };

  const history = data?.history || [];

  const filteredHistory = history.filter(item => {
    if (filterStatus === 'ALL') return true;
    return item.status === filterStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PRESENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Present
          </span>
        );
      case 'LATE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Late
          </span>
        );
      case 'ABSENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Absent
          </span>
        );
      case 'EXCUSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            Excused
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
            <CalendarDays className="w-4 h-4" />
            {isParent ? "Ward Attendance Record" : "My Attendance Register"}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Academic Attendance & Punctuality
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isParent ? `Official attendance logs and punctuality streak for ${student.name}.` : "Monitor your attendance rate, active punctuality streak, and daily roll-call records."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
            Pupil ID: <strong className="text-slate-900 font-bold">{student.admissionCode}</strong>
          </div>
        </div>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Percentage */}
        <div className="bg-gradient-to-br from-brand-600 to-brand-800 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-100 uppercase tracking-wider">Attendance Rate</span>
            <TrendingUp className="w-5 h-5 text-brand-200" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight">{stats.attendanceRate}%</span>
            <span className="text-xs text-brand-100 font-medium">{stats.statusLabel}</span>
          </div>
          <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-brand-100">
            <span>Official Target: 90%+</span>
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Punctual Streak</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats.attendanceStreak}</span>
            <span className="text-xs text-slate-500 font-medium">Days In A Row</span>
          </div>
          <p className="mt-4 text-xs text-slate-400">Consecutive school days present without unexcused absence.</p>
        </div>

        {/* Present Days */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Days Present</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-900 tracking-tight">{stats.presentDays}</span>
            <span className="text-xs text-slate-500 font-medium">of {stats.totalDays} sessions</span>
          </div>
          <p className="mt-4 text-xs text-slate-400">Regular on-time morning attendance recorded by teachers.</p>
        </div>

        {/* Late & Absences */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tardy & Absences</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <div>
              <span className="text-2xl font-bold text-amber-600">{stats.lateDays}</span>
              <span className="text-xs text-slate-400 ml-1">Late</span>
            </div>
            <div className="text-slate-300">|</div>
            <div>
              <span className="text-2xl font-bold text-rose-600">{stats.absentDays}</span>
              <span className="text-xs text-slate-400 ml-1">Absent</span>
            </div>
            <div className="text-slate-300">|</div>
            <div>
              <span className="text-2xl font-bold text-blue-600">{stats.excusedDays}</span>
              <span className="text-xs text-slate-400 ml-1">Excused</span>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-400">All absence notes are filed with the administration office.</p>
        </div>
      </div>

      {/* Attendance History Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-slate-900 text-base">Daily Attendance Logs</h2>
            <p className="text-xs text-slate-500 mt-0.5">Chronological record of recent class sessions and teacher remarks.</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'PRESENT', 'LATE', 'ABSENT', 'EXCUSED'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  filterStatus === status
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status === 'ALL' ? 'All Logs' : status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Loading attendance records...
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-700">No attendance entries found</h3>
            <p className="text-xs text-slate-400 mt-1">No logs match the selected filter category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5">Day</th>
                  <th className="py-3 px-5">Roll Status</th>
                  <th className="py-3 px-5">Teacher Remarks / Notes</th>
                  <th className="py-3 px-5 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredHistory.map((item) => {
                  const dateObj = new Date(item.date);
                  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                  const formattedDate = dateObj.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-slate-900 whitespace-nowrap">
                        {formattedDate}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 text-xs whitespace-nowrap">
                        {dayName}
                      </td>
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 text-xs">
                        {item.remarks || <span className="text-slate-300 italic">No notes recorded</span>}
                      </td>
                      <td className="py-3.5 px-5 text-right text-xs text-slate-400 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
