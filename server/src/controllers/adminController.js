const { db } = require('../db');

/**
 * GET /api/admin/overview
 * Comprehensive executive KPI dashboard for the School Administrator & Registrar
 */
const getAdminOverview = async (req, res) => {
  try {
    const users = await db.user.findMany({});
    const classes = await db.class.findMany({});
    const bills = await db.bill.findMany({});
    const applications = await db.application.findMany({});
    const campusVisits = await db.campusVisit.findMany({});
    const jobApplications = await db.jobApplication.findMany({});
    const attendances = await db.attendance.findMany({});

    // User counts
    const studentCount = users.filter(u => u.role === 'STUDENT').length;
    const teacherCount = users.filter(u => u.role === 'TEACHER').length;
    const parentCount = users.filter(u => u.role === 'PARENT').length;
    const adminCount = users.filter(u => u.role === 'ADMIN').length;

    // Financial calculations
    const totalCollected = bills
      .filter(b => b.status === 'PAID')
      .reduce((acc, b) => acc + (b.amount || 0), 0);
    const totalOutstanding = bills
      .filter(b => b.status === 'PENDING' || b.status === 'OVERDUE')
      .reduce((acc, b) => acc + (b.amount || 0), 0);

    // Admissions funnel
    const admissionsSummary = {
      total: applications.length,
      submitted: applications.filter(a => a.status === 'SUBMITTED').length,
      examScheduled: applications.filter(a => a.status === 'EXAM_SCHEDULED').length,
      offerIssued: applications.filter(a => a.status === 'OFFER_ISSUED').length,
      admitted: applications.filter(a => a.status === 'ADMITTED').length,
    };

    // Today's attendance calculation
    const totalAttendanceRecords = attendances.length;
    const presentCount = attendances.filter(a => a.status === 'PRESENT').length;
    const attendanceRate = totalAttendanceRecords > 0
      ? ((presentCount / totalAttendanceRecords) * 100).toFixed(1)
      : '98.5';

    // System activity feed
    const activities = [
      { id: 'act-1', type: 'ADMISSIONS', text: 'New admission application submitted for Chukwuemeka David Adeleke (Grade 7).', time: '10 mins ago', icon: 'UserPlus' },
      { id: 'act-2', type: 'FINANCE', text: 'Tuition payment of ₦850,000 received for Alex Mercer (Invoice GIS-INV-2026-001).', time: '42 mins ago', icon: 'CreditCard' },
      { id: 'act-3', type: 'ATTENDANCE', text: 'Prof. Sarah Connor certified today\'s Roll Call register for CS101.', time: '1 hour ago', icon: 'CheckCircle2' },
      { id: 'act-4', type: 'CAREERS', text: 'New CV submitted by Dr. Chidi Okafor for Senior Physics Educator opening.', time: '2 hours ago', icon: 'Briefcase' },
      { id: 'act-5', type: 'VISIT', text: 'Campus tour booked by Mrs. Funke Balogun for Monday, 20th April 2026.', time: '3 hours ago', icon: 'Calendar' },
    ];

    return res.json({
      kpis: {
        totalStudents: studentCount,
        totalTeachers: teacherCount,
        totalParents: parentCount,
        totalClasses: classes.length,
        totalRevenue: totalCollected,
        outstandingRevenue: totalOutstanding,
        attendanceRate: `${attendanceRate}%`,
        activeApplications: applications.length,
        confirmedVisits: campusVisits.length,
        jobApplicants: jobApplications.length,
      },
      admissionsSummary,
      activities,
      userRole: req.user.role,
      adminName: req.user.name,
    });
  } catch (error) {
    console.error('Error fetching admin overview:', error);
    return res.status(500).json({ error: 'Failed to retrieve administrative overview.' });
  }
};

/**
 * GET /api/admin/applications
 * Returns all admission applications with filtering
 */
