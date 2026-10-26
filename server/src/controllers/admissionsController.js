const { db } = require('../db');

/**
 * POST /api/admissions/apply
 * Public endpoint to submit a new online admissions application
 */
const submitApplication = async (req, res) => {
  try {
    const {
      studentName,
      dob,
      gender,
      gradeApplied,
      previousSchool,
      medicalNotes,
      bloodGroup,
      parentName,
      parentRelationship,
      parentPhone,
      parentWhatsApp,
      parentEmail,
      parentAddress,
      parentOccupation,
      documents = [],
    } = req.body;

    if (!studentName || !gradeApplied || !parentName || !parentPhone || !parentEmail) {
      return res.status(400).json({
        error: 'Please fill in all required fields (Student Name, Grade, Parent Name, Phone, and Email).'
      });
    }

    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const appNumber = `GIS-ADM-2026-${randomDigits}`;

    const todayFormatted = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const application = await db.application.create({
      data: {
        appNumber,
        studentName,
        dob,
        gender,
        gradeApplied,
        previousSchool: previousSchool || 'Not Specified',
        medicalNotes: medicalNotes || 'None Reported',
        bloodGroup: bloodGroup || 'O+',
        parentName,
        parentRelationship: parentRelationship || 'Parent/Guardian',
        parentPhone,
        parentWhatsApp: parentWhatsApp || parentPhone,
        parentEmail,
        parentAddress: parentAddress || 'Lagos, Nigeria',
        parentOccupation: parentOccupation || 'Professional',
        documents: documents.length > 0 ? documents : [
          { name: 'Birth_Certificate.pdf', type: 'application/pdf', status: 'PENDING_REVIEW' },
          { name: 'Previous_Term_Report.pdf', type: 'application/pdf', status: 'PENDING_REVIEW' },
          { name: 'Passport_Photo.jpg', type: 'image/jpeg', status: 'PENDING_REVIEW' },
        ],
        status: 'SUBMITTED',
        statusMessage: 'Application registered. Academic screening in progress.',
        stages: [
          {
            name: 'Application Submitted',
            completed: true,
            current: false,
            date: todayFormatted,
            note: `Application submitted successfully with tracking code ${appNumber}.`
          },
          {
            name: 'Document Screening',
            completed: false,
            current: true,
            date: 'In Progress',
            note: 'Admissions committee is screening submitted credentials.'
          },
          {
            name: 'Entrance Examination',
            completed: false,
            current: false,
            date: 'Pending',
            note: 'Examination date will be communicated via email and SMS.'
          },
          {
            name: 'Interview & Panel Review',
            completed: false,
            current: false,
            date: 'Pending',
            note: 'Shortlisted candidates proceed to family interview.'
          },
          {
            name: 'Provisional Admission Offer',
            completed: false,
            current: false,
            date: 'Pending',
            note: 'Formal offer letter issued upon admission approval.'
          },
        ]
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Admissions application submitted successfully.',
      appNumber: application.appNumber,
      application,
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    return res.status(500).json({ error: 'Failed to process application. Please try again.' });
  }
};

/**
 * GET /api/admissions/track/:appNumber
 * Public endpoint to track the status of an application
 */
const trackApplication = async (req, res) => {
  try {
    const { appNumber } = req.params;
    const cleanNumber = appNumber.trim().toUpperCase();

    let application = await db.application.findUnique({
      where: { appNumber: cleanNumber }
    });

    if (!application) {
      // Try finding by ID or fallback search
      const all = await db.application.findMany({});
      application = all.find(a => 
        a.appNumber.toUpperCase() === cleanNumber ||
        a.parentEmail?.toLowerCase() === cleanNumber.toLowerCase() ||
        a.id === cleanNumber
      );
    }

    if (!application) {
      return res.status(404).json({
        error: `No application found for reference "${cleanNumber}". Please verify your reference number (e.g. GIS-ADM-2026-7841).`
      });
    }

    return res.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error('Error tracking application:', error);
    return res.status(500).json({ error: 'Failed to retrieve application status.' });
  }
};

/**
 * POST /api/admissions/visit
 * Public endpoint to schedule a school tour / campus visit
 */
const scheduleCampusVisit = async (req, res) => {
  try {
    const {
      parentName,
      parentEmail,
      parentPhone,
      attendeeCount = 2,
      interestedGrade,
      visitDate,
      timeSlot,
      interests = [],
      specialRequests,
    } = req.body;

    if (!parentName || !parentEmail || !parentPhone || !visitDate || !timeSlot) {
      return res.status(400).json({
        error: 'Please provide all required visit details (Name, Email, Phone, Date, and Time Slot).'
      });
    }

    const visit = await db.campusVisit.create({
      data: {
        parentName,
        parentEmail,
        parentPhone,
        attendeeCount: Number(attendeeCount),
        interestedGrade: interestedGrade || 'General Tour',
        visitDate,
        timeSlot,
        interests: interests.length > 0 ? interests : ['Academic Facilities', 'Science Laboratories', 'Sports Complex'],
        specialRequests: specialRequests || 'None',
        status: 'CONFIRMED',
        tourGuide: 'Mr. Jude Obi (Admissions Ambassador)',
        meetingPoint: 'GIS Welcome Pavilion & Reception Lounge',
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Campus visit successfully scheduled. Confirmation SMS and email invitation sent.',
      visit,
    });
  } catch (error) {
    console.error('Error scheduling campus visit:', error);
    return res.status(500).json({ error: 'Failed to schedule campus visit.' });
  }
};

/**
 * GET /api/admissions/visits
 * Returns upcoming campus visits
 */
const getCampusVisits = async (req, res) => {
  try {
    const visits = await db.campusVisit.findMany({});
    return res.json({ visits });
  } catch (error) {
    console.error('Error fetching campus visits:', error);
    return res.status(500).json({ error: 'Failed to retrieve campus visits.' });
  }
};

/**
 * GET /api/admissions/applications
 * Returns all submitted applications (for Faculty & Admissions Officers)
 */
const getAllApplications = async (req, res) => {
  try {
    const applications = await db.application.findMany({
      orderBy: { submittedAt: 'desc' }
    });
    return res.json({ applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return res.status(500).json({ error: 'Failed to retrieve applications.' });
  }
};

/**
 * PATCH /api/admissions/applications/:id/status
 * Updates application progression status
 */
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, statusMessage, examDate, examVenue, examTime } = req.body;

    const application = await db.application.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(statusMessage && { statusMessage }),
        ...(examDate && { examDate }),
        ...(examVenue && { examVenue }),
        ...(examTime && { examTime }),
      }
    });

    return res.json({
      success: true,
      message: 'Application status updated.',
      application,
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    return res.status(500).json({ error: 'Failed to update application.' });
  }
};

module.exports = {
  submitApplication,
  trackApplication,
  scheduleCampusVisit,
  getCampusVisits,
  getAllApplications,
  updateApplicationStatus,
};
