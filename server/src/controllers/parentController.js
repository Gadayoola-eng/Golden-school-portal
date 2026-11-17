const { db } = require('../db');

// GET /api/parent/overview
const getParentOverview = async (req, res) => {
  try {
    const parent = req.user;

    // Find parent user and all enrolled wards
    const parentUser = await db.user.findUnique({ where: { id: parent.id } });
    const childrenIds = parentUser?.childrenIds || (parentUser?.childId ? [parentUser.childId] : ['student-uuid-201']);
    const targetStudentId = req.query.childId || parentUser?.childId || childrenIds[0];

    // Fetch details for all wards
    const allWards = await Promise.all(
      childrenIds.map(async (cid) => {
        const u = await db.user.findUnique({ where: { id: cid } });
        const rep = await db.reportCard.findFirst({ where: { studentId: cid, term: 'Term 1' } });
        return {
          id: u?.id || cid,
          name: u?.name || 'Child',
          admissionNumber: u?.admissionNumber || rep?.admissionNumber || 'GIS/2024/0142',
          tokenNumber: u?.tokenNumber || rep?.tokenNumber || 'TK-7841-92',
          grade: u?.grade || rep?.classGrade || 'Primary Class',
          overallPercentage: rep?.overallPercentage || 93.3,
          overallGrade: rep?.overallGrade || 'A+',
          positionInClass: rep?.positionInClass || '1st in class',
          attendanceRate: 98.4,
          decision: rep?.decision || 'Promoted with Distinction',
        };
      })
    );

    const student = await db.user.findUnique({ where: { id: targetStudentId } });
    const activeReport = await db.reportCard.findFirst({ where: { studentId: targetStudentId, term: 'Term 1' } });

    // 1. Get enrolled classes for target student
    const enrollments = await db.enrollment.findMany({
      where: { studentId: targetStudentId },
      include: {
        class: {
          include: { teacher: true },
        },
      },
    });

    const enrolledClassIds = enrollments.map(e => e.classId);

    // 2. Get all assignments for these classes
    const assignments = await db.assignment.findMany({
      where: { classId: { in: enrolledClassIds } },
      include: { class: true },
      orderBy: { dueDate: 'asc' },
    });

    // 3. Get student's submissions and grades
    const submissions = await db.submission.findMany({
      where: { studentId: targetStudentId },
      include: {
        assignment: {
          include: { class: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    const courseProgress = enrollments.map(e => {
      const cls = e.class;
      const classAssignments = assignments.filter(a => a.classId === cls.id);
      const classSubs = submissions.filter(s => s.assignment?.classId === cls.id);
      const gradedSubs = classSubs.filter(s => s.grade !== null);

      let avgGrade = null;
      if (gradedSubs.length > 0) {
        const total = gradedSubs.reduce((acc, curr) => acc + (curr.grade || 0), 0);
        const maxTotal = gradedSubs.reduce((acc, curr) => acc + (curr.assignment?.points || 100), 0);
        avgGrade = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : null;
      }

      return {
        id: cls.id,
        name: cls.name,
        teacherName: cls.teacher?.name || 'Faculty Member',
        teacherEmail: cls.teacher?.email,
        totalAssignments: classAssignments.length,
        submittedCount: classSubs.length,
        currentGradePercentage: avgGrade,
      };
    });

    // 4. Bills summary for all parent's children
    const bills = await db.bill.findMany({ where: { studentId: { in: childrenIds } } });
    let totalOutstanding = 0;
    let totalPaid = 0;
    bills.forEach(b => {
      if (b.status === 'PAID') totalPaid += Number(b.amount) || 0;
      else totalOutstanding += Number(b.amount) || 0;
    });

    // 5. School Announcements
    const announcements = [
      {
        id: 'ann-1',
        title: 'Term 2 Parent-Teacher Academic Conference',
        date: '2026-04-18',
        category: 'Academic',
        content: 'Individual 15-minute consultations with faculty regarding Term 2 academic performance and career guidance.',
      },
      {
        id: 'ann-2',
        title: 'Annual Golden STEM & Science Exposition',
        date: '2026-05-02',
        category: 'Event',
        content: 'Students will present robotics, computer science, and environmental projects in the Main Auditorium.',
      },
      {
        id: 'ann-3',
        title: 'Term 2 Tuition Settlement Deadline',
        date: '2026-04-30',
        category: 'Finance',
        content: 'Kindly note that outstanding invoices for Term 2 must be completed through the payment portal by April 30.',
      },
    ];

    return res.json({
      children: allWards,
      student: {
        id: student?.id,
        name: student?.name || 'Alex Mercer',
        email: student?.email || 'student@portal.edu',
        studentCode: student?.admissionNumber || activeReport?.admissionNumber || 'GIS/2024/0142',
        admissionNumber: student?.admissionNumber || activeReport?.admissionNumber || 'GIS/2024/0142',
        tokenNumber: student?.tokenNumber || activeReport?.tokenNumber || 'TK-7841-92',
        grade: student?.grade || activeReport?.classGrade || 'Primary 4 Gold (Basic 4)',
        stream: 'Primary Academic & STEAM Stream',
        attendanceRate: 98.4,
        behaviorRating: 'Exemplary',
        gpa: activeReport?.gpa || '3.92 / 4.0',
        overallPercentage: activeReport?.overallPercentage || 93.3,
        overallGrade: activeReport?.overallGrade || 'A+',
        positionInClass: activeReport?.positionInClass || '2nd out of 28',
      },
      courses: courseProgress,
      recentGrades: submissions
        .filter(s => s.grade !== null)
        .slice(0, 5)
        .map(s => ({
          id: s.id,
          assignmentTitle: s.assignment?.title,
          className: s.assignment?.class?.name,
          grade: s.grade,
          maxPoints: s.assignment?.points || 100,
          percentage: Math.round(((s.grade || 0) / (s.assignment?.points || 100)) * 100),
          feedback: s.feedback,
          gradedAt: s.gradedAt,
        })),
      finances: {
        totalOutstanding,
        totalPaid,
        unpaidBillsCount: bills.filter(b => b.status !== 'PAID').length,
      },
      announcements,
    });
  } catch (error) {
    console.error('Parent overview error:', error);
    return res.status(500).json({ error: 'Failed to retrieve parent overview data.' });
  }
};

module.exports = {
  getParentOverview,
};