const getAdminApplications = async (req, res) => {
  try {
    const { status } = req.query;
    const applications = await db.application.findMany({
      where: status && status !== 'All' ? { status } : {},
      orderBy: { submittedAt: 'desc' },
    });
    return res.json({ applications });
  } catch (error) {
    console.error('Error fetching applications for admin:', error);
    return res.status(500).json({ error: 'Failed to retrieve applications.' });
  }
};

/**
 * PATCH /api/admin/applications/:id
 * Allows admin to update applicant status, schedule exam, or issue provisional offer
 */
const updateAdminApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, statusMessage, examDate, examVenue, examTime, examSeatNumber, offerDeadline } = req.body;

    const existing = await db.application.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    // Update stages according to new status
    const stages = existing.stages ? [...existing.stages] : [];
    if (status === 'EXAM_SCHEDULED' && stages[2]) {
      stages[1].completed = true;
      stages[2].current = true;
      stages[2].date = examDate || '18 Apr 2026';
      stages[2].note = `Exam scheduled at ${examVenue || 'Campus Hall A'}. Seat ${examSeatNumber || 'SEAT-A-042'}.`;
    } else if (status === 'OFFER_ISSUED' && stages[4]) {
      stages[1].completed = true;
      stages[2].completed = true;
      stages[3].completed = true;
      stages[4].completed = true;
      stages[4].current = true;
      stages[4].date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      stages[4].note = `Provisional admission offer issued. Acceptance deadline: ${offerDeadline || '30 Apr 2026'}.`;
    }

    const updated = await db.application.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(statusMessage && { statusMessage }),
        ...(examDate && { examDate }),
        ...(examVenue && { examVenue }),
        ...(examTime && { examTime }),
        ...(examSeatNumber && { examSeatNumber }),
        ...(offerDeadline && { offerDeadline }),
        stages,
      }
    });

    return res.json({
      success: true,
      message: `Application ${updated.appNumber} updated to ${updated.status}.`,
      application: updated,
    });
  } catch (error) {
    console.error('Error updating application by admin:', error);
    return res.status(500).json({ error: 'Failed to update application.' });
  }
};

/**
 * GET /api/admin/users
 * Returns list of system users
 */
const getAdminUsers = async (req, res) => {
  try {
    const users = await db.user.findMany({});
    // Exclude password hash
    const sanitized = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
    }));
    return res.json({ users: sanitized });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Failed to retrieve users directory.' });
  }
};

/**
 * GET /api/admin/billing
 * Financial management: all invoices and receipts
 */
const getAdminBilling = async (req, res) => {
  try {
    const bills = await db.bill.findMany({
      orderBy: { dueDate: 'desc' }
    });
    return res.json({ bills });
  } catch (error) {
    console.error('Error fetching admin billing:', error);
    return res.status(500).json({ error: 'Failed to retrieve billing records.' });
  }
};

/**
 * PATCH /api/admin/billing/:id/status
 * Updates bill status (e.g., mark as PAID)
 */
const updateBillStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await db.bill.update({
      where: { id },
      data: {
        status: status || 'PAID',
        paidAt: status === 'PAID' ? new Date() : null,
      }
    });

    return res.json({
      success: true,
      message: `Invoice ${updated.invoiceNumber} status marked as ${updated.status}.`,
      bill: updated,
    });
  } catch (error) {
    console.error('Error updating bill:', error);
    return res.status(500).json({ error: 'Failed to update billing invoice.' });
  }
};

/**
 * GET /api/admin/careers
 * Returns all submitted candidate job applications
 */
const getAdminCareers = async (req, res) => {
  try {
    const applications = await db.jobApplication.findMany({});
    return res.json({ applications });
  } catch (error) {
    console.error('Error fetching careers applications:', error);
    return res.status(500).json({ error: 'Failed to retrieve career applications.' });
  }
};

module.exports = {
  getAdminOverview,
  getAdminApplications,
  updateAdminApplication,
  getAdminUsers,
  getAdminBilling,
  updateBillStatus,
  getAdminCareers,
};
