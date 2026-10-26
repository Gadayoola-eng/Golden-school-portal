import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Phone,
  Sparkles,
  X,
  Send,
  ExternalLink,
  Bot,
  HelpCircle,
  Calendar,
  FileText,
  CheckCircle2,
  ChevronUp,
  Copy,
  ArrowRight
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

// Automated FAQ knowledgebase for the Floating AI Assistant
const KNOWLEDGE_BASE = [
  {
    triggers: ['apply', 'admission', 'enroll', 'form', 'how to apply', 'register'],
    answer: "Admissions for the 2026/2027 Academic Session are currently open for Early Years (Crèche, Nursery, KG) and Primary (Basic 1–6)! You can complete the 4-step online application wizard right here on the portal.",
    cta: { text: "Open Online Application Form", link: "/apply" }
  },
  {
    triggers: ['exam', 'test', 'entrance', 'hall slip', 'venue', 'date'],
    answer: "Primary Diagnostic & Foundational Readiness Assessment is scheduled for Saturday, 18th April 2026 from 09:00 AM to 12:30 PM at Campus Hall A. You can view your child's allocated seat number and print your hall slip via the tracker.",
    cta: { text: "Track Entrance Exam Slip", link: "/apply#status" }
  },
  {
    triggers: ['fee', 'tuition', 'cost', 'payment', 'price', 'prospectus'],
    answer: "Tuition schedules vary by early years and primary levels. The official 2026/2027 Primary Prospectus & Fee Breakdown document is available for immediate download in our Download Centre.",
    cta: { text: "Download Fee Structure (PDF)", link: "/downloads" }
  },
  {
    triggers: ['tour', 'visit', 'campus', 'location', 'where', 'address'],
    answer: "We are located at Odo - Iro Street, Ido-Ekiti, Ekiti State. We offer guided parent tours of our crèche, nursery, and primary classrooms every Monday through Friday (10:00 AM & 02:00 PM).",
    cta: { text: "Book a Campus Tour", link: "/apply#visit" }
  },
  {
    triggers: ['report', 'result', 'grade', 'card', 'scores', 'ca'],
    answer: "Terminal Report Cards and Continuous Assessment result sheets can be accessed securely by authenticated pupils, parents, and teachers on the Result Checker page.",
    cta: { text: "Go to Result Checker", link: "/reports" }
  },
  {
    triggers: ['career', 'job', 'teach', 'hiring', 'vacancy', 'cv'],
    answer: "We are actively recruiting passionate educators for Lower/Upper Primary, Jolly Phonics/Diction, and Montessori Early Childhood. You can explore openings and submit your CV on our Careers Portal.",
    cta: { text: "View Career Vacancies", link: "/careers" }
  }
];

