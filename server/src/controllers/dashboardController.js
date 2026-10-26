const { db } = require('../db');

// GET /api/dashboard/teacher
const getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user.id;

    // 1. Get teacher's classes
    const classes = await db.class.findMany({
      where: { teacherId },
      include: {
        enrollments: true,
        assignments: true,
      },
    });

    const totalClasses = classes.length;
    
    // Total unique students across classes
    const studentIdSet = new Set();
    classes.forEach(c => {
      (c.enrollments || []).forEach(e => studentIdSet.add(e.studentId));
    });
    const totalStudents = studentIdSet.size;

    // 2. Pending submissions to grade
    const classIds = classes.map(c => c.id);
    const assignments = await db.assignment.findMany({
      where: { classId: { in: classIds } },
      include: { class: true },
    });

    const assignmentIds = assignments.map(a => a.id);
    const allSubmissions = await db.submission.findMany({
      where: { assignmentId: { in: assignmentIds } },
      include: {
        student: true,
        assignment: {
          include: { class: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    // Pending submissions are those where grade is null
    const pendingSubmissions = allSubmissions
      .filter(s => s.grade === null)
      .map(s => ({
        id: s.id,
        assignmentId: s.assignmentId,
        assignmentTitle: s.assignment?.title,
        className: s.assignment?.class?.name,
        studentName: s.student?.name || 'Unknown Student',
        studentEmail: s.student?.email,
        submittedAt: s.submittedAt,
        hasFile: !!s.fileUrl,
      }));

    return res.json({
      stats: {
        totalClasses,
        totalStudents,
        totalAssignments: assignments.length,
        pendingGradesCount: pendingSubmissions.length,
      },
      classes: classes.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        studentCount: c.enrollments?.length || 0,
        assignmentCount: c.assignments?.length || 0,
      })),
      pendingSubmissions,
    });
  } catch (error) {
    console.error('Teacher dashboard error:', error);
    return res.status(500).json({ error: 'Failed to load teacher dashboard.' });
  }
};

// GET /api/dashboard/student
const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    // 1. Get enrolled classes
    const enrollments = await db.enrollment.findMany({
      where: { studentId },
      include: {
        class: {
          include: { teacher: true },
        },
      },
    });

    const enrolledClassIds = enrollments.map(e => e.classId);

    // 2. Get upcoming assignments sorted by due date
    const allAssignments = await db.assignment.findMany({
      where: { classId: { in: enrolledClassIds } },
      include: { class: true },
      orderBy: { dueDate: 'asc' },
    });

    // Get all submissions by this student
    const studentSubmissions = await db.submission.findMany({
      where: { studentId },
      include: {
        assignment: {
          include: { class: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    const subMap = new Map(studentSubmissions.map(s => [s.assignmentId, s]));

    const upcomingAssignments = allAssignments.map(a => {
      const sub = subMap.get(a.id);
      const isPastDue = new Date() > new Date(a.dueDate);
      let status = 'PENDING';
      if (sub) {
        status = sub.grade !== null ? 'GRADED' : 'SUBMITTED';
      } else if (isPastDue) {
        status = 'OVERDUE';
      }

      return {
        id: a.id,
        classId: a.classId,
        className: a.class?.name,
        title: a.title,
        dueDate: a.dueDate,
        points: a.points,
        status,
        submission: sub
          ? {
              id: sub.id,
              submittedAt: sub.submittedAt,
              grade: sub.grade,
              feedback: sub.feedback,
            }
          : null,
      };
    });

    // 3. Recent grades (graded submissions)
    const recentGrades = studentSubmissions
      .filter(s => s.grade !== null)
      .slice(0, 5)
      .map(s => ({
        id: s.id,
        assignmentId: s.assignmentId,
        assignmentTitle: s.assignment?.title,
        className: s.assignment?.class?.name,
        grade: s.grade,
        maxPoints: s.assignment?.points || 100,
        percentage: Math.round((s.grade / (s.assignment?.points || 100)) * 100),
        feedback: s.feedback,
        gradedAt: s.gradedAt,
      }));

    return res.json({
      stats: {
        enrolledClassesCount: enrollments.length,
        totalUpcomingAssignments: upcomingAssignments.filter(a => a.status === 'PENDING').length,
        gradedAssignmentsCount: recentGrades.length,
      },
      enrolledClasses: enrollments.map(e => ({
        id: e.class?.id,
        name: e.class?.name,
        teacherName: e.class?.teacher?.name,
      })),
      upcomingAssignments,
      recentGrades,
    });
  } catch (error) {
    console.error('Student dashboard error:', error);
    return res.status(500).json({ error: 'Failed to load student dashboard.' });
  }
};

module.exports = {
  getTeacherDashboard,
  getStudentDashboard,
};
