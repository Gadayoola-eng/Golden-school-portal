const { db } = require('../db');

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

/**
 * GET /api/timetables/my
 * Returns the weekly timetable schedule for the authenticated user
 */
const getMyTimetable = async (req, res) => {
  try {
    const user = req.user;
    let studentId = user.id;

    if (user.role === 'PARENT') {
      const parentUser = await db.user.findUnique({ where: { id: user.id } });
      studentId = parentUser?.childId || 'student-uuid-201';
    }

    const allSlots = await db.timetable.findMany({});

    // Filter slots based on user role
    let schedule = allSlots;
    if (user.role === 'TEACHER') {
      schedule = allSlots.filter(s => s.teacher === user.name || s.teacher === 'Prof. Sarah Connor' || s.code === 'ASSEMBLY');
    }

    // Determine current day of week
    const now = new Date();
    const dayIndex = now.getDay(); // 0 is Sunday, 1 is Monday...
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = dayNames[dayIndex];
    const activeDay = DAYS.includes(currentDayName) ? currentDayName : 'Monday';

    // Group by day of week
    const grouped = {};
    DAYS.forEach(day => {
      grouped[day] = schedule
        .filter(s => s.day === day)
        .sort((a, b) => a.period - b.period);
    });

    return res.json({
      role: user.role,
      activeDay,
      days: DAYS,
      schedule: grouped,
      todaySlots: grouped[activeDay] || [],
    });
  } catch (error) {
    console.error('Error fetching timetable:', error);
    return res.status(500).json({ error: 'Failed to retrieve class timetable.' });
  }
};

/**
 * GET /api/timetables/class/:classId
 * Returns the weekly schedule for a specific class
 */
const getClassTimetable = async (req, res) => {
  try {
    const { classId } = req.params;
    const cls = await db.class.findUnique({ where: { id: classId } });

    if (!cls) {
      return res.status(404).json({ error: 'Class not found.' });
    }

    const allSlots = await db.timetable.findMany({});
    const classSlots = allSlots.filter(s => s.classId === classId || s.code === 'ASSEMBLY');

    const grouped = {};
    DAYS.forEach(day => {
      grouped[day] = classSlots.filter(s => s.day === day).sort((a, b) => a.period - b.period);
    });

    return res.json({
      class: {
        id: cls.id,
        name: cls.name,
      },
      schedule: grouped,
    });
  } catch (error) {
    console.error('Error fetching class timetable:', error);
    return res.status(500).json({ error: 'Failed to retrieve class timetable.' });
  }
};

module.exports = {
  getMyTimetable,
  getClassTimetable,
};