export default function FloatingActionBar() {
  const toast = useToast();
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "👋 Hello! I am Goldie, your AI Admissions & Primary Campus Guide. How may I assist you today with Golden International Primary School?",
      time: 'Just now',
    }
  ]);

  useEffect(() => {
    if (chatOpen && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, chatOpen, isTyping]);

  const handleSendMessage = (textToSend) => {
    const query = (textToSend || chatInput).trim();
    if (!query) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    // Find automated reply in Knowledgebase
    setTimeout(() => {
      const qLower = query.toLowerCase();
      const matched = KNOWLEDGE_BASE.find((k) =>
        k.triggers.some((t) => qLower.includes(t))
      );

      const botReply = matched
        ? {
            id: Date.now() + 1,
            sender: 'bot',
            text: matched.answer,
            cta: matched.cta,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        : {
            id: Date.now() + 1,
            sender: 'bot',
            text: "Thank you for asking! For detailed personalized inquiries, you can chat directly with our Admissions Desk on WhatsApp or schedule a campus tour.",
            cta: { text: "Chat on WhatsApp (09120771514)", link: "https://wa.me/2349120771514" },
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

      setIsTyping(false);
      setMessages((prev) => [...prev, botReply]);
    }, 700);
  };

  const copyPhoneNumber = () => {
    navigator.clipboard?.writeText('08062392750');
    toast.success('Admissions phone number (08062392750) copied to clipboard.');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 print:hidden">
      {/* EXPANDABLE AI CHAT ASSISTANT DRAWER */}
      {chatOpen && (
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-80 sm:w-96 max-h-[520px] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200 mb-2">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Golden International School"
                className="w-9 h-9 object-contain drop-shadow shrink-0"
              />
              <div>
                <h4 className="text-sm font-extrabold flex items-center gap-1.5 leading-tight">
                  Goldie Assistant
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                </h4>
                <p className="text-[10px] text-amber-400 font-semibold">GIS Admissions & Primary AI</p>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
              aria-label="Close Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick FAQ Chips */}
          <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
            <button
              onClick={() => handleSendMessage("How do I apply for admission?")}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-amber-400 text-slate-700 whitespace-nowrap shrink-0 transition-colors"
            >
              🎓 How to Apply
            </button>
            <button
              onClick={() => handleSendMessage("When is the entrance exam?")}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-amber-400 text-slate-700 whitespace-nowrap shrink-0 transition-colors"
            >
              📅 Exam Dates
            </button>
            <button
              onClick={() => handleSendMessage("What are the fees?")}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-amber-400 text-slate-700 whitespace-nowrap shrink-0 transition-colors"
            >
              💰 Fees
            </button>
            <button
              onClick={() => handleSendMessage("Can I book a campus tour?")}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-amber-400 text-slate-700 whitespace-nowrap shrink-0 transition-colors"
            >
              🏛️ School Tour
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-slate-50/50 min-h-[220px]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-br-xs'
                      : 'bg-white border border-slate-200/90 text-slate-800 shadow-2xs rounded-bl-xs'
                  }`}
                >
                  <p>{m.text}</p>

                  {/* Optional CTA Button in Bot Message */}
                  {m.cta && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      {m.cta.link.startsWith('http') ? (
                        <a
                          href={m.cta.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition-colors"
                        >
                          <span>{m.cta.text}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <button
                          onClick={() => {
                            setChatOpen(false);
                            navigate(m.cta.link);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition-colors"
                        >
                          <span>{m.cta.text}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{m.time}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 bg-white p-2.5 rounded-xl border border-slate-200 w-20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask anything about GIS..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-40 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* FLOATING ACTION PILLS ROW */}
      <div className="flex items-center gap-2.5">
        {/* 1. WHATSAPP CHAT BUTTON */}
        <a
          href="https://wa.me/2349120771514?text=Hello%20Golden%20International%20School%2C%20Ido-Ekiti%2C%20I%20would%20like%20to%20inquire%20about%20admissions%20and%20enrollment."
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:scale-105"
          aria-label="Chat on WhatsApp"
        >
          <MessageSquare className="w-6 h-6" />
          {/* Tooltip */}
          <span className="absolute right-14 whitespace-nowrap bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md pointer-events-none">
            WhatsApp 09120771514
          </span>
        </a>

        {/* 2. DIRECT CALL BUTTON */}
        <a
          href="tel:08062392750"
          onClick={(e) => {
            copyPhoneNumber();
          }}
          className="group relative flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/30 transition-all duration-200 hover:scale-105"
          aria-label="Call Admissions Reception"
        >
          <Phone className="w-5 h-5 text-amber-400" />
          {/* Tooltip */}
          <span className="absolute right-14 whitespace-nowrap bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md pointer-events-none">
            Call 08062392750
          </span>
        </a>

        {/* 3. FLOATING AI ASSISTANT TOGGLE */}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className={`group relative flex items-center gap-2 px-4 h-12 rounded-2xl font-black text-xs transition-all duration-200 shadow-xl hover:scale-105 ${
            chatOpen
              ? 'bg-slate-900 text-white'
              : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30'
          }`}
          aria-label="Open Admissions Assistant"
        >
          <Bot className="w-5 h-5" />
          <span className="hidden sm:inline">Ask Goldie AI</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
        </button>
      </div>
    </div>
  );
}
