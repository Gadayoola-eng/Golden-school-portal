import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import Badge from '../../components/Badge';
import { useToast } from '../../context/ToastContext';
import DrawingCanvas from '../../components/homework/DrawingCanvas';
import CelebrationModal from '../../components/homework/CelebrationModal';
import {
  ArrowLeft,
  Calendar,
  Award,
  Upload,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Paperclip,
  X,
  FileUp,
  Camera,
  Edit3,
  Palette,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  RotateCw,
  Star,
  Check,
  HelpCircle,
  Smile,
  Heart,
} from 'lucide-react';

export default function StudentAssignment() {
  const { id: assignmentId } = useParams();
  const queryClient = useQueryClient();
  const toast = useToast();
  const fileInputRef = useRef(null);

  // Submission input state
  const [activeTab, setActiveTab] = useState('photo'); // 'photo', 'text', 'drawing'
  const [textAnswer, setTextAnswer] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [photoRotation, setPhotoRotation] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);

  // Audio Read-Aloud (Text-to-Speech)
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Speech Recognition (Dictation)
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['student-assignment', assignmentId],
    queryFn: async () => {
      const res = await api.get(`/assignments/${assignmentId}`);
      return res.data;
    },
  });

  const assignment = data?.assignment;
  const mySubmission = assignment?.mySubmission;

  // Cleanup file preview on unmount or file change
  useEffect(() => {
    return () => {
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, [filePreviewUrl]);

  useEffect(() => {
    if (mySubmission?.textAnswer) {
      setTextAnswer(mySubmission.textAnswer);
    }
  }, [mySubmission]);

  // Speech Recognition setup (Web Speech API)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setTextAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
        toast.success('Added your spoken words! 🎙️');
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [toast]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.info('Speech recognition is not supported in this browser. You can type directly!');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.info('Listening... Speak your answer clearly 🎤');
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  // Text to speech Read Aloud
  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      toast.info('Text-to-speech is not supported on this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = `${assignment.title}. Instructions: ${assignment.instructions}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.9; // Friendly gentle pace for primary school pupils
    utterance.pitch = 1.05;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const submitMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await api.post(`/submissions/assignment/${assignmentId}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: (resData) => {
      queryClient.invalidateQueries({ queryKey: ['student-assignment', assignmentId] });
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
      const msg = resData.message || 'Homework submitted to teacher successfully!';
      setSubmitSuccess(msg);
      setSubmitError(null);
      setSelectedFile(null);
      setFilePreviewUrl(null);
      setIsCelebrationOpen(true);
      toast.success(msg);
    },
    onError: (err) => {
      const msg = err.response?.data?.error || 'Failed to submit homework.';
      setSubmitError(msg);
      setSubmitSuccess(null);
      toast.error(msg);
    },
  });

  const validateAndSetFile = (file) => {
    if (!file) return;
    const MAX_SIZE = 25 * 1024 * 1024; // 25 MB
    if (file.size > MAX_SIZE) {
      toast.error('File size exceeds 25MB limit.');
      return;
    }
    setSelectedFile(file);
    setPhotoRotation(0);
    setSubmitError(null);

    // Create preview if image
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setFilePreviewUrl(url);
    } else {
      setFilePreviewUrl(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleDrawingSave = (drawingFile) => {
    validateAndSetFile(drawingFile);
    setActiveTab('photo');
    toast.success('Your drawing is ready to submit! 🎨⭐');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!textAnswer.trim() && !selectedFile && !mySubmission?.fileUrl) {
      const msg = 'Please snap a photo of your work, write an answer, or attach a drawing!';
      setSubmitError(msg);
      toast.warning(msg);
      return;
    }

    const formData = new FormData();
    if (textAnswer.trim()) {
      formData.append('textAnswer', textAnswer.trim());
    }
    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    submitMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-amber-400 border-t-transparent animate-spin"></div>
        <p className="text-xs font-bold text-slate-500">Opening your homework desk... 🎒</p>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 text-rose-800 rounded-3xl text-sm space-y-2">
        <p className="font-extrabold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600" />
          Homework Not Found
        </p>
        <p>This homework assignment could not be loaded. Please ask your teacher or parent for assistance.</p>
        <Link to="/student" className="inline-block mt-2 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold">
          Back to Student Dashboard
        </Link>
      </div>
    );
  }

  const isPastDue = assignment.isPastDue;
  const isGraded = mySubmission && mySubmission.grade !== null && mySubmission.grade !== undefined;
  const hasSubmitted = !!mySubmission;
  const wordCount = textAnswer.trim() ? textAnswer.trim().split(/\s+/).length : 0;

  // Star display count calculation
  const maxStars = assignment.points <= 10 ? assignment.points : 5;
  const earnedStars = isGraded
    ? Math.round((mySubmission.grade / assignment.points) * maxStars)
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Celebration Modal when handed in */}
      <CelebrationModal
        isOpen={isCelebrationOpen}
        onClose={() => setIsCelebrationOpen(false)}
        assignmentTitle={assignment.title}
        points={assignment.points}
      />

      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to={assignment.classId ? `/student/classes/${assignment.classId}` : '/student/classes'}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-700 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-brand-600" />
          <span>Back to {assignment.className || 'Homework List'}</span>
        </Link>

        {/* Read-Aloud Voice Assistant for Primary School Early Readers */}
        <button
          type="button"
          onClick={handleToggleSpeech}
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-black transition-all shadow-xs ${
            isSpeaking
              ? 'bg-rose-500 text-white animate-pulse'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
          }`}
          title="Click to have the homework read aloud to you!"
        >
          {isSpeaking ? (
            <>
              <VolumeX className="w-4 h-4" /> Stop Reading ⏹️
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-emerald-600" /> Read Aloud to Me 🔊
            </>
          )}
        </button>
      </div>

      {/* Header Card: Primary School Standard Card */}
      <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-3xl p-6 sm:p-7 text-slate-950 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-15 pointer-events-none text-9xl">
          🎒
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-slate-950 text-amber-300 text-xs font-black rounded-full uppercase tracking-wider shadow-xs">
                {assignment.class?.name || 'Class Subject'}
              </span>
              <span className="text-xs font-black text-slate-900/80">
                Pupil Homework Desk
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              {assignment.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isGraded ? (
              <span className="px-4 py-2 bg-emerald-600 text-white rounded-2xl text-xs sm:text-sm font-black shadow-md flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Graded ⭐
              </span>
            ) : hasSubmitted ? (
              <span className="px-4 py-2 bg-brand-600 text-white rounded-2xl text-xs sm:text-sm font-black shadow-md flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Handed In 🚀
              </span>
            ) : isPastDue ? (
              <span className="px-4 py-2 bg-rose-600 text-white rounded-2xl text-xs sm:text-sm font-black shadow-md flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Closed ⏰
              </span>
            ) : (
              <span className="px-4 py-2 bg-white text-slate-950 rounded-2xl text-xs sm:text-sm font-black shadow-md flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" /> Open for Submission
              </span>
            )}
          </div>
        </div>

        {/* Quick Meta Badges */}
        <div className="mt-5 pt-4 border-t border-slate-950/10 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-3 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              📅
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                Due Date
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-900">
                {new Date(assignment.dueDate).toLocaleDateString([], {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-3 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              ⭐
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                Reward
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-900">
                {assignment.points <= 10 ? `${assignment.points} Gold Stars` : `${assignment.points} Marks`}
              </span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-white/80 backdrop-blur-xs rounded-2xl p-3 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              🎒
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                Pupil Status
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-900">
                {isGraded ? '⭐ Graded' : hasSubmitted ? 'Handed In' : 'Ready to Do'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Graded Feedback Card with Gold Stars (if graded) */}
      {isGraded && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 space-y-4 shadow-sm animate-scale-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl shadow-md">
                🏆
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-700 block">
                  Teacher Marked Your Work!
                </span>
                <h3 className="text-lg font-black text-emerald-950">
                  You earned {mySubmission.grade} / {assignment.points} points!
                </h3>
              </div>
            </div>

            {/* Visual Gold Stars Display */}
            <div className="flex items-center gap-1 bg-white/80 px-4 py-2 rounded-2xl border border-emerald-200">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`text-xl ${i < earnedStars ? 'text-amber-400' : 'text-slate-200'}`}
                >
                  ★
                </span>
              ))}
              <span className="text-xs font-black text-emerald-900 ml-1.5">
                {earnedStars} / 5 Stars ⭐
              </span>
            </div>
          </div>

          {/* Teacher's Feedback Bubble */}
          {mySubmission.feedback && (
            <div className="bg-white rounded-2xl p-4 border border-emerald-200 space-y-1 relative shadow-xs">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-800">
                <Smile className="w-4 h-4 text-emerald-600" />
                Teacher's Praise & Note:
              </div>
              <p className="text-sm font-bold text-slate-800 italic leading-relaxed pt-1">
                "{mySubmission.feedback}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Instructions Card with primary font & step breakdown */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              Teacher's Instructions & Questions
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            Read carefully 📖
          </span>
        </div>

        <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 text-sm text-slate-800 whitespace-pre-line leading-relaxed font-medium">
          {assignment.instructions}
        </div>

        {/* Friendly Parent Assistance Tip */}
        <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start gap-2.5 text-xs text-blue-900">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Parent / Guardian Note:</strong> Help your child understand the question, but encourage them to write or solve the answers on their own!
          </p>
        </div>
      </div>

      {/* Submission Center Area */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span>Your Homework Workstation</span>
              <span className="text-xl">✏️</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {hasSubmitted
                ? 'Your work is submitted! You can update or replace it before the due date.'
                : 'Choose how you want to hand in your work below:'}
            </p>
          </div>

          {/* Simple Tab Selectors */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl self-start sm:self-center">
            <button
              type="button"
              onClick={() => setActiveTab('photo')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'photo'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-amber-500" />
              <span>📸 Photo Snap</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'text'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 text-brand-600" />
              <span>✏️ Type Answers</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('drawing')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'drawing'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-pink-500" />
              <span>🎨 Drawing Pad</span>
            </button>
          </div>
        </div>

        {/* Feedback Alerts */}
        {submitSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{submitSuccess}</span>
          </div>
        )}

        {submitError && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Existing file attachment preview if already submitted */}
        {hasSubmitted && mySubmission.fileUrl && !selectedFile && (
          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-lg">
                📎
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 block">
                  {mySubmission.fileName || 'Attached Deliverable'}
                </span>
                <span className="text-[11px] text-slate-500">
                  Uploaded on {new Date(mySubmission.submittedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <a
              href={mySubmission.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" /> View / Download File
            </a>
          </div>
        )}

        {/* TAB 1: PHOTO OF EXERCISE BOOK */}
        {activeTab === 'photo' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-gradient-to-r from-amber-50/80 to-yellow-50/80 border border-amber-200 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="text-xs sm:text-sm font-black text-amber-950">
                  📸 Snap a Photo of Your Exercise Book
                </h4>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Write neatly in your notebook, take a clear picture, and upload it here!
                </p>
              </div>
              <span className="text-2xl">📷</span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,.pdf,.doc,.docx"
              disabled={isPastDue}
              onChange={(e) => validateAndSetFile(e.target.files[0] || null)}
              className="hidden"
              id="primary-file-input"
            />

            {!selectedFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isPastDue && fileInputRef.current?.click()}
                className={`border-3 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer ${
                  isPastDue
                    ? 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-60'
                    : isDragOver
                    ? 'border-amber-500 bg-amber-50 scale-[1.01]'
                    : 'border-amber-300 bg-amber-50/30 hover:border-amber-500 hover:bg-amber-50/60'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto mb-3 shadow-md">
                  <Camera className="w-7 h-7" />
                </div>
                <p className="text-sm font-black text-slate-900">
                  Click here to take a photo or choose picture
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Works directly with your phone camera, tablet, or pictures on your computer!
                </p>
                <span className="inline-block mt-3 px-3 py-1 bg-white border border-amber-300 rounded-full text-[11px] font-bold text-amber-900 shadow-xs">
                  Supports Photos (JPG, PNG) & Worksheets
                </span>
              </div>
            ) : (
              <div className="p-4 bg-white rounded-2xl border-2 border-emerald-300 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      📸
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-black text-slate-900 truncate max-w-xs">
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] text-emerald-700 font-bold">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to hand in! ✓
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {filePreviewUrl && (
                      <button
                        type="button"
                        onClick={() => setPhotoRotation((r) => (r + 90) % 360)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                        title="Rotate photo 90 degrees if taken sideways"
                      >
                        <RotateCw className="w-3.5 h-3.5" /> Rotate
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => !isPastDue && fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl text-xs font-bold transition-colors"
                    >
                      Change Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setFilePreviewUrl(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50"
                      title="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Live Image Preview Thumbnail with rotation */}
                {filePreviewUrl && (
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex justify-center overflow-hidden max-h-64">
                    <img
                      src={filePreviewUrl}
                      alt="Pupil Work Preview"
                      style={{ transform: `rotate(${photoRotation}deg)` }}
                      className="max-h-60 object-contain rounded-lg transition-transform"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TYPE ANSWERS WITH DICTATION */}
        {activeTab === 'text' && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <span>✏️ Type or Speak Your Answer</span>
                {wordCount > 0 && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full text-[11px] font-bold">
                    {wordCount} words {wordCount >= 10 ? '🌟 Super writing!' : '🚀'}
                  </span>
                )}
              </label>

              {/* Dictate / Speak my answer button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                }`}
                title="Speak and let computer type for you!"
              >
                {isListening ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" /> Stop Speaking ⏹️
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-indigo-600" /> Dictate / Speak My Answer 🎙️
                  </>
                )}
              </button>
            </div>

            <textarea
              rows={6}
              disabled={isPastDue}
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              placeholder="My Homework Answer:&#10;1. &#10;2. &#10;3. "
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm sm:text-base font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white leading-relaxed placeholder:text-slate-400"
            />
          </div>
        )}

        {/* TAB 3: DIGITAL DOODLE / DRAWING CANVAS */}
        {activeTab === 'drawing' && (
          <DrawingCanvas
            onSaveDrawing={handleDrawingSave}
            onCancel={() => setActiveTab('photo')}
          />
        )}

        {/* Pupil Ready-to-Hand-In Checklist */}
        <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-1.5">
          <span className="text-xs font-black text-emerald-950 uppercase tracking-wider block">
            Pupil Quick Check:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-semibold text-emerald-800">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              1. I read questions carefully
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              2. My answers are neat & clear
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              3. Mummy / Daddy checked
            </span>
          </div>
        </div>

        {/* Form Submission Action Button */}
        {(!isPastDue || !hasSubmitted) && (
          <form onSubmit={handleSubmit} className="pt-2">
            <button
              type="submit"
              disabled={isPastDue || submitMutation.isPending}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-sm sm:text-base font-black rounded-2xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-slate-950" />
              <span>
                {submitMutation.isPending
                  ? 'Handing In Your Homework...'
                  : hasSubmitted
                  ? 'Update My Submitted Homework ⭐'
                  : 'Hand In My Homework Now! 🚀 ⭐'}
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
