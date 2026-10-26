import React, { useEffect } from 'react';
import Modal from '../Modal';
import { Sparkles, Star, Award, CheckCircle2, ArrowRight } from 'lucide-react';

export default function CelebrationModal({ isOpen, onClose, assignmentTitle, points = 5 }) {
  useEffect(() => {
    if (isOpen) {
      // Zero-dependency pure CSS/JS audio chime using Web Audio API!
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const now = audioCtx.currentTime;
        // Play friendly 3-note arpeggio (C5 -> E5 -> G5)
        const notes = [523.25, 659.25, 783.99];
        notes.forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);
          gain.gain.setValueAtTime(0.15, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.35);
        });
      } catch (e) {
        // AudioContext not allowed or not supported, ignore silently
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="max-w-md">
      <div className="text-center py-4 px-2 space-y-4">
        {/* Animated Celebration Icon */}
        <div className="relative inline-block mx-auto">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 flex items-center justify-center text-4xl shadow-xl shadow-amber-200 animate-bounce">
            ⭐
          </div>
          <span className="absolute -top-1 -right-1 text-2xl animate-pulse">🎉</span>
          <span className="absolute -bottom-1 -left-1 text-2xl animate-pulse">✨</span>
        </div>

        {/* Title */}
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Homework Handed In!
          </span>
          <h2 className="text-2xl font-black text-slate-900">
            Fantastic Job, Super Pupil!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xs mx-auto">
            You successfully submitted <strong>{assignmentTitle || 'your homework'}</strong> to your class teacher!
          </p>
        </div>

        {/* Reward card */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-2xl p-4 text-left flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-md">
            🏆
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider">
              {points} Star Reward Pending ⭐
            </h4>
            <p className="text-[11px] text-emerald-800 leading-snug">
              Your teacher will mark your work, award your gold stars, and write friendly feedback!
            </p>
          </div>
        </div>

        {/* Close button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-xl text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>High Five! Back to Homework Desk</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  );
}
