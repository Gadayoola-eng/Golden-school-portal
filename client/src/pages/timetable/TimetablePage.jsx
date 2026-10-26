import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  BookOpen,
  Printer,
  Sparkles,
  Calendar,
  CheckCircle2,
  ChevronRight,
  LayoutGrid,
  List
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Color mapping for subjects
const getSubjectColor = (code = '') => {
  const c = code.toUpperCase();
  if (c.includes('CS') || c.includes('COMP')) {
    return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' };
  }
  if (c.includes('MATH')) {
    return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' };
  }
  if (c.includes('PHY') || c.includes('CHEM') || c.includes('SCI')) {
    return { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', dot: 'bg-cyan-500' };
  }
  if (c.includes('ENG') || c.includes('LIT')) {
    return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' };
  }
  if (c.includes('CIV') || c.includes('FRN')) {
    return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' };
  }
  return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400' };
};

export default function TimetablePage() {
  const { user } = useAuthStore();
  const [selectedDay, setSelectedDay] = useState(() => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = dayNames[new Date().getDay()];
    return DAYS.includes(today) ? today : 'Monday';
  });
  const [viewMode, setViewMode] = useState('day'); // 'day' or 'week'

  const { data, isLoading, error } = useQuery({
    queryKey: ['timetableSchedule'],
    queryFn: async () => {
      const res = await api.get('/timetables/my');
      return res.data;
    },
  });

  const schedule = data?.schedule || {};
  const currentDaySlots = schedule[selectedDay] || [];

  const handlePrint = () => {
    window.print();
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = dayNames[new Date().getDay()];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200/60 inline-flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5" />
              2025/2026 Academic Session
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-500">First Term</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {user?.role === 'TEACHER' ? 'Teaching Schedule & Routine' : 'Class Timetable & Periods'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {user?.role === 'TEACHER'
              ? 'View your designated periods, assigned classrooms, and weekly teaching schedule.'
              : 'Keep track of daily class routines, classroom venues, and subject schedules.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('day')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'day'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Day View
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'week'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Weekly Matrix
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Schedule
          </button>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {DAYS.map((day) => {
          const isSelected = selectedDay === day;
          const isToday = todayName === day;
          const count = (schedule[day] || []).length;

          return (
            <button
              key={day}
              onClick={() => {
                setSelectedDay(day);
                if (viewMode === 'week') setViewMode('day');
              }}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 ${
                isSelected
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100/80 border border-slate-200/80'
              }`}
            >
              <span>{day}</span>
              {isToday && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-brand-50 text-brand-700'
                  }`}
                >
                  Today
                </span>
              )}
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">Loading timetable schedule...</p>
        </div>
      ) : viewMode === 'day' ? (
        /* DAY VIEW: Period Cards */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-600" />
              {selectedDay} Schedule ({currentDaySlots.length} Scheduled Periods)
            </h2>
            <span className="text-xs text-slate-500">School Hours: 08:00 AM – 03:00 PM</span>
          </div>

          {currentDaySlots.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No scheduled periods for {selectedDay}</p>
              <p className="text-xs text-slate-500 mt-1">Enjoy your study free day or check school activities.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentDaySlots.map((slot) => {
                const colors = getSubjectColor(slot.code);
                const isBreakOrAssembly = slot.code === 'ASSEMBLY' || slot.code === 'BREAK' || slot.code === 'LUNCH';

                return (
                  <div
                    key={slot.id}
                    className={`bg-white rounded-2xl p-5 border transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
                      isBreakOrAssembly
                        ? 'border-dashed border-slate-300 bg-slate-50/50'
                        : `${colors.border} hover:border-slate-300`
                    }`}
                  >
                    <div>
                      {/* Period Badge & Time */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                          Period {slot.period}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {slot.time}
                        </div>
                      </div>

                      {/* Subject Name & Code */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {slot.code}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                          {slot.subject}
                        </h3>
                      </div>
                    </div>

                    {/* Footer Details: Room & Teacher */}
                    <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span className="flex items-center gap-1.5 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {slot.room}
                        </span>
                        <span className="flex items-center gap-1.5 font-medium">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {slot.teacher}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* WEEK VIEW: Comprehensive Matrix */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-brand-600" />
              Complete Weekly Schedule Grid (Monday – Friday)
            </h3>
            <span className="text-xs text-slate-500">Standard 7-Period Daily Cycle</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4 w-28">Day</th>
                  <th className="py-3 px-3">Period 1<br/><span className="text-[10px] text-slate-400 font-normal">08:00 - 08:50</span></th>
                  <th className="py-3 px-3">Period 2<br/><span className="text-[10px] text-slate-400 font-normal">08:50 - 09:40</span></th>
                  <th className="py-3 px-3">Period 3<br/><span className="text-[10px] text-slate-400 font-normal">09:40 - 10:30</span></th>
                  <th className="py-3 px-3">Period 4<br/><span className="text-[10px] text-slate-400 font-normal">10:50 - 11:40</span></th>
                  <th className="py-3 px-3">Period 5<br/><span className="text-[10px] text-slate-400 font-normal">11:40 - 12:30</span></th>
                  <th className="py-3 px-3">Period 6<br/><span className="text-[10px] text-slate-400 font-normal">01:10 - 02:00</span></th>
                  <th className="py-3 px-3">Period 7<br/><span className="text-[10px] text-slate-400 font-normal">02:00 - 02:45</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {DAYS.map((day) => {
                  const slots = schedule[day] || [];
                  const isToday = todayName === day;

                  return (
                    <tr key={day} className={`hover:bg-slate-50/80 ${isToday ? 'bg-amber-50/30' : ''}`}>
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                        {day}
                        {isToday && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                        )}
                      </td>
                      {[1, 2, 3, 4, 5, 6, 7].map((periodNum) => {
                        const slot = slots.find((s) => s.period === periodNum);
                        if (!slot) {
                          return (
                            <td key={periodNum} className="py-3 px-3 text-slate-400 italic text-[11px]">
                              Free
                            </td>
                          );
                        }

                        const colors = getSubjectColor(slot.code);
                        return (
                          <td key={periodNum} className="py-3 px-3">
                            <div className={`p-2 rounded-lg border ${colors.bg} ${colors.border}`}>
                              <p className="font-bold text-slate-900 text-[11px] truncate" title={slot.subject}>
                                {slot.code}
                              </p>
                              <p className="text-[10px] text-slate-600 truncate">{slot.room}</p>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
