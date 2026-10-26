import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  Calendar,
  Award,
  FileText,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Sparkles,
  Camera,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Search,
  Star,
  Smile,
  Check,
  Eye,
  X,
} from 'lucide-react';

const DIGITAL_STICKERS = [
  { id: 'superstar', label: 'Superstar Work!', emoji: '🌟', color: 'bg-amber-100 text-amber-900 border-amber-300' },
  { id: 'champion', label: 'Homework Champion!', emoji: '🏆', color: 'bg-yellow-100 text-yellow-900 border-yellow-300' },
  { id: 'handwriting', label: 'Neat Handwriting!', emoji: '✍️', color: 'bg-blue-100 text-blue-900 border-blue-300' },
  { id: 'brain', label: 'Brilliant Thinking!', emoji: '🧠', color: 'bg-purple-100 text-purple-900 border-purple-300' },
  { id: 'perfect', label: '100% Score!', emoji: '💯', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  { id: 'effort', label: 'High Effort! Review Q3', emoji: '💡', color: 'bg-orange-100 text-orange-900 border-orange-300' },
];

const QUICK_FEEDBACK = [
  '🌟 Fantastic neat work! Very proud of your effort.',
  '⭐ Well done! All questions correctly solved.',
  '✍️ Beautiful presentation and clear handwriting.',
  '💡 Great effort! Let’s review question 2 together in class.',
  '👏 Keep up the excellent homework habit!',
];

export default function AssignmentDetail() {
  const { id: assignmentId } = useParams();
  const queryClient = useQueryClient();
  const toast = useToast();

  // Filter & Search
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'needs_grading', 'graded', 'unsubmitted'
  const [searchQuery, setSearchQuery] = useState('');

  // Grading Modal State
  const [gradingItem, setGradingItem] = useState(null);
  const [gradeInput, setGradeInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [gradeError, setGradeError] = useState(null);

  // Exercise Book Photo Lightbox
  const [lightboxImage, setLightboxImage] = useState(null);
  const [lightboxRotation, setLightboxRotation] = useState(0);
  const [lightboxZoom, setLightboxZoom] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['assignment-submissions', assignmentId],
    queryFn: async () => {
      const res = await api.get(`/submissions/assignment/${assignmentId}`);
      return res.data;
    },
  });

  const gradeMutation = useMutation({
    mutationFn: async ({ id, grade, feedback }) => {
      const res = await api.post(`/submissions/${id}/grade`, {
        grade: Number(grade),
        feedback,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment-submissions', assignmentId] });
      queryClient.invalidateQueries({ queryKey: ['teacher-dashboard'] });
      setGradingItem(null);
      setGradeInput('');
      setFeedbackInput('');
      setSelectedSticker(null);
      setGradeError(null);
      toast.success('Gold stars & feedback awarded to pupil! ⭐');
    },
    onError: (err) => {
      const msg = err.response?.data?.error || 'Failed to record grade.';
      setGradeError(msg);
      toast.error(msg);
    },
  });

  const handleOpenGradeModal = (item) => {
    setGradingItem(item);
    const existingGrade = item.submission?.grade;
    setGradeInput(existingGrade !== null && existingGrade !== undefined ? String(existingGrade) : '');
    setFeedbackInput(item.submission?.feedback || '');
    setSelectedSticker(null);
    setGradeError(null);
  };

  const handleApplySticker = (sticker) => {
    setSelectedSticker(sticker.id);
    const stickerText = `${sticker.emoji} [Awarded ${sticker.label}]`;
    if (!feedbackInput.includes(stickerText)) {
      setFeedbackInput((prev) => (prev ? `${stickerText} ${prev}` : `${stickerText} Great work!`));
    }
  };

  const handleSelectStarScore = (starVal) => {
    const maxPoints = data?.assignment?.points || 5;
    if (maxPoints <= 5) {
      setGradeInput(String(starVal));
    } else {
      // Scale star score proportionally to points
      const proportional = Math.round((starVal / 5) * maxPoints);
      setGradeInput(String(proportional));
    }
  };

  const handleGradeSubmit = (e) => {
    e.preventDefault();
    if (gradeInput === '' || isNaN(gradeInput)) {
      setGradeError('Please enter a valid numeric score.');
      return;
    }
    const num = Number(gradeInput);
    const maxPts = data?.assignment?.points || 100;
    if (num < 0 || num > maxPts) {
      setGradeError(`Score must be between 0 and ${maxPts}.`);
      return;
    }

    gradeMutation.mutate({
      id: gradingItem.submission.id,
      grade: num,
      feedback: feedbackInput.trim(),
    });
  };

  const openLightbox = (url, name) => {
    setLightboxImage({ url, name });
    setLightboxRotation(0);
    setLightboxZoom(1);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-amber-400 border-t-transparent animate-spin"></div>
        <p className="text-xs font-bold text-slate-500">Loading pupil submissions... 🎒</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 text-rose-800 rounded-3xl text-sm space-y-2">
        <p className="font-extrabold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600" />
          Submissions Error
        </p>
        <p>Failed to load pupil submissions for this homework.</p>
        <Link to="/teacher/classes" className="inline-block mt-2 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold">
          Back to Classes
        </Link>
      </div>
    );
  }

  const { assignment, submissions } = data;
  const submittedCount = submissions.filter((s) => s.hasSubmitted).length;
  const gradedCount = submissions.filter((s) => s.submission?.grade !== null && s.submission?.grade !== undefined).length;
  const pendingCount = submittedCount - gradedCount;

  // Filtered submissions
  const filteredSubmissions = submissions.filter((item) => {
    const { student, hasSubmitted, submission } = item;
    const isGraded = submission && submission.grade !== null && submission.grade !== undefined;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = student.name?.toLowerCase().includes(q);
      const matchEmail = student.email?.toLowerCase().includes(q);
      if (!matchName && !matchEmail) return false;
    }

    if (filterTab === 'needs_grading') return hasSubmitted && !isGraded;
    if (filterTab === 'graded') return isGraded;
    if (filterTab === 'unsubmitted') return !hasSubmitted;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Lightbox for Pupil's Handwritten Exercise Book Photo */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-between p-4 animate-fade-in">
          {/* Top Bar */}
          <div className="w-full max-w-5xl flex items-center justify-between text-white pb-3 border-b border-white/20">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-bold truncate">{lightboxImage.name || 'Exercise Book Photo'}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLightboxZoom((z) => Math.max(0.6, z - 0.2))}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setLightboxZoom((z) => Math.min(2.5, z + 0.2))}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setLightboxRotation((r) => (r + 90) % 360)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
                title="Rotate 90 degrees"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={closeLightbox}
                className="p-2 bg-rose-600 hover:bg-rose-500 rounded-xl text-white transition-colors ml-2"
                title="Close Lightbox"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Centered Image Container */}
          <div className="flex-1 flex items-center justify-center overflow-auto p-4 w-full">
            <img
              src={lightboxImage.url}
              alt="Exercise Book Page"
              style={{
                transform: `rotate(${lightboxRotation}deg) scale(${lightboxZoom})`,
                transition: 'transform 0.2s ease',
              }}
              className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl"
            />
          </div>

          <p className="text-xs text-white/70 pb-2">
            Tip: Rotate if taken sideways, or zoom in to inspect pencil workings.
          </p>
        </div>
      )}

      {/* Back button */}
      <div>
        <Link
          to="/teacher/classes"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4 text-brand-600" /> Back to Classes & Subjects
        </Link>

        {/* Primary School Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-extrabold uppercase tracking-wider">
                {assignment.className || 'Class'}
              </span>
              <span className="text-xs font-bold text-slate-400">•</span>
              <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                ⭐ {assignment.points <= 10 ? `${assignment.points} Gold Stars` : `${assignment.points} Points Max`}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {assignment.title}
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Due: <strong>{new Date(assignment.dueDate).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</strong> at {new Date(assignment.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {/* Quick Stat Pill Cards */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 shrink-0">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Pupils
              </span>
              <span className="text-xl font-black text-slate-800">{submissions.length}</span>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                Needs Marking
              </span>
              <span className="text-xl font-black text-amber-900">{pendingCount}</span>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                Awarded ⭐
              </span>
              <span className="text-xl font-black text-emerald-900">{gradedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Controls Bar: Filters & Search */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                filterTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Pupils ({submissions.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('needs_grading')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                filterTab === 'needs_grading'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Needs Marking ⏳ ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('graded')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                filterTab === 'graded'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Awarded ⭐ ({gradedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('unsubmitted')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                filterTab === 'unsubmitted'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending Hand-in ({submissions.length - submittedCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pupil name..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Submissions List */}
        {filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm space-y-2">
            <Smile className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-bold text-slate-600">No pupil submissions match this filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredSubmissions.map((item) => {
              const { student, hasSubmitted, submission } = item;
              const isGraded = submission && submission.grade !== null && submission.grade !== undefined;
              const isImage = submission?.fileUrl && /\.(jpg|jpeg|png|webp|gif)$/i.test(submission.fileUrl);

              return (
                <div
                  key={student.id}
                  className="p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    {/* Pupil identity and badge */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-900 font-black flex items-center justify-center text-sm shadow-xs shrink-0">
                        {student.name?.[0]?.toUpperCase() || 'P'}
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900">{student.name}</h3>
                        <p className="text-[11px] text-slate-400">{student.email}</p>
                      </div>

                      {hasSubmitted ? (
                        isGraded ? (
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-black flex items-center gap-1 shadow-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Awarded: {submission.grade} / {assignment.points} ⭐
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-full text-xs font-black flex items-center gap-1 shadow-xs">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Turned In (Needs Marking)
                          </span>
                        )
                      ) : (
                        <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5 text-slate-400" />
                          Not Handed In Yet
                        </span>
                      )}
                    </div>

                    {/* Submission content preview if submitted */}
                    {hasSubmitted && (
                      <div className="pl-11 space-y-2 pt-1">
                        {submission.textAnswer && (
                          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-800">
                            <span className="font-extrabold text-slate-900 block mb-0.5">
                              Pupil's Written Answer:
                            </span>
                            <p className="whitespace-pre-wrap leading-relaxed">{submission.textAnswer}</p>
                          </div>
                        )}

                        {submission.fileUrl && (
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            {isImage ? (
                              <button
                                type="button"
                                onClick={() => openLightbox(submission.fileUrl, submission.fileName)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-black transition-all shadow-xs"
                              >
                                <Eye className="w-3.5 h-3.5 text-amber-600" />
                                📸 Inspect Exercise Book Photo
                              </button>
                            ) : null}

                            <a
                              href={submission.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                              {submission.fileName || 'Download Attachment'}
                            </a>
                          </div>
                        )}

                        {submission.feedback && (
                          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-0.5">
                            <span className="font-black uppercase tracking-wider text-emerald-800 text-[10px] block">
                              Teacher Feedback Given:
                            </span>
                            <p className="font-bold italic">"{submission.feedback}"</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Button: Grade Submission */}
                  <div className="shrink-0 self-end lg:self-center">
                    {hasSubmitted ? (
                      <button
                        type="button"
                        onClick={() => handleOpenGradeModal(item)}
                        className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all shadow-sm flex items-center gap-2 ${
                          isGraded
                            ? 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-200 shadow-md scale-105 active:scale-100'
                        }`}
                      >
                        <Star className="w-4 h-4 text-amber-600 fill-amber-500" />
                        <span>{isGraded ? 'Update Marks / Feedback' : 'Mark & Award Stars ⭐'}</span>
                      </button>
                    ) : (
                      <span className="text-xs font-medium text-slate-400 italic">
                        Waiting on pupil
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grade & Sticker Modal */}
      <Modal
        isOpen={!!gradingItem}
        onClose={() => setGradingItem(null)}
        title="Primary School Marking & Star Award ⭐"
        maxWidth="max-w-xl"
      >
        {gradingItem && (
          <form onSubmit={handleGradeSubmit} className="space-y-4">
            {gradeError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{gradeError}</span>
              </div>
            )}

            {/* Pupil Header Pill */}
            <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                  Marking Homework For:
                </span>
                <h4 className="text-sm font-black text-slate-900">{gradingItem.student.name}</h4>
                <p className="text-xs text-slate-500">{assignment.title}</p>
              </div>
              <span className="text-3xl">🎒</span>
            </div>

            {/* Quick Star Selector (1 to 5 Stars) */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                Quick Star Rating (Click to set score):
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleSelectStarScore(star)}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50 bg-white transition-all text-xs font-black text-slate-800 flex items-center gap-1"
                  >
                    <span className="text-amber-500 text-base">★</span>
                    <span>{star} Star{star > 1 ? 's' : ''}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Score Input */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                Score / Marks (Out of {assignment.points})
              </label>
              <input
                type="number"
                step="any"
                min="0"
                max={assignment.points}
                value={gradeInput}
                onChange={(e) => setGradeInput(e.target.value)}
                placeholder={`0 - ${assignment.points}`}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            {/* One-Click Digital Stickers */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Award a Digital Sticker! 🌟</span>
                <span className="text-[11px] text-slate-400 font-normal">Encourages pupils</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DIGITAL_STICKERS.map((stk) => (
                  <button
                    key={stk.id}
                    type="button"
                    onClick={() => handleApplySticker(stk)}
                    className={`p-2 rounded-xl border text-xs font-bold text-left transition-all flex items-center gap-2 ${
                      selectedSticker === stk.id
                        ? `${stk.color} ring-2 ring-brand-500/50 scale-[1.02] shadow-xs`
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-lg">{stk.emoji}</span>
                    <span className="truncate">{stk.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback & Quick Praise Phrases */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Teacher Feedback & Praise
                </label>
                <span className="text-[11px] text-slate-400">Written to pupil & parent</span>
              </div>

              {/* Quick feedback buttons */}
              <div className="flex flex-wrap gap-1 mb-2">
                {QUICK_FEEDBACK.map((fb, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFeedbackInput(fb)}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-amber-100 hover:text-amber-900 rounded-lg text-slate-600 transition-colors"
                  >
                    {fb.split('!')[0]}!
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                placeholder="Write warm words of praise or advice for the pupil..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setGradingItem(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={gradeMutation.isPending}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 rounded-xl text-xs sm:text-sm font-black transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
              >
                <Star className="w-4 h-4 fill-slate-950" />
                {gradeMutation.isPending ? 'Saving Marks...' : 'Award Stars & Save Feedback ⭐'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
