const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

let prisma;
let isPostgresAvailable = false;

// In-memory/JSON fallback store for dev when Postgres server is not running
class MemoryDB {
  constructor() {
    this.users = [];
    this.classes = [];
    this.enrollments = [];
    this.assignments = [];
    this.submissions = [];
    this.bills = [];
    this.attendances = [];
    this.timetables = [];
    this.reportCards = [];
    this.applications = [];
    this.campusVisits = [];
    this.newsArticles = [];
    this.events = [];
    this.downloads = [];
    this.announcements = [];
    this.jobListings = [];
    this.jobApplications = [];
    this.seedDemoData();
  }

  seedDemoData() {
    const defaultPasswordHash = bcrypt.hashSync('password123', 10);
    
    // Seed Teacher
    const teacherId = 'teacher-uuid-101';
    const teacher = {
      id: teacherId,
      name: 'Prof. Sarah Connor',
      email: 'teacher@portal.edu',
      password: defaultPasswordHash,
      role: 'TEACHER',
      createdAt: new Date('2026-01-10T09:00:00Z'),
      updatedAt: new Date('2026-01-10T09:00:00Z'),
    };

    // Seed Student 1
    const student1Id = 'student-uuid-201';
    const student1 = {
      id: student1Id,
      name: 'Alex Mercer',
      email: 'student@portal.edu',
      password: defaultPasswordHash,
      role: 'STUDENT',
      createdAt: new Date('2026-01-12T10:00:00Z'),
      updatedAt: new Date('2026-01-12T10:00:00Z'),
    };

    // Seed Student 2
    const student2Id = 'student-uuid-202';
    const student2 = {
      id: student2Id,
      name: 'Elena Vance',
      email: 'elena@portal.edu',
      password: defaultPasswordHash,
      role: 'STUDENT',
      createdAt: new Date('2026-01-15T11:00:00Z'),
      updatedAt: new Date('2026-01-15T11:00:00Z'),
    };

    // Seed Parent (Parent of Alex Mercer)
    const parentId = 'parent-uuid-701';
    const parent = {
      id: parentId,
      name: 'Eleanor Mercer',
      email: 'parent@portal.edu',
      password: defaultPasswordHash,
      role: 'PARENT',
      childId: student1Id,
      childName: 'Alex Mercer',
      createdAt: new Date('2026-01-14T09:00:00Z'),
      updatedAt: new Date('2026-01-14T09:00:00Z'),
    };

    // Seed Administrator / Registrar
    const adminId = 'admin-uuid-001';
    const admin = {
      id: adminId,
      name: 'Dr. Arthur Pendelton',
      email: 'admin@portal.edu',
      password: defaultPasswordHash,
      role: 'ADMIN',
      createdAt: new Date('2026-01-01T08:00:00Z'),
      updatedAt: new Date('2026-01-01T08:00:00Z'),
    };

    this.users.push(admin, teacher, student1, student2, parent);

    // Seed Primary School Classes
    const classId = 'class-uuid-301';
    const csClass = {
      id: classId,
      name: 'Primary 4 Gold: Mathematics & Mental Numeracy',
      description: 'Foundational arithmetic, mental math drills, fractions, geometry, and problem-solving puzzles.',
      teacherId: teacherId,
      createdAt: new Date('2026-01-15T08:00:00Z'),
      updatedAt: new Date('2026-01-15T08:00:00Z'),
    };

    const class2Id = 'class-uuid-302';
    const webClass = {
      id: class2Id,
      name: 'Primary 4 Gold: English, Phonics & Creative Writing',
      description: 'Grammar mechanics, Jolly Phonics diction, reading comprehension, and narrative storytelling.',
      teacherId: teacherId,
      createdAt: new Date('2026-01-18T08:00:00Z'),
      updatedAt: new Date('2026-01-18T08:00:00Z'),
    };

    this.classes.push(csClass, webClass);

    // Enrollments
    this.enrollments.push(
      {
        id: 'enroll-uuid-401',
        studentId: student1Id,
        classId: classId,
        enrolledAt: new Date('2026-01-16T10:00:00Z'),
      },
      {
        id: 'enroll-uuid-402',
        studentId: student2Id,
        classId: classId,
        enrolledAt: new Date('2026-01-16T11:00:00Z'),
      },
      {
        id: 'enroll-uuid-403',
        studentId: student1Id,
        classId: class2Id,
        enrolledAt: new Date('2026-01-19T10:00:00Z'),
      }
    );

    // Seed Primary School Assignments
    const assignment1Id = 'assign-uuid-501';
    const dueDate1 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days in future
    const assignment1 = {
      id: assignment1Id,
      classId: classId,
      title: 'Numeracy Task: Fractions & Visual Bar Models',
      instructions: 'Complete the fraction exercise on page 42. Draw clear bar models representing 1/2, 1/4, and 3/8 with explanations.',
      dueDate: dueDate1,
      points: 100,
      createdAt: new Date('2026-01-20T09:00:00Z'),
      updatedAt: new Date('2026-01-20T09:00:00Z'),
    };

    const assignment2Id = 'assign-uuid-502';
    const dueDate2 = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days in future
    const assignment2 = {
      id: assignment2Id,
      classId: classId,
      title: 'Storytelling Composition: An Exciting Safari Adventure',
      instructions: 'Write a 3-paragraph descriptive adventure story about exploring a wildlife animal sanctuary. Remember punctuation, capital letters, and adjectives.',
      dueDate: dueDate2,
      points: 50,
      createdAt: new Date('2026-01-22T09:00:00Z'),
      updatedAt: new Date('2026-01-22T09:00:00Z'),
    };

    this.assignments.push(assignment1, assignment2);

    // Seed Submission (Student 2 submitted and graded; Student 1 submitted pending grading)
    this.submissions.push(
      {
        id: 'sub-uuid-601',
        assignmentId: assignment1Id,
        studentId: student2Id,
        textAnswer: 'I finished all 10 fraction word problems and shaded the bar strips for 1/2, 1/4, and 3/8 accurately.',
        fileUrl: null,
        fileName: null,
        submittedAt: new Date('2026-01-21T14:30:00Z'),
        grade: 96,
        feedback: 'Wonderful neatness and accurate shading of fractional parts, Elena!',
        gradedAt: new Date('2026-01-22T16:00:00Z'),
      },
      {
        id: 'sub-uuid-602',
        assignmentId: assignment1Id,
        studentId: student1Id,
        textAnswer: 'Here are my fraction calculations: 1/2 + 2/4 = 1 whole. I also completed the equivalent fractions worksheet.',
        fileUrl: null,
        fileName: null,
        submittedAt: new Date('2026-01-23T11:20:00Z'),
        grade: null,
        feedback: null,
        gradedAt: null,
      }
    );

    // Seed Primary School Bills & Invoices
    this.bills.push(
      {
        id: 'bill-101',
        invoiceNumber: 'GIS-INV-2026-001',
        studentId: student1Id,
        studentName: 'Alex Mercer',
        grade: 'Primary 4 Gold (Basic 4)',
        title: 'Term 1 Primary Tuition & Learning Materials',
        description: 'Covers core academic instruction, reading resources, and curriculum access for Primary 4.',
        category: 'Tuition',
        term: 'Term 1 (2025/2026)',
        amount: 1250.00,
        dueDate: new Date('2026-02-15T23:59:59Z'),
        status: 'PAID',
        paidAt: new Date('2026-02-10T14:32:00Z'),
        paymentMethod: 'Credit Card (ending 4242)',
        transactionRef: 'TXN-98421045',
        payerName: 'Eleanor Mercer',
      },
      {
        id: 'bill-102',
        invoiceNumber: 'GIS-INV-2026-002',
        studentId: student1Id,
        studentName: 'Alex Mercer',
        grade: 'Primary 4 Gold (Basic 4)',
        title: 'Jolly Phonics, Reading & Activity Workbook Pack',
        description: 'Official Jolly Phonics workbooks, numeracy practice workbooks, and art station consumables.',
        category: 'Workbooks & Supplies',
        term: 'Term 1 (2025/2026)',
        amount: 180.00,
        dueDate: new Date('2026-03-01T23:59:59Z'),
        status: 'PAID',
        paidAt: new Date('2026-02-28T09:15:00Z'),
        paymentMethod: 'Bank Transfer (Wire)',
        transactionRef: 'TXN-77319022',
        payerName: 'Eleanor Mercer',
      },
      {
        id: 'bill-103',
        invoiceNumber: 'GIS-INV-2026-003',
        studentId: student1Id,
        studentName: 'Alex Mercer',
        grade: 'Primary 4 Gold (Basic 4)',
        title: 'Term 2 Primary Tuition & Computer Lab Instruction',
        description: 'Comprehensive tuition fee for Term 2 modules, Scratch coding sessions, and homeroom tutoring.',
        category: 'Tuition',
        term: 'Term 2 (2025/2026)',
        amount: 1250.00,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'UNPAID',
        paidAt: null,
        paymentMethod: null,
        transactionRef: null,
        payerName: null,
      },
      {
        id: 'bill-104',
        invoiceNumber: 'GIS-INV-2026-004',
        studentId: student1Id,
        studentName: 'Alex Mercer',
        grade: 'Primary 4 Gold (Basic 4)',
        title: 'Primary Inter-House Sports Day, Swimming & PE Kit',
        description: 'Junior sports day participation, certified swim coach lessons, and house sports jersey.',
        category: 'Sports & PE',
        term: 'Term 2 (2025/2026)',
        amount: 220.00,
        dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        status: 'UNPAID',
        paidAt: null,
        paymentMethod: null,
        transactionRef: null,
        payerName: null,
      },
      {
        id: 'bill-105',
        invoiceNumber: 'GIS-INV-2026-005',
        studentId: student1Id,
        studentName: 'Alex Mercer',
        grade: 'Primary 4 Gold (Basic 4)',
        title: 'Mid-Day Nutritious Lunch & Fruit Snack Programme',
        description: 'Freshly prepared balanced daily lunch and supervised morning organic fruit snack.',
        category: 'Nutrition & Lunch',
        term: 'Term 2 (2025/2026)',
        amount: 340.00,
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        status: 'UNPAID',
        paidAt: null,
        paymentMethod: null,
        transactionRef: null,
        payerName: null,
      }
    );

    // Seed Attendance (Last 14 weekdays for CS101 and WEB200)
    const weekdays = [
      '2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25', '2026-09-26',
      '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03',
      '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09'
    ];

    weekdays.forEach((dateStr, idx) => {
      // Alex Mercer (student1)
      const isAlexLate = idx === 4; // one late arrival
      this.attendances.push({
        id: `att-alex-${idx}`,
        classId: classId,
        studentId: student1Id,
        studentName: 'Alex Mercer',
        date: dateStr,
        status: isAlexLate ? 'LATE' : 'PRESENT',
        remarks: isAlexLate ? 'Late arrival due to morning transit' : 'Active participation',
        markedAt: new Date(`${dateStr}T08:35:00Z`),
        markedBy: teacherId,
      });

      // Elena Vance (student2)
      const isElenaExcused = idx === 8;
      this.attendances.push({
        id: `att-elena-${idx}`,
        classId: classId,
        studentId: student2Id,
        studentName: 'Elena Vance',
        date: dateStr,
        status: isElenaExcused ? 'EXCUSED' : 'PRESENT',
        remarks: isElenaExcused ? 'Inter-school athletics competition representation' : 'Present and attentive',
        markedAt: new Date(`${dateStr}T08:35:00Z`),
        markedBy: teacherId,
      });
    });

    // Seed Primary School Weekly Timetable Schedule (Primary 4 Gold)
    this.timetables = [
      // Monday
      { id: 'tt-1', day: 'Monday', period: 1, time: '08:00 - 08:30', subject: 'Morning Circle, Assembly & Hymns', code: 'ASSEMBLY', room: 'Main Primary Hall', teacher: 'Mrs. O. Bakare', color: 'amber' },
      { id: 'tt-2', day: 'Monday', period: 2, time: '08:30 - 09:30', subject: 'Primary Mathematics & Mental Arithmetic', code: 'MTH401', room: 'Primary 4 Gold Suite', teacher: 'Mrs. Sarah Connor', color: 'blue', classId: classId },
      { id: 'tt-3', day: 'Monday', period: 3, time: '09:30 - 10:30', subject: 'Jolly Phonics, Diction & Reading Fluency', code: 'ENG401', room: 'Primary 4 Gold Suite', teacher: 'Mrs. Sarah Connor', color: 'indigo', classId: class2Id },
      { id: 'tt-4', day: 'Monday', period: 4, time: '11:00 - 12:00', subject: 'Basic Science & Nature Study', code: 'SCI401', room: 'Discovery Lab', teacher: 'Mr. D. Ojo', color: 'emerald' },
      { id: 'tt-5', day: 'Monday', period: 5, time: '12:00 - 13:00', subject: 'Creative Arts, Colouring & Crafts', code: 'ART401', room: 'Junior Art Studio', teacher: 'Ms. A. Bello', color: 'purple' },
      { id: 'tt-6', day: 'Monday', period: 6, time: '13:45 - 14:30', subject: 'Little Coders & Scratch Computing', code: 'ICT401', room: 'Primary Media Suite', teacher: 'Mrs. Sarah Connor', color: 'rose' },
      { id: 'tt-7', day: 'Monday', period: 7, time: '14:30 - 15:15', subject: 'Spelling Bee & Vocabulary Club', code: 'CLUB', room: 'Library Haven', teacher: 'Mrs. B. Cole', color: 'cyan' },

      // Tuesday
      { id: 'tt-8', day: 'Tuesday', period: 1, time: '08:00 - 08:30', subject: 'Homeroom Pastoral Time & Moral Values', code: 'VALUES', room: 'Primary 4 Gold Suite', teacher: 'Mrs. Sarah Connor', color: 'amber' },
      { id: 'tt-9', day: 'Tuesday', period: 2, time: '08:30 - 09:30', subject: 'English Grammar & Sentence Building', code: 'ENG401', room: 'Primary 4 Gold Suite', teacher: 'Mrs. Sarah Connor', color: 'indigo', classId: class2Id },
      { id: 'tt-10', day: 'Tuesday', period: 3, time: '09:30 - 10:30', subject: 'Mathematics Fractions & Shape Geometry', code: 'MTH401', room: 'Primary 4 Gold Suite', teacher: 'Mrs. Sarah Connor', color: 'blue', classId: classId },
      { id: 'tt-11', day: 'Tuesday', period: 4, time: '11:00 - 12:00', subject: 'French for Juniors (Greetings & Vocab)', code: 'FRN401', room: 'Language Room', teacher: 'Mme. C. Dubois', color: 'teal' },
      { id: 'tt-12', day: 'Tuesday', period: 5, time: '12:00 - 13:00', subject: 'Social Studies & Cultural Heritage', code: 'SOC401', room: 'Primary 4 Gold Suite', teacher: 'Mr. E. Okafor', color: 'sky' },
      { id: 'tt-13', day: 'Tuesday', period: 6, time: '13:45 - 14:30', subject: 'Physical & Health Education (PHE)', code: 'PHE401', room: 'Junior Sports Field', teacher: 'Coach T. Adeleke', color: 'orange' },
      { id: 'tt-14', day: 'Tuesday', period: 7, time: '14:30 - 15:15', subject: 'Junior Athletics & Fun Tag Games', code: 'SPORTS', room: 'Primary Playground', teacher: 'Coach T. Adeleke', color: 'orange' },

      // Wednesday
      { id: 'tt-15', day: 'Wednesday', period: 1, time: '08:00 - 08:30', subject: 'Guided Story Reading & Library Corner', code: 'LIB', room: 'Children’s Library', teacher: 'Mrs. B. Cole', color: 'amber' },
      { id: 'tt-16', day: 'Wednesday', period: 2, time: '08:30 - 09:30', subject: 'Mental Arithmetic & Times Tables Clinic', code: 'MTH401', room: 'Primary 4 Gold Suite', teacher: 'Mrs. Sarah Connor', color: 'blue', classId: classId },
      { id: 'tt-17', day: 'Wednesday', period: 3, time: '09:30 - 10:30', subject: 'Creative Writing & Story Composition', code: 'ENG401', room: 'Primary 4 Gold Suite', teacher: 'Mrs. Sarah Connor', color: 'indigo', classId: class2Id },
      { id: 'tt-18', day: 'Wednesday', period: 4, time: '11:00 - 12:00', subject: 'Living Things, Plants & Wildlife Science', code: 'SCI401', room: 'Discovery Lab', teacher: 'Mr. D. Ojo', color: 'emerald' },
      { id: 'tt-19', day: 'Wednesday', period: 5, time: '12:00 - 13:00', subject: 'Civic Education & Good Citizenship', code: 'CIV401', room: 'Primary 4 Gold Suite', teacher: 'Mrs. F. Alabi', color: 'rose' },
      { id: 'tt-20', day: 'Wednesday', period: 6, time: '13:45 - 14:30', subject: 'Junior Music, Rhymes & Percussion', code: 'MUS401', room: 'Music Haven', teacher: 'Mr. P. Balogun', color: 'pink' },
      { id: 'tt-21', day: 'Wednesday', period: 7, time: '14:30 - 15:15', subject: 'Little Einsteins Science Experiment Club', code: 'STEM', room: 'Discovery Lab', teacher: 'Mr. D. Ojo', color: 'purple' },

      // Thursday
      { id: 'tt-22', day: 'Thursday', period: 1, time: '08:00 - 08:30', subject: 'Handwriting & Cursive Penmanship Practice', code: 'PEN', room: 'Primary 4 Gold Suite', teacher: 'Mrs. Sarah Connor', color: 'amber' },
      { id: 'tt-23', day: 'Thursday', period: 2, time: '08:30 - 09:30', subject: 'Word Problems & Quantitative Reasoning', code: 'MTH401', room: 'Primary 4 Gold Suite', teacher: 'Mrs. Sarah Connor', color: 'blue', classId: classId },
      { id: 'tt-24', day: 'Thursday', period: 3, time: '09:30 - 10:30', subject: 'Reading Comprehension & Verbal Aptitude', code: 'ENG401', room: 'Primary 4 Gold Suite', teacher: 'Mrs. Sarah Connor', color: 'indigo', classId: class2Id },
      { id: 'tt-25', day: 'Thursday', period: 4, time: '11:00 - 12:00', subject: 'Agricultural Science & School Farm Tour', code: 'AGR401', room: 'Primary Garden Farm', teacher: 'Mr. D. Ojo', color: 'lime' },
      { id: 'tt-26', day: 'Thursday', period: 5, time: '12:00 - 13:00', subject: 'Computer Literacy: Typing & Paint Studio', code: 'ICT401', room: 'Primary Media Suite', teacher: 'Mrs. Sarah Connor', color: 'blue' },
      { id: 'tt-27', day: 'Thursday', period: 6, time: '13:45 - 14:30', subject: 'Swimming Lessons & Water Safety', code: 'SWIM', room: 'Children’s Splash Pool', teacher: 'Coach T. Adeleke', color: 'cyan' },
      { id: 'tt-28', day: 'Thursday', period: 7, time: '14:30 - 15:15', subject: 'Junior Drama, Role-Play & Speech', code: 'DRAMA', room: 'Little Theatre', teacher: 'Ms. A. Bello', color: 'fuchsia' },

      // Friday
      { id: 'tt-29', day: 'Friday', period: 1, time: '08:00 - 08:30', subject: 'Whole-Primary Praise & Star of the Week', code: 'PRAISE', room: 'Main Primary Hall', teacher: 'Mrs. O. Bakare', color: 'amber' },
      { id: 'tt-30', day: 'Friday', period: 2, time: '08:30 - 09:30', subject: 'Fun Maths Quiz & Brain Puzzles', code: 'MTH401', room: 'Primary 4 Gold Suite', teacher: 'Mrs. Sarah Connor', color: 'blue', classId: classId },
      { id: 'tt-31', day: 'Friday', period: 3, time: '09:30 - 10:30', subject: 'Show and Tell / Public Speaking', code: 'SPEECH', room: 'Primary 4 Gold Suite', teacher: 'Mrs. Sarah Connor', color: 'indigo' },
      { id: 'tt-32', day: 'Friday', period: 4, time: '11:00 - 12:00', subject: 'Junior Orchestra & Traditional Drums', code: 'MUS401', room: 'Music Haven', teacher: 'Mr. P. Balogun', color: 'pink' },
      { id: 'tt-33', day: 'Friday', period: 5, time: '12:00 - 13:00', subject: 'Crafts, Origami & Model Making', code: 'CRAFT', room: 'Art Studio', teacher: 'Ms. A. Bello', color: 'rose' },
      { id: 'tt-34', day: 'Friday', period: 6, time: '13:45 - 15:00', subject: 'Inter-House Sports Competitions & Relays', code: 'HOUSE', room: 'Sports Arena', teacher: 'Coach T. Adeleke', color: 'orange' },
    ];

    // Seed Official Terminal Report Card (Primary School)
    this.reportCards = [
      {
        id: 'report-101',
        studentId: student1Id,
        studentName: 'Alex Mercer',
        admissionNumber: 'GIPS/2024/0142',
        classGrade: 'Primary 4 Gold (Basic 4)',
        academicYear: '2025/2026',
        term: 'Term 1',
        termTitle: 'First Term (2025/2026 Academic Session)',
        schoolOpenedDays: 65,
        daysPresent: 64,
        daysAbsent: 0,
        daysPunctual: 63,
        positionInClass: '2nd out of 28',
        overallTotal: 746,
        overallMax: 800,
        overallPercentage: 93.3,
        overallGrade: 'A+',
        gpa: '3.92 / 4.00',
        decision: 'PROMOTED TO PRIMARY 5 GOLD WITH DISTINCTION',
        nextTermBegins: '14th September 2026',
        issuedDate: '2026-03-28',
        subjects: [
          {
            subjectName: 'Primary Mathematics & Mental Numeracy',
            ca1: 19,
            ca2: 19,
            exam: 58,
            total: 96,
            grade: 'A+',
            classAverage: 78.4,
            classHighest: 98,
            classLowest: 54,
            position: '2nd',
            teacherRemark: 'Outstanding accuracy in mental arithmetic, fractions, and multiplication tables.'
          },
          {
            subjectName: 'English Language, Phonics & Creative Writing',
            ca1: 19,
            ca2: 20,
            exam: 57,
            total: 96,
            grade: 'A+',
            classAverage: 76.1,
            classHighest: 97,
            classLowest: 52,
            position: '1st',
            teacherRemark: 'Brilliant story composition, expressive vocabulary, and sound punctuation.'
          },
          {
            subjectName: 'Basic Science, Nature & Living Systems',
            ca1: 17,
            ca2: 18,
            exam: 54,
            total: 89,
            grade: 'A',
            classAverage: 71.0,
            classHighest: 95,
            classLowest: 48,
            position: '3rd',
            teacherRemark: 'Keen scientific curiosity, observes nature keenly and asks thoughtful questions.'
          },
          {
            subjectName: 'Social Studies & Civic Values',
            ca1: 18,
            ca2: 18,
            exam: 55,
            total: 91,
            grade: 'A+',
            classAverage: 69.5,
            classHighest: 93,
            classLowest: 45,
            position: '2nd',
            teacherRemark: 'Deep appreciation of national symbols, family roles, and community helpfulness.'
          },
          {
            subjectName: 'Computer Studies & Scratch Coding for Kids',
            ca1: 17,
            ca2: 17,
            exam: 53,
            total: 87,
            grade: 'A',
            classAverage: 67.8,
            classHighest: 91,
            classLowest: 46,
            position: '4th',
            teacherRemark: 'Very creative with Scratch animations and shows confident keyboard typing.'
          },
          {
            subjectName: 'Agricultural Science & Young Farmers Practice',
            ca1: 18,
            ca2: 18,
            exam: 56,
            total: 92,
            grade: 'A+',
            classAverage: 73.2,
            classHighest: 94,
            classLowest: 55,
            position: '2nd',
            teacherRemark: 'Enthusiastic participation in school garden planting and care of seedlings.'
          },
          {
            subjectName: 'Creative Arts, Colouring & Craft Making',
            ca1: 20,
            ca2: 20,
            exam: 58,
            total: 98,
            grade: 'A+',
            classAverage: 81.5,
            classHighest: 98,
            classLowest: 62,
            position: '1st',
            teacherRemark: 'Extraordinary artistic imagination, neat shading, and expressive paper crafts.'
          },
          {
            subjectName: 'French Language for Juniors',
            ca1: 18,
            ca2: 17,
            exam: 52,
            total: 87,
            grade: 'A',
            classAverage: 70.4,
            classHighest: 92,
            classLowest: 49,
            position: '3rd',
            teacherRemark: 'Enjoys conversational greetings, counting in French, and nursery rhyme songs.'
          }
        ],
        affectiveTraits: [
          { trait: 'Attentiveness in Circle Time', score: 5 },
          { trait: 'Neatness of Uniform & Workbooks', score: 5 },
          { trait: 'Politeness & Respect for Teachers', score: 5 },
          { trait: 'Kindness & Sharing with Classmates', score: 5 },
          { trait: 'Honesty & Good Manners', score: 5 },
          { trait: 'Eagerness & Curiosity in Class', score: 5 },
        ],
        psychomotorTraits: [
          { trait: 'Handwriting & Cursive Penmanship', score: 5 },
          { trait: 'Pencil Grip & Drawing Precision', score: 5 },
          { trait: 'Sports, Tag & Playground Agility', score: 4 },
          { trait: 'Singing, Rhythm & Music Expression', score: 5 },
          { trait: 'Computer Keyboard & Mouse Handling', score: 5 },
        ],
        formTeacherRemark: 'Alex has shown remarkable diligence, exemplary manners, and brilliant academic curiosity throughout this term. He is a shining star in Primary 4 Gold!',
        formTeacherName: 'Mrs. Sarah Connor (Primary 4 Class Teacher)',
        principalRemark: 'A delightful and well-deserved academic achievement. Alex embodies the wholesome character and joyful brilliance of Golden International School, Ido-Ekiti.',
        principalName: 'Pastor Ogunleye S.A',
        principalTitle: 'Head of School',
      }
    ];

    // Seed Admissions Applications (Primary School)
    this.applications = [
      {
        id: 'app-7841',
        appNumber: 'GIPS-ADM-2026-7841',
        studentName: 'Chukwuemeka David Adeleke',
        dob: '2020-05-14',
        gender: 'Male',
        gradeApplied: 'Primary 1 (Basic 1)',
        previousSchool: 'Little Angels Montessori Nursery, Victoria Island',
        medicalNotes: 'Mild seasonal dust allergy. No dietary restrictions.',
        parentName: 'Dr. Babatunde Adeleke',
        parentRelationship: 'Father',
        parentPhone: '+234 803 456 7890',
        parentEmail: 'babatunde.adeleke@example.com',
        parentAddress: '15 Admiralty Way, Lekki Phase 1, Lagos',
        parentOccupation: 'Consultant Neurosurgeon',
        status: 'EXAM_SCHEDULED',
        statusMessage: 'Documents verified. Primary 1 Diagnostic Assessment & Readiness Chat scheduled.',
        submittedAt: '2026-03-15T14:22:00Z',
        examDate: 'Saturday, April 18, 2026',
        examTime: '09:00 AM - 11:30 AM',
        examVenue: 'Primary Multi-Purpose Hall (Gate 2 Entrance)',
        examSeatNumber: 'SEAT-P1-042',
        subjectsTested: ['Early Numeracy & Counting', 'Phonics & Letter Sounds', 'General Cognitive Aptitude'],
        documents: [
          { name: 'Birth_Certificate_Certified.pdf', type: 'application/pdf', status: 'VERIFIED' },
          { name: 'Nursery_2_Assessment_Report.pdf', type: 'application/pdf', status: 'VERIFIED' },
          { name: 'Passport_Photograph_Digital.jpg', type: 'image/jpeg', status: 'VERIFIED' },
        ],
        stages: [
          { name: 'Application Submitted', completed: true, date: '15 Mar 2026', note: 'Application form submitted and reference code issued.' },
          { name: 'Document Screening', completed: true, date: '18 Mar 2026', note: 'Birth registry and nursery developmental report verified.' },
          { name: 'Diagnostic Assessment', completed: false, current: true, date: '18 Apr 2026', note: 'Readiness assessment scheduled. Please arrive by 08:30 AM.' },
          { name: 'Parent Chat & Review', completed: false, current: false, date: 'Pending', note: 'Informal interactive session with Head of Primary.' },
          { name: 'Provisional Admission Offer', completed: false, current: false, date: 'Pending', note: 'Official letter of admission issued upon committee sign-off.' },
        ],
      },
      {
        id: 'app-8920',
        appNumber: 'GIPS-ADM-2026-8920',
        studentName: 'Fatima Zahra Mohammed',
        dob: '2017-09-22',
        gender: 'Female',
        gradeApplied: 'Primary 4 (Basic 4)',
        previousSchool: 'Meadow Hall Junior School, Lekki',
        medicalNotes: 'None',
        parentName: 'Hajiya Amina Mohammed',
        parentRelationship: 'Mother',
        parentPhone: '+234 802 987 6543',
        parentEmail: 'amina.mohammed@example.com',
        parentAddress: '8 Glover Road, Ikoyi, Lagos',
        parentOccupation: 'Executive Director, Horizon Capital',
        status: 'OFFER_ISSUED',
        statusMessage: 'Congratulations! Provisional Primary Admission Offer Letter has been issued for the 2026/2027 Academic Session.',
        submittedAt: '2026-03-01T10:15:00Z',
        examScore: 94.0,
        offerLetterUrl: '#',
        offerDeadline: 'Thursday, April 30, 2026',
        documents: [
          { name: 'Primary_3_Continuous_Assessment.pdf', type: 'application/pdf', status: 'VERIFIED' },
          { name: 'Child_Medical_Clearance.pdf', type: 'application/pdf', status: 'VERIFIED' },
          { name: 'Passport_Photo.jpg', type: 'image/jpeg', status: 'VERIFIED' },
        ],
        stages: [
          { name: 'Application Submitted', completed: true, date: '01 Mar 2026', note: 'Application received and registered.' },
          { name: 'Document Screening', completed: true, date: '04 Mar 2026', note: 'All prerequisite Primary 3 academic records verified.' },
          { name: 'Diagnostic Assessment', completed: true, date: '14 Mar 2026', note: 'Scored 94% in Numeracy, Phonics & General Knowledge.' },
          { name: 'Parent Chat & Review', completed: true, date: '22 Mar 2026', note: 'Warm and constructive discussion with Primary Leadership.' },
          { name: 'Provisional Admission Offer', completed: true, current: true, date: '28 Mar 2026', note: 'Provisional offer letter available for immediate acceptance and fee deposit.' },
        ],
      }
    ];

    // Seed Campus Visits (Primary School)
    this.campusVisits = [
      {
        id: 'visit-101',
        parentName: 'Mrs. Funke Balogun',
        parentEmail: 'funke.balogun@example.com',
        parentPhone: '+234 802 123 4567',
        attendeeCount: 2,
        interestedGrade: 'Primary 2 (Basic 2)',
        visitDate: '2026-04-20',
        timeSlot: 'Morning (10:00 AM - 11:30 AM)',
        interests: ['Montessori Early Years Suite', 'Children’s Splash Pool', 'Primary Classrooms'],
        status: 'CONFIRMED',
        tourGuide: 'Mrs. Grace Adeleke (Primary Admissions Guide)',
        meetingPoint: 'GIPS Welcome Pavilion & Reception Lounge',
        createdAt: '2026-03-20T08:30:00Z',
      },
      {
        id: 'visit-102',
        parentName: 'Engr. Kenneth Obi',
        parentEmail: 'kenneth.obi@example.com',
        parentPhone: '+234 811 765 4321',
        attendeeCount: 3,
        interestedGrade: 'Nursery 2 (Age 4)',
        visitDate: '2026-04-22',
        timeSlot: 'Afternoon (02:00 PM - 03:30 PM)',
        interests: ['Playground & Sensory Garden', 'Children’s Dining Hall', 'Jolly Phonics Corner'],
        status: 'CONFIRMED',
        tourGuide: 'Mr. Jude Obi (Admissions Ambassador)',
        meetingPoint: 'GIPS Welcome Pavilion & Reception Lounge',
        createdAt: '2026-03-22T11:45:00Z',
      }
    ];

    // Seed Announcement Ticker Items (Primary School)
    this.announcements = [
      { id: 'ann-1', text: '🚨 2026/2027 Admissions into Crèche, Nursery & Primary (Basic 1–6) are open. Apply online today!', priority: 'HIGH', link: '/apply' },
      { id: 'ann-2', text: '📅 Batch A Primary Readiness Assessment & Family Chat scheduled for Saturday, 18th April 2026.', priority: 'NORMAL', link: '/apply#status' },
      { id: 'ann-3', text: '🏆 Congratulations to our Primary Pupils for winning 1st Place at the National Junior Spelling Bee!', priority: 'SUCCESS', link: '/news' },
      { id: 'ann-4', text: '📢 2026/2027 Primary School Prospectus & Jolly Phonics Guide are available in the Download Centre.', priority: 'NORMAL', link: '/downloads' },
    ];

    // Seed School News (Primary School)
    this.newsArticles = [
      {
        id: 'news-1',
        title: 'Golden Primary Pupils Win Gold at National Junior Spelling Bee & Phonics Gala',
        slug: 'national-junior-spelling-bee-gold',
        category: 'Academics & STEM',
        date: '12 Apr 2026',
        readTime: '4 min read',
        featured: true,
        author: 'Primary English Faculty',
        excerpt: 'Competing against 36 top primary schools, our Primary 4 and 5 word masters spelled their way to first place with perfect phonemic mastery.',
        content: 'Golden International Primary School has emerged victorious at the 2026 National Junior Spelling Bee held in Lagos. Our pupils demonstrated extraordinary diction, phonics decoding, and calm composure on stage.\n\nUnder the coaching of our Lead Phonics Specialist, the team accurately spelled complex multisyllabic words to lift the prestigious National Junior Trophy. Hearty congratulations to our little champions!',
        tags: ['Spelling Bee', 'Phonics', 'Literacy', 'Trophy'],
      },
      {
        id: 'news-2',
        title: 'Schedule & Guidelines for 2026/2027 Primary Diagnostic Readiness Assessment',
        slug: 'primary-readiness-assessment-guidelines',
        category: 'Admissions',
        date: '08 Apr 2026',
        readTime: '3 min read',
        featured: false,
        author: 'Admissions Secretariat',
        excerpt: 'Parents of registered prospective pupils for Nursery and Primary 1–6 can now print their assessment slips and review the day schedule.',
        content: 'The Admissions Committee of Golden International Primary School is delighted to welcome prospective pupils and families for the Batch A Readiness Assessment.\n\nThe exercise is designed to be child-friendly, engaging, and stress-free, assessing foundational numeracy, letter sounds, and social interaction. Parents are warmly invited to our Reception Lounge for breakfast with the Head of Primary.',
        tags: ['Admissions', 'Primary Entry', 'Batch A'],
      },
      {
        id: 'news-3',
        title: 'Annual Primary Inter-House Athletics & Fun Games Carnival Spectacle',
        slug: 'primary-inter-house-sports',
        category: 'Sports & Athletics',
        date: '28 Mar 2026',
        readTime: '4 min read',
        featured: false,
        author: 'Junior Sports Dept',
        excerpt: 'Emerald Green House emerged overall champions in a thrilling morning of 50m sprints, egg-and-spoon races, relay batons, and tug-of-war fun.',
        content: 'The 14th Annual Primary Inter-House Sports Day was filled with laughter, athletic determination, and vibrant parent participation. Events included the obstacle relay, sack race, little toddlers dash, and house cheerleading.',
        tags: ['Sports', 'Athletics', 'Fun Day', 'Inter-House'],
      },
      {
        id: 'news-4',
        title: '100% Pass Rate in National Common Entrance Examination (NCEE) Recorded',
        slug: 'national-common-entrance-distinction',
        category: 'Academics & STEM',
        date: '18 Mar 2026',
        readTime: '3 min read',
        featured: false,
        author: 'Office of Head of Primary',
        excerpt: 'All 34 graduating Primary 6 pupils gained admission into prestigious unity and international colleges with merit-based scholarship honors.',
        content: 'We celebrate our outgoing Basic 6 graduating class for their remarkable performance in the 2026 National Common Entrance Examinations. Every pupil achieved above-cut-off distinctions across Quantitative Reasoning, Verbal Reasoning, Mathematics, and General Studies.',
        tags: ['Common Entrance', 'NCEE', 'Basic 6', 'Distinction'],
      },
      {
        id: 'news-5',
        title: 'Little Einsteins Science & Nature Discovery Fair Announced',
        slug: 'little-einsteins-science-fair',
        category: 'Arts & Culture',
        date: '10 Mar 2026',
        readTime: '3 min read',
        featured: false,
        author: 'Primary Discovery Club',
        excerpt: 'Pupils from Crèche to Primary 6 will showcase homemade solar ovens, plant growth experiments, Scratch animations, and clay pottery.',
        content: 'Join us on Friday, 15th May 2026 for our annual Primary STEAM Fair. Experience hands-on interactive science booths, live musical recorder performances by Lower Primary pupils, and an open art gallery.',
        tags: ['Science Fair', 'STEM', 'Crafts', 'Discovery'],
      },
    ];

    // Seed Upcoming Events (Primary School)
    this.events = [
      {
        id: 'event-1',
        title: 'Batch A Primary Diagnostic Assessment & Parent Chat',
        date: '18 Apr 2026',
        time: '09:00 AM - 11:30 AM',
        venue: 'GIPS Main Primary Hall (Gate 2)',
        category: 'Admissions',
        audience: 'Prospective Pupils & Parents',
        description: 'Friendly foundational assessment in Early Numeracy, Phonics & Cognitive Aptitude for 2026/2027 entry.',
      },
      {
        id: 'event-2',
        title: 'Primary Parent-Teacher Fellowship & Reading Consultation',
        date: '24 Apr 2026',
        time: '10:00 AM - 02:00 PM',
        venue: 'Primary Multipurpose Hall',
        category: 'Academics',
        audience: 'All Primary Parents & Class Teachers',
        description: 'One-on-one progress review, handwriting development, and child reading goal discussions.',
      },
      {
        id: 'event-3',
        title: 'Little Einsteins Junior Science & Maker Fair',
        date: '02 May 2026',
        time: '09:30 AM - 01:30 PM',
        venue: 'Primary Quadrangle & Play Court',
        category: 'STEM',
        audience: 'Open to Pupils, Families & Friends',
        description: 'Interactive exhibits of volcano models, magnet games, Scratch coding demos, and plant seedlings.',
      },
      {
        id: 'event-4',
        title: 'Primary 6 Valedictory Service & Graduation Ceremony',
        date: '18 Jul 2026',
        time: '10:00 AM - 01:30 PM',
        venue: 'Golden Children Auditorium',
        category: 'Milestone',
        audience: 'Basic 6 Graduating Pupils & Families',
        description: 'Celebrating the joyous graduation of our Primary 6 cohort as they step forward into secondary education.',
      },
    ];

    // Seed Downloadable Resources (Primary School)
    this.downloads = [
      {
        id: 'dl-1',
        title: '2026/2027 Primary School Official Prospectus & Parent Guide',
        category: 'Admissions',
        format: 'PDF',
        size: '3.4 MB',
        downloads: 1650,
        updatedAt: '2026-03-10',
        description: 'Complete parent guide covering curriculum, school hours, tuition schedules, uniform guide, and pastoral care.',
      },
      {
        id: 'dl-2',
        title: '2025/2026 Primary School Academic Calendar (Terms 1 - 3)',
        category: 'Calendars',
        format: 'PDF',
        size: '1.1 MB',
        downloads: 3410,
        updatedAt: '2026-01-05',
        description: 'Detailed primary schedule covering resumption dates, mid-term breaks, fruit snack days, sports day, and holidays.',
      },
      {
        id: 'dl-3',
        title: 'Pupil Code of Conduct & Golden Moral Values Charter',
        category: 'Handbooks',
        format: 'PDF',
        size: '1.8 MB',
        downloads: 920,
        updatedAt: '2026-02-14',
        description: 'Child-friendly guide on courtesy, kindness, anti-bullying, classroom etiquette, and positive friendship rules.',
      },
      {
        id: 'dl-4',
        title: 'Jolly Phonics, Reading & Early Handwriting Guide for Parents',
        category: 'Curriculum',
        format: 'PDF',
        size: '2.9 MB',
        downloads: 1890,
        updatedAt: '2026-01-20',
        description: 'Practical home guide explaining the 42 letter sounds, blending techniques, and handwriting posture.',
      },
      {
        id: 'dl-5',
        title: 'Child Medical Fitness & Immunization Clearance Form',
        category: 'Admissions',
        format: 'PDF',
        size: '580 KB',
        downloads: 870,
        updatedAt: '2026-03-01',
        description: 'Mandatory pediatric health declaration to be completed by a licensed physician before resumption.',
      },
      {
        id: 'dl-6',
        title: 'Primary Pupils Uniform, Cardigan & PE Sportswear Specifications',
        category: 'Handbooks',
        format: 'PDF',
        size: '2.1 MB',
        downloads: 1240,
        updatedAt: '2026-02-28',
        description: 'Visual dress code guidelines for day uniform, PE polo shirts, sun hats, black school shoes, and swimming kits.',
      },
      {
        id: 'dl-7',
        title: 'Golden Primary Little Gazette & Termly Children Highlights',
        category: 'Newsletters',
        format: 'PDF',
        size: '4.6 MB',
        downloads: 2100,
        updatedAt: '2026-03-30',
        description: 'Full-color termly newsletter featuring pupils creative drawings, poetry, sports day photos, and teacher remarks.',
      },
      {
        id: 'dl-8',
        title: 'National Common Entrance Examination (NCEE) Practice Papers',
        category: 'Curriculum',
        format: 'PDF',
        size: '3.6 MB',
        downloads: 1420,
        updatedAt: '2026-02-10',
        description: 'Comprehensive past questions and step-by-step solutions in Quantitative and Verbal Reasoning for Primary 6.',
      },
    ];

    // Seed Career Job Vacancies (Primary School)
    this.jobListings = [
      {
        id: 'job-1',
        title: 'Lower Primary Homeroom Educator (Primary 1 - 3)',
        department: 'Primary Academics',
        level: 'Lower Primary (Ages 5 - 8)',
        location: 'Ido-Ekiti Campus, Ekiti State',
        type: 'Full-Time',
        salaryRange: '₦400,000 - ₦550,000 / month',
        postedDate: '05 Apr 2026',
        deadline: '30 Apr 2026',
        openings: 2,
        summary: 'Passionate and patient lower primary educator skilled in phonics, foundational numeracy, and positive child guidance.',
        responsibilities: [
          'Deliver engaging, multisensory lessons in reading, handwriting, numeracy, and basic science.',
          'Foster a warm, encouraging classroom atmosphere that celebrates every child progress.',
          'Track continuous assessments and maintain active partnership with parents.',
          'Coordinate fun classroom reading corners and story circles.'
        ],
        requirements: [
          'B.Ed in Primary Education or Early Childhood Education (Minimum Second Class Upper).',
          'Minimum 3 years classroom experience teaching Lower Primary in a recognized school.',
          'Certification in Jolly Phonics or Read Write Inc. is highly valued.',
          'Warm, enthusiastic, and loving demeanor with children.'
        ],
        benefits: [
          'Competitive salary with termly performance bonuses.',
          'HMO health insurance covering spouse and biological children.',
          '100% tuition waiver for biological children attending Golden Primary.',
          'Sponsored continuous professional development workshops.'
        ]
      },
      {
        id: 'job-2',
        title: 'Upper Primary Mathematics & Science Specialist (Basic 4 - 6)',
        department: 'Primary Academics',
        level: 'Upper Primary (Ages 8 - 11)',
        location: 'Ido-Ekiti Campus, Ekiti State',
        type: 'Full-Time',
        salaryRange: '₦450,000 - ₦620,000 / month',
        postedDate: '02 Apr 2026',
        deadline: '05 May 2026',
        openings: 1,
        summary: 'Lead Upper Primary pupils to mastery in mental arithmetic, quantitative problem solving, and Common Entrance examination excellence.',
        responsibilities: [
          'Teach Mathematics and Basic Science across Primary 4, 5, and 6.',
          'Prepare Primary 6 pupils for the National Common Entrance Examinations and scholarship tests.',
          'Organize the annual Little Einsteins Science & Discovery Fair.',
          'Incorporate digital learning tools and interactive whiteboard games.'
        ],
        requirements: [
          'B.Sc / B.Ed in Mathematics, Primary Education, or Integrated Science.',
          'Proven track record of high Common Entrance pass rates in reputable primary schools.',
          'Strong command of modern pedagogy and encouraging teaching methods.'
        ],
        benefits: [
          'Rewarding role with dedicated common entrance achievement bonuses.',
          'Fully equipped learning resources and supportive team environment.',
          'Comprehensive HMO health coverage and subsidized daily meals.'
        ]
      },
      {
        id: 'job-3',
        title: 'Early Years Montessori Directress (Crèche & Nursery)',
        department: 'Early Childhood Education',
        level: 'Crèche, Nursery & KG (Ages 1½ - 5)',
        location: 'Ido-Ekiti Campus, Ekiti State',
        type: 'Full-Time',
        salaryRange: '₦380,000 - ₦500,000 / month',
        postedDate: '10 Apr 2026',
        deadline: '15 May 2026',
        openings: 2,
        summary: 'Nurture our youngest learners with authentic Montessori apparatus, gentle phonics immersion, and loving sensory exploration.',
        responsibilities: [
          'Maintain a clean, beautiful, and stimulating Montessori learning environment.',
          'Observe individual child progress and plan tailored sensorial milestones.',
          'Foster positive social habits, courtesy, independence, and emotional comfort.',
          'Communicate daily with parents regarding child meals, rest, and milestones.'
        ],
        requirements: [
          'Certified Montessori Diploma (AMI / MCI) or Early Childhood Degree.',
          'Minimum 2 years experience in an established preschool or nursery.',
          'Warm, gentle disposition with pediatric first-aid certification.'
        ],
        benefits: [
          'Low child-to-teacher ratio (assistant caregiver present in every room).',
          'Purpose-built sensory playroom and dedicated toddler nap haven.',
          'HMO health coverage and career advancement.'
        ]
      },
      {
        id: 'job-4',
        title: 'Phonics, Diction & Reading Specialist',
        department: 'English & Literacy',
        level: 'Whole Primary School',
        location: 'Ido-Ekiti Campus, Ekiti State',
        type: 'Full-Time',
        salaryRange: '₦400,000 - ₦550,000 / month',
        postedDate: '28 Mar 2026',
        deadline: '25 Apr 2026',
        openings: 1,
        summary: 'Develop refined British diction, phonics blending, public speaking, and spelling bee excellence across all primary classes.',
        responsibilities: [
          'Lead daily Jolly Phonics phoneme instruction across Nursery and Lower Primary.',
          'Coach speech, articulation, and stage confidence for primary assemblies.',
          'Train the school team for regional and national junior spelling bee competitions.',
          'Conduct diagnostic reading tests to support children needing reading intervention.'
        ],
        requirements: [
          'Degree in English, Linguistics, or Primary Education.',
          'Certified Phonics Trainer (Jolly Phonics / Oxford Phonics).',
          'Flawless diction, clear enunciation, and infectious enthusiasm for children literature.'
        ],
        benefits: [
          'Well-stocked children library and dedicated speech studio.',
          'Health insurance, paid leave, and children tuition benefits.'
        ]
      },
      {
        id: 'job-5',
        title: 'Primary Physical Education & Swimming Coach',
        department: 'Sports & Athletics',
        level: 'Whole Primary School',
        location: 'Ido-Ekiti Campus, Ekiti State',
        type: 'Full-Time',
        salaryRange: '₦350,000 - ₦480,000 / month',
        postedDate: '15 Mar 2026',
        deadline: '20 Apr 2026',
        openings: 1,
        summary: 'Instill love for fitness, water safety, teamwork, and joyful movement through energetic PE and swimming lessons for children.',
        responsibilities: [
          'Conduct safe, fun, and age-appropriate swimming lessons in the children pool.',
          'Teach motor agility, ball games, gymnastics, and playground tag.',
          'Organize the Annual Primary Inter-House Sports Fun Day.',
          'Ensure strict safety and lifeguard protocols at all swimming and sports areas.'
        ],
        requirements: [
          'Degree / Diploma in Physical & Health Education (PHE) or Sports Science.',
          'Certified Lifeguard and Swimming Instructor qualification.',
          'Proven experience coaching primary-aged children.'
        ],
        benefits: [
          'Children swimming pavilion and safe playground fields.',
          'Full health coverage, sports gear allowance, and meals.'
        ]
      }
    ];

    // Seed Initial Candidate Application (Primary Educator)
    this.jobApplications = [
      {
        id: 'capp-101',
        jobId: 'job-1',
        jobTitle: 'Lower Primary Homeroom Educator (Primary 1 - 3)',
        candidateName: 'Mrs. Grace Okafor',
        candidateEmail: 'grace.okafor@example.com',
        candidatePhone: '+234 803 987 1122',
        yearsExperience: 6,
        qualification: 'B.Ed in Primary Education & Certified Phonics Coach',
        linkedIn: 'https://linkedin.com/in/grace-okafor-primary',
        cvFileName: 'Grace_Okafor_CV_Primary_Teacher.pdf',
        coverLetter: 'I am delighted to apply for the Lower Primary Homeroom Educator position at Golden International Primary School. I have 6 years experience inspiring young readers through phonics and discovery-based numeracy.',
        appliedAt: '2026-04-08T11:20:00Z',
        status: 'UNDER_REVIEW'
      }
    ];
  }

