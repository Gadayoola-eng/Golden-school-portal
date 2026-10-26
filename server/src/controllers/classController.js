const { z } = require('zod');
const { db } = require('../db');

const classSchema = z.object({
  name: z.string().min(2, 'Class name must be at least 2 characters'),
  description: z.string().optional(),
});

const enrollSchema = z.object({
  studentEmail: z.string().email().optional(),
  studentId: z.string().optional(),
});

// GET /api/classes
const getClasses = async (req, res) => {
  try {
    const { id: userId, role } = req.user;

    if (role === 'ADMIN') {
      const classes = await db.class.findMany({
        include: {
          teacher: true,
          enrollments: true,
          assignments: true,
        },
        orderBy: { name: 'asc' },
      });

      const formatted = classes.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        teacher: {
          id: c.teacher?.id,
          name: c.teacher?.name,
          email: c.teacher?.email,
        },
        studentCount: c.enrollments?.length || 0,
        assignmentCount: c.assignments?.length || 0,
        createdAt: c.createdAt,
      }));

      return res.json({ classes: formatted });
    } else if (role === 'TEACHER') {
      const classes = await db.class.findMany({
        where: { teacherId: userId },
        include: {
          enrollments: true,
          assignments: true,
        },
      });

      const formatted = classes.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        studentCount: c.enrollments?.length || 0,
        assignmentCount: c.assignments?.length || 0,
        createdAt: c.createdAt,
      }));

      return res.json({ classes: formatted });
    } else {
      // Student - get enrolled classes
      const enrollments = await db.enrollment.findMany({
        where: { studentId: userId },
        include: {
          class: {
            include: {
              teacher: true,
              assignments: true,
            },
          },
        },
      });

      const formatted = enrollments
        .filter(e => e.class)
        .map(e => ({
          id: e.class.id,
          name: e.class.name,
          description: e.class.description,
          teacher: {
            id: e.class.teacher?.id,
            name: e.class.teacher?.name,
            email: e.class.teacher?.email,
          },
          assignmentCount: e.class.assignments?.length || 0,
          enrolledAt: e.enrolledAt,
        }));

      return res.json({ classes: formatted });
    }
  } catch (error) {
    console.error('Get classes error:', error);
    return res.status(500).json({ error: 'Failed to retrieve classes.' });
  }
};

// GET /api/classes/available (For students to browse & enroll)
const getAvailableClasses = async (req, res) => {
  try {
    const studentId = req.user.id;
    const allClasses = await db.class.findMany({
      include: {
        teacher: true,
        enrollments: true,
      },
    });

    const enrolledClassIds = new Set(
      (await db.enrollment.findMany({ where: { studentId } })).map(e => e.classId)
    );

    const formatted = allClasses.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      teacher: {
        id: c.teacher?.id,
        name: c.teacher?.name,
        email: c.teacher?.email,
      },
      studentCount: c.enrollments?.length || 0,
      isEnrolled: enrolledClassIds.has(c.id),
      createdAt: c.createdAt,
    }));

    return res.json({ classes: formatted });
  } catch (error) {
    console.error('Get available classes error:', error);
    return res.status(500).json({ error: 'Failed to retrieve available classes.' });
  }
};

// POST /api/classes (Teacher only)
const createClass = async (req, res) => {
  try {
    const parseResult = classSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.errors.map(err => ({ field: err.path.join('.'), message: err.message })),
      });
    }

    const { name, description } = parseResult.data;

    const newClass = await db.class.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
        teacherId: (req.user.role === 'ADMIN' && req.body.teacherId) ? req.body.teacherId : req.user.id,
      },
    });

    return res.status(201).json({
      message: 'Class created successfully',
      class: newClass,
    });
  } catch (error) {
    console.error('Create class error:', error);
    return res.status(500).json({ error: 'Failed to create class.' });
  }
};

// GET /api/classes/:id
const getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;

    const cls = await db.class.findUnique({
      where: { id },
      include: {
        teacher: true,
        enrollments: true,
        assignments: true,
      },
    });

    if (!cls) {
      return res.status(404).json({ error: 'Class not found.' });
    }

    // Access check: teacher who owns it OR enrolled student
    if (role === 'TEACHER' && cls.teacherId !== userId) {
      return res.status(403).json({ error: 'You are not authorized to view this class.' });
    }

    if (role === 'STUDENT') {
      const isEnrolled = cls.enrollments?.some(e => e.studentId === userId);
      if (!isEnrolled) {
        return res.status(403).json({ error: 'You are not enrolled in this class.' });
      }
    }

    // Format roster
    const roster = (cls.enrollments || []).map(e => ({
      id: e.student?.id || e.studentId,
      name: e.student?.name || 'Unknown Student',
      email: e.student?.email || '',
      enrolledAt: e.enrolledAt,
    }));

    return res.json({
      class: {
        id: cls.id,
        name: cls.name,
        description: cls.description,
        teacher: {
          id: cls.teacher?.id,
          name: cls.teacher?.name,
          email: cls.teacher?.email,
        },
        roster,
        assignments: cls.assignments || [],
        createdAt: cls.createdAt,
      },
    });
  } catch (error) {
    console.error('Get class by id error:', error);
    return res.status(500).json({ error: 'Failed to retrieve class details.' });
  }
};

