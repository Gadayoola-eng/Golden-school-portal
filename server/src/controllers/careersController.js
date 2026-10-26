const { db } = require('../db');

/**
 * GET /api/careers/jobs
 * Returns available job vacancies with filtering options
 */
const getJobListings = async (req, res) => {
  try {
    const { department, level } = req.query;
    const jobs = await db.jobListing.findMany({
      where: {
        ...(department && department !== 'All' ? { department } : {}),
        ...(level && level !== 'All' ? { level } : {}),
      }
    });

    const departments = [
      'All',
      'Science & Mathematics',
      'STEM & Digital Technology',
      'Early Childhood Education',
      'Medical & Pastoral Health',
      'Administration & Counseling',
    ];

    return res.json({
      jobs,
      departments,
      totalOpenings: jobs.reduce((acc, j) => acc + (j.openings || 1), 0),
    });
  } catch (error) {
    console.error('Error fetching job listings:', error);
    return res.status(500).json({ error: 'Failed to retrieve career opportunities.' });
  }
};

/**
 * GET /api/careers/jobs/:id
 * Returns details for a single job
 */
const getJobDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await db.jobListing.findUnique({ where: { id } });
    if (!job) {
      return res.status(404).json({ error: 'Career vacancy not found or no longer active.' });
    }
    return res.json({ job });
  } catch (error) {
    console.error('Error fetching job detail:', error);
    return res.status(500).json({ error: 'Failed to retrieve job details.' });
  }
};

/**
 * POST /api/careers/apply
 * Submits an employment application with CV metadata
 */
const submitJobApplication = async (req, res) => {
  try {
    const {
      jobId,
      candidateName,
      candidateEmail,
      candidatePhone,
      yearsExperience,
      qualification,
      linkedIn,
      cvFileName,
      coverLetter,
    } = req.body;

    if (!jobId || !candidateName || !candidateEmail || !candidatePhone || !qualification) {
      return res.status(400).json({
        error: 'Please fill in all mandatory application fields (Name, Email, Phone, and Qualification).'
      });
    }

    const job = await db.jobListing.findUnique({ where: { id: jobId } });
    const jobTitle = job ? job.title : 'General Faculty Application';

    const application = await db.jobApplication.create({
      data: {
        jobId,
        jobTitle,
        candidateName,
        candidateEmail,
        candidatePhone,
        yearsExperience: Number(yearsExperience) || 0,
        qualification,
        linkedIn: linkedIn || 'Not Provided',
        cvFileName: cvFileName || 'Resume_Document.pdf',
        coverLetter: coverLetter || 'Statement of teaching excellence submitted.',
      }
    });

    return res.status(201).json({
      success: true,
      message: `Your application for "${jobTitle}" has been received. Our HR Talent Board will review your credentials.`,
      application,
    });
  } catch (error) {
    console.error('Error submitting job application:', error);
    return res.status(500).json({ error: 'Failed to submit job application.' });
  }
};

/**
 * GET /api/careers/applications
 * Returns all candidate applications (HR & Faculty Admin)
 */
const getAllJobApplications = async (req, res) => {
  try {
    const applications = await db.jobApplication.findMany({});
    return res.json({ applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return res.status(500).json({ error: 'Failed to retrieve job applications.' });
  }
};

module.exports = {
  getJobListings,
  getJobDetail,
  submitJobApplication,
  getAllJobApplications,
};