  get user() {
    return {
      findUnique: async ({ where }) => {
        if (where.id) return this.users.find(u => u.id === where.id) || null;
        if (where.email) return this.users.find(u => u.email.toLowerCase() === where.email.toLowerCase()) || null;
        return null;
      },
      findFirst: async ({ where }) => {
        return this.users.find(u => {
          if (where.id && u.id !== where.id) return false;
          if (where.email && u.email.toLowerCase() !== where.email.toLowerCase()) return false;
          if (where.role && u.role !== where.role) return false;
          return true;
        }) || null;
      },
      findMany: async (args = {}) => {
        let list = [...this.users];
        if (args.where?.role) {
          list = list.filter(u => u.role === args.where.role);
        }
        return list;
      },
      create: async ({ data }) => {
        const newUser = {
          id: data.id || `user-uuid-${Date.now()}`,
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role || 'STUDENT',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.users.push(newUser);
        return newUser;
      },
      update: async ({ where, data }) => {
        const user = this.users.find(u => u.id === where.id);
        if (!user) throw new Error('User not found');
        Object.assign(user, data, { updatedAt: new Date() });
        return user;
      },
    };
  }

  get class() {
    return {
      findUnique: async ({ where, include }) => {
        const cls = this.classes.find(c => c.id === where.id);
        if (!cls) return null;
        return this.formatClass(cls, include);
      },
      findFirst: async ({ where, include }) => {
        const cls = this.classes.find(c => {
          if (where.id && c.id !== where.id) return false;
          if (where.teacherId && c.teacherId !== where.teacherId) return false;
          return true;
        });
        if (!cls) return null;
        return this.formatClass(cls, include);
      },
      findMany: async ({ where, include } = {}) => {
        let list = [...this.classes];
        if (where?.teacherId) {
          list = list.filter(c => c.teacherId === where.teacherId);
        }
        if (where?.id?.in) {
          list = list.filter(c => where.id.in.includes(c.id));
        }
        return list.map(c => this.formatClass(c, include));
      },
      create: async ({ data }) => {
        const newClass = {
          id: data.id || `class-uuid-${Date.now()}`,
          name: data.name,
          description: data.description || '',
          teacherId: data.teacherId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.classes.push(newClass);
        return newClass;
      },
      update: async ({ where, data }) => {
        const cls = this.classes.find(c => c.id === where.id);
        if (!cls) throw new Error('Class not found');
        Object.assign(cls, data, { updatedAt: new Date() });
        return cls;
      },
      delete: async ({ where }) => {
        const idx = this.classes.findIndex(c => c.id === where.id);
        if (idx === -1) throw new Error('Class not found');
        const removed = this.classes.splice(idx, 1)[0];
        // cascade
        this.enrollments = this.enrollments.filter(e => e.classId !== where.id);
        this.assignments = this.assignments.filter(a => a.classId !== where.id);
        return removed;
      },
    };
  }

  formatClass(cls, include) {
    const result = { ...cls };
    if (include?.teacher) {
      result.teacher = this.users.find(u => u.id === cls.teacherId);
    }
    if (include?.enrollments) {
      result.enrollments = this.enrollments
        .filter(e => e.classId === cls.id)
        .map(e => ({
          ...e,
          student: this.users.find(u => u.id === e.studentId),
        }));
    }
    if (include?.assignments) {
      result.assignments = this.assignments.filter(a => a.classId === cls.id);
    }
    return result;
  }

  get enrollment() {
    return {
      findUnique: async ({ where }) => {
        if (where.studentId_classId) {
          return this.enrollments.find(
            e => e.studentId === where.studentId_classId.studentId && e.classId === where.studentId_classId.classId
          ) || null;
        }
        if (where.id) return this.enrollments.find(e => e.id === where.id) || null;
        return null;
      },
      findFirst: async ({ where }) => {
        return this.enrollments.find(e => {
          if (where.studentId && e.studentId !== where.studentId) return false;
          if (where.classId && e.classId !== where.classId) return false;
          return true;
        }) || null;
      },
      findMany: async ({ where, include } = {}) => {
        let list = [...this.enrollments];
        if (where?.studentId) list = list.filter(e => e.studentId === where.studentId);
        if (where?.classId) list = list.filter(e => e.classId === where.classId);
        return list.map(e => {
          const res = { ...e };
          if (include?.student) res.student = this.users.find(u => u.id === e.studentId);
          if (include?.class) {
            const cls = this.classes.find(c => c.id === e.classId);
            res.class = cls ? this.formatClass(cls, include.class.include) : null;
          }
          return res;
        });
      },
      create: async ({ data }) => {
        const newEnrollment = {
          id: data.id || `enroll-uuid-${Date.now()}`,
          studentId: data.studentId,
          classId: data.classId,
          enrolledAt: new Date(),
        };
        this.enrollments.push(newEnrollment);
        return newEnrollment;
      },
      delete: async ({ where }) => {
        const idx = this.enrollments.findIndex(e => {
          if (where.id) return e.id === where.id;
          if (where.studentId_classId) {
            return e.studentId === where.studentId_classId.studentId && e.classId === where.studentId_classId.classId;
          }
          return false;
        });
        if (idx === -1) throw new Error('Enrollment not found');
        return this.enrollments.splice(idx, 1)[0];
      },
      deleteMany: async ({ where }) => {
        const initial = this.enrollments.length;
        this.enrollments = this.enrollments.filter(e => {
          if (where.studentId && e.studentId === where.studentId) return false;
          if (where.classId && e.classId === where.classId) return false;
          return true;
        });
        return { count: initial - this.enrollments.length };
      },
    };
  }

  get assignment() {
    return {
      findUnique: async ({ where, include }) => {
        const item = this.assignments.find(a => a.id === where.id);
        if (!item) return null;
        return this.formatAssignment(item, include);
      },
      findFirst: async ({ where, include }) => {
        const item = this.assignments.find(a => {
          if (where.id && a.id !== where.id) return false;
          if (where.classId && a.classId !== where.classId) return false;
          return true;
        });
        if (!item) return null;
        return this.formatAssignment(item, include);
      },
      findMany: async ({ where, include, orderBy } = {}) => {
        let list = [...this.assignments];
        if (where?.classId) {
          if (where.classId.in) {
            list = list.filter(a => where.classId.in.includes(a.classId));
          } else if (typeof where.classId === 'string') {
            list = list.filter(a => a.classId === where.classId);
          }
        }
        if (orderBy?.dueDate) {
          list.sort((a, b) => orderBy.dueDate === 'asc' ? new Date(a.dueDate) - new Date(b.dueDate) : new Date(b.dueDate) - new Date(a.dueDate));
        }
        return list.map(a => this.formatAssignment(a, include));
      },
      create: async ({ data }) => {
        const newAssign = {
          id: data.id || `assign-uuid-${Date.now()}`,
          classId: data.classId,
          title: data.title,
          instructions: data.instructions,
          dueDate: new Date(data.dueDate),
          points: data.points || 100,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.assignments.push(newAssign);
        return newAssign;
      },
      update: async ({ where, data }) => {
        const assign = this.assignments.find(a => a.id === where.id);
        if (!assign) throw new Error('Assignment not found');
        if (data.dueDate) data.dueDate = new Date(data.dueDate);
        Object.assign(assign, data, { updatedAt: new Date() });
        return assign;
      },
      delete: async ({ where }) => {
        const idx = this.assignments.findIndex(a => a.id === where.id);
        if (idx === -1) throw new Error('Assignment not found');
        const removed = this.assignments.splice(idx, 1)[0];
        this.submissions = this.submissions.filter(s => s.assignmentId !== where.id);
        return removed;
      },
    };
  }

  formatAssignment(assign, include) {
    const res = { ...assign };
    if (include?.class) {
      const cls = this.classes.find(c => c.id === assign.classId);
      res.class = cls
        ? (include.class.include ? this.formatClass(cls, include.class.include) : { ...cls })
        : null;
    }
    if (include?.submissions) {
      res.submissions = this.submissions
        .filter(s => s.assignmentId === assign.id)
        .map(s => ({
          ...s,
          student: this.users.find(u => u.id === s.studentId),
        }));
    }
    return res;
  }

  get submission() {
    return {
      findUnique: async ({ where, include }) => {
        let sub = null;
        if (where.id) sub = this.submissions.find(s => s.id === where.id);
        else if (where.assignmentId_studentId) {
          sub = this.submissions.find(
            s => s.assignmentId === where.assignmentId_studentId.assignmentId && s.studentId === where.assignmentId_studentId.studentId
          );
        }
        if (!sub) return null;
        return this.formatSubmission(sub, include);
      },
      findFirst: async ({ where, include }) => {
        const sub = this.submissions.find(s => {
          if (where.id && s.id !== where.id) return false;
          if (where.assignmentId && s.assignmentId !== where.assignmentId) return false;
          if (where.studentId && s.studentId !== where.studentId) return false;
          return true;
        });
        if (!sub) return null;
        return this.formatSubmission(sub, include);
      },
      findMany: async ({ where, include, orderBy } = {}) => {
        let list = [...this.submissions];
        if (where?.assignmentId) {
          if (where.assignmentId.in) {
            list = list.filter(s => where.assignmentId.in.includes(s.assignmentId));
          } else if (typeof where.assignmentId === 'string') {
            list = list.filter(s => s.assignmentId === where.assignmentId);
          }
        }
        if (where?.studentId) {
          if (where.studentId.in) {
            list = list.filter(s => where.studentId.in.includes(s.studentId));
          } else if (typeof where.studentId === 'string') {
            list = list.filter(s => s.studentId === where.studentId);
          }
        }
        if (orderBy?.submittedAt) {
          list.sort((a, b) => orderBy.submittedAt === 'asc' ? new Date(a.submittedAt) - new Date(b.submittedAt) : new Date(b.submittedAt) - new Date(a.submittedAt));
        }
        return list.map(s => this.formatSubmission(s, include));
      },
      create: async ({ data }) => {
        const newSub = {
          id: data.id || `sub-uuid-${Date.now()}`,
          assignmentId: data.assignmentId,
          studentId: data.studentId,
          textAnswer: data.textAnswer || null,
          fileUrl: data.fileUrl || null,
          fileName: data.fileName || null,
          submittedAt: new Date(),
          grade: null,
          feedback: null,
          gradedAt: null,
        };
        this.submissions.push(newSub);
        return newSub;
      },
      upsert: async ({ where, update, create }) => {
        let existing = null;
        if (where.assignmentId_studentId) {
          existing = this.submissions.find(
            s => s.assignmentId === where.assignmentId_studentId.assignmentId && s.studentId === where.assignmentId_studentId.studentId
          );
        }
        if (existing) {
          Object.assign(existing, update, { submittedAt: new Date() });
          return existing;
        } else {
          return await this.submission.create({ data: create });
        }
      },
      update: async ({ where, data }) => {
        const sub = this.submissions.find(s => s.id === where.id);
        if (!sub) throw new Error('Submission not found');
        Object.assign(sub, data);
        return sub;
      },
      delete: async ({ where }) => {
        const idx = this.submissions.findIndex(s => s.id === where.id);
        if (idx === -1) throw new Error('Submission not found');
        return this.submissions.splice(idx, 1)[0];
      },
    };
  }

  get bill() {
    return {
      findUnique: async ({ where }) => {
        if (where.id) return this.bills.find(b => b.id === where.id) || null;
        if (where.invoiceNumber) return this.bills.find(b => b.invoiceNumber === where.invoiceNumber) || null;
        return null;
      },
      findMany: async ({ where, orderBy } = {}) => {
        let list = [...this.bills];
        if (where?.studentId) list = list.filter(b => b.studentId === where.studentId);
        if (where?.status) list = list.filter(b => b.status === where.status);
        if (orderBy?.dueDate) {
          list.sort((a, b) =>
            orderBy.dueDate === 'asc'
              ? new Date(a.dueDate) - new Date(b.dueDate)
              : new Date(b.dueDate) - new Date(a.dueDate)
          );
        }
        return list;
      },
      update: async ({ where, data }) => {
        const item = this.bills.find(b => b.id === where.id);
        if (!item) throw new Error('Bill not found');
        Object.assign(item, data);
        return item;
      },
      create: async ({ data }) => {
        const newBill = {
          id: data.id || `bill-uuid-${Date.now()}`,
          invoiceNumber: data.invoiceNumber || `GIS-INV-${Date.now().toString().slice(-6)}`,
          ...data,
        };
        this.bills.push(newBill);
        return newBill;
      },
    };
  }

  get attendance() {
    return {
      findMany: async ({ where, orderBy } = {}) => {
        let list = [...this.attendances];
        if (where?.classId) list = list.filter(a => a.classId === where.classId);
        if (where?.studentId) list = list.filter(a => a.studentId === where.studentId);
        if (where?.date) list = list.filter(a => a.date === where.date);
        if (orderBy?.date) {
          list.sort((a, b) => orderBy.date === 'asc' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));
        }
        return list;
      },
      upsert: async ({ where, update, create }) => {
        const key = where?.classId_studentId_date || where;
        const existing = this.attendances.find(
          a => a.classId === key.classId && a.studentId === key.studentId && a.date === key.date
        );
        if (existing) {
          Object.assign(existing, update, { markedAt: new Date() });
          return existing;
        } else {
          const item = {
            id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            ...create,
            markedAt: new Date(),
          };
          this.attendances.push(item);
          return item;
        }
      },
      create: async ({ data }) => {
        const item = {
          id: data.id || `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          ...data,
          markedAt: new Date(),
        };
        this.attendances.push(item);
        return item;
      }
    };
  }

  get timetable() {
    return {
      findMany: async ({ where } = {}) => {
        let list = [...this.timetables];
        if (where?.day) list = list.filter(t => t.day.toLowerCase() === where.day.toLowerCase());
        if (where?.classId) list = list.filter(t => t.classId === where.classId);
        return list;
      },
    };
  }

  get reportCard() {
    return {
      findUnique: async ({ where }) => {
        if (where?.id) return this.reportCards.find(r => r.id === where.id) || null;
        return null;
      },
      findFirst: async ({ where }) => {
        return this.reportCards.find(r => {
          if (where?.studentId && r.studentId !== where.studentId) return false;
          if (where?.term && r.term !== where.term) return false;
          return true;
        }) || null;
      },
      findMany: async ({ where } = {}) => {
        let list = [...this.reportCards];
        if (where?.studentId) list = list.filter(r => r.studentId === where.studentId);
        if (where?.term) list = list.filter(r => r.term === where.term);
        return list;
      },
      create: async ({ data }) => {
        const item = {
          id: data.id || `report-${Date.now()}`,
          ...data,
          issuedDate: new Date().toISOString().split('T')[0],
        };
        this.reportCards.push(item);
        return item;
      },
      update: async ({ where, data }) => {
        const item = this.reportCards.find(r => r.id === where.id);
        if (!item) throw new Error('Report card not found');
        Object.assign(item, data);
        return item;
      }
    };
  }

  get application() {
    return {
      findUnique: async ({ where }) => {
        if (where?.id) return this.applications.find(a => a.id === where.id) || null;
        if (where?.appNumber) return this.applications.find(a => a.appNumber.toUpperCase() === where.appNumber.toUpperCase()) || null;
        return null;
      },
      findFirst: async ({ where }) => {
        return this.applications.find(a => {
          if (where?.appNumber && a.appNumber.toUpperCase() !== where.appNumber.toUpperCase()) return false;
          if (where?.parentEmail && a.parentEmail.toLowerCase() !== where.parentEmail.toLowerCase()) return false;
          if (where?.parentPhone && a.parentPhone !== where.parentPhone) return false;
          return true;
        }) || null;
      },
      findMany: async ({ where, orderBy } = {}) => {
        let list = [...this.applications];
        if (where?.status) list = list.filter(a => a.status === where.status);
        if (where?.gradeApplied) list = list.filter(a => a.gradeApplied === where.gradeApplied);
        if (orderBy?.submittedAt) {
          list.sort((a, b) => orderBy.submittedAt === 'asc'
            ? new Date(a.submittedAt) - new Date(b.submittedAt)
            : new Date(b.submittedAt) - new Date(a.submittedAt));
        }
        return list;
      },
      create: async ({ data }) => {
        const item = {
          id: data.id || `app-${Date.now()}`,
          appNumber: data.appNumber || `GIS-ADM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          status: data.status || 'SUBMITTED',
          statusMessage: data.statusMessage || 'Application received. Pending document screening.',
          submittedAt: new Date().toISOString(),
          stages: data.stages || [
            { name: 'Application Submitted', completed: true, date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), note: 'Application form submitted and reference code issued.' },
            { name: 'Document Screening', completed: false, current: true, date: 'In Review', note: 'Academic transcripts and birth registry authentication in progress.' },
            { name: 'Entrance Examination', completed: false, current: false, date: 'Pending', note: 'Entrance test date will be assigned once credentials are verified.' },
            { name: 'Interview & Panel Review', completed: false, current: false, date: 'Pending', note: 'Shortlisted candidates proceed to family panel interview.' },
            { name: 'Provisional Admission Offer', completed: false, current: false, date: 'Pending', note: 'Formal letter of admission issued upon committee sign-off.' },
          ],
          ...data,
        };
        this.applications.unshift(item);
        return item;
      },
      update: async ({ where, data }) => {
        const item = this.applications.find(a => (where.id && a.id === where.id) || (where.appNumber && a.appNumber === where.appNumber));
        if (!item) throw new Error('Application not found');
        Object.assign(item, data, { updatedAt: new Date() });
        return item;
      }
    };
  }

  get campusVisit() {
    return {
      findMany: async ({ where } = {}) => {
        let list = [...this.campusVisits];
        if (where?.status) list = list.filter(v => v.status === where.status);
        if (where?.visitDate) list = list.filter(v => v.visitDate === where.visitDate);
        return list;
      },
      create: async ({ data }) => {
        const item = {
          id: data.id || `visit-${Date.now()}`,
          status: data.status || 'CONFIRMED',
          tourGuide: 'Mr. Jude Obi (Admissions Ambassador)',
          meetingPoint: 'GIS Welcome Pavilion & Reception Lounge',
          createdAt: new Date().toISOString(),
          ...data,
        };
        this.campusVisits.unshift(item);
        return item;
      },
      update: async ({ where, data }) => {
        const item = this.campusVisits.find(v => v.id === where.id);
        if (!item) throw new Error('Campus visit not found');
        Object.assign(item, data);
        return item;
      }
    };
  }

  get news() {
    return {
      findMany: async ({ where } = {}) => {
        let list = [...this.newsArticles];
        if (where?.category && where.category !== 'All') {
          list = list.filter(n => n.category.toLowerCase().includes(where.category.toLowerCase()));
        }
        if (where?.featured) {
          list = list.filter(n => n.featured);
        }
        return list;
      },
      findUnique: async ({ where }) => {
        if (where?.id) return this.newsArticles.find(n => n.id === where.id) || null;
        if (where?.slug) return this.newsArticles.find(n => n.slug === where.slug) || null;
        return null;
      },
      create: async ({ data }) => {
        const item = { id: data.id || `news-${Date.now()}`, ...data };
        this.newsArticles.unshift(item);
        return item;
      }
    };
  }

  get event() {
    return {
      findMany: async ({ where } = {}) => {
        let list = [...this.events];
        if (where?.category && where.category !== 'All') {
          list = list.filter(e => e.category.toLowerCase() === where.category.toLowerCase());
        }
        return list;
      },
      create: async ({ data }) => {
        const item = { id: data.id || `event-${Date.now()}`, ...data };
        this.events.push(item);
        return item;
      }
    };
  }

  get download() {
    return {
      findMany: async ({ where } = {}) => {
        let list = [...this.downloads];
        if (where?.category && where.category !== 'All') {
          list = list.filter(d => d.category.toLowerCase() === where.category.toLowerCase());
        }
        return list;
      },
      findUnique: async ({ where }) => {
        return this.downloads.find(d => d.id === where.id) || null;
      },
      update: async ({ where, data }) => {
        const item = this.downloads.find(d => d.id === where.id);
        if (!item) throw new Error('Download resource not found');
        Object.assign(item, data);
        return item;
      }
    };
  }

  get announcement() {
    return {
      findMany: async () => [...this.announcements],
    };
  }

  get jobListing() {
    return {
      findMany: async ({ where } = {}) => {
        let list = [...this.jobListings];
        if (where?.department && where.department !== 'All') {
          list = list.filter(j => j.department.toLowerCase().includes(where.department.toLowerCase()));
        }
        if (where?.level && where.level !== 'All') {
          list = list.filter(j => j.level.toLowerCase().includes(where.level.toLowerCase()));
        }
        return list;
      },
      findUnique: async ({ where }) => {
        return this.jobListings.find(j => j.id === where.id) || null;
      }
    };
  }

  get jobApplication() {
    return {
      findMany: async ({ where } = {}) => {
        let list = [...this.jobApplications];
        if (where?.jobId) list = list.filter(a => a.jobId === where.jobId);
        return list;
      },
      create: async ({ data }) => {
        const item = {
          id: data.id || `capp-${Date.now()}`,
          appliedAt: new Date().toISOString(),
          status: 'UNDER_REVIEW',
          ...data,
        };
        this.jobApplications.unshift(item);
        return item;
      }
    };
  }

  formatSubmission(sub, include) {
    const res = { ...sub };
    if (include?.student) {
      res.student = this.users.find(u => u.id === sub.studentId);
    }
    if (include?.assignment) {
      const assign = this.assignments.find(a => a.id === sub.assignmentId);
      res.assignment = assign ? this.formatAssignment(assign, include.assignment.include) : null;
    }
    return res;
  }
}

// Check Postgres connectivity or fall back gracefully
try {
  prisma = new PrismaClient();
} catch (e) {
  prisma = null;
}

const memoryDb = new MemoryDB();

// DB accessor that delegates to Prisma if PostgreSQL connects, otherwise memoryDb
const db = new Proxy({}, {
  get(target, prop) {
    if (isPostgresAvailable && prisma && prisma[prop]) {
      return prisma[prop];
    }
    return memoryDb[prop];
  }
});

// Async initializer to test PostgreSQL connection
const initDatabase = async () => {
  if (prisma) {
    try {
      const connectPromise = prisma.$connect();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Postgres connection timeout')), 2000)
      );
      await Promise.race([connectPromise, timeoutPromise]);
      isPostgresAvailable = true;
      console.log('✅ Connected to PostgreSQL database via Prisma.');
    } catch (err) {
      isPostgresAvailable = false;
      console.log('ℹ️  PostgreSQL is not reachable on localhost:5432. Running in memory dev mode with pre-seeded demo accounts.');
      console.log('   Admin demo:   admin@portal.edu   | password: password123');
      console.log('   Teacher demo: teacher@portal.edu | password: password123');
      console.log('   Student demo: student@portal.edu | password: password123');
      console.log('   Parent demo:  parent@portal.edu  | password: password123');
    }
  } else {
    isPostgresAvailable = false;
  }
};

module.exports = {
  db,
  prisma,
  initDatabase,
};
