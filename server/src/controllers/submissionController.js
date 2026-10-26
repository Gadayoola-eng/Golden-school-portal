const { z } = require('zod');
const { db } = require('../db');
const { storageService } = require('../middleware/upload');

const gradeSchema = z.object({
  grade: z.number().min(0, 'Grade cannot be negative'),
  feedback: z.string().optional(),
});

// POST /api/submissions/assignment/:assignmentId (Student submit)
const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user.id;
    const { textAnswer } = req.body;
    const file = req.file;

    if (!textAnswer && !file) {
      return res.status(400).json({ error: 'Please provide a text answer or upload a file.' });
    }

    const assignment = await db.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        class: {
          include: { enrollments: true },
        },
      },
    });

    if (!assignment) {
      if (file) storageService.deleteFile(file.filename);
      return res.status(404).json({ error: 'Assignment not found.' });
    }

    // Verify student is enrolled
    const enrollment = await db.enrollment.findUnique({
      where: {
        studentId_classId: {
          studentId,
          classId: assignment.classId,
        },
      },
    });

    if (!enrollment) {
      if (file) storageService.deleteFile(file.filename);
      return res.status(403).json({ error: 'You are not enrolled in the class for this assignment.' });
    }

    // Check due date
    const now = new Date();
    if (now > new Date(assignment.dueDate)) {
      if (file) storageService.deleteFile(file.filename);
      return res.status(400).json({ error: 'Cannot submit. The assignment due date has passed.' });
    }

    const fileUrl = file ? storageService.getFileUrl(req, file.filename) : null;
    const fileName = file ? file.originalname : null;

    // Check if already submitted -> update
    const existing = await db.submission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId,
        },
      },
    });

    let submission;
    if (existing) {
      // If updating, delete old file if new one was uploaded
      if (file && existing.fileUrl) {
        const oldFilename = existing.fileUrl.split('/').pop();
        storageService.deleteFile(oldFilename);
      }

      submission = await db.submission.update({
        where: { id: existing.id },
        data: {
          textAnswer: textAnswer !== undefined ? textAnswer : existing.textAnswer,
          fileUrl: file ? fileUrl : existing.fileUrl,
          fileName: file ? fileName : existing.fileName,
          submittedAt: new Date(),
        },
      });
    } else {
      submission = await db.submission.create({
        data: {
          assignmentId,
          studentId,
          textAnswer: textAnswer || null,
          fileUrl,
          fileName,
        },
      });
    }

    return res.status(201).json({
      message: existing ? 'Submission updated successfully.' : 'Assignment submitted successfully.',
      submission,
    });
  } catch (error) {
    console.error('Submit assignment error:', error);
    if (req.file) storageService.deleteFile(req.file.filename);
    return res.status(500).json({ error: 'Failed to submit assignment.' });
  }
};

// GET /api/submissions/assignment/:assignmentId (Teacher: view all submissions)
const getSubmissionsForAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const teacherId = req.user.id;

    const assignment = await db.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        class: {
          include: {
            enrollments: {
              include: { student: true },
            },
          },
        },
      },
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }

    if (req.user.role !== 'ADMIN' && assignment.class?.teacherId !== teacherId) {
      return res.status(403).json({ error: 'You do not have permission to view submissions for this class.' });
    }

    const submissions = await db.submission.findMany({
      where: { assignmentId },
      include: { student: true },
      orderBy: { submittedAt: 'desc' },
    });

    // Cross-reference with class roster so teacher sees who hasn't submitted yet too
    const enrolledStudents = (assignment.class?.enrollments || []).map(e => e.student).filter(Boolean);
    const submissionMap = new Map(submissions.map(s => [s.studentId, s]));

    const fullRosterStatus = enrolledStudents.map(student => {
      const sub = submissionMap.get(student.id);
      return {
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
        },
        hasSubmitted: !!sub,
        submission: sub
          ? {
              id: sub.id,
              textAnswer: sub.textAnswer,
              fileUrl: sub.fileUrl,
              fileName: sub.fileName,
              submittedAt: sub.submittedAt,
              grade: sub.grade,
              feedback: sub.feedback,
              gradedAt: sub.gradedAt,
            }
          : null,
      };
    });

    return res.json({
      assignment: {
        id: assignment.id,
        title: assignment.title,
        points: assignment.points,
        dueDate: assignment.dueDate,
        className: assignment.class?.name,
      },
      submissions: fullRosterStatus,
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    return res.status(500).json({ error: 'Failed to retrieve submissions.' });
  }
};

// GET /api/submissions/assignment/:assignmentId/mine (Student)
const getMySubmission = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user.id;

    const submission = await db.submission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId,
        },
      },
      include: {
        assignment: true,
      },
    });

    return res.json({ submission });
  } catch (error) {
    console.error('Get my submission error:', error);
    return res.status(500).json({ error: 'Failed to retrieve submission.' });
  }
};

// POST /api/submissions/:id/grade (Teacher)
const gradeSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;

    const parseResult = gradeSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.errors.map(err => ({ field: err.path.join('.'), message: err.message })),
      });
    }

    const { grade, feedback } = parseResult.data;

    const submission = await db.submission.findUnique({
      where: { id },
      include: {
        assignment: {
          include: { class: true },
        },
      },
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    // Verify teacher owns the class or user is ADMIN
    if (req.user.role !== 'ADMIN' && submission.assignment?.class?.teacherId !== teacherId) {
      return res.status(403).json({ error: 'You are not authorized to grade this submission.' });
    }

    // Validate grade does not exceed max points
    const maxPoints = submission.assignment.points;
    if (grade > maxPoints) {
      return res.status(400).json({
        error: `Grade (${grade}) cannot exceed the maximum assignment points (${maxPoints}).`,
      });
    }

    const updated = await db.submission.update({
      where: { id },
      data: {
        grade,
        feedback: feedback ? feedback.trim() : null,
        gradedAt: new Date(),
      },
    });

    return res.json({
      message: 'Submission graded successfully.',
      submission: updated,
    });
  } catch (error) {
    console.error('Grade submission error:', error);
    return res.status(500).json({ error: 'Failed to grade submission.' });
  }
};