// PUT /api/classes/:id (Teacher only)
const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const parseResult = classSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.errors.map(err => ({ field: err.path.join('.'), message: err.message })),
      });
    }

    const cls = await db.class.findUnique({ where: { id } });
    if (!cls) {
      return res.status(404).json({ error: 'Class not found.' });
    }

    if (req.user.role !== 'ADMIN' && cls.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own classes.' });
    }

    const updated = await db.class.update({
      where: { id },
      data: {
        name: parseResult.data.name.trim(),
        description: parseResult.data.description ? parseResult.data.description.trim() : null,
      },
    });

    return res.json({
      message: 'Class updated successfully',
      class: updated,
    });
  } catch (error) {
    console.error('Update class error:', error);
    return res.status(500).json({ error: 'Failed to update class.' });
  }
};

// DELETE /api/classes/:id (Teacher only)
const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const cls = await db.class.findUnique({ where: { id } });
    if (!cls) {
      return res.status(404).json({ error: 'Class not found.' });
    }

    if (req.user.role !== 'ADMIN' && cls.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own classes.' });
    }

    await db.class.delete({ where: { id } });

    return res.json({ message: 'Class deleted successfully.' });
  } catch (error) {
    console.error('Delete class error:', error);
    return res.status(500).json({ error: 'Failed to delete class.' });
  }
};

// POST /api/classes/:id/enroll
const enrollStudent = async (req, res) => {
  try {
    const { id: classId } = req.params;
    const { id: userId, role } = req.user;

    const cls = await db.class.findUnique({ where: { id: classId } });
    if (!cls) {
      return res.status(404).json({ error: 'Class not found.' });
    }

    let targetStudentId = userId;

    // If teacher or admin is manually enrolling a student by email or ID
    if (role === 'TEACHER' || role === 'ADMIN') {
      if (req.user.role !== 'ADMIN' && cls.teacherId !== userId) {
        return res.status(403).json({ error: 'You can only manage enrollment for your own classes.' });
      }

      const { studentEmail, studentId } = req.body;
      if (!studentEmail && !studentId) {
        return res.status(400).json({ error: 'Please provide studentEmail or studentId to enroll.' });
      }

      let studentUser;
      if (studentEmail) {
        studentUser = await db.user.findUnique({ where: { email: studentEmail.toLowerCase().trim() } });
      } else {
        studentUser = await db.user.findUnique({ where: { id: studentId } });
      }

      if (!studentUser) {
        return res.status(404).json({ error: 'Student not found.' });
      }

      if (studentUser.role !== 'STUDENT') {
        return res.status(400).json({ error: 'Cannot enroll a user with role TEACHER as a student.' });
      }

      targetStudentId = studentUser.id;
    }

    // Check if already enrolled
    const existing = await db.enrollment.findUnique({
      where: {
        studentId_classId: {
          studentId: targetStudentId,
          classId,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Student is already enrolled in this class.' });
    }

    const enrollment = await db.enrollment.create({
      data: {
        studentId: targetStudentId,
        classId,
      },
    });

    return res.status(201).json({
      message: 'Successfully enrolled in class.',
      enrollment,
    });
  } catch (error) {
    console.error('Enroll student error:', error);
    return res.status(500).json({ error: 'Failed to enroll in class.' });
  }
};

// DELETE /api/classes/:id/enroll/:studentId
const unenrollStudent = async (req, res) => {
  try {
    const { id: classId, studentId } = req.params;
    const { id: currentUserId, role } = req.user;

    const cls = await db.class.findUnique({ where: { id: classId } });
    if (!cls) {
      return res.status(404).json({ error: 'Class not found.' });
    }

    // Allow admin, teacher of class, OR the student themselves
    if (req.user.role !== 'ADMIN' && role === 'TEACHER' && cls.teacherId !== currentUserId) {
      return res.status(403).json({ error: 'You can only modify rosters for your own classes.' });
    }

    if (role === 'STUDENT' && studentId !== currentUserId) {
      return res.status(403).json({ error: 'You can only drop classes for yourself.' });
    }

    await db.enrollment.delete({
      where: {
        studentId_classId: {
          studentId,
          classId,
        },
      },
    });

    return res.json({ message: 'Student removed from class roster.' });
  } catch (error) {
    console.error('Unenroll student error:', error);
    return res.status(500).json({ error: 'Failed to unenroll student.' });
  }
};

module.exports = {
  getClasses,
  getAvailableClasses,
  createClass,
  getClassById,
  updateClass,
  deleteClass,
  enrollStudent,
  unenrollStudent,
};
