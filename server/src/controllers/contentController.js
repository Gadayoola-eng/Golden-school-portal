const { db } = require('../db');

/**
 * GET /api/content/highlights
 * Returns landing page high-impact stats, ticker announcements, and session countdown target
 */
const getHighlights = async (req, res) => {
  try {
    const announcements = await db.announcement.findMany({});
    
    // Key primary school performance indicators
    const stats = [
      { label: 'Common Entrance Distinction', value: '100%', subtitle: 'Admissions to Top Model Colleges' },
      { label: 'Phonics & Reading Mastery', value: '99.2%', subtitle: 'Early Literacy & Spelling Fluency' },
      { label: 'Teacher to Pupil Ratio', value: '1 : 10', subtitle: 'Intensive Individual Child Care' },
      { label: 'Junior STEM & Sports Trophies', value: '32+', subtitle: 'Spelling Bee, Robotics & Athletics' },
    ];

    // Primary Educational Levels breakdown
    const levels = [
      {
        id: 'creche-playgroup',
        title: 'Crèche & Toddler Playgroup',
        ageGroup: 'Ages 18 Months – 3 Years',
        tagline: 'Gentle Sensory & Social Development',
        description: 'A warm, hygienic, and loving sanctuary fostering speech initiation, fine motor dexterity, and joyful discovery.',
        features: ['Cushioned Sensory Play Area', 'Dedicated Pediatric Nurses', 'Tender Potty Training Support', 'Daily Parent Milestone Logs'],
        color: 'amber',
      },
      {
        id: 'nursery-kindergarten',
        title: 'Nursery & Kindergarten (EYFS)',
        ageGroup: 'Ages 3 – 5 Years (Nursery 1 & 2, KG)',
        tagline: 'Montessori Apparatus & Jolly Phonics',
        description: 'Building strong phonemic awareness, number sense, creative storytelling, and independent self-care skills.',
        features: ['Jolly Phonics 42 Sounds', 'Montessori Math Apparatus', 'Little Explorers Nature Corner', 'Creative Crafts & Sand Play'],
        color: 'emerald',
      },
      {
        id: 'lower-primary',
        title: 'Lower Primary (Basic 1 – 3)',
        ageGroup: 'Ages 5 – 8 Years (Primary 1 to 3)',
        tagline: 'Core Literacy & Mental Numeracy',
        description: 'Empowering pupils with fluent chapter-book reading, mental arithmetic, cursive penmanship, and basic science.',
        features: ['Spelling Bee Mentorship', 'Hands-On Science Experiments', 'Introductory Scratch Coding', 'Music, Choir & Percussion'],
        color: 'blue',
      },
      {
        id: 'upper-primary',
        title: 'Upper Primary & Common Entrance (Basic 4 – 6)',
        ageGroup: 'Ages 8 – 11 Years (Primary 4 to 6)',
        tagline: 'Academic Rigor & Leadership Readiness',
        description: 'Refining advanced quantitative reasoning, creative essay writing, scientific inquiry, and 100% Common Entrance exam success.',
        features: ['Intensive NCEE & Scholarship Prep', 'Young Robotics Engineers Club', 'French Diction & Public Speaking', 'Student Prefect Council'],
        color: 'indigo',
      },
    ];

    // Target resumption date for Countdown timer: 14 September 2026
    const countdownTarget = '2026-09-14T08:00:00Z';

    return res.json({
      announcements,
      stats,
      levels,
      countdownTarget,
      academicSession: '2026/2027 Academic Session',
    });
  } catch (error) {
    console.error('Error fetching highlights:', error);
    return res.status(500).json({ error: 'Failed to retrieve school highlights.' });
  }
};

/**
 * GET /api/content/news
 * Returns all school news, filterable by category
 */
const getNewsList = async (req, res) => {
  try {
    const { category } = req.query;
    const allNews = await db.news.findMany({
      where: category ? { category } : {}
    });

    const featured = allNews.find(n => n.featured) || allNews[0];
    const rest = allNews.filter(n => n.id !== featured?.id);

    return res.json({
      news: allNews,
      featured,
      recent: rest,
      categories: ['All', 'Academics & STEM', 'Admissions', 'Sports & Athletics', 'Arts & Culture'],
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return res.status(500).json({ error: 'Failed to retrieve news.' });
  }
};

/**
 * GET /api/content/events
 * Returns upcoming academic and co-curricular events
 */
const getEventsList = async (req, res) => {
  try {
    const events = await db.event.findMany({});
    return res.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return res.status(500).json({ error: 'Failed to retrieve events.' });
  }
};

/**
 * GET /api/content/downloads
 * Returns official downloadable resources, filterable by category and search term
 */
const getDownloadsList = async (req, res) => {
  try {
    const { category, search } = req.query;
    let list = await db.download.findMany({
      where: category && category !== 'All' ? { category } : {}
    });

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q)
      );
    }

    return res.json({
      downloads: list,
      categories: ['All', 'Admissions', 'Calendars', 'Handbooks', 'Curriculum', 'Newsletters'],
    });
  } catch (error) {
    console.error('Error fetching downloads:', error);
    return res.status(500).json({ error: 'Failed to retrieve download resources.' });
  }
};

/**
 * POST /api/content/downloads/:id/track
 * Increments download count
 */
const recordDownload = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await db.download.findUnique({ where: { id } });
    if (!item) {
      return res.status(404).json({ error: 'Resource not found.' });
    }
    const updated = await db.download.update({
      where: { id },
      data: { downloads: (item.downloads || 0) + 1 }
    });
    return res.json({ success: true, downloads: updated.downloads });
  } catch (error) {
    console.error('Error recording download:', error);
    return res.status(500).json({ error: 'Failed to record download.' });
  }
};

module.exports = {
  getHighlights,
  getNewsList,
  getEventsList,
  getDownloadsList,
  recordDownload,
};