// GET /api/submissions/class/:classId/gradebook (Teacher: Matrix of all students x assignments)
const getClassGradebook = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.user.id;

    const cls = await db.class.findUnique({
      where: { id: classId },
      include: {
        enrollments: {
          include: { student: true },
        },
        assignments: true,
      },
    });

    if (!cls) {
      return res.status(404).json({ error: 'Class not found.' });
    }

    if (req.user.role !== 'ADMIN' && cls.teacherId !== teacherId) {
      return res.status(403).json({ error: 'You are not authorized to view this gradebook.' });
    }

    const assignments = cls.assignments || [];
    const students = (cls.enrollments || []).map(e => e.student).filter(Boolean);

    // Fetch all submissions for all assignments in this class
    const assignmentIds = assignments.map(a => a.id);
    const submissions = await db.submission.findMany({
      where: { assignmentId: { in: assignmentIds } },
    });

    // Build lookup table: `${studentId}_${assignmentId}` -> submission
    const subMap = new Map();
    submissions.forEach(s => {
      subMap.set(`${s.studentId}_${s.assignmentId}`, s);
    });

    // Build student grade matrix
    const matrix = students.map(student => {
      let studentEarnedPoints = 0;
      let studentPossiblePoints = 0;

      const assignmentGrades = assignments.map(assignment => {
        const sub = subMap.get(`${student.id}_${assignment.id}`);
        const hasSubmitted = !!sub;
        const isGraded = sub && sub.grade !== null;

        if (isGraded) {
          studentEarnedPoints += sub.grade;
          studentPossiblePoints += assignment.points;
        }

        return {
          assignmentId: assignment.id,
          assignmentTitle: assignment.title,
          maxPoints: assignment.points,
          hasSubmitted,
          submittedAt: sub?.submittedAt || null,
          grade: sub?.grade ?? null,
          feedback: sub?.feedback || null,
          isGraded,
        };
      });

      const overallPercentage = studentPossiblePoints > 0
        ? Math.round((studentEarnedPoints / studentPossiblePoints) * 100)
        : null;

      return {
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
        },
        assignments: assignmentGrades,
        totalEarned: studentEarnedPoints,
        totalPossible: studentPossiblePoints,
        overallPercentage,
      };
    });

    return res.json({
      class: {
        id: cls.id,
        name: cls.name,
      },
      assignments: assignments.map(a => ({
        id: a.id,
        title: a.title,
        points: a.points,
        dueDate: a.dueDate,
      })),
      matrix,
    });
  } catch (error) {
    console.error('Get gradebook error:', error);
    return res.status(500).json({ error: 'Failed to retrieve class gradebook.' });
  }
};

// GET /api/submissions/class/:classId/my-grades (Student)
const getMyGradesInClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const studentId = req.user.id;

    const cls = await db.class.findUnique({
      where: { id: classId },
      include: {
        assignments: {
          orderBy: { dueDate: 'asc' },
        },
        enrollments: true,
      },
    });

    if (!cls) {
      return res.status(404).json({ error: 'Class not found.' });
    }

    const isEnrolled = cls.enrollments?.some(e => e.studentId === studentId);
    if (!isEnrolled) {
      return res.status(403).json({ error: 'You are not enrolled in this class.' });
    }

    const assignments = cls.assignments || [];
    const assignmentIds = assignments.map(a => a.id);

    const submissions = await db.submission.findMany({
      where: {
        assignmentId: { in: assignmentIds },
        studentId,
      },
    });

    const subMap = new Map(submissions.map(s => [s.assignmentId, s]));

    let totalPointsEarned = 0;
    let totalGradedPossible = 0;

    const gradeList = assignments.map(a => {
      const sub = subMap.get(a.id);
      const isGraded = sub && sub.grade !== null;

      if (isGraded) {
        totalPointsEarned += sub.grade;
        totalGradedPossible += a.points;
      }

      return {
        assignmentId: a.id,
        title: a.title,
        dueDate: a.dueDate,
        maxPoints: a.points,
        hasSubmitted: !!sub,
        submittedAt: sub?.submittedAt || null,
        grade: sub?.grade ?? null,
        feedback: sub?.feedback || null,
        isGraded,
        percentage: isGraded ? Math.round((sub.grade / a.points) * 100) : null,
      };
    });

    const overallPercentage = totalGradedPossible > 0
      ? Math.round((totalPointsEarned / totalGradedPossible) * 100)
      : null;

    return res.json({
      class: {
        id: cls.id,
        name: cls.name,
      },
      grades: gradeList,
      totalPointsEarned,
      totalGradedPossible,
      overallPercentage,
    });
  } catch (error) {
    console.error('Get my grades error:', error);
    return res.status(500).json({ error: 'Failed to retrieve grades.' });
  }
};

module.exports = {
  submitAssignment,
  getSubmissionsForAssignment,
  getMySubmission,
  gradeSubmission,
  getClassGradebook,
  getMyGradesInClass,
};
