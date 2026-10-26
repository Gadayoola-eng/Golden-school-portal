import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import PublicNavbar from '../../components/public/PublicNavbar';
import PublicFooter from '../../components/public/PublicFooter';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  Calendar,
  Clock,
  ShieldCheck,
  Award,
  BookOpen,
  Users,
  Compass,
  Cpu,
  Trophy,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  MapPin,
  Flame,
  Star,
  Quote,
  Building,
  HeartHandshake
} from 'lucide-react';

export default function LandingPage() {
  // Fetch highlights from backend
  const { data: highlightsData, isLoading } = useQuery({
    queryKey: ['landingHighlights'],
    queryFn: async () => {
      const res = await api.get('/content/highlights');
      return res.data;
    },
  });

  const { data: newsData } = useQuery({
    queryKey: ['landingNews'],
    queryFn: async () => {
      const res = await api.get('/content/news');
      return res.data;
    },
  });

  const { data: eventsData } = useQuery({
    queryKey: ['landingEvents'],
    queryFn: async () => {
      const res = await api.get('/content/events');
      return res.data;
    },
  });

  const stats = highlightsData?.stats || [
    { label: 'Common Entrance Distinction', value: '100%', subtitle: 'Admissions to Top Model Colleges' },
    { label: 'Phonics & Reading Mastery', value: '99.2%', subtitle: 'Early Literacy & Spelling Fluency' },
    { label: 'Teacher to Pupil Ratio', value: '1 : 10', subtitle: 'Intensive Individual Child Care' },
    { label: 'Junior STEM & Sports Trophies', value: '32+', subtitle: 'Spelling Bee, Robotics & Athletics' },
  ];

  const levels = highlightsData?.levels || [
    {
      id: 'creche-playgroup',
      title: 'Crèche & Toddler Playgroup',
      ageGroup: 'Ages 18 Months – 3 Years',
      tagline: 'Gentle Sensory & Social Development',
      description: 'A warm, hygienic, and loving sanctuary fostering speech initiation, fine motor dexterity, and joyful discovery.',
      features: ['Cushioned Sensory Play Area', 'Dedicated Pediatric Nurses', 'Tender Potty Training Support', 'Daily Parent Milestone Logs'],
    },
    {
      id: 'nursery-kindergarten',
      title: 'Nursery & Kindergarten (EYFS)',
      ageGroup: 'Ages 3 – 5 Years (Nursery 1 & 2, KG)',
      tagline: 'Montessori Apparatus & Jolly Phonics',
      description: 'Building strong phonemic awareness, number sense, creative storytelling, and independent self-care skills.',
      features: ['Jolly Phonics 42 Sounds', 'Montessori Math Apparatus', 'Little Explorers Nature Corner', 'Creative Crafts & Sand Play'],
    },
    {
      id: 'lower-primary',
      title: 'Lower Primary (Basic 1 – 3)',
      ageGroup: 'Ages 5 – 8 Years (Primary 1 to 3)',
      tagline: 'Core Literacy & Mental Numeracy',
      description: 'Empowering pupils with fluent chapter-book reading, mental arithmetic, cursive penmanship, and basic science.',
      features: ['Spelling Bee Mentorship', 'Hands-On Science Experiments', 'Introductory Scratch Coding', 'Music, Choir & Percussion'],
    },
    {
      id: 'upper-primary',
      title: 'Upper Primary & Common Entrance (Basic 4 – 6)',
      ageGroup: 'Ages 8 – 11 Years (Primary 4 to 6)',
      tagline: 'Academic Rigor & Leadership Readiness',
      description: 'Refining advanced quantitative reasoning, creative essay writing, scientific inquiry, and 100% Common Entrance exam success.',
      features: ['Intensive NCEE & Scholarship Prep', 'Young Robotics Engineers Club', 'French Diction & Public Speaking', 'Student Prefect Council'],
    },
  ];

  // Resumption Countdown Timer (Target: 14 September 2026)
  const targetDate = new Date('2026-09-14T08:00:00Z').getTime();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function calculateCountdown() {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    }

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const recentNews = (newsData?.news || []).slice(0, 3);
  const upcomingEvents = (eventsData?.events || []).slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Universal Public Navbar with Ticker */}
      <PublicNavbar />

      {/* ========================================================== */}
      {/* 1. HERO SECTION & RESUMPTION COUNTDOWN */}
      {/* ========================================================== */}
      <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Glow ambient background elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:28px_28px] opacity-10 pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* School Crest Badge */}
          <div className="flex flex-col items-center justify-center mb-6">
            <img
              src="/logo.png"
              alt="Golden International School Crest"
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-2xl mb-4 hover:scale-105 transition-transform"
            />
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold backdrop-blur-md shadow-lg shadow-amber-500/10">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>THE WORD: Psalm 119:105 • Odo - Iro Street, Ido-Ekiti, Ekiti State</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none mb-6">
            Nurturing Young Minds with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200">
              Godliness, Distinction
            </span>{' '}
            & Academic Excellence
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
            Ekiti State's premier early childhood and primary institution (Crèche to Basic 6). We blend phonics fluency, mental numeracy, sound Christian morals, and 100% Common Entrance distinction in a loving, child-centered environment.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-14">
            <Link
              to="/apply"
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-xl shadow-amber-500/25"
            >
              <span>Apply for 2026/2027 Admission</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/apply#visit"
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-sm transition-colors"
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Book a Campus Tour</span>
            </Link>
            <Link
              to="/apply#status"
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Track Application Status →
            </Link>
          </div>

          {/* COUNTDOWN TIMER CARD */}
          <div className="max-w-2xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-2xl">
            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 mb-3">
              <Clock className="w-4 h-4" />
              Countdown to 2026/2027 Academic Resumption
            </div>

            <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-lg mx-auto">
              <div className="bg-slate-900/80 rounded-2xl p-3 border border-slate-800">
                <span className="text-2xl sm:text-4xl font-mono font-black text-white block">
                  {timeLeft.days}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Days</span>
              </div>
              <div className="bg-slate-900/80 rounded-2xl p-3 border border-slate-800">
                <span className="text-2xl sm:text-4xl font-mono font-black text-white block">
                  {timeLeft.hours}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hours</span>
              </div>
              <div className="bg-slate-900/80 rounded-2xl p-3 border border-slate-800">
                <span className="text-2xl sm:text-4xl font-mono font-black text-white block">
                  {timeLeft.minutes}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Minutes</span>
              </div>
              <div className="bg-slate-900/80 rounded-2xl p-3 border border-slate-800">
                <span className="text-2xl sm:text-4xl font-mono font-black text-amber-400 block">
                  {timeLeft.seconds}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Seconds</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-3">
              Next Entrance Assessment: <strong>Saturday, April 18, 2026 (Batch A)</strong>
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================== */}
      {/* 2. STATS & KEY ACHIEVEMENTS BAR */}
      {/* ========================================================== */}
      <section className="bg-amber-500 py-8 px-4 sm:px-6 lg:px-8 text-slate-950 shadow-md">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {stats.map((s, idx) => (
            <div key={idx} className="space-y-0.5">
              <span className="text-3xl sm:text-4xl font-black tracking-tight block">
                {s.value}
              </span>
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide block">
                {s.label}
              </span>
              <span className="text-[11px] font-medium text-slate-900/70 block">
                {s.subtitle}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================== */}
      {/* 3. EDUCATIONAL LEVELS OVERVIEW */}
      {/* ========================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block mb-1">
            Academic Divisions
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Comprehensive Education from Toddler to Pre-University
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Each level is carefully customized with age-appropriate learning frameworks, modern technology, and caring homeroom mentorship.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {levels.map((lvl) => (
            <div
              key={lvl.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    {lvl.ageGroup}
                  </span>
                  <GraduationCap className="w-5 h-5 text-slate-400 group-hover:text-amber-500 transition-colors" />
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 mb-1 group-hover:text-amber-600 transition-colors">
                  {lvl.title}
                </h3>
                <p className="text-xs font-semibold text-slate-500 mb-3">{lvl.tagline}</p>
                <p className="text-xs text-slate-600 leading-relaxed mb-5">
                  {lvl.description}
                </p>

                {/* Features checklist */}
                <div className="space-y-1.5 border-t border-slate-100 pt-4 mb-4">
                  {lvl.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                to="/apply"
                className="flex items-center justify-between w-full pt-3 border-t border-slate-100 text-xs font-bold text-slate-900 group-hover:text-amber-600"
              >
                <span>Apply for this level</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================== */}
      {/* 4. SCHOOL LEADERSHIP: PROPRIETRESS & HEAD OF SCHOOL */}
      {/* ========================================================== */}
      <section className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-y border-slate-800">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header Tag */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-3">
              <Quote className="w-4 h-4 text-amber-400" />
              <span>Executive Leadership & Vision</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Guided by God's Word, Led with Passion
            </h2>
            <p className="text-sm text-slate-300 mt-2">
              Meet the leadership team steering Golden International School towards academic distinction, disciplined character, and visionary primary education.
            </p>
          </div>

          {/* Two-Column Leadership Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* 1. PROPRIETRESS CARD */}
            <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-2xl relative flex flex-col justify-between backdrop-blur-md hover:border-amber-500/60 transition-all">
              <div>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
                  <div className="relative shrink-0">
                    <img
                      src="/proprietress.jpg"
                      alt="Mrs. Ogunleye E.A - Proprietress"
                      className="w-32 h-44 sm:w-36 sm:h-48 rounded-2xl object-cover shadow-2xl border-2 border-amber-400/80"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-amber-500 text-slate-950 p-1.5 rounded-xl shadow-md">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-center sm:text-left">
                    <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 mb-2">
                      Proprietress & Founder
                    </span>
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      Mrs. Ogunleye E.A
                    </h3>
                    <p className="text-xs font-bold text-amber-400 mt-0.5">
                      Proprietress, Golden International School
                    </p>
                    <p className="text-[11px] font-semibold text-slate-400 mt-2 flex items-center justify-center sm:justify-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      Ido-Ekiti, Ekiti State, Nigeria
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-slate-300 text-xs sm:text-sm leading-relaxed border-t border-slate-800 pt-4">
                  <p className="italic text-amber-200/90 font-medium">
                    "Thy word is a lamp unto my feet, and a light unto my path. — Psalm 119:105"
                  </p>
                  <p>
                    "Golden International School was birthed with a divine calling: to create a nurturing learning haven where every child is loved, treasured, and guided in the fear and wisdom of God. We take pride in building solid foundational numeracy and literacy from their tender early years."
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">School Motto:</span>
                <span className="text-amber-400 font-bold">The Word: Psalm 119:105</span>
              </div>
            </div>

            {/* 2. HEAD OF SCHOOL CARD */}
            <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-2xl relative flex flex-col justify-between backdrop-blur-md hover:border-amber-500/60 transition-all">
              <div>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
                  <div className="relative shrink-0">
                    <img
                      src="/head_of_school.jpg"
                      alt="Pastor Ogunleye S.A - Head of School"
                      className="w-32 h-44 sm:w-36 sm:h-48 rounded-2xl object-cover shadow-2xl border-2 border-amber-400/80"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-amber-500 text-slate-950 p-1.5 rounded-xl shadow-md">
                      <Award className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-center sm:text-left">
                    <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 mb-2">
                      Head of School
                    </span>
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      Pastor Ogunleye S.A
                    </h3>
                    <p className="text-xs font-bold text-amber-400 mt-0.5">
                      Head of School & Educational Director
                    </p>
                    <p className="text-[11px] font-semibold text-slate-400 mt-2 flex items-center justify-center sm:justify-start gap-1">
                      <Building className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      Academic Affairs & Administration
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-slate-300 text-xs sm:text-sm leading-relaxed border-t border-slate-800 pt-4">
                  <p className="italic text-amber-200/90 font-medium">
                    "We don't merely prepare children to pass examinations; we build enduring foundations for life."
                  </p>
                  <p>
                    "At Golden International School, our classroom atmosphere is joyful, orderly, and mentally stimulating. Through Jolly Phonics, mental numeracy drills, and holistic child development, we ensure every pupil graduates with exceptional confidence, discipline, and outstanding common entrance results."
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <Link
                  to="/apply#visit"
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  Schedule an Appointment with Head of School →
                </Link>
                <span className="text-emerald-400 font-bold text-[11px] bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Admissions Open
                </span>
              </div>
            </div>
          </div>

          {/* GRADUATING PUPILS & CLASS OF 2026 FEATURE STRIP */}
          <div className="bg-gradient-to-r from-amber-600/20 via-amber-500/10 to-amber-600/20 rounded-3xl p-6 sm:p-8 border border-amber-500/30 flex flex-col md:flex-row items-center gap-6">
            <div className="shrink-0">
              <img
                src="/pupils_graduates.jpg"
                alt="Golden International School Graduating Pupils - Class of 2026"
                className="w-56 sm:w-64 h-36 rounded-2xl object-cover shadow-lg border border-white/20"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 inline-block mb-2">
                Class of 2026 Achievers
              </span>
              <h4 className="text-xl sm:text-2xl font-black text-white">
                Celebrating Our Brilliant Primary Graduates
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                Our pupils stand tall in academic distinction, phonics decoding, mental math, and moral integrity. We celebrate our graduating scholars stepping out into prestigious secondary colleges.
              </p>
            </div>
            <div className="shrink-0">
              <Link
                to="/apply"
                className="px-5 py-3 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-lg block text-center"
              >
                Enroll Your Child Today →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================== */}
      {/* 5. CAMPUS LIFE & WORLD-CLASS FACILITIES */}
      {/* ========================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block mb-1">
            State-Of-The-Art Infrastructure
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Designed for Exploration, Innovation & Safety
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Located on Odo - Iro Street, Ido-Ekiti, Ekiti State, our campus provides safe, modern, and technologically inspiring environments for every scholar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              Robotics, AI & STEM Innovation Suite
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Equipped with 3D printers, IoT microcontrollers, Lego Mindstorms kits, and high-speed fiber internet for coding and algorithmic competitions.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              Olympic Athletics Complex & Aquatic Center
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Fitted with a 25-meter heated swimming pool, 400m synthetic tartan running track, FIFA-standard turf football pitch, and basketball courts.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              Boarding Dormitories & Pastoral Care
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Modern air-conditioned suites with live-in houseparents, registered nurse medical infirmary, study lounges, and balanced nutritionist-planned menus.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================== */}
      {/* 6. LATEST NEWS & UPCOMING EVENTS PREVIEW */}
      {/* ========================================================== */}
      <section className="bg-slate-100/70 py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block mb-1">
                Campus Updates
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Latest News & Upcoming Calendar
              </h2>
            </div>
            <Link
              to="/news"
              className="flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-800"
            >
              <span>View All News & Full Event Calendar</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* News Articles (2 Columns) */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentNews.map((n) => (
                <div
                  key={n.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-amber-300 transition-all shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                      <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                        {n.category}
                      </span>
                      <span>{n.date}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-2 line-clamp-2 hover:text-amber-600">
                      {n.title}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                      {n.excerpt}
                    </p>
                  </div>
                  <Link
                    to="/news"
                    className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                  >
                    Read Full Story <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>

            {/* Upcoming Events Agenda (1 Column) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                Upcoming Academic Events
              </h3>

              <div className="space-y-3">
                {upcomingEvents.map((evt) => (
                  <div key={evt.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex flex-col items-center justify-center shrink-0 text-center font-bold">
                      <span className="text-xs leading-none">{evt.date.split(' ')[0]}</span>
                      <span className="text-[9px] uppercase tracking-wider">{evt.date.split(' ')[1]}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-bold text-slate-900 truncate">{evt.title}</h5>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {evt.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to="/news"
                className="w-full block text-center py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
              >
                Open Full Events Calendar
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================== */}
      {/* 7. PARENT & ALUMNI TESTIMONIALS */}
      {/* ========================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block mb-1">
            Voices of Our Community
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Trusted by Inspiring Families Across the Globe
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <p className="text-xs text-slate-700 italic leading-relaxed mb-6">
              "Enrolling our children at Golden International Primary was the best decision. The Jolly Phonics reading mastery, mental math agility, and loving care in Nursery and Primary 2 have been extraordinary."
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                OA
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">Dr. & Mrs. O. Adeleke</h5>
                <p className="text-[11px] text-slate-500">Parents of Nursery 2 & Primary 2 Pupils</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <p className="text-xs text-slate-700 italic leading-relaxed mb-6">
              "The thorough preparation for the National Common Entrance Examination (NCEE) and Cambridge Primary Checkpoint helped our son score in the top 1% nationwide, earning admission into King's College on merit!"
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs">
                KA
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">Barrister Kenneth Alabi</h5>
                <p className="text-[11px] text-slate-500">Parent of Primary 6 (Basic 6) Graduate</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <p className="text-xs text-slate-700 italic leading-relaxed mb-6">
              "As working parents, finding a safe, stimulating Crèche and Lower Primary school with dedicated phonics coaches, Little Einsteins STEAM, and swimming lessons was a blessing. Our daughter loves school every morning!"
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                FM
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">Mrs. Fatima Mohammed</h5>
                <p className="text-[11px] text-slate-500">Parent of Crèche & Primary 1 Pupils</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================== */}
      {/* 8. FINAL CALL TO ACTION BANNER */}
      {/* ========================================================== */}
      <section className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="text-xs font-black uppercase tracking-widest bg-slate-950 text-amber-400 px-3 py-1 rounded-full inline-block">
            Secure Your Child's Bright Future
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950">
            Admissions for 2026/2027 Academic Session are Filling Fast
          </h2>
          <p className="text-sm text-slate-900 max-w-2xl mx-auto font-medium">
            Take the first step today. Submit your application online in minutes, book a physical school tour, or download our prospectus.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              to="/apply"
              className="px-8 py-3.5 rounded-2xl text-sm font-black bg-slate-950 text-white hover:bg-slate-900 transition-colors shadow-lg"
            >
              Start Online Application Wizard
            </Link>
            <Link
              to="/downloads"
              className="px-6 py-3.5 rounded-2xl text-sm font-bold bg-white text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200"
            >
              Download Admission Prospectus (PDF)
            </Link>
          </div>
        </div>
      </section>

      {/* Public Footer */}
      <PublicFooter />
    </div>
  );
}
