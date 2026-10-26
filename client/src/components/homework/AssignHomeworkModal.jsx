import React, { useState } from 'react';
import Modal from '../Modal';
import {
  Sparkles,
  BookOpen,
  Calendar,
  Award,
  Star,
  CheckCircle2,
  AlertCircle,
  Camera,
  Edit3,
  Palette,
  Lightbulb,
  Clock,
  HelpCircle,
} from 'lucide-react';

// Primary School Subject Categories
const PRIMARY_SUBJECTS = [
  { id: 'maths', name: 'Mathematics / Numeracy', emoji: '🔢', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'english', name: 'English / Phonics', emoji: '🔤', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'science', name: 'Basic Science & Nature', emoji: '🔬', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'social', name: 'Social Studies & Civics', emoji: '🌍', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'reading', name: 'Reading & Literature', emoji: '📖', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { id: 'art', name: 'Art, Craft & Drawing', emoji: '🎨', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  { id: 'handwriting', name: 'Handwriting & Penmanship', emoji: '✍️', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
];

// Ready-to-Use Primary School Homework Templates
const HOMEWORK_TEMPLATES = [
  {
    name: '📸 Exercise Book Snapshot',
    badge: 'Popular',
    subject: 'maths',
    title: 'Workbook Practice: Exercise Questions 1 to 5',
    instructions: `1. Open your workbook/exercise book to today's topic.
2. Write today's date and the heading neatly.
3. Solve questions 1 to 5 with your pencil, showing your workings.
4. Snap a clear photo of your notebook page with your parent's phone and upload it here!

💡 Note for Parents: Encourage your pupil to count carefully and check their answers before taking the photo.`,
    points: 5,
  },
  {
    name: '🔤 Weekly Spelling Bee & Sentences',
    badge: 'Literacy',
    subject: 'english',
    title: 'Spelling Words & Creative Sentences',
    instructions: `1. Read and practice our 5 weekly spelling words:
   • bright
   • gentle
   • honest
   • friendly
   • school
2. Write each word 2 times in your notebook.
3. Form 1 complete sentence using each word.
4. Snap a photo of your notebook or type your sentences into the answer box below!`,
    points: 5,
  },
  {
    name: '🔢 Mental Maths & Quick Tables',
    badge: 'Numeracy',
    subject: 'maths',
    title: 'Mental Maths & Multiplication Drill',
    instructions: `1. Complete the 3x and 4x multiplication table drill.
2. Solve the following quick sums in your exercise notebook:
   a) 24 + 18 = ?
   b) 50 - 23 = ?
   c) 4 × 7 = ?
   d) Half of 36 = ?
3. Take a photo of your workings or type your final answers in order.`,
    points: 10,
  },
  {
    name: '🔬 Science Discovery & Nature Walk',
    badge: 'Discovery',
    subject: 'science',
    title: 'Living vs Non-Living Things in Our Environment',
    instructions: `Take a 5-minute walk around your home or compound!
1. Find 3 living things and 3 non-living things.
2. In your exercise book (or using the drawing pad below), write or draw them.
3. In one short sentence, explain why one of your choices is a living thing.`,
    points: 5,
  },
  {
    name: '📖 Reading Aloud & Fluency',
    badge: 'Reading',
    subject: 'reading',
    title: 'Story Reading & Character Sketch',
    instructions: `1. Read the assigned story page aloud to mummy, daddy, or your elder sibling.
2. Who is your favorite character in the story and why?
3. Write 2 sentences describing them, or draw a picture of them using the drawing tool.`,
    points: 5,
  },
  {
    name: '🎨 Creative Art & Drawing',
    badge: 'Creative',
    subject: 'art',
    title: 'Draw & Color: My Family / My Pet',
    instructions: `1. Draw a cheerful picture of your family or your favorite pet animal.
2. Color it beautifully with crayons or colored pencils.
3. You can draw it on paper and take a photo, or draw directly on the digital doodle pad!`,
    points: 5,
  },
];

export default function AssignHomeworkModal({
  isOpen,
  onClose,
  classes = [],
  selectedClassId,
  setSelectedClassId,
  onSubmit,
  isPending = false,
  error = null,
}) {
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    // Default due tomorrow at 8:00 AM
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    tmrw.setHours(8, 0, 0, 0);
    return tmrw.toISOString().slice(0, 16);
  });
  const [points, setPoints] = useState(5); // Default 5 Gold Stars
  const [selectedSubject, setSelectedSubject] = useState(PRIMARY_SUBJECTS[0].id);
  const [rewardType, setRewardType] = useState('stars'); // 'stars' or 'points'
  const [submissionGuidance, setSubmissionGuidance] = useState('all'); // 'photo', 'text', 'drawing', 'all'
  const [formValidation, setFormValidation] = useState(null);

  // Apply quick template
  const handleApplyTemplate = (tpl) => {
    setTitle(tpl.title);
    setInstructions(tpl.instructions);
    setPoints(tpl.points);
    setSelectedSubject(tpl.subject);
    setFormValidation(null);
  };

  // Quick Due Date helpers
  const setQuickDue = (type) => {
    const d = new Date();
    if (type === 'tomorrow_morning') {
      d.setDate(d.getDate() + 1);
      d.setHours(8, 0, 0, 0);
    } else if (type === 'tomorrow_afternoon') {
      d.setDate(d.getDate() + 1);
      d.setHours(16, 0, 0, 0);
    } else if (type === 'friday') {
      const day = d.getDay();
      const diff = (5 - day + 7) % 7 || 7;
      d.setDate(d.getDate() + diff);
      d.setHours(17, 0, 0, 0);
    } else if (type === 'next_monday') {
      const day = d.getDay();
      const diff = (1 - day + 7) % 7 || 7;
      d.setDate(d.getDate() + diff);
      d.setHours(8, 0, 0, 0);
    }
    setDueDate(d.toISOString().slice(0, 16));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedClassId) {
      setFormValidation('Please choose a class/grade for this homework.');
      return;
    }
    if (!title.trim()) {
      setFormValidation('Please give your homework a friendly title.');
      return;
    }
    if (!instructions.trim()) {
      setFormValidation('Please write simple instructions for the pupils.');
      return;
    }
    if (!dueDate) {
      setFormValidation('Please choose when this homework is due.');
      return;
    }

    setFormValidation(null);
    onSubmit({
      classId: selectedClassId,
      title: title.trim(),
      instructions: instructions.trim(),
      dueDate: new Date(dueDate).toISOString(),
      points: Number(points) || 5,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Set & Assign Primary School Homework 🎒 ⭐"
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Validation or API error alert */}
        {(formValidation || error) && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{formValidation || error}</span>
          </div>
        )}

        {/* Top Primary School Encouragement Banner */}
        <div className="p-4 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border border-amber-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎒</span>
            <div>
              <h4 className="text-sm font-extrabold text-amber-950">Primary Homework Wizard</h4>
              <p className="text-xs text-amber-800">
                Keep instructions short, clear, and encouraging. Pupils can snap notebook photos or type!
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 bg-white/80 border border-amber-300 rounded-full text-xs font-bold text-amber-900 shadow-xs">
            ⭐ Child-Friendly Standard
          </span>
        </div>

        {/* 1. Class Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-brand-600" />
            1. Select Class / Grade Level
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            required
          >
            {classes.length === 0 ? (
              <option value="">No classes found</option>
            ) : (
              classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.studentCount || cls.studentsCount || 0} pupils enrolled)
                </option>
              ))
            )}
          </select>
        </div>

        {/* 2. Ready-to-Use Homework Templates */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              2. Quick Homework Presets (Click to autofill!)
            </label>
            <span className="text-[11px] text-slate-400">Saves teacher time</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {HOMEWORK_TEMPLATES.map((tpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyTemplate(tpl)}
                className="p-2.5 text-left rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 bg-white transition-all group flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-amber-900 line-clamp-1 block">
                    {tpl.name}
                  </span>
                  <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{tpl.title}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px]">
                  <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold group-hover:bg-amber-100 group-hover:text-amber-800">
                    {tpl.badge}
                  </span>
                  <span className="text-amber-600 font-bold flex items-center gap-0.5">
                    {tpl.points} ⭐
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Title & Subject Tag */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Homework Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Maths: Workbook Page 24 (Sums 1 to 5)"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Subject Category Tag
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRIMARY_SUBJECTS.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelectedSubject(sub.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    selectedSubject === sub.id
                      ? `${sub.color} ring-2 ring-brand-500/50 scale-[1.02] shadow-xs`
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>{sub.emoji}</span>
                  <span>{sub.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Homework Instructions for Pupil & Parent */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-brand-600" />
              Homework Questions & Instructions
            </label>
            <span className="text-[11px] text-slate-400">Clear steps (1, 2, 3) work best</span>
          </div>
          <textarea
            rows={5}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="1. Open workbook to Page 15.&#10;2. Answer questions 1 to 5 neatly in pencil.&#10;3. Snap a clear photo with parent's phone and submit here!&#10;&#10;💡 Note for Parents: Guide the child on question 3 if needed."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed font-normal"
            required
          />
        </div>

        {/* 5. Recommended Pupil Submission Mode */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Recommended Pupil Hand-in Method
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'all', label: 'Any Method', desc: 'Photo, typed, or doodle', icon: Sparkles },
              { id: 'photo', label: '📸 Notebook Photo', desc: 'Snap exercise book', icon: Camera },
              { id: 'text', label: '✏️ Type Answer', desc: 'Type directly here', icon: Edit3 },
              { id: 'drawing', label: '🎨 Digital Drawing', desc: 'Draw on doodle pad', icon: Palette },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSubmissionGuidance(m.id)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  submissionGuidance === m.id
                    ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <span className="text-xs font-bold text-slate-900 block">{m.label}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">{m.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 6. Due Date & Quick Shortcuts */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-600" />
              Submission Deadline
            </label>
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setQuickDue('tomorrow_morning')}
                className="px-2 py-1 text-[11px] font-semibold bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-300 transition-colors"
              >
                🌅 Tomorrow 8 AM
              </button>
              <button
                type="button"
                onClick={() => setQuickDue('tomorrow_afternoon')}
                className="px-2 py-1 text-[11px] font-semibold bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-300 transition-colors"
              >
                🎒 Tomorrow 4 PM
              </button>
              <button
                type="button"
                onClick={() => setQuickDue('friday')}
                className="px-2 py-1 text-[11px] font-semibold bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-300 transition-colors"
              >
                📅 Friday 5 PM
              </button>
              <button
                type="button"
                onClick={() => setQuickDue('next_monday')}
                className="px-2 py-1 text-[11px] font-semibold bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-300 transition-colors"
              >
                🚀 Next Monday
              </button>
            </div>
          </div>
          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            required
          />
        </div>

        {/* 7. Reward / Gold Stars */}
        <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg">
              ⭐
            </div>
            <div>
              <span className="text-xs font-bold text-amber-950 block">Primary School Reward</span>
              <span className="text-[11px] text-amber-800">
                Pupils are rewarded with Gold Stars and stickers upon completion!
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {[5, 10, 20, 100].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setPoints(num)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  points === num
                    ? 'bg-amber-500 text-slate-950 shadow-sm scale-105'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-amber-50'
                }`}
              >
                {num === 5 ? '5 ⭐ Stars' : num === 10 ? '10 ⭐ Stars' : `${num} Pts`}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 rounded-xl text-sm font-extrabold transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {isPending ? 'Publishing Homework...' : 'Publish Homework to Pupils 🚀'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
