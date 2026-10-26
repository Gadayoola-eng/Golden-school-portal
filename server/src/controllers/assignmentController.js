const { z } = require('zod');
const { db } = require('../db');

const assignmentSchema = z.object({
  classId: z.string().min(1, 'Class ID is required'),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  instructions: z.string().min(5, 'Instructions must be at least 5 characters'),
  dueDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid due date format',
  }),
  points: z.number().int().positive('Points must be a positive integer').default(100),
});

const updateAssignmentSchema = z.object({
  title: z.string().min(2).optional(),
  instructions: z.string().min(5).optional(),
  dueDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid due date format',
  }).optional(),
  points: z.number().int().positive().optional(),
});

// GET /api/assignments/class/:classId
const getAssignmentsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { id: userId, role } = req.user;

    const cls = await db.class.findUnique({
      where: { id: classId },
      include: { enrollments: true },
    });

    if (!cls) {
      return res.status(404).json({ error: 'Class not found.' });
    }

    if (role === 'TEACHER' && cls.teacherId !== userId) {
      return res.status(403).json({ error: 'Not authorized for this class.' });
    }

    if (role === 'STUDENT') {
      const isEnrolled = cls.enrollments?.some(e => e.studentId === userId);
      if (!isEnrolled) {
        return res.status(403).json({ error: 'You are not enrolled in this class.' });
      }
    }

    const assignments = await db.assignment.findMany({
      where: { classId },
      include: {
        submissions: true,
      },
      orderBy: { dueDate: 'asc' },
    });

    const formatted = assignments.map(a => {
      const resItem = {
        id: a.id,
        classId: a.classId,
        title: a.title,
        instructions: a.instructions,
        dueDate: a.dueDate,
        points: a.points,
        createdAt: a.createdAt,
      };

      if (role === 'TEACHER' || role === 'ADMIN') {
        resItem.submissionCount = a.submissions?.length || 0;
        resItem.gradedCount = (a.submissions || []).filter(s => s.grade !== null).length;
        resItem.studentCount = cls.enrollments?.length || 0;
      } else {
        const studentSub = (a.submissions || []).find(s => s.studentId === userId);
        resItem.hasSubmitted = !!studentSub;
        resItem.submission = studentSub
          ? {
              id: studentSub.id,
              submittedAt: studentSub.submittedAt,
              grade: studentSub.grade,
              gradedAt: studentSub.gradedAt,
              feedback: studentSub.feedback,
            }
          : null;
      }

      return resItem;
    });

    return res.json({ assignments: formatted });
  } catch (error) {
    console.error('Get assignments error:', error);
    return res.status(500).json({ error: 'Failed to retrieve assignments.' });
  }
};

// GET /api/assignments/:id
const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;

    const assignment = await db.assignment.findUnique({
      where: { id },
      include: {
        class: {
          include: {
            teacher: true,
            enrollments: true,
          },
        },
        submissions: true,
      },
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }

    if (role === 'TEACHER' && assignment.class?.teacherId !== userId) {
      return res.status(403).json({ error: 'Not authorized to view this assignment.' });
    }

    if (role === 'STUDENT') {
      const isEnrolled = assignment.class?.enrollments?.some(e => e.studentId === userId);
      if (!isEnrolled) {
        return res.status(403).json({ error: 'You are not enrolled in this assignment\'s class.' });
      }
    }

    let mySubmission = null;
    if (role === 'STUDENT') {
      mySubmission = (assignment.submissions || []).find(s => s.studentId === userId) || null;
    }

    return res.json({
      assignment: {
        id: assignment.id,
        classId: assignment.classId,
        className: assignment.class?.name,
        teacher: {
          id: assignment.class?.teacher?.id,
          name: assignment.class?.teacher?.name,
        },
        title: assignment.title,
        instructions: assignment.instructions,
        dueDate: assignment.dueDate,
        points: assignment.points,
        createdAt: assignment.createdAt,
        isPastDue: new Date() > new Date(assignment.dueDate),
        mySubmission,
        submissionCount: (role === 'TEACHER' || role === 'ADMIN') ? assignment.submissions?.length || 0 : undefined,
      },
    });
  } catch (error) {
    console.error('Get assignment by id error:', error);
    return res.status(500).json({ error: 'Failed to retrieve assignment.' });
  }
};

// POST /api/assignments (Teacher or Admin)
const createAssignment = async (req, res) => {
  try {
    const parseResult = assignmentSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.errors.map(err => ({ field: err.path.join('.'), message: err.message })),
      });
    }

    const { classId, title, instructions, dueDate, points } = parseResult.data;

    // Verify teacher owns the class or user is ADMIN
    const cls = await db.class.findUnique({ where: { id: classId } });
    if (!cls) {
      return res.status(404).json({ error: 'Class not found.' });
    }

    if (req.user.role !== 'ADMIN' && cls.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'You can only create assignments for your own classes.' });
    }

    const newAssignment = await db.assignment.create({
      data: {
        classId,
        title: title.trim(),
        instructions: instructions.trim(),
        dueDate: new Date(dueDate),
        points: points || 100,
      },
    });

    return res.status(201).json({
      message: 'Assignment created successfully',
      assignment: newAssignment,
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    return res.status(500).json({ error: 'Failed to create assignment.' });
  }
};

// PUT /api/assignments/:id (Teacher or Admin)
const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const parseResult = updateAssignmentSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.errors.map(err => ({ field: err.path.join('.'), message: err.message })),
      });
    }

    const assignment = await db.assignment.findUnique({
      where: { id },
      include: { class: true },
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }

    if (req.user.role !== 'ADMIN' && assignment.class?.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit assignments for your own classes.' });
    }

    const updateData = {};
    if (parseResult.data.title) updateData.title = parseResult.data.title.trim();
    if (parseResult.data.instructions) updateData.instructions = parseResult.data.instructions.trim();
    if (parseResult.data.dueDate) updateData.dueDate = new Date(parseResult.data.dueDate);
    if (parseResult.data.points !== undefined) updateData.points = parseResult.data.points;

    const updated = await db.assignment.update({
      where: { id },
      data: updateData,
    });

    return res.json({
      message: 'Assignment updated successfully',
      assignment: updated,
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    return res.status(500).json({ error: 'Failed to update assignment.' });
  }
};

// DELETE /api/assignments/:id (Teacher or Admin)
const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await db.assignment.findUnique({
      where: { id },
      include: { class: true },
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }

    if (req.user.role !== 'ADMIN' && assignment.class?.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete assignments for your own classes.' });
    }

    await db.assignment.delete({ where: { id } });

    return res.json({ message: 'Assignment deleted successfully.' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    return res.status(500).json({ error: 'Failed to delete assignment.' });
  }
};

module.exports = {
  getAssignmentsByClass,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
};
