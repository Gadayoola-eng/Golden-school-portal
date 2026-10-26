const { verifyToken } = require('../utils/jwt');
const { db } = require('../db');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. Missing Bearer token.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: 'Invalid or expired authentication token.' });
    }

    const user = await db.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return res.status(401).json({ error: 'User associated with token no longer exists.' });
    }

    // Attach user profile (omit password)
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal authentication error.' });
  }
};

const requireRole = (roles) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Role ${req.user.role} is not authorized for this resource. Required: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
};

const requireTeacher = requireRole(['TEACHER', 'ADMIN']);
const requireStudent = requireRole(['STUDENT', 'ADMIN']);

module.exports = {
  authenticateToken,
  requireRole,
  requireTeacher,
  requireStudent,
};
